#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };

const seo = read('src/lib/seo.ts');
const robots = read('src/app/robots.ts');
const sitemap = read('src/app/sitemap.ts');
const jsonLd = read('src/components/seo/BaseJsonLd.tsx');
for (const token of ['SITE_URL = "https://knowyourole.com"', 'alternates:', 'canonical: url', 'openGraph:', 'twitter:', 'index: false']) if (!seo.includes(token)) fail(`SEO registry missing ${token}`);
for (const privatePath of ['/auth', '/callback', '/profile', '/checkout-success', '/checkout-cancel', '/api']) if (!seo.includes(`"${privatePath}"`)) fail(`private path missing: ${privatePath}`);
for (const token of ['disallow: noIndexPaths', 'sitemap: `${SITE_URL}/sitemap.xml`']) if (!robots.includes(token)) fail(`robots source missing ${token}`);
for (const token of ['publicPages.map', 'url: `${SITE_URL}${page.path}`']) if (!sitemap.includes(token)) fail(`sitemap source missing ${token}`);
if (!jsonLd.includes('baseJsonLd')) fail('base JSON-LD component missing');
if (!fs.existsSync(path.join(root, 'public/og-image.png'))) fail('public OG image missing');

const server = process.env.KYR_SEO_SERVER;
if (!server) { console.log('SEO_FOUNDATION_STATIC=PASS'); process.exit(process.exitCode ? 1 : 0); }
const get = (route) => new Promise((resolve, reject) => http.get(`${server}${route}`, (res) => { let body=''; res.on('data', d => body += d); res.on('end', () => resolve({code:res.statusCode, body})); }).on('error', reject));
(async () => {
  const [home, quiz, method, careers, results, robotsText, sitemapText] = await Promise.all(['/', '/quiz', '/methodology', '/careers', '/results', '/robots.txt', '/sitemap.xml'].map(get));
  for (const [name, page] of [['home',home],['quiz',quiz],['methodology',method],['careers',careers]]) { if (page.code !== 200) fail(`${name} returned ${page.code}`); if (!page.body.includes('rel="canonical"')) fail(`${name} missing canonical`); if (!page.body.includes('og:title')) fail(`${name} missing Open Graph`); }
  if (results.code !== 200 || !/noindex/i.test(results.body)) fail('results is not rendered noindex');
  if (robotsText.code !== 200 || !robotsText.body.includes('Sitemap: https://knowyourole.com/sitemap.xml')) fail('robots endpoint invalid');
  if (sitemapText.code !== 200 || !sitemapText.body.includes('https://knowyourole.com/quiz')) fail('sitemap endpoint invalid');
  if (!process.exitCode) console.log('SEO_FOUNDATION_HTTP=PASS');
})().catch((error) => { fail(error.message); });
