// Neko Nine renderer: stage themes, trap visuals, particles and the ending scene.
(function(root){
'use strict';
const E=root.NEKO_ENGINE;
const {K,G,WH,VIEW_W,clamp}=E;
const TAU=Math.PI*2;

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------
function rng(seed){ let s=seed>>>0||1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>17; s^=s<<5; s>>>=0; return (s%100000)/100000; }; }
function rect(g,c,x,y,w,h){ g.fillStyle=c; g.fillRect(x,y,w,h); }
function line(g,c,lw,pts){ g.strokeStyle=c; g.lineWidth=lw; g.beginPath(); g.moveTo(pts[0],pts[1]); for(let i=2;i<pts.length;i+=2) g.lineTo(pts[i],pts[i+1]); g.stroke(); }
function circ(g,c,x,y,r){ g.fillStyle=c; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
function glow(g,x,y,r,col,a){
  const gr=g.createRadialGradient(x,y,0,x,y,r);
  gr.addColorStop(0,col.replace('A',a)); gr.addColorStop(1,col.replace('A',0));
  g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2);
}
function spikesUp(g,x,y,w,h,c1,c2){
  const n=Math.max(2,Math.round(w/14)); const sw=w/n;
  for(let i=0;i<n;i++){
    g.fillStyle=c1; g.beginPath(); g.moveTo(x+i*sw,y); g.lineTo(x+i*sw+sw/2,y-h); g.lineTo(x+(i+1)*sw,y); g.fill();
    g.fillStyle=c2; g.beginPath(); g.moveTo(x+i*sw+sw/2,y-h); g.lineTo(x+(i+1)*sw,y); g.lineTo(x+i*sw+sw*0.62,y); g.fill();
  }
}
function spikesDown(g,x,y,w,h,c1,c2){
  const n=Math.max(2,Math.round(w/14)); const sw=w/n;
  for(let i=0;i<n;i++){
    g.fillStyle=c1; g.beginPath(); g.moveTo(x+i*sw,y); g.lineTo(x+i*sw+sw/2,y+h); g.lineTo(x+(i+1)*sw,y); g.fill();
    g.fillStyle=c2; g.beginPath(); g.moveTo(x+i*sw+sw/2,y+h); g.lineTo(x+(i+1)*sw,y); g.lineTo(x+i*sw+sw*0.62,y); g.fill();
  }
}

// Floor painter factory: world-aligned patterns so trap floors are seamless.
function floorPainter(o){
  return function(g,x,y,w,h){
    if(w<=0) return;
    g.save();
    g.beginPath(); g.rect(x,y,w,h); g.clip();
    rect(g,o.body,x,y,w,h);
    if(o.band) rect(g,o.band[0],x,y+o.band[1],w,o.band[2]);
    if(o.seam){
      g.strokeStyle=o.seam; g.lineWidth=2;
      const rowH=o.rowH||42;
      for(let r=0,yy=y+(o.top?o.top[1]:5);yy<y+h;yy+=rowH,r++){
        g.beginPath(); g.moveTo(x,yy+rowH); g.lineTo(x+w,yy+rowH); g.stroke();
        const off=(r%2)*(o.step/2);
        const x0=Math.floor((x-off)/o.step)*o.step+off;
        for(let xx=x0;xx<x+w;xx+=o.step){ g.beginPath(); g.moveTo(xx,yy); g.lineTo(xx,yy+rowH); g.stroke(); }
      }
    }
    if(o.extra) o.extra(g,x,y,w,h);
    if(o.top) rect(g,o.top[0],x,y,w,o.top[1]);
    if(o.lip) rect(g,o.lip,x,y+(o.top?o.top[1]:0),w,2);
    g.restore();
  };
}

// Door painter.
function drawDoor(g,x,y,pal,t,opts){
  const w=42,h=82,top=y-h;
  opts=opts||{};
  if(opts.glow){ glow(g,x,y-40,110,'rgba(255,214,150,A)',0.28+0.06*Math.sin(t*2)); }
  rect(g,pal.frame,x-w/2-4,top-5,w+8,h+5);
  rect(g,pal.panel,x-w/2,top,w,h);
  g.strokeStyle=pal.line; g.lineWidth=2;
  if(pal.planks){ for(let dx=-w/2+10;dx<w/2;dx+=10){ g.beginPath(); g.moveTo(x+dx,top+3); g.lineTo(x+dx,top+h-3); g.stroke(); } }
  else { g.strokeRect(x-w/2+6,top+7,w-12,h*0.38); g.strokeRect(x-w/2+6,top+h*0.5,w-12,h*0.42); }
  g.strokeStyle=pal.frame; g.lineWidth=3; g.strokeRect(x-w/2,top,w,h);
  circ(g,pal.knob,x+w*0.28,top+h*0.53,3.8);
  if(opts.leak){ rect(g,'rgba(255,220,160,.85)',x-w/2+2,y-3,w-4,3); }
  if(pal.sign){ rect(g,pal.sign,x-15,top-22,30,12); g.fillStyle='#fff'; g.font='bold 8px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('EXIT',x,top-16); }
}

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------
const TH={};

TH.hall={
  edge:'#15151a', pit:'#020204', ceil:null,
  door:{frame:'#514334',panel:'#796148',line:'rgba(46,35,26,.42)',knob:'#d2b36f',planks:true},
  floor:floorPainter({body:'#77746c',top:['#aaa395',5],seam:'rgba(35,34,31,.16)',step:110}),
  bg(g,W){
    rect(g,'#d9caa8',0,0,W,G);
    rect(g,'#cbbb97',0,0,W,34); rect(g,'#b9a784',0,34,W,5);
    g.strokeStyle='rgba(82,72,58,.10)'; g.lineWidth=2;
    for(let x=95;x<W;x+=185){ g.beginPath(); g.moveTo(x,42); g.lineTo(x,G-18); g.stroke(); }
    line(g,'rgba(72,62,49,.13)',2,[145,112,157,124,150,139,165,151]);
    line(g,'rgba(72,62,49,.13)',2,[782,170,769,184,778,198]);
    g.fillStyle='rgba(100,83,60,.055)';
    g.beginPath(); g.ellipse(205,300,58,21,-.15,0,TAU); g.fill();
    g.beginPath(); g.ellipse(820,280,74,25,.1,0,TAU); g.fill();
    // baseboard
    rect(g,'#a8977a',0,G-14,W,14); rect(g,'#8f7f64',0,G-14,W,2);
    // window with night outside
    rect(g,'#6d5d48',628,96,112,104); rect(g,'#1c2236',634,102,100,92);
    circ(g,'#e8e2c8',706,126,9); circ(g,'#1c2236',710,123,8);
    rect(g,'#6d5d48',682,102,4,92); rect(g,'#6d5d48',634,146,100,4);
    // small framed photo: a person and a cat
    rect(g,'#6b5842',170,150,58,44); rect(g,'#efe4cc',175,155,48,34);
    circ(g,'#8a7760',192,166,5); rect(g,'#8a7760',186,171,12,14);
    rect(g,'#222',205,178,12,7); circ(g,'#222',215,176,4);
    // wall lamp
    rect(g,'#6d5d48',452,120,6,20);
    glow(g,455,150,70,'rgba(255,220,150,A)',0.25);
    g.fillStyle='#e9d9a8'; g.beginPath(); g.moveTo(440,140); g.lineTo(470,140); g.lineTo(462,158); g.lineTo(448,158); g.fill();
    line(g,'rgba(74,61,45,.20)',3,[52,G-28,126,G-28]);
  }
};

TH.home=Object.assign({},TH.hall,{
  bg(g,W){
    rect(g,'#3a3b4c',0,0,W,G);
    rect(g,'#33344a',0,0,W,34); rect(g,'#2a2b3d',0,34,W,5);
    g.strokeStyle='rgba(20,20,30,.25)'; g.lineWidth=2;
    for(let x=95;x<W;x+=185){ g.beginPath(); g.moveTo(x,42); g.lineTo(x,G-18); g.stroke(); }
    rect(g,'#2d2e3f',0,G-14,W,14);
    // moonlit windows
    for(const wx of [230,760,1330]){
      rect(g,'#232334',wx,96,112,104); rect(g,'#0f1426',wx+6,102,100,92);
      circ(g,'#d8dcef',wx+72,126,8);
      rect(g,'#232334',wx+54,102,4,92); rect(g,'#232334',wx+6,146,100,4);
      g.fillStyle='rgba(190,205,255,.06)'; g.beginPath(); g.moveTo(wx+6,194); g.lineTo(wx+106,194); g.lineTo(wx+160,G); g.lineTo(wx-40,G); g.fill();
    }
    // warm glow toward the last door
    const gr=g.createLinearGradient(1350,0,1800,0);
    gr.addColorStop(0,'rgba(255,190,120,0)'); gr.addColorStop(1,'rgba(255,190,120,.22)');
    g.fillStyle=gr; g.fillRect(1350,0,450,G);
    // name plate
    rect(g,'#6d5d48',1664,286,72,16); g.fillStyle='#e8d8b0'; g.font='bold 10px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('201',1700,294);
  },
  floor:floorPainter({body:'#4b4a4f',top:['#6c6a6a',5],seam:'rgba(0,0,0,.2)',step:110}),
  door:{frame:'#4a3a2c',panel:'#7a5e45',line:'rgba(30,20,10,.45)',knob:'#e3c27a',planks:true}
});

TH.alley={
  edge:'#07080d', pit:'#010103', ceil:null, rain:true,
  door:{frame:'#2b2f38',panel:'#4a5566',line:'rgba(0,0,0,.35)',knob:'#c9b27a'},
  floor:floorPainter({body:'#2c2f36',top:['#50555f',4],seam:'rgba(0,0,0,.25)',step:120,rowH:46,
    extra(g,x,y,w,h){ g.fillStyle='rgba(140,170,220,.10)'; for(const px of [120,560,900]) if(px>x-60&&px<x+w+60){ g.beginPath(); g.ellipse(px,y+10,44,4,0,0,TAU); g.fill(); } }}),
  bg(g,W){
    const sky=g.createLinearGradient(0,0,0,G);
    sky.addColorStop(0,'#0b0f1e'); sky.addColorStop(1,'#1d2233');
    g.fillStyle=sky; g.fillRect(0,0,W,G);
    const r=rng(7);
    // far buildings
    for(let x=0;x<W;x+=70){ const h=120+r()*120; rect(g,'#141828',x,G-h-60,72,h+60); for(let wy=G-h-40;wy<G-60;wy+=26) for(let wx=x+10;wx<x+64;wx+=18) if(r()<.25) rect(g,'rgba(255,210,130,.35)',wx,wy,8,11); }
    // near brick wall
    rect(g,'#3b2b2a',0,150,W,G-150);
    g.strokeStyle='rgba(0,0,0,.25)'; g.lineWidth=1.5;
    for(let y=150,row=0;y<G;y+=16,row++){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); for(let x=(row%2)*20;x<W;x+=40){ g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+16); g.stroke(); } }
    rect(g,'#2b1f1e',0,150,W,8);
    // pipes & sign
    rect(g,'#2a2d33',60,150,8,G-150); rect(g,'#2a2d33',620,150,6,G-150);
    rect(g,'#23262d',840,190,90,40); g.fillStyle='#e05a6a'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('BAR',885,211);
    glow(g,885,210,70,'rgba(224,90,106,A)',0.18);
    // lamppost
    rect(g,'#1c1e24',430,190,6,G-190); rect(g,'#1c1e24',430,190,30,5);
    g.fillStyle='rgba(255,226,160,.10)'; g.beginPath(); g.moveTo(452,198); g.lineTo(390,G); g.lineTo(530,G); g.fill();
    circ(g,'#ffe6a8',456,198,4);
    // trash bags
    circ(g,'#16181c',40,G-10,14); circ(g,'#1b1d22',62,G-8,11);
  }
};

TH.factory={
  edge:'#120c09', pit:'#060302', ceil:90,
  door:{frame:'#3a2a20',panel:'#6b4a33',line:'rgba(0,0,0,.35)',knob:'#d6a35a',planks:true},
  floor:floorPainter({body:'#4d4038',top:['#8b735d',6],seam:'rgba(20,12,8,.35)',step:100,rowH:40,
    extra(g,x,y,w,h){ g.fillStyle='rgba(220,170,115,.25)'; const x0=Math.floor(x/50)*50+25; for(let xx=x0;xx<x+w;xx+=50) g.fillRect(xx,y+14,3,3); }}),
  bg(g,W){
    rect(g,'#5b4636',0,0,W,G);
    const r=rng(3);
    for(let x=0;x<W;x+=120){ rect(g,'rgba(0,0,0,.08)',x,90,60,G-90); }
    g.strokeStyle='rgba(214,147,91,.20)'; g.lineWidth=3;
    for(let x=105;x<W;x+=190){ g.beginPath(); g.moveTo(x,94); g.lineTo(x,G-38); g.stroke(); g.beginPath(); g.moveTo(x,120); g.lineTo(x+60,190); g.stroke(); }
    // big pipes
    rect(g,'#3f2f26',0,150,W,16); rect(g,'rgba(255,200,150,.10)',0,152,W,3);
    for(let x=40;x<W;x+=160) rect(g,'#2e221b',x,146,12,24);
    // rust stains
    for(let i=0;i<14;i++){ g.fillStyle='rgba(120,60,30,.12)'; g.beginPath(); g.ellipse(r()*W,200+r()*180,20+r()*40,6+r()*12,0,0,TAU); g.fill(); }
    // hazard stripes
    for(let x=0;x<W;x+=26){ g.fillStyle=(x/26)%2?'#2a2018':'#9a7a3a'; g.fillRect(x,G-12,26,6); }
    // ceiling
    rect(g,'#352720',0,0,W,90); rect(g,'#76513a',0,83,W,7);
    g.strokeStyle='rgba(198,139,91,.28)'; g.lineWidth=2;
    for(let x=38;x<W;x+=88){ g.beginPath(); g.moveTo(x,49); g.lineTo(x,89); g.stroke(); }
    g.fillStyle='rgba(220,170,115,.34)'; for(let x=18;x<W;x+=44) g.fillRect(x,64,3,3);
    for(let x=170;x<W;x+=250){ glow(g,x,118,60,'rgba(235,178,100,A)',0.22); rect(g,'#9a6847',x-5,95,10,14); }
  }
};

TH.sewer={
  edge:'#0d0914', pit:'#050309', ceil:90,
  door:{frame:'#2c2838',panel:'#4b5362',line:'rgba(0,0,0,.35)',knob:'#b7c08a'},
  floor:floorPainter({body:'#35303f',top:['#6a6378',4],lip:'rgba(160,190,255,.18)',seam:'rgba(0,0,0,.25)',step:90,rowH:40}),
  bg(g,W){
    rect(g,'#2a2233',0,0,W,G);
    for(let y=120;y<G;y+=60) rect(g,'rgba(255,255,255,.025)',0,y,W,30);
    g.strokeStyle='rgba(0,0,0,.25)'; g.lineWidth=2;
    for(let x=0;x<W;x+=115){ g.beginPath(); g.moveTo(x,90); g.lineTo(x,G); g.stroke(); }
    // pipes
    g.strokeStyle='#4a3f5a'; g.lineWidth=14; g.beginPath(); g.moveTo(70,140); g.lineTo(280,140); g.arc(280,170,30,-Math.PI/2,0); g.lineTo(310,240); g.stroke();
    g.strokeStyle='#3d344b'; g.lineWidth=10; g.beginPath(); g.moveTo(520,120); g.lineTo(W,120); g.stroke();
    // drips / stains
    const r=rng(11);
    for(let i=0;i<10;i++){ g.fillStyle='rgba(120,160,120,.08)'; const x=r()*W; g.fillRect(x,90,3+r()*4,60+r()*150); }
    // warning lamps
    for(let x=150;x<W;x+=260){ rect(g,'#6a3a3a',x-6,100,12,10); glow(g,x,108,40,'rgba(255,80,80,A)',0.15); }
    // hazard stripes
    for(let x=0;x<W;x+=24){ g.fillStyle=(x/24)%2?'#1f1a28':'#6f8a2e'; g.fillRect(x,G-10,24,5); }
    rect(g,'#3a2f28',0,0,W,90); rect(g,'#5a4a3c',0,83,W,7);
    g.strokeStyle='rgba(160,130,100,.22)'; g.lineWidth=2;
    for(let x=38;x<W;x+=88){ g.beginPath(); g.moveTo(x,49); g.lineTo(x,89); g.stroke(); }
  }
};

TH.lab={
  edge:'#15181b', pit:'#07080a', ceil:90,
  door:{frame:'#3a4046',panel:'#56616b',line:'rgba(0,0,0,.25)',knob:'#e0e4e8',sign:'#2f9e5a'},
  floor:floorPainter({body:'#9da3a8',top:['#eceff1',6],seam:'rgba(53,58,63,.45)',step:100,rowH:60,
    band:['#4c5257',34,18]}),
  bg(g,W){
    rect(g,'#d9dcdf',0,0,W,G);
    rect(g,'#eef0f2',0,90,W,76);
    for(const x of [70,270,470,670,870]){ rect(g,'#c3c8cc',x,106,78,200); rect(g,'#e7eaec',x+8,114,62,184); g.strokeStyle='rgba(70,76,82,.35)'; g.lineWidth=2; g.strokeRect(x+8,114,62,184); }
    g.font='bold 22px sans-serif'; g.textAlign='center'; g.textBaseline='alphabetic';
    for(let i=0;i<5;i++){ g.fillStyle='#777d82'; g.fillText(String(i+1).padStart(2,'0'),109+i*200,146); }
    rect(g,'#d86d22',22,190,W-44,6); rect(g,'#d86d22',22,310,W-44,4);
    for(const x of [150,350,550,750,950]){ rect(g,'#30353a',x-9,180,18,26); rect(g,'#ef8a3a',x-3,187,6,6); }
    rect(g,'#c9cdd1',0,0,W,90); rect(g,'#aeb4b9',0,84,W,6);
    for(let x=60;x<W;x+=180){ rect(g,'#f7f9fb',x,60,90,12); glow(g,x+45,80,60,'rgba(255,255,255,A)',0.25); }
  }
};

TH.roof={
  edge:'#04050b', pit:'#030309', ceil:null, rain:true, lightning:true,
  door:{frame:'#3b3f47',panel:'#5d6470',line:'rgba(0,0,0,.35)',knob:'#d8c48a'},
  floor:floorPainter({body:'#2b2d36',top:['#5b5f6b',6],seam:null,step:100,
    extra(g,x,y,w,h){
      // building facade below each roof
      const r=rng(Math.floor(x));
      for(let wy=y+34;wy<y+h;wy+=40) for(let wx=Math.floor(x/34)*34+10;wx<x+w-8;wx+=34){ g.fillStyle=r()<0.3?'rgba(255,214,140,.55)':'rgba(10,12,20,.55)'; g.fillRect(wx,wy,14,18); }
      rect(g,'#40434d',x,y+6,w,6);
    }}),
  bg(g,W){
    const sky=g.createLinearGradient(0,0,0,WH);
    sky.addColorStop(0,'#070a18'); sky.addColorStop(0.7,'#1a2140'); sky.addColorStop(1,'#29305a');
    g.fillStyle=sky; g.fillRect(0,0,W,WH);
    const r=rng(5);
    // distant city of lights: "the town where you live"
    for(let x=0;x<W;x+=26){ const h=40+r()*90; rect(g,'#0d1124',x,330-h,28,h+300); for(let wy=340-h;wy<330;wy+=9) for(let wx=x+4;wx<x+24;wx+=6) if(r()<.18) rect(g,r()<.2?'rgba(255,240,200,.8)':'rgba(255,200,120,.55)',wx,wy,2,3); }
    glow(g,W*0.72,300,260,'rgba(255,180,110,A)',0.12);
    // antennas / water tank on the first roof
    rect(g,'#1e2029',250,250,4,170); line(g,'#1e2029',2,[232,262,272,262]); line(g,'#1e2029',2,[238,280,266,280]);
    rect(g,'#23252f',60,350,70,70); rect(g,'#1c1e27',56,344,78,8);
    rect(g,'#23252f',870,340,90,90); rect(g,'#1b1d26',866,336,98,8);
  }
};

TH.station={
  edge:'#0d0f12', pit:'#030304', ceil:90,
  door:{frame:'#2e3a3a',panel:'#3f5656',line:'rgba(0,0,0,.25)',knob:'#d9d9c0',sign:'#2f9e5a'},
  floor:floorPainter({body:'#5d5f63',top:['#a6a39a',5],seam:'rgba(0,0,0,.2)',step:60,rowH:30,
    extra(g,x,y,w,h){ g.fillStyle='#d9b72a'; g.fillRect(x,y+5,w,5); }}),
  bg(g,W){
    rect(g,'#cfd6d2',0,0,W,G);
    g.strokeStyle='rgba(90,110,100,.18)'; g.lineWidth=1;
    for(let y=100;y<G;y+=22){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
    for(let x=0;x<W;x+=22){ g.beginPath(); g.moveTo(x,90); g.lineTo(x,G); g.stroke(); }
    rect(g,'#2f6f5f',0,230,W,12);
    for(let x=150;x<W;x+=400){ rect(g,'#9aa6a0',x,90,40,G-90); rect(g,'#b7c1bb',x+4,90,8,G-90); }
    // signs
    rect(g,'#1f2a33',420,120,150,40); g.fillStyle='#fff'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('終電',495,140);
    rect(g,'#1f2a33',1380,120,120,36); g.fillStyle='#8fe0a8'; g.fillText('出口 →',1440,138);
    // timetable / poster
    rect(g,'#e9e2cf',40,270,70,90); for(let i=0;i<7;i++) rect(g,'#b9b09a',48,280+i*11,54,4);
    rect(g,'#22262b',0,0,W,90); rect(g,'#33383e',0,84,W,6);
    for(let x=40;x<W;x+=160){ rect(g,'#f4f6f2',x,64,110,10); glow(g,x+55,84,70,'rgba(235,255,245,A)',0.2); }
  }
};

TH.clock={
  edge:'#0f0a07', pit:'#050302', ceil:90,
  door:{frame:'#3e2a18',panel:'#7a5230',line:'rgba(0,0,0,.35)',knob:'#e6c26a',planks:true},
  floor:floorPainter({body:'#4a3524',top:['#9a7446',6],seam:'rgba(0,0,0,.28)',step:70,rowH:36}),
  bg(g,W){
    rect(g,'#2d2016',0,0,W,G);
    for(let x=0;x<W;x+=140){ rect(g,'rgba(255,220,160,.035)',x,90,70,G-90); }
    // clock face (hands drawn dynamically)
    circ(g,'#3c2a1b',520,250,150); circ(g,'#d9c9a4',520,250,132); circ(g,'#c7b58d',520,250,120);
    g.fillStyle='#3c2a1b'; g.font='bold 20px serif'; g.textAlign='center'; g.textBaseline='middle';
    const nums=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
    for(let i=0;i<12;i++){ const a=i/12*TAU-Math.PI/2; g.fillText(nums[i],520+Math.cos(a)*102,250+Math.sin(a)*102); }
    // big gears
    const gear=(cx,cy,r,n,c)=>{ g.fillStyle=c; g.beginPath(); for(let i=0;i<n*2;i++){ const a=i/(n*2)*TAU; const rr=i%2?r:r*0.84; g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);} g.fill(); circ(g,'#2d2016',cx,cy,r*0.3); };
    gear(120,190,70,14,'#4a3421'); gear(1180,210,90,16,'#4a3421'); gear(960,340,50,12,'#3f2c1c');
    rect(g,'#23180f',0,0,W,90); rect(g,'#5a3e22',0,82,W,8);
    for(let x=0;x<W;x+=120) rect(g,'#3a2816',x,0,20,90);
  }
};

TH.dark={
  edge:'#000', pit:'#000', ceil:null, dark:true,
  door:{frame:'#e8dcc0',panel:'#fff6de',line:'rgba(200,170,110,.5)',knob:'#d9b36a'},
  floor:floorPainter({body:'#34303f',top:['#8a82a0',4],seam:'rgba(0,0,0,.25)',step:100}),
  bg(g,W){
    rect(g,'#16162a',0,0,W,WH);
    const r=rng(9);
    for(let x=0;x<W;x+=60+r()*80){ const h=150+r()*200; g.fillStyle='#24233a'; g.fillRect(x,G-h,10+r()*14,h); g.beginPath(); g.arc(x+8,G-h,30+r()*30,0,TAU); g.fill(); }
  }
};

// ---------------------------------------------------------------------------
// Entity drawing
// ---------------------------------------------------------------------------
const P=K;
P.Block.prototype.draw=function(g,w,T){
  const s=this.solids[0];
  if(this.style==='vending'){
    rect(g,'#b83a3a',s.x,s.y,s.w,s.h); rect(g,'#e9eef0',s.x+5,s.y+8,s.w-10,34);
    for(let i=0;i<3;i++) for(let j=0;j<2;j++) rect(g,['#d8583a','#3a8ad8','#e8c23a'][(i+j)%3],s.x+8+j*16,s.y+12+i*10,10,7);
    rect(g,'#2b2b2b',s.x+8,s.y+56,s.w-16,10); glow(g,s.x+s.w/2,s.y+25,40,'rgba(255,255,255,A)',0.15);
  }else if(this.style==='bench'){ rect(g,'#7a5a3a',s.x,s.y,s.w,6); rect(g,'#3a3a3a',s.x+6,s.y+6,4,s.h-6); rect(g,'#3a3a3a',s.x+s.w-10,s.y+6,4,s.h-6); }
  else { rect(g,'#555',s.x,s.y,s.w,s.h); }
};
P.TrapFloor.prototype.draw=function(g,w,T){
  if(this.dir==='mid'){
    const k=Math.min(1,this.open/this.w);
    if(k<=0){ T.floor(g,this.x,this.y,this.w,WH+60-this.y); return; }
    const hw=this.w/2, a=k*1.35;
    g.save(); g.translate(this.x,this.y); g.rotate(a); T.floor(g,0,0,hw,14); g.restore();
    g.save(); g.translate(this.x+this.w,this.y); g.rotate(-a); T.floor(g,-hw,0,hw,14); g.restore();
    return;
  }
  const s=this.s; if(s.on===false) return;
  if(this.st==='idle'||this.st==='wait') T.floor(g,s.x-1,s.y,s.w+2,WH+60-s.y);
  else T.floor(g,s.x,s.y,s.w,WH+60-s.y);
  if(this.st==='opening'){ rect(g,'rgba(0,0,0,.35)',this.dir==='lr'?s.x:s.x+s.w-3,s.y,3,40); }
};
P.ShiftPit.prototype.draw=function(g,w,T){
  T.floor(g,this.L.x,G,this.L.w,WH+60-G); T.floor(g,this.R.x,G,this.R.w,WH+60-G);
};
P.DropFloor.prototype.draw=function(g,w,T){
  const s=this.s; if(s.on===false) return;
  if(this.style==='glass'){
    const y=s.y;
    rect(g,'#3a4150',this.x-3,y-2,this.w+6,6);
    const gg=g.createLinearGradient(this.x,y,this.x+this.w,y+14);
    gg.addColorStop(0,'rgba(170,210,255,.55)'); gg.addColorStop(1,'rgba(120,160,220,.35)');
    g.fillStyle=gg; g.fillRect(this.x,y,this.w,12);
    line(g,'rgba(255,255,255,.6)',1.5,[this.x+8,y+10,this.x+22,y+2]);
    rect(g,'rgba(255,220,150,.25)',this.x,y+12,this.w,40);
    return;
  }
  if(this.style==='ledge'){
    rect(g,'#6b4a2a',s.x,s.y,s.w,this.thick); rect(g,'#a07446',s.x,s.y,s.w,5);
    for(let x=s.x+10;x<s.x+s.w;x+=40) rect(g,'#3a2816',x,s.y+this.thick,6,14);
    return;
  }
  const idle=this.st==='idle'||this.st==='wait';
  const h=idle?WH+60-s.y:22;
  if(idle) T.floor(g,s.x-1,s.y,s.w+2,h); else T.floor(g,s.x,s.y,s.w,h);
  if(this.crack && (this.st==='wait'||this.st==='fall')){
    const k=this.st==='fall'?1:this.tm/this.delay;
    g.strokeStyle='rgba(10,8,6,.85)'; g.lineWidth=2; g.beginPath();
    const cx=s.x+s.w*0.5, y=s.y;
    g.moveTo(cx,y); g.lineTo(cx-10*k,y+8*k); g.lineTo(cx-4*k,y+18*k);
    if(k>0.4){ g.moveTo(cx,y); g.lineTo(cx+14*k,y+10*k); g.lineTo(cx+26*k,y+6*k); }
    if(k>0.7){ g.moveTo(s.x+10,y); g.lineTo(s.x+22,y+12); g.moveTo(s.x+s.w-12,y); g.lineTo(s.x+s.w-24,y+14); }
    g.stroke();
  }
};
P.Crusher.prototype.draw=function(g,w,T){
  const c=this.ceil;
  if(this.period){
    // periodic presses are honest: their housing is visible
    rect(g,'#23202a',this.x-6,0,this.w+12,c+3);
    for(let y=6;y<c;y+=10) rect(g,'#e8c23a',this.x-6,y,this.w+12,3);
  }
  g.save(); g.beginPath(); g.rect(this.x-4,c-2,this.w+8,WH); g.clip();
  const x=this.x,y=this.y,W_=this.w,h=this.h;
  if(this.style==='bell'){
    rect(g,'#2b1d10',x+W_/2-3,c-10,6,Math.max(0,y-c+10));
    g.fillStyle='#b8862e'; g.beginPath(); g.moveTo(x+W_*0.3,y); g.lineTo(x+W_*0.7,y); g.quadraticCurveTo(x+W_*0.78,y+h*0.6,x+W_,y+h); g.lineTo(x,y+h); g.quadraticCurveTo(x+W_*0.22,y+h*0.6,x+W_*0.3,y); g.fill();
    rect(g,'#8a6420',x,y+h-8,W_,8); rect(g,'rgba(255,240,180,.35)',x+W_*0.36,y+8,5,h-20);
  }else{
    rect(g,'#2b201b',x+W_/2-11,c-6,22,Math.max(0,y-c+6));
    rect(g,T===TH.lab?'#8a9197':'#352720',x,y,W_,h);
    rect(g,T===TH.lab?'#c9cdd1':'#76513a',x,y+h-12,W_,12);
    g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=2; g.strokeRect(x+1,y+1,W_-2,h-2);
    for(let i=0;i<4;i++) rect(g,'rgba(255,200,140,.25)',x+10+i*(W_-20)/3,y+h-20,3,3);
  }
  g.restore();
};
P.FallBlock.prototype.draw=function(g,w,T){
  if(this.st==='broken') return;
  if(this.shadow && (this.st==='wait'||this.st==='fall')){
    const k=clamp((this.y-this.y0)/(this.landY-this.h-this.y0+1),0,1);
    g.fillStyle=`rgba(0,0,0,${0.18+0.35*k})`; g.beginPath(); g.ellipse(this.x+this.w/2,this.landY-1,this.w*(0.4+0.4*k),4,0,0,TAU); g.fill();
  }
  const x=this.x,y=this.y,W_=this.w,h=this.h;
  // Objects waiting inside the ceiling stay hidden behind it.
  g.save();
  if(T.ceil){ g.beginPath(); g.rect(x-10,T.ceil,W_+20,WH); g.clip(); }
  this.drawBody(g,x,y,W_,h);
  g.restore();
};
P.FallBlock.prototype.drawBody=function(g,x,y,W_,h){
  if(this.style==='pot'){
    g.fillStyle='#b5582e'; g.beginPath(); g.moveTo(x,y+6); g.lineTo(x+W_,y+6); g.lineTo(x+W_-4,y+h); g.lineTo(x+4,y+h); g.fill();
    rect(g,'#c86a3a',x-2,y+4,W_+4,5); rect(g,'#3f7a3a',x+6,y-6,4,10); circ(g,'#e25a8a',x+8,y-7,4); circ(g,'#4f8a3a',x+15,y-2,4);
  }else if(this.style==='rock'){
    g.fillStyle='#4a4757'; g.beginPath(); g.moveTo(x+4,y); g.lineTo(x+W_-6,y+3); g.lineTo(x+W_,y+h-6); g.lineTo(x+W_-10,y+h); g.lineTo(x+2,y+h-4); g.lineTo(x,y+12); g.fill();
  }else if(this.style==='stone'){
    rect(g,'#5a5068',x,y,W_,h); rect(g,'#6f6680',x,y,W_,6); g.strokeStyle='rgba(0,0,0,.3)'; g.lineWidth=2; g.strokeRect(x+1,y+1,W_-2,h-2);
    line(g,'rgba(0,0,0,.3)',2,[x+20,y+10,x+34,y+30,x+28,y+52]);
  }else{ rect(g,'#777',x,y,W_,h); }
};
P.Spikes.prototype.draw=function(g,w,T){
  if(this.h<=0.5) return;
  if(this.dirn==='up'){ g.save(); g.beginPath(); g.rect(this.x-2,0,this.w+4,this.y); g.clip(); spikesUp(g,this.x,this.y,this.w,this.h,'#c8ccd4','#8a8f99'); g.restore(); }
  else { g.save(); g.beginPath(); g.rect(this.x-2,this.y,this.w+4,WH); g.clip(); spikesDown(g,this.x,this.y,this.w,this.h,'#c8ccd4','#8a8f99'); g.restore(); }
};
P.SpikeRow.prototype.draw=function(g,w,T){
  if(this.dirn==='down') spikesDown(g,this.x,this.y,this.w,this.h,'#b9bec8','#7e8490');
  else spikesUp(g,this.x,this.y,this.w,this.h,'#b9bec8','#7e8490');
};
P.Shot.prototype.draw=function(g,w,T){
  if(this.st!=='fly') return;
  const y=this.cy(), x=this.x, dir=this.from==='left'?1:-1;
  if(this.style==='arrow'){
    const tail=x-dir*this.w/2, head=x+dir*this.w/2;
    line(g,'#d8c9a0',3,[tail,y,head,y]);
    g.fillStyle='#e8e8ec'; g.beginPath(); g.moveTo(head+dir*8,y); g.lineTo(head-dir*4,y-6); g.lineTo(head-dir*4,y+6); g.fill();
    g.fillStyle='#c0504a'; g.beginPath(); g.moveTo(tail,y); g.lineTo(tail-dir*10,y-6); g.lineTo(tail+dir*4,y); g.lineTo(tail-dir*10,y+6); g.fill();
  }else if(this.style==='crow'){
    const f=Math.sin(this.ft*28);
    g.fillStyle='#0c0c10';
    g.beginPath(); g.ellipse(x,y,15,7,0,0,TAU); g.fill();
    circ(g,'#0c0c10',x+dir*13,y-3,6);
    g.beginPath(); g.moveTo(x-6,y-2); g.lineTo(x+2,y-2); g.lineTo(x-4*dir,y-16*f-2); g.fill();
    g.fillStyle='#d8b030'; g.beginPath(); g.moveTo(x+dir*18,y-4); g.lineTo(x+dir*25,y-2); g.lineTo(x+dir*18,y); g.fill();
    circ(g,'#f04040',x+dir*14,y-4,1.6);
  }else{
    rect(g,'#30353a',x-this.w/2,y-this.h/2,this.w,this.h);
    rect(g,'#ef8a3a',x-this.w/2,y-this.h/2,this.w,5);
    for(let i=0;i<3;i++) rect(g,'#e7eaec',x-this.w/2+10+i*20,y-4,12,8);
    g.fillStyle='rgba(255,255,255,.15)'; g.fillRect(x+this.w/2*(-dir)-dir*40,y-this.h/2+6,40,this.h-12);
  }
};
P.Laser.prototype.draw=function(g,w,T){
  const x=this.x;
  rect(g,'#30353a',x-12,this.y0,24,12); rect(g,'#30353a',x-12,this.y1-8,24,8);
  const armed=this.st!=='idle';
  circ(g,armed?'#ff5050':'#5a2020',x,this.y0+12,4);
  if(this.st==='warm'||this.charging){ g.globalAlpha=0.35+0.35*Math.sin(w.t*60); rect(g,'#ff8080',x-1,this.y0+12,2,this.y1-this.y0-20); g.globalAlpha=1; }
  if(this.on){
    glow(g,x,(this.y0+this.y1)/2,40,'rgba(255,60,60,A)',0.25);
    rect(g,'rgba(255,60,60,.55)',x-this.width/2,this.y0+12,this.width,this.y1-this.y0-20);
    rect(g,'#fff0f0',x-1.5,this.y0+12,3,this.y1-this.y0-20);
  }
};
P.Lift.prototype.draw=function(g,w,T){
  const y=this.s.y;
  if(y<G-1){ rect(g,'#5f676e',this.x+this.w/2-6,y+14,12,G-y-14); rect(g,'#7b848b',this.x+this.w/2-9,y+14,18,6); }
  rect(g,'#aab2b8',this.x,y,this.w,14); rect(g,'#eceff1',this.x,y,this.w,4);
  g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=1.5; g.strokeRect(this.x+0.5,y+0.5,this.w-1,13);
};
P.Arc.prototype.draw=function(g,w,T){
  // floor emitter is always there (a hint for the attentive)
  rect(g,'#30353a',this.x-10,G-3,20,3);
  if(this.h<=1) return;
  const top=G-this.h;
  glow(g,this.x,G-this.h/2,60,'rgba(120,180,255,A)',0.25);
  for(let k=0;k<3;k++){
    g.strokeStyle=k?'rgba(160,210,255,.8)':'#ffffff'; g.lineWidth=k?2:3; g.beginPath();
    let x=this.x; g.moveTo(x,G);
    for(let y=G;y>top;y-=12){ x=this.x+(Math.random()-0.5)*this.w; g.lineTo(x,y); }
    g.stroke();
  }
};
P.Shutter.prototype.draw=function(g,w,T){
  if(this.bottom<=this.top+0.5) { rect(g,'#30353a',this.x-4,this.top-6,this.w+8,6); return; }
  const y0=this.top, y1=this.bottom;
  rect(g,'#6d757c',this.x,y0,this.w,y1-y0);
  for(let y=y1-10;y>y0;y-=14) rect(g,'rgba(0,0,0,.18)',this.x,y,this.w,3);
  for(let x=this.x;x<this.x+this.w;x+=16){ g.fillStyle='#e8c23a'; g.fillRect(x,y1-10,8,10); g.fillStyle='#222'; g.fillRect(x+8,y1-10,8,10); }
  rect(g,'#30353a',this.x-4,this.top-6,this.w+8,6);
};
P.ChaseWall.prototype.draw=function(g,w,T){
  if(this.rise<=0) return;
  const top=G-this.rise;
  g.save(); g.beginPath(); g.rect(this.x-2,0,this.w+4,G); g.clip();
  rect(g,'#6a4a3a',this.x,top,this.w,this.h);
  g.strokeStyle='rgba(0,0,0,.28)'; g.lineWidth=1.5;
  for(let y=top,row=0;y<G;y+=14,row++){ g.beginPath(); g.moveTo(this.x,y); g.lineTo(this.x+this.w,y); g.stroke(); for(let x=this.x+(row%2)*9;x<this.x+this.w;x+=18){ g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+14); g.stroke(); } }
  rect(g,'#8a6a52',this.x,top,this.w,5);
  g.restore();
};
P.Lightning.prototype.draw=function(g,w,T){
  if(this.st==='aim'&&this.target!==undefined){
    const locked=this.tm>=this.lock;
    const a=locked?0.65+0.35*Math.sin(w.t*50):0.4;
    const fy=this.floorY(w);
    g.fillStyle=`rgba(180,210,255,${a*0.18})`; g.fillRect(this.target-this.width/2,0,this.width,fy);
    g.fillStyle=`rgba(200,225,255,${a})`; g.beginPath(); g.ellipse(this.target,fy-2,26,6,0,0,TAU); g.fill();
  }
  if(this.st==='strike'&&this.tm<0.2){
    const x=this.target, fy=this.floorY(w);
    g.strokeStyle='#ffffff'; g.lineWidth=5; g.beginPath(); let xx=x; g.moveTo(x+30,0);
    for(let y=0;y<fy;y+=24){ xx=x+(Math.random()-0.5)*26; g.lineTo(xx,y); } g.lineTo(x,fy); g.stroke();
    g.strokeStyle='rgba(160,200,255,.6)'; g.lineWidth=12; g.stroke();
  }
};
P.Lightning.prototype.floorY=function(w){ for(const s of w.statics) if(this.target>=s.x&&this.target<=s.x+s.w) return s.y; return G; };
P.Conveyor.prototype.draw=function(g,w,T){
  const y=this.y===undefined?G:this.y;
  rect(g,'#2d3136',this.x,y,this.w,10);
  g.save(); g.beginPath(); g.rect(this.x,y,this.w,10); g.clip();
  const dir=this.cur>=0?1:-1;
  g.fillStyle=this.reversed?'#e05050':'#d9b72a';
  const off=((this.off%24)+24)%24;
  for(let x=this.x-24+off;x<this.x+this.w+24;x+=24){ g.beginPath(); g.moveTo(x,y+2); g.lineTo(x+dir*8,y+5); g.lineTo(x,y+8); g.lineTo(x+dir*3,y+5); g.fill(); }
  g.restore();
  circ(g,'#1b1e22',this.x+5,y+5,5); circ(g,'#1b1e22',this.x+this.w-5,y+5,5);
};
P.Bonk.prototype.draw=function(g,w,T){
  if(this.s.hidden) return;
  const s=this.s;
  rect(g,'#9a5a3a',s.x,s.y,s.w,s.h); g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=2; g.strokeRect(s.x+1,s.y+1,s.w-2,s.h-2);
  line(g,'rgba(0,0,0,.3)',2,[s.x,s.y+s.h/2,s.x+s.w,s.y+s.h/2]); g.fillStyle='#ffd'; g.font='bold 16px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('?',s.x+s.w/2,s.y+s.h/2);
};
P.Spring.prototype.draw=function(g,w,T){
  const sq=this.squash, x=this.x, top=G-14+sq*6;
  g.strokeStyle='#c0c4cc'; g.lineWidth=3; g.beginPath();
  for(let i=0;i<=6;i++){ const yy=G-(G-top-4)*i/6; g.lineTo(x+(i%2?this.w-8:8),yy); } g.stroke();
  rect(g,'#e04848',x,top-4,this.w,6); rect(g,'#ff8a8a',x,top-4,this.w,2);
  rect(g,'#555',x-2,G-3,this.w+4,3);
};
P.Pendulum.prototype.draw=function(g,w,T){
  const bx=this.bx(), by=this.by();
  line(g,'#8a6a3a',4,[this.px,this.py,bx,by]);
  circ(g,'#5a4020',this.px,this.py,7);
  g.save(); g.translate(bx,by); g.rotate(-this.ang);
  g.fillStyle='#cfd3da'; g.beginPath(); g.arc(0,0,this.r+4,0.15*Math.PI,0.85*Math.PI); g.lineTo(0,-6); g.fill();
  g.fillStyle='#8a8f99'; g.beginPath(); g.arc(0,0,this.r-4,0.2*Math.PI,0.8*Math.PI); g.lineTo(0,0); g.fill();
  circ(g,'#5a4020',0,0,5);
  g.restore();
};
P.Crossing.prototype.draw=function(g,w,T){
  const x0=this.x0,x1=this.x1;
  // track bed
  rect(g,'#3b3630',x0,G,x1-x0,8);
  for(let x=x0+6;x<x1;x+=20) rect(g,'#5a4a38',x,G+1,10,4);
  rect(g,'#9aa0a6',x0,G-2,x1-x0,3);
  // train
  if(this.active){
    const tr=this.trains[this.trainIdx];
    const dir=this.trainIdx%2?-1:1;
    const k=this.pass;
    g.save(); g.beginPath(); g.rect(x0,G-170,x1-x0,172); g.clip();
    const len=900, cx=x0-len+(x1-x0+len*2)*k;
    const tx=dir>0?cx:x1+x0-cx-len+ (x1-x0);
    rect(g,'#b9c2c8',tx,G-160,len,150); rect(g,'#2f6f5f',tx,G-60,len,10);
    for(let wx=tx+20;wx<tx+len;wx+=60){ rect(g,'#fff4c8',wx,G-140,36,34); }
    rect(g,'rgba(0,0,0,.25)',tx,G-12,len,12);
    g.restore();
    rect(g,'rgba(255,255,255,.12)',x0,G-170,x1-x0,170);
  }
  // signals
  const on=this.bellOn&&this.st!=='idle';
  for(const sx of [x0-10,x1+10]){
    rect(g,'#222',sx-2,G-150,4,150);
    g.save(); g.translate(sx,G-150); g.rotate(Math.PI/4); rect(g,'#fff',-18,-3,36,6); rect(g,'#222',-18,-1,36,2); g.restore();
    g.save(); g.translate(sx,G-150); g.rotate(-Math.PI/4); rect(g,'#fff',-18,-3,36,6); rect(g,'#222',-18,-1,36,2); g.restore();
    const blink=Math.floor(w.t*5)%2;
    circ(g,on&&blink?'#ff3030':'#401010',sx-9,G-118,6); circ(g,on&&!blink?'#ff3030':'#401010',sx+9,G-118,6);
    if(on) glow(g,sx+(blink?-9:9),G-118,30,'rgba(255,50,50,A)',0.4);
  }
  // gate arms (down while ringing)
  const k=this.gk||0;
  for(const [sx,dir] of [[x0-10,1],[x1+10,-1]]){
    g.save(); g.translate(sx,G-60); g.rotate(-dir*(1-k)*Math.PI/2*0.95);
    for(let i=0;i<5;i++){ g.fillStyle=i%2?'#ffea30':'#222'; g.fillRect(dir>0?i*16:-(i+1)*16,-3,16,6); }
    g.restore();
  }
};
P.DarkChase.prototype.draw=function(g,w,T){
  if(this.st!=='chase') return;
  const x=this.x;
  const gr=g.createLinearGradient(x-160,0,x+40,0);
  gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(0.8,'rgba(0,0,0,.95)'); gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr; g.fillRect(x-2000,-50,2040,WH+100);
  g.fillStyle='rgba(0,0,0,.9)';
  for(let i=0;i<9;i++){ const y=i*64+20, len=34+24*Math.sin(w.t*3+i*1.7); g.beginPath(); g.ellipse(x+len*0.5,y,len,18,0,0,TAU); g.fill(); }
  // eyes
  const ey=250+Math.sin(w.t*1.3)*30;
  circ(g,'rgba(160,20,30,.6)',x-40,ey,3); circ(g,'rgba(160,20,30,.6)',x-22,ey,3);
};
P.DarkChase.prototype.drawOver=function(g,w,T){
  if(this.st!=='chase') return;
  const x=this.x;
  const gr=g.createLinearGradient(x-60,0,x+30,0);
  gr.addColorStop(0,'rgba(90,10,40,0)'); gr.addColorStop(0.75,'rgba(120,20,60,.35)'); gr.addColorStop(1,'rgba(120,20,60,0)');
  g.fillStyle=gr; g.fillRect(x-60,0,90,WH);
  g.fillStyle='rgba(150,30,70,.5)';
  for(let i=0;i<9;i++){ const y=i*64+20, len=34+24*Math.sin(w.t*3+i*1.7); g.fillRect(x+len*0.5-2,y-1,4,2); }
  const ey=250+Math.sin(w.t*1.3)*30;
  circ(g,'rgba(255,60,80,.85)',x-40,ey,3.2); circ(g,'rgba(255,60,80,.85)',x-22,ey,3.2);
};
P.Mover.prototype.draw=function(g,w,T){
  const s=this.s;
  rect(g,'#6b5a45',s.x,s.y,s.w,s.h); rect(g,'#9a8466',s.x,s.y,s.w,4);
  line(g,'rgba(120,110,90,.4)',1,[s.x+10,s.y+s.h,s.x+10,WH]); line(g,'rgba(120,110,90,.4)',1,[s.x+s.w-10,s.y+s.h,s.x+s.w-10,WH]);
};
P.Deco.prototype.draw=function(g,w,T){
  if(this.type==='window'){
    rect(g,'#2a2322',this.x-26,this.y-50,52,56); rect(g,'#d9b870',this.x-22,this.y-46,44,40);
    rect(g,'#2a2322',this.x-1,this.y-46,2,40); rect(g,'#5a4a42',this.x-32,this.y+4,64,6);
  }else if(this.type==='fakecrack'){
    const near=Math.abs(w.P.x-(this.x+this.w/2))<this.w/2+10&&w.P.ground;
    if(near) this.k=Math.min(1,(this.k||0)+0.05);
    const k=this.k||0; if(k<=0) return;
    g.strokeStyle='rgba(0,0,0,.6)'; g.lineWidth=2; g.beginPath();
    const cx=this.x+this.w/2;
    g.moveTo(cx,G); g.lineTo(cx-10*k,G+8*k); g.moveTo(cx,G); g.lineTo(cx+12*k,G+6*k); g.stroke();
  }
};
P.FakeDoor.prototype.draw=function(g,w,T){ drawDoor(g,this.x,this.y,T.door,w.t); };
P.Light.prototype.draw=function(g,w,T){
  if(this.lantern){
    line(g,'#2a2a2a',2,[this.x,0,this.x,this.y-14]);
    rect(g,'#3a3024',this.x-8,this.y-14,16,4); rect(g,'rgba(255,200,120,.9)',this.x-6,this.y-10,12,16); rect(g,'#3a3024',this.x-8,this.y+6,16,4);
  }
};

// ---------------------------------------------------------------------------
// Mercy hints: faint outlines of traps that already took two lives.
// ---------------------------------------------------------------------------
P.TrapFloor.prototype.hintRect=function(){ return this.st==='idle'?{x:this.x,y:this.y-4,w:this.w,h:14}:null; };
P.DropFloor.prototype.hintRect=function(){ return this.st==='idle'?{x:this.x,y:this.y0-4,w:this.w,h:14}:null; };
P.ShiftPit.prototype.hintRect=function(){ return this.done?null:{x:this.p0+this.minShift,y:G-4,w:this.maxShift-this.minShift+this.pw,h:14}; };
P.Crusher.prototype.hintRect=function(){ return this.st==='idle'&&!this.period?{x:this.x,y:this.ceil,w:this.w,h:this.floor-this.ceil}:null; };
P.FallBlock.prototype.hintRect=function(){ return this.st==='idle'?{x:this.x,y:Math.max(this.y0,40),w:this.w,h:this.landY-Math.max(this.y0,40)}:null; };
P.Spikes.prototype.hintRect=function(){ if(this.st!=='idle') return null; return this.dirn==='up'?{x:this.x,y:this.y-this.maxH,w:this.w,h:this.maxH}:{x:this.x,y:this.y,w:this.w,h:this.maxH}; };
P.Shot.prototype.hintRect=function(w){ return this.st==='idle'?{x:0,y:this.y-this.h/2,w:w.W,h:this.h,line:true}:null; };
P.Laser.prototype.hintRect=function(){ return this.st==='idle'?{x:this.x-8,y:this.y0,w:16,h:this.y1-this.y0}:null; };
P.Arc.prototype.hintRect=function(){ return this.st==='idle'?{x:this.x-this.w/2,y:G-this.maxH,w:this.w,h:this.maxH}:null; };
P.Shutter.prototype.hintRect=function(){ return this.st==='idle'?{x:this.x,y:this.top,w:this.w,h:G-this.top}:null; };
P.ChaseWall.prototype.hintRect=function(){ return this.st==='idle'?{x:this.minX,y:G-this.h,w:this.startX+this.w-this.minX,h:this.h}:null; };
P.Bonk.prototype.hintRect=function(){ return this.s.hidden?{x:this.x,y:this.y,w:this.w,h:this.h}:null; };
P.Lift.prototype.hintRect=function(){ return this.st==='idle'?{x:this.x,y:G-this.rise-40,w:this.w,h:this.rise+40}:null; };
P.Lightning.prototype.hintRect=function(w){ return null; };
function drawHint(g,r,t){
  const a=0.35+0.25*Math.sin(t*3);
  g.save();
  g.fillStyle=`rgba(190,215,255,${a*0.18})`; g.fillRect(r.x,r.y,r.w,r.h);
  g.strokeStyle=`rgba(210,230,255,${a+0.2})`; g.lineWidth=2; g.setLineDash([6,5]); g.lineDashOffset=-t*12;
  g.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);
  g.setLineDash([]);
  g.fillStyle=`rgba(230,240,255,${a+0.3})`; g.font='bold 16px sans-serif'; g.textAlign='center'; g.textBaseline='bottom';
  if(!r.line) g.fillText('!',r.x+r.w/2,r.y-3);
  g.restore();
}
// Checkpoint: a small lantern of past lives.
function drawCheckpoint(g,cp,t,im){
  const x=cp.x, y=cp.y;
  glow(g,x,y-30,cp.reached?90:60,'rgba(255,214,150,A)',cp.reached?0.45:0.25+0.1*Math.sin(t*2));
  rect(g,'#3a3024',x-2,y-44,4,44);
  rect(g,'#3a3024',x-9,y-58,18,4); rect(g,cp.reached?'rgba(255,214,150,.95)':'rgba(200,220,255,.8)',x-7,y-54,14,14); rect(g,'#3a3024',x-9,y-40,18,3);
  if(im){ g.globalAlpha=0.35+0.1*Math.sin(t*1.7); const dw=im.width*1.2,dh=im.height*1.2; g.drawImage(im,x+6,y-dh,dw,dh); g.globalAlpha=1; }
}

// ---------------------------------------------------------------------------
// Renderer object
// ---------------------------------------------------------------------------
const R={
  TH, drawDoor,
  init(canvas,imgs){
    this.cv=canvas; this.g=canvas.getContext('2d',{alpha:false});
    this.imgs=imgs;
    this.parts=[]; this.shakeA=0; this.flashA=0; this.cam=0; this.ghosts=[]; this.cacheKey='';
    this.white=new Map();
    this.darkCv=document.createElement('canvas');
    this.rain=[]; for(let i=0;i<220;i++) this.rain.push({x:Math.random()*2600,y:Math.random()*WH,s:0.7+Math.random()*0.6});
    this.resize();
  },
  resize(){
    this.dpr=Math.min(window.devicePixelRatio||1,2);
    this.W=window.innerWidth; this.H=window.innerHeight;
    this.cv.width=Math.round(this.W*this.dpr); this.cv.height=Math.round(this.H*this.dpr);
    this.cv.style.width=this.W+'px'; this.cv.style.height=this.H+'px';
    this.cacheKey='';
  },
  whiteOf(im){
    let c=this.white.get(im); if(c) return c;
    c=document.createElement('canvas'); c.width=im.width; c.height=im.height;
    const x=c.getContext('2d'); x.drawImage(im,0,0); x.globalCompositeOperation='source-in'; x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height);
    this.white.set(im,c); return c;
  },
  view(w){
    const scale=Math.min(this.W/VIEW_W,this.H/WH);
    const viewW=this.W/scale;
    return {scale,viewW,oy:(this.H-WH*scale)/2};
  },
  buildCache(w,T,v){
    const key=w.def.name+'|'+this.W+'x'+this.H+'|'+this.dpr;
    if(key===this.cacheKey) return;
    this.cacheKey=key;
    const s=v.scale*this.dpr;
    const c=this.cache||(this.cache=document.createElement('canvas'));
    c.width=Math.ceil(w.W*s); c.height=Math.ceil(WH*s);
    const g=c.getContext('2d');
    g.setTransform(s,0,0,s,0,0);
    rect(g,T.pit,0,0,w.W,WH);
    T.bg(g,w.W);
    // pit interiors
    const pg=g.createLinearGradient(0,G,0,WH);
    pg.addColorStop(0,'#000'); pg.addColorStop(1,T.pit);
    g.fillStyle=pg; g.fillRect(0,G,w.W,WH-G);
    for(const f of w.statics) T.floor(g,f.x,f.y,f.w,WH+60-f.y);
  },
  onEvent(ev,w){
    const T=TH[w.def.theme];
    switch(ev.type){
      case 'shake': this.shakeA=Math.max(this.shakeA,ev.a); break;
      case 'flash': this.flashA=Math.max(this.flashA,ev.a); break;
      case 'land': if(ev.v>0.25) this.dust(ev.x,ev.y,6,'rgba(200,190,170,.7)'); break;
      case 'jump': this.dust(ev.x,ev.y,3,'rgba(200,190,170,.5)'); break;
      case 'crumble': for(let i=0;i<18;i++) this.part(ev.x+Math.random()*ev.w,ev.y+Math.random()*8,(Math.random()-0.5)*120,-Math.random()*160,ev.style==='glass'?'rgba(180,220,255,.9)':'#6a6258',2+Math.random()*4,1.2); break;
      case 'trapfloor': for(let i=0;i<6;i++) this.part(ev.x+Math.random()*30,ev.y,(Math.random()-0.5)*60,-Math.random()*60,'#5a554c',2+Math.random()*3,0.8); break;
      case 'impact': {
        const col=ev.style==='pot'?'#b5582e':ev.style==='spark'?'#cfe4ff':'rgba(190,180,160,.8)';
        for(let i=0;i<(ev.style==='pot'?16:10);i++) this.part(ev.x+(Math.random()-0.5)*(ev.w||30),ev.y-2,(Math.random()-0.5)*220,-Math.random()*200,col,2+Math.random()*3,0.9);
        break; }
      case 'checkpoint': for(let i=0;i<24;i++) this.part(ev.x+(Math.random()-0.5)*30,ev.y-40,(Math.random()-0.5)*120,-Math.random()*160,'rgba(255,220,160,.9)',2,1.0,120); break;
      case 'bonk': for(let i=0;i<6;i++) this.part(ev.x,ev.y,(Math.random()-0.5)*120,Math.random()*60,'#ffe9a8',2,0.5); break;
      case 'death': {
        const y=Math.min(ev.y,WH-10);
        this.ghosts.push({x:ev.x,y:y,t:0});
        for(let i=0;i<14;i++) this.part(ev.x,y-20,(Math.random()-0.5)*200,-Math.random()*220,'#ffffff',2+Math.random()*2,0.7);
        this.deathMark={x:ev.x,y:y,t:0};
        break; }
    }
  },
  dust(x,y,n,c){ for(let i=0;i<n;i++) this.part(x+(Math.random()-0.5)*16,y-2,(Math.random()-0.5)*90,-Math.random()*40,c,2+Math.random()*2,0.45,-200); },
  part(x,y,vx,vy,c,s,life,grav){ if(this.parts.length>300) this.parts.shift(); this.parts.push({x,y,vx,vy,c,s,life,t:0,gr:grav===undefined?900:grav}); },

  frame(w,ui,dt){
    const g=this.g, T=TH[w.def.theme];
    const v=this.view(w);
    this.buildCache(w,T,v);
    const P=w.P;
    // camera
    const maxCam=Math.max(0,w.W-v.viewW);
    let camT=w.W<=v.viewW?-(v.viewW-w.W)/2:clamp(P.x-v.viewW*0.42,0,maxCam);
    if(ui.snapCam){ this.cam=camT; ui.snapCam=false; }
    else this.cam+=(camT-this.cam)*Math.min(1,dt*6);
    const cam=this.cam;
    // shake
    this.shakeA=Math.max(0,this.shakeA-dt*30);
    const sx=(Math.random()-0.5)*this.shakeA, sy=(Math.random()-0.5)*this.shakeA;

    g.setTransform(this.dpr,0,0,this.dpr,0,0);
    g.fillStyle=T.edge; g.fillRect(0,0,this.W,this.H);
    this.xf={v,cam,sx,sy};
    g.save();
    g.translate(sx,v.oy+sy);
    g.scale(v.scale,v.scale);
    g.translate(-cam,0);
    g.imageSmoothingEnabled=false;
    // static layer
    const s=v.scale*this.dpr;
    g.save(); g.setTransform(this.dpr,0,0,this.dpr,0,0);
    g.translate(sx,v.oy+sy);
    g.drawImage(this.cache,Math.round(-cam*v.scale*this.dpr)/this.dpr,0,this.cache.width/this.dpr,this.cache.height/this.dpr);
    g.restore();

    this.dynBack(g,w,T);
    // doors sit in the background: arrows, bells and falling things pass in front of them
    if(w.goal) drawDoor(g,w.goal.x,w.goal.y||G,T.door,w.t,{glow:w.def.final||T.dark,leak:w.def.final});
    for(const e of w.ents) if(e.kind==='fakedoor') e.draw(g,w,T);
    for(const e of w.ents) if(e.draw && !e.front && e.kind!=='fakedoor') e.draw(g,w,T);
    if(ui.cp) drawCheckpoint(g,ui.cp,w.t,this.whiteOf(this.imgs.sit));
    if(ui.known && ui.known.size){ for(const e of w.ents){ if(!ui.known.has(e.idx)||!e.hintRect) continue; const r=e.hintRect(w); if(r) drawHint(g,r,w.t); } }
    this.drawGhosts(g,w,dt);
    this.drawCat(g,w,ui);
    for(const e of w.ents) if(e.draw && e.front) e.draw(g,w,T);
    this.drawParts(g,dt);
    if(T.rain) this.drawRain(g,w,v,cam,dt);
    g.restore();

    if(T.dark){
      this.drawDark(w,v,cam,sx,sy);
      // things that must stay visible in the dark
      g.save(); g.translate(sx,v.oy+sy); g.scale(v.scale,v.scale); g.translate(-cam,0);
      for(const e of w.ents) if(e.drawOver) e.drawOver(g,w,T);
      g.restore();
    }

    // lightning flash
    this.flashA=Math.max(0,this.flashA-dt*3.2);
    if(T.lightning){ this.bolt=(this.bolt||0)-dt; if(this.bolt<0){ this.bolt=3+Math.random()*4; this.flashA=Math.max(this.flashA,0.35); ui.thunder&&ui.thunder(); } }
    if(this.flashA>0){ g.fillStyle=`rgba(220,230,255,${this.flashA*0.55})`; g.fillRect(0,0,this.W,this.H); }
    // vignette
    const vg=g.createRadialGradient(this.W/2,this.H/2,this.H*0.35,this.W/2,this.H/2,this.H*0.95);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.35)');
    g.fillStyle=vg; g.fillRect(0,0,this.W,this.H);
    if(ui.lastLife){ const a=0.12+0.1*Math.sin(performance.now()/260); g.fillStyle=`rgba(160,0,20,${a})`; g.fillRect(0,0,this.W,6); g.fillRect(0,this.H-6,this.W,6); g.fillRect(0,0,6,this.H); g.fillRect(this.W-6,0,6,this.H); }
  },
  dynBack(g,w,T){
    if(T===TH.clock){
      const t=w.t;
      g.save(); g.translate(520,250);
      g.rotate(t*0.05); rect(g,'#2d2016',-3,-80,6,88); g.rotate(-t*0.05);
      g.rotate(t*0.6); rect(g,'#2d2016',-2,-108,4,116); g.restore();
      circ(g,'#2d2016',520,250,7);
    }
    if(T===TH.dark){
      // fireflies
      const r=rng(3);
      for(let i=0;i<26;i++){ const x=r()*w.W, y=120+r()*260; const a=0.4+0.4*Math.sin(w.t*2+i); circ(g,`rgba(210,255,160,${a})`,x+Math.sin(w.t+i)*12,y+Math.cos(w.t*0.7+i)*8,2); }
    }
  },
  drawRain(g,w,v,cam,dt){
    const wind=(w.flags.wind||0);
    const slant=-0.18+wind*1.2;
    const lvl=w.def.rain||1;
    g.strokeStyle=`rgba(170,190,230,${0.22+0.08*lvl})`; g.lineWidth=1.3; g.beginPath();
    const n=Math.min(this.rain.length,90*lvl);
    for(let i=0;i<n;i++){
      const d=this.rain[i];
      d.y+=dt*900*d.s; d.x+=dt*900*d.s*slant;
      if(d.y>WH){ d.y-=WH+20; d.x=cam+Math.random()*(v.viewW+200)-100; }
      if(d.x<cam-120) d.x+=v.viewW+220; if(d.x>cam+v.viewW+120) d.x-=v.viewW+220;
      g.moveTo(d.x,d.y); g.lineTo(d.x+slant*14,d.y+14);
    }
    g.stroke();
  },
  drawParts(g,dt){
    for(let i=this.parts.length-1;i>=0;i--){
      const p=this.parts[i];
      p.t+=dt; if(p.t>=p.life){ this.parts.splice(i,1); continue; }
      p.vy+=p.gr*dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
      g.globalAlpha=1-p.t/p.life; g.fillStyle=p.c; g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);
    }
    g.globalAlpha=1;
  },
  drawGhosts(g,w,dt){
    // Faint cats marking where earlier lives were lost in this stage.
    const im=this.whiteOf(this.imgs.idle);
    for(const gh of this.ghosts){
      gh.t+=dt;
      const a=Math.min(0.22,gh.t*0.5);
      g.globalAlpha=a;
      const dw=im.width*1.3, dh=im.height*1.3;
      g.drawImage(im,gh.x-dw/2,gh.y-dh+2+Math.sin(w.t*1.5+gh.x)*2,dw,dh);
    }
    g.globalAlpha=1;
  },
  sprite(w){
    const P=w.P, im=this.imgs;
    if(!P.ground){ if(P.vy<-120) return im.jump.rise; if(Math.abs(P.vy)<=120) return im.jump.apex; return im.jump.fall; }
    if(P.land>0) return im.jump.land;
    if(Math.abs(P.vx)>8) return im.walk[P.frame];
    return (w.t%3.6)>3.45?im.idleBlink:im.idle;
  },
  bottomOf(sp){ return sp.height; },
  drawCat(g,w,ui){
    const P=w.P;
    let sp=this.sprite(w);
    const SC=window.NEKO_SPRITES.SCALE, dw=sp.width*SC, dh=sp.height*SC, pad=0;
    if(P.dead){
      // the body flashes white and fades; a small soul rises
      const t=P.deadT;
      if(P.y<WH+20 && t<0.5){
        g.save(); g.translate(Math.round(P.x),Math.round(P.y+pad)); if(P.facing<0) g.scale(-1,1);
        if(P.cause==='crush') g.scale(1.25,0.35);
        g.globalAlpha=1-t*2; g.drawImage(Math.floor(t*20)%2?this.whiteOf(sp):sp,-dw/2,-dh,dw,dh); g.restore(); g.globalAlpha=1;
      }
      const soul=this.whiteOf(this.imgs.idle);
      const sy=Math.min(P.y,WH-10)-30-t*80;
      g.globalAlpha=Math.max(0,0.75-t*0.7);
      g.drawImage(soul,P.x-soul.width*0.6+Math.sin(t*6)*4,sy-soul.height*1.2,soul.width*1.2,soul.height*1.2);
      g.globalAlpha=1;
      return;
    }
    g.save();
    g.translate(Math.round(P.x),Math.round(P.y+pad));
    if(P.facing<0) g.scale(-1,1);
    g.drawImage(sp,Math.round(-dw/2),Math.round(-dh),Math.round(dw),Math.round(dh));
    g.restore();
  },
  drawDark(w,v,cam,sx,sy){
    const c=this.darkCv;
    if(c.width!==this.cv.width||c.height!==this.cv.height){ c.width=this.cv.width; c.height=this.cv.height; }
    const d=c.getContext('2d');
    d.setTransform(1,0,0,1,0,0);
    d.globalCompositeOperation='source-over';
    d.fillStyle='rgba(2,2,6,.965)'; d.fillRect(0,0,c.width,c.height);
    d.setTransform(this.dpr,0,0,this.dpr,0,0);
    d.translate(sx,v.oy+sy); d.scale(v.scale,v.scale); d.translate(-cam,0);
    d.globalCompositeOperation='destination-out';
    const hole=(x,y,r,a)=>{ const gr=d.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,`rgba(0,0,0,${a})`); gr.addColorStop(0.6,`rgba(0,0,0,${a*0.7})`); gr.addColorStop(1,'rgba(0,0,0,0)'); d.fillStyle=gr; d.fillRect(x-r,y-r,r*2,r*2); };
    const P=w.P;
    hole(P.x,P.y-24,P.dead?90:170,1);
    for(const e of w.ents) if(e.kind==='light') hole(e.x,e.y,e.r,0.9);
    if(w.goal) hole(w.goal.x,G-40,150,0.95);
    for(const gh of this.ghosts) hole(gh.x,gh.y-16,50,0.5);
    const r=rng(3);
    for(let i=0;i<26;i++){ const x=r()*w.W, y=120+r()*260; hole(x+Math.sin(w.t+i)*12,y+Math.cos(w.t*0.7+i)*8,26,0.5); }
    for(const e of w.ents) if(e.kind==='fallblock' && (e.st==='wait'||e.st==='fall')) hole(e.x+e.w/2,G,60,0.6);
    const g=this.g; g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(c,0,0); g.restore();
  },
  // ?debug: solids, hazards, hurtbox and trigger lines, plus a small status readout.
  drawDebug(w,ui,steps){
    if(!this.xf) return;
    const g=this.g, {v,cam,sx,sy}=this.xf, P=w.P, CFG=E.CFG;
    g.save(); g.setTransform(this.dpr,0,0,this.dpr,0,0);
    g.translate(sx,v.oy+sy); g.scale(v.scale,v.scale); g.translate(-cam,0);
    g.lineWidth=1.5/v.scale*1.2;
    for(const s of w.S){
      g.setLineDash(s.hidden?[4,4]:[]);
      g.strokeStyle=s.kin?'rgba(80,255,220,.9)':'rgba(80,200,255,.7)';
      g.strokeRect(s.x,s.y,s.w,Math.min(s.h,WH+20-s.y));
    }
    for(const e of w.ents){ if(e.s&&e.s.hidden){ g.setLineDash([4,4]); g.strokeStyle='rgba(255,255,120,.9)'; g.strokeRect(e.s.x,e.s.y,e.s.w,e.s.h); } }
    g.setLineDash([]);
    for(const e of w.ents){
      const hs=e.hazards&&e.hazards(w); if(!hs) continue;
      for(const h of hs){ g.fillStyle='rgba(255,40,60,.28)'; g.strokeStyle='rgba(255,60,80,.95)';
        if(h.r!==undefined){ g.beginPath(); g.arc(h.x,h.y,h.r,0,Math.PI*2); g.fill(); g.stroke(); }
        else { g.fillRect(h.x,Math.max(-50,h.y),h.w,Math.min(h.h,700)); g.strokeRect(h.x,Math.max(-50,h.y),h.w,Math.min(h.h,700)); } }
    }
    g.setLineDash([6,6]); g.strokeStyle='rgba(255,90,255,.8)';
    for(const e of w.ents){ if(e.tx!==undefined&&e.st==='idle'){ g.beginPath(); g.moveTo(e.tx,40); g.lineTo(e.tx,G); g.stroke(); } }
    g.setLineDash([]);
    // body (green) and hurtbox (yellow)
    g.strokeStyle='rgba(120,255,120,.95)'; g.strokeRect(P.x-CFG.halfW,P.y-CFG.bodyH,CFG.halfW*2,CFG.bodyH);
    const f=P.facing>=0?1:-1, l=f>0?P.x-CFG.hurtHalfW:P.x-CFG.hurtHead, r=f>0?P.x+CFG.hurtHead:P.x+CFG.hurtHalfW;
    g.strokeStyle='rgba(255,230,60,.95)'; g.strokeRect(l,P.y-CFG.hurtTop,r-l,CFG.hurtTop-CFG.hurtBottom);
    if(w.goal){ g.strokeStyle=w.goal.locked?'rgba(255,80,80,.9)':'rgba(255,255,255,.8)'; g.strokeRect(w.goal.x-12,(w.goal.y||G)-60,24,60); }
    g.restore();
    // readout
    g.save(); g.setTransform(this.dpr,0,0,this.dpr,0,0);
    const now=performance.now(); this.fpsT=this.fpsT||[]; this.fpsT.push(now); while(this.fpsT[0]<now-1000) this.fpsT.shift();
    const lines=[`FPS ${this.fpsT.length}  steps/frame ${steps.length}  step ${steps[0]?(steps[0]*1000).toFixed(2):'-'}ms`,
      `x ${P.x.toFixed(1)} y ${P.y.toFixed(1)} vx ${P.vx.toFixed(0)} vy ${P.vy.toFixed(0)} ${P.ground?'ground:'+(P.ref&&(P.ref.kind||'solid')):'air'}${P.dead?' DEAD:'+P.cause:''}`,
      w.ents.map((e,i)=>i+':'+e.kind+'('+e.st+')').join(' ')];
    g.font='600 11px ui-monospace,monospace'; g.textBaseline='top';
    const wmax=Math.min(this.W-20,Math.max(...lines.map(t=>g.measureText(t).width))+12);
    g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(8,58,wmax,lines.length*15+8);
    g.fillStyle='#bfffc8'; lines.forEach((t,i)=>g.fillText(t,14,62+i*15,this.W-30));
    g.restore();
  },
  // Canvas-space overlay text (death quote, clear)
  overlay(w,ui,now){
    const g=this.g; g.setTransform(this.dpr,0,0,this.dpr,0,0);
    const P=w.P;
    if(P.dead && ui.deathQuote){
      const a=Math.min(1,P.deadT*4)*0.6;
      g.fillStyle=`rgba(0,0,0,${a})`; g.fillRect(0,0,this.W,this.H);
      g.globalAlpha=Math.min(1,Math.max(0,(P.deadT-0.12)*5));
      g.fillStyle='#fff'; g.font='700 26px system-ui,-apple-system,sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText(ui.deathQuote,this.W/2,this.H/2);
      g.globalAlpha=1;
    }
    if(w.cleared){
      const ms=w.clearT*1000;
      const t=Math.min(1,ms/650), pop=Math.min(1,ms/260), eased=1-Math.pow(1-pop,3);
      g.save();
      g.globalAlpha=0.18+0.42*t; g.fillStyle='#000'; g.fillRect(0,0,this.W,this.H);
      if(ms<520){ const rt=ms/520; g.globalAlpha=(1-rt)*0.7; g.strokeStyle='#fff'; g.lineWidth=3; g.beginPath(); g.arc(this.W/2,this.H/2-10,24+rt*105,0,TAU); g.stroke(); }
      g.translate(this.W/2,this.H/2-10); g.scale(0.72+0.28*eased,0.72+0.28*eased);
      g.globalAlpha=Math.min(1,ms/150); g.fillStyle='#fff'; g.textAlign='center'; g.textBaseline='middle';
      g.font='900 32px system-ui,-apple-system,sans-serif'; g.shadowColor='rgba(255,255,255,.35)'; g.shadowBlur=10;
      g.fillText('STAGE CLEAR',0,0);
      g.restore();
    }
  },

  // ---------------------------------------------------------------------------
  // Ending scene: the dark room, you, and Nine.
  // ---------------------------------------------------------------------------
  ending(st,dt){
    const g=this.g; g.setTransform(this.dpr,0,0,this.dpr,0,0);
    const scale=Math.min(this.W/VIEW_W,this.H/WH);
    const ox=(this.W-VIEW_W*scale)/2, oy=(this.H-WH*scale)/2;
    g.fillStyle='#000'; g.fillRect(0,0,this.W,this.H);
    g.save(); g.translate(ox,oy); g.scale(scale,scale);
    const L=st.light; // 0 dark .. 1 lights on
    const mix=(a,b)=>{ const pa=a.match(/\w\w/g).map(h=>parseInt(h,16)), pb=b.match(/\w\w/g).map(h=>parseInt(h,16)); return '#'+pa.map((v,i)=>Math.round(v+(pb[i]-v)*L).toString(16).padStart(2,'0')).join(''); };
    // room
    rect(g,mix('1a1b26','e8d2ae'),0,0,VIEW_W,G);
    rect(g,mix('141520','cdb58e'),0,G-14,VIEW_W,14);
    rect(g,mix('1d1c22','8a6e50'),0,G,VIEW_W,WH-G);
    // window with the night and rain
    const wx=600, wy=90;
    rect(g,mix('101118','7a6146'),wx-8,wy-8,236,176);
    rect(g,'#0c1226',wx,wy,220,160);
    const r=rng(4);
    for(let i=0;i<60;i++){ const x=wx+r()*220, y=wy+90+r()*70; rect(g,r()<.3?'rgba(255,220,150,.8)':'rgba(255,190,120,.4)',x,y,2,3); }
    circ(g,'#e8e8f0',wx+170,wy+36,12);
    g.strokeStyle=`rgba(170,190,230,${0.35*(1-st.rainStop)})`; g.lineWidth=1; g.beginPath();
    for(let i=0;i<40;i++){ const x=wx+((i*53+st.t*40)%220), y=wy+((i*37+st.t*400)%160); g.moveTo(x,y); g.lineTo(x-2,y+10); } g.stroke();
    rect(g,mix('101118','7a6146'),wx+106,wy,8,160); rect(g,mix('101118','7a6146'),wx,wy+76,220,8);
    // moonlight on the floor
    g.fillStyle=`rgba(180,200,255,${0.08*(1-L)})`; g.beginPath(); g.moveTo(wx,wy+160); g.lineTo(wx+220,wy+160); g.lineTo(wx+300,G+120); g.lineTo(wx-120,G+120); g.fill();
    // bed
    rect(g,mix('20202c','b8c4d8'),640,G-80,330,60); rect(g,mix('191922','8a6e50'),630,G-90,12,90); rect(g,mix('262634','f2f0ea'),650,G-96,90,22);
    // photo frame on the wall: the person and the cat
    rect(g,mix('141520','6b5842'),200,130,70,54); rect(g,mix('2a2a36','efe4cc'),206,136,58,42);
    circ(g,mix('3a3a48','8a7760'),226,150,6); rect(g,mix('3a3a48','8a7760'),219,156,14,18); rect(g,'#111',242,166,14,8); circ(g,'#111',254,163,5);
    // door (left)
    const doorOpen=st.door;
    rect(g,mix('0c0c12','5a4432'),60,G-170,100,170);
    rect(g,`rgba(255,214,150,${0.9*doorOpen})`,64,G-166,92,166);
    g.fillStyle=mix('2a2a36','8a6448'); g.beginPath(); g.moveTo(64,G-166); g.lineTo(64+92*(1-doorOpen*0.8),G-166+10*doorOpen); g.lineTo(64+92*(1-doorOpen*0.8),G-10*doorOpen); g.lineTo(64,G); g.fill();
    if(doorOpen>0) { g.fillStyle=`rgba(255,214,150,${0.18*doorOpen})`; g.beginPath(); g.moveTo(156,G-166); g.lineTo(156,G); g.lineTo(520,G+80); g.lineTo(420,G-40); g.fill(); }
    // you: sitting on the floor against the bed, knees up, facing the door
    const px=575, py=G, head=st.lookUp;
    const sil=mix('07070b','3c3246');
    const limb=(x1,y1,x2,y2,wd)=>{ g.strokeStyle=sil; g.lineWidth=wd; g.lineCap='round'; g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke(); };
    const hip=[px+14,py-14], knee=[px-32,py-68], foot=[px-62,py-8];
    const sh=[px+6-head*2,py-92+head*-4];
    limb(hip[0],hip[1],sh[0],sh[1],36);          // torso
    limb(hip[0],hip[1],knee[0],knee[1],26);      // thigh
    limb(knee[0],knee[1],foot[0],foot[1],19);    // shin
    limb(foot[0],foot[1],foot[0]-14,foot[1]+2,10);
    // head rests on the knees, then lifts toward the cat
    const hx=px-18+head*10-(1-head)*8, hy=py-90-head*34;
    circ(g,sil,hx,hy,19);
    g.fillStyle=mix('050508','2a2230'); g.beginPath(); g.ellipse(hx+6,hy-6,20,15,0.5,Math.PI*0.9,Math.PI*2.1); g.fill();
    limb(sh[0],sh[1]+6,knee[0]+6,knee[1]+8,12);  // arm around the knees
    g.lineCap='butt';
    // the cat
    const im=this.imgs;
    const sp=st.catWalking?im.walk[Math.floor(st.t*10)%4]:(st.t%4>3.85?im.sitBlink:im.sit);
    if(sp){ const SC=2.6, dw=sp.width*SC, dh=sp.height*SC;
      g.save(); g.imageSmoothingEnabled=false; g.translate(Math.round(st.catX),G); g.drawImage(sp,-dw/2,-dh,dw,dh); g.restore(); }
    // warm light spreading
    if(L>0){ glow(g,500,G-60,520,'rgba(255,200,130,A)',0.3*L); }
    // soft lamp
    rect(g,mix('141520','6d5d48'),900,G-150,8,70); g.fillStyle=mix('222230','f3d9a0'); g.beginPath(); g.moveTo(880,G-150); g.lineTo(928,G-150); g.lineTo(918,G-178); g.lineTo(890,G-178); g.fill();
    if(L>0) glow(g,904,G-160,120,'rgba(255,220,150,A)',0.5*L);
    g.restore();
    // letterbox fade
    if(st.fade>0){ g.fillStyle=`rgba(0,0,0,${st.fade})`; g.fillRect(0,0,this.W,this.H); }
  }
};

root.NEKO_RENDER=R;
})(window);
