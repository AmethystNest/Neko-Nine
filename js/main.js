// Neko Nine: game flow, input, audio, story, game over and ending.
(function(){
'use strict';
const E=window.NEKO_ENGINE, R=window.NEKO_RENDER, A=window.NEKO_ASSETS;
const {PROLOGUE,STAGES}=window.NEKO_STORY;
const $=id=>document.getElementById(id);

// Game over sends you back to the start of the stage you reached (9 lives restored).
// Set to true to restore the old "back to Stage 1" rule.
const RESTART_FROM_STAGE1=false;
const LIVES=9;
const SAVE_KEY='nekonine.save.v2';

const DEATH_QUOTES=["猫なのでセーフ。","生存には失敗しました。","命、落としました。","来世に任せた。","命ガチャ、次いきます。","新品の命ください。","一命で攻略情報を購入しました。","今のノーカンにならない？","まだ在庫ある。","思ったより命って減るな。","九つある前提で殺しにきてない？","猫じゃなかったら終わってた。","これ九回じゃ足りなくない？","命の使い方、これで合ってる？","残機って言うな。命だぞ。","このゲーム、猫に厳しくない？","仕様です。","これは演出です。","命、返品できます？","さっきまで生きてた。","今のは事故。","次はたぶん大丈夫。","セーブしたっけ？","リスポーン前提です。","転生。ヨシ。"];
const LAST_LIFE_QUOTES=["あと、ひとつ。","これが最後の命。","……まだ、終われない。"];
const RETRY_QUOTES=[
  "ぼくには九つある。\nそれでも君のひとつのほうが、ずっと大切だよ。",
  "うまく生きられなくてもいい。\n今日まで来たことは、なくならないから。",
  "立ち止まってもいいよ。\n生きていれば、続きはいつか選べるから。",
  "何もできない日だって、君の一日だよ。",
  "答えが見つからなくても、君までいなくなる必要はないよ。",
  "明日を好きになれなくてもいい。\n今日を終えた君は、それだけで十分だよ。",
  "遠回りでもいい。\n君の人生に、決められた攻略法なんてないから。",
  "何度つまずいたっていい。\n君まで失敗になったわけじゃない。",
  "先が見えないなら、今日はここまででもいい。\nまた歩ける日に続きをしよう。",
  "この先に何があるか、もう少しだけ一緒に見にいかない？",
  "ぼくの続きを見届けなくてもいい。\nでも、君の続きは見てほしいな。",
  "クリアできなくてもいいよ。\n君が明日もいてくれたら、ぼくはうれしい。"
];
function bag(list){ let b=[]; return ()=>{ if(!b.length){ b=list.slice(); for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } } return b.pop(); }; }
const nextDeathQuote=bag(DEATH_QUOTES), nextRetryQuote=bag(RETRY_QUOTES);
const KANA_NUM=['ひとつ','ふたつ','みっつ','よっつ','いつつ','むっつ','ななつ','やっつ','ここのつ'];

// ---------------------------------------------------------------------------
// Save data
// ---------------------------------------------------------------------------
function loadSave(){ try{ return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')||{}; }catch(_){ return {}; } }
function writeSave(o){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(Object.assign(loadSave(),o))); }catch(_){} }

// ---------------------------------------------------------------------------
// Audio: WebAudio bank decoded from the original SE, HTMLAudio fallback.
// ---------------------------------------------------------------------------
const AU={
  ctx:null, master:null, buf:{}, html:{}, ready:false,
  init(){
    try{ const C=window.AudioContext||window.webkitAudioContext; if(C){ this.ctx=new C(); this.master=this.ctx.createGain(); this.master.gain.value=1; this.master.connect(this.ctx.destination); } }catch(_){ this.ctx=null; }
    for(const k in A.se){
      if(this.ctx){
        try{
          const b64=A.se[k].split(',')[1], bin=atob(b64), u=new Uint8Array(bin.length);
          for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
          const p=this.ctx.decodeAudioData(u.buffer,b=>{ this.buf[k]=b; },()=>{});
          if(p&&p.catch) p.catch(()=>{});
        }catch(_){}
      }
    }
  },
  unlock(){
    if(this.ctx){ try{ this.ctx.resume(); const s=this.ctx.createBufferSource(); s.buffer=this.ctx.createBuffer(1,1,22050); s.connect(this.master); s.start(0); }catch(_){} }
    this.ready=true;
  },
  play(name,volMul){
    const v=(A.seVolume[name]||0.1)*(volMul||1);
    if(this.ctx && this.buf[name]){
      try{ const s=this.ctx.createBufferSource(); s.buffer=this.buf[name]; const g=this.ctx.createGain(); g.gain.value=v; s.connect(g); g.connect(this.master); s.start(); }catch(_){}
      return;
    }
    try{ let a=this.html[name]; if(!a){ a=this.html[name]=new Audio(A.se[name]); } a.volume=Math.min(1,v); a.currentTime=0; const p=a.play(); if(p&&p.catch) p.catch(()=>{}); }catch(_){}
  },
  noiseBuf(){
    if(this._noise) return this._noise;
    const c=this.ctx, n=c.sampleRate*2, b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
    let last=0; for(let i=0;i<n;i++){ const w=Math.random()*2-1; last=(last+0.02*w)/1.02; d[i]=w*0.5+last*2; }
    return this._noise=b;
  },
  setRain(level){
    if(!this.ctx) return;
    const c=this.ctx;
    if(!this.rainNode){
      const s=c.createBufferSource(); s.buffer=this.noiseBuf(); s.loop=true;
      const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=900;
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=6000;
      const g=c.createGain(); g.gain.value=0;
      s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.master); s.start();
      this.rainNode=g;
    }
    this.rainNode.gain.setTargetAtTime(level*0.035,c.currentTime,0.6);
  },
  whoosh(len,vol,freq){
    if(!this.ctx) return;
    const c=this.ctx, s=c.createBufferSource(); s.buffer=this.noiseBuf();
    const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq||500; f.Q.value=0.8;
    const g=c.createGain(); const t=c.currentTime;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol||0.08,t+len*0.3); g.gain.linearRampToValueAtTime(0,t+len);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t,Math.random()); s.stop(t+len+0.05);
  },
  thunder(){ this.whoosh(1.8,0.12,120); },
  // A small music box for the ending (original melody).
  musicBox(){
    if(!this.ctx) return;
    const c=this.ctx, t0=c.currentTime+0.3;
    const N={C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,B4:493.9,C5:523.3,D5:587.3,E5:659.3,F5:698.5,G5:784,A5:880};
    const mel=[
      ['E5',1],['G5',1],['C5',2],['D5',1],['E5',1],['D5',2],
      ['C5',1],['A4',1],['G4',2],['A4',1],['C5',1],['D5',2],
      ['E5',1],['G5',1],['A5',2],['G5',1],['E5',1],['D5',2],
      ['C5',1],['D5',1],['E5',1],['D5',1],['C5',4],
      ['E5',1],['G5',1],['C5',2],['D5',1],['E5',1],['G5',2],
      ['A5',1],['G5',1],['E5',2],['D5',1],['E5',1],['C5',4]
    ];
    const bass=['C4','A4','F4','G4','C4','A4','F4','C4','C4','A4','F4','G4','F4','G4','C4','C4'];
    const beat=0.42;
    const rev=c.createConvolver();
    const len=c.sampleRate*2.2, ir=c.createBuffer(2,len,c.sampleRate);
    for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3); }
    rev.buffer=ir;
    const wet=c.createGain(); wet.gain.value=0.35; rev.connect(wet); wet.connect(this.master);
    const out=c.createGain(); out.gain.value=0.9; out.connect(this.master); out.connect(rev);
    const note=(f,t,dur,vol)=>{
      for(const [mul,type,v] of [[1,'sine',1],[2,'sine',0.25],[3,'triangle',0.08]]){
        const o=c.createOscillator(); o.type=type; o.frequency.value=f*mul;
        const g=c.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol*v,t+0.008); g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
        o.connect(g); g.connect(out); o.start(t); o.stop(t+dur+0.05);
      }
    };
    let t=t0;
    for(let rep=0;rep<2;rep++){
      for(const [n,b] of mel){ note(N[n],t,Math.max(1.2,b*beat*1.8),0.07); t+=b*beat; }
    }
    let tb=t0;
    for(let rep=0;rep<2;rep++) for(const n of bass){ note(N[n]/2,tb,2.2,0.035); tb+=beat*4*mel.reduce((a,m)=>a+m[1],0)/4/bass.length; }
    this.musicEnd=t;
  }
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const S={
  mode:'boot', stage:0, lives:LIVES, deaths:0, world:null,
  ui:{deathQuote:'',snapCam:true,lastLife:false,thunder:()=>AU.thunder()},
  respawnAt:0, clearAt:0, playTime:0
};
const input={left:false,right:false,jump:false,press:false};
let imgs=null;

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------
function updateLifeUI(lost){
  const cats=$('lifeCats'), hud=$('lifeHud');
  cats.replaceChildren();
  for(let i=0;i<S.lives+(lost?1:0);i++){
    const img=document.createElement('img'); img.className='lifeCat'; img.alt=''; img.draggable=false; img.src=A.sprites.idle;
    if(lost && i===S.lives) img.classList.add('lost');
    cats.appendChild(img);
  }
  hud.setAttribute('aria-label','残機 '+S.lives);
  hud.classList.toggle('last',S.lives===1);
  S.ui.lastLife=S.lives===1;
}
function setHud(on){ document.body.classList.toggle('nohud',!on); }

// ---------------------------------------------------------------------------
// Story overlay
// ---------------------------------------------------------------------------
let storyDone=null, storyTimers=[], storyStage=0;
function clearStoryTimers(){ storyTimers.forEach(clearTimeout); storyTimers=[]; }
function showStory(lines,card,then){
  const el=$('story');
  clearStoryTimers();
  el.replaceChildren();
  const box=document.createElement('div');
  el.appendChild(box);
  const skip=document.createElement('div'); skip.className='skip'; skip.textContent='TAP ▶'; el.appendChild(skip);
  el.classList.add('show');
  storyStage=0;
  const nodes=lines.map(t=>{ const d=document.createElement('div'); d.className='line'; d.textContent=t; box.appendChild(d); return d; });
  let i=0;
  const showNext=()=>{ if(i<nodes.length){ nodes[i++].classList.add('on'); storyTimers.push(setTimeout(showNext,1500)); } else storyTimers.push(setTimeout(toCard,2200)); };
  const toCard=()=>{
    clearStoryTimers();
    storyStage=1;
    if(!card){ finish(); return; }
    box.style.transition='opacity .5s'; box.style.opacity='0';
    storyTimers.push(setTimeout(()=>{
      box.replaceChildren(); box.style.opacity='1';
      const c=document.createElement('div'); c.className='card';
      c.innerHTML='<div class="no"></div><div class="rule"></div><div class="nm line"></div>';
      c.querySelector('.no').textContent=card.no; c.querySelector('.nm').textContent=card.name;
      box.appendChild(c);
      requestAnimationFrame(()=>c.querySelector('.nm').classList.add('on'));
      storyTimers.push(setTimeout(finish,1700));
    },500));
  };
  const finish=()=>{ clearStoryTimers(); storyDone=null; el.classList.remove('show'); then&&then(); };
  storyDone=()=>{ if(storyStage===0){ nodes.forEach(n=>n.classList.add('on')); i=nodes.length; toCard(); } else finish(); };
  if(nodes.length) storyTimers.push(setTimeout(showNext,500)); else toCard();
}
$('story').addEventListener('pointerdown',e=>{ e.preventDefault(); if(storyDone) storyDone(); });

// ---------------------------------------------------------------------------
// Stage flow
// ---------------------------------------------------------------------------
function enterStage(i,withStory){
  S.mode='story';
  setHud(false);
  AU.setRain(0);
  const def=STAGES[i];
  const go=()=>startStage(i);
  const card={no:'STAGE '+(i+1),name:def.name};
  if(withStory==='prologue') showStory(PROLOGUE,null,()=>setTimeout(()=>showStory(def.story,card,go),700));
  else if(withStory) showStory(def.story,card,go);
  else showStory([],card,go);
}
function startStage(i){
  S.stage=i;
  S.world=new E.World(STAGES[i]);
  R.ghosts=[]; R.parts=[];
  S.ui.snapCam=true; S.ui.deathQuote=''; input.press=false;
  $('msg').textContent='STAGE '+(i+1);
  updateLifeUI();
  setHud(true);
  AU.setRain(STAGES[i].rain||0);
  writeSave({stage:i,deaths:S.deaths});
  S.mode='play';
}
function onDeath(ev){
  S.lives=Math.max(0,S.lives-1);
  S.deaths++;
  writeSave({deaths:S.deaths});
  updateLifeUI(true);
  if(S.lives<=0){
    S.ui.deathQuote='';
    S.mode='dying';
    setTimeout(showGameOver,900);
  }else{
    S.ui.deathQuote=S.lives===1?LAST_LIFE_QUOTES[Math.floor(Math.random()*LAST_LIFE_QUOTES.length)]:nextDeathQuote();
    S.respawnAt=performance.now()+1050;
  }
}
function respawn(){
  S.world.reset();
  S.ui.deathQuote='';
}
function onClear(){
  S.clearAt=performance.now()+1700;
}

// ---------------------------------------------------------------------------
// Game over (v148 presentation, now continuing from the reached stage)
// ---------------------------------------------------------------------------
let goTimers=[];
function showGameOver(){
  S.mode='gameover';
  setHud(false);
  AU.setRain(0);
  AU.play('gameover');
  const over=$('gameOverScreen'), quote=over.querySelector('.gameOverQuote'), icons=[...over.querySelectorAll('.gameOverLives img')];
  goTimers.forEach(clearTimeout); goTimers=[];
  quote.textContent='';
  icons.forEach(el=>{ el.src=A.sprites.idle; el.classList.remove('vanish'); });
  over.querySelector('.retryNote').textContent=RESTART_FROM_STAGE1?'STAGE 1 から':'STAGE '+(S.stage+1)+' から';
  over.classList.remove('retryMoment');
  over.classList.add('show','lifeCount'); over.setAttribute('aria-hidden','false');
  $('retryBtn').disabled=false;
  const settle=300, step=260;
  icons.forEach((el,i)=>goTimers.push(setTimeout(()=>{ el.classList.add('vanish'); AU.play('life'); },settle+i*step)));
  goTimers.push(setTimeout(()=>{
    over.classList.remove('lifeCount');
    const text=quote.dataset.text||''; let i=0;
    goTimers.push(setTimeout(function type(){ i++; quote.textContent=text.slice(0,i); if(i<text.length) goTimers.push(setTimeout(type,95)); },360));
  },settle+icons.length*step+420));
}
$('retryBtn').addEventListener('pointerdown',e=>e.stopPropagation(),true);
$('retryBtn').addEventListener('click',e=>{
  e.preventDefault(); e.stopPropagation();
  const btn=$('retryBtn'); if(btn.disabled) return; btn.disabled=true;
  AU.play('retry');
  const over=$('gameOverScreen'), msg=$('retryMessage');
  msg.querySelector('.first').innerHTML=nextRetryQuote().split('\n').map(l=>l.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))).join('<br>');
  over.classList.add('retryMoment'); msg.classList.add('show'); msg.setAttribute('aria-hidden','false');
  goTimers.push(setTimeout(()=>{
    over.classList.remove('show','lifeCount','retryMoment'); over.setAttribute('aria-hidden','true');
    msg.classList.remove('show'); msg.setAttribute('aria-hidden','true');
    S.lives=LIVES;
    enterStage(RESTART_FROM_STAGE1?0:S.stage,false);
  },3900));
});

// ---------------------------------------------------------------------------
// Ending
// ---------------------------------------------------------------------------
const END={t:0,catX:110,catWalking:true,door:0,light:0,lookUp:0,rainStop:0,fade:1,lines:[],idx:-1,lineAt:0,phase:'enter'};
function startEnding(){
  S.mode='ending';
  setHud(false);
  AU.setRain(0.6);
  writeSave({cleared:true,stage:0,deaths:0});
  Object.assign(END,{t:0,catX:40,catWalking:true,door:0,light:0,lookUp:0,rainStop:0,fade:1,idx:-1,lineAt:0,phase:'enter'});
  const d=S.deaths, left=Math.max(1,S.lives);
  END.lines=[
    ['you','……ナイン？',()=>END.lookUp=1],
    ['you','どこに行ってたの。……ずっと、探してたんだよ。'],
    ['cat','ぼくも、君を探してた。'],
    ['cat',d>0?`ここに来るまでに、ぼくは ${d} 回死んだ。`:'ここに来るまで、ぼくは一度も死ななかった。'],
    ['cat',d>0?'そのたびに君が「もう一回」って、ぼくを立たせてくれた。':'君がずっと、ぼくを前へ進ませてくれた。'],
    ['cat','だから今度は、ぼくが言う番。'],
    ['cat','君の命は、ひとつだけ。'],
    ['cat','うまく生きられない日があっても、'],
    ['cat','そのひとつを、どうか手放さないで。'],
    ['cat',`残った${KANA_NUM[left-1]}の命は、ぜんぶ君のそばで使うよ。`],
    ['you','……おかえり、ナイン。',()=>{ END.lightOn=true; }],
    ['cat','ただいま。']
  ];
  AU.play('door');
  AU.musicBox();
}
function endingStep(dt){
  const e=END; e.t+=dt;
  e.fade=Math.max(0,e.fade-dt*0.7);
  if(e.phase==='enter'){
    e.door=Math.min(1,e.t/1.0);
    if(e.t>1.1){ e.catX+=dt*110; }
    if(e.catX>=482){ e.catX=482; e.catWalking=false; e.phase='talk'; e.lineAt=e.t+1.0; }
  }
  if(e.lightOn){ e.light=Math.min(1,e.light+dt*0.35); e.rainStop=Math.min(1,e.rainStop+dt*0.3); AU.setRain(0.6*(1-e.rainStop)); }
  if(e.phase==='talk' && e.t>=e.lineAt) advanceLine();
  if(e.phase==='outro' && e.t>=e.lineAt){ e.phase='credits'; showCredits(); }
}
function advanceLine(){
  const e=END, el=$('endingText');
  if(e.idx>=0){ el.classList.remove('on'); }
  e.idx++;
  if(e.idx>=e.lines.length){ e.phase='outro'; e.lineAt=e.t+3.2; return; }
  const [who,text,fx]=e.lines[e.idx];
  setTimeout(()=>{ el.textContent=text; el.className=who==='you'?'you on':'on'; },e.idx?450:0);
  if(fx) fx();
  e.lineAt=e.t+Math.max(2.8,1.4+text.length*0.12);
}
function showCredits(){
  $('endingText').className='';
  const c=$('credits'); const lv=c.querySelector('.lives'); lv.replaceChildren();
  for(let i=0;i<LIVES;i++){ const im=document.createElement('img'); im.src=A.sprites.idle; if(i>=S.lives) im.classList.add('used'); lv.appendChild(im); }
  const m=Math.floor(S.playTime/60), s=Math.floor(S.playTime%60);
  c.querySelector('.stats').innerHTML=`死んだ回数　${S.deaths}<br>残った命　${S.lives} / ${LIVES}<br>プレイ時間　${m}:${String(s).padStart(2,'0')}`;
  c.classList.add('show');
  S.mode='credits';
  AU.setRain(0);
}
$('credits').addEventListener('pointerdown',e=>{ if(S.mode!=='credits') return; e.preventDefault(); $('credits').classList.remove('show'); toTitle(); });
// Tap to advance the ending dialogue.
document.addEventListener('pointerdown',()=>{ if(S.mode==='ending' && END.phase==='talk' && END.idx>=0) END.lineAt=Math.min(END.lineAt,END.t+0.05); });

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------
function toTitle(){
  S.mode='title';
  setHud(false);
  const t=$('titleScreen');
  const sv=loadSave();
  t.classList.toggle('hasSave',sv.stage>0);
  t.classList.toggle('cleared',!!sv.cleared);
  $('btnContinue').textContent=`つづきから  STAGE ${ (sv.stage||0)+1 }`;
  t.style.display=''; requestAnimationFrame(()=>t.classList.remove('hide'));
}
function beginGame(fromStage){
  const sv=loadSave();
  S.lives=LIVES;
  S.deaths=fromStage>0?(sv.deaths||0):0;
  S.playTime=0;
  const t=$('titleScreen'); t.classList.add('hide'); setTimeout(()=>{ if(t.classList.contains('hide')) t.style.display='none'; },700);
  enterStage(fromStage,fromStage===0?'prologue':true);
}
function requestFs(){
  document.documentElement.classList.add('fullscreen-fallback');
  try{ const r=document.documentElement; if(r.requestFullscreen&&!document.fullscreenElement){ const p=r.requestFullscreen({navigationUI:'hide'}); if(p&&p.catch)p.catch(()=>{}); } else if(r.webkitRequestFullscreen&&!document.webkitFullscreenElement) r.webkitRequestFullscreen(); }catch(_){}
  try{ if(screen.orientation&&screen.orientation.lock){ const p=screen.orientation.lock('landscape'); if(p&&p.catch)p.catch(()=>{}); } }catch(_){}
}
function titleTap(e,fromStage){
  if(S.mode!=='title') return;
  e.preventDefault(); e.stopPropagation();
  AU.unlock(); AU.play('start');
  requestFs();
  beginGame(fromStage);
}
$('titleScreen').addEventListener('pointerup',e=>{ if($('titleScreen').classList.contains('hasSave')) return; titleTap(e,0); });
$('btnContinue').addEventListener('pointerup',e=>titleTap(e,loadSave().stage||0));
$('btnNew').addEventListener('pointerup',e=>{ writeSave({stage:0,deaths:0}); titleTap(e,0); });

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
function bindHold(id,key){
  const b=$(id);
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); AU.unlock(); input[key]=true; if(key==='jump') input.press=true; b.classList.add('active'); try{ b.setPointerCapture(e.pointerId); }catch(_){} });
  const up=e=>{ e.preventDefault(); input[key]=false; b.classList.remove('active'); };
  b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); b.addEventListener('lostpointercapture',up);
}
bindHold('left','left'); bindHold('right','right'); bindHold('jump','jump');
addEventListener('keydown',e=>{
  if(e.repeat && (e.code==='Space'||e.key==='ArrowUp')) { e.preventDefault(); return; }
  if(e.key==='ArrowLeft'||e.key==='a') input.left=true;
  if(e.key==='ArrowRight'||e.key==='d') input.right=true;
  if(e.code==='Space'||e.key==='ArrowUp'||e.key==='w'||e.key==='z'){ if(!input.jump) input.press=true; input.jump=true; e.preventDefault(); }
  if(e.key==='Enter'||e.code==='Space'){
    if(S.mode==='title'){ const sv=loadSave(); AU.unlock(); AU.play('start'); beginGame(sv.stage>0?sv.stage:0); }
    else if(S.mode==='story'&&storyDone) storyDone();
    else if(S.mode==='credits'){ $('credits').classList.remove('show'); toTitle(); }
  }
});
addEventListener('keyup',e=>{
  if(e.key==='ArrowLeft'||e.key==='a') input.left=false;
  if(e.key==='ArrowRight'||e.key==='d') input.right=false;
  if(e.code==='Space'||e.key==='ArrowUp'||e.key==='w'||e.key==='z') input.jump=false;
});
addEventListener('blur',()=>{ input.left=input.right=input.jump=false; });

// ---------------------------------------------------------------------------
// Main loop (fixed 120 Hz simulation)
// ---------------------------------------------------------------------------
const DT=1/120;
let acc=0, last=performance.now();
function loop(now){
  const dt=Math.min(0.05,(now-last)/1000); last=now;
  const w=S.world;
  if(S.mode==='play'||S.mode==='dying'){
    S.playTime+=dt;
    acc+=dt;
    while(acc>=DT){
      acc-=DT;
      w.step(DT,input);
      for(const ev of w.events){
        if(ev.type==='se') AU.play(ev.name);
        else if(ev.type==='death') onDeath(ev);
        else if(ev.type==='clear') onClear();
        else if(ev.type==='gust') AU.whoosh(1.2,0.07,380);
        else if(ev.type==='whoosh') AU.whoosh(0.35,0.035,900);
        R.onEvent(ev,w);
      }
      w.events.length=0;
    }
    if(S.respawnAt && now>=S.respawnAt){ S.respawnAt=0; respawn(); }
    if(S.clearAt && now>=S.clearAt){
      S.clearAt=0;
      if(STAGES[S.stage].final) startEnding();
      else enterStage(S.stage+1,true);
    }
  }
  try{
    if(w && (S.mode==='play'||S.mode==='dying'||S.mode==='story'||S.mode==='gameover')){
      R.frame(w,S.ui,dt);
      R.overlay(w,S.ui,now);
    }
    if(S.mode==='ending'||S.mode==='credits'){
      endingStep(dt);
      R.ending(END,dt);
    }
  }catch(err){ if(!loop.warned){ loop.warned=true; console.error(err); } }
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------------------
// Fullscreen button (v103+ behaviour kept)
// ---------------------------------------------------------------------------
(function(){
  const btn=$('fullscreenBtn');
  const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  const upd=()=>{ btn.textContent=isFs()?'×':'⛶'; btn.setAttribute('aria-label',isFs()?'フルスクリーン終了':'フルスクリーン'); };
  btn.addEventListener('pointerdown',e=>e.stopPropagation(),true);
  btn.addEventListener('click',async e=>{
    e.preventDefault(); e.stopPropagation();
    if(isFs()){ try{ if(document.exitFullscreen) await document.exitFullscreen(); else if(document.webkitExitFullscreen) document.webkitExitFullscreen(); }catch(_){} try{ screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock(); }catch(_){} }
    else requestFs();
    upd();
  },true);
  document.addEventListener('fullscreenchange',upd); document.addEventListener('webkitfullscreenchange',upd);
  const refresh=()=>{ document.documentElement.style.setProperty('--app-vh',innerHeight+'px'); window.scrollTo(0,0); R.cv&&R.resize(); };
  addEventListener('resize',refresh,{passive:true});
  addEventListener('orientationchange',()=>{ setTimeout(refresh,120); setTimeout(refresh,420); },{passive:true});
  if(window.visualViewport) visualViewport.addEventListener('resize',refresh,{passive:true});
})();

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
const load=src=>new Promise(res=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>res(im); im.src=src; });
(async()=>{
  $('titleCat').src=A.sprites.idle;
  AU.init();
  imgs={
    idle:await load(A.sprites.idle),
    walk:await Promise.all(A.sprites.walk.map(load)),
    jump:{rise:await load(A.sprites.jump.rise),apex:await load(A.sprites.jump.apex),fall:await load(A.sprites.jump.fall),land:await load(A.sprites.jump.land)}
  };
  R.init($('game'),imgs);
  toTitle();
  // Debug / test hook: ?stage=N starts directly at stage N.
  const q=new URLSearchParams(location.search);
  if(q.has('stage')){ const n=Math.max(1,Math.min(STAGES.length,+q.get('stage')||1))-1; $('titleScreen').classList.add('hide'); $('titleScreen').style.display='none'; startStage(n); }
  if(q.has('ending')){ $('titleScreen').classList.add('hide'); $('titleScreen').style.display='none'; S.deaths=+q.get('ending')||37; S.lives=3; startEnding(); }
  window.__neko={S,input,R,END,startStage,startEnding};
  requestAnimationFrame(loop);
})();
})();
