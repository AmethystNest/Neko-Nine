// Neko Nine engine: physics, collision and trap logic.
// No DOM access here, so the same code runs in the browser and in the headless stage tests.
(function(root){
'use strict';

const G=420;          // floor top
const WH=560;         // world height
const VIEW_W=1000;    // visible world width

// Player physics: the approved Stage1-5 values.
const CFG={
  speed:230, accel:1200, airAccel:720, friction:1380, airFriction:300,
  gravity:1450, jump:740, maxFall:800, cutGravity:1.4,
  halfW:9, bodyH:46,
  hurtHalfW:6.5, hurtHead:13, hurtTop:40, hurtBottom:3,
  coyote:0.08, jumpBuffer:0.11,
  walkFPS:10
};
const HW=CFG.halfW, BH=CFG.bodyH;

const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const approach=(v,t,d)=>v<t?Math.min(v+d,t):v>t?Math.max(v-d,t):t;

function ovPlayer(P,s){
  return P.x-HW<s.x+s.w && P.x+HW>s.x && P.y-BH<s.y+s.h && P.y>s.y;
}
function hurtHit(P,h){
  // The head sticks out in front of the body, so the hurtbox reaches a bit further forward.
  const f=P.facing>=0?1:-1;
  const l=f>0?P.x-CFG.hurtHalfW:P.x-CFG.hurtHead, r=f>0?P.x+CFG.hurtHead:P.x+CFG.hurtHalfW, t=P.y-CFG.hurtTop, b=P.y-CFG.hurtBottom;
  if(h.r!==undefined){
    const cx=clamp(h.x,l,r), cy=clamp(h.y,t,b);
    const dx=h.x-cx, dy=h.y-cy;
    return dx*dx+dy*dy<h.r*h.r;
  }
  return l<h.x+h.w && r>h.x && t<h.y+h.h && b>h.y;
}

// ---------------------------------------------------------------------------
// World
// ---------------------------------------------------------------------------
class World{
  constructor(def,opts){
    this.def=def;
    this.opts=opts||{};
    this.events=[];
    this.reset();
  }
  reset(){
    const d=this.def;
    this.W=d.width||1000;
    this.H=WH;
    this.G=G;
    this.t=0;
    this.cleared=false;
    this.clearT=0;
    this.flags={};
    const sp=this.opts.spawn||d.spawn||{x:110,y:G};
    this.P={x:sp.x,y:sp.y,vx:0,vy:0,facing:1,ground:true,ref:null,
      dead:false,deadT:0,cause:'',frame:0,anim:0,land:0,
      jumpT:0,jumpX:sp.x,coyote:0,jbuf:0,air:0,squash:0};
    this.statics=[];
    for(const f of d.floors||[]){
      const top=f[2]===undefined?G:f[2];
      this.statics.push({x:f[0],y:top,w:f[1]-f[0],h:WH+400-top,kind:'floor',style:f[3]||'floor'});
    }
    this.ents=d.ents?d.ents(F,this):[];
    this.ents.forEach((e,i)=>{ e.idx=i; e.init && e.init(this); for(const s of e.solids) s.owner=e; });
    this.S=this.collect();
    for(const s of this.S){ s.px=s.x; s.py=s.y; s.dx=0; s.dy=0; }
    this.goal=d.goal?Object.assign({w:42,h:82},d.goal):null;
    // Settle the spawn onto the ground.
    this.probe();
  }
  emit(type,data){ this.events.push(Object.assign({type},data||{})); }
  se(name){ this.emit('se',{name}); }
  shake(a){ this.emit('shake',{a}); }
  collect(){
    const out=this.statics.slice();
    for(const e of this.ents){
      if(!e.solids) continue;
      for(const s of e.solids){ s.owner=e; if(s.on!==false) out.push(s); }
    }
    return out;
  }
  kill(cause,killer){
    const P=this.P;
    if(P.dead||this.cleared) return;
    if(!killer && cause==='fall' && P.lastRef && P.lastRef.owner) killer=P.lastRef.owner;
    this.killer=killer&&killer.idx!==undefined?killer.idx:-1;
    P.dead=true; P.deadT=0; P.cause=cause||'trap';
    P.vx=0; P.vy=0; P.ground=false; P.ref=null;
    this.se('death');
    this.emit('death',{cause:P.cause,x:P.x,y:P.y,killer:this.killer});
  }
  probe(){
    const P=this.P;
    let best=null;
    for(const s of this.S){
      if(s.hidden) continue;
      if(Math.abs(s.y-P.y)<=2 && P.x+HW>s.x && P.x-HW<s.x+s.w){
        if(!best || s.kin) best=s;
      }
    }
    if(best){ P.y=best.y; P.ground=true; P.ref=best; P.vy=0; return true; }
    return false;
  }
  anyOverlap(except,shrink){
    const P=this.P;
    const r={x:P.x-HW+shrink,y:P.y-BH+shrink,w:HW*2-shrink*2,h:BH-shrink*2};
    for(const s of this.S){
      if(s===except||s.hidden) continue;
      if(r.x<s.x+s.w && r.x+r.w>s.x && r.y<s.y+s.h && r.y+r.h>s.y) return s;
    }
    return null;
  }

  step(dt,inp){
    const P=this.P;
    this.t+=dt;

    if(this.cleared){
      this.clearT+=dt;
      for(const e of this.ents) e.update && e.alwaysUpdate && e.update(this,dt);
      this.animate(dt,0);
      return;
    }

    // --- entities (traps) update; solids record their motion this frame ---
    for(const s of this.S){ s.px=s.x; s.py=s.y; }
    // any trap guarding the exit may lock the door this frame
    if(this.goal) this.goal.locked=false;
    for(const e of this.ents) e.update && e.update(this,dt);
    this.S=this.collect();
    for(const s of this.S){
      if(s.px===undefined){ s.px=s.x; s.py=s.y; }
      s.dx=s.x-s.px; s.dy=s.y-s.py;
    }

    if(P.dead){
      P.deadT+=dt;
      return;
    }

    // --- carry: standing on a moving (kinematic) solid ---
    if(P.ground && P.ref && P.ref.kin && P.ref.on!==false && this.S.includes(P.ref)){
      P.x+=P.ref.dx; P.y+=P.ref.dy;
    }

    // --- push: moving solids shove the cat; being squeezed is death ---
    for(const s of this.S){
      if(!s.kin || s.hidden || (!s.dx && !s.dy)) continue;
      if(!ovPlayer(P,s)) continue;
      let vert=false;
      const ox=Math.min(P.x+HW,s.x+s.w)-Math.max(P.x-HW,s.x);
      if(s.dy<0 && P.y<=s.py+1.5+Math.abs(s.dx)){
        P.y=s.y; P.vy=Math.min(P.vy,0); if(!P.ground){ P.ground=true; } P.ref=s; P.vy=0;
      }else if(s.dy>0 && P.y-BH>=s.py+s.h-1.5-Math.abs(s.dx) && ox>8){
        P.y=s.y+s.h+BH; if(P.vy<0) P.vy=0; vert=true;
        if(P.ground && P.ref && !P.ref.kin){ /* pinned to floor: crush check below */ }
      }else if(s.dx>0 && (P.x-HW>=s.px+s.w-1.5 || s.dy>0)){
        P.x=s.x+s.w+HW; if(P.vx<0) P.vx=0;
      }else if(s.dx<0 && (P.x+HW<=s.px+1.5 || s.dy>0)){
        P.x=s.x-HW; if(P.vx>0) P.vx=0;
      }else if(s.dy>0){
        // Small sideways overlap with a descending press: slide out instead of dying.
        if(P.x<s.x+s.w/2) P.x=s.x-HW; else P.x=s.x+s.w+HW;
      }else{
        const l=(P.x+HW)-s.x, r=(s.x+s.w)-(P.x-HW);
        if(l<r) P.x-=l; else P.x+=r;
      }
      // A press coming down is lethal as soon as the cat is pinned, even by a sliver.
      const other=this.anyOverlap(s,vert?0.05:1.2);
      if(other){ this.kill('crush',s.owner); this.emit('squash',{}); this.shake(9); return; }
    }

    // --- input ---
    let dir=0;
    if(inp.left&&!inp.right) dir=-1;
    if(inp.right&&!inp.left) dir=1;
    if(inp.press){ P.jbuf=CFG.jumpBuffer; }
    inp.press=false;

    const turned=dir!==0 && dir!==P.facing;
    if(dir!==0){
      if(turned) P.anim=0;
      P.facing=dir;
      P.vx=approach(P.vx,dir*CFG.speed,(P.ground?CFG.accel:CFG.airAccel)*dt);
    }else{
      P.vx=approach(P.vx,0,(P.ground?CFG.friction:CFG.airFriction)*dt);
    }

    if(P.jbuf>0 && (P.ground || P.coyote>0)){
      P.vy=-CFG.jump; P.ground=false; P.ref=null; P.coyote=0; P.jbuf=0;
      P.jumpX=P.x; P.jumpT=0; P.land=0;
      this.se('jump');
      this.emit('jump',{x:P.x,y:P.y});
    }
    P.jbuf=Math.max(0,P.jbuf-dt);
    P.coyote=Math.max(0,P.coyote-dt);

    if(!P.ground){
      if(P.vy>=0) P.boost=false;
      if(!inp.jump && !P.boost && P.vy<-180) P.vy+=CFG.gravity*CFG.cutGravity*dt;
      P.vy=Math.min(CFG.maxFall,P.vy+CFG.gravity*dt);
      P.jumpT+=dt; P.air+=dt;
    }else{
      P.air=0;
    }

    // --- external drift (wind, conveyors) ---
    let drift=0;
    for(const e of this.ents) if(e.drift) drift+=e.drift(this)||0;

    // --- move X ---
    const ox=P.x;
    P.x+=(P.vx+drift)*dt;
    for(const s of this.S){
      if(s.hidden || !ovPlayer(P,s)) continue;
      // Step up onto low ledges (springs, kerbs) instead of being stopped by them.
      if(P.ground && s.y>=P.y-16 && s.y<P.y){
        const oy0=P.y; P.y=s.y;
        if(!this.anyOverlap(null,0.5)){ P.ref=s; continue; }
        P.y=oy0;
      }
      if(P.x>=ox && ox+HW<=s.x+0.5+Math.max(0,-s.dx)){ P.x=s.x-HW; if(P.vx>0)P.vx=0; }
      else if(P.x<=ox && ox-HW>=s.x+s.w-0.5-Math.max(0,s.dx)){ P.x=s.x+s.w+HW; if(P.vx<0)P.vx=0; }
    }
    P.x=clamp(P.x,12,this.W-12);

    // --- move Y ---
    const oy=P.y;
    const wasGround=P.ground;
    P.y+=P.vy*dt;
    let landedOn=null;
    for(const s of this.S){
      if(s.hidden){
        if(P.vy<0 && oy-BH>=s.y+s.h-0.5 && ovPlayer(P,s)){
          s.hidden=false; s.revealed=true;
          P.y=s.y+s.h+BH; P.vy=0;
          this.se('trap'); this.emit('bonk',{x:P.x,y:s.y+s.h}); this.shake(3);
        }
        continue;
      }
      if(!ovPlayer(P,s)) continue;
      if(P.vy>=0 && oy<=s.y+0.02+Math.max(0,-s.dy)){
        P.y=s.y; P.vy=0; landedOn=s;
      }else if(P.vy<0 && oy-BH>=s.y+s.h-0.5-Math.max(0,s.dy)){
        P.y=s.y+s.h+BH; P.vy=0; this.emit('bonk',{x:P.x,y:s.y+s.h});
      }else{
        const l=(P.x+HW)-s.x, r=(s.x+s.w)-(P.x-HW);
        if(l<r) P.x-=l; else P.x+=r;
      }
    }
    if(landedOn){
      if(!wasGround){
        P.land=.08; this.se('land'); this.emit('land',{x:P.x,y:P.y,v:P.air});
      }
      P.ground=true; P.ref=landedOn;
    }else if(P.ground){
      if(!this.probe()){ P.ground=false; P.ref=null; P.coyote=CFG.coyote; }
    }

    // --- hazards ---
    for(const e of this.ents){
      if(!e.hazards) continue;
      const hs=e.hazards(this);
      if(!hs) continue;
      for(const h of hs){
        if(hurtHit(P,h)){ this.kill(e.cause||e.kind||'trap',e); if(e.onKill) e.onKill(this); return; }
      }
    }

    if(P.ground && P.ref) P.lastRef=P.ref;
    if(P.y>WH+30){ this.kill('fall'); return; }

    // --- goal ---
    if(this.goal && P.ground && !this.goal.locked && Math.abs(P.x-this.goal.x)<=12){
      P.x=this.goal.x; P.vx=0; P.frame=0; P.anim=0;
      this.cleared=true; this.clearT=0;
      this.se('goal');
      this.emit('clear',{});
    }

    this.animate(dt,dir);
  }

  animate(dt,dir){
    const P=this.P;
    P.land=Math.max(0,P.land-dt);
    const turned=false;
    if(P.ground&&(dir!==0||Math.abs(P.vx)>8)&&P.land<=0){
      P.anim+=dt;
      const ft=1/CFG.walkFPS;
      while(P.anim>=ft){ P.anim-=ft; P.frame=(P.frame+1)%4; }
    }else{
      P.anim=0;
      if(P.ground&&Math.abs(P.vx)<=8) P.frame=0;
    }
  }
}

// ---------------------------------------------------------------------------
// Trap kinds. Each one owns its solids / hazards. Drawing is added in render.js.
// ---------------------------------------------------------------------------
class Ent{
  constructor(o){
    this.solids=[];
    this.st='idle';
    this.tm=0;
    Object.assign(this,o);
  }
  triggered(w){
    const P=w.P;
    if(P.dead) return false;
    if(this.armed && !this.armed(w,this)) return false;
    if(this.when) return this.when(w,this);
    if(this.tx!==undefined) return P.x>=this.tx;
    return false;
  }
}

// Static solid platform / obstacle.
class Block extends Ent{
  init(){ this.kind='block'; this.solids=[{x:this.x,y:this.y,w:this.w,h:this.h,style:this.style||'block'}]; }
}

// Floor section that opens. dir 'lr': hole spreads left->right. 'rl': right->left.
// trigger: 'stand' (default) or pass x (tx) or custom when().
class TrapFloor extends Ent{
  init(w){
    this.kind='trapdoor';
    this.y=this.y===undefined?G:this.y;
    this.open=0;
    this.dir=this.dir||'lr';
    this.delay=this.delay===undefined?0.1:this.delay;
    this.speed=this.speed||720;
    this.inset=this.inset===undefined?10:this.inset;
    this.s={x:this.x,y:this.y,w:this.w,h:WH+400-this.y,kind:'floor',style:this.style||'floor'};
    this.solids=[this.s];
  }
  update(w,dt){
    const P=w.P;
    if(this.st==='idle'){
      let go=false;
      if(this.when||this.tx!==undefined) go=this.triggered(w);
      else go=!P.dead && P.ground && P.ref===this.s && P.x>this.x+this.inset && P.x<this.x+this.w-this.inset && (!this.armed||this.armed(w,this));
      if(go){ this.st='wait'; this.tm=0; }
    }
    if(this.st==='wait'){
      this.tm+=dt;
      if(this.tm>=this.delay){ this.st='opening'; w.se(this.se||'trapdoor'); w.emit('trapfloor',{x:this.x,w:this.w,y:this.y,style:this.style}); }
    }
    if(this.st==='opening'){
      this.open=Math.min(this.w,this.open+this.speed*dt);
      if(this.open>=this.w) this.st='open';
    }
    const rem=this.w-this.open;
    if(rem<=0.5){ this.s.on=false; }
    else if(this.dir==='lr'){ this.s.x=this.x+this.open; this.s.w=rem; }
    else if(this.dir==='rl'){ this.s.x=this.x; this.s.w=rem; }
    else { // 'mid': splits from the centre (drawn as two leaves; collision uses the smaller of both sides)
      this.s.x=this.x; this.s.w=rem; this.s.on=this.open<4;
    }
  }
}

// Stage 1: a visible pit that slides to where you are about to land.
class ShiftPit extends Ent{
  init(){
    this.kind='pit';
    this.p0=this.px;
    this.target=this.px;
    this.done=false;
    this.speed=this.speed||760;
    this.L={x:this.x0,y:G,w:this.px-this.x0,h:WH+400-G,kind:'floor'};
    this.R={x:this.px+this.pw,y:G,w:this.x1-(this.px+this.pw),h:WH+400-G,kind:'floor'};
    this.solids=[this.L,this.R];
  }
  update(w,dt){
    const P=w.P;
    if(!this.done && !P.dead && !P.ground && P.vx>0 &&
       P.jumpX>=this.p0-this.look && P.jumpX<=this.p0+16 &&
       P.x>=this.p0+(this.trigIn||10)){
      const g=CFG.gravity, vy=P.vy, dy=G-P.y;
      const t=(-vy+Math.sqrt(Math.max(0,vy*vy+2*g*dy)))/g;
      const land=P.x+P.vx*t;
      this.target=clamp(land-this.pw/2,this.p0+this.minShift,this.p0+this.maxShift);
      this.done=true;
      w.se('pitshift');
    }
    if(this.px!==this.target){
      this.px=this.px<this.target?Math.min(this.target,this.px+this.speed*dt):Math.max(this.target,this.px-this.speed*dt);
    }
    this.L.w=this.px-this.x0;
    this.R.x=this.px+this.pw; this.R.w=this.x1-this.R.x;
  }
}

// Floor slab that drops away (optionally cracks first).
class DropFloor extends Ent{
  init(){
    this.kind='dropfloor';
    this.y0=this.y===undefined?G:this.y;
    this.y=this.y0;
    this.vy=0;
    this.delay=this.delay===undefined?0.14:this.delay;
    this.thick=this.thick||(this.y0===G?WH+400-G:22);
    this.s={x:this.x,y:this.y0,w:this.w,h:this.thick,kind:'floor',style:this.style||'floor'};
    this.solids=[this.s];
    this.inset=this.inset===undefined?10:this.inset;
  }
  update(w,dt){
    const P=w.P;
    if(this.st==='idle'){
      const go=(this.when||this.tx!==undefined)?this.triggered(w):
        (!P.dead && P.ground && P.ref===this.s && P.x>this.x+this.inset && P.x<this.x+this.w-this.inset);
      if(go){ this.st='wait'; this.tm=0; if(this.crack) w.se('warn'); }
    }
    if(this.st==='wait'){
      this.tm+=dt;
      if(this.tm>=this.delay){
        this.st='fall';
        this.s.kin=true;
        this.s.h=22;
        w.se(this.se||'dropfloor');
        w.emit('crumble',{x:this.x,w:this.w,y:this.y0,style:this.style});
        w.shake(this.crack?4:2);
      }
    }
    if(this.st==='fall'){
      if(this.gravity){ this.vy=Math.min(900,this.vy+this.gravity*dt); }
      else this.vy=this.speed||520;
      this.y+=this.vy*dt;
      this.s.y=this.y;
      if(this.y>WH+60){ this.st='gone'; this.s.on=false; }
    }
  }
}

// Ceiling press. cycles: number of drops (Infinity = periodic).
class Crusher extends Ent{
  init(){
    this.kind='crusher';
    this.ceil=this.ceil===undefined?90:this.ceil;
    this.floor=this.floor===undefined?G:this.floor;
    this.restY=this.ceil-this.h;
    this.y=this.restY;
    this.fallSpeed=this.fallSpeed||920;
    this.riseSpeed=this.riseSpeed||430;
    this.hold=this.hold===undefined?0.55:this.hold;
    this.delay=this.delay===undefined?0.22:this.delay;
    this.cycles=this.cycles||1;
    this.count=0;
    this.s={x:this.x,y:this.y,w:this.w,h:this.h,kin:true,kind:'crusher',on:false};
    this.solids=[this.s];
    if(this.period){ this.st='cycle'; this.tm=-(this.phase||0); }
  }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='wait'; this.tm=0; } }
    else if(this.st==='cycle'){
      this.tm+=dt;
      if(this.tm>=0){ this.st='fall'; }
    }
    if(this.st==='wait'){ this.tm+=dt; if(this.tm>=this.delay){ this.st='fall'; if(this.warnSE) w.se(this.warnSE); } }
    else if(this.st==='fall'){
      this.y=Math.min(this.floor-this.h,this.y+this.fallSpeed*dt);
      if(this.y>=this.floor-this.h){ this.st='hold'; this.tm=0; w.se('crusher'); w.shake(this.big?10:6); w.emit('impact',{x:this.x+this.w/2,y:this.floor,w:this.w}); }
    }else if(this.st==='hold'){
      this.tm+=dt; if(this.tm>=this.hold) this.st='rise';
    }else if(this.st==='rise'){
      this.y=Math.max(this.restY,this.y-this.riseSpeed*dt);
      if(this.y<=this.restY){
        this.count++;
        if(this.period){ this.st='cycle'; this.tm=-(this.period-(this.fallDur()+this.hold+this.riseDur())); }
        else this.st=this.count<this.cycles?'idle':'done';
      }
    }
    this.s.y=this.y;
    this.s.on=this.y+this.h>this.ceil+0.5;
    // a press guarding the exit keeps the door shut until it has come down
    if(this.lockGoal && w.goal && (this.st==='wait'||this.st==='fall')) w.goal.locked=true;
  }
  fallDur(){ return (this.floor-this.h-this.restY)/this.fallSpeed; }
  riseDur(){ return (this.floor-this.h-this.restY)/this.riseSpeed; }
}

// Object that falls from above. solid: becomes a platform after landing; else shatters.
class FallBlock extends Ent{
  init(){
    this.kind='fallblock';
    this.y=this.y0;
    this.vy=0;
    this.delay=this.delay===undefined?0.18:this.delay;
    this.landY=this.landY===undefined?G:this.landY;
    if(this.solid){
      this.s={x:this.x,y:this.y,w:this.w,h:this.h,kin:true,kind:'block',on:!this.hidden};
      this.solids=[this.s];
    }
  }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='wait'; this.tm=0; if(this.warnSE) w.se(this.warnSE); } }
    if(this.st==='wait'){ this.tm+=dt; if(this.tm>=this.delay){ this.st='fall'; if(this.s) this.s.on=true; } }
    else if(this.st==='fall'){
      if(this.speed) this.vy=this.speed; else this.vy=Math.min(1400,this.vy+(this.gravity||2600)*dt);
      this.y+=this.vy*dt;
      if(this.y+this.h>=this.landY){
        this.y=this.landY-this.h;
        this.st='landed';
        w.se(this.landSE||'blockfall');
        w.shake(this.solid?7:3);
        w.emit('impact',{x:this.x+this.w/2,y:this.landY,w:this.w,style:this.style});
        if(!this.solid) this.st='broken';
      }
    }
    if(this.s) this.s.y=this.y;
  }
  hazards(){
    if(this.st==='fall' && !this.solid) return [{x:this.x,y:this.y,w:this.w,h:this.h}];
    return null;
  }
}

// Spikes rising out of the floor (or down from a ceiling).
class Spikes extends Ent{
  init(){
    this.kind='spike';
    this.h=this.always?this.maxH:0;
    this.y=this.y===undefined?G:this.y;
    this.dirn=this.dirn||'up';
    this.delay=this.delay===undefined?0.12:this.delay;
    this.riseSpeed=this.riseSpeed||300;
    this.fallSpeed=this.fallSpeed||220;
    if(this.always) this.st='active';
  }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='wait'; this.tm=0; } }
    if(this.st==='wait'){ this.tm+=dt; if(this.tm>=this.delay){ this.st='rise'; w.se('spike'); w.shake(2); } }
    else if(this.st==='rise'){
      this.h=Math.min(this.maxH,this.h+this.riseSpeed*dt);
      if(this.h>=this.maxH){ this.st=this.permanent?'active':'hold'; this.tm=0; }
    }else if(this.st==='hold'){
      this.tm+=dt; if(this.tm>=(this.hold===undefined?0.48:this.hold)) this.st='lower';
    }else if(this.st==='lower'){
      this.h=Math.max(0,this.h-this.fallSpeed*dt); if(this.h<=0) this.st=this.repeat?'idle':'done';
    }
  }
  hazards(){
    if(this.h<8) return null;
    const inset=this.w>30?4:2;
    if(this.dirn==='up') return [{x:this.x+inset,y:this.y-this.h+6,w:this.w-inset*2,h:this.h-6}];
    return [{x:this.x+inset,y:this.y,w:this.w-inset*2,h:this.h-6}];
  }
}

// Projectile crossing the screen horizontally (arrow, sliding block, crow...).
class Shot extends Ent{
  init(w){
    this.kind='shot';
    this.from=this.from||'left';
    this.delay=this.delay===undefined?0.12:this.delay;
    this.x=this.from==='left'?(this.x0===undefined?-80:this.x0):(this.x0===undefined?w.W+80:this.x0);
    this.vyAmp=this.vyAmp||0;
  }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='wait'; this.tm=0; if(this.warnSE) w.se(this.warnSE); } }
    if(this.st==='wait'){ this.tm+=dt; if(this.tm>=this.delay){ this.st='fly'; this.ft=0; w.se(this.se||'arrow'); } }
    else if(this.st==='fly'){
      this.ft+=dt;
      this.x+=(this.from==='left'?1:-1)*this.speed*dt;
      if(this.x<-300||this.x>w.W+300) this.st='done';
    }
    // a shot guarding the exit keeps the door shut until it has passed the cat
    if(this.lockGoal && w.goal){
      const ahead=this.from==='left'?this.x-this.w/2<w.P.x+CFG.hurtHead:this.x+this.w/2>w.P.x-CFG.hurtHead;
      if(this.st==='wait'||(this.st==='fly'&&ahead)) w.goal.locked=true;
    }
  }
  cy(){ return this.y+(this.dive?Math.max(0,this.dive*Math.sin(Math.min(Math.PI,this.ft*this.diveRate))):0); }
  hazards(){
    if(this.st!=='fly') return null;
    const y=this.cy();
    return [{x:this.x-this.w/2,y:y-this.h/2,w:this.w,h:this.h}];
  }
}

// Vertical laser fence with charge-up.
class Laser extends Ent{
  init(){
    this.kind='laser';
    this.on=false;
    this.warm=this.warm===undefined?0.28:this.warm;
    this.onT=this.onT||0.72;
    this.offT=this.offT||0.62;
    this.width=this.width||10;
    if(this.always){ this.st='cycle'; this.tm=this.phase||0; }
  }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='warm'; this.tm=0; w.se('lasercharge'); } }
    else if(this.st==='warm'){ this.tm+=dt; if(this.tm>=this.warm){ this.st='cycle'; this.tm=0; } }
    else if(this.st==='cycle'){
      this.tm+=dt;
      const was=this.on;
      const ph=this.tm%(this.onT+this.offT);
      this.on=ph<this.onT;
      this.charging=!this.on && ph>this.onT+this.offT-0.25;
      if(this.on&&!was && this.near(w)) w.se('laser');
    }
  }
  near(w){ return Math.abs(w.P.x-this.x)<420; }
  hazards(){
    if(!this.on) return null;
    return [{x:this.x-this.width/2,y:this.y0,w:this.width,h:this.y1-this.y0}];
  }
}

// Floor plate that lifts the cat into the ceiling.
class Lift extends Ent{
  init(){
    this.kind='lift';
    this.y=G;
    this.delay=this.delay||0;
    this.s={x:this.x,y:G,w:this.w,h:14,kin:true,kind:'lift'};
    this.solids=[this.s];
  }
  update(w,dt){
    const P=w.P;
    if(this.st==='idle'){
      if(!P.dead && P.ground && P.x+HW>this.x+2 && P.x-HW<this.x+this.w-2 && Math.abs(P.y-G)<2){ this.st='wait'; this.tm=0; w.se('wallmove'); }
    }
    if(this.st==='wait'){ this.tm+=dt; if(this.tm>=this.delay) this.st='rise'; }
    else if(this.st==='rise'){
      this.y=Math.max(G-this.rise,this.y-this.speed*dt);
      if(this.y<=G-this.rise) this.st='up';
    }
    this.s.y=this.y;
  }
}

// Electric column erupting from the floor.
class Arc extends Ent{
  init(){ this.kind='electric'; this.h=0; this.delay=this.delay===undefined?0.32:this.delay; }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='wait'; this.tm=0; } }
    if(this.st==='wait'){ this.tm+=dt; if(this.tm>=this.delay){ this.st='rise'; w.se('electric'); w.shake(3); } }
    else if(this.st==='rise'){ this.h=Math.min(this.maxH,this.h+this.riseSpeed*dt); if(this.h>=this.maxH){ this.st='active'; this.tm=0; } }
    else if(this.st==='active'){ this.tm+=dt; if(this.tm>=this.hold){ this.st='done'; this.h=0; } }
  }
  hazards(){ return this.h>8?[{x:this.x-this.w/2,y:G-this.h,w:this.w,h:this.h}]:null; }
}

// Heavy gate dropping from the ceiling; reopens partially.
class Shutter extends Ent{
  init(){
    this.kind='shutter';
    this.top=this.top===undefined?90:this.top;
    this.gh=G-this.top;
    this.bottom=this.top;
    this.s={x:this.x,y:this.top-this.gh,w:this.w,h:this.gh,kin:true,kind:'shutter',on:false};
    this.solids=[this.s];
  }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='wait'; this.tm=0; } }
    if(this.st==='wait'){ this.tm+=dt; if(this.tm>=this.delay){ this.st='drop'; w.se('shutter'); } }
    else if(this.st==='drop'){
      this.bottom=Math.min(G,this.bottom+this.dropSpeed*dt);
      if(this.bottom>=G){ this.st='closed'; this.tm=0; w.se('crusher'); w.shake(6); w.emit('impact',{x:this.x+this.w/2,y:G,w:this.w}); }
    }else if(this.st==='closed'){ this.tm+=dt; if(this.tm>=this.holdClosed){ this.st='open'; w.se('shutter'); } }
    else if(this.st==='open'){ this.bottom=Math.max(G-this.gap,this.bottom-this.riseSpeed*dt); if(this.bottom<=G-this.gap) this.st='done'; }
    this.s.on=this.bottom>this.top+1;
    this.s.y=this.bottom-this.gh;
  }
}

// Wall that rises from the floor and charges at the cat.
class ChaseWall extends Ent{
  init(){
    this.kind='wall';
    this.x=this.startX; this.rise=0;
    this.s={x:this.x,y:G,w:this.w,h:this.h+60,kin:true,kind:'wall',on:false};
    this.solids=[this.s];
  }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='rise'; w.se('wallmove'); w.shake(3); } }
    else if(this.st==='rise'){ this.rise=Math.min(this.h,this.rise+this.riseSpeed*dt); if(this.rise>=this.h) this.st='move'; }
    else if(this.st==='move'){
      this.x=Math.max(this.minX,this.x-this.speed*dt);
      if(this.x<=this.minX){ this.st='stop'; w.se('crusher'); w.shake(5); w.flags[this.flag||'wallDone']=true; }
    }
    this.s.on=this.rise>0;
    this.s.x=this.x; this.s.y=G-this.rise;
  }
}

// Lightning strike aimed at the cat.
class Lightning extends Ent{
  init(){ this.kind='lightning'; this.tx0=0; this.shots=0; this.strikeT=-1; }
  update(w,dt){
    const P=w.P;
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='aim'; this.tm=0; w.emit('flash',{a:.35}); w.se('warn'); } }
    else if(this.st==='aim'){
      this.tm+=dt;
      if(this.tm<this.lock){ this.target=P.x+(this.predict?P.vx*(this.strike-this.tm):0); }
      if(this.tm>=this.strike){ this.st='strike'; this.tm=0; w.se('electric'); w.emit('flash',{a:.9}); w.shake(8); w.emit('impact',{x:this.target,y:G,w:30,style:'spark'}); }
    }else if(this.st==='strike'){
      this.tm+=dt;
      if(this.tm>=0.2){
        this.shots++;
        if(this.shots<(this.count||1)){ this.st='aim'; this.tm=this.lock-(this.interval||0.6); }
        else this.st='done';
      }
    }
  }
  hazards(){
    if(this.st==='strike' && this.tm<0.14) return [{x:this.target-this.width/2,y:0,w:this.width,h:G}];
    return null;
  }
}

// Wind gusts that push the cat.
class Wind extends Ent{
  init(){ this.kind='wind'; this.active=false; this.tm=this.phase||0; this.alwaysUpdate=true; }
  update(w,dt){
    this.tm+=dt;
    const ph=this.tm%(this.onT+this.offT);
    const was=this.active;
    this.active=ph<this.onT;
    this.level=this.active?Math.min(1,ph/0.15):Math.max(0,1-(ph-this.onT)/0.25);
    if(this.active&&!was) w.emit('gust',{});
    w.flags.wind=this.level*Math.sign(this.v);
  }
  drift(w){
    const P=w.P;
    if(P.x<this.x0||P.x>this.x1) return 0;
    return this.v*this.level*(P.ground?0.35:1);
  }
}

// Moving walkway. Optionally reverses when the cat reaches rx.
class Conveyor extends Ent{
  init(){ this.kind='conveyor'; this.cur=this.v; this.off=0; this.alwaysUpdate=true; }
  update(w,dt){
    if(this.rx!==undefined && !this.reversed && !w.P.dead && w.P.x>=this.rx && w.P.ground){ this.reversed=true; w.se('shutter'); w.shake(2); }
    const tgt=this.reversed?this.rv:this.v;
    this.cur=approach(this.cur,tgt,900*dt);
    this.off+=this.cur*dt;
  }
  drift(w){
    const P=w.P;
    if(P.vy<0 || Math.abs(P.y-(this.y===undefined?G:this.y))>6) return 0;
    if(P.x+HW+3<=this.x||P.x-HW-3>=this.x+this.w) return 0;
    return this.cur;
  }
}

// Invisible block, solid only when hit from below (then revealed).
class Bonk extends Ent{
  init(){ this.kind='bonk'; this.s={x:this.x,y:this.y,w:this.w,h:this.h,hidden:true,kind:'bonk',style:this.style||'brick'}; this.solids=[this.s]; }
}

// Spring pad.
class Spring extends Ent{
  init(){ this.kind='spring'; this.s={x:this.x,y:G-14,w:this.w,h:14+400,kind:'spring'}; this.solids=[this.s]; this.squash=0; }
  update(w,dt){
    const P=w.P;
    this.squash=Math.max(0,this.squash-dt*4);
    if(!P.dead && P.ground && P.ref===this.s){
      P.vy=-this.power; P.boost=true; P.ground=false; P.ref=null; P.jumpX=P.x; P.jumpT=0;
      this.squash=1; w.se('jump'); w.se('trapdoor'); this.used=true;
    }
  }
}

// Swinging blade.
class Pendulum extends Ent{
  init(){ this.kind='pendulum'; this.alwaysUpdate=true; this.ang=0; this.tm=this.phase||0; }
  update(w,dt){
    this.tm+=dt;
    const prev=this.ang;
    this.ang=this.amp*Math.sin(this.tm*Math.PI*2/this.period);
    if(Math.sign(prev)!==Math.sign(this.ang) && Math.abs(w.P.x-this.px)<300) w.emit('whoosh',{});
  }
  bx(){ return this.px+Math.sin(this.ang)*this.len; }
  by(){ return this.py+Math.cos(this.ang)*this.len; }
  hazards(){ return [{x:this.bx(),y:this.by(),r:this.r}]; }
}

// Railway crossing: trains pass through the zone (perpendicular to the screen).
class Crossing extends Ent{
  init(){ this.kind='train'; this.trainIdx=-1; this.active=false; this.pass=0; this.gk=0; this.alwaysUpdate=true; }
  update(w,dt){
    this.gk+=((this.bellOn&&this.st!=='done'?1:0)-this.gk)*Math.min(1,dt*5);
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='bell'; this.tm=0; w.se('warn'); } }
    if(this.st!=='idle' && this.st!=='done'){
      this.tm+=dt;
      this.active=false;
      this.trainIdx=-1;
      const P=w.P, onTracks=!P.dead && P.x>=this.x0 && P.x<=this.x1;
      for(let i=0;i<this.trains.length;i++){
        const tr=this.trains[i];
        // a train with 'enter' waits for the cat to step onto the tracks inside its window
        if(tr.enter){ if(tr.at===undefined){ if(onTracks && this.tm>=tr.enter[0] && this.tm<tr.enter[1]) tr.at=this.tm+(tr.delay||0); else continue; } }
        if(this.tm>=tr.at && this.tm<tr.at+tr.dur){ this.active=true; this.trainIdx=i; this.pass=(this.tm-tr.at)/tr.dur; if(!tr.fired){ tr.fired=true; w.se('wallmove'); w.shake(6);} }
      }
      const bells=this.bells||[[0,this.gateUp]];
      this.bellOn=bells.some(b=>this.tm>=b[0]&&this.tm<b[1]);
      if(Math.floor(this.tm*2.6)!==this.ring && this.bellOn && Math.abs(w.P.x-(this.x0+this.x1)/2)<500){ this.ring=Math.floor(this.tm*2.6); w.se('warn'); }
      if(this.tm>=bells[bells.length-1][1] && !this.active) this.st='done';
    }
  }
  hazards(){
    if(!this.active) return null;
    return [{x:this.x0,y:G-150,w:this.x1-this.x0,h:150}];
  }
}

// Darkness chasing from the left.
class DarkChase extends Ent{
  init(){ this.kind='dark'; this.x=this.startX; this.v=this.speed; this.alwaysUpdate=false; }
  update(w,dt){
    if(this.st==='idle'){ if(this.triggered(w)){ this.st='chase'; w.se('wallmove'); } }
    else if(this.st==='chase'){
      this.v=Math.min(this.maxSpeed,this.v+this.accel*dt);
      if(this.boostX!==undefined && w.P.x>=this.boostX) this.v=Math.max(this.v,this.boostSpeed);
      // never fall absurdly far behind
      this.x=Math.max(this.x+this.v*dt,w.P.x-this.leash);
    }
  }
  hazards(){ return this.st==='chase'?[{x:this.x-2000,y:-100,w:2000,h:800}]:null; }
}

// Sinusoidal moving platform.
class Mover extends Ent{
  init(){
    this.kind='mover';
    this.bx=this.x; this.by=this.y; this.tm=this.phase||0;
    this.s={x:this.x,y:this.y,w:this.w,h:this.h||16,kin:true,kind:'mover',style:this.style||'plank'};
    this.solids=[this.s];
    this.alwaysUpdate=true;
  }
  update(w,dt){
    this.tm+=dt;
    const k=(1-Math.cos(this.tm*Math.PI*2/this.period))/2;
    if(this.ax==='y') this.s.y=this.by+this.range*k; else this.s.x=this.bx+this.range*k;
  }
}

// Static hazard spikes (always visible).
class SpikeRow extends Ent{
  init(){ this.kind='spike'; }
  hazards(){
    if(this.dirn==='down') return [{x:this.x+3,y:this.y,w:this.w-6,h:this.h-6}];
    return [{x:this.x+3,y:this.y-this.h+6,w:this.w-6,h:this.h-6}];
  }
}

// Decorative object (drawn only).
class Deco extends Ent{ init(){ this.kind='deco'; } }

// Goal-looking door that is actually a trigger.
class FakeDoor extends Ent{ init(){ this.kind='fakedoor'; } }

// A lamp / light source (for dark stages) - decoration with a light radius.
class Light extends Ent{ init(){ this.kind='light'; } }

const K={Block,TrapFloor,ShiftPit,DropFloor,Crusher,FallBlock,Spikes,Shot,Laser,Lift,Arc,Shutter,ChaseWall,
  Lightning,Wind,Conveyor,Bonk,Spring,Pendulum,Crossing,DarkChase,Mover,SpikeRow,Deco,FakeDoor,Light};
// Factory helpers: K.trapdoor({...}) etc.
const F={};
for(const k in K){ F[k]=o=>new K[k](o); }

root.NEKO_ENGINE={World,K,F,CFG,G,WH,VIEW_W,clamp,approach};
})(typeof window!=='undefined'?window:globalThis);
