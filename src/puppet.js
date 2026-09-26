const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const statusText = $('#statusText');
const activeSection = $('#activeSection');
const bearRig = $('#bearRig');
const motionRoot = $('#motionRoot');
const voiceFile = $('#voiceFile');
const voiceAudio = $('#voiceAudio');
const playVoice = $('#playVoice');
const stopVoice = $('#stopVoice');
const meterFill = $('#meterFill');
const voiceName = $('#voiceName');
const voiceTime = $('#voiceTime');
const sizeRange = $('#sizeRange');
const yRange = $('#yRange');
const xRange = $('#xRange');
const depthRange = $('#depthRange');
const sizeOut = $('#sizeOut');
const yOut = $('#yOut');
const xOut = $('#xOut');
const depthOut = $('#depthOut');

const STORAGE_KEY = 'stoffis.ps_baer.puppet.v06';
const state = {
  section:'Aussehen', expression:'normal', animation:'idle', pose:'head',
  size:100, x:0, y:0, depth:0,
  poseData:{
    head:{r:0,x:0,y:0}, body:{r:0,x:0,y:0},
    leftArm:{r:0,x:0,y:0}, rightArm:{r:0,x:0,y:0},
    leftLeg:{r:0,x:0,y:0}, rightLeg:{r:0,x:0,y:0}
  }
};

const PARTS = {
  head:{points:[[258,0],[325,8],[380,38],[409,76],[447,79],[476,109],[481,158],[462,192],[432,209],[426,246],[444,292],[435,329],[409,354],[370,372],[326,382],[260,386],[194,382],[150,372],[111,354],[87,329],[80,292],[96,246],[92,209],[63,192],[44,158],[49,109],[78,79],[116,76],[145,38],[200,8]], origin:'49.5% 46.5%', z:6},
  body:{points:[[104,315],[150,289],[204,318],[260,340],[321,318],[374,289],[421,316],[450,360],[458,430],[454,512],[444,590],[416,639],[364,661],[311,671],[260,675],[209,671],[160,661],[108,639],[80,590],[70,512],[66,430],[75,360]], origin:'50% 76%', z:4},
  leftArm:{points:[[91,339],[55,360],[26,399],[9,449],[5,509],[15,565],[32,613],[58,642],[89,646],[116,626],[120,593],[111,559],[112,512],[116,466],[124,413],[120,368]], origin:'20.5% 45%', z:3},
  rightArm:{points:[[434,339],[470,360],[499,399],[516,449],[520,509],[510,565],[493,613],[467,642],[436,646],[409,626],[405,593],[414,559],[413,512],[409,466],[401,413],[405,368]], origin:'79.5% 45%', z:3},
  leftLeg:{points:[[109,616],[160,611],[216,626],[250,654],[258,697],[256,742],[244,770],[212,783],[157,782],[105,775],[77,758],[73,730],[82,687]], origin:'34% 81%', z:2},
  rightLeg:{points:[[416,616],[365,611],[309,626],[275,654],[267,697],[269,742],[281,770],[313,783],[368,782],[420,775],[448,758],[452,730],[443,687]], origin:'66% 81%', z:2}
};

const css = `
.bear-rig{height:min(94%,785px)!important;width:auto!important;aspect-ratio:525/785!important;display:block!important;position:relative!important;animation:none!important;overflow:visible!important;filter:none!important}
.motion-root,.puppet-part{position:absolute;inset:0;width:100%;height:100%}
.motion-root{transform-origin:50% 86%;will-change:transform}
.puppet-part{pointer-events:none;transform-origin:var(--origin);will-change:transform;--pose-r:0deg;--pose-x:0px;--pose-y:0px;--expr-r:0deg;transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + var(--expr-r)))}
.puppet-part canvas{width:100%;height:100%;display:block}
.face-overlay{position:absolute;inset:0;z-index:20;pointer-events:none}
.lid{position:absolute;top:25.2%;width:8.7%;height:0%;opacity:0;border-radius:50% 50% 46% 46%;background:linear-gradient(180deg,#9c5525,#c8793f);border-bottom:2px solid #3b190b;transition:height .09s ease,opacity .06s ease}
.lid.left{left:39.0%;transform:rotate(2deg)} .lid.right{left:61.6%;transform:rotate(-2deg)}
.brow{position:absolute;top:20.9%;width:8.4%;height:1.0%;border-radius:999px;background:#5b2b14;opacity:0;transition:.12s ease}
.brow.left{left:39.1%}.brow.right{left:61.4%}
#mouthSvg{position:absolute;left:43.1%;top:34.8%;width:14.4%;height:9.5%;opacity:0;overflow:visible;transition:opacity .08s ease}
#mouthCover{fill:#dea66f;opacity:.96} #mouthStroke{fill:none;stroke:#4b1d0b;stroke-width:5;stroke-linecap:round} #mouthOpen{fill:#2a100d;stroke:#120807;stroke-width:2}
.expr-happy .brow{opacity:.9;top:20.4%}.expr-happy .brow.left{transform:rotate(7deg)}.expr-happy .brow.right{transform:rotate(-7deg)}
.expr-sad .brow,.expr-angry .brow,.expr-think .brow{opacity:.95}
.expr-sad .brow.left{transform:rotate(-17deg)}.expr-sad .brow.right{transform:rotate(17deg)}
.expr-angry .brow.left{transform:rotate(18deg)}.expr-angry .brow.right{transform:rotate(-18deg)}
.expr-think .brow.left{transform:translateY(-3px) rotate(-8deg)}.expr-think .brow.right{transform:translateY(3px) rotate(8deg)}
.expr-wink .lid.left{height:4.2%;opacity:1}.blink-auto .lid.left,.blink-auto .lid.right{height:4.2%;opacity:1}
.expr-sad #headLayer{--expr-r:-3deg}.expr-think #headLayer{--expr-r:7deg}.expr-angry #headLayer{--expr-r:-1deg}
.anim-idle #headLayer{animation:headIdle 3.6s ease-in-out infinite}.anim-idle #bodyLayer{animation:bodyBreath 3.6s ease-in-out infinite}.anim-idle #leftArmLayer{animation:armIdleL 3.6s ease-in-out infinite}.anim-idle #rightArmLayer{animation:armIdleR 3.6s ease-in-out infinite}
.anim-wave #rightArmLayer{animation:armWave .72s ease-in-out infinite}.anim-wave #headLayer{animation:headWave 1.4s ease-in-out infinite}
.anim-walk #leftArmLayer{animation:walkArmL .62s ease-in-out infinite}.anim-walk #rightArmLayer{animation:walkArmR .62s ease-in-out infinite}.anim-walk #leftLegLayer{animation:walkLegL .62s ease-in-out infinite}.anim-walk #rightLegLayer{animation:walkLegR .62s ease-in-out infinite}.anim-walk .motion-root{animation:walkBob .31s ease-in-out infinite}
.anim-dance #leftArmLayer{animation:danceArmL .8s ease-in-out infinite}.anim-dance #rightArmLayer{animation:danceArmR .8s ease-in-out infinite}.anim-dance #headLayer{animation:danceHead .8s ease-in-out infinite}.anim-dance .motion-root{animation:danceRoot .8s ease-in-out infinite}
.anim-sit #bodyLayer{animation:sitBody 2.2s ease-in-out infinite}.anim-sit #headLayer{animation:sitHead 2.2s ease-in-out infinite}.anim-sit #leftLegLayer{animation:sitLegL 2.2s ease-in-out infinite}.anim-sit #rightLegLayer{animation:sitLegR 2.2s ease-in-out infinite}
.anim-talk #headLayer{animation:talkHead .7s ease-in-out infinite}.anim-talk #leftArmLayer{animation:talkArmL 1.4s ease-in-out infinite}.anim-talk #rightArmLayer{animation:talkArmR 1.4s ease-in-out infinite}
@keyframes headIdle{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + var(--expr-r) - 1deg))}50%{transform:translate(var(--pose-x),calc(var(--pose-y) - 4px)) rotate(calc(var(--pose-r) + var(--expr-r) + 1deg))}}
@keyframes bodyBreath{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + var(--expr-r))) scale(1)}50%{transform:translate(var(--pose-x),calc(var(--pose-y) - 1px)) rotate(calc(var(--pose-r) + var(--expr-r))) scale(1.008,1.012)}}
@keyframes armIdleL{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 1deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 2deg))}}
@keyframes armIdleR{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 1deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 2deg))}}
@keyframes armWave{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 58deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 92deg))}}
@keyframes headWave{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + var(--expr-r) - 2deg))}50%{transform:translate(var(--pose-x),calc(var(--pose-y) - 3px)) rotate(calc(var(--pose-r) + var(--expr-r) + 4deg))}}
@keyframes walkArmL{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 14deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 14deg))}}
@keyframes walkArmR{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 14deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 14deg))}}
@keyframes walkLegL{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 8deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 8deg))}}
@keyframes walkLegR{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 8deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 8deg))}}
@keyframes walkBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes danceArmL{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 28deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 48deg))}}
@keyframes danceArmR{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 48deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 28deg))}}
@keyframes danceHead{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + var(--expr-r) - 5deg))}50%{transform:translate(var(--pose-x),calc(var(--pose-y) - 5px)) rotate(calc(var(--pose-r) + var(--expr-r) + 5deg))}}
@keyframes danceRoot{0%,100%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
@keyframes sitBody{0%,100%{transform:translate(var(--pose-x),calc(var(--pose-y) + 18px)) rotate(calc(var(--pose-r) + var(--expr-r))) scaleY(.96)}50%{transform:translate(var(--pose-x),calc(var(--pose-y) + 22px)) rotate(calc(var(--pose-r) + var(--expr-r))) scaleY(.95)}}
@keyframes sitHead{0%,100%{transform:translate(var(--pose-x),calc(var(--pose-y) + 12px)) rotate(calc(var(--pose-r) + var(--expr-r)))}50%{transform:translate(var(--pose-x),calc(var(--pose-y) + 9px)) rotate(calc(var(--pose-r) + var(--expr-r) + 1deg))}}
@keyframes sitLegL{0%,100%{transform:translate(calc(var(--pose-x) - 12px),calc(var(--pose-y) + 10px)) rotate(calc(var(--pose-r) - 12deg))}50%{transform:translate(calc(var(--pose-x) - 12px),calc(var(--pose-y) + 13px)) rotate(calc(var(--pose-r) - 10deg))}}
@keyframes sitLegR{0%,100%{transform:translate(calc(var(--pose-x) + 12px),calc(var(--pose-y) + 10px)) rotate(calc(var(--pose-r) + 12deg))}50%{transform:translate(calc(var(--pose-x) + 12px),calc(var(--pose-y) + 13px)) rotate(calc(var(--pose-r) + 10deg))}}
@keyframes talkHead{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + var(--expr-r) - 1deg))}50%{transform:translate(var(--pose-x),calc(var(--pose-y) - 3px)) rotate(calc(var(--pose-r) + var(--expr-r) + 1deg))}}
@keyframes talkArmL{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 3deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 5deg))}}
@keyframes talkArmR{0%,100%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) - 3deg))}50%{transform:translate(var(--pose-x),var(--pose-y)) rotate(calc(var(--pose-r) + 5deg))}}
`;

const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

function setStatus(text){ statusText.textContent = text; }
function fmt(sec){ if(!Number.isFinite(sec)) return '0:00'; const m=Math.floor(sec/60),s=Math.floor(sec%60); return `${m}:${String(s).padStart(2,'0')}`; }

function buildPartCanvas(img, points){
  const c=document.createElement('canvas'); c.width=525; c.height=785;
  const ctx=c.getContext('2d');
  ctx.save(); ctx.beginPath(); points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.closePath(); ctx.clip();
  ctx.drawImage(img,0,0,525,785); ctx.restore();
  return c;
}

function addPart(name, spec, img){
  const div=document.createElement('div');
  div.id=`${name}Layer`; div.className='puppet-part'; div.style.setProperty('--origin',spec.origin); div.style.zIndex=spec.z;
  div.appendChild(buildPartCanvas(img,spec.points));
  motionRoot.appendChild(div);
  return div;
}

function addFaceOverlay(head){
  const face=document.createElement('div'); face.className='face-overlay'; face.id='faceOverlay';
  face.innerHTML=`
    <div class="lid left" id="lidL"></div><div class="lid right" id="lidR"></div>
    <div class="brow left"></div><div class="brow right"></div>
    <svg id="mouthSvg" viewBox="0 0 60 50">
      <ellipse id="mouthCover" cx="30" cy="25" rx="28" ry="22"></ellipse>
      <path id="mouthStroke" d="M10 24 Q30 38 50 24"></path>
      <ellipse id="mouthOpen" cx="30" cy="29" rx="8" ry="2" opacity="0"></ellipse>
    </svg>`;
  head.appendChild(face);
}

async function initPuppet(){
  const img=new Image();
  img.src='./assets/characters/ps_baer/2d/PS_BAER_HQ.webp';
  await img.decode();
  motionRoot.replaceChildren();
  const created={};
  ['leftLeg','rightLeg','leftArm','rightArm','body','head'].forEach(n=>created[n]=addPart(n,PARTS[n],img));
  addFaceOverlay(created.head);
  applyPose();
  syncFace();
  setStatus('PS BÄR · echtes 2D-Puppet bereit');
}

function applyGlobalTransform(){
  const scale=state.size/100;
  bearRig.style.transform=`translate(${state.x*.7}px,${-state.y*.7}px) scale(${scale})`;
  bearRig.style.perspective=`${900+state.depth*10}px`;
  sizeOut.textContent=`${state.size}%`;xOut.textContent=`${state.x}%`;yOut.textContent=`${state.y}%`;depthOut.textContent=`${state.depth}%`;
}
function applyPose(){
  Object.entries(state.poseData).forEach(([name,p])=>{
    const el=$(`#${name}Layer`); if(!el)return;
    el.style.setProperty('--pose-r',`${p.r}deg`);
    el.style.setProperty('--pose-x',`${p.x}px`);
    el.style.setProperty('--pose-y',`${p.y}px`);
  });
}
function setSection(name){
  state.section=name; $$('.menu-item').forEach(b=>b.classList.toggle('active',b.dataset.section===name));
  activeSection.textContent=name; setStatus(`PS BÄR · ${name}`);
}
function expressionLabel(n){return ({normal:'Normal',happy:'Fröhlich',sad:'Traurig',surprised:'Überrascht',angry:'Wütend',wink:'Zwinkern',smile:'Lächeln',think:'Denken'})[n]||n}
function setExpression(name){
  state.expression=name;
  $$('.face-tile').forEach(b=>b.classList.toggle('active',b.dataset.expression===name));
  [...bearRig.classList].filter(c=>c.startsWith('expr-')).forEach(c=>bearRig.classList.remove(c));
  if(name!=='normal') bearRig.classList.add(`expr-${name}`);
  syncFace(); setStatus(`PS BÄR · ${expressionLabel(name)}`);
}
function setMouth(type, level=0){
  const svg=$('#mouthSvg'), path=$('#mouthStroke'), open=$('#mouthOpen'); if(!svg)return;
  const show=type!=='normal'; svg.style.opacity=show?'1':'0';
  open.setAttribute('opacity','0');
  if(type==='happy'||type==='smile'){path.setAttribute('d','M9 21 Q30 42 51 21');}
  else if(type==='sad'){path.setAttribute('d','M9 35 Q30 14 51 35');}
  else if(type==='angry'){path.setAttribute('d','M11 31 Q30 21 49 31');}
  else if(type==='surprised'){path.setAttribute('d','');open.setAttribute('opacity','1');open.setAttribute('rx','8');open.setAttribute('ry','12');}
  else if(type==='talk'){
    path.setAttribute('d','');
    open.setAttribute('opacity','1'); open.setAttribute('rx',String(8+level*7)); open.setAttribute('ry',String(3+level*12));
  } else if(type==='think'){path.setAttribute('d','M12 28 Q24 33 36 28');}
}
function syncFace(){
  if(state.animation==='talk') return;
  setMouth(state.expression,0);
}
function setAnimation(name){
  state.animation=name;
  $$('.anim-tile').forEach(b=>b.classList.toggle('active',b.dataset.animation===name));
  [...bearRig.classList].filter(c=>c.startsWith('anim-')).forEach(c=>bearRig.classList.remove(c));
  bearRig.classList.add(`anim-${name}`);
  const labels={idle:'Idle',wave:'Winken',walk:'Laufen',dance:'Tanzen',sit:'Sitzen',talk:'Sprechen'};
  if(name==='talk') setMouth('talk',.25); else syncFace();
  setStatus(`PS BÄR · ${labels[name]||name}`);
}
function setPose(name){
  state.pose=name; $$('.pose-chip').forEach(b=>b.classList.toggle('active',b.dataset.pose===name)); setStatus(`Pose · ${name}`);
}

$$('.menu-item').forEach(b=>b.addEventListener('click',()=>setSection(b.dataset.section)));
$$('.face-tile').forEach(b=>b.addEventListener('click',()=>setExpression(b.dataset.expression)));
$$('.anim-tile').forEach(b=>b.addEventListener('click',()=>setAnimation(b.dataset.animation)));
$$('.pose-chip').forEach(b=>b.addEventListener('click',()=>setPose(b.dataset.pose)));

sizeRange.addEventListener('input',()=>{state.size=+sizeRange.value;applyGlobalTransform()});
yRange.addEventListener('input',()=>{state.y=+yRange.value;applyGlobalTransform()});
xRange.addEventListener('input',()=>{state.x=+xRange.value;applyGlobalTransform()});
depthRange.addEventListener('input',()=>{state.depth=+depthRange.value;applyGlobalTransform()});

$$('[data-nudge]').forEach(btn=>btn.addEventListener('click',()=>{
  const p=state.poseData[state.pose]||state.poseData.head, d=btn.dataset.nudge;
  if(d==='left') p.r=Math.max(-95,p.r-5);
  if(d==='right') p.r=Math.min(95,p.r+5);
  if(d==='up') p.y=Math.max(-45,p.y-3);
  if(d==='down') p.y=Math.min(45,p.y+3);
  applyPose(); setStatus(`Pose · ${state.pose} · ${Math.round(p.r)}°`);
}));

$('#saveBear').addEventListener('click',()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));setStatus('PS BÄR gespeichert 💾')});
$('#loadBear').addEventListener('click',()=>{
  try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(s){Object.assign(state,s);if(s.poseData)state.poseData=s.poseData;}syncUi();setStatus(s?'PS BÄR geladen':'Noch kein gespeicherter Bär');}catch{setStatus('Speicherstand konnte nicht geladen werden');}
});
$('#resetBear').addEventListener('click',()=>{
  state.section='Aussehen';state.expression='normal';state.animation='idle';state.pose='head';state.size=100;state.x=state.y=state.depth=0;
  Object.values(state.poseData).forEach(p=>Object.assign(p,{r:0,x:0,y:0}));
  localStorage.removeItem(STORAGE_KEY);syncUi();setStatus('PS BÄR Original wiederhergestellt');
});

let audioUrl=null,audioCtx=null,analyser=null,source=null,freq=null;
async function ensureAnalyser(){
  if(audioCtx)return;
  audioCtx=new (window.AudioContext||window.webkitAudioContext)(); analyser=audioCtx.createAnalyser(); analyser.fftSize=256;
  freq=new Uint8Array(analyser.frequencyBinCount); source=audioCtx.createMediaElementSource(voiceAudio); source.connect(analyser); analyser.connect(audioCtx.destination);
}
voiceFile.addEventListener('change',async()=>{
  const file=voiceFile.files?.[0];if(!file)return;if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(file);voiceAudio.src=audioUrl;
  voiceName.textContent=file.name;playVoice.disabled=false;stopVoice.disabled=false;await ensureAnalyser();setStatus(`Sprachclip geladen · ${file.name}`);
});
playVoice.addEventListener('click',async()=>{try{await ensureAnalyser();if(audioCtx.state==='suspended')await audioCtx.resume();await voiceAudio.play();setAnimation('talk');setStatus('PS BÄR spricht 🗣️');}catch(e){console.error(e);setStatus('Audio konnte nicht gestartet werden')}});
stopVoice.addEventListener('click',()=>{voiceAudio.pause();voiceAudio.currentTime=0;meterFill.style.width='0%';setAnimation('idle')});
voiceAudio.addEventListener('ended',()=>{meterFill.style.width='0%';setAnimation('idle');setStatus('PS BÄR bereit')});

let nextBlink=performance.now()+2400+Math.random()*2200, blinkOff=0;
function tick(now){
  requestAnimationFrame(tick);
  if(now>nextBlink && state.expression!=='wink'){bearRig.classList.add('blink-auto');blinkOff=now+150;nextBlink=now+2600+Math.random()*3300}
  if(blinkOff && now>blinkOff){bearRig.classList.remove('blink-auto');blinkOff=0}
  let level=0;
  if(analyser&&!voiceAudio.paused){analyser.getByteFrequencyData(freq);let sum=0;for(const v of freq)sum+=v;level=Math.min(1,(sum/freq.length)/105);meterFill.style.width=`${Math.round(level*100)}%`;setMouth('talk',level)}
  else if(state.animation==='talk'){level=.25+Math.abs(Math.sin(now*.012))*.45;setMouth('talk',level)}
  voiceTime.textContent=`${fmt(voiceAudio.currentTime)} / ${fmt(voiceAudio.duration)}`;
}
function syncUi(){
  sizeRange.value=state.size;xRange.value=state.x;yRange.value=state.y;depthRange.value=state.depth;
  setSection(state.section);setExpression(state.expression);setAnimation(state.animation);setPose(state.pose);applyGlobalTransform();applyPose();
}

await initPuppet();
syncUi();
requestAnimationFrame(tick);
