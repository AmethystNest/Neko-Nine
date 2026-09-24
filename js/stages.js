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
  story:['君は、疲れた顔で帰ってくる日が多かった。','それでも、ぼくを見ると少しだけ笑った。'],
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
  story:['ずっと遠くに、','君の住む街の灯りが見えた。'],
  floors:[[0,360,420],[470,530,400],[590,640,400],[800,1000,430]],
  checkpoint:{x:612,y:400},
  goal:{x:915,y:430},
  deathY:600,
  ents:F=>[
    F.Lightning({lock:0.5,strike:0.78,predict:true,width:34,when:w=>w.P.x>=150&&w.P.x<360}),
    F.DropFloor({x:530,w:60,y:400,thick:14,delay:0.04,gravity:1800,style:'glass',se:'floorbreak'}),
    F.Wind({x0:600,x1:840,v:-175,onT:1.3,offT:1.7,phase:0}),
    F.Shot({from:'right',y:430-20,w:34,h:18,speed:620,delay:0.15,style:'crow',se:'trap',warnSE:'warn',lockGoal:true,when:w=>w.P.ground&&w.P.x>=800})
  ]
},
// ---------------------------------------------------------------- 7
{
  name:'終電の駅', theme:'station', width:1600,
  story:['君は毎晩、この駅から帰ってきた。','最終電車にも、君はいなかった。'],
  floors:[[0,1000],[1120,1600]],
  checkpoint:{x:900},
  goal:{x:1520},
  ents:F=>[
    F.Block({x:300,y:G-84,w:46,h:84,style:'vending'}),
    // Two trains, the gates lift... and the bell starts again for a late express.
    F.Crossing({x0:600,x1:820,tx:530,trains:[{at:1.1,dur:0.75},{at:2.35,dur:0.75},{at:4.15,dur:0.45}],bells:[[0,3.25],[3.55,4.8]]}),
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
  name:'ただいま', theme:'home', width:1800,
  story:['見覚えのある廊下。','ドアの向こうに、君の気配がする。'],
  floors:[[0,470],[1030,1800]],
  checkpoint:{x:1000},
  goal:{x:1700,locked:false},
  final:true,
  ents:F=>[
    // Stage 1 trapdoor spot is honest this time. The landing spot is not.
    F.TrapFloor({x:470,w:140,dir:'lr',delay:0.03,speed:900}),
    // The pit from the very first hallway remembers you, too.
    F.ShiftPit({x0:610,x1:1030,px:700,pw:120,minShift:40,maxShift:150,look:150,speed:800}),
    F.Laser({x:965,y0:90,y1:G,always:true,onT:0.8,offT:0.85,phase:0}),
    F.Crusher({x:1030,w:80,h:150,ceil:39,period:2.1,phase:0.0,fallSpeed:1000,hold:0.25,riseSpeed:560}),
    F.Crusher({x:1110,w:80,h:150,ceil:39,period:2.1,phase:0.25,fallSpeed:1000,hold:0.25,riseSpeed:560}),
    F.Crusher({x:1190,w:80,h:150,ceil:39,period:2.1,phase:0.5,fallSpeed:1000,hold:0.25,riseSpeed:560}),
    F.ChaseWall({startX:1520,w:54,h:170,when:w=>w.P.x>=1345,riseSpeed:900,speed:520,minX:1275,flag:'wall10'}),
    // The wall stops... and the door answers with an arrow along the floor.
    F.Shot({from:'right',y:G-22,w:54,h:8,speed:820,delay:0.3,style:'arrow',when:w=>!!w.flags.wall10}),
    F.Deco({type:'fakecrack',x:1560,w:70}),
    F.Light({x:1700,y:370,r:170,warm:true,doorGlow:true})
  ]
}
];

root.NEKO_STORY={PROLOGUE,STAGES};
})(typeof window!=='undefined'?window:globalThis);
