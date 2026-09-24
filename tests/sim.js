// Headless stage simulator used to verify that every stage is clearable
// and that the intended first-time traps really kill.
require('../js/engine.js');
require('../js/stages.js');
const {World}=globalThis.NEKO_ENGINE;
const {STAGES}=globalThis.NEKO_STORY;

// script: array of steps {r,l,j,p,until(w)|t, name}
function run(idx,script,opts={}){
  const w=new World(STAGES[idx],opts.spawn?{spawn:opts.spawn}:undefined);
  const inp={left:false,right:false,jump:false,press:false};
  const dt=process.env.DT?1/+process.env.DT:1/120;
  let si=0, st=0, T=0;
  const log=[];
  while(T<(opts.maxT||40)){
    const cur=script[Math.min(si,script.length-1)];
    inp.left=!!cur.l; inp.right=!!cur.r; inp.jump=!!cur.j;
    if(cur.p && st===0) inp.press=true;
    if(cur.fn) cur.fn(w,inp,st);
    w.step(dt,inp);
    w.events.length=0;
    st+=dt; T+=dt;
    if(opts.trace && Math.round(T*120)%12===0) log.push(`${T.toFixed(2)} x=${w.P.x.toFixed(1)} y=${w.P.y.toFixed(1)} g=${w.P.ground} step=${si}`);
    if(w.P.dead) return {res:'dead',cause:w.P.cause,x:+w.P.x.toFixed(1),y:+w.P.y.toFixed(1),t:+T.toFixed(2),step:si,log};
    if(w.cleared) return {res:'clear',t:+T.toFixed(2),log};
    const done=cur.until?cur.until(w):(st>=(cur.t||0));
    if(done && si<script.length-1){ si++; st=0; }
  }
  return {res:'timeout',x:w.P.x,y:w.P.y,step:si,log};
}
const X=v=>w=>w.P.x>=v, XL=v=>w=>w.P.x<=v, GR=w=>w.P.ground;
module.exports={run,X,XL,GR,STAGES};
