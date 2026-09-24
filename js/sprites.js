// Neko Nine: Nine, the black cat, drawn as pixel art from code.
// Every frame comes from the same shape recipe, so the cat stays consistent.
(function(root){
'use strict';
const W=40, H=28;
const PAL=[null,'#1c1926','#4a4462','#ffc95a','#120f18','#ffffff','#f39bb2','#5a2a44','#e0484f','#f5c542','#2c2838'];
// 1 body  2 rim light  3 eye  4 pupil  5 glint  6 pink  7 blush  8 collar  9 bell  10 shade

function makeGrid(){ return new Uint8Array(W*H); }
function set(g,x,y,c){ x=Math.round(x); y=Math.round(y); if(x>=0&&y>=0&&x<W&&y<H) g[y*W+x]=c; }
function get(g,x,y){ return (x>=0&&y>=0&&x<W&&y<H)?g[y*W+x]:0; }
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
function thick(g,pts,r,c){ // polyline with round brush
  for(let i=0;i<pts.length-1;i++){
    const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2)+1;
    for(let k=0;k<=n;k++){ const t=k/n; ellipse(g,x0+(x1-x0)*t,y0+(y1-y0)*t,r,r,c); }
  }
}
function bez(p0,p1,p2,n){ const out=[]; for(let i=0;i<=n;i++){ const t=i/n,u=1-t; out.push([u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]]); } return out; }

// o: {bob, legs:[[dx,len]x4], head:[dx,dy], tail:[cx,cy,tx,ty], squash, blink, sit}
function paint(o){
  const g=makeGrid();
  const b=o.bob||0, hx=(o.head?o.head[0]:0), hy=(o.head?o.head[1]:0)+b;
  const sq=o.squash||0;
  if(o.sit){
    // sitting, seen from the side, tail curled around the paws
    thick(g,bez([10,25],[2,26],[3,19],10),1.3,1);
    ellipse(g,15,19,7.5,7.2,1);
    ellipse(g,18,24.5,5,2.6,1);
    ellipse(g,22,13,3.5,4,1);
    const HX=24, HY=8;
    ellipse(g,HX,HY,7.2,6.4,1);
    tri(g,[HX-6,HY-3],[HX-5,HY-9.5],[HX-1.5,HY-5],1); tri(g,[HX+1.5,HY-5],[HX+5,HY-9.5],[HX+6.5,HY-2],1);
    set(g,HX-4.5,HY-6.5,6); set(g,HX+4.5,HY-6.5,6);
    rim(g);
    face(g,HX,HY,o.blink,o.lookBack);
    collar(g,HX-3,HY+5);
    return g;
  }
  // tail
  const t=o.tail||[1,10,3,2];
  thick(g,bez([8,15+b],[t[0],t[1]+b],[t[2],t[3]+b],12),1.35,1);
  // legs (drawn before the body so the body overlaps their tops)
  const L=o.legs||[[0,5],[0,5],[0,5],[0,5]];
  const lx=[9,13,21,25];
  for(let i=0;i<4;i++){
    const x=lx[i]+L[i][0], top=19+b, len=L[i][1];
    for(let y=top;y<top+len+2;y++) for(let k=0;k<3;k++) set(g,x+k,y,i%2?1:10);
    set(g,x+3,top+len+1,i%2?1:10); // paw
  }
  // body, neck, head
  ellipse(g,17,17+b+sq*0.6,10.5,5.8-sq,1);
  ellipse(g,24,14+b,4.2,4.2,1);
  const HX=29+hx, HY=10+hy;
  ellipse(g,HX,HY,7.4,6.6,1);
  tri(g,[HX-6.2,HY-3],[HX-5,HY-10],[HX-1.2,HY-5.2],1);
  tri(g,[HX+1.4,HY-5.4],[HX+5.2,HY-10],[HX+6.8,HY-2.2],1);
  set(g,HX-4.6,HY-7,6); set(g,HX-4.6,HY-6,6); set(g,HX+4.6,HY-7,6);
  rim(g);
  face(g,HX,HY,o.blink);
  collar(g,HX-6,HY+4.5);
  return g;
}
function rim(g){
  const out=g.slice();
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    if(g[y*W+x]!==1&&g[y*W+x]!==10) continue;
    if(!get(g,x,y-1)||!get(g,x-1,y)&&!get(g,x,y-2)) out[y*W+x]=2;
  }
  g.set(out);
}
function face(g,HX,HY,blink,back){
  // big round eyes: the near one and the far one
  if(blink){
    for(const x of [HX-1,HX,HX+1]) set(g,x,HY,2);
    for(const x of [HX+4,HX+5]) set(g,x,HY,2);
  }else{
    // simple round eyes: amber with a single sparkle
    for(let y=HY-2;y<=HY+1;y++) for(let x=HX-1;x<=HX;x++) set(g,x,y,3);
    set(g,HX-1,HY-2,5);
    for(let y=HY-2;y<=HY+1;y++) for(let x=HX+4;x<=HX+5;x++) set(g,x,y,3);
    set(g,HX+4,HY-2,5);
  }
  set(g,HX+6,HY+2,6); // nose
  set(g,HX-1,HY+3,7); set(g,HX,HY+3,7); // blush
}
function collar(g,x,y){
  for(let i=0;i<5;i++) set(g,x+i,y+(i>1&&i<4?1:0)+(i===4?0:0),8);
  set(g,x+2,y+2,9); set(g,x+3,y+2,9); set(g,x+2,y+3,9); set(g,x+3,y+3,9);
}
function toCanvas(g){
  const c=(typeof document!=='undefined')?document.createElement('canvas'):null;
  c.width=W; c.height=H;
  const x=c.getContext('2d'); const img=x.createImageData(W,H);
  for(let i=0;i<W*H;i++){
    const col=PAL[g[i]]; if(!col) continue;
    const n=parseInt(col.slice(1),16);
    img.data[i*4]=n>>16; img.data[i*4+1]=(n>>8)&255; img.data[i*4+2]=n&255; img.data[i*4+3]=255;
  }
  x.putImageData(img,0,0);
  return c;
}

function build(){
  const walkLegs=[
    [[1,5],[-1,4],[-1,4],[1,5]],
    [[0,5],[0,5],[0,5],[0,5]],
    [[-1,4],[1,5],[1,5],[-1,4]],
    [[0,5],[0,5],[0,5],[0,5]]
  ];
  const f={
    idle:toCanvas(paint({})),
    idleBlink:toCanvas(paint({blink:true})),
    walk:walkLegs.map((legs,i)=>toCanvas(paint({legs,bob:i%2?-1:0,tail:[0,9+(i%2),3,1+(i%2)]}))),
    jump:{
      rise:toCanvas(paint({legs:[[-2,5],[-2,5],[2,3],[2,3]],head:[0,-1],tail:[-1,16,1,20]})),
      apex:toCanvas(paint({legs:[[0,3],[0,3],[0,3],[0,3]],tail:[0,8,4,1]})),
      fall:toCanvas(paint({legs:[[-1,6],[1,6],[-1,6],[1,6]],head:[0,1],tail:[1,4,6,0]})),
      land:toCanvas(paint({legs:[[-1,3],[1,3],[-1,3],[1,3]],bob:2,squash:1,head:[0,0],tail:[0,12,2,8]}))
    },
    sit:toCanvas(paint({sit:true})),
    sitBlink:toCanvas(paint({sit:true,blink:true}))
  };
  f.icon=f.idle.toDataURL();
  f.sitIcon=f.sit.toDataURL();
  return f;
}
root.NEKO_SPRITES={build,W,H,SCALE:2};
})(window);
