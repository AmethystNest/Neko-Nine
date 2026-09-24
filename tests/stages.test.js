const {run,X,XL,GR,STAGES}=require('./sim.js');
const R={r:1}, L={l:1};
const walk=(until)=>({r:1,until});
const jumpR=(hold=0.5)=>[{r:1,j:1,p:1,t:hold},{r:1,until:GR}];
const wait=t=>({t});
// Walk right, hopping over any swinging blade that comes low and close.
const dodge=(w,inp)=>{
  inp.right=true;
  if(w._jt>0){ w._jt-=1/120; inp.jump=w._jt>0; return; }
  if(!w.P.ground) return;
  for(const e of w.ents){ if(e.kind!=='pendulum') continue;
    const dx=e.bx()-w.P.x; if(e.by()>320 && dx>-10 && dx<130){ inp.press=true; inp.jump=true; w._jt=0.6; } }
};

// Stage 10 pieces (entity order: 0 trapdoor, 1 pit, 2 laser, 3-5 presses, 6 wind, 7 arc,
// 8 lightning, 9 pendulum, 10 spikes, 11 wall, 12 arrow)
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

// expect: 'dead' (first-time kill) or 'clear'
const cases={
1:[
  ['naive walk',            'dead', [walk(X(2000))]],
  ['jump trapdoor, jump pit','dead', [walk(X(285)),...jumpR(0.6),walk(X(560)),...jumpR(0.6),walk(X(2000))]],
  ['steer back over pit',   'clear',[walk(X(285)),...jumpR(0.6),walk(X(555)),{r:1,j:1,p:1,t:0.14},{l:1,j:1,until:GR},wait(0.2),
                                      walk(X(640)),...jumpR(0.6),walk(X(2000))]],
],
2:[
  ['naive walk',            'dead', [walk(X(2000))]],
  ['stop for pot, jump pit, walk','dead',[walk(X(215)),wait(0.7),walk(X(335)),...jumpR(0.6),walk(X(2000))]],
  ['solution',              'clear',[walk(X(215)),wait(0.7),walk(X(335)),...jumpR(0.6),walk(X(600)),wait(0.05),walk(X(645)),
                                      {r:0,j:1,p:1,t:0.08},{j:1,until:GR},wait(0.9),{r:1,j:1,p:1,t:0.6},{r:1,until:GR},walk(X(2000))]],
],
3:[
  ['naive walk',            'dead', [walk(X(2000))]],
  ['wait crusher A, walk on','dead',[walk(X(300)),wait(2.2),walk(X(2000))]],
  ['wait both, stand still','dead',[walk(X(300)),wait(2.2),walk(X(409)),wait(3)]],
  ['solution',              'clear',[walk(X(300)),wait(2.2),walk(X(390)),wait(0.4),{fn:(w,inp,st)=>{inp.right=(st%0.3)<0.08;},until:w=>w.ents[1].st!=='idle'},wait(0.1),{until:w=>w.ents[2].st==='fly'&&w.ents[2].x>w.P.x-140},{j:1,p:1,t:0.5},{until:GR},wait(1.2),walk(X(585)),...jumpR(0.6),walk(X(812)),...jumpR(0.6),{l:1,until:XL(921)},wait(0.2)]],
],
4:[
  ['naive walk',            'dead', [walk(X(2000))]],
  ['jump spikes then walk', 'dead', [walk(X(268)),...jumpR(0.6),walk(X(2000))]],
  ['solution',              'clear',[walk(X(268)),...jumpR(0.6),walk(X(560)),wait(1.2),walk(X(596)),{r:1,j:1,p:1,until:X(660)},{j:1,until:GR},walk(X(718)),...jumpR(0.7),{l:1,until:XL(906)},wait(0.3)]],
],
5:[
  ['naive walk',            'dead', [walk(X(2000))]],
  ['ride the lift',         'dead', [walk(X(150)),wait(0.05),{until:w=>w.ents[0].st==='cycle'&&!w.ents[0].on&&w.ents[0].tm%(1.34)>0.72&&w.ents[0].tm%1.34<0.8},walk(X(380)),wait(1.5)]],
  ['hop lift, keep walking','dead', [walk(X(150)),wait(0.05),{until:w=>w.ents[0].st==='cycle'&&!w.ents[0].on&&w.ents[0].tm%(1.34)>0.72&&w.ents[0].tm%1.34<0.8},walk(X(300)),...jumpR(0.6),walk(X(2000))]],
  ['solution',              'clear',[walk(X(150)),wait(0.05),{until:w=>w.ents[0].st==='cycle'&&!w.ents[0].on&&w.ents[0].tm%(1.34)>0.72&&w.ents[0].tm%1.34<0.8},walk(X(300)),...jumpR(0.6),
                                      {until:GR},{until:w=>w.ents[4].x<680},{j:1,p:1,t:0.5},{until:GR},{until:w=>w.ents[5].x<440},walk(X(740)),{until:w=>w.ents[6].st==='done'},walk(X(2000))]],
],
6:[
  ['naive walk',            'dead', [walk(X(2000))]],
  ['stop at once for bolt',  'dead', [walk(X(152)),wait(1.2)]],
  ['full jump gap1',        'dead', [walk(X(152)),{r:1,t:0.45},wait(0.6),walk(X(345)),...jumpR(0.6),walk(X(2000))]],
  ['solution',              'clear',[walk(X(152)),{r:1,t:0.45},wait(0.6),walk(X(348)),{r:1,j:1,p:1,t:0.12},{r:1,until:GR},walk(X(515)),{r:1,j:1,p:1,t:0.15},{r:1,until:X(603)},{until:GR},wait(0.1),walk(X(625)),
                                      {until:w=>!w.flags.wind&&w.ents[2].tm%3>1.45},walk(X(630)),...jumpR(0.6),{until:w=>w.ents[3].st==='fly'&&w.ents[3].x<w.P.x+110},{j:1,p:1,t:0.4},{until:GR},
                                      walk(X(870)),{until:w=>w.ents[4].st==='fly'&&w.ents[4].x>w.P.x-110},{j:1,p:1,t:0.4},{until:GR},{until:w=>w.ents[4].st==='done'},walk(X(2000)),{l:1,until:XL(915)}]],
  ['jump one crow only',    'dead', [walk(X(152)),{r:1,t:0.45},wait(0.6),walk(X(348)),{r:1,j:1,p:1,t:0.12},{r:1,until:GR},walk(X(515)),{r:1,j:1,p:1,t:0.15},{r:1,until:X(603)},{until:GR},wait(0.1),walk(X(625)),
                                      {until:w=>!w.flags.wind&&w.ents[2].tm%3>1.45},walk(X(630)),...jumpR(0.6),{until:w=>w.ents[3].st==='fly'&&w.ents[3].x<w.P.x+110},{j:1,p:1,t:0.4},{until:GR},walk(X(2000))]],
  ['ignore crow, walk to door',       'dead', [walk(X(152)),{r:1,t:0.45},wait(0.6),walk(X(348)),{r:1,j:1,p:1,t:0.12},{r:1,until:GR},walk(X(515)),{r:1,j:1,p:1,t:0.15},{r:1,until:X(603)},{until:GR},wait(0.1),walk(X(625)),{until:w=>!w.flags.wind&&w.ents[2].tm%3>1.45},walk(X(630)),...jumpR(0.6),walk(X(2000))]],
],
7:[
  ['naive walk+jump obstacle','dead',[walk(X(270)),...jumpR(0.6),walk(X(2000))]],
  ['wait one train only',   'dead', [walk(X(270)),...jumpR(0.6),walk(X(570)),{until:w=>w.ents[1].tm>1.9},walk(X(2000))]],
  ['full jump over pit',    'dead', [walk(X(270)),...jumpR(0.6),walk(X(555)),{until:w=>w.ents[1].st==='done'},walk(X(975)),...jumpR(0.6),walk(X(2000))]],
  ['solution',              'clear',[walk(X(270)),...jumpR(0.6),walk(X(555)),{until:w=>w.ents[1].st==='done'},walk(X(990)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(1300)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(2000)),{l:1,until:XL(1520)}]],
  ['go when gates lift',    'dead', [walk(X(270)),...jumpR(0.6),walk(X(555)),{until:w=>w.ents[1].tm>3.3},walk(X(2000))]],
  ['bait the second train', 'dead', [walk(X(270)),...jumpR(0.6),walk(X(555)),{until:w=>w.ents[1].tm>2.6},walk(X(2000))]],
  ['full jump off walkway', 'dead', [walk(X(270)),...jumpR(0.6),walk(X(555)),{until:w=>w.ents[1].st==='done'},walk(X(990)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(1300)),...jumpR(0.6),walk(X(2000))]],
  ['ride the walkway',      'dead', [walk(X(270)),...jumpR(0.6),walk(X(555)),{until:w=>w.ents[1].st==='done'},walk(X(990)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(2000))]],
],
8:[
  ['naive walk',            'dead', [walk(X(2000))]],
  ['use the spring',        'dead', [{fn:dodge,until:X(570)},{until:GR},{until:w=>w.ents[1].ang<-0.3},walk(X(705)),wait(1)]],
  ['walk into the fake door','dead',[{fn:dodge,until:X(570)},{until:GR},{l:1,until:XL(640)},wait(0.3),{until:w=>w.ents[1].ang<-0.3},walk(X(655)),{r:1,j:1,p:1,until:X(840)},{j:1,until:GR},walk(X(2000))]],
  ['rush the real door',    'dead', [{fn:dodge,until:X(570)},{until:GR},{l:1,until:XL(640)},wait(0.3),{until:w=>w.ents[1].ang<-0.3},walk(X(655)),{r:1,j:1,p:1,until:X(840)},{j:1,until:GR},walk(X(870)),...jumpR(0.6),walk(X(2000))]],
  ['solution',              'clear',[{fn:dodge,until:X(570)},{until:GR},{l:1,until:XL(640)},wait(0.3),{until:w=>w.ents[1].ang<-0.3},walk(X(655)),{r:1,j:1,p:1,until:X(840)},{j:1,until:GR},walk(X(870)),...jumpR(0.6),{until:GR},wait(0.1),{l:1,until:XL(1360)},{until:w=>w.ents[7].st==='rise'},walk(X(2000)),{l:1,until:XL(1300)}]],
],
9:[
  ['naive walk',            'dead', [walk(X(2000))]],
  ['solution',              'clear',[walk(X(405)),...jumpR(0.6),walk(X(690)),...jumpR(0.6),walk(X(985)),{until:w=>w.ents[2].s.x<1045},{r:1,j:1,p:1,t:0.3},{r:1,until:GR},walk(X(1100)),
                                     {until:w=>w.ents[2].s.x>1160},{r:1,j:1,p:1,until:X(1318)},{j:1,until:GR},{until:GR},wait(0.45),walk(X(1453)),wait(0.35),walk(X(1705)),...jumpR(0.6),walk(X(1860)),...jumpR(0.6),walk(X(2000))]],
],
10:[
  ['stage1 habit jump',     'dead', [walk(X(285)),...jumpR(0.6),walk(X(4000))]],
  ['plain jump over pit',   'dead', [walk(X(455)),...jumpR(0.6),walk(X(680)),...jumpR(0.6),walk(X(4000))]],
  ['solution',              'clear',[...S10_START,...S10_MID,...S10_BLADE,...S10_END]],
  // sections below start from the mercy checkpoint (x=1330)
  ['jump into the headwind','dead', [walk(X(1455)),{until:windOn},...jumpR(0.6),walk(X(4000))],CP10],
  ['full jump in the calm', 'dead', [walk(X(1455)),{until:windCalm},...jumpR(0.6),walk(X(4000))],CP10],
  ['walk through lightning','dead', [...S10_MID.slice(0,7),walk(X(4000))],CP10],
  ['walk under the blade',  'dead', [...S10_MID,walk(X(2370))],CP10],
  ['walk into the spikes',  'dead', [...S10_MID,...S10_BLADE,walk(X(4000))],CP10],
  ['hop down, ignore arrow','dead', [...S10_MID,...S10_BLADE,walk(X(2372)),...jumpR(0.6),walk(X(2696)),{until:w=>w.ents[11].st==='move'},{j:1,p:1,t:0.5},{until:GR},{until:w=>w.ents[11].st==='stop'},walk(X(4000)),{l:1,until:XL(3050)}],CP10],
],
};
let fail=0;
const only=process.argv[2]?+process.argv[2]:0;
for(const k of Object.keys(cases)){
  if(only && +k!==only) continue;
  for(const [name,exp,script,opts] of cases[k]){
    const r=run(k-1,script,Object.assign({trace:!!process.env.TRACE,maxT:60},opts));
    const ok=r.res===exp;
    if(!ok) fail++;
    console.log(`${ok?'OK  ':'FAIL'} S${k} ${name.padEnd(28)} -> ${r.res}${r.cause?' ('+r.cause+' x='+r.x+' y='+r.y+' step='+r.step+')':''} t=${r.t}`);
    if(!ok && process.env.TRACE) console.log(r.log.join('\n'));
  }
}
// Mercy checkpoints must be safe places to stand after respawning.
for(let k=1;k<=10;k++){
  if(only && k!==only) continue;
  const def=STAGES[k-1];
  const cp=def.checkpoint; if(!cp) { console.log('FAIL S'+k+' has no checkpoint'); fail++; continue; }
  const r=run(k-1,[{t:k===9?1.2:3}],{spawn:{x:cp.x,y:cp.y===undefined?420:cp.y},maxT:k===9?1.2:3});
  const ok=r.res!=='dead';
  if(!ok) fail++;
  console.log(`${ok?'OK  ':'FAIL'} S${k} checkpoint x=${cp.x} safe to stand   -> ${r.res}${r.cause?' ('+r.cause+')':''}`);
}
console.log(fail?`${fail} FAILED`:'ALL PASS');
process.exit(fail?1:0);
