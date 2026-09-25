// Neko Nine: story text and the ten stages.
(function(root){
'use strict';
const E=root.NEKO_ENGINE;
const G=E.G;

const PROLOGUE=[
  '猫には、九つの命があるという。',
  'だから君は、ぼくを「ナイン」と呼んだ。',
  '「長生きしてね」って、笑いながら。'
];

const STAGES=[
// ---------------------------------------------------------------- 1
{
  name:'はじまりの廊下', theme:'hall',
  story:['君が帰ってこない夜が、三日つづいた。','だから今度は、ぼくが君を探しにいく。'],
  storyYou:['会社に泊まりこんで、三日目の夜。','ナインのごはん、ちゃんと足りてるかな。'],
  floors:[[0,300]],
  checkpoint:{x:520},
  goal:{x:905},
  ents:F=>[
    // Hidden trapdoor: ordinary floor until stood on.
    F.TrapFloor({x:300,w:150,dir:'lr',delay:0.10,speed:720}),
    // Visible pit that slides under the landing spot of a committed jump.
    F.ShiftPit({x0:450,x1:1000,px:580,pw:140,minShift:50,maxShift:170,look:150,speed:760})
  ]
},
// ---------------------------------------------------------------- 2
{
  name:'雨の路地', theme:'alley', rain:1,
  story:['外の世界は、つめたくて、うるさい。','君はいつも、こんな雨の中を帰ってきていたんだね。'],
  storyYou:['傘をさす気力も、もう残っていなかった。','雨の音だけが、やけにやさしかった。'],
  floors:[[0,350],[500,680],[820,1000]],
  checkpoint:{x:590},
  goal:{x:905},
  ents:F=>[
    F.Deco({type:'window',x:304,y:150}),
    F.FallBlock({x:292,w:24,h:24,y0:130,tx:205,delay:0,gravity:3000,style:'pot',landSE:'floorbreak',shadow:true}),
    F.ChaseWall({startX:780,w:54,h:170,when:w=>w.P.x>=640&&w.P.x<760,riseSpeed:900,speed:560,minX:500}),
    F.TrapFloor({x:680,w:140,dir:'lr',delay:0.08,speed:900,armed:w=>!!w.flags.wallDone})
  ]
},
// ---------------------------------------------------------------- 3
{
  name:'錆びた工場', theme:'factory',
  story:['「頑張らなきゃ」って、君は毎朝つぶやいて出かけた。','もう、十分すぎるくらい頑張っていたのに。'],
  storyYou:['「頑張らなきゃ」って言わないと、立てなかった。','言うたびに、何かが少しずつすり減っていった。'],
  floors:[[0,600],[740,1000]],
  checkpoint:{x:560},
  goal:{x:920},
  ents:F=>{
    const A=F.Crusher({x:330,w:90,h:150,tx:285,delay:0.2,fallSpeed:920,hold:0.55,riseSpeed:430});
    const B=F.Crusher({x:420,w:90,h:150,delay:0.05,fallSpeed:1100,hold:0.7,riseSpeed:430,
      when:w=>w.P.x>=408 && A.st==='done'});
    return [A,B,
      // Fired at whoever stands still waiting for the second press.
      F.Shot({from:'left',y:G-22,w:54,h:8,speed:720,delay:0.1,style:'arrow',when:w=>B.st==='hold'&&w.P.x<540}),
      F.DropFloor({x:600,w:140,delay:0.14,speed:520}),
      // The exit door fires back.
      F.Shot({from:'right',y:G-22,w:54,h:8,speed:900,delay:0.0,style:'arrow',tx:800})
    ];
  }
},
// ---------------------------------------------------------------- 4
{
  name:'地下水路', theme:'sewer',
  story:['最後に君の笑った顔を見たのは、','いつだっただろう。'],
  storyYou:['最後に笑ったのは、いつだっただろう。','……ナインの寝顔を見たとき、かな。'],
  floors:[[0,432],[528,1000]],
  checkpoint:{x:555},
  goal:{x:905},
  ents:F=>[
    F.Spikes({x:292,w:96,maxH:42,tx:280,delay:0.12,riseSpeed:300,hold:0.48,fallSpeed:220}),
    F.DropFloor({x:432,w:96,delay:0.5,crack:true,gravity:1500,se:'floorbreak',style:'crumble'}),
    F.FallBlock({x:649,w:82,h:86,y0:90-86,tx:565,delay:0.16,speed:760,solid:true,style:'stone',shadow:true}),
    F.Spikes({x:779,w:92,maxH:128,tx:735,delay:0.12,riseSpeed:760,permanent:true})
  ]
},
// ---------------------------------------------------------------- 5
{
  name:'白い研究所', theme:'lab',
  story:['「大丈夫」が、君の口ぐせだった。','ぜんぜん大丈夫じゃない声で。'],
  storyYou:['「大丈夫です」って、今日も何回言っただろう。','ほんとうは、一回も大丈夫じゃなかった。'],
  floors:[[0,1000]],
  checkpoint:{x:505},
  goal:{x:905},
  ents:F=>[
    F.Laser({x:250,y0:90,y1:G,tx:150,warm:0.28,onT:0.72,offT:0.62}),
    F.Lift({x:335,w:100,rise:272,speed:440}),
    F.SpikeRow({x:335,w:100,y:90,h:38,dirn:'down'}),
    F.Arc({x:585,w:28,maxH:G-60,tx:470,delay:0.22,riseSpeed:560,hold:0.3}),
    F.Shot({from:'right',y:G-21,w:74,h:42,speed:760,tx:540,delay:0.35,style:'block',se:'wallmove'}),
    F.Shot({from:'right',y:G-150,w:74,h:42,speed:760,tx:540,delay:1.6,style:'block',se:'wallmove'}),
    F.Shutter({x:766,w:58,top:90,tx:735,delay:0.05,dropSpeed:1350,holdClosed:1.6,riseSpeed:520,gap:70})
  ]
},
// ---------------------------------------------------------------- 6
{
  name:'雨の屋上', theme:'roof', rain:2,
  story:['ごはんを食べることも、眠ることも、','君はいつからか、できなくなっていった。'],
  storyYou:['眠れない夜は、窓から街の灯りを数えた。','あの灯りのどれかに、帰りたかった。'],
  floors:[[0,360,420],[470,530,400],[590,640,400],[800,1000,430]],
  checkpoint:{x:612,y:400},
  goal:{x:915,y:430},
  deathY:600,
  ents:F=>[
    F.Lightning({lock:0.5,strike:1.0,predict:true,width:34,when:w=>w.P.x>=150&&w.P.x<360}),
    F.DropFloor({x:530,w:60,y:400,thick:14,delay:0.04,gravity:1800,style:'glass',se:'floorbreak'}),
    F.Wind({x0:600,x1:840,v:-175,onT:1.3,offT:1.7,phase:0}),
    // the wind drops and you want to jump... a crow comes in at the height of that jump.
    // Leap at once and you meet it mid-air; let it pass first.
    F.Shot({from:'right',y:225,w:34,h:18,speed:1000,delay:0,style:'crow',se:'trap',warnSE:'warn',
      when:w=>w.P.ground&&w.P.x>=590&&w.P.x<=640&&!w.ents[2].active}),
    // ...and its partner swoops in low from behind once you land. Don't linger.
    F.Shot({from:'left',x0:560,y:430-20,w:34,h:18,speed:760,delay:0.2,style:'crow',se:'trap',warnSE:'warn',when:w=>w.P.ground&&w.P.x>=800})
  ]
},
// ---------------------------------------------------------------- 7
{
  name:'終電の駅', theme:'station', width:1600,
  story:['終電で帰ってきて、始発でまた出ていく。','そんな君が、今夜は最終電車にもいなかった。'],
  storyYou:['終電の窓に映った顔が、知らない人みたいだった。','ナインが待ってる。それだけで、また歩けた。'],
  floors:[[0,1000],[1120,1600]],
  checkpoint:{x:900},
  goal:{x:1520},
  ents:F=>[
    F.Block({x:300,y:G-84,w:46,h:84,style:'vending'}),
    // One train passes and the gates lift... but the moment you step onto the tracks,
    // the bell starts again and a second train comes.
    F.Crossing({x0:600,x1:820,tx:530,trains:[{at:1.1,dur:0.75},{enter:2.0,delay:0.6,dur:0.75}],bells:[[0,2.0]]}),
    F.Bonk({x:990,y:G-180,w:80,h:36}),
    F.Conveyor({x:1120,w:300,v:140,rx:1290,rv:-430}),
    // The obvious escape jump from the reversing walkway hits a hidden block.
    F.Bonk({x:1288,y:G-176,w:110,h:34})
  ]
},
// ---------------------------------------------------------------- 8
{
  name:'時計塔', theme:'clock', width:1400,
  story:['時間は、巻き戻らない。','命は、何度でも戻ってくるのに。'],
  storyYou:['時計ばかり見ていた。','朝が来るのが、こわかった。'],
  spawn:{x:80,y:420},
  floors:[[0,760],[1040,1400]],
  checkpoint:{x:648},
  goal:{x:1300},
  ents:F=>[
    F.Pendulum({px:245,py:90,len:290,amp:0.72,period:2.2,phase:0,r:20}),
    F.Pendulum({px:480,py:90,len:290,amp:0.72,period:2.2,phase:1.1,r:20}),
    F.Spring({x:690,w:40,power:1150}),
    F.Spikes({x:630,w:160,y:90,maxH:34,dirn:'down',delay:0,riseSpeed:900,permanent:true,when:w=>w.P.vy<-900}),
    F.DropFloor({x:790,w:135,y:250,thick:20,delay:0.02,speed:1100,style:'ledge',se:'trapdoor',
      when:(w,e)=>w.P.ground&&w.P.ref===e.s&&w.P.x>=896}),
    F.FakeDoor({x:905,y:250}),
    F.SpikeRow({x:760,w:280,y:G+120,h:26}),
    F.Crusher({x:1240,w:84,h:78,delay:0.12,fallSpeed:1100,lockGoal:true,hold:0.7,riseSpeed:380,style:'bell',
      when:w=>w.P.ground&&w.P.x>=1160&&w.P.y>=G-1})
  ]
},
// ---------------------------------------------------------------- 9
{
  name:'暗闇', theme:'dark', width:2600,
  story:['君の心の中も、こんなに暗かったのかな。','ひとりで、ずっとここを歩いていたのかな。'],
  storyYou:['やっと帰った部屋に、ナインはいなかった。','明かりをつける気力もなくて、ずっと待っていた。'],
  floors:[[0,420],[520,700],[800,1000],[1300,1720],[1800,1880],[1990,2600]],
  checkpoint:{x:1330},
  goal:{x:2480},
  ents:F=>[
    F.DarkChase({startX:-80,tx:170,speed:120,accel:8,maxSpeed:170,leash:720,boostX:2150,boostSpeed:190}),
    F.DropFloor({x:700,w:100,delay:0.45,crack:true,gravity:1500,se:'floorbreak',style:'crumble'}),
    F.Mover({x:1030,y:G-14,w:120,h:16,ax:'x',range:140,period:2.2,style:'plank'}),
    F.FallBlock({x:1440,w:40,h:40,y0:-60,tx:1300,delay:0.08,gravity:2600,style:'rock',landSE:'blockfall',shadow:true}),
    F.Light({x:1935,y:300,r:130,warm:true,lantern:true}),
    F.TrapFloor({x:1880,w:110,dir:'mid',delay:0.03,speed:900})
  ]
},
// ---------------------------------------------------------------- 10
{
  name:'ただいま', theme:'home', width:3150,
  story:['見覚えのある廊下。','ドアの向こうに、君の気配がする。'],
  storyYou:['ドアの向こうで、小さな足音がした。','……ナイン？'],
  // The whole way home, every trap from the journey comes back once more.
  floors:[[0,470],[1030,1480],[1580,3150]],
  checkpoint:{x:1330},
  goal:{x:3050,locked:false},
  final:true,
  // the darkness of stage 9 follows you in, and lifts on the way to the door
  dusk:{from:0.84,x0:300,x1:2750},
  // the owner's voice, remembered along the way home
  memories:[
    {x:300, text:'「ただいま、ナイン。いい子にしてた？」'},
    {x:1130,text:'「ごめんね。今日も、遅くなっちゃった」'},
    {x:1640,text:'「頑張らなきゃ。……みんな、頑張ってるんだから」'},
    {x:1990,y:292,text:'「大丈夫。……大丈夫だから」'},
    {x:2400,text:'「ごめんね。……なんにも、できなくなっちゃった」'},
    {x:2800,text:'「長生きしてね」'}
  ],
  ents:F=>[
    // 1: the trapdoor spot is honest this time. The landing spot is not.
    F.TrapFloor({x:470,w:140,dir:'lr',delay:0.03,speed:900}),
    // 1: the pit from the very first hallway remembers you, too.
    F.ShiftPit({x0:610,x1:1030,px:700,pw:120,minShift:40,maxShift:150,look:150,speed:800}),
    // 5 + 3: laser fence, then three presses in a row.
    F.Laser({x:965,y0:90,y1:G,always:true,onT:0.8,offT:0.85,phase:0}),
    F.Crusher({x:1030,w:80,h:150,ceil:39,period:2.1,phase:0.0,fallSpeed:1000,hold:0.25,riseSpeed:560}),
    F.Crusher({x:1110,w:80,h:150,ceil:39,period:2.1,phase:0.25,fallSpeed:1000,hold:0.25,riseSpeed:560}),
    F.Crusher({x:1190,w:80,h:150,ceil:39,period:2.1,phase:0.5,fallSpeed:1000,hold:0.25,riseSpeed:560}),
    // 6: a headwind over the gap. Jump into it and you fall short.
    F.Wind({x0:1370,x1:1575,v:-240,onT:1.3,offT:1.5,phase:0}),
    // 5: the long jump lands right on a rising arc. Hop short and let it pass.
    F.Arc({x:1700,w:28,maxH:G-60,tx:1545,delay:0.2,riseSpeed:600,hold:0.35}),
    // 6: lightning that aims where you are going, twice.
    F.Lightning({lock:0.5,strike:1.0,predict:true,width:34,count:2,interval:0.75,when:w=>w.P.x>=1820&&w.P.x<2080}),
    // 8: the clock tower's blade.
    F.Pendulum({px:2240,py:90,len:290,amp:0.72,period:2.2,phase:0,r:20}),
    // 4: floor spikes that wait for you to come close.
    F.Spikes({x:2400,w:96,maxH:42,tx:2385,delay:0.12,riseSpeed:300,hold:0.48,fallSpeed:220}),
    // 2: the wall from the rainy alley.
    F.ChaseWall({startX:2870,w:54,h:170,when:w=>w.P.x>=2695,riseSpeed:900,speed:520,minX:2625,flag:'wall10'}),
    // The wall stops... and the door answers with an arrow along the floor.
    F.Shot({from:'right',y:G-22,w:54,h:8,speed:820,delay:0.3,style:'arrow',when:w=>!!w.flags.wall10}),
    F.Deco({type:'fakecrack',x:2910,w:70}),
    F.Light({x:3050,y:370,r:170,warm:true,doorGlow:true})
  ]
}
];

// ============================================================================
// Second lap (after the first ending): the same nights, told from your side
// toward the dawn. Each stage twists one thing the first lap taught you.
// ============================================================================
const PROLOGUE2=[
  '同じ夜を、もう一度。',
  'こんどは、君のほうから。'
];
const LOOP2={
  // 1: an alarm clock hops down the hall. Jump it and it jumps with you; walk under its hop.
  0:{floors:[[0,1000]],checkpoint:{x:520},
    ents:F=>{
      // (starting again from the checkpoint, only the second one is left)
      const A=F.AlarmClock({from:'right',x0:1040,speed:170,hopH:112,hopT:0.8,when:w=>w.P.x>=180&&w.P.x<500});
      return [A,
        // the snooze: a second one drops in front of the door once the first has gone by
        F.AlarmClock({from:'right',x0:860,drop:true,speed:150,hopH:104,hopT:0.74,when:w=>w.P.x>=520&&(A.st==='idle'||A.x<w.P.x-40)})];
    }},
  // 2: notifications pop up over the gap, one after another. One of them isn't real.
  // one gap, nothing to split: no checkpoint here, only the hints
  1:{floors:[[0,300],[860,1000]],checkpoint:null,
    ents:F=>[
      F.Banners({tx:240,items:[
        {x:330,y:G-10,at:0,life:3.6},
        {x:488,y:G-62,at:0.7,life:3.4},
        // the next one lines up right where you'd walk on... it's the fake
        {x:600,y:G-62,at:1.2,fake:true},
        {x:688,y:G-160,at:1.4,life:3.6}]})
    ]},
  // 3: the presses, on a dizzy head: left and right trade places until the edge
  2:{ents:F=>[
      F.Dizzy({x0:250,x1:600,off:545}),
      F.Crusher({x:320,w:90,h:150,ceil:39,period:1.9,phase:0,fallSpeed:1000,hold:0.3,riseSpeed:560}),
      F.Crusher({x:445,w:90,h:150,ceil:39,period:1.9,phase:0.55,fallSpeed:1000,hold:0.3,riseSpeed:560}),
      F.DropFloor({x:600,w:140,delay:0.14,speed:520}),
      F.Shot({from:'right',y:G-22,w:54,h:8,speed:900,delay:0.0,style:'arrow',tx:800})
    ]},
  // 4: the lamps flicker, and the walkway over the water is only there while they're lit
  // the middle stretch is solid stone: a place to catch your breath, and the checkpoint
  3:{floors:[[0,300],[450,610],[760,1000]],checkpoint:{x:530},
    ents:F=>[
      F.LightFloor({x:300,w:150,onT:2.2,offT:1.2,phase:0}),
      F.LightFloor({x:610,w:150,onT:2.2,offT:1.2,phase:0.4})
    ]},
  // 5: the lab's exit runs from you. Stand still and it comes back.
  4:{ents:F=>[
      F.Laser({x:250,y0:90,y1:G,tx:150,warm:0.28,onT:0.72,offT:0.62}),
      F.Lift({x:335,w:100,rise:272,speed:440}),
      F.SpikeRow({x:335,w:100,y:90,h:38,dirn:'down'}),
      F.ShyDoor({near:200,flee:340,creep:80,min:560,max:975})
    ]},
  // 6: an umbrella by the parapet. Held open, you drift down slowly and the gusts carry you
  5:{floors:[[0,330,420],[880,1000,430]],checkpoint:null,goal:{x:940,y:430},
    ents:F=>[
      F.Umbrella({x:236,y:420,boost:230}),
      F.Wind({x0:300,x1:900,v:200,onT:1.8,offT:3.0,phase:1.15})
    ]},
  // 7: rush hour walks toward you and shoves you back toward the tracks
  6:{ents:F=>[
      F.Block({x:300,y:G-84,w:46,h:84,style:'vending'}),
      F.Crossing({x0:600,x1:820,tx:530,trains:[{at:1.1,dur:0.75},{enter:2.0,delay:0.6,dur:0.75}],bells:[[0,2.0]]}),
      // off the last train, the crowd comes up from the crossing toward you. Get shoved all the way back and
      // you're pinned against the vending machine.
      F.Crowd({tx:380,spawnX:582,endX:352,speed:95,count:4,heights:[76,84,70,82,74],gaps:[1.7,2.1,1.6,1.9]}),
      F.Conveyor({x:1120,w:300,v:140,rx:1290,rv:-430}),
      F.Bonk({x:1288,y:G-176,w:110,h:34})
    ]},
  // 8: the clock tower's time runs only while you walk. Waiting won't help; pace back and forth where it's safe.
  7:{ents:F=>{
      const es=STAGES[7].ents(F);
      for(const e of es) if(e.constructor.name==='Pendulum'){ e.superhot=true; }
      return es;
    }},
  // 9: your own shadow walks your path a little behind you. Don't stop for long.
  8:{ents:F=>{
      const es=STAGES[8].ents(F).filter(e=>e.constructor.name!=='DarkChase');
      return [F.Shadow({tx:170,delay:1.8}),...es];
    }},
  // 10: no wall this time; the dark is thinner and the voices are from tonight
  9:{dusk:{from:0.62,x0:300,x1:2750},
    memories:[
      {x:300, text:'「ナイン……どこにいるの」'},
      {x:1130,text:'「会社に、電話しなきゃ。……休みますって」'},
      {x:1640,text:'「こわかったけど、ちゃんと言えた」'},
      {x:1990,y:292,text:'「大丈夫じゃないって、言ってもいいんだ」'},
      {x:2400,text:'「ドアの向こうで、小さな音がした」'},
      {x:2800,text:'「……ナイン？」'}
    ],
    ents:F=>{
      const base=STAGES[9].ents(F);
      // drop the chasing wall, its arrow and the fake crack; keep the lamp by the door
      const n=e=>e.constructor.name;
      return base.filter(e=>n(e)!=='ChaseWall'&&!(n(e)==='Shot'&&e.style==='arrow')&&n(e)!=='Deco');
    }}
};
for(const k in LOOP2) STAGES[k].loop2=LOOP2[k];

root.NEKO_STORY={PROLOGUE,PROLOGUE2,STAGES};
})(typeof window!=='undefined'?window:globalThis);
