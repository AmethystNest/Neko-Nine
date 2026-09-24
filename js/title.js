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
    // window
    const wx=W*0.46, wy=H*0.1, ww=W*0.46, wh=H*0.66;
    const sky=g.createLinearGradient(0,wy,0,wy+wh);
    sky.addColorStop(0,'#0a1230'); sky.addColorStop(0.6,'#1a2350'); sky.addColorStop(1,'#3a2c4a');
    g.fillStyle=sky; g.fillRect(wx,wy,ww,wh);
    g.save(); g.beginPath(); g.rect(wx,wy,ww,wh); g.clip();
    // moon behind thin clouds
    const mx=wx+ww*0.78, my=wy+wh*0.2;
    this.glow(g,mx,my,wh*0.45,'rgba(200,215,255,A)',0.18);
    g.fillStyle='#e9ecf6'; g.beginPath(); g.arc(mx,my,wh*0.055,0,TAU); g.fill();
    // city bokeh ("the town where you live")
    for(const b of this.city){
      const a=b.a*(0.75+0.25*Math.sin(this.t*0.8+b.p));
      g.fillStyle=`rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a*0.35})`;
      g.beginPath(); g.arc(wx+b.x*ww,wy+b.y*wh,b.r*(W/900),0,TAU); g.fill();
    }
    // rain outside
    g.strokeStyle='rgba(170,190,235,.22)'; g.lineWidth=1; g.beginPath();
    for(const s of this.streaks){
      s.y+=dt*1.4*s.s; if(s.y>1.05){ s.y=-0.05; s.x=Math.random(); }
      const x=wx+s.x*ww, y=wy+s.y*wh; g.moveTo(x,y); g.lineTo(x-3,y+14*s.s);
    }
    g.stroke();
    // drops on the glass
    for(let i=0;i<this.drops.length;i++){
      const d=this.drops[i];
      if(d.stick>0) d.stick-=dt; else d.y+=d.v*dt*2;
      if(d.y>1.02){ this.drops[i]=this.newDrop(false); continue; }
      const x=wx+d.x*ww, y=wy+d.y*wh, r=d.r*ww;
      if(d.stick<=0){ g.strokeStyle='rgba(200,215,255,.08)'; g.lineWidth=r*0.9; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y-r*6); g.stroke(); }
      g.fillStyle='rgba(210,225,255,.22)'; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill();
      g.fillStyle='rgba(255,255,255,.45)'; g.beginPath(); g.arc(x-r*0.3,y-r*0.3,r*0.3,0,TAU); g.fill();
    }
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
    g.fillStyle='rgba(170,190,255,.045)'; g.beginPath(); g.moveTo(wx,wy+wh); g.lineTo(wx+ww,wy+wh); g.lineTo(wx+ww*0.9,H); g.lineTo(wx-ww*0.35,H); g.fill();
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
    // Nine on the sill, looking out
    const sp=(this.t%5.2>5.05)?this.sp.sitBlink:this.sp.sit;
    const sc=Math.max(3,Math.round(H*0.0105));
    const cw=sp.width*sc, ch=sp.height*sc;
    const cx=wx+ww*0.3, cy=sy;
    g.save(); g.imageSmoothingEnabled=false;
    this.glow(g,cx,cy-ch*0.5,ch*1.1,'rgba(170,190,255,A)',0.12);
    g.drawImage(sp,cx-cw/2,cy-ch,cw,ch);
    g.restore();
    // vignette
    const vg=g.createRadialGradient(W*0.55,H*0.45,H*0.2,W*0.5,H*0.5,H*1.1);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.65)');
    g.fillStyle=vg; g.fillRect(0,0,W,H);
  },
  mix(a,b){ const k=this.warm; const pa=a.match(/\w\w/g).map(h=>parseInt(h,16)), pb=b.match(/\w\w/g).map(h=>parseInt(h,16)); return 'rgb('+pa.map((v,i)=>Math.round(v+(pb[i]-v)*k)).join(',')+')'; },
  glow(g,x,y,r,col,a){ const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,col.replace('A',a)); gr.addColorStop(1,col.replace('A',0)); g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2); }
};
root.NEKO_TITLE=T;
})(window);
