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

// lap 2: cross to the small roof while the wind is down; the crow from behind comes as you land
const S6_TO_ROOF=[walk(X(152)),{r:1,t:0.45},wait(0.6),walk(X(348)),{r:1,j:1,p:1,t:0.12},{r:1,until:X(470)},{until:GR},{l:1,t:0.1},walk(X(490)),{until:w=>!w.ents[2].active&&w.ents[2].tm%4.3<1.5},{r:1,j:1,p:1,t:0.14},{r:1,until:X(560)},{until:GR}];
const S7_BAIT=[walk(X(270)),...jumpR(0.6),walk(X(555)),{until:w=>w.ents[1].tm>2.2},walk(X(602)),{l:1,until:XL(560)},{until:w=>w.ents[1].st==='done'}];
const dodge=(w,inp)=>{ inp.right=true; if(w._jt>0){ w._jt-=1/120; inp.jump=w._jt>0; return; } if(!w.P.ground) return;
  for(const e of w.ents){ if(e.kind!=='pendulum') continue; const dx=e.bx()-w.P.x; if(e.by()>320&&dx>-10&&dx<130){ inp.press=true; inp.jump=true; w._jt=0.6; } } };
const S8_LEDGE=[{fn:dodge,until:X(570)},{until:GR},{l:1,until:XL(640)},wait(0.3),{until:w=>w.ents[1].ang<-0.3},walk(X(655)),{r:1,j:1,p:1,until:X(840)},{j:1,until:GR}];

const cases={
1:[
  ['first-lap jump spot',   'dead', [walk(X(285)),...jumpR(0.6),walk(X(2000))]],
  ['solution',              'clear',[walk(X(150)),...jumpR(0.6),walk(X(555)),{r:1,j:1,p:1,t:0.14},{l:1,j:1,until:GR},wait(0.2),walk(X(640)),...jumpR(0.6),walk(X(2000))]],
],
2:[
  ['first-lap solution',    'dead', [walk(X(215)),wait(0.7),walk(X(335)),...jumpR(0.6),walk(X(600)),wait(0.05),walk(X(645)),{r:0,j:1,p:1,t:0.08},{j:1,until:GR},wait(0.9),{r:1,j:1,p:1,t:0.6},{r:1,until:GR},walk(X(2000))]],
  ['solution',              'clear',[walk(X(215)),wait(0.7),walk(X(253)),{fn:(w,inp,st)=>{inp.right=st<0.06;},t:0.3},wait(0.9),walk(X(335)),...jumpR(0.6),walk(X(600)),wait(0.05),walk(X(645)),{r:0,j:1,p:1,t:0.08},{j:1,until:GR},wait(0.9),{r:1,j:1,p:1,t:0.6},{r:1,until:GR},walk(X(2000))]],
],
3:[
  ['first-lap solution',    'dead', [walk(X(300)),wait(2.2),walk(X(390)),wait(0.4),{fn:(w,inp,st)=>{inp.right=(st%0.3)<0.08;},until:w=>w.ents[1].st!=='idle'},wait(0.1),{until:w=>w.ents[2].st==='fly'&&w.ents[2].x>w.P.x-140},{j:1,p:1,t:0.5},{until:GR},wait(1.2),walk(X(585)),...jumpR(0.6),walk(X(812)),...jumpR(0.6),{l:1,until:XL(921)},wait(0.2)]],
  ['solution',              'clear',[walk(X(290)),{until:w=>w.ents[0].st==='done'},{fn:(w,inp,st)=>{inp.right=(st%0.3)<0.06;},until:w=>w.ents[1].st!=='idle'},{until:w=>w.ents[2].st==='fly'&&w.ents[2].x>w.P.x-140},{j:1,p:1,t:0.5},{until:GR},{until:w=>w.ents[1].st==='done'},walk(X(585)),...jumpR(0.6),walk(X(812)),...jumpR(0.6),{l:1,until:XL(921)},wait(0.2)]],
],
4:[
  ['first-lap solution',    'dead', [walk(X(268)),...jumpR(0.6),walk(X(560)),wait(1.2),walk(X(596)),{r:1,j:1,p:1,until:X(660)},{j:1,until:GR},walk(X(718)),...jumpR(0.7),{l:1,until:XL(906)},wait(0.3)]],
  ['solution',              'clear',[walk(X(245)),{fn:(w,inp,st)=>{inp.right=(st%0.3)<0.05;},until:w=>w.ents[0].st!=='idle'},{until:w=>w.ents[0].st==='done'},walk(X(560)),wait(1.2),walk(X(596)),{r:1,j:1,p:1,until:X(660)},{j:1,until:GR},walk(X(718)),...jumpR(0.7),{l:1,until:XL(906)},wait(0.3)]],
],
5:[
  ['go on the third gap',   'dead', [walk(X(150)),wait(0.05),{until:w=>w.ents[0].st==='cycle'&&w.ents[0].ci===2&&!w.ents[0].on},walk(X(300)),...jumpR(0.6),{until:GR},{until:w=>w.ents[4].x<680},{j:1,p:1,t:0.5},{until:GR},{until:w=>w.ents[5].x<440},walk(X(740)),{until:w=>w.ents[6].st==='done'},walk(X(2000))]],
  ['solution',              'clear',[walk(X(150)),wait(0.05),{until:w=>w.ents[0].st==='cycle'&&w.ents[0].ci===3&&!w.ents[0].on},walk(X(300)),...jumpR(0.6),{until:GR},{until:w=>w.ents[4].x<680},{j:1,p:1,t:0.5},{until:GR},{until:w=>w.ents[5].x<440},walk(X(740)),{until:w=>w.ents[6].st==='done'},walk(X(2000))]],
],
6:[
  ['stand and wait on the roof','dead', [...S6_TO_ROOF,wait(1.5)]],
  ['solution',              'clear',[...S6_TO_ROOF,{until:w=>w.ents[3].st==='fly'&&w.ents[3].x>w.P.x-70},{j:1,p:1,t:0.08},{until:GR},{until:w=>w.ents[3].x>w.P.x+20},walk(X(632)),...jumpR(0.6),
                                     {until:w=>w.ents[4].st==='fly'&&w.ents[4].x<w.P.x+110},{j:1,p:1,t:0.4},{until:GR},walk(X(2000)),{l:1,until:XL(915)}]],
  ['ignore the crow ahead', 'dead', [...S6_TO_ROOF,{until:w=>w.ents[3].st==='fly'&&w.ents[3].x>w.P.x-70},{j:1,p:1,t:0.08},{until:GR},{until:w=>w.ents[3].x>w.P.x+20},walk(X(632)),...jumpR(0.6),wait(1.2)]],
],
7:[
  ['first-lap solution',    'dead', [...S7_BAIT,walk(X(990)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(1300)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(2000)),{l:1,until:XL(1520)}]],
  ['solution',              'clear',[walk(X(270)),...jumpR(0.6),walk(X(555)),{until:w=>w.ents[1].st==='done'},walk(X(990)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(1300)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(2000)),{l:1,until:XL(1520)}]],
],
8:[
  ['first-lap solution',    'dead', [...S8_LEDGE,walk(X(870)),...jumpR(0.6),{until:GR},wait(0.1),{l:1,until:XL(1360)},{until:w=>w.ents[7].st==='rise'},walk(X(1290)),wait(1.5)]],
  ['solution',              'clear',[...S8_LEDGE,walk(X(2000))]],
],
9:[
  ['first-lap solution',    'clear',[walk(X(405)),...jumpR(0.6),walk(X(690)),...jumpR(0.6),walk(X(985)),{until:w=>w.ents[2].s.x<1045},{r:1,j:1,p:1,t:0.3},{r:1,until:GR},walk(X(1100)),
                                     {until:w=>w.ents[2].s.x>1160},{r:1,j:1,p:1,until:X(1318)},{j:1,until:GR},{until:GR},wait(0.45),walk(X(1453)),wait(0.35),walk(X(1705)),...jumpR(0.6),walk(X(1860)),...jumpR(0.6),walk(X(2000)),walk(X(2470))]],
  ['walk past the door',    'dead', [walk(X(405)),...jumpR(0.6),walk(X(690)),...jumpR(0.6),walk(X(985)),{until:w=>w.ents[2].s.x<1045},{r:1,j:1,p:1,t:0.3},{r:1,until:GR},walk(X(1100)),
                                     {until:w=>w.ents[2].s.x>1160},{r:1,j:1,p:1,until:X(1318)},{j:1,until:GR},{until:GR},wait(0.45),walk(X(1453)),wait(0.35),walk(X(1705)),...jumpR(0.6),walk(X(1860)),...jumpR(0.6),walk(X(2000)),walk(X(2440)),{r:1,j:1,p:1,t:0.5},{r:1,until:X(2600)}]],
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
