// Save compatibility: saves written by older versions (and broken ones) must
// load into a sane title screen and continue on the right night.
// Runs in a real browser via Playwright; skipped when Playwright isn't installed.
let chromium;
for(const m of ['playwright','/opt/node22/lib/node_modules/playwright']){ try{ ({chromium}=require(m)); break; }catch(_){} }
if(!chromium){ console.log('save.test: SKIP (playwright not available)'); process.exit(0); }
const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html')+'?title';
const KEY='nekonine.save.v2';
const CASES=[
  // name, raw stored value, expectations
  ['no save',null,{cont:false,select:false,archive:false,dawn:false,startLoop:1,startStage:0}],
  ['broken JSON','{oops',{cont:false,select:false,archive:false,dawn:false,startLoop:1,startStage:0}],
  ['v1 mid-run (no loop field)',{stage:3,deaths:12},{cont:true,select:false,dawn:false,contLoop:1,contStage:3,contDeaths:12}],
  ['old clear (cleared, no clears)',{stage:0,deaths:0,cleared:true},{cont:false,select:true,archive:true,dawn:false,lapSheet:true}],
  ['old clear, then a new run stopped mid-way',{stage:5,deaths:4,cleared:true},{cont:true,select:true,contLoop:1,contStage:5}],
  ['dawn run in progress',{stage:4,deaths:2,cleared:true,clears:1,loop:2,seen1:10,seen2:5},{cont:true,select:true,dawn:false,contLoop:2,contStage:4}],
  ['two clears',{stage:0,deaths:0,cleared:true,clears:2,loop:2,seen1:10,seen2:10},{cont:false,select:true,archive:true,dawn:true,lapSheet:true}],
];
(async()=>{
  const b=await chromium.launch(); let fail=0;
  for(const [name,raw,ex] of CASES){
    const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(([k,v])=>{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); if(v!==null) localStorage.setItem(k,v); },[KEY,raw===null?null:typeof raw==='string'?raw:JSON.stringify(raw)]);
    await p.goto(URL); await p.waitForTimeout(400);
    const got=await p.evaluate(()=>({cont:!document.getElementById('btnContinue').hidden,select:!document.getElementById('btnSelect').hidden,
      archive:!document.getElementById('btnArchive').hidden,dawn:!!window.NEKO_TITLE.dawn}));
    const bad=[];
    for(const k of ['cont','select','archive','dawn']) if(k in ex && got[k]!==ex[k]) bad.push(`${k}=${got[k]} (want ${ex[k]})`);
    if(ex.lapSheet){ await p.click('#btnStart'); await p.waitForTimeout(100); const open=await p.evaluate(()=>document.getElementById('lap').getAttribute('aria-hidden')==='false'); if(!open) bad.push('lap sheet did not open'); }
    const btn=ex.cont?'#btnContinue':(ex.startLoop?'#btnStart':null);
    if(btn){ await p.click(btn); await p.waitForTimeout(300);
      // tap through the story until the stage is actually running
      for(let n=0;n<80&&await p.evaluate(()=>window.__neko.S.mode)!=='play';n++){ await p.mouse.click(500,300); await p.waitForTimeout(220); }
      const s=await p.evaluate(()=>{ const S=window.__neko.S; return {loop:S.loop,stage:S.stage,deaths:S.deaths}; });
      const wl=ex.cont?ex.contLoop:ex.startLoop, ws=ex.cont?ex.contStage:ex.startStage;
      if(wl!==undefined&&s.loop!==wl) bad.push(`loop=${s.loop} (want ${wl})`);
      if(ws!==undefined&&s.stage!==ws) bad.push(`stage=${s.stage} (want ${ws})`);
      if(ex.contDeaths!==undefined&&s.deaths!==ex.contDeaths) bad.push(`deaths=${s.deaths} (want ${ex.contDeaths})`); }
    if(errs.length) bad.push('errors: '+errs.join('; '));
    console.log((bad.length?'FAIL ':'ok   ')+name+(bad.length?' -> '+bad.join(', '):'')); if(bad.length) fail++;
    await p.close();
  }
  await b.close();
  console.log(fail?`save.test: ${fail} FAILED`:'save.test: ALL PASS'); process.exit(fail?1:0);
})();
