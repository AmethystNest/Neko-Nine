// Neko Nine title scene: a rainy window at night, Nine on the windowsill.
(function(root){
'use strict';
const TAU=Math.PI*2;
// Wolf cut traced from a pixel-art illustration (outline simplified, mirrored so the
// face turns toward Nine). Flat x,y pairs in owner units; the crown sits at y=-186.
const HAIR_TRACE=[15.5,-82,14.5,-85.5,15.5,-86.5,17.5,-86.5,18.5,-87,18,-90.5,19,-92.5,20.5,-94,22.5,-94,25,-96,31.5,-96.5,35.5,-99.5,40,-104,44,-112,47,-113.5,49.5,-118,52,-120,55,-125.5,56.5,-132,55.5,-137,56.5,-141,55,-146.5,55,-148,56,-150,55,-152.5,54,-154.5,52,-160,49.5,-164.5,49.5,-166.5,47.5,-169.5,47.5,-170.5,48.5,-172.5,47,-175,42.5,-179,41,-180,39,-180.5,36.5,-182,28.5,-182,26.5,-183.5,19,-186,13.5,-186,8.5,-184.5,4.5,-180.5,0.5,-179.5,-1,-177,-4.5,-174.5,-6,-174.5,-8,-177.5,-9,-177.5,-13,-173,-15.5,-170,-19,-166,-22.5,-161,-26,-152.5,-25.5,-148.5,-27.5,-142,-28.5,-135,-28,-133.5,-25,-129.5,-23,-123,-20,-118.5,-14.5,-105,-16.5,-99.5,-15.5,-97,-16.5,-94,-17.5,-92.5,-22.5,-88,-21.5,-85.5,-21.5,-83.5,-19.5,-83.5,-17.5,-82,-4,-82,-3.5,-82,-3.5,-80,-4,-77,-1.5,-79.5,-1,-82,-1.5,-75,0.5,-78.5,1,-83,0.5,-79.5,1,-76.5,2.5,-79,3,-83.5,2.5,-79,3.5,-74,5,-78,5,-82,5,-79.5,6,-76,7,-79,7.5,-83,7,-79,8.5,-74.5,9,-78.5,9.5,-83.5,9,-79.5,11,-76.5,11.5,-82,11.5,-79,13.5,-75,14,-83,13.5,-80,15.5,-77.5,15,-79.5,15.5,-81.5];
// the illustration's own sheen (grayscale JPEG: brightness = strength), tinted by the scene light
const HAIR_SHEEN={box:[-28.9,-186.3,85.8,105.2],src:'data:image/jpeg;base64,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'};
const T={
  init(canvas,sprites){
    this.cv=canvas; this.g=canvas.getContext('2d');
    this.sp=sprites; this.t=0; this.warm=0; this.cleared=false; this.dawn=false; this.dk=0;
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
  // You, seen from behind: shoulders relaxed, head turned toward Nine, a wolf cut.
  // Units: shoulder line near y=-96, crown at y=-182; s = pixels per unit.
  ownerBack(g,x,y,s){
    const t=this.t, br=Math.sin(t*1.1)*0.7;
    // now and then you glance toward Nine, then settle back
    const gp=(t%11)/11, gl=gp>0.7&&gp<0.94?Math.sin((gp-0.7)/0.24*Math.PI):0;
    const tilt=0.09+0.006*Math.sin(t*0.55)+0.07*gl*gl*(3-2*gl);
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
    // hair tips drift a little with the breath
    const sway=Math.sin(t*0.8)*1.1+Math.sin(t*1.9)*0.35;
    const hairShape=c=>{ c.save(); tiltAt(c); c.beginPath(); this.tracePath(c,sway); c.fill(); c.restore(); };
    this.lit(g,x,y,s,'ownerBody',[-100,-110,100,130],body,'rgba(175,155,255,.45)');
    g.save(); g.translate(x,y); g.scale(s,s);
    g.strokeStyle='rgba(185,170,245,.22)'; g.lineWidth=2;
    g.beginPath(); g.moveTo(-34,-70+br); g.quadraticCurveTo(0,-58+br,34,-70+br); g.stroke();
    g.strokeStyle='rgba(150,140,220,.06)'; g.lineWidth=1;
    for(let yy=-50;yy<130;yy+=9){ g.beginPath(); g.moveTo(-80,yy); g.quadraticCurveTo(0,yy+4,80,yy); g.stroke(); }
    g.restore();
    this.lit(g,x,y,s,'ownerHair',[-80,-195,80,0],hairShape,'rgba(175,155,255,.5)');
    const warm=this.dk||0, rim=warm>0.5?'255,205,160':'200,185,255';
    g.save(); g.translate(x,y); g.scale(s,s); tiltAt(g);
    g.beginPath(); this.tracePath(g,sway); g.clip();
    // sheen from the illustration, tinted to the light (cached per tint)
    const img=this.sheenImg||(this.sheenImg=Object.assign(new Image(),{src:HAIR_SHEEN.src}));
    if(img.complete&&img.naturalWidth){
      if(!this.sheenCv||this.sheenRim!==rim){
        const c=this.sheenCv||(this.sheenCv=document.createElement('canvas')); c.width=img.naturalWidth; c.height=img.naturalHeight;
        const q=c.getContext('2d'); q.clearRect(0,0,c.width,c.height); q.drawImage(img,0,0);
        const id=q.getImageData(0,0,c.width,c.height), px=id.data;
        for(let i=0;i<px.length;i+=4){ px[i+3]=px[i]; px[i]=px[i+1]=px[i+2]=255; } // brightness -> alpha
        q.putImageData(id,0,0);
        q.globalCompositeOperation='source-in'; q.fillStyle=`rgb(${rim})`; q.fillRect(0,0,c.width,c.height); q.globalCompositeOperation='source-over';
        this.sheenRim=rim;
      }
      const [bx,by,bw,bh]=HAIR_SHEEN.box;
      g.globalAlpha=0.34; g.imageSmoothingQuality='high'; g.drawImage(this.sheenCv,bx,by,bw,bh); g.globalAlpha=1;
    }
    const sh=g.createRadialGradient(-2,-168,4,-2,-168,40);
    sh.addColorStop(0,`rgba(${rim},.06)`); sh.addColorStop(1,`rgba(${rim},0)`);
    g.fillStyle=sh; g.fillRect(-60,-200,120,80);
    g.restore();
  },
  // The traced wolf cut as a path. sway shifts the lower hair sideways, growing toward the tips.
  tracePath(c,sway=0){
    const P=HAIR_TRACE, k=y=>{ const v=Math.min(1,Math.max(0,(y+125)/50)); return sway*v*v; };
    c.moveTo(P[0]+k(P[1]),P[1]); for(let i=2;i<P.length;i+=2) c.lineTo(P[i]+k(P[i+1]),P[i+1]); c.closePath();
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
root.NEKO_HAIR={path:(c,sway)=>T.tracePath(c,sway)};
})(window);
