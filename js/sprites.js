// Neko Nine: Nine, the black cat, drawn as pixel art from code.
// Every frame comes from one shape recipe per design, so the cat stays consistent.
(function(root){
'use strict';
const W=44, H=30, OX=2, OY=2;
const PAL=[null,'#1c1926','#4d4868','#9fdcff','#3f8fe0','#ffffff','#f39bb2','#5a2a44','#3d86f0','#f5c542','#2c2838','#a8ceff','#9aa5c8','#3a6fd8','#9ad6ff'];
// 1 body  2 rim light  3 eye light  4 eye deep  5 glint  6 pink  7 blush  8 blue cloth  9 bell  10 shade  11 cloth light  12 whisker

// ---------------------------------------------------------------------------
// Character designs. Eyes and neckwear are blue in every design.
// ---------------------------------------------------------------------------
const DESIGNS={
  maru:{name:'まる',desc:'丸い頭のちびキャラ。青い首輪に金の鈴。',
    body:[17,17,10.5,5.8], neck:[24,14,4.2], head:[29,10,7.4,6.6], ear:10, legs:[[9,13,21,25],5,3],
    tail:[[8,15],[1,10],[3,2],1.35], eye:'round', acc:'collar'},
  sura:{name:'すらり',desc:'細身で大人びた猫。細い青の首輪にタグ。長いしっぽ。',
    body:[16,17.5,10.5,4.6], neck:[24,13,3.4], head:[29,8.5,6.2,5.6], ear:11.5, legs:[[8,12,20,23],6,2],
    tail:[[6,16],[-1,8],[5,1],1.05], eye:'almond', acc:'tag'},
  mafu:{name:'マフラー',eyeCute:true,desc:'ふわっと丸い体。青いマフラーの端が風になびく。',
    body:[17,17.5,11,6.4], neck:[24,14,4.6], head:[29,11,7.6,6.8], ear:12, earW:1.25, legs:[[9,13,21,25],4,3],
    tail:[[7,15],[0,12],[2,5],1.7], eye:'oval', acc:'scarf', noPink:true, whiskers:true},
  koneko:{name:'こねこ',desc:'頭の大きな子猫。大きな瞳と青いリボン。',
    body:[17,19,9,5], neck:[23,15,4], head:[28.5,10,8.6,7.6], ear:9, legs:[[10,13.5,20,23.5],4,3],
    tail:[[9,17],[3,14],[4,7],1.3], eye:'big', acc:'ribbon'}
};

function makeGrid(){ return new Uint8Array(W*H); }
function set(g,x,y,c){ x=Math.round(x)+OX; y=Math.round(y)+OY; if(x>=0&&y>=0&&x<W&&y<H) g[y*W+x]=c; }
function rawGet(g,x,y){ return (x>=0&&y>=0&&x<W&&y<H)?g[y*W+x]:0; }
function ellipse(g,cx,cy,rx,ry,c){
  for(let y=Math.floor(cy-ry-1);y<=cy+ry+1;y++) for(let x=Math.floor(cx-rx-1);x<=cx+rx+1;x++){
    const dx=(x+0.5-cx)/rx, dy=(y+0.5-cy)/ry; if(dx*dx+dy*dy<=1) set(g,x,y,c);
  }
}
function tri(g,a,b,c,col){
  const minx=Math.floor(Math.min(a[0],b[0],c[0])), maxx=Math.ceil(Math.max(a[0],b[0],c[0]));
  const miny=Math.floor(Math.min(a[1],b[1],c[1])), maxy=Math.ceil(Math.max(a[1],b[1],c[1]));
  const s=(p,q,r)=>(p[0]-r[0])*(q[1]-r[1])-(q[0]-r[0])*(p[1]-r[1]);
  for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){
    const p=[x+0.5,y+0.5]; const d1=s(p,a,b),d2=s(p,b,c),d3=s(p,c,a);
    const neg=d1<0||d2<0||d3<0, pos=d1>0||d2>0||d3>0; if(!(neg&&pos)) set(g,x,y,col);
  }
}
function thick(g,pts,r,c){
  for(let i=0;i<pts.length-1;i++){
    const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2)+1;
    for(let k=0;k<=n;k++){ const t=k/n; ellipse(g,x0+(x1-x0)*t,y0+(y1-y0)*t,r,r,c); }
  }
}
function bez(p0,p1,p2,n){ const out=[]; for(let i=0;i<=n;i++){ const t=i/n,u=1-t; out.push([u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]]); } return out; }

function rim(g){
  const out=g.slice();
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const v=g[y*W+x]; if(v!==1&&v!==10) continue;
    if(!rawGet(g,x,y-1)||(!rawGet(g,x-1,y)&&!rawGet(g,x,y-2))) out[y*W+x]=2;
  }
  g.set(out);
}
function ears(g,D,HX,HY){
  const h=D.ear, rx=D.head[2], w=D.earW||1;
  tri(g,[HX-rx*0.9*w,HY-2.5],[HX-rx*0.66,HY-h],[HX-rx*0.1,HY-rx*0.72],1);
  tri(g,[HX+rx*0.12,HY-rx*0.74],[HX+rx*0.7,HY-h],[HX+rx*0.98*w,HY-2],1);
  const inner=D.noPink?2:6;
  if(D.noPink){
    // inner ear: a lighter triangle so the ears read clearly
    tri(g,[HX-rx*0.62,HY-4.5],[HX-rx*0.63,HY-h+2.2],[HX-rx*0.3,HY-5.6],inner);
    tri(g,[HX+rx*0.4,HY-5.8],[HX+rx*0.68,HY-h+2.2],[HX+rx*0.78,HY-4],inner);
  }else{
    set(g,HX-rx*0.62,HY-h*0.7,6); set(g,HX-rx*0.62,HY-h*0.6,6); set(g,HX+rx*0.62,HY-h*0.7,6);
  }
}
function face(g,D,HX,HY,blink){
  const far=D.eye==='big'?5:D.eye==='almond'?4:D.eye==='oval'?5:5;
  if(blink){
    for(const x of [HX-1,HX,HX+1]) set(g,x,HY,2);
    for(const x of [HX+far-1,HX+far]) set(g,x,HY,2);
  }else if(D.eyeCute){
    // cute eyes: rich blue iris, a white sparkle, a pale reflection at the bottom
    const near=[[0,13,13],[5,13,13],[13,13,13],[0,14,14]];
    near.forEach((row,ry)=>row.forEach((v,rx)=>{ if(v) set(g,HX-1+rx,HY-2+ry,v); }));
    const farE=[[13,13],[5,13],[13,13],[14,0]];
    farE.forEach((row,ry)=>row.forEach((v,rx)=>{ if(v) set(g,HX+far-1+rx,HY-2+ry,v); }));
  }else if(D.eye==='oval'){
    // rounder eyes: 4x4 near eye and 3x4 far eye with clipped corners
    for(let y=HY-2;y<=HY+1;y++) for(let x=HX-2;x<=HX+1;x++){ const corner=(y===HY-2||y===HY+1)&&(x===HX-2||x===HX+1); if(!corner) set(g,x,y,y<HY?3:4); }
    set(g,HX-1,HY-1,5);
    for(let y=HY-2;y<=HY+1;y++) for(let x=HX+far-2;x<=HX+far;x++){ const corner=(y===HY-2||y===HY+1)&&(x===HX+far-2||x===HX+far); if(!corner) set(g,x,y,y<HY?3:4); }
    set(g,HX+far-1,HY-1,5);
  }else if(D.eye==='almond'){
    for(const x of [HX-1,HX,HX+1]) set(g,x,HY-1,3);
    for(const x of [HX-1,HX,HX+1]) set(g,x,HY,4);
    set(g,HX-1,HY-1,5);
    set(g,HX+far-1,HY-1,3); set(g,HX+far,HY-1,3); set(g,HX+far-1,HY,4); set(g,HX+far,HY,4);
  }else if(D.eye==='big'){
    for(let y=HY-2;y<=HY+1;y++) for(let x=HX-1;x<=HX+1;x++) set(g,x,y,y<HY?3:4);
    set(g,HX+1,HY-2,1); set(g,HX-1,HY+1,1);
    set(g,HX-1,HY-2,5); set(g,HX,HY-2,5);
    for(let y=HY-2;y<=HY+1;y++) for(let x=HX+far-1;x<=HX+far;x++) set(g,x,y,y<HY?3:4);
    set(g,HX+far-1,HY-2,5);
  }else{
    for(let y=HY-2;y<=HY+1;y++) for(let x=HX-1;x<=HX;x++) set(g,x,y,y<HY?3:4);
    set(g,HX-1,HY-2,5);
    for(let y=HY-2;y<=HY+1;y++) for(let x=HX+far-1;x<=HX+far;x++) set(g,x,y,y<HY?3:4);
    set(g,HX+far-1,HY-2,5);
  }
  if(!D.noPink){
    set(g,HX+Math.round(D.head[2]*0.8),HY+2,6);       // nose
    set(g,HX-1,HY+3,7); set(g,HX,HY+3,7);             // blush
  }
  if(D.whiskers){
    const mx=HX+Math.round(D.head[2])-1;
    set(g,mx,HY+2,12); set(g,mx+1,HY+2,12); set(g,mx+2,HY+1,12); set(g,mx+3,HY+1,12);
    set(g,mx,HY+3,12); set(g,mx+1,HY+4,12); set(g,mx+2,HY+4,12); set(g,mx+3,HY+5,12);
  }
}
function neckwear(g,D,HX,HY,flutter){
  const x=HX-Math.round(D.head[2]*0.8), y=HY+Math.round(D.head[3]*0.66);
  if(D.acc==='scarf'){
    // a thick knitted wrap around the neck, two ends hanging down the back
    const f=flutter||0;
    for(let i=-1;i<7;i++) for(let r=-1;r<=1;r++){ const yy=y+r+(i>1&&i<5?1:0); set(g,x+i,yy,(i+r)%3===0?11:8); }
    thick(g,[[x-1,y+1],[x-2,y+4],[x-3+f*0.5,y+6]],0.9,8);
    thick(g,[[x+1,y+2],[x+1,y+5],[x+f*0.5,y+7]],0.9,11);
  }else if(D.acc==='ribbon'){
    for(let i=0;i<6;i++) set(g,x+i-1,y+(i>1&&i<4?1:0),8);
    // bow on the near side
    const bx=x+1, by=y+1;
    set(g,bx,by,11);
    for(const [dx,dy] of [[-1,-1],[-2,-1],[-1,0],[-2,0],[-2,1],[1,-1],[2,-1],[1,0],[2,0],[2,1]]) set(g,bx+dx,by+dy,8);
    set(g,bx-1,by+1,8); set(g,bx+1,by+2,8); set(g,bx-1,by+2,8);
  }else if(D.acc==='tag'){
    for(let i=0;i<5;i++) set(g,x+i,y+(i>1&&i<4?1:0),8);
    set(g,x+2,y+2,11); set(g,x+2,y+3,9);
  }else{
    for(let i=0;i<5;i++){ set(g,x+i,y+(i>1&&i<4?1:0),8); }
    set(g,x+1,y,11);
    set(g,x+2,y+2,9); set(g,x+3,y+2,9); set(g,x+2,y+3,9); set(g,x+3,y+3,9);
  }
}

// o: {bob, legs:[[dx,len]x4], head:[dx,dy], tail:[cx,cy,tx,ty], squash, blink, sit, flutter}
function paint(D,o){
  const g=makeGrid();
  const b=o.bob||0, sq=o.squash||0;
  if(o.sit){
    const s=D.head[2]/7.4;
    thick(g,bez([10,25],[2,26],[3,19],10),D.tail[3],1);
    ellipse(g,15,19,7.5*(D.body[3]/5.8)**0.3,7.2,1);
    ellipse(g,18,24.5,5,2.6,1);
    ellipse(g,21.5,13,D.neck[2]*0.85,4,1);
    const HX=24, HY=9-(s-1)*3;
    ellipse(g,HX,HY,D.head[2],D.head[3],1);
    ears(g,D,HX,HY);
    rim(g);
    face(g,D,HX,HY,o.blink);
    neckwear(g,D,HX,HY,0.5);
    return g;
  }
  const T=o.tail||[D.tail[1][0],D.tail[1][1],D.tail[2][0],D.tail[2][1]];
  thick(g,bez([D.tail[0][0],D.tail[0][1]+b],[T[0],T[1]+b],[T[2],T[3]+b],14),D.tail[3],1);
  const L=o.legs||[[0,D.legs[1]],[0,D.legs[1]],[0,D.legs[1]],[0,D.legs[1]]];
  const lw=D.legs[2], top=D.body[1]+D.body[3]*0.35+b;
  for(let i=0;i<4;i++){
    const x=D.legs[0][i]+L[i][0], len=L[i][1];
    for(let y=Math.floor(top);y<top+len+2;y++) for(let k=0;k<lw;k++) set(g,x+k,y,i%2?1:10);
    set(g,x+lw,Math.floor(top+len+1),i%2?1:10);
  }
  ellipse(g,D.body[0],D.body[1]+b+sq*0.6,D.body[2],D.body[3]-sq,1);
  ellipse(g,D.neck[0],D.neck[1]+b,D.neck[2],D.neck[2],1);
  const HX=D.head[0]+(o.head?o.head[0]:0), HY=D.head[1]+(o.head?o.head[1]:0)+b;
  ellipse(g,HX,HY,D.head[2],D.head[3],1);
  ears(g,D,HX,HY);
  rim(g);
  face(g,D,HX,HY,o.blink);
  neckwear(g,D,HX,HY,o.flutter);
  return g;
}
function toCanvas(g){
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  const x=c.getContext('2d'); const img=x.createImageData(W,H);
  for(let i=0;i<W*H;i++){
    const col=PAL[g[i]]; if(!col) continue;
    const n=parseInt(col.slice(1),16);
    img.data[i*4]=n>>16; img.data[i*4+1]=(n>>8)&255; img.data[i*4+2]=n&255; img.data[i*4+3]=255;
  }
  x.putImageData(img,0,0);
  return c;
}

let current='mafu';
function build(id){
  const D=DESIGNS[id||current]||DESIGNS.maru;
  const n=D.legs[1];
  const walkLegs=[
    [[1,n],[-1,n-1],[-1,n-1],[1,n]],
    [[0,n],[0,n],[0,n],[0,n]],
    [[-1,n-1],[1,n],[1,n],[-1,n-1]],
    [[0,n],[0,n],[0,n],[0,n]]
  ];
  const t=D.tail;
  const P=(o)=>toCanvas(paint(D,o));
  const f={
    idle:P({}),
    idleBlink:P({blink:true}),
    walk:walkLegs.map((legs,i)=>P({legs,bob:i%2?-1:0,flutter:i%2,tail:[t[1][0]-1,t[1][1]+(i%2),t[2][0],t[2][1]+(i%2)]})),
    jump:{
      rise:P({legs:[[-2,n],[-2,n],[2,n-2],[2,n-2]],head:[0,-1],tail:[t[0][0]-8,t[0][1]+1,t[0][0]-13,t[0][1]+4],flutter:2}),
      apex:P({legs:[[0,n-2],[0,n-2],[0,n-2],[0,n-2]],flutter:1}),
      fall:P({legs:[[-1,n+1],[1,n+1],[-1,n+1],[1,n+1]],head:[0,1],tail:[t[1][0],t[1][1]-5,t[2][0]+3,t[2][1]-2],flutter:-1}),
      land:P({legs:[[-1,n-2],[1,n-2],[-1,n-2],[1,n-2]],bob:2,squash:1,tail:[t[1][0],t[1][1]+3,t[2][0],t[2][1]+6]})
    },
    sit:P({sit:true}),
    sitBlink:P({sit:true,blink:true})
  };
  f.icon=f.idle.toDataURL();
  f.design=id||current;
  return f;
}
root.NEKO_SPRITES={build,DESIGNS,W,H,SCALE:2,get current(){return current;},set current(v){ if(DESIGNS[v]) current=v; }};
})(window);
