// Neko Nine audio: every sound effect and every piece of music is synthesized here.
// SE are rendered once into buffers (OfflineAudioContext); music is a small live sequencer.
(function(root){
'use strict';

// ---------------------------------------------------------------------------
// note helpers
// ---------------------------------------------------------------------------
const NOTE={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function hz(n){ if(typeof n==='number') return n; const m=/^([A-G][#b]?)(-?\d)$/.exec(n); return 440*Math.pow(2,(NOTE[m[1]]+(+m[2]+1)*12-69)/12); }
function chord(str){ return str.split(' ').map(hz); }
// "E5:1 G5:1 r:2" -> [[beat,freq,dur],...]
function mel(str,start){ let b=start||0; const out=[]; for(const tok of str.trim().split(/\s+/)){ const [n,d]=tok.split(':'); const du=+d; if(n!=='r') out.push([b,hz(n),du]); b+=du; } return out; }

// ---------------------------------------------------------------------------
// shared synth building blocks (work on any BaseAudioContext)
// ---------------------------------------------------------------------------
const noiseCache=new WeakMap();
function noiseBuf(c){
  let b=noiseCache.get(c); if(b) return b;
  const n=Math.floor(c.sampleRate*2); b=c.createBuffer(1,n,c.sampleRate); const d=b.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
  noiseCache.set(c,b); return b;
}
function env(g,t,a,peak,dur,curve){
  g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(peak,t+a);
  if(curve==='lin') g.gain.linearRampToValueAtTime(0.0001,t+dur);
  else g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
}
function tone(c,d,o){
  const t=o.t||0, dur=o.dur||0.2;
  const osc=c.createOscillator(); osc.type=o.type||'sine';
  osc.frequency.setValueAtTime(o.f0,t);
  if(o.f1) (o.lin?osc.frequency.linearRampToValueAtTime(o.f1,t+(o.glide||dur)):osc.frequency.exponentialRampToValueAtTime(o.f1,t+(o.glide||dur)));
  if(o.detune) osc.detune.value=o.detune;
  const g=c.createGain(); env(g,t,o.a||0.004,o.vol||0.3,dur,o.curve);
  let node=osc;
  if(o.lp){ const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=o.lp; f.Q.value=o.q||0.7; node.connect(f); node=f; }
  node.connect(g); g.connect(d);
  if(o.vib){ const l=c.createOscillator(); l.frequency.value=o.vib[0]; const lg=c.createGain(); lg.gain.value=o.vib[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t+dur+0.05); }
  osc.start(t); osc.stop(t+dur+0.05);
  return osc;
}
function noise(c,d,o){
  const t=o.t||0, dur=o.dur||0.2;
  const s=c.createBufferSource(); s.buffer=noiseBuf(c);
  const f=c.createBiquadFilter(); f.type=o.ft||'lowpass'; f.frequency.setValueAtTime(o.f0||1000,t); f.Q.value=o.q||0.8;
  if(o.f1) f.frequency.exponentialRampToValueAtTime(o.f1,t+dur);
  const g=c.createGain(); env(g,t,o.a||0.003,o.vol||0.3,dur,o.curve);
  s.connect(f); f.connect(g); g.connect(d);
  s.start(t,Math.random()*1.5); s.stop(t+dur+0.05);
}
function bell(c,d,f,t,dur,vol){
  for(const [m,v] of [[1,1],[2.01,0.35],[3.98,0.12],[5.4,0.05]]) tone(c,d,{f0:f*m,t,dur:dur*(m===1?1:0.6),vol:vol*v,a:0.003});
}

// ---------------------------------------------------------------------------
// Sound effects. Soft, a little toy-like: the world is cruel, the sounds are gentle.
// ---------------------------------------------------------------------------
const SE_DEF={
  jump:[0.2,(c,d)=>{ tone(c,d,{f0:330,f1:660,dur:0.16,vol:0.22,glide:0.1}); tone(c,d,{type:'triangle',f0:660,f1:990,dur:0.1,vol:0.05}); }],
  land:[0.14,(c,d)=>{ tone(c,d,{f0:150,f1:60,dur:0.1,vol:0.35}); noise(c,d,{f0:700,dur:0.06,vol:0.12}); }],
  death:[0.6,(c,d)=>{
    // a soft falling "pew" with a little wobble: no bells
    tone(c,d,{type:'triangle',f0:hz('A5'),f1:hz('A3'),dur:0.42,vol:0.2,glide:0.38,vib:[9,14]});
    tone(c,d,{f0:hz('A4'),f1:hz('A2'),dur:0.4,vol:0.12,glide:0.36});
    noise(c,d,{f0:900,ft:'bandpass',q:1,dur:0.12,vol:0.08});
  }],
  goal:[1.8,(c,d)=>{ ['C5','E5','G5','C6','E6'].forEach((n,i)=>bell(c,d,hz(n),i*0.09,1.4,0.1)); tone(c,d,{f0:hz('C4'),dur:1.4,vol:0.08,a:0.05}); }],
  warn:[0.25,(c,d)=>{ tone(c,d,{type:'square',f0:1250,dur:0.07,vol:0.05,lp:3000}); tone(c,d,{type:'square',f0:1250,dur:0.07,vol:0.05,t:0.11,lp:3000}); }],
  trap:[0.3,(c,d)=>{ noise(c,d,{f0:2500,ft:'bandpass',q:3,dur:0.05,vol:0.25}); tone(c,d,{type:'triangle',f0:1900,f1:1400,dur:0.18,vol:0.08}); }],
  life:[0.35,(c,d)=>{ bell(c,d,hz('A5'),0,0.3,0.1); }],
  gameover:[2.6,(c,d)=>{ ['A4','F4','D4','A3'].forEach((n,i)=>{ tone(c,d,{type:'triangle',f0:hz(n),t:i*0.32,dur:1.4,vol:0.11,a:0.02}); tone(c,d,{f0:hz(n)/2,t:i*0.32,dur:1.6,vol:0.06,a:0.05}); }); }],
  retry:[1.2,(c,d)=>{ bell(c,d,hz('D5'),0,0.9,0.1); bell(c,d,hz('A5'),0.14,1.0,0.1); }],
  start:[1.4,(c,d)=>{ bell(c,d,hz('G4'),0,1.0,0.09); bell(c,d,hz('D5'),0.12,1.0,0.09); bell(c,d,hz('G5'),0.24,1.2,0.1); }],
  checkpoint:[1.6,(c,d)=>{ ['E5','G#5','B5','E6'].forEach((n,i)=>bell(c,d,hz(n),i*0.07,1.3,0.08)); }],
  door:[0.7,(c,d)=>{ noise(c,d,{f0:500,f1:300,ft:'bandpass',q:6,dur:0.45,vol:0.18,a:0.05,curve:'lin'}); tone(c,d,{f0:120,f1:80,dur:0.12,vol:0.25,t:0.45}); }],
  laser:[0.6,(c,d)=>{ tone(c,d,{type:'sawtooth',f0:880,f1:440,dur:0.45,vol:0.06,lp:2400,vib:[40,30]}); tone(c,d,{f0:1760,dur:0.2,vol:0.04}); }],
  lasercharge:[0.5,(c,d)=>{ tone(c,d,{type:'triangle',f0:220,f1:1200,dur:0.42,vol:0.07,glide:0.4}); }],
  electric:[0.9,(c,d)=>{
    for(let i=0;i<9;i++) noise(c,d,{f0:1800+Math.random()*2500,ft:'bandpass',q:2,t:i*0.07+Math.random()*0.03,dur:0.08,vol:0.22});
    tone(c,d,{type:'square',f0:60,dur:0.7,vol:0.05,lp:900});
  }],
  crusher:[1.0,(c,d)=>{ tone(c,d,{f0:90,f1:32,dur:0.7,vol:0.55}); noise(c,d,{f0:500,f1:120,dur:0.5,vol:0.35}); noise(c,d,{f0:3000,ft:'bandpass',q:4,dur:0.08,vol:0.08}); }],
  floorbreak:[1.0,(c,d)=>{ for(let i=0;i<10;i++) noise(c,d,{f0:900+Math.random()*1500,ft:'bandpass',q:1.5,t:i*0.045+Math.random()*0.03,dur:0.12,vol:0.18}); tone(c,d,{f0:110,f1:45,dur:0.4,vol:0.3,t:0.05}); }],
  spike:[1.1,(c,d)=>{
    // "shaki-in": a bright blade being drawn, then a ringing metallic tail
    noise(c,d,{f0:2500,f1:9000,ft:'highpass',dur:0.09,vol:0.3});
    noise(c,d,{f0:7000,ft:'bandpass',q:6,dur:0.5,vol:0.08,t:0.05});
    for(const [f,v,dd] of [[3150,0.07,0.9],[4720,0.05,0.75],[6230,0.04,0.6],[8410,0.025,0.5]]){
      tone(c,d,{f0:f*0.94,f1:f,dur:dd,vol:v,glide:0.06,t:0.03});
    }
    tone(c,d,{type:'triangle',f0:1580,f1:2100,dur:0.18,vol:0.05});
  }],
  blockfall:[0.8,(c,d)=>{ tone(c,d,{f0:120,f1:40,dur:0.5,vol:0.45}); noise(c,d,{f0:700,f1:150,dur:0.35,vol:0.3}); }],
  wallmove:[1.1,(c,d)=>{ noise(c,d,{f0:220,dur:1.0,vol:0.35,a:0.12,curve:'lin'}); tone(c,d,{f0:48,dur:1.0,vol:0.2,a:0.1,curve:'lin'}); }],
  arrow:[0.45,(c,d)=>{ tone(c,d,{type:'triangle',f0:196,f1:180,dur:0.18,vol:0.14}); noise(c,d,{f0:4000,f1:900,ft:'bandpass',q:1.2,dur:0.32,vol:0.2,t:0.02}); }],
  trapdoor:[0.4,(c,d)=>{ noise(c,d,{f0:2200,ft:'bandpass',q:5,dur:0.03,vol:0.3}); noise(c,d,{f0:1600,ft:'bandpass',q:5,dur:0.03,vol:0.25,t:0.07}); tone(c,d,{f0:140,f1:70,dur:0.18,vol:0.25,t:0.08}); }],
  pitshift:[0.35,(c,d)=>{ noise(c,d,{f0:1200,f1:450,ft:'bandpass',q:3,dur:0.28,vol:0.22,a:0.02}); }],
  dropfloor:[1.0,(c,d)=>{ tone(c,d,{f0:100,f1:38,dur:0.6,vol:0.45}); noise(c,d,{f0:600,f1:120,dur:0.7,vol:0.3,a:0.02}); }],
  shutter:[0.35,(c,d)=>{ noise(c,d,{f0:1600,f1:900,ft:'bandpass',q:2,dur:0.25,vol:0.2}); tone(c,d,{type:'square',f0:95,dur:0.15,vol:0.05,lp:600}); }],
  meow:[0.6,(c,d)=>{ const o=tone(c,d,{type:'sawtooth',f0:620,dur:0.42,vol:0.1,lp:1800,q:4}); o.frequency.setValueAtTime(620,0); o.frequency.linearRampToValueAtTime(900,0.12); o.frequency.linearRampToValueAtTime(560,0.42); }]
};
const SE_VOL={jump:0.8,land:0.55,death:1,goal:1,warn:1.6,trap:0.9,life:1,gameover:1,retry:1,start:1,checkpoint:1,door:1,laser:1.5,lasercharge:1.5,electric:0.7,crusher:0.8,floorbreak:0.8,spike:0.8,blockfall:0.8,wallmove:0.7,arrow:0.9,trapdoor:0.9,pitshift:1.8,dropfloor:0.8,shutter:1.4,meow:0.8};

// ---------------------------------------------------------------------------
// Music. Shared leitmotif: the ending's music box melody.
// ---------------------------------------------------------------------------
const MOTIF='E5:1 G5:1 C5:2 D5:1 E5:1 D5:2 C5:1 A4:1 G4:2 A4:1 C5:1 D5:2 E5:1 G5:1 A5:2 G5:1 E5:1 D5:2 C5:1 D5:1 E5:1 D5:1 C5:4';
const TRACKS={
  title:{bpm:66,beats:4,chords:['C3 E3 G3 B3','A2 C3 E3 G3','F2 A2 C3 E3','G2 B2 D3 A3','C3 E3 G3 B3','A2 C3 E3 G3','F2 A2 C3 E3','G2 B2 D3 F3'],
    pad:0.035,arp:{inst:'ep',pat:[0,2,1,3,2,1],step:0.5,oct:2,vol:0.035},melody:{inst:'box',notes:mel(MOTIF,0),vol:0.05},bass:{vol:0.05,beats:[0]}},
  hall:{bpm:76,beats:4,chords:['A2 C3 E3 G3','F2 A2 C3 E3','C3 E3 G3 B3','E2 G2 B2 D3'],
    pad:0.03,arp:{inst:'ep',pat:[0,1,2,3,2,1,0,2],step:0.5,oct:2,vol:0.03},bass:{vol:0.06,beats:[0,2.5]},tick:{vol:0.012,beats:[1,3]},
    melody:{inst:'ep',notes:mel('r:16 E5:1.5 D5:0.5 C5:2 r:4 G4:1 A4:1 C5:2 r:4',0),vol:0.04}},
  rain:{bpm:68,beats:4,chords:['D3 F3 A3 C4 E4','Bb2 D3 F3 A3','F2 A2 C3 E3','C3 E3 G3 D4'],
    pad:0.04,arp:{inst:'ep',pat:[4,2,3,1],step:1,oct:1,vol:0.03},bass:{vol:0.055,beats:[0]},
    melody:{inst:'box',notes:mel('r:8 A5:1 G5:1 F5:2 E5:4 r:8 D5:1 E5:1 F5:2 E5:4',0),vol:0.03}},
  factory:{bpm:96,beats:4,chords:['E2 B2 E3 G3','C2 G2 C3 E3','D2 A2 D3 F#3','B1 F#2 B2 D3'],
    pad:0.022,bass:{vol:0.06,beats:[0,0.5,1,1.5,2,2.5,3,3.5],short:true},tick:{vol:0.014,beats:[0.5,1.5,2.5,3.5]},
    stab:{vol:0.03,beats:[0],everyBars:2,note:4}},
  lab:{bpm:100,beats:4,chords:['A2 C3 E3 A3','F2 A2 C3 F3','G2 B2 D3 G3','E2 G#2 B2 E3'],
    pad:0.018,arp:{inst:'pluck',pat:[0,1,2,3,2,1,2,3],step:0.25,oct:3,vol:0.022},bass:{vol:0.05,beats:[0,2]},tick:{vol:0.01,beats:[0.5,1.5,2.5,3.5]}},
  station:{bpm:84,beats:4,chords:['E2 G2 B2 D3 F#3','C3 E3 G3 B3','G2 B2 D3 F#3','D3 F#3 A3 E4'],
    pad:0.03,arp:{inst:'ep',pat:[0,2,4,2,3,1],step:0.5,oct:1,vol:0.03},bass:{vol:0.055,beats:[0,1.5,2]},tick:{vol:0.012,beats:[0,0.75,2,2.75]},
    melody:{inst:'ep',notes:mel('r:4 B4:1 D5:1 E5:2 r:4 G5:1 F#5:1 D5:2',0),vol:0.035}},
  clock:{bpm:138,beats:3,chords:['A2 C3 E3','E2 G#2 B2','A2 C3 E3','E2 G#2 D3','D2 F2 A2','A2 C3 E3','E2 G#2 B2','A2 C3 E3'],
    pad:0.02,bass:{vol:0.05,beats:[0]},arp:{inst:'box',pat:[1,2],step:1,startBeat:1,oct:2,vol:0.025},tick:{vol:0.02,beats:[0,1,2]},
    melody:{inst:'box',notes:mel('E5:2 A5:1 G#5:2 E5:1 A5:2 C6:1 B5:3 D5:2 F5:1 E5:2 C5:1 B4:3 r:3',0),vol:0.04}},
  dark:{bpm:60,beats:4,chords:['B1 F#2 C#3','B1 F#2 D3','G1 D2 A2','A1 E2 B2'],
    pad:0.045,heart:{vol:0.2,beats:[0,0.28,2,2.28]},stab:{vol:0.025,beats:[3],everyBars:2,note:2,oct:3}},
  home:{bpm:72,beats:4,chords:['F2 A2 C3 E3','G2 B2 D3 F3','E2 G2 B2 D3','A2 C3 E3 G3','F2 A2 C3 E3','G2 B2 D3 F3','C3 E3 G3 B3','C3 E3 G3 B3'],
    pad:0.035,arp:{inst:'ep',pat:[0,1,2,3],step:1,oct:2,vol:0.03},bass:{vol:0.055,beats:[0,2]},
    melody:{inst:'box',notes:mel('r:16 '+MOTIF.split(' ').slice(0,12).join(' '),0),vol:0.04}},
  ending:{bpm:72,beats:4,chords:['C3 E3 G3 B3','A2 C3 E3 G3','F2 A2 C3 E3','G2 B2 D3 F3','C3 E3 G3 B3','A2 C3 E3 G3','F2 A2 C3 E3','C3 E3 G3 C4'],
    pad:0.04,arp:{inst:'ep',pat:[0,2,1,3],step:1,oct:2,vol:0.025},bass:{vol:0.05,beats:[0]},melody:{inst:'box',notes:mel(MOTIF,0),vol:0.07}}
};
const THEME_TRACK={hall:'hall',alley:'rain',roof:'rain',factory:'factory',sewer:'factory',lab:'lab',station:'station',clock:'clock',dark:'dark',home:'home'};

// ---------------------------------------------------------------------------
// Audio object
// ---------------------------------------------------------------------------
const AU={
  ctx:null, master:null, seBus:null, musicBus:null, rev:null, buf:{}, ready:false, cur:null,
  init(){
    try{ const C=root.AudioContext||root.webkitAudioContext; if(!C) return; this.ctx=new C(); }catch(_){ return; }
    const c=this.ctx;
    this.master=c.createGain(); this.master.gain.value=0.9;
    const comp=c.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=3;
    this.master.connect(comp); comp.connect(c.destination);
    this.seBus=c.createGain(); this.seBus.gain.value=1; this.seBus.connect(this.master);
    this.musicBus=c.createGain(); this.musicBus.gain.value=0; this.musicBus.connect(this.master);
    // reverb shared by music
    const len=Math.floor(c.sampleRate*2.6), ir=c.createBuffer(2,len,c.sampleRate);
    for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6); }
    this.rev=c.createConvolver(); this.rev.buffer=ir;
    const wet=c.createGain(); wet.gain.value=0.5; this.rev.connect(wet); wet.connect(this.musicBus);
    this.dry=c.createGain(); this.dry.gain.value=0.8; this.dry.connect(this.musicBus);
    this.renderSE();
    document.addEventListener('visibilitychange',()=>{ if(!this.ctx) return; if(document.hidden) this.ctx.suspend(); else if(this.ready) this.ctx.resume(); });
  },
  async renderSE(){
    const OAC=root.OfflineAudioContext||root.webkitOfflineAudioContext;
    for(const k in SE_DEF){
      const [dur,fn]=SE_DEF[k];
      try{
        if(OAC){
          const sr=44100, oc=new OAC(1,Math.ceil(sr*dur),sr);
          fn(oc,oc.destination);
          this.buf[k]=await oc.startRendering();
        }
      }catch(_){}
    }
  },
  unlock(){
    if(!this.ctx) return;
    try{ this.ctx.resume(); const s=this.ctx.createBufferSource(); s.buffer=this.ctx.createBuffer(1,1,22050); s.connect(this.master); s.start(0); }catch(_){}
    this.ready=true;
  },
  play(name,volMul){
    const c=this.ctx; if(!c) return;
    const v=(SE_VOL[name]||0.8)*(volMul||1);
    if(this.buf[name]){
      try{ const s=c.createBufferSource(); s.buffer=this.buf[name]; const g=c.createGain(); g.gain.value=v; s.connect(g); g.connect(this.seBus); s.start(); }catch(_){}
    }
  },
  // ---- ambience ----
  setRain(level){
    const c=this.ctx; if(!c) return;
    if(!this.rainNode){
      const s=c.createBufferSource(); s.buffer=noiseBuf(c); s.loop=true;
      const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=900;
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=5200;
      const g=c.createGain(); g.gain.value=0;
      s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.master); s.start();
      this.rainNode=g;
    }
    this.rainNode.gain.setTargetAtTime(level*0.03,c.currentTime,0.6);
  },
  whoosh(len,vol,freq){
    const c=this.ctx; if(!c) return;
    const t=c.currentTime;
    noise(c,this.seBus,{t,dur:len,vol:vol||0.08,f0:freq||500,ft:'bandpass',q:0.8,a:len*0.3,curve:'lin'});
  },
  thunder(){ const c=this.ctx; if(!c) return; const t=c.currentTime; noise(c,this.seBus,{t,dur:2.2,vol:0.16,f0:160,f1:60,a:0.05}); },

  // ---- music ----
  music(name){
    name=THEME_TRACK[name]||name;
    if(!this.ctx||!TRACKS[name]) return;
    if(this.cur&&this.cur.name===name) return;
    this.stopMusic(1.2);
    const c=this.ctx, tr=TRACKS[name];
    const spb=60/tr.bpm, barLen=tr.beats;
    const loopBeats=tr.chords.length*barLen;
    const ev=[];
    tr.chords.forEach((ch,bi)=>{
      const f=chord(ch), b0=bi*barLen;
      if(tr.pad) ev.push({b:b0,k:'pad',f:f.slice(0,4),d:barLen,v:tr.pad});
      if(tr.bass) for(const bb of tr.bass.beats) ev.push({b:b0+bb,k:tr.bass.short?'bassS':'bass',f:[f[0]],d:tr.bass.short?0.4:barLen*0.8,v:tr.bass.vol});
      if(tr.arp){ const a=tr.arp; let i=0; for(let bb=a.startBeat||0;bb<barLen-0.001;bb+=a.step){ const n=f[a.pat[i++%a.pat.length]%f.length]*Math.pow(2,a.oct||1); ev.push({b:b0+bb,k:a.inst,f:[n],d:a.step*1.8,v:a.vol}); } }
      if(tr.tick) for(const bb of tr.tick.beats) ev.push({b:b0+bb,k:'tick',v:tr.tick.vol});
      if(tr.heart) for(const bb of tr.heart.beats) ev.push({b:b0+bb,k:'heart',v:tr.heart.vol});
      if(tr.stab && bi%(tr.stab.everyBars||1)===0) for(const bb of tr.stab.beats) ev.push({b:b0+bb,k:'bell',f:[f[Math.min(f.length-1,tr.stab.note||0)]*Math.pow(2,tr.stab.oct||2)],d:2.5,v:tr.stab.vol});
    });
    if(tr.melody) for(const [b,fq,d] of tr.melody.notes){ if(b<loopBeats) ev.push({b,k:tr.melody.inst,f:[fq],d:Math.max(d*1.4,1.2),v:tr.melody.vol}); }
    ev.sort((a,b)=>a.b-b.b);
    const bus=c.createGain(); bus.gain.value=0.0001; bus.connect(this.dry); bus.connect(this.rev);
    bus.gain.setTargetAtTime(1,c.currentTime,0.8);
    this.musicBus.gain.setTargetAtTime(0.55,c.currentTime,0.3);
    const st={name,ev,spb,loopBeats,start:c.currentTime+0.15,loop:0,i:0,bus};
    st.timer=setInterval(()=>this.sched(st),60);
    this.cur=st;
    this.sched(st);
  },
  stopMusic(fade){
    const st=this.cur; if(!st) return;
    this.cur=null;
    clearInterval(st.timer);
    const c=this.ctx;
    st.bus.gain.cancelScheduledValues(c.currentTime);
    st.bus.gain.setTargetAtTime(0.0001,c.currentTime,(fade||1)/3);
    setTimeout(()=>{ try{ st.bus.disconnect(); }catch(_){} },(fade||1)*1000+2500);
  },
  sched(st){
    const c=this.ctx; if(!c||c.state!=='running') return;
    const horizon=c.currentTime+0.3;
    for(let guard=0;guard<200;guard++){
      if(st.i>=st.ev.length){ st.i=0; st.loop++; }
      const e=st.ev[st.i];
      const t=st.start+(st.loop*st.loopBeats+e.b)*st.spb;
      if(t>horizon) break;
      if(t>=c.currentTime-0.05) this.voice(e,Math.max(t,c.currentTime),st);
      st.i++;
    }
  },
  voice(e,t,st){
    const c=this.ctx, d=st.bus, dur=(e.d||1)*st.spb;
    switch(e.k){
      case 'pad':
        for(const f of e.f) for(const dt of [-7,7]){
          const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=f; o.detune.value=dt;
          const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=900;
          const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(e.v*0.5,t+Math.min(1.2,dur*0.4)); g.gain.setValueAtTime(e.v*0.5,t+dur*0.8); g.gain.linearRampToValueAtTime(0.0001,t+dur+0.9);
          o.connect(lp); lp.connect(g); g.connect(d); o.start(t); o.stop(t+dur+1);
        }
        break;
      case 'ep': { // soft electric piano (2-op FM)
        const f=e.f[0]; const car=c.createOscillator(); car.frequency.value=f;
        const mod=c.createOscillator(); mod.frequency.value=f*2; const mg=c.createGain();
        mg.gain.setValueAtTime(f*1.2,t); mg.gain.exponentialRampToValueAtTime(f*0.05,t+0.6);
        mod.connect(mg); mg.connect(car.frequency);
        const g=c.createGain(); env(g,t,0.006,e.v,Math.max(0.5,dur));
        car.connect(g); g.connect(d); car.start(t); mod.start(t); car.stop(t+dur+0.1); mod.stop(t+dur+0.1);
        break; }
      case 'box': bell(c,d,e.f[0],t,Math.max(1,dur),e.v); break;
      case 'bell': bell(c,d,e.f[0],t,dur,e.v); break;
      case 'pluck': tone(c,d,{type:'triangle',f0:e.f[0],t,dur:0.35,vol:e.v,lp:2400}); break;
      case 'bass': tone(c,d,{f0:e.f[0]/2,t,dur:Math.max(0.4,dur),vol:e.v,a:0.02}); tone(c,d,{type:'triangle',f0:e.f[0],t,dur:0.5,vol:e.v*0.3}); break;
      case 'bassS': tone(c,d,{type:'triangle',f0:e.f[0],t,dur:0.18,vol:e.v,lp:500}); break;
      case 'tick': noise(c,d,{t,dur:0.04,vol:e.v,f0:7000,ft:'highpass'}); break;
      case 'heart': tone(c,d,{f0:58,f1:40,t,dur:0.22,vol:e.v}); break;
    }
  },
  // Ending: the leitmotif on a music box, once through, then it keeps breathing.
  musicBox(){ this.music('ending'); }
};
root.NEKO_AUDIO=AU;
})(window);
