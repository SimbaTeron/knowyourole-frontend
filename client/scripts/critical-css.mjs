/**
 * After `next build`, keep stylesheets from blocking first paint.
 *
 * The full sheet is switched on as soon as it downloads. Theme tokens are
 * inlined from source so the hero still has its colors if the built CSS
 * folder is not where this script expects. A missing `.next/static/chunks`
 * directory must not fail the build: Vercel's output layout has differed
 * from a local Turbopack build.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Critters from "critters";

const clientRoot = new URL("..", import.meta.url).pathname;
const nextDir = join(clientRoot, ".next");
const appDir = join(nextDir, "server", "app");
const staticDir = join(nextDir, "static");

function walk(dir, out, test) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out, test);
    else if (test(entry)) out.push(path);
  }
}

function builtCssText() {
  const files = [];
  walk(staticDir, files, (name) => name.endsWith(".css"));
  return files.map((file) => readFileSync(file, "utf8")).join("\n");
}

function face(css, family, hint) {
  const match = css.match(new RegExp(String.raw`(${hint}[^)"']+\.woff2)`));
  if (!match) return "";
  const file = match[1].split("/").pop();
  return `@font-face{font-family:${family};font-style:normal;font-display:swap;font-weight:700;src:url(/_next/static/media/${file}) format("woff2")}`;
}

function pages() {
  const out = [];
  walk(appDir, out, (name) => name.endsWith(".html"));
  return out;
}

if (!existsSync(appDir)) {
  console.log("critical css: skipped, no built HTML");
  process.exit(0);
}

const workdayPath = join(clientRoot, "src/styles/workday.css");
const workday = existsSync(workdayPath) ? readFileSync(workdayPath, "utf8") : "";
const tokens = workday.match(/html\.kyr-workday \{[\s\S]*?\n\}/)?.[0] ?? "";
const css = builtCssText();
const fontCss = [
  face(css, "Space Grotesk", "space-grotesk-latin-700"),
  face(css, "IBM Plex Sans", "ibm-plex-sans-latin-700"),
].join("");
const fontHrefs = [...fontCss.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1]);

const critters = css
  ? new Critters({
      path: nextDir,
      publicPath: "/_next/",
      preload: "media",
      fonts: false,
      reduceInlineStyles: false,
      logLevel: "silent",
    })
  : null;

let transformed = 0;
for (const page of pages()) {
  const original = readFileSync(page, "utf8");
  if (original.includes('id="kyr-critical"')) continue;
  try {
    let out = critters ? await critters.process(original) : original;
    const hrefs = [];
    out = out.replace(/<link rel="stylesheet"[^>]*>/g, (tag) => {
      const href = tag.match(/href="([^"]+)"/)?.[1];
      if (href && !hrefs.includes(href)) hrefs.push(href);
      return "";
    });
    if (hrefs.length === 0 && !tokens) continue;
    const noscript = `<noscript>${hrefs.map((href) => `<link rel="stylesheet" href="${href}"/>`).join("")}</noscript>`;
    const loader = hrefs.length
      ? `<script>window.addEventListener("load",function(){${hrefs
          .map((href) => `var l=document.createElement("link");l.rel="stylesheet";l.href="${href}";document.head.appendChild(l);`)
          .join("")}});</script>`
      : "";
    const preloads = fontHrefs
      .map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin="anonymous"/>`)
      .join("");
    const critical = `<style id="kyr-critical">${tokens}${fontCss}</style>`;
    if (!out.includes("</head>")) continue;
    out = out.replace("</head>", `${critical}${preloads}${loader}${noscript}</head>`);
    writeFileSync(page, out);
    transformed += 1;
  } catch (error) {
    console.error(`critical css: left ${page} unchanged (${error instanceof Error ? error.message : error})`);
  }
}

console.log(
  `critical css: ${transformed} pages, stylesheets load without blocking paint${css ? "" : " (built CSS folder was absent; tokens only)"}`,
);
