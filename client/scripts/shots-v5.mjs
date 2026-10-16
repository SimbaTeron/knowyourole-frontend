import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const P = Object.fromEntries(JSON.parse(readFileSync("/workspace/redesign-v5/personas/personas-v5.json","utf8")).map(p=>[p.id,p]));
const OUT="/workspace/redesign-v5"; const BASE="http://localhost:3100";
const runs=[["P81","trades-teen",true,2300],["P82","creator-teen",false,2300],["P90","middle-school-care",false,2300],["P69","quick-answers-broad",false,500]];
const browser = await chromium.launch();
const errors=[];
for (const [id,label,qshots,pace] of runs) {
  const ctx = await browser.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
  const page = await ctx.newPage();
  page.on("pageerror", e=>errors.push(`${id}: ${e.message}`));
  await page.goto(`${BASE}/quiz`, { waitUntil:"networkidle" });
  if (qshots) await page.screenshot({ path:`${OUT}/00_quiz_start.png` });
  await page.getByRole("button", { name:/Start the 30 questions/ }).click();
  for (let i=0;i<30;i++){
    await page.waitForFunction((n)=>document.body.innerText.includes(`Question ${n} of 30`), i+1, {timeout:15000});
    await page.waitForTimeout(pace);
    if (qshots && [22,24,29,30].includes(i+1)) await page.screenshot({ path:`${OUT}/q${i+1}.png` });
    await page.locator(`[data-testid="button-v2-answer-${"ABCD"[P[id].answers[i]]}"]`).first().click();
    await page.waitForTimeout(700);
  }
  await page.waitForURL(/results/, { timeout:60000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path:`${OUT}/result-${label}-top.png` });
  const card = page.locator(".role-card").first();
  if (await card.count()) { await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(600); await page.screenshot({ path:`${OUT}/result-${label}-direction.png` }); }
  const ns = page.locator('[data-testid="next-steps"]');
  const nsCount = await ns.count(); if (nsCount) { await ns.scrollIntoViewIfNeeded(); await page.waitForTimeout(500); await page.screenshot({ path:`${OUT}/result-${label}-next-steps.png` }); }
  const summary = await page.locator("body").innerText().then(t => (t.match(/A broad[^\n]*|[^\n]*A direction worth testing:[^\n]*/)||[""])[0].slice(0,220));
  const note = await page.locator('[data-testid="answer-note"]').innerText().catch(()=>"");
  console.log("  summary:", summary, "| note:", note.slice(0,120));
  console.log(id, label, "url", page.url().slice(0,80), "roleCard", await card.count(), "nextSteps", await ns.count(), await card.innerText().catch(()=>"" ).then(t=>t.replace(/\s+/g," ").slice(0,200)));
  await ctx.close();
}
console.log("pageerrors", errors.length, errors.slice(0,5));
await browser.close();
