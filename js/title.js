// Neko Nine title scene: a rainy window at night, Nine on the windowsill.
(function(root){
'use strict';
const TAU=Math.PI*2;
// The owner's hairstyles, seen from behind. Each draws one closed outline around
// the head (top of the head at y=-183, nape around y=-96).
const HAIR={
  // wolf cut: full crown, tucked at the ears, layered flicks at the jaw, tapered nape
  wolf(c){
    c.moveTo(0,-183);
    c.bezierCurveTo(28,-183,46,-166,46,-142); c.bezierCurveTo(46,-127,41,-119,38,-111);
    c.bezierCurveTo(42,-106,45,-101,45,-95); c.bezierCurveTo(41,-97,38,-98,35,-98);
    c.bezierCurveTo(40,-92,41,-86,39,-80); c.bezierCurveTo(35,-82,32,-83,29,-83);
    c.bezierCurveTo(32,-78,31,-72,27,-66); c.bezierCurveTo(23,-69,19,-70,16,-69);
    c.bezierCurveTo(16,-63,13,-58,9,-53); c.bezierCurveTo(6,-57,3,-59,0,-59);
    c.bezierCurveTo(-3,-59,-6,-57,-9,-53); c.bezierCurveTo(-13,-58,-16,-63,-16,-69);
    c.bezierCurveTo(-19,-70,-23,-69,-27,-66); c.bezierCurveTo(-31,-72,-32,-78,-29,-83);
    c.bezierCurveTo(-32,-83,-35,-82,-39,-80); c.bezierCurveTo(-41,-86,-40,-92,-35,-98);
    c.bezierCurveTo(-38,-98,-41,-97,-45,-95); c.bezierCurveTo(-45,-101,-42,-106,-38,-111);
    c.bezierCurveTo(-41,-119,-46,-127,-46,-142); c.bezierCurveTo(-46,-166,-28,-183,0,-183);
  },
  // short wolf: compact crown, a few short flicks, a small tail at the nape
  shortwolf(c){
    c.moveTo(0,-182);
    c.bezierCurveTo(27,-182,44,-166,44,-143); c.bezierCurveTo(44,-128,40,-120,37,-113);
    c.bezierCurveTo(41,-110,43,-106,42,-101); c.bezierCurveTo(38,-102,35,-103,32,-103);
    c.bezierCurveTo(33,-97,30,-92,25,-88); c.bezierCurveTo(22,-91,18,-92,14,-91);
    c.bezierCurveTo(13,-85,10,-80,6,-74); c.bezierCurveTo(3,-77,-3,-77,-6,-74);
    c.bezierCurveTo(-10,-80,-13,-85,-14,-91); c.bezierCurveTo(-18,-92,-22,-91,-25,-88);
    c.bezierCurveTo(-30,-92,-33,-97,-32,-103); c.bezierCurveTo(-35,-103,-38,-102,-42,-101);
    c.bezierCurveTo(-43,-106,-41,-110,-37,-113); c.bezierCurveTo(-40,-120,-44,-128,-44,-143);
    c.bezierCurveTo(-44,-166,-27,-182,0,-182);
  },
  // long wolf: the same layered crown, with long feathered ends resting on the shoulders
  longwolf(c){
    c.moveTo(0,-184);
    c.bezierCurveTo(29,-184,47,-167,47,-142); c.bezierCurveTo(47,-126,43,-116,41,-106);
    c.bezierCurveTo(46,-98,50,-86,50,-72); c.bezierCurveTo(46,-74,43,-75,40,-75);
    c.bezierCurveTo(47,-62,52,-48,54,-34); c.bezierCurveTo(47,-38,41,-40,36,-40);
    c.bezierCurveTo(37,-30,34,-22,29,-14); c.bezierCurveTo(25,-20,20,-24,15,-25);
    c.bezierCurveTo(12,-18,6,-12,0,-10); c.bezierCurveTo(-6,-12,-12,-18,-15,-25);
    c.bezierCurveTo(-20,-24,-25,-20,-29,-14); c.bezierCurveTo(-34,-22,-37,-30,-36,-40);
    c.bezierCurveTo(-41,-40,-47,-38,-54,-34); c.bezierCurveTo(-52,-48,-47,-62,-40,-75);
    c.bezierCurveTo(-43,-75,-46,-74,-50,-72); c.bezierCurveTo(-50,-86,-46,-98,-41,-106);
    c.bezierCurveTo(-43,-116,-47,-126,-47,-142); c.bezierCurveTo(-47,-167,-29,-184,0,-184);
  },
  // blunt bob: a soft round crown falling straight to a clean line at the jaw
  bob(c){
    c.moveTo(0,-184);
    c.bezierCurveTo(30,-184,48,-166,48,-140); c.bezierCurveTo(48,-118,49,-96,51,-80);
    c.bezierCurveTo(52,-74,50,-70,44,-69); c.bezierCurveTo(28,-66,14,-65,0,-65);
    c.bezierCurveTo(-14,-65,-28,-66,-44,-69); c.bezierCurveTo(-50,-70,-52,-74,-51,-80);
    c.bezierCurveTo(-49,-96,-48,-118,-48,-140); c.bezierCurveTo(-48,-166,-30,-184,0,-184);
  },
  // mash wolf: a big rounded mushroom crown with a short, wispy nape
  mash(c){
    c.moveTo(0,-186);
    c.bezierCurveTo(34,-186,53,-166,53,-138); c.bezierCurveTo(53,-122,49,-112,44,-106);
    c.bezierCurveTo(40,-103,36,-103,33,-104); c.bezierCurveTo(34,-96,30,-90,24,-87);
    c.bezierCurveTo(21,-91,17,-92,13,-91); c.bezierCurveTo(12,-83,8,-76,3,-70);
    c.bezierCurveTo(1,-73,-1,-73,-3,-70); c.bezierCurveTo(-8,-76,-12,-83,-13,-91);
    c.bezierCurveTo(-17,-92,-21,-91,-24,-87); c.bezierCurveTo(-30,-90,-34,-96,-33,-104);
    c.bezierCurveTo(-36,-103,-40,-103,-44,-106); c.bezierCurveTo(-49,-112,-53,-122,-53,-138);
    c.bezierCurveTo(-53,-166,-34,-186,0,-186);
  },
  // low bun: hair gathered softly at the nape, a few strands left loose
  bun(c){
    c.moveTo(0,-182);
    c.bezierCurveTo(27,-182,44,-166,44,-142); c.bezierCurveTo(44,-124,41,-113,36,-104);
    c.bezierCurveTo(40,-100,41,-95,39,-91); c.bezierCurveTo(35,-94,32,-96,28,-97);
    c.bezierCurveTo(20,-94,10,-93,0,-93); c.bezierCurveTo(-10,-93,-20,-94,-28,-97);
    c.bezierCurveTo(-32,-96,-35,-94,-39,-91); c.bezierCurveTo(-41,-95,-40,-100,-36,-104);
    c.bezierCurveTo(-41,-113,-44,-124,-44,-142); c.bezierCurveTo(-44,-166,-27,-182,0,-182);
    c.closePath();
    // the bun itself, sitting at the nape
    c.moveTo(20,-84); c.arc(0,-84,20,0,Math.PI*2);
  }
};
// Hair drawn as locks. len(u): where the tips fall (u=-1 left edge .. 1 right edge).
const HAIR_STYLE={
  wolf:{width:44,layers:[
    {n:9,w:10,len:u=>-60-42*u*u,flare:10,flick:10,rough:6,seed:1},
    {n:7,w:9.5,len:u=>-106-6*u*u,flare:7,flick:8,rough:4,seed:2}]},
  shortwolf:{width:42,layers:[
    {n:8,w:10,len:u=>-78-26*u*u,flare:6,flick:6,rough:4,seed:3},
    {n:7,w:9.5,len:u=>-112,flare:5,flick:5,rough:3,seed:4}]},
  longwolf:{width:45,layers:[
    {n:10,w:10.5,len:u=>-12-26*u*u,flare:16,flick:12,rough:8,seed:5},
    {n:8,w:9.5,len:u=>-80-18*u*u,flare:10,flick:9,rough:6,seed:6}]},
  bob:{width:47,layers:[
    {n:10,w:10.5,len:u=>-66-3*u*u,flare:4,flick:-2,rough:1.5,seed:7}]},
  mash:{width:50,layers:[
    {n:9,w:11,len:u=>-80-22*u*u,flare:6,flick:4,rough:3,seed:8},
    {n:8,w:11,len:u=>-106-4*u*u,flare:8,flick:2,rough:2,seed:9}]},
  bun:{width:43,gather:true,layers:[
    {n:9,w:9.5,len:u=>-92,flare:0,flick:0,rough:1,seed:10}]}
};
const HAIR_NAMES={wolf:'ウルフ（現在）',shortwolf:'ショートウルフ',longwolf:'ロングウルフ',bob:'切りっぱなしボブ',mash:'マッシュウルフ',bun:'ゆるいお団子'};
const T={
  init(canvas,sprites){
    this.cv=canvas; this.g=canvas.getContext('2d');
    this.sp=sprites; this.t=0; this.warm=0; this.cleared=false; this.dawn=false; this.dk=0; this.hair='wolf'; this.HAIR_NAMES=HAIR_NAMES;
    this.drops=[]; for(let i=0;i<70;i++) this.drops.push(this.newDrop(true));
    this.streaks=[]; for(let i=0;i<120;i++) this.streaks.push({x:Math.random(),y:Math.random(),s:0.6+Math.random()*0.6});
    const r=this.rand(21);
    this.city=[]; for(let i=0;i<140;i++) this.city.push({x:r(),y:0.55+r()*0.35,r:2+r()*7,c:r()<0.7?[255,196,120]:[190,210,255],a:0.25+r()*0.5,p:r()*TAU});
    this.motes=[]; for(let i=0;i<30;i++) this.motes.push({x:r(),y:r(),v:0.004+r()*0.008,p:r()*TAU});
    this.stars=[]; for(let i=0;i<150;i++){ const big=r()<0.08; this.stars.push({x:r(),y:r()*0.85,r:big?2.2:1+r()*1.2,a:0.35+r()*0.6,s:0.6+r()*2,p:r()*TAU,big}); }
    this.fur=[]; for(let i=0;i<160;i++){ const fx=-36+r()*72, fy=-105+r()*105; const ang=Math.atan2(fy+60,fx)*0.15; this.fur.push([fx,fy,Math.sin(ang)*2+(fx<0?-0.6:0.6),1.5+r()*2]); }
    this.clouds=[]; for(let i=0;i<14;i++) this.clouds.push({x:r()*1.4-0.2,y:0.35+r()*0.6,r:0.12+r()*0.22,v:0.004+r()*0.006,
      a:0.10+r()*0.16,col:r()<0.5?'205,180,230':(r()<0.5?'240,200,225':'150,140,210')});
    this.resize();
  },
  rand(seed){ let s=seed; return ()=>{ s=(s*16807)%2147483647; return (s%10000)/10000; }; },
  newDrop(init){ return {x:Math.random(),y:init?Math.random():-0.05,r:0.004+Math.random()*0.006,v:0.02+Math.random()*0.08,stick:Math.random()*3}; },
  resize(){
    const d=Math.min(root.devicePixelRatio||1,2);
    this.dpr=d; this.W=root.innerWidth; this.H=root.innerHeight;
    this.cv.width=Math.round(this.W*d); this.cv.height=Math.round(this.H*d);
  },
  frame(dt){
    const g=this.g, W=this.W, H=this.H;
    this.t+=dt;
    this.warm+=((this.cleared?1:0)-this.warm)*Math.min(1,dt*0.8);
    // after the second lap the night gives way to morning
    this.dk+=((this.dawn?1:0)-this.dk)*Math.min(1,dt*0.6);
    const DK=this.dk;
    g.setTransform(this.dpr,0,0,this.dpr,0,0);
    // room wall
    const wall=g.createLinearGradient(0,0,0,H);
    wall.addColorStop(0,this.mix('#0d0f1c','#2a2030')); wall.addColorStop(1,this.mix('#07080f','#1a1319'));
    g.fillStyle=wall; g.fillRect(0,0,W,H);
    // window: a violet, watercolor night with a crescent moon
    const wx=W*0.46, wy=H*0.08, ww=W*0.46, wh=H*0.68;
    g.save(); g.beginPath(); g.rect(wx,wy,ww,wh); g.clip();
    const sky=g.createLinearGradient(0,wy,0,wy+wh);
    sky.addColorStop(0,'#15173d'); sky.addColorStop(0.45,'#2e2c64'); sky.addColorStop(0.8,'#6a5a98'); sky.addColorStop(1,'#b596c4');
    g.fillStyle=sky; g.fillRect(wx,wy,ww,wh);
    if(DK>0.01){
      const ds=g.createLinearGradient(0,wy,0,wy+wh);
      ds.addColorStop(0,`rgba(92,122,200,${DK})`); ds.addColorStop(0.5,`rgba(236,168,160,${DK})`); ds.addColorStop(0.82,`rgba(255,205,150,${DK})`); ds.addColorStop(1,`rgba(255,232,190,${DK})`);
      g.fillStyle=ds; g.fillRect(wx,wy,ww,wh);
      // the sun just clearing the rooftops
      const sx=wx+ww*0.24, sy2=wy+wh*(0.92-0.14*DK), sr=wh*0.085;
      this.glow(g,sx,sy2,sr*9,'rgba(255,196,130,A)',0.55*DK);
      this.glow(g,sx,sy2,sr*3,'rgba(255,236,190,A)',0.8*DK);
      g.fillStyle=`rgba(255,244,214,${DK})`; g.beginPath(); g.arc(sx,sy2,sr,0,TAU); g.fill();
      // two birds far off
      g.strokeStyle=`rgba(70,50,70,${0.55*DK})`; g.lineWidth=1.6;
      for(let i=0;i<2;i++){
        const bx=wx+ww*(((this.t*0.018+i*0.23)%1.2)-0.1), by=wy+wh*(0.28+i*0.07)+Math.sin(this.t*0.9+i)*6, f=Math.sin(this.t*7+i*2)*4;
        g.beginPath(); g.moveTo(bx-8,by-f); g.quadraticCurveTo(bx-3,by-3,bx,by); g.quadraticCurveTo(bx+3,by-3,bx+8,by-f); g.stroke();
      }
    }
    // soft clouds, layered like washes of paint
    for(const c of this.clouds){
      c.x+=c.v*dt; if(c.x>1.3) c.x=-0.3;
      const cx=wx+c.x*ww, cy=wy+c.y*wh, r=c.r*wh;
      const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
      gr.addColorStop(0,`rgba(${DK>0.5?'255,220,210':c.col},${c.a*(1-0.5*this.warm)*(1-0.3*DK)})`); gr.addColorStop(1,`rgba(${c.col},0)`);
      g.fillStyle=gr; g.beginPath(); g.ellipse(cx,cy,r*1.7,r,0,0,TAU); g.fill();
    }
    // stars
    for(const st of this.stars){
      const a=Math.min(1,st.a*(1+0.35*this.warm)*(0.55+0.45*Math.sin(this.t*st.s+st.p)))*(1-DK*0.95);
      const x=wx+st.x*ww, y=wy+st.y*wh;
      if(st.big){ this.glow(g,x,y,st.r*5,'rgba(255,250,235,A)',a*0.35); }
      g.fillStyle=`rgba(255,250,240,${a})`; g.fillRect(x-st.r/2,y-st.r/2,st.r,st.r);
    }
    // crescent moon
    const mx=wx+ww*0.3, my=wy+wh*0.24, mr=wh*0.07;
    this.glow(g,mx,my,mr*6,'rgba(255,240,210,A)',0.22);
    const mc=this.moonCv||(this.moonCv=document.createElement('canvas'));
    const ms=Math.ceil(mr*2.4); if(mc.width!==ms){ mc.width=mc.height=ms; }
    const m=mc.getContext('2d'); m.clearRect(0,0,ms,ms);
    m.fillStyle='#fff4dc'; m.beginPath(); m.arc(ms/2,ms/2,mr,0,TAU); m.fill();
    m.globalCompositeOperation='destination-out'; m.beginPath(); m.arc(ms/2+mr*0.45,ms/2-mr*0.3,mr*0.92,0,TAU); m.fill(); m.globalCompositeOperation='source-over';
    g.globalAlpha=1-DK*0.97; g.drawImage(mc,mx-ms/2,my-ms/2); g.globalAlpha=1;
    // shooting star (after the rain has stopped)
    if(this.cleared&&DK<0.5){
      this.shoot=(this.shoot||{t:4,x:0.7,y:0.1});
      this.shoot.t+=dt;
      if(this.shoot.t>6){ this.shoot={t:0,x:0.45+Math.random()*0.45,y:0.05+Math.random()*0.25}; }
      if(this.shoot.t<0.9){
        const k=this.shoot.t/0.9, sx=wx+(this.shoot.x-k*0.35)*ww, sy2=wy+(this.shoot.y+k*0.18)*wh;
        const gr=g.createLinearGradient(sx,sy2,sx+ww*0.12,sy2-wh*0.06);
        gr.addColorStop(0,`rgba(255,250,235,${0.9*(1-k)})`); gr.addColorStop(1,'rgba(255,250,235,0)');
        g.strokeStyle=gr; g.lineWidth=2; g.beginPath(); g.moveTo(sx,sy2); g.lineTo(sx+ww*0.12,sy2-wh*0.06); g.stroke();
      }
    }
    // rain outside
    const raining=!this.cleared;
    g.strokeStyle='rgba(200,195,245,.22)'; g.lineWidth=1; g.beginPath();
    if(raining) for(const r of this.streaks){
      r.y+=dt*1.25*r.s; if(r.y>1.05){ r.y=-0.05; r.x=Math.random(); }
      const x=wx+r.x*ww, y=wy+r.y*wh; g.moveTo(x,y); g.lineTo(x-2.5,y+15*r.s);
    }
    g.stroke();
    // drops on the glass
    for(let i=0;i<this.drops.length;i++){
      const d=this.drops[i];
      if(!raining){ d.stick=1; if(i%4) continue; }
      if(d.stick>0) d.stick-=raining?dt:0; else d.y+=d.v*dt*2;
      if(d.y>1.02){ this.drops[i]=this.newDrop(false); continue; }
      const x=wx+d.x*ww, y=wy+d.y*wh, r=d.r*ww;
      if(d.stick<=0){ g.strokeStyle='rgba(220,210,255,.08)'; g.lineWidth=r*0.9; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y-r*7); g.stroke(); }
      g.fillStyle='rgba(225,215,255,.2)'; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill();
      g.fillStyle='rgba(255,255,255,.45)'; g.beginPath(); g.arc(x-r*0.3,y-r*0.3,r*0.3,0,TAU); g.fill();
    }
    // a faint reflection on the glass
    g.fillStyle='rgba(255,255,255,.035)'; g.beginPath(); g.moveTo(wx+ww*0.62,wy); g.lineTo(wx+ww*0.8,wy); g.lineTo(wx+ww*0.5,wy+wh); g.lineTo(wx+ww*0.32,wy+wh); g.fill();
    g.restore();
    // window frame
    const fc=this.mix('#1c1a26','#3a2c24');
    g.fillStyle=fc; g.fillRect(wx-10,wy-10,ww+20,10); g.fillRect(wx-10,wy+wh,ww+20,10);
    g.fillRect(wx-10,wy,10,wh); g.fillRect(wx+ww,wy,10,wh); g.fillRect(wx+ww/2-4,wy,8,wh); g.fillRect(wx,wy+wh*0.48,ww,7);
    // sill
    const sy=wy+wh+10;
    g.fillStyle=this.mix('#232030','#4a372b'); g.fillRect(wx-30,sy,ww+60,12);
    g.fillStyle=this.mix('#15131e','#2c2019'); g.fillRect(wx-30,sy+12,ww+60,6);
    // morning sun falling into the room
    if(DK>0.01){ g.fillStyle=`rgba(255,200,140,${0.1*DK})`; g.beginPath(); g.moveTo(wx,wy+wh); g.lineTo(wx+ww,wy+wh); g.lineTo(wx+ww*0.7,H); g.lineTo(wx-ww*0.6,H); g.fill(); }
    // moonlight falling into the room
    g.fillStyle='rgba(190,170,255,.05)'; g.beginPath(); g.moveTo(wx,wy+wh); g.lineTo(wx+ww,wy+wh); g.lineTo(wx+ww*0.9,H); g.lineTo(wx-ww*0.35,H); g.fill();
    // warm lamp (bright after the game has been cleared)
    const lx=W*0.14, ly=H*0.62;
    this.glow(g,lx,ly,H*0.55,'rgba(255,190,120,A)',0.06+0.22*this.warm);
    g.fillStyle=this.mix('#141220','#3a2a1e'); g.fillRect(lx-3,ly,6,H*0.3);
    g.fillStyle=this.mix('#221e2e','#f3cf8e'); g.beginPath(); g.moveTo(lx-26,ly); g.lineTo(lx+26,ly); g.lineTo(lx+17,ly-30); g.lineTo(lx-17,ly-30); g.fill();
    // dust motes in the moonlight
    for(const m of this.motes){
      m.y-=m.v*dt; if(m.y<0) m.y=1;
      const x=wx-ww*0.1+m.x*ww*1.1+Math.sin(this.t*0.5+m.p)*8, y=wy+wh*0.6+m.y*H*0.4;
      g.fillStyle=`rgba(220,230,255,${0.12+0.1*Math.sin(this.t+m.p)})`; g.fillRect(x,y,2,2);
    }
    // blue stars on the sill: the flower you set by the window the morning you chose to rest.
    // One more bloom for every time the night has been walked to its end.
    if(DK>0.01){
      const px=wx+ww*0.08, pw=wh*0.1, ph=wh*0.075, n=Math.min(7,1+(this.clears||2));
      const T=this.t, pulse=0.5+0.5*Math.sin(T*1.6);
      g.save(); g.globalAlpha=DK;
      // a slow breathing glow around the whole plant
      this.glow(g,px,sy-ph-pw*0.9,pw*(2.6+0.5*pulse),'rgba(130,190,255,A)',0.22+0.16*pulse);
      // stems and leaves
      g.strokeStyle='#5f8a5a'; g.lineWidth=1.8; g.lineCap='round';
      const heads=[];
      for(let i=0;i<n;i++){
        const a=(i/(n-1||1)-0.5)*1.15, len=pw*(1.05+0.3*Math.sin(i*2.3)), sway=Math.sin(T*0.8+i)*1.6;
        const hx=px+Math.sin(a)*len+sway, hy=sy-ph-4-Math.cos(a)*len;
        g.beginPath(); g.moveTo(px+(i-n/2)*1.4,sy-ph-3); g.quadraticCurveTo(px+Math.sin(a)*len*0.4,hy+len*0.5,hx,hy); g.stroke();
        heads.push([hx,hy,i]);
      }
      g.fillStyle='#6a9a62';
      for(const k of [-1,1]){ g.save(); g.translate(px+k*4,sy-ph-6); g.rotate(k*0.95); g.beginPath(); g.ellipse(0,-pw*0.24,pw*0.1,pw*0.26,0,0,TAU); g.fill(); g.restore(); }
      // five-petalled stars that shimmer
      const glint=Math.floor(T/1.3)%n, gk=(T%1.3)/1.3;
      for(const [hx,hy,i] of heads){
        const r=pw*0.22*(0.92+0.12*Math.sin(i*1.7)), b=0.5+0.5*Math.sin(T*2.2+i*1.3);
        this.glow(g,hx,hy,r*3.4,'rgba(150,205,255,A)',0.35+0.25*b);
        const pg=g.createRadialGradient(hx,hy,0,hx,hy,r);
        pg.addColorStop(0,'#e9f6ff'); pg.addColorStop(0.45,'#a9d8ff'); pg.addColorStop(1,'#6fb2ff');
        g.fillStyle=pg;
        for(let k=0;k<5;k++){ const a=k/5*TAU+i+Math.sin(T*0.5+i)*0.05; g.beginPath(); g.ellipse(hx+Math.cos(a)*r*0.55,hy+Math.sin(a)*r*0.55,r*0.54,r*0.31,a,0,TAU); g.fill(); }
        g.fillStyle='#ffffff'; g.beginPath(); g.arc(hx,hy,r*0.2,0,TAU); g.fill();
        // one flower at a time throws a small cross of light
        if(i===glint){
          const k=Math.sin(Math.PI*gk), L=r*(1.6+2.2*k);
          g.strokeStyle=`rgba(235,248,255,${0.85*k})`; g.lineWidth=1.3;
          g.beginPath(); g.moveTo(hx-L,hy); g.lineTo(hx+L,hy); g.moveTo(hx,hy-L); g.lineTo(hx,hy+L); g.stroke();
          this.glow(g,hx,hy,r*2.2,'rgba(255,255,255,A)',0.5*k);
        }
      }
      // specks of light drifting up, and now and then a petal floating down
      this.sparks=this.sparks||[]; this.petals=this.petals||[];
      if(Math.random()<dt*4){ const h=heads[Math.floor(Math.random()*heads.length)]; this.sparks.push({x:h[0],y:h[1],vx:(Math.random()-0.5)*10,vy:-12-Math.random()*16,t:0,life:1.8+Math.random()*1.4,star:Math.random()<0.35}); }
      if(Math.random()<dt*0.25){ const h=heads[Math.floor(Math.random()*heads.length)]; this.petals.push({x:h[0],y:h[1],t:0,life:4,rot:Math.random()*TAU}); }
      for(const p of this.sparks){
        p.t+=dt; p.x+=p.vx*dt+Math.sin(T*2+p.y*0.05)*0.3; p.y+=p.vy*dt;
        const a=Math.sin(Math.PI*Math.min(1,p.t/p.life));
        if(p.star){ const L=3+2*a; g.strokeStyle=`rgba(220,240,255,${0.9*a})`; g.lineWidth=1; g.beginPath(); g.moveTo(p.x-L,p.y); g.lineTo(p.x+L,p.y); g.moveTo(p.x,p.y-L); g.lineTo(p.x,p.y+L); g.stroke(); }
        else { g.fillStyle=`rgba(190,225,255,${0.85*a})`; g.beginPath(); g.arc(p.x,p.y,1.4,0,TAU); g.fill(); }
      }
      this.sparks=this.sparks.filter(p=>p.t<p.life);
      for(const p of this.petals){
        p.t+=dt; p.y=Math.min(sy-2,p.y+dt*14); p.x+=Math.sin(p.t*1.8)*0.5; p.rot+=dt*1.2;
        const a=Math.min(1,p.t)*Math.max(0,1-(p.t-p.life+1));
        g.save(); g.translate(p.x,p.y); g.rotate(p.rot); g.fillStyle=`rgba(160,210,255,${0.8*a})`; g.beginPath(); g.ellipse(0,0,pw*0.1,pw*0.055,0,0,TAU); g.fill(); g.restore();
      }
      this.petals=this.petals.filter(p=>p.t<p.life);
      // the pot
      g.fillStyle='#c09172'; g.beginPath(); g.moveTo(px-pw/2,sy-ph); g.lineTo(px+pw/2,sy-ph); g.lineTo(px+pw*0.38,sy); g.lineTo(px-pw*0.38,sy); g.fill();
      g.fillStyle='#a67a5c'; g.fillRect(px-pw*0.56,sy-ph-4,pw*1.12,5);
      g.fillStyle='rgba(255,230,200,.18)'; g.fillRect(px-pw*0.42,sy-ph+2,pw*0.12,ph-4);
      g.restore();
    }
    // Nine on the sill, seen from behind, looking up at the moon
    if(this.cleared){
      // after the ending: you and Nine, together at the window
      // you on the left, Nine sitting on the sill beside you, both facing the moon
      const os=wh/250;
      const ox=wx+ww*0.42, oy=sy+40*os;
      this.ownerBack(g,ox,oy,os);
      this.catBack(g,ox+118*os,sy,136*os);
    }else{
      this.catBack(g,wx+ww*0.64,sy,wh*0.5);
    }
    // the room itself warms with the morning
    if(DK>0.01){ g.fillStyle=`rgba(255,180,130,${0.07*DK})`; g.fillRect(0,0,W,H); }
    // vignette
    const vg=g.createRadialGradient(W*0.55,H*0.45,H*0.2,W*0.5,H*0.5,H*1.1);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.65)');
    g.fillStyle=vg; g.fillRect(0,0,W,H);
  },
  // Draw a moonlit silhouette: soft halo, shading from the upper left, and a rim light
  // that follows the real outline. box: [left, top, right, bottom] in shape units.
  lit(g,x,y,s,key,box,shape,halo){
    const d=this.dpr, pad=30;
    const cw=Math.ceil((box[2]-box[0]+pad*2)*s*d), chh=Math.ceil((box[3]-box[1]+pad*2)*s*d);
    this.litL=this.litL||{};
    const L=this.litL[key]||(this.litL[key]=[0,1,2].map(()=>document.createElement('canvas')));
    for(const c of L){ if(c.width!==cw||c.height!==chh){ c.width=cw; c.height=chh; } }
    const ox=(-box[0]+pad)*s*d, oy=(-box[1]+pad)*s*d;
    const draw=(c,col)=>{ c.save(); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,cw,chh); c.translate(ox,oy); c.scale(s*d,s*d); c.fillStyle=col; c.strokeStyle=col; shape(c); c.restore(); };
    const [A,B,C]=L, a=A.getContext('2d'), b=B.getContext('2d'), c2=C.getContext('2d');
    draw(a,'#0f0d1c'); draw(c2,'#0f0d1c');
    c2.save(); c2.globalCompositeOperation='source-atop';
    const lg=c2.createLinearGradient(0,0,cw*0.8,chh); lg.addColorStop(0,'rgba(150,135,230,.34)'); lg.addColorStop(0.45,'rgba(80,72,150,.1)'); lg.addColorStop(1,'rgba(0,0,0,0)');
    c2.fillStyle=lg; c2.fillRect(0,0,cw,chh); c2.restore();
    draw(b,'rgba(215,200,255,.72)');
    b.save(); b.globalCompositeOperation='destination-out'; b.drawImage(A,1.4*s*d,1.6*s*d);
    b.globalCompositeOperation='destination-in'; const fg=b.createLinearGradient(0,0,cw*0.9,chh*0.9); fg.addColorStop(0,'rgba(0,0,0,1)'); fg.addColorStop(0.6,'rgba(0,0,0,.45)'); fg.addColorStop(1,'rgba(0,0,0,0)'); b.fillStyle=fg; b.fillRect(0,0,cw,chh); b.restore();
    g.save(); g.setTransform(1,0,0,1,0,0);
    const px=x*d-ox, py=y*d-oy;
    if(halo){ g.shadowColor=halo; g.shadowBlur=22*s*d; }
    g.drawImage(A,px,py); g.shadowBlur=0;
    g.drawImage(C,px,py); g.drawImage(B,px,py);
    g.restore();
  },
  // You, seen from behind: shoulders relaxed, head tilted toward Nine, a wolf cut.
  // Units: shoulder line near y=-96, crown at y=-182; s = pixels per unit.
  ownerBack(g,x,y,s){
    const t=this.t, br=Math.sin(t*1.1)*0.7, tilt=0.09;
    const neck=[0,-96];
    const tiltAt=(c)=>{ c.translate(neck[0],neck[1]); c.rotate(tilt); c.translate(-neck[0],-neck[1]); };
    const body=c=>{
      // neck, shoulders and back in an oversized knit
      c.beginPath();
      c.moveTo(-15,-100); c.lineTo(15,-100);
      c.bezierCurveTo(17,-86,23,-77,36,-71+br);
      c.bezierCurveTo(60,-63,78,-54,84,-30+br);
      c.bezierCurveTo(90,-4,92,40,92,130);
      c.lineTo(-92,130);
      c.bezierCurveTo(-92,40,-90,-4,-84,-30+br);
      c.bezierCurveTo(-78,-54,-60,-63,-36,-71+br);
      c.bezierCurveTo(-23,-77,-17,-86,-15,-100);
      c.closePath(); c.fill();
    };
    const locks=this.hairLocks(this.hair,t);
    const mass=c=>this.hairMass(c,this.hair);
    const hairShape=c=>{ c.save(); tiltAt(c); c.beginPath(); mass(c); for(const L of locks) this.lockPath(c,L); c.fill(); c.restore(); };
    // body, then hair, each as a moonlit silhouette (shading + rim that follow the real outline)
    this.lit(g,x,y,s,'ownerBody',[-100,-110,100,130],body,'rgba(175,155,255,.45)');
    // the sweater's neckline and a knit texture hint across the back
    g.save(); g.translate(x,y); g.scale(s,s);
    g.strokeStyle='rgba(185,170,245,.22)'; g.lineWidth=2;
    g.beginPath(); g.moveTo(-34,-70+br); g.quadraticCurveTo(0,-58+br,34,-70+br); g.stroke();
    g.strokeStyle='rgba(150,140,220,.06)'; g.lineWidth=1;
    for(let yy=-50;yy<130;yy+=9){ g.beginPath(); g.moveTo(-80,yy); g.quadraticCurveTo(0,yy+4,80,yy); g.stroke(); }
    g.restore();
    this.lit(g,x,y,s,'ownerHair',[-80,-195,80,0],hairShape,'rgba(175,155,255,.5)');
    const warm=this.dk||0;
    const rim=warm>0.5?'255,205,160':'200,185,255';
    // strand detail: every lock gets a soft lit edge and a darker parting
    g.save(); g.translate(x,y); g.scale(s,s); tiltAt(g);
    g.save(); g.beginPath(); mass(g); for(const L of locks) this.lockPath(g,L); g.clip();
    g.lineCap='round';
    for(const L of locks){
      const P=L.pts, n=P.length;
      g.strokeStyle=`rgba(${rim},${0.05+0.08*L.light})`; g.lineWidth=1;
      g.beginPath(); for(let k=2;k<n-1;k++){ const [px,py,wd,nx,ny]=P[k]; const q=[px-nx*wd*0.3,py-ny*wd*0.3]; k===2?g.moveTo(q[0],q[1]):g.lineTo(q[0],q[1]); } g.stroke();
      g.strokeStyle='rgba(6,4,14,.22)'; g.lineWidth=1.4;
      g.beginPath(); for(let k=4;k<n;k++){ const [px,py,wd,nx,ny]=P[k]; const q=[px+nx*wd*0.85,py+ny*wd*0.85]; k===4?g.moveTo(q[0],q[1]):g.lineTo(q[0],q[1]); } g.stroke();
    }
    // a sheen band across the crown ("angel ring"), broken by the locks
    const sh=g.createRadialGradient(-10,-166,4,-10,-166,40);
    sh.addColorStop(0,`rgba(${rim},.16)`); sh.addColorStop(1,`rgba(${rim},0)`);
    g.fillStyle=sh; g.fillRect(-60,-200,120,80);
    g.restore();
    if(this.hair==='bun'){
      // the knot: a coil of hair at the nape
      g.fillStyle='#120f22'; g.beginPath(); g.arc(0,-84,19,0,TAU); g.fill();
      g.strokeStyle=`rgba(${rim},.4)`; g.lineWidth=1.8; g.beginPath(); g.arc(0,-84,19,Math.PI*1.05,Math.PI*1.95); g.stroke();
      g.strokeStyle=`rgba(${rim},.18)`; g.lineWidth=1.2;
      for(const a of [-0.9,-0.2,0.5]){ g.beginPath(); g.arc(0,-84,11,Math.PI*1.1+a,Math.PI*1.8+a); g.stroke(); }
    }
    g.restore();
  },
  // Hair as locks: each lock rises from the crown, follows the curve of the head
  // and falls to a tip set by the style's length profile. Outer locks are drawn
  // first so the inner ones lie over them, the way hair layers from behind.
  hairLocks(style,t){
    const S=HAIR_STYLE[style]||HAIR_STYLE.wolf;
    const out=[];
    for(const layer of S.layers){
      const n=layer.n;
      const order=[...Array(n).keys()].sort((a,b)=>Math.abs(b-(n-1)/2)-Math.abs(a-(n-1)/2));
      for(const i of order){
        const u=(i/(n-1))*2-1;                       // -1 left .. 1 right
        const jit=Math.sin(i*12.9898+layer.seed)*0.5; // stable per-lock variation
        const root=[u*16+jit*2,-176+u*u*6];
        const over=[u*(S.width+8)+jit*2,-150+u*u*6];
        let tipY=layer.len(u)+jit*layer.rough, tipX=u*(S.width+layer.flare)+Math.sign(u)*layer.flick*Math.abs(u)**1.5;
        if(S.gather){ tipX*=0.25; tipY=Math.min(tipY,-90); }
        tipX+=Math.sin(t*0.9+i)*0.6*Math.abs(u);
        const pts=[], N=10;
        for(let k=0;k<=N;k++){
          const q=k/N, a=(1-q)*(1-q), b=2*(1-q)*q, c=q*q;
          const px=a*root[0]+b*over[0]+c*tipX, py=a*root[1]+b*over[1]+c*tipY;
          const dx=2*(1-q)*(over[0]-root[0])+2*q*(tipX-over[0]), dy=2*(1-q)*(over[1]-root[1])+2*q*(tipY-over[1]);
          const l=Math.hypot(dx,dy)||1, nx=-dy/l, ny=dx/l;
          // full body, then a soft taper over the last third (tips stay rounded, never needle-sharp)
          const wd=layer.w*(q<0.62?0.8+0.35*Math.sin(Math.PI*q/0.62*0.5):Math.max(0.18,1-(q-0.62)/0.38*0.82)*1.15);
          pts.push([px,py,wd,nx,ny]);
        }
        out.push({pts,light:0.5+0.5*Math.cos(u*1.3+1.1)});
      }
    }
    return out;
  },
  // The body of the hair under the locks: follows the longest layer, a little
  // shorter, so the gaps between tapering tips never show daylight.
  hairMass(c,style){
    const S=HAIR_STYLE[style]||HAIR_STYLE.wolf, len=S.layers[0].len, W=S.width-2;
    c.moveTo(-W,-142);
    c.bezierCurveTo(-W,-176,-24,-188,0,-188); c.bezierCurveTo(24,-188,W,-176,W,-142);
    for(let k=10;k>=-10;k--){ const u=k/10; const y=S.gather?-100+14*(1-u*u)-34*u*u:Math.max(-140,len(u)-(S.layers[0].rough+16)); c.lineTo(u*W*(S.gather?0.8:0.92),y); }
    c.closePath();
  },
  lockPath(c,L){
    const P=L.pts;
    // same winding as the hair mass, so overlapping shapes union instead of cutting holes
    c.moveTo(P[0][0]-P[0][3]*P[0][2],P[0][1]-P[0][4]*P[0][2]);
    for(let k=1;k<P.length;k++){ const [px,py,wd,nx,ny]=P[k]; c.lineTo(px-nx*wd,py-ny*wd); }
    for(let k=P.length-1;k>=0;k--){ const [px,py,wd,nx,ny]=P[k]; c.lineTo(px+nx*wd,py+ny*wd); }
    c.closePath();
  },
  // Nine seen from behind: the scarf-wearing design, looking up at the moon.
  catBack(g,x,y,h,onShoulder){
    const s=h/112, t=this.t;
    const BASE='#0f0d1c';
    const breathe=1+0.008*Math.sin(t*1.6);
    // Build the silhouette once per frame on offscreen layers so shading and rim light
    // follow the real outline (no seams between head, body and tail).
    const d=this.dpr, pad=50;
    const cw=Math.ceil((130+pad*2)*s*d), chh=Math.ceil((150+pad)*s*d);
    const L=this.layers||(this.layers=[0,1,2].map(()=>document.createElement('canvas')));
    for(const c of L){ if(c.width!==cw||c.height!==chh){ c.width=cw; c.height=chh; } }
    const ox=(45+pad)*s*d, oy=(118)*s*d;
    const sil=(c,col)=>{
      c.save(); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,cw,chh);
      c.translate(ox,oy); c.scale(s*d,s*d*breathe);
      c.fillStyle=col; c.strokeStyle=col;
      c.beginPath();
      c.moveTo(-31,0);
      c.bezierCurveTo(-41,-16,-37,-44,-24,-57); c.bezierCurveTo(-18,-62,-14,-66,-11,-71);
      c.lineTo(12,-71);
      c.bezierCurveTo(14,-66,18,-62,24,-57); c.bezierCurveTo(37,-44,41,-16,31,0);
      c.closePath(); c.fill();
      const sw=Math.sin(t*0.9)*3;
      c.lineWidth=9; c.lineCap='round'; c.beginPath();
      if(onShoulder){ c.moveTo(-18,-4); c.bezierCurveTo(-34,8,-40+sw,34,-30+sw,60); c.bezierCurveTo(-24+sw,70,-16+sw,68,-14+sw,60); c.stroke(); }
      else { c.moveTo(22,-5); c.bezierCurveTo(46,4,70,4,80,-6); c.bezierCurveTo(86,-13,84+sw,-22,78+sw,-26); c.stroke(); }
      c.translate(-2,-82); c.rotate(-0.2);
      c.beginPath(); c.ellipse(0,0,19,16.5,0,0,TAU); c.fill();
      c.beginPath(); c.ellipse(0,6,21,10.5,0,0,TAU); c.fill();
      c.beginPath(); c.moveTo(-19,-2); c.quadraticCurveTo(-21,-20,-16,-32); c.quadraticCurveTo(-7,-24,-1,-14); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(1,-14); c.quadraticCurveTo(8,-25,17,-32); c.quadraticCurveTo(22,-20,19,-2); c.closePath(); c.fill();
      c.restore();
    };
    const [A,Bc,Cc]=L;
    const a=A.getContext('2d'), b=Bc.getContext('2d'), c2=Cc.getContext('2d');
    sil(a,BASE);
    // shading: moonlight from the upper left + soft fur strokes
    sil(c2,BASE);
    c2.save(); c2.globalCompositeOperation='source-atop';
    const lg=c2.createLinearGradient(0,0,cw*0.8,chh);
    lg.addColorStop(0,'rgba(150,135,230,.38)'); lg.addColorStop(0.4,'rgba(80,72,150,.12)'); lg.addColorStop(1,'rgba(0,0,0,0)');
    c2.fillStyle=lg; c2.fillRect(0,0,cw,chh);
    c2.translate(ox,oy); c2.scale(s*d,s*d);
    c2.strokeStyle='rgba(125,115,200,.07)'; c2.lineWidth=0.7;
    for(const f of this.fur){ c2.beginPath(); c2.moveTo(f[0],f[1]); c2.lineTo(f[0]+f[2],f[1]+f[3]); c2.stroke(); }
    c2.restore();
    // rim light: silhouette minus itself shifted away from the moon
    sil(b,'rgba(215,200,255,.75)');
    b.save(); b.globalCompositeOperation='destination-out'; b.drawImage(A,1.4*s*d,1.6*s*d);
    b.globalCompositeOperation='destination-in'; const fg=b.createLinearGradient(0,0,cw*0.9,chh*0.9); fg.addColorStop(0,'rgba(0,0,0,1)'); fg.addColorStop(0.55,'rgba(0,0,0,.5)'); fg.addColorStop(1,'rgba(0,0,0,0)'); b.fillStyle=fg; b.fillRect(0,0,cw,chh); b.restore();

    g.save();
    g.setTransform(1,0,0,1,0,0);
    const px=x*d-ox, py=y*d-oy;
    g.shadowColor='rgba(175,155,255,.6)'; g.shadowBlur=22*s*d;
    g.drawImage(A,px,py);
    g.shadowBlur=0;
    g.drawImage(Cc,px,py);
    g.drawImage(Bc,px,py);
    g.restore();

    g.save(); g.translate(x,y); g.scale(s,s*breathe);
    // whiskers peeking out from the cheeks
    g.save(); g.translate(-2,-82); g.rotate(-0.2);
    g.strokeStyle='rgba(200,195,240,.55)'; g.lineWidth=0.9;
    for(const [a,b,c,d] of [[-20,6,-38,2],[-20,9,-37,11],[20,6,38,2],[20,9,37,11]]){ g.beginPath(); g.moveTo(a,b); g.quadraticCurveTo((a+c)/2,(b+d)/2-2,c,d); g.stroke(); }
    g.restore();

    // blue knitted scarf: a wrap and two ends down the back
    const sw=Math.sin(t*1.3)*1.6;
    const blue=g.createLinearGradient(-16,-76,16,-60); blue.addColorStop(0,'#5d9cff'); blue.addColorStop(1,'#2d5fc8');
    g.fillStyle=blue;
    g.beginPath(); g.moveTo(-16,-76); g.quadraticCurveTo(0,-67,16,-76); g.lineTo(17,-65); g.quadraticCurveTo(0,-56,-17,-65); g.closePath(); g.fill();
    g.strokeStyle='rgba(170,205,255,.45)'; g.lineWidth=0.8;
    for(let i=-14;i<=14;i+=4){ g.beginPath(); g.moveTo(i,-73+Math.abs(i)*0.18); g.lineTo(i+1,-63+Math.abs(i)*0.2); g.stroke(); }
    g.strokeStyle=blue; g.lineCap='round';
    g.lineWidth=7.5; g.beginPath(); g.moveTo(-5,-62); g.bezierCurveTo(-7+sw,-53,-3+sw,-46,-6+sw*1.4,-38); g.stroke();
    g.lineWidth=6; g.beginPath(); g.moveTo(3,-62); g.bezierCurveTo(5+sw,-54,2+sw,-49,4+sw*1.2,-42); g.stroke();
    g.fillStyle='#8fbaff'; for(const [fx,fy] of [[-6+sw*1.4,-36],[4+sw*1.2,-40]]) for(let k=-2;k<=2;k++){ g.fillRect(fx+k*1.3-0.4,fy,0.8,3); }
    g.restore();
  },
  mix(a,b){ const k=this.warm; const pa=a.match(/\w\w/g).map(h=>parseInt(h,16)), pb=b.match(/\w\w/g).map(h=>parseInt(h,16)); return 'rgb('+pa.map((v,i)=>Math.round(v+(pb[i]-v)*k)).join(',')+')'; },
  glow(g,x,y,r,col,a){ const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,col.replace('A',a)); gr.addColorStop(1,col.replace('A',0)); g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2); }
};
root.NEKO_TITLE=T;
})(window);
