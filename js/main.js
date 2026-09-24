// Neko Nine: game flow, input, audio, story, game over and ending.
(function(){
'use strict';
const E=window.NEKO_ENGINE, R=window.NEKO_RENDER;
const {PROLOGUE,STAGES}=window.NEKO_STORY;
const $=id=>document.getElementById(id);

// Game over sends you back to the start of the stage you reached (9 lives restored).
// Set to true to restore the old "back to Stage 1" rule.
const RESTART_FROM_STAGE1=false;
const LIVES=9;
const SAVE_KEY='nekonine.save.v2';

// Said by Nine right after losing a life. Light-hearted on purpose: the game is cruel, the cat is not.
const DEATH_QUOTES=[
  "猫なのでセーフ。","命、ひとつ落としました。","来世のぼく、あとはよろしく。","今のは練習。",
  "九つあるって、そういう意味じゃない。","ぼくは悪くない。床が悪い。","知ってた。知らなかったけど。",
  "次は、ちゃんと見る。","しっぽが引っかかった気がする。","にゃ。","痛くはない。ちょっとしか。",
  "それは、ずるくない？","覚えた。たぶん。","今のノーカンにならない？","命、返品できます？",
  "さっきまで生きてた。","猫じゃなかったら終わってた。","残機って言うな。命だぞ。",
  "思ったより、命って減る。","毛づくろいしてから、もう一回。","ぼくのせいじゃない。……たぶん。",
  "まっすぐ進むだけが、道じゃなかった。","見なかったことにして。"
];
// Lines tied to how many lives are left (after this death).
const COUNT_QUOTES={
  8:["ひとつめ。まだ平気。"],
  6:["もう三つ。数えるのはやめよう。"],
  4:["半分より、少なくなった。"],
  3:["あと三つ。……急がなきゃ。"],
  2:["あと、ふたつ。"],
  1:["あと、ひとつ。","これが最後の命。","……まだ、終われない。"]
};
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
  "クリアできなくてもいいよ。\n君が明日もいてくれたら、ぼくはうれしい。",
  "九つ使い切っても、ぼくはまた歩けるよ。\n君が「もう一回」って言ってくれるなら。",
  "転んだ場所は、ちゃんと覚えてる。\nだから次は、少しだけ遠くまで行ける。",
  "急がなくていい。\nぼくはここで、待っていられるから。"
];
function bag(list){ let b=[]; return ()=>{ if(!b.length){ b=list.slice(); for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } } return b.pop(); }; }
const nextDeathQuote=bag(DEATH_QUOTES), nextRetryQuote=bag(RETRY_QUOTES);
function deathQuoteFor(lives){
  const c=COUNT_QUOTES[lives];
  if(c && (lives<=3 || Math.random()<0.6)) return c[Math.floor(Math.random()*c.length)];
  return nextDeathQuote();
}
const KANA_NUM=['ひとつ','ふたつ','みっつ','よっつ','いつつ','むっつ','ななつ','やっつ','ここのつ'];

// ---------------------------------------------------------------------------
// Save data
// ---------------------------------------------------------------------------
function loadSave(){ try{ return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')||{}; }catch(_){ return {}; } }
function writeSave(o){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(Object.assign(loadSave(),o))); }catch(_){} }

// ---------------------------------------------------------------------------
// Audio: WebAudio bank decoded from the original SE, HTMLAudio fallback.
// ---------------------------------------------------------------------------
const AU=window.NEKO_AUDIO;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const S={
  mode:'boot', stage:0, lives:LIVES, deaths:0, world:null,
  ui:{deathQuote:'',snapCam:true,lastLife:false,thunder:()=>AU.thunder()},
  respawnAt:0, clearAt:0, playTime:0
};
const input={left:false,right:false,jump:false,press:false};
let imgs=null, ICON='';

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------
function updateLifeUI(lost){
  const cats=$('lifeCats'), hud=$('lifeHud');
  cats.replaceChildren();
  for(let i=0;i<S.lives+(lost?1:0);i++){
    const img=document.createElement('img'); img.className='lifeCat'; img.alt=''; img.draggable=false; img.src=ICON;
    if(lost && i===S.lives){ img.classList.add('lost'); img.addEventListener('animationend',()=>img.remove(),{once:true}); }
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
  const go=()=>startStage(i,!!withStory);
  const card={no:'STAGE '+(i+1),name:def.name};
  if(withStory==='prologue') showStory(PROLOGUE,null,()=>setTimeout(()=>showStory(def.story,card,go),700));
  else if(withStory) showStory(def.story,card,go);
  else showStory([],card,go);
}
// Mercy (only after a game over in this stage): a checkpoint appears, and traps
// that killed you twice start showing a faint outline before they trigger.
const HINT_AFTER=2;
const M={deaths:0,known:new Map(),cpOn:false,cpReached:false};
function spawnOpts(){
  const cp=STAGES[S.stage].checkpoint;
  return (M.cpReached&&cp)?{spawn:{x:cp.x,y:cp.y===undefined?E.G:cp.y}}:undefined;
}
function syncMercyUI(){
  const cp=STAGES[S.stage].checkpoint;
  S.ui.cp=M.cpOn&&cp?{x:cp.x,y:cp.y===undefined?E.G:cp.y,reached:M.cpReached}:null;
  const k=new Set(); for(const [i,n] of M.known) if(n>=HINT_AFTER) k.add(i);
  S.ui.known=k;
}
function startStage(i,fresh){
  if(fresh!==false && (fresh || S.stage!==i)){ M.deaths=0; M.known=new Map(); M.cpOn=false; M.cpReached=false; }
  S.stage=i;
  S.world=new E.World(STAGES[i],spawnOpts());
  R.ghosts=[]; R.parts=[];
  S.ui.snapCam=true; S.ui.deathQuote=''; input.press=false;
  $('msg').textContent='STAGE '+(i+1);
  updateLifeUI();
  setHud(true);
  syncMercyUI();
  AU.setRain(STAGES[i].rain||0);
  AU.music(STAGES[i].music||STAGES[i].theme);
  writeSave({stage:i,deaths:S.deaths});
  S.mode='play';
}
function onDeath(ev){
  S.lives=Math.max(0,S.lives-1);
  S.deaths++;
  M.deaths++;
  if(ev.killer>=0) M.known.set(ev.killer,(M.known.get(ev.killer)||0)+1);
  syncMercyUI();
  writeSave({deaths:S.deaths});
  updateLifeUI(true);
  if(S.lives<=0){
    S.ui.deathQuote='';
    S.mode='dying';
    setTimeout(showGameOver,900);
  }else{
    S.ui.deathQuote=deathQuoteFor(S.lives);
    S.respawnAt=performance.now()+1050;
  }
}
function respawn(){
  S.world=new E.World(STAGES[S.stage],spawnOpts());
  AU.play('meow',0.45);
  S.ui.deathQuote='';
  S.ui.snapCam=!!M.cpReached;
  input.press=false;
}
function checkMercy(){
  const cp=S.ui.cp, P=S.world.P;
  if(cp && !cp.reached && !P.dead && P.ground && P.x>=cp.x-6){
    M.cpReached=true; syncMercyUI();
    AU.play('checkpoint');
    R.onEvent({type:'checkpoint',x:cp.x,y:cp.y},S.world);
    toast('ここから、また歩ける。');
  }
}
let toastT=0;
function toast(text){
  const el=$('toast'); el.textContent=text; el.classList.add('on');
  clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('on'),2600);
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
  AU.play('gameover'); AU.stopMusic(2.5);
  const over=$('gameOverScreen'), quote=over.querySelector('.gameOverQuote'), icons=[...over.querySelectorAll('.gameOverLives img')];
  goTimers.forEach(clearTimeout); goTimers=[];
  quote.textContent='';
  icons.forEach(el=>{ el.src=ICON; el.classList.remove('vanish'); });
  over.querySelector('.retryNote').textContent=RESTART_FROM_STAGE1?'STAGE 1 から':('STAGE '+(S.stage+1)+(M.cpReached?' の道しるべから':' から'));
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
    if(RESTART_FROM_STAGE1){ S.stage=0; }
    const firstMercy=!M.cpOn && !!STAGES[S.stage].checkpoint;
    M.cpOn=true;
    enterStage(S.stage,false);
    if(firstMercy) setTimeout(()=>toast('失くした命が、道しるべを残していった。'),2900);
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
  for(let i=0;i<LIVES;i++){ const im=document.createElement('img'); im.src=ICON; if(i>=S.lives) im.classList.add('used'); lv.appendChild(im); }
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
  const has=sv.stage>0;
  $('btnStart').hidden=has; $('btnContinue').hidden=!has; $('btnNew').hidden=!has;
  $('btnContinue').innerHTML='つづきから<small>STAGE '+((sv.stage||0)+1)+'</small>';
  t.classList.toggle('cleared',!!sv.cleared);
  window.NEKO_TITLE.cleared=!!sv.cleared;
  t.style.display='';
  t.classList.remove('play'); void t.offsetWidth;
  requestAnimationFrame(()=>{ t.classList.remove('hide'); t.classList.add('play'); });
  if(AU.ready){ AU.music('title'); AU.setRain(sv.cleared?0:0.45); }
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
$('btnStart').addEventListener('click',e=>{ writeSave({stage:0,deaths:0}); titleTap(e,0); });
$('btnContinue').addEventListener('click',e=>titleTap(e,loadSave().stage||0));
$('btnNew').addEventListener('click',e=>{ writeSave({stage:0,deaths:0}); titleTap(e,0); });
// Splash: the first tap unlocks sound, so the title can greet you with music.
$('splash').addEventListener('pointerup',e=>{
  e.preventDefault();
  if(S.mode!=='splash') return;
  AU.unlock();
  requestFs();
  $('splash').classList.add('hide');
  AU.music('title'); AU.setRain(loadSave().cleared?0:0.45);
  toTitle();
});

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
    if(S.mode==='splash'){ $('splash').dispatchEvent(new PointerEvent('pointerup')); }
    else if(S.mode==='title'){ const sv=loadSave(); AU.unlock(); AU.play('start'); beginGame(sv.stage>0?sv.stage:0); }
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
  const portrait=window.innerHeight>window.innerWidth;
  if(portrait){ input.left=input.right=input.jump=false; input.press=false; }
  if((S.mode==='play'||S.mode==='dying') && !portrait){
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
    if(S.mode==='play') checkMercy();
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
    if($('titleScreen').style.display!=='none' && window.NEKO_TITLE.cv) window.NEKO_TITLE.frame(dt);
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
  const refresh=()=>{ document.documentElement.style.setProperty('--app-vh',innerHeight+'px'); window.scrollTo(0,0); R.cv&&R.resize(); window.NEKO_TITLE.cv&&window.NEKO_TITLE.resize(); };
  addEventListener('resize',refresh,{passive:true});
  addEventListener('orientationchange',()=>{ setTimeout(refresh,120); setTimeout(refresh,420); },{passive:true});
  if(window.visualViewport) visualViewport.addEventListener('resize',refresh,{passive:true});
})();

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
const load=src=>new Promise(res=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>res(im); im.src=src; });
(async()=>{
    AU.init();
  imgs=window.NEKO_SPRITES.build();
  ICON=imgs.icon;

  R.init($('game'),imgs);
  window.NEKO_TITLE.init($('titleCv'),imgs);
  S.mode='splash';
  // Debug / test hook: ?stage=N starts directly at stage N.
  const q=new URLSearchParams(location.search);
  if(q.has('title')){ $('splash').classList.add('hide'); toTitle(); }
  if(q.has('stage')){ $('splash').classList.add('hide'); const n=Math.max(1,Math.min(STAGES.length,+q.get('stage')||1))-1; $('titleScreen').classList.add('hide'); $('titleScreen').style.display='none'; startStage(n); }
  if(q.has('ending')){ $('splash').classList.add('hide'); $('titleScreen').classList.add('hide'); $('titleScreen').style.display='none'; S.deaths=+q.get('ending')||37; S.lives=3; startEnding(); }
  window.__neko={S,input,R,END,startStage,startEnding};
  requestAnimationFrame(loop);
})();
})();
