// Neko Nine title scene: a rainy window at night, Nine on the windowsill.
(function(root){
'use strict';
const TAU=Math.PI*2;
const T={
  init(canvas,sprites){
    this.cv=canvas; this.g=canvas.getContext('2d');
    this.sp=sprites; this.t=0; this.warm=0; this.cleared=false;
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
    // soft clouds, layered like washes of paint
    for(const c of this.clouds){
      c.x+=c.v*dt; if(c.x>1.3) c.x=-0.3;
      const cx=wx+c.x*ww, cy=wy+c.y*wh, r=c.r*wh;
      const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
      gr.addColorStop(0,`rgba(${c.col},${c.a*(1-0.5*this.warm)})`); gr.addColorStop(1,`rgba(${c.col},0)`);
      g.fillStyle=gr; g.beginPath(); g.ellipse(cx,cy,r*1.7,r,0,0,TAU); g.fill();
    }
    // stars
    for(const st of this.stars){
      const a=Math.min(1,st.a*(1+0.35*this.warm)*(0.55+0.45*Math.sin(this.t*st.s+st.p)));
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
    g.drawImage(mc,mx-ms/2,my-ms/2);
    // shooting star (after the rain has stopped)
    if(this.cleared){
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
    // Nine on the sill, seen from behind, looking up at the moon
    if(this.cleared){
      // after the ending: you and Nine, together at the window
      const ox=wx+ww*0.5, oy=wy+wh*0.78;
      const os=wh*0.78/220;
      this.ownerBack(g,ox,oy,wh*0.78);
      this.catBack(g,ox+60*os,oy-12*os,wh*0.28,true);
    }else{
      this.catBack(g,wx+ww*0.64,sy,wh*0.5);
    }
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
  // You, seen from behind: a wolf cut and an oversized hoodie, Nine on your shoulder.
  ownerBack(g,x,y,h){
    const s=h/220, t=this.t;
    const br=Math.sin(t*1.1)*0.8;
    this.lit(g,x,y,s,'owner',[-110,-150,110,220],c=>{
      // hoodie body, soft shoulders
      c.beginPath();
      c.moveTo(-96,220); c.bezierCurveTo(-100,120,-96,40,-78,12+br);
      c.bezierCurveTo(-60,-8,-34,-18,-14,-22+br);
      c.lineTo(14,-22+br);
      c.bezierCurveTo(34,-18,60,-8,78,12+br);
      c.bezierCurveTo(96,40,100,120,96,220); c.closePath(); c.fill();
      // hood lying on the upper back
      c.beginPath(); c.ellipse(0,-6+br,40,20,0,0,TAU); c.fill();
      // neck
      c.fillRect(-11,-40,22,26);
      // head, tilted toward Nine
      c.save(); c.translate(3,-72+br); c.rotate(0.14); c.scale(1.1,1.1);
      c.beginPath(); c.ellipse(0,0,26,29,0,0,TAU); c.fill();
      // wolf cut: a rounded crown, soft choppy layers, a longer nape
      c.beginPath();
      c.moveTo(-31,-2);
      c.bezierCurveTo(-36,-40,36,-40,31,-2);
      const locks=[[36,14],[29,11],[38,30],[27,25],[31,45],[20,37],[17,60],[8,47],[1,66],[-7,47],[-16,60],[-20,37],[-30,45],[-27,25],[-38,30],[-29,11],[-36,14],[-31,-2]];
      let px=31, py=-2;
      for(const [lx,ly] of locks){ c.quadraticCurveTo((px+lx)/2+(ly>py?2:-2)*Math.sign(lx||1),(py+ly)/2,lx,ly); px=lx; py=ly; }
      c.closePath(); c.fill();
      // a few soft flyaway tufts on the crown
      for(const [tx,ty,r,a] of [[-18,-27,5,-0.7],[20,-26,5,0.7]]){ c.beginPath(); c.ellipse(tx,ty,r*0.7,r,a,0,TAU); c.fill(); }
      c.restore();
      // shoulder seam where Nine sits
      c.beginPath(); c.ellipse(58,-4+br,26,10,0.15,0,TAU); c.fill();
    },'rgba(175,155,255,.5)');
    // hoodie drawstrings catching the moonlight
    g.save(); g.translate(x,y); g.scale(s,s);
    g.strokeStyle='rgba(190,180,240,.35)'; g.lineWidth=1.4;
    g.beginPath(); g.moveTo(-26,-8+br); g.quadraticCurveTo(-30,4,-28,14); g.stroke();
    g.restore();
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
