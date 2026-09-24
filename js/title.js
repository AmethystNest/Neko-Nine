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
      gr.addColorStop(0,`rgba(${c.col},${c.a})`); gr.addColorStop(1,`rgba(${c.col},0)`);
      g.fillStyle=gr; g.beginPath(); g.ellipse(cx,cy,r*1.7,r,0,0,TAU); g.fill();
    }
    // stars
    for(const st of this.stars){
      const a=st.a*(0.55+0.45*Math.sin(this.t*st.s+st.p));
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
    this.catBack(g,wx+ww*0.62,sy,wh*0.46);
    // vignette
    const vg=g.createRadialGradient(W*0.55,H*0.45,H*0.2,W*0.5,H*0.5,H*1.1);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.65)');
    g.fillStyle=vg; g.fillRect(0,0,W,H);
  },
  catBack(g,x,y,h){
    const s=h/110;
    const path=()=>{
      g.beginPath();
      g.moveTo(-26,0);
      g.bezierCurveTo(-36,-22,-30,-54,-12,-66);
      g.bezierCurveTo(-16,-74,-17,-86,-12,-93);
      g.lineTo(-17,-111); g.lineTo(-2,-100);
      g.bezierCurveTo(1,-100,5,-100,8,-98);
      g.lineTo(19,-109); g.lineTo(17,-90);
      g.bezierCurveTo(19,-84,17,-73,12,-66);
      g.bezierCurveTo(30,-54,36,-22,28,0);
      g.closePath();
    };
    g.save(); g.translate(x,y); g.scale(s,s);
    // soft glow from the moon behind the silhouette
    this.glow(g,-10,-70,90,'rgba(200,180,255,A)',0.10);
    // tail along the sill
    g.strokeStyle='#0d0b17'; g.lineWidth=7; g.lineCap='round';
    g.beginPath(); g.moveTo(22,-3); g.bezierCurveTo(50,4,72,2,78,-8); g.bezierCurveTo(82,-16,80,-24,76,-26); g.stroke();
    path(); g.fillStyle='#0d0b17'; g.fill();
    // rim light where the moonlight touches (upper left)
    g.save(); path(); g.clip();
    g.strokeStyle='rgba(190,175,240,.55)'; g.lineWidth=3; g.translate(3,2); path(); g.stroke();
    g.restore();
    // blue collar and a tiny glint of the bell
    g.strokeStyle='#3d86f0'; g.lineWidth=3.2; g.beginPath(); g.moveTo(-12,-67); g.quadraticCurveTo(0,-62,12,-67); g.stroke();
    g.strokeStyle='rgba(168,206,255,.8)'; g.lineWidth=1; g.beginPath(); g.moveTo(-10,-68); g.quadraticCurveTo(0,-64,4,-66); g.stroke();
    g.restore();
  },
  mix(a,b){ const k=this.warm; const pa=a.match(/\w\w/g).map(h=>parseInt(h,16)), pb=b.match(/\w\w/g).map(h=>parseInt(h,16)); return 'rgb('+pa.map((v,i)=>Math.round(v+(pb[i]-v)*k)).join(',')+')'; },
  glow(g,x,y,r,col,a){ const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,col.replace('A',a)); gr.addColorStop(1,col.replace('A',0)); g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2); }
};
root.NEKO_TITLE=T;
})(window);
