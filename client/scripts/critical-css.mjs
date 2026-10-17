/**
 * After `next build`, keep the full stylesheet from blocking first paint.
 * Critters inlines the rules that match each page. Theme tokens and the two
 * heading/body faces are added back so the hero does not wait on the rest.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Critters from "critters";

const clientRoot = new URL("..", import.meta.url).pathname;
const nextDir = join(clientRoot, ".next");
const appDir = join(nextDir, "server", "app");
const chunkDir = join(nextDir, "static", "chunks");

const workday = readFileSync(join(clientRoot, "src/styles/workday.css"), "utf8");
const tokens = workday.match(/html\.kyr-workday \{[\s\S]*?\n\}/);
if (!tokens) throw new Error("Could not find html.kyr-workday tokens in workday.css");

const builtCss = readdirSync(chunkDir)
  .filter((name) => name.endsWith(".css"))
  .map((name) => readFileSync(join(chunkDir, name), "utf8"))
  .join("\n");

function face(family, hint) {
  const match = builtCss.match(new RegExp(String.raw`url\(\.\./media/(${hint}[^)]+\.woff2)\)`));
  if (!match) throw new Error(`Missing built font ${hint}`);
  return `@font-face{font-family:${family};font-style:normal;font-display:swap;font-weight:700;src:url(/_next/static/media/${match[1]}) format("woff2")}`;
}

const fontCss = [
  face("Space Grotesk", "space-grotesk-latin-700"),
  face("IBM Plex Sans", "ibm-plex-sans-latin-700"),
].join("");
const fontHrefs = [...fontCss.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1]);

const critters = new Critters({
  path: nextDir,
  publicPath: "/_next/",
  preload: "media",
  fonts: false,
  reduceInlineStyles: false,
  logLevel: "silent",
});

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (entry.endsWith(".html")) out.push(path);
  }
}

const pages = [];
walk(appDir, pages);

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  let out = await critters.process(html);
  const hrefs = [];
  out = out.replace(/<link rel="stylesheet"[^>]*>/g, (tag) => {
    const href = tag.match(/href="([^"]+)"/)?.[1];
    if (href && !hrefs.includes(href)) hrefs.push(href);
    return "";
  });
  const noscript = `<noscript>${hrefs.map((href) => `<link rel="stylesheet" href="${href}"/>`).join("")}</noscript>`;
  const loader = `<script>window.addEventListener("load",function(){${hrefs
    .map((href) => `var l=document.createElement("link");l.rel="stylesheet";l.href="${href}";document.head.appendChild(l);`)
    .join("")}});</script>`;
  const preloads = fontHrefs
    .map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin="anonymous"/>`)
    .join("");
  const critical = `<style id="kyr-critical">${tokens[0]}${fontCss}</style>`;
  if (!out.includes('id="kyr-critical"')) {
    out = out.replace("</head>", `${critical}${preloads}${loader}${noscript}</head>`);
  }
  writeFileSync(page, out);
}

console.log(`critical css: ${pages.length} pages, stylesheets load without blocking paint`);
