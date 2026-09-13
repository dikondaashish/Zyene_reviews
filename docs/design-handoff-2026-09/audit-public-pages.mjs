// Read-only local browser inventory. No forms, bookings, or customer actions are submitted.
// Run from the repository root: node docs/design-handoff-2026-09/audit-public-pages.mjs
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const require = createRequire(resolve('package.json'));
const { chromium } = require('@playwright/test');
const output = resolve('docs/design-handoff-2026-09');
const baseUrl = process.env.AUDIT_BASE_URL || 'http://localhost:3000';
const content = JSON.parse(readFileSync(`${output}/content-inventory.json`, 'utf8'));
function pages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? pages(`${directory}/${entry.name}`) : entry.name === 'page.tsx' ? [`${directory}/${entry.name}`] : []);
}
const marketing = pages('src/app/(marketing)').map(file => '/'+dirname(file).replace('src/app/(marketing)', '').replace(/^\//, ''));
const fixed = marketing.filter(path => !path.includes('[') && !['/', '/growth', '/newsletter/unsubscribe'].includes(path));
const docs = pages('src/app/docs').map(file => '/docs'+dirname(file).replace('src/app/docs', ''));
const paths = [...new Set([...fixed, ...Object.values(content).filter(Array.isArray).flatMap(rows => rows.map(row => row.path)), ...docs])];
const screenshots = new Set(['/help','/features','/features/ai-replies','/features/competitor-tracking','/how-it-works','/pricing','/blog','/industries/restaurants','/demo','/integrations','/contact','/about','/tools/review-response-generator']);
mkdirSync(`${output}/evidence`,{recursive:true});
const browser = await chromium.launch();
const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
await context.addInitScript(() => localStorage.setItem('cookie-consent','declined'));
const page = await context.newPage();
const auditFile = `${output}/browser-audit.json`;
const rows = process.argv.includes('--resume') && existsSync(auditFile)
 ? JSON.parse(readFileSync(auditFile, 'utf8')).rows : [];
let consecutiveErrors = 0;
for (const path of paths) {
 if(rows.some(row => row.path === path && !row.error)) continue;
 try {
  await page.setViewportSize({width:1440,height:1000});
  const response=await page.goto(new URL(path, baseUrl).href, {waitUntil:'domcontentloaded', timeout:30000});
  await page.evaluate(()=>document.fonts.ready);
  const data=await page.evaluate(()=>{
   const main=document.querySelector('main');
   const h1=document.querySelector('h1');
   return {title:document.title, h1:[...document.querySelectorAll('h1')].map(x=>x.textContent), h2:[...(main??document).querySelectorAll('h2')].map(x=>x.textContent), mainCount:document.querySelectorAll('main').length,
    heroType:document.querySelector('.landing-hero-product')?'product':document.querySelector('.landing-hero-image')?'existing-photo':document.querySelector('.interior-scene')?'generic-scene':'custom',
    h1Size:h1?getComputedStyle(h1).fontSize:null, description:document.querySelector('meta[name="description"]')?.content, canonical:document.querySelector('link[rel="canonical"]')?.href,
    images:[...(main??document).querySelectorAll('img')].map(x=>({src:x.getAttribute('src'),alt:x.alt,loaded:x.complete&&x.naturalWidth>0})),
    topActions:[...(main??document).querySelectorAll('a,button,input')].slice(0,12).map(x=>({tag:x.tagName,text:x.textContent?.trim().slice(0,100),href:x.getAttribute('href')})),
    desktopOverflow:document.documentElement.scrollWidth>innerWidth};
  });
  if(screenshots.has(path)) await page.screenshot({path:`${output}/evidence/${path.slice(1).replaceAll('/','-')}-desktop.png`});
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.scrollTo(0,0));
  const mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(screenshots.has(path)) await page.screenshot({path:`${output}/evidence/${path.slice(1).replaceAll('/','-')}-mobile.png`});
  const previous = rows.findIndex(row => row.path === path);
  if(previous >= 0) rows.splice(previous, 1);
  rows.push({path,status:response?.status(),finalUrl:page.url(),...data,mobileOverflow});
  consecutiveErrors = 0;
 } catch(error) {
  const previous = rows.findIndex(row => row.path === path);
  if(previous >= 0) rows.splice(previous, 1);
  rows.push({path,error:String(error)});
  consecutiveErrors += 1;
 }
 writeFileSync(auditFile,JSON.stringify({generatedAt:new Date().toISOString(),baseUrl,expectedPaths:paths.length,scope:'Read-only preview; no backend or form verification',rows},null,2)+'\n');
 if(consecutiveErrors >= 3) { console.log('Stopped after three consecutive navigation errors; stabilize preview then use --resume.'); break; }
 if(rows.length%10===0) console.log(`${rows.length}/${paths.length} pages checked`);
}
await browser.close();
console.log(JSON.stringify({total:rows.length,errors:rows.filter(x=>x.error).map(x=>x.path),non200:rows.filter(x=>x.status&&x.status!==200).map(x=>[x.path,x.status]),overflow:rows.filter(x=>x.desktopOverflow||x.mobileOverflow).map(x=>x.path)}));
