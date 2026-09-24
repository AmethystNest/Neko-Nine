// Frame pacing: every display rate gets at least one update per frame, steps never
// exceed the physics limit, and simulated time matches real time.
require('../js/loop.js');
const {FramePacer}=globalThis.NEKO_LOOP;
let fail=0;
function check(name,ok,info){ if(!ok) fail++; console.log(`${ok?'OK  ':'FAIL'} ${name}${info?' '+info:''}`); }
for(const hz of [30,50,59.94,60,75,90,120,144,165,240]){
  const p=new FramePacer(1/120,0.05); p.reset(1000);
  let t=1000, sim=0, zero=0, maxH=0, frames=0;
  for(let i=0;i<hz*10;i++){
    t+=1000/hz*(1+(i%2?0.02:-0.02)); // alternating jitter like real browsers
    const steps=p.frame(t);
    if(!steps.length) zero++;
    for(const h of steps){ sim+=h; maxH=Math.max(maxH,h); }
    frames++;
  }
  const real=(t-1000)/1000;
  check(`${String(hz).padEnd(6)}Hz`, zero===0 && maxH<=1/120*1.03+1e-9 && Math.abs(sim-real)<0.02,
    `zero-step frames=${zero} maxStep=${(maxH*1000).toFixed(2)}ms sim=${sim.toFixed(3)}s real=${real.toFixed(3)}s`);
}
// A long hitch is clamped so the cat does not tunnel through traps.
{ const p=new FramePacer(1/120,0.05); p.reset(0); const s=p.frame(2000); const sum=s.reduce((a,b)=>a+b,0);
  check('hitch clamp', Math.abs(sum-0.05)<1e-9 && s.every(h=>h<=1/120*1.03+1e-9), `sum=${sum}`); }
console.log(fail?`${fail} FAILED`:'ALL PASS');
process.exit(fail?1:0);
