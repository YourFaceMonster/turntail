import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {serveStores} from './preview-stores.mjs';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/SONG/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=resolve(process.argv[2]),report={checks:[]},preview=await serveStores(output);
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
await mkdir(resolve(output,'checks'),{recursive:true});
try{
 for(const target of ['itch','onestore']){
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],missing=[],sdk=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()===404&&response.url().startsWith(preview.origin))missing.push(response.url());});
  page.on('request',request=>{if(request.url().includes('h5sdk.onestore.net'))sdk.push(request.url());});
  await page.route('**/api/game',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'연결 테스트: 서버 없음'})}));
  await page.goto(`${preview.origin}/${target}/game/index.html`,{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/싱글플레이/}).waitFor({timeout:20000});
  await page.waitForTimeout(800);await page.screenshot({path:resolve(output,'checks',`${target}-portrait.png`)});
  assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth>innerWidth),false,'portrait horizontal overflow');
  await page.getByRole('button',{name:/싱글플레이/}).click();
  await page.waitForTimeout(800);
  await writeFile(resolve(output,'checks',`${target}-single-menu.txt`),await page.locator('body').innerText());
  await page.screenshot({path:resolve(output,'checks',`${target}-single-menu.png`)});
  await page.getByRole('button',{name:'스토리모드',exact:true}).click();await page.waitForTimeout(500);
  await writeFile(resolve(output,'checks',`${target}-story-menu.txt`),await page.locator('body').innerText());
  await page.screenshot({path:resolve(output,'checks',`${target}-story-menu.png`)});
  await page.getByRole('button',{name:'새 스토리 여정 시작 →',exact:true}).click();
  await page.getByRole('button',{name:'건너뛰기',exact:true}).waitFor({timeout:15000});
  await page.locator('.prologue-caption p').waitFor({timeout:15000});
  await page.screenshot({path:resolve(output,'checks',`${target}-prologue.png`)});
  await page.getByRole('button',{name:'건너뛰기',exact:true}).click();await page.waitForTimeout(1000);
  await page.getByText('새로운 승부를 준비하고 있어요',{exact:true}).waitFor({state:'hidden',timeout:25000});
  await page.waitForTimeout(700);
  await writeFile(resolve(output,'checks',`${target}-map.txt`),await page.locator('body').innerText());
  assert.match(await page.locator('body').innerText(),/철문의 영역|마을 관문/,'new journey reaches its map');
  await page.screenshot({path:resolve(output,'checks',`${target}-map.png`)});
  const saved=await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.includes('rpg')).map(key=>({key,bytes:localStorage.getItem(key).length})));
  assert.ok(saved.some(row=>row.bytes>100),'new journey saved locally');
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(300);
  await page.screenshot({path:resolve(output,'checks',`${target}-landscape.png`)});
  assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(missing.length,0,JSON.stringify(missing));
  if(target==='itch')assert.equal(sdk.length,0,'free build must not request ad SDK');
  report.checks.push({target,errors,missing,sdkRequests:sdk.length,initialMenu:true,singleMenu:true,prologue:true,map:true,saved,portrait:true,landscape:true});
  await context.close();
 }
 await writeFile(resolve(output,'checks','report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();preview.server.close();}
