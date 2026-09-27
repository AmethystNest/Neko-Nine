// Second lap: each stage twists one thing from the first. The first lap's
// solution (or its obvious habit) should die; a lap-2 solution should clear.
const {run,X,XL,GR}=require('./sim.js');
const walk=(until)=>({r:1,until});
const jumpR=(hold=0.5)=>[{r:1,j:1,p:1,t:hold},{r:1,until:GR}];
const wait=t=>({t});
const L2={loop:2,maxT:60};
const CP10={spawn:{x:1330,y:420}};
const S10_1=[walk(X(250)),wait(1.0),walk(w=>w.ents[0].st!=='run'||w.ents[0].x<w.P.x-30),walk(X(685))];
const S10_2=[{r:1,j:1,p:1,t:0.2},{r:1,until:X(725)},{until:GR},{until:w=>w.ents[1].solids[2].on},walk(X(790)),{r:1,j:1,p:1,t:0.6},{r:1,until:X(860)},{until:GR},walk(X(1000)),{until:GR}];
const S10_3=[walk(X(1045)),{l:1,until:X(1168)},{l:1,j:1,p:1,t:0.25},{l:1,until:GR},{until:GR},wait(0.1),walk(X(1385))];
// the tubes: jump when the one ahead is dark or the one underfoot starts to flicker
const S10_TUBES={fn:(w,inp)=>{ const P=w.P, L=[w.ents[3],w.ents[4],w.ents[5]]; inp.right=true; inp.press=false;
  if(w._j>0){ w._j-=1/120; inp.jump=true; return; } inp.jump=false; if(!P.ground) return;
  const at=x=>L.find(l=>x>=l.x&&x<l.x+l.w), ahead=at(P.x+30), cur=at(P.x);
  if((ahead&&!ahead.lit)||(cur&&cur.flicker)){ inp.press=true; inp.jump=true; w._j=0.6; } },until:X(2045)};
const S10_4=[{until:w=>w.ents[3].tm%5>1.6&&w.ents[3].tm%5<1.65},S10_TUBES];
// the last stretch: the floor gives way behind you all the way to the door; just run
const S10_DOOR={fn:(w,i)=>{ i.right=w.P.x<3044; i.left=w.P.x>3056; },until:w=>w.cleared};
// the notifications: hop from one to the next, jumping up past each fake
const hopTo=(x0,t,xl)=>[walk(X(x0)),{r:1,j:1,p:1,t},{r:1,until:X(xl)},{until:GR}];
const S2_A=hopTo(235,0.2,300);
const S2_B=[{until:w=>w.ents[0].solids[2].on},wait(0.5),{r:1,j:1,p:1,t:0.6},{r:1,until:X(470)},{until:GR}];
const S2_C=[walk(X(520)),{until:w=>w.ents[0].solids[3].on},{r:1,until:w=>!w.P.ground},{r:1,until:X(610)},{until:GR}];
const S2_D=[{until:w=>w.ents[0].solids[5].on},wait(0.2),walk(X(670)),{r:1,j:1,p:1,t:0.6},{r:1,until:X(800)},{until:GR}];
// the failing tubes: jump when the tube ahead is dark or the one underfoot starts to flicker
const S4_SMART=(w,inp)=>{ const P=w.P, B=w.ents[1], C=w.ents[2]; inp.right=true; inp.press=false;
  if(w._j>0){ w._j-=1/120; inp.jump=true; return; } inp.jump=false;
  if(!P.ground) return;
  const ahead=P.x+30, tube=ahead>=480&&ahead<695?B:ahead>=695&&ahead<900?C:null, cur=P.x>=480&&P.x<695?B:P.x>=695&&P.x<900?C:null;
  if((tube&&!tube.lit)||(cur&&cur.flicker)){ inp.press=true; inp.jump=true; w._j=0.6; } };
// lap 2 helpers
const hops=n=>{ const s=[]; for(let i=0;i<n;i++) s.push({l:1,until:XL(30)},{r:1,until:X(120)}); return s; };
// the lab: the first night's route, freezing whenever a scan pass comes by
const beamNear=(w,ahead)=>{ const sc=w.ents[0]; if(sc.bx===null){ return sc.phase_==='warn'&&ahead>0; } const d=sc.bx-w.P.x; return sc.rev?(d>-40&&d<ahead+200):(d<40&&d>-(ahead+200)); };
const S5_BOT=(w,inp)=>{ const P=w.P, E=w.ents; inp.right=inp.left=inp.jump=false;
  if(w._j>0){ w._j-=1/120; inp.jump=true; inp.right=w._jr; return; }
  if(!P.ground){ inp.right=w._jr; return; }
  if(beamNear(w,0)) return;
  const L=E[1];
  if(P.x<235){ if(P.x<150){ inp.right=true; return; } if(!w._lg){ if(!(L.st==='cycle'&&!L.on&&L.tm%1.34>0.72&&L.tm%1.34<0.8)) return; w._lg=true; } inp.right=true; return; }
  // the lift jump sets off everything after it (arc, blocks): start it just as a pass ends
  if(P.x>=300&&P.x<330){ const sc=E[0], cyc=sc.warn+sc.sweep+sc.rest, ph=sc.tm%cyc; if(sc.phase_==='rest'&&ph<sc.warn+sc.sweep+0.15){ inp.press=inp.jump=true; w._j=0.6; w._jr=true; } return; }
  const B1=E[5], B2=E[6], SH=E[7], AR=E[4];
  if(P.x<600&&AR.st!=='done'&&AR.st!=='idle') return;
  // the blocks launch when you reach 540: only go right after a pass has finished
  if(B1.st==='idle'&&P.x>=500){ const sc=E[0]; if(!(sc.phase_==='rest'&&!w._go)) { if(!w._go) return; } w._go=true; }
  if(B1.st==='fly'&&B1.x<P.x+110&&B1.x>P.x){ inp.press=inp.jump=true; w._j=0.5; w._jr=false; return; }
  if(B1.st==='wait'||(B1.st==='fly'&&B1.x>P.x)) return;
  if(B2.st!=='done'&&B2.st!=='idle'&&P.x<700) return;
  if(P.x>=720&&SH.st!=='done'&&SH.st!=='idle') return;
  inp.right=true; };
const S6_GUST=w=>{ const p=w.ents[1].tm%4.8; return p>=0.1&&p<0.15; };
const S6_LAND={fn:(w,inp)=>{ inp.right=w.P.x<945; inp.left=w.P.x>951; },until:w=>w.cleared};
// once the lightning has locked on, brake if it's going to land ahead of you
const S6_STEER={fn:(w,i)=>{ const L=w.ents[2]; i.right=true; i.left=false;
  if(L.st==='aim'&&L.tm>=L.lock){ const ahead=L.target-w.P.x; if(ahead>-20&&ahead<160){ i.right=false; i.left=true; } } },until:GR};
const S6_GLIDE=[walk(X(150)),{until:S6_GUST},walk(X(248)),{r:1,j:1,p:1,t:0.6},S6_STEER];
const S6_HOP1=[{until:w=>w.ents[3].st==='fly'&&w.ents[3].x>w.P.x-110},{j:1,p:1,t:0.08},{until:w=>w.ents[3].st==='fly'&&w.ents[3].x>w.P.x+40}];
const S7_HOP=(w,inp)=>{ const c=w.ents[2]; inp.right=inp.left=false;
  if(w._j>0){ w._j-=1/120; inp.jump=true; return; }
  if(!w.P.ground) return;
  if(c.people.some(p=>p.s.on&&p.s.x<w.P.x+48&&p.s.x+26>w.P.x-10)){ inp.press=true; inp.jump=true; w._j=0.6; } };
const S7_PASSED=w=>w.ents[2].n>=6&&w.ents[2].people.every(p=>!p.s.on||p.s.x+26<w.P.x-12);
const S7_REST=[walk(X(555)),{until:w=>w.ents[1].tm>2.2},walk(X(602)),{l:1,until:XL(560)},{until:w=>w.ents[1].st==='done'},walk(X(990)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(1300)),{r:1,j:1,p:1,t:0.02},{r:1,until:GR},walk(X(2000)),{l:1,until:XL(1520)}];
const dodge=(w,inp)=>{ inp.right=true; if(w._jt>0){ w._jt-=1/120; inp.jump=w._jt>0; return; } if(!w.P.ground) return;
  for(const e of w.ents){ if(e.kind!=='pendulum') continue; const dx=e.bx()-w.P.x; if(e.by()>320&&dx>-10&&dx<130){ inp.press=true; inp.jump=true; w._jt=0.6; } } };
const S8_LEDGE=[{fn:dodge,until:X(570)},{until:GR},{l:1,until:XL(640)},wait(0.3),{until:w=>w.ents[1].ang<-0.3},walk(X(655)),{r:1,j:1,p:1,until:X(840)},{j:1,until:GR}];
const S9_SOL=[walk(X(405)),...jumpR(0.6),walk(X(690)),...jumpR(0.6),walk(X(985)),{until:w=>w.ents[2].s.x<1045},{r:1,j:1,p:1,t:0.3},{r:1,until:GR},walk(X(1100)),
  {until:w=>w.ents[2].s.x>1160},{r:1,j:1,p:1,until:X(1318)},{j:1,until:GR},{until:GR},wait(0.45),walk(X(1453)),wait(0.35),walk(X(1705)),...jumpR(0.6),walk(X(1860)),...jumpR(0.6),walk(X(2000)),walk(X(2470))];

const cases={
1:[
  ['jump over the clock',   'dead', [walk(w=>w.ents[0].st==='run'&&w.ents[0].x-w.P.x<110),{r:1,j:1,p:1,t:0.5},{r:1,until:GR},walk(X(2000))]],
  ['walk straight',         'dead', [walk(X(2000))]],
  ['from the checkpoint',   'clear',[walk(X(560)),wait(1.1),walk(X(2000))],{spawn:{x:520,y:420}}],
  ['walk under its hops',   'clear',[walk(X(250)),wait(1.1),walk(w=>w.ents[0].x<w.P.x-30),walk(X(560)),wait(1.1),walk(X(2000))]],
],
2:[
  ['take the first to appear','dead',[...S2_A,{until:w=>w.ents[0].solids[1].on},...hopTo(360,0.15,440),walk(X(2000))]],
  ['take the next one again','dead',[...S2_A,...S2_B,...S2_C,{until:w=>w.ents[0].solids[4].on},walk(X(680)),{r:1,j:1,p:1,t:0.02},{r:1,until:X(760)},{until:GR},walk(X(2000))]],
  ['wait too long',         'dead', [...S2_A,wait(4)]],
  ['wait a beat, go higher','clear',[...S2_A,...S2_B,...S2_C,...S2_D,{fn:(w,i)=>{ i.right=w.P.x<972; i.left=w.P.x>978; },until:w=>w.cleared}]],
],
3:[
  ['press on at the wrong beat','dead',[walk(X(240)),wait(0.95),walk(X(252)),{l:1,until:X(588)}]],
  ['keep reversing past the presses','dead',[walk(X(240)),wait(0.45),walk(X(252)),{l:1,until:X(546)},{l:1,t:1.5}]],
  ['solution',              'clear',[walk(X(240)),wait(0.45),walk(X(252)),{l:1,until:X(546)},walk(X(590)),...jumpR(0.6),walk(X(812)),...jumpR(0.6),{l:1,until:XL(921)},wait(0.2)]],
],
4:[
  ['walk straight across',  'dead', [walk(X(2000))]],
  ['walk across from the stone','dead',[walk(X(245)),wait(2.4),walk(X(445)),wait(0.6),walk(X(2000))]],
  ['from the checkpoint',   'clear',[wait(1.2),{fn:S4_SMART,until:X(2000)}],{spawn:{x:445,y:420}}],
  ['read both rhythms',     'clear',[walk(X(245)),wait(2.4),walk(X(445)),wait(0.6),{fn:S4_SMART,until:X(2000)}]],
],
5:[
  ['the first night\'s route','dead',[walk(X(150)),wait(0.05),{until:w=>w.ents[1].st==='cycle'&&!w.ents[1].on&&w.ents[1].tm%(1.34)>0.72&&w.ents[1].tm%1.34<0.8},walk(X(300)),...jumpR(0.6),{until:GR},{until:w=>w.ents[5].x<680},{j:1,p:1,t:0.5},{until:GR},{until:w=>w.ents[6].x<440},walk(X(740)),{until:w=>w.ents[7].st==='done'},walk(X(2000))]],
  ['hold still as it passes','clear',[{fn:S5_BOT,until:w=>w.cleared}]],
],
6:[
  ['run and jump at once',  'dead', [walk(X(248)),...jumpR(0.6),S6_LAND]],
  ['wait at the edge',      'dead', [walk(X(245)),wait(3),{r:1,until:GR},S6_LAND]],
  ['glide straight through the storm','dead',[walk(X(150)),{until:S6_GUST},walk(X(248)),{r:1,j:1,p:1,t:0.6},{r:1,until:GR},S6_LAND]],
  ['stand when you land',   'dead', [...S6_GLIDE,wait(3)]],
  ['brake, hop once, stay down','clear',[...S6_GLIDE,...S6_HOP1,{until:GR},{until:w=>w.ents[4].st==='done'||(w.ents[4].st==='fly'&&w.ents[4].x<w.P.x-60)},S6_LAND]],
],
7:[
  ['stand in the crowd',    'dead', [walk(X(270)),...jumpR(0.6),walk(X(430)),wait(8)]],
  ['wait at the platform edge','dead',[walk(X(270)),...jumpR(0.6),walk(X(430)),{fn:S7_HOP,until:S7_PASSED},walk(X(555)),{until:w=>w.ents[1].tm>2.2},walk(X(602)),{l:1,until:XL(560)},{until:w=>w.ents[1].st==='done'},walk(X(960)),wait(4)]],
  ['full jump into the ad', 'dead', [walk(X(270)),...jumpR(0.6),walk(X(430)),{fn:S7_HOP,until:S7_PASSED},walk(X(555)),{until:w=>w.ents[1].tm>2.2},walk(X(602)),{l:1,until:XL(560)},{until:w=>w.ents[1].st==='done'},walk(X(975)),...jumpR(0.6),walk(X(2000))]],
  ['hop and let them pass', 'clear',[walk(X(270)),...jumpR(0.6),walk(X(430)),{fn:S7_HOP,until:S7_PASSED},...S7_REST]],
],
8:[
  ['wait for the blade',    'dead', [walk(X(120)),wait(3),walk(X(640))]],
  ['leap without pacing',   'dead', [...S8_LEDGE,walk(X(870)),...jumpR(0.6),{until:GR},wait(0.1),{l:1,until:XL(1360)},{until:w=>w.ents[7].st==='rise'},walk(X(2000)),{l:1,until:XL(1300)}]],
  ['pace the ledge, then leap','clear',[...S8_LEDGE,{fn:(w,i)=>{ if(w.P.x>=868) w._pd=-1; if(w.P.x<=812) w._pd=1; w._pd=w._pd||-1; i.left=w._pd<0; i.right=w._pd>0; },until:w=>w.P.x>=866&&w._pd>0&&w.ents[9].ang>0.4},walk(X(870)),...jumpR(0.6),{until:GR},wait(0.1),{l:1,until:XL(1360)},{until:w=>w.ents[7].st==='rise'},walk(X(2000)),{l:1,until:XL(1300)}]],
],
9:[
  ['stop to look around',   'dead', [walk(X(300)),wait(2.5),walk(X(2470))]],
  ['keep moving',           'clear',S9_SOL],
],
10:[
  ['the way home',          'clear',[...S10_1,...S10_2,...S10_3,...S10_4,S10_DOOR]],
  ['take the first banner', 'dead', [...S10_1,{r:1,j:1,p:1,t:0.2},{r:1,until:X(2000)}]],
  ['from the checkpoint',   'clear',[walk(X(1385)),...S10_4,S10_DOOR],CP10],
  ['walk across the tubes', 'dead', [walk(X(4000))],CP10],
  ['ease off in the collapse','dead',[walk(X(1385)),...S10_4,walk(X(2300)),wait(0.2),S10_DOOR],CP10],
  ['stop before the door',  'dead', [walk(X(1385)),...S10_4,walk(X(2200)),wait(2)],CP10],
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
