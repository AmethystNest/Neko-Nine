// Neko Nine frame pacing (no DOM, tested headlessly).
// Based on the idea in LittleJS (MIT): never let the simulation stutter because the
// display runs at a slightly different or higher rate than the physics.
// Each rendered frame advances the world by exactly the real elapsed time, split into
// equal sub-steps no longer than maxStep. So a 60 Hz, 90 Hz, 120 Hz or 144 Hz display
// always gets one smooth update per frame: no frames with zero steps, no double steps.
(function(root){
'use strict';
class FramePacer{
  constructor(maxStep,maxFrame){
    this.maxStep=maxStep||1/120;   // longest physics step (s)
    this.maxFrame=maxFrame||0.05;  // clamp after tab switches / hitches (s)
    this.last=null;
    this.smooth=0;
  }
  reset(now){ this.last=now; this.smooth=0; }
  // Returns the list of sub-step sizes for this frame.
  frame(now){
    let dt=this.last!==null?(now-this.last)/1000:0;
    this.last=now;
    if(!(dt>0)) return [];
    dt=Math.min(dt,this.maxFrame);
    // light smoothing of tiny jitter between frames (keeps motion even when the
    // browser reports 16.4 / 16.9 ms alternately)
    this.smooth=this.smooth?this.smooth+(dt-this.smooth)*0.25:dt;
    if(Math.abs(dt-this.smooth)<0.0015) dt=this.smooth;
    // allow a step to run 3% long rather than splitting a 60 Hz frame into three
    const n=Math.max(1,Math.ceil(dt/(this.maxStep*1.03)));
    const h=dt/n, out=new Array(n);
    for(let i=0;i<n;i++) out[i]=h;
    return out;
  }
}
root.NEKO_LOOP={FramePacer};
})(typeof window!=='undefined'?window:globalThis);
