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
  floors:[[0,350],[500,680],[880,1000]],
  checkpoint:{x:590},
  goal:{x:905},
  ents:F=>[
    F.Deco({type:'window',x:304,y:150}),
    F.FallBlock({x:292,w:24,h:24,y0:130,tx:205,delay:0,gravity:3000,style:'pot',landSE:'floorbreak',shadow:true}),
    // a delivery truck backs down the alley; the steel plate over the roadworks is the second joke
    F.Truck({startX:1010,minX:470,speed:520,when:w=>w.P.x>=640&&w.P.x<760}),
    F.TrapFloor({x:680,w:200,dir:'mid',delay:0.05,speed:900,style:'plate',armed:w=>!!w.flags.wallDone})
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
      F.Shot({from:'left',y:G-22,w:54,h:8,speed:720,delay:0.1,style:'bolt',when:w=>B.st==='hold'&&w.P.x<540}),
      F.DropFloor({x:600,w:140,delay:0.14,speed:520}),
      // A rivet gun by the exit fires back.
      F.Shot({from:'right',y:G-22,w:54,h:8,speed:900,delay:0.0,style:'bolt',tx:800})
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
    F.Spikes({x:292,w:96,maxH:42,tx:280,delay:0.12,riseSpeed:300,hold:0.48,fallSpeed:220,style:'jet'}),
    F.DropFloor({x:432,w:96,delay:0.5,crack:true,gravity:1500,se:'floorbreak',style:'crumble'}),
    F.FallBlock({x:649,w:82,h:86,y0:90-86,tx:565,delay:0.16,speed:760,solid:true,style:'stone',shadow:true}),
    F.Spikes({x:779,w:92,maxH:128,tx:735,delay:0.12,riseSpeed:760,permanent:true,style:'jet'})
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
    F.Bonk({x:990,y:G-180,w:80,h:36,style:'ad'}),
    F.Conveyor({x:1120,w:300,v:140,rx:1290,rv:-430}),
    // The obvious escape jump from the reversing walkway hits a hidden block.
    F.Bonk({x:1288,y:G-176,w:110,h:34,style:'ad'})
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
    // your own shadow walks the path you walked a moment ago: don't stop for long
    F.Shadow({tx:170,delay:1.8}),
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
  // The way home: the journey comes back once more, but as the things of an old apartment hallway.
  floors:[[0,470],[1030,1480],[1580,1900],[2000,3150]],
  checkpoint:{x:1430},
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
    // 1: the old floorboards: the spot you remember is honest now. The landing spot is not.
    F.TrapFloor({x:470,w:140,dir:'lr',delay:0.03,speed:900}),
    F.ShiftPit({x0:610,x1:1030,px:700,pw:120,minShift:40,maxShift:150,look:150,speed:800}),
    // 8: pendant lamps swinging in the draught. They clear a walking cat; jump like you did in the
    //    clock tower and you meet them
    F.Pendulum({px:1190,py:90,len:262,amp:0.4,period:1.8,phase:0,r:18,style:'lamp'}),
    F.Pendulum({px:1300,py:90,len:262,amp:0.4,period:1.8,phase:0.9,r:18,style:'lamp'}),
    // 6: the corridor window is open: a headwind over the gap. Jump into it and you fall short.
    F.Wind({x0:1440,x1:1575,v:-240,onT:1.3,offT:1.5,phase:0}),
    // 2: a pot on the windowsill above your landing spot. Hop short and let it fall.
    F.Deco({type:'window',x:1702,y:150}),
    F.FallBlock({x:1690,w:24,h:24,y0:130,tx:1590,delay:0,gravity:3000,style:'pot',landSE:'floorbreak',shadow:true}),
    // 4: rotten boards before the last stretch
    F.DropFloor({x:1900,w:100,delay:0.45,crack:true,gravity:1500,se:'floorbreak',style:'crumble'}),
    // 9: and your shadow from the dark follows you in. Don't stop now.
    F.Shadow({tx:2150,delay:1.6}),
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
  // 2: notifications pop up over a long gap, one after another, and don't stay long.
  //    Twice, the one lined up where you'd walk on is already read: it drops.
  //    (one gap, nothing to split: no checkpoint here, only the hints)
  1:{floors:[[0,260],[960,1000]],checkpoint:null,goal:{x:975},
    ents:F=>[
      F.Banners({tx:200,items:[
        {x:290,y:G-10,at:0,life:2.4},
        {x:420,y:G-70,at:0.45,life:2.4},
        {x:530,y:G-70,at:0.8,fake:true},
        {x:556,y:G-170,at:0.9,life:2.5,w:120},
        // this one is being swiped away as you land on it
        {x:700,y:G-110,at:1.4,life:2.6,w:110,vx:-25},
        {x:818,y:G-110,at:1.8,fake:true},
        {x:810,y:G-210,at:1.9,life:2.8,w:120}]})
    ]},
  // 3: the presses, on a dizzy head: left and right trade places until the edge
  2:{ents:F=>[
      F.Dizzy({x0:250,x1:600,off:545}),
      F.Crusher({x:320,w:90,h:150,ceil:39,period:1.9,phase:0,fallSpeed:1000,hold:0.3,riseSpeed:560}),
      F.Crusher({x:445,w:90,h:150,ceil:39,period:1.9,phase:0.55,fallSpeed:1000,hold:0.3,riseSpeed:560}),
      F.DropFloor({x:600,w:140,delay:0.14,speed:520}),
      F.Shot({from:'right',y:G-22,w:54,h:8,speed:900,delay:0.0,style:'bolt',tx:800})
    ]},
  // 4: the lamps flicker, and the walkway over the water is only there while they're lit
  // 4: the walkway over the water is only there while its lamp is lit. Past the stone,
  //    two failing tubes flicker out of step with each other: read their rhythm.
  //    (the stone in the middle is a place to catch your breath, and the checkpoint)
  3:{floors:[[0,260],[410,480],[900,1000]],checkpoint:{x:445},
    ents:F=>[
      F.LightFloor({x:260,w:150,onT:1.5,offT:1.3,phase:0}),
      F.LightFloor({x:480,w:215,seq:[[0.95,0.6],[0.3,0.3],[1.3,0.75],[0.25,0.4]],phase:0}),
      F.LightFloor({x:695,w:205,seq:[[0.7,0.9],[1.15,0.45],[0.3,0.35],[0.8,0.55]],phase:0.7})
    ]},
  // 5: the lab is a check-up now: every trap of the first night, and a scan that sweeps from
  //    both sides. Hold still while it passes ("大丈夫です" is only true if you don't move).
  4:{ents:F=>[
      F.Scanner({x0:40,x1:980,bw:26,warn:0.7,sweep:1.3,rest:1.0,both:true,tx:130}),
      F.Laser({x:250,y0:90,y1:G,tx:150,warm:0.28,onT:0.72,offT:0.62}),
      F.Lift({x:335,w:100,rise:272,speed:440}),
      F.SpikeRow({x:335,w:100,y:90,h:38,dirn:'down'}),
      F.Arc({x:585,w:28,maxH:G-60,tx:470,delay:0.22,riseSpeed:560,hold:0.3}),
      F.Shot({from:'right',y:G-21,w:74,h:42,speed:760,tx:540,delay:0.35,style:'block',se:'wallmove'}),
      F.Shot({from:'right',y:G-150,w:74,h:42,speed:760,tx:540,delay:1.6,style:'block',se:'wallmove'}),
      F.Shutter({x:766,w:58,top:90,tx:735,delay:0.05,dropSpeed:1350,holdClosed:1.6,riseSpeed:520,gap:70})
    ]},
  // 6: an umbrella by the parapet. Held open, you drift down slowly and the gusts carry you
  5:{floors:[[0,260,420],[860,1000,430]],checkpoint:null,goal:{x:945,y:430},
    ents:F=>[
      F.Umbrella({x:200,y:420,boost:70}),
      F.Wind({x0:240,x1:920,v:90,onT:1.8,offT:3.0,phase:1.15}),
      // the storm aims at where the wind is carrying you: once it locks on, brake or push on
      F.Lightning({lock:0.35,strike:1.0,predict:true,withDrift:true,width:34,count:2,interval:0.7,
        when:w=>w.P.glide&&!w.P.ground&&w.P.x>=330}),
      // the crows want the umbrella. The first swoops in low from behind the moment you land:
      // hop it (the umbrella makes the hop float)...
      F.Shot({from:'left',x0:720,y:430-20,w:34,h:18,speed:620,delay:0.2,style:'crow',se:'trap',warnSE:'warn',
        when:w=>w.P.ground&&w.P.x>=860}),
      // ...and the second follows from the front at the height of that floating hop. Stay down.
      F.Shot({from:'right',y:352,w:34,h:34,speed:700,delay:1.1,style:'crow',se:'trap',warnSE:'warn',
        when:w=>w.ents[3].st==='fly'&&w.ents[3].x>w.P.x+40})
    ]},
  // 7: rush hour walks toward you and shoves you back toward the tracks
  6:{ents:F=>[
      F.Block({x:300,y:G-84,w:46,h:84,style:'vending'}),
      F.Crossing({x0:600,x1:820,tx:530,trains:[{at:1.1,dur:0.75},{enter:2.0,delay:0.6,dur:0.75}],bells:[[0,2.0]]}),
      // off the last train, the crowd comes up from the crossing toward you. Get shoved all the way back and
      // you're pinned against the vending machine.
      F.Crowd({tx:380,spawnX:582,endX:352,speed:130,count:6,heights:[76,84,70,82,74,86],gaps:[1.25,1.6,1.1,1.45,1.3]}),
      // past the crossing, the next wave comes up behind you, heading for the same train:
      // it shoves you toward the edge of the platform (and the hanging ad is still over the gap)
      F.Crowd({dir:1,when:w=>w.P.x>=880,spawnX:835,endX:1050,speed:125,count:4,heights:[80,74,86,78],gaps:[0.9,1.1,0.8]}),
      F.Bonk({x:990,y:G-180,w:80,h:36,style:'ad'}),
      F.Conveyor({x:1120,w:300,v:140,rx:1290,rv:-430}),
      F.Bonk({x:1288,y:G-176,w:110,h:34,style:'ad'})
    ]},
  // 8: the clock tower's time runs only while you walk. Waiting won't help; pace back and forth where it's safe.
  7:{ents:F=>{
      const es=STAGES[7].ents(F);
      // a third blade between the two, out of step with both
      es.push(F.Pendulum({px:362,py:90,len:290,amp:0.72,period:2.2,phase:1.65,r:20}));
      // past the ledge, another blade swings over where you land: pace the ledge to time the leap
      es.push(F.Pendulum({px:1120,py:90,len:290,amp:0.6,period:2.0,phase:0.4,r:20}));
      for(const e of es) if(e.constructor.name==='Pendulum'){ e.superhot=true; }
      return es;
    }},
  // 9: the room you waited in with the lights off: the dark closes in from both sides.
  8:{ents:F=>{
      const es=STAGES[8].ents(F).filter(e=>e.constructor.name!=='Shadow');
      return [F.DarkChase({startX:-80,tx:170,speed:120,accel:8,maxSpeed:175,leash:700,boostX:2150,boostSpeed:195}),...es,
        F.DarkChase({side:'right',startX:2700,speed:60,minX:2540,tx:1330})];
    }},
  // 10: the way home, told from your side: the things of those nights that could happen in any
  //     home come back once more. The dark thins and the voices are from tonight.
  9:{floors:[[0,700],[960,1180],[1250,1400],[1600,2260],[2340,2470],[2550,2680],[2760,2890],[2970,3150]],checkpoint:{x:1330},
    dusk:{from:0.62,x0:300,x1:2750},
    memories:[
      {x:300, text:'「ナイン……どこにいるの」'},
      {x:1130,text:'「会社に、電話しなきゃ。……休みますって」'},
      {x:1640,text:'「こわかったけど、ちゃんと言えた」'},
      {x:1990,y:292,text:'「大丈夫じゃないって、言ってもいいんだ」'},
      {x:2400,text:'「ドアの向こうで、小さな音がした」'},
      {x:2800,text:'「……ナイン？」'}
    ],
    ents:F=>[
      // the alarm (stage 1)
      F.AlarmClock({from:'right',x0:690,speed:160,hopH:110,hopT:0.8,when:w=>w.P.x>=160&&w.P.x<600}),
      // the notifications (stage 2): the flush one is the fake again
      F.Banners({tx:640,items:[
        {x:712,y:G-24,at:0,life:3.6},
        {x:822,y:G-24,at:0.5,fake:true},
        {x:846,y:G-124,at:0.7,life:3.6}]}),
      // the dizziness (stage 3), over a small gap this time
      F.Dizzy({x0:1040,x1:1400,off:1290}),
      // the lamps (stage 4)
      F.LightFloor({x:1400,w:200,onT:2.2,offT:1.1,phase:0}),
      // and then the dark of stage 9 and your own shadow come after you together. Four stretches of the
      // floor before the door give way: hop them in rhythm and run for the door without stopping.
      F.DarkChase({startX:1450,tx:1700,speed:160,accel:30,maxSpeed:212,leash:340}),
      F.Shadow({tx:1700,delay:1.3}),
      F.TrapFloor({x:2260,w:80,dir:'lr',delay:0.02,speed:1400}),
      F.TrapFloor({x:2470,w:80,dir:'lr',delay:0.02,speed:1400}),
      F.TrapFloor({x:2680,w:80,dir:'lr',delay:0.02,speed:1400}),
      F.TrapFloor({x:2890,w:80,dir:'lr',delay:0.02,speed:1400}),
      F.Light({x:3050,y:370,r:170,warm:true,doorGlow:true})
    ]}
};
for(const k in LOOP2) STAGES[k].loop2=LOOP2[k];

root.NEKO_STORY={PROLOGUE,PROLOGUE2,STAGES};
})(typeof window!=='undefined'?window:globalThis);
