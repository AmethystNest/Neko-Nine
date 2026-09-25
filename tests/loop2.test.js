// Second lap: each stage twists one thing from the first. The first lap's
// solution (or its obvious habit) should die; a lap-2 solution should clear.
const {run,X,XL,GR}=require('./sim.js');
const walk=(until)=>({r:1,until});
const jumpR=(hold=0.5)=>[{r:1,j:1,p:1,t:hold},{r:1,until:GR}];
const wait=t=>({t});
const L2={loop:2,maxT:60};
const CP10={spawn:{x:1330,y:420}};
const windOn=w=>{ const ph=w.ents[6].tm%2.8; return ph>0.3&&ph<0.4; };
const windCalm=w=>{ const ph=w.ents[6].tm%2.8; return ph>1.6&&ph<1.7; };
const LT=w=>w.ents[8];
const S10_START=[walk(X(455)),...jumpR(0.6),walk(X(670)),{r:1,j:1,p:1,t:0.14},{l:1,j:1,until:GR},wait(0.2),
  {r:1,until:w=>w.P.x>=w.ents[1].px-70},wait(0.3),
  {until:w=>w.ents[2].on&&w.ents[2].tm%1.65>0.62&&w.ents[2].tm%1.65<0.66},{r:1,until:w=>w.P.x>=w.ents[1].px-14},...jumpR(0.6),walk(X(1000)),
  {until:w=>w.ents[5].st==='rise'&&w.ents[5].y<w.ents[5].restY+60},walk(X(1300))];
const S10_MID=[walk(X(1455)),{until:windCalm},{r:1,j:1,p:1,t:0.18},{r:1,until:X(1600)},{until:GR},{until:w=>w.ents[7].st==='done'},walk(X(1820)),
  {r:1,until:w=>LT(w).st==='aim'&&LT(w).tm>=0.5},{until:w=>LT(w).st!=='aim'||LT(w).tm<0.3},{until:w=>LT(w).st==='aim'&&LT(w).tm>=0.5},{r:1,t:0.3},{until:w=>LT(w).st==='done'}];
// wait just outside the blade's low arc, then jump over it as it swings away
const S10_BLADE=[walk(X(2072)),{until:w=>{ const t=w.ents[9].tm%2.2; return t>0.5&&t<0.55; }},{r:1,j:1,p:1,t:0.6},{r:1,until:GR},walk(X(2300)),
  {until:w=>w.ents[10].st==='idle'||w.ents[10].st==='done'}];
const S10_END=[walk(X(2372)),...jumpR(0.6),walk(X(2696)),{until:w=>w.ents[11].st==='move'},{j:1,p:1,t:0.5},{until:GR},
  {until:w=>w.ents[12].st==='fly'&&w.ents[12].x<w.P.x+130},{j:1,p:1,t:0.5},{until:GR},{until:w=>w.ents[11].st==='stop'},walk(X(4000)),{l:1,until:XL(3050)}];

// lap 2 helpers
const hops=n=>{ const s=[]; for(let i=0;i<n;i++) s.push({l:1,until:XL(30)},{r:1,until:X(120)}); return s; };
const stepToDoor=(w,inp)=>{ const d=w.goal.x-w.P.x; inp.right=d>0; inp.left=d<0; };
const S5_OPEN=[walk(X(150)),wait(0.05),{until:w=>w.ents[0].st==='cycle'&&!w.ents[0].on&&w.ents[0].tm%(1.34)>0.72&&w.ents[0].tm%1.34<0.8},walk(X(300)),...jumpR(0.6)];
const S6_GUST=w=>{ const p=w.ents[1].tm%4.8; return p>=0.1&&p<0.15; };
const S6_LAND={fn:(w,inp)=>{ inp.right=w.P.x<940; inp.left=w.P.x>946; },until:w=>w.cleared};
const S7_HOP=(w,inp)=>{ const c=w.ents[2]; inp.right=inp.left=false;
  if(w._j>0){ w._j-=1/120; inp.jump=true; return; }
  if(!w.P.ground) return;
  if(c.people.some(p=>p.s.on&&p.s.x<w.P.x+48&&p.s.x+26>w.P.x-10)){ inp.press=true; inp.jump=true; w._j=0.6; } };
const S7_PASSED=w=>w.ents[2].n>=4&&w.ents[2].people.every(p=>!p.s.on||p.s.x+26<w.P.x-12);
const S7_REST=[walk(X(555)),{until:w=>w.ents[1].tm>2.2},walk(X(602)),{l:1,until:XL(560)},{until:w=>w.ents[1].st==='done'},walk(X(975)),...jumpR(0.6),walk(X(1300)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(2000)),{l:1,until:XL(1520)}];
const dodge=(w,inp)=>{ inp.right=true; if(w._jt>0){ w._jt-=1/120; inp.jump=w._jt>0; return; } if(!w.P.ground) return;
  for(const e of w.ents){ if(e.kind!=='pendulum') continue; const dx=e.bx()-w.P.x; if(e.by()>320&&dx>-10&&dx<130){ inp.press=true; inp.jump=true; w._jt=0.6; } } };
const S8_LEDGE=[{fn:dodge,until:X(570)},{until:GR},{l:1,until:XL(640)},wait(0.3),{until:w=>w.ents[1].ang<-0.3},walk(X(655)),{r:1,j:1,p:1,until:X(840)},{j:1,until:GR}];
const S9_SOL=[walk(X(405)),...jumpR(0.6),walk(X(690)),...jumpR(0.6),walk(X(985)),{until:w=>w.ents[2].s.x<1045},{r:1,j:1,p:1,t:0.3},{r:1,until:GR},walk(X(1100)),
  {until:w=>w.ents[2].s.x>1160},{r:1,j:1,p:1,until:X(1318)},{j:1,until:GR},{until:GR},wait(0.45),walk(X(1453)),wait(0.35),walk(X(1705)),...jumpR(0.6),walk(X(1860)),...jumpR(0.6),walk(X(2000)),walk(X(2470))];

const cases={
1:[
  ['jump over the clock',   'dead', [walk(w=>w.ents[0].st==='run'&&w.ents[0].x-w.P.x<110),{r:1,j:1,p:1,t:0.5},{r:1,until:GR},walk(X(2000))]],
  ['walk straight',         'dead', [walk(X(2000))]],
  ['walk under its hops',   'clear',[walk(X(250)),wait(1.1),walk(w=>w.ents[0].x<w.P.x-30),walk(X(560)),wait(1.1),walk(X(2000))]],
],
2:[
  ['walk onto the next one','dead', [walk(X(262)),{r:1,j:1,p:1,t:0.2},{r:1,until:X(345)},{until:GR},wait(0.1),walk(X(395)),{r:1,j:1,p:1,t:0.3},{r:1,until:X(505)},{until:GR},walk(X(2000))]],
  ['wait too long',         'dead', [walk(X(262)),{r:1,j:1,p:1,t:0.2},{r:1,until:X(345)},{until:GR},wait(4)]],
  ['jump up past it',       'clear',[walk(X(262)),{r:1,j:1,p:1,t:0.2},{r:1,until:X(345)},{until:GR},wait(0.1),walk(X(395)),{r:1,j:1,p:1,t:0.3},{r:1,until:X(505)},{until:GR},wait(0.3),walk(X(560)),{r:1,j:1,p:1,t:0.6},{r:1,until:X(700)},{until:GR},walk(X(790)),{until:GR},walk(X(2000))]],
],
3:[
  ['press on at the wrong beat','dead',[walk(X(240)),wait(0.95),walk(X(252)),{l:1,until:X(588)}]],
  ['solution',              'clear',[walk(X(240)),wait(0.45),walk(X(252)),{l:1,until:X(588)},{l:1,j:1,p:1,until:X(606)},{r:1,j:1,until:GR},walk(X(812)),...jumpR(0.6),{l:1,until:XL(921)},wait(0.2)]],
],
4:[
  ['walk straight across',  'dead', [walk(X(2000))]],
  ['wait out the dark',     'clear',[walk(X(280)),wait(0.45),walk(X(525)),wait(0.6),walk(X(2000))]],
],
5:[
  ['chase the door',        'timeout',[...S5_OPEN,walk(X(3000))],{maxT:18}],
  ['stand still, let it come','clear',[...S5_OPEN,walk(X(600)),{until:w=>Math.abs(w.goal.x-w.P.x)<24},{fn:stepToDoor,until:w=>w.cleared}]],
],
6:[
  ['run and jump at once',  'dead', [walk(X(318)),...jumpR(0.6),S6_LAND]],
  ['wait at the edge',      'dead', [walk(X(310)),wait(3),{r:1,until:GR},S6_LAND]],
  ['jump on the gust',      'clear',[walk(X(150)),{until:S6_GUST},walk(X(318)),...jumpR(0.6),S6_LAND]],
],
7:[
  ['stand in the crowd',    'dead', [walk(X(270)),...jumpR(0.6),walk(X(430)),wait(8)]],
  ['hop and let them pass', 'clear',[walk(X(270)),...jumpR(0.6),walk(X(430)),{fn:S7_HOP,until:S7_PASSED},...S7_REST]],
],
8:[
  ['wait for the blade',    'dead', [walk(X(120)),wait(3),walk(X(640))]],
  ['solution',              'clear',[...S8_LEDGE,walk(X(870)),...jumpR(0.6),{until:GR},wait(0.1),{l:1,until:XL(1360)},{until:w=>w.ents[7].st==='rise'},walk(X(2000)),{l:1,until:XL(1300)}]],
],
9:[
  ['stop to look around',   'dead', [walk(X(300)),wait(2.5),walk(X(2470))]],
  ['keep moving',           'clear',S9_SOL],
],
10:[
  ['solution (no wall now)','clear',[...S10_START,...S10_MID,...S10_BLADE,walk(X(2372)),...jumpR(0.6),walk(X(4000)),{l:1,until:XL(3050)}]],
  ['walk into the spikes',  'dead', [...S10_MID,...S10_BLADE,walk(X(4000))],CP10],
],
};
let fail=0;
const only=process.argv[2]?+process.argv[2]:0;
for(const k of Object.keys(cases)){
  if(only && +k!==only) continue;
  for(const [name,exp,script,opts] of cases[k]){
    const r=run(k-1,script,Object.assign({},L2,opts,{trace:!!process.env.TRACE}));
    const ok=r.res===exp; if(!ok) fail++;
    console.log(`${ok?'OK  ':'FAIL'} L2 S${k} ${name.padEnd(26)} -> ${r.res}${r.cause?' ('+r.cause+' x='+r.x+' y='+r.y+' step='+r.step+')':''} t=${r.t}`);
    if(!ok && process.env.TRACE) console.log(r.log.slice(-40).join('\n'));
  }
}
console.log(fail?`${fail} FAILED`:'ALL PASS');
process.exit(fail?1:0);
