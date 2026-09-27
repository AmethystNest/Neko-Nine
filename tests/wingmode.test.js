// Rescue "wing mode" (World opts.wingMode): a mid-air double jump, and the first
// trap hit of the attempt is forgiven instead of killing. Off by default.
require('../js/engine.js');
const {World,G}=globalThis.NEKO_ENGINE;
let fail=0;
function check(name,ok,info){ if(!ok) fail++; console.log(`${ok?'OK  ':'FAIL'} ${name}${info?' '+info:''}`); }

function flatDef(hazard){
  return {
    width:500, spawn:{x:100,y:G},
    floors:[[0,500]],
    ents:(F,w)=>hazard?[F.SpikeRow({x:150,w:400,y:G,h:40})]:[]
  };
}

// --- double jump ---
for(const wing of [false,true]){
  const w=new World(flatDef(false), wing?{wingMode:true}:undefined);
  const inp={left:false,right:false,jump:true,press:true};
  const dt=1/120;
  w.step(dt,inp); inp.press=false; // first jump, off the ground
  for(let i=0;i<20;i++) w.step(dt,inp); // coast a while so a real second jump is unmistakable
  const vyBefore=w.P.vy;
  inp.press=true; w.step(dt,inp); inp.press=false; // second press, mid-air
  const jumped=w.P.vy<vyBefore-1 && w.P.vy<0;
  check(`double jump ${wing?'granted':'withheld'} as expected`, wing?jumped:!jumped,
    `vyBefore=${vyBefore.toFixed(1)} vyAfter=${w.P.vy.toFixed(1)}`);
}

// --- one-time trap shield ---
for(const wing of [false,true]){
  const w=new World(flatDef(true), wing?{wingMode:true}:undefined);
  const inp={left:false,right:true,jump:false,press:false};
  const dt=1/120;
  let hitOnce=false, survivedFirst=false;
  for(let i=0;i<1200 && !w.P.dead;i++){
    w.step(dt,inp);
    if(!hitOnce && w.shieldUsed){ hitOnce=true; survivedFirst=!w.P.dead; }
  }
  if(wing){
    check('wing mode forgives the first trap hit', hitOnce && survivedFirst, `hitOnce=${hitOnce} survivedFirst=${survivedFirst}`);
    check('wing mode still dies to the trap eventually', w.P.dead, `dead=${w.P.dead}`);
  }else{
    check('without wing mode the trap kills outright', w.P.dead && !hitOnce, `dead=${w.P.dead} hitOnce=${hitOnce}`);
  }
}
console.log(fail?`${fail} FAILED`:'ALL PASS');
process.exit(fail?1:0);
