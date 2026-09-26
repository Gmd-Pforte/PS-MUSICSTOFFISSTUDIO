const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const statusText = $('#statusText');
const activeSection = $('#activeSection');
const bearRig = $('#bearRig');
const bearSprite = $('#bearSprite');
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

const STORAGE_KEY = 'stoffis.ps_baer.hq2d.v05';
const state = {
  section: 'Aussehen', expression: 'normal', animation: 'idle', pose: 'head',
  size: 100, x: 0, y: 0, depth: 0,
};

let audioUrl = null;
let audioCtx = null;
let analyser = null;
let source = null;
let freq = null;

function setStatus(text){ statusText.textContent = text; }
function fmt(sec){ if (!Number.isFinite(sec)) return '0:00'; const m=Math.floor(sec/60); const s=Math.floor(sec%60); return `${m}:${String(s).padStart(2,'0')}`; }
function applyTransform(){
  const scale = state.size / 100;
  bearRig.style.setProperty('--user-scale', scale);
  bearRig.style.marginLeft = `${state.x * .7}px`;
  bearRig.style.marginTop = `${-state.y * .7}px`;
  bearRig.style.perspective = `${900 + state.depth*10}px`;
  bearSprite.style.transform = `scale(${scale}) translateZ(${state.depth}px)`;
  sizeOut.textContent = `${state.size}%`;
  xOut.textContent = `${state.x}%`; yOut.textContent = `${state.y}%`; depthOut.textContent = `${state.depth}%`;
}

function setSection(name){
  state.section = name;
  $$('.menu-item').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  activeSection.textContent = name;
  setStatus(`PS BÄR · ${name}`);
}

function setExpression(name){
  state.expression = name;
  $$('.face-tile').forEach(b => b.classList.toggle('active', b.dataset.expression === name));
  bearRig.className = bearRig.className.replace(/\bexpr-\S+/g,'').trim();
  if (name !== 'normal') bearRig.classList.add(`expr-${name}`);
  const labels={normal:'Normal',happy:'Fröhlich',sad:'Traurig',surprised:'Überrascht',angry:'Wütend',wink:'Zwinkern',smile:'Lächeln',think:'Denken'};
  setStatus(`PS BÄR · ${labels[name] || name}`);
}

function setAnimation(name){
  state.animation = name;
  $$('.anim-tile').forEach(b => b.classList.toggle('active', b.dataset.animation === name));
  [...bearRig.classList].filter(c => c.startsWith('anim-')).forEach(c => bearRig.classList.remove(c));
  bearRig.classList.add(`anim-${name}`);
  const labels={idle:'Idle',wave:'Winken',walk:'Laufen',dance:'Tanzen',sit:'Sitzen',talk:'Sprechen'};
  setStatus(`PS BÄR · ${labels[name] || name}`);
}

function setPose(name){
  state.pose = name;
  $$('.pose-chip').forEach(b => b.classList.toggle('active', b.dataset.pose === name));
  setStatus(`Pose · ${name}`);
}

$$('.menu-item').forEach(b => b.addEventListener('click',()=>setSection(b.dataset.section)));
$$('.face-tile').forEach(b => b.addEventListener('click',()=>setExpression(b.dataset.expression)));
$$('.anim-tile').forEach(b => b.addEventListener('click',()=>setAnimation(b.dataset.animation)));
$$('.pose-chip').forEach(b => b.addEventListener('click',()=>setPose(b.dataset.pose)));

sizeRange.addEventListener('input',()=>{state.size=Number(sizeRange.value);applyTransform();});
yRange.addEventListener('input',()=>{state.y=Number(yRange.value);applyTransform();});
xRange.addEventListener('input',()=>{state.x=Number(xRange.value);applyTransform();});
depthRange.addEventListener('input',()=>{state.depth=Number(depthRange.value);applyTransform();});

$$('[data-nudge]').forEach(btn => btn.addEventListener('click',()=>{
  const d=btn.dataset.nudge;
  if(d==='up') state.y=Math.min(18,state.y+2);
  if(d==='down') state.y=Math.max(-18,state.y-2);
  if(d==='left') state.x=Math.max(-18,state.x-2);
  if(d==='right') state.x=Math.min(18,state.x+2);
  xRange.value=state.x; yRange.value=state.y; applyTransform();
}));

$('#saveBear').addEventListener('click',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  setStatus('PS BÄR gespeichert 💾');
});
$('#loadBear').addEventListener('click',()=>{
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(saved) Object.assign(state,saved);
    syncUi(); setStatus(saved?'PS BÄR geladen':'Noch kein gespeicherter Bär');
  }catch{setStatus('Speicherstand konnte nicht geladen werden');}
});
$('#resetBear').addEventListener('click',()=>{
  Object.assign(state,{section:'Aussehen',expression:'normal',animation:'idle',pose:'head',size:100,x:0,y:0,depth:0});
  localStorage.removeItem(STORAGE_KEY); syncUi(); setStatus('PS BÄR Original wiederhergestellt');
});

function syncUi(){
  sizeRange.value=state.size; xRange.value=state.x; yRange.value=state.y; depthRange.value=state.depth;
  setSection(state.section); setExpression(state.expression); setAnimation(state.animation); setPose(state.pose); applyTransform();
}

async function ensureAnalyser(){
  if(audioCtx) return;
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  analyser=audioCtx.createAnalyser(); analyser.fftSize=256;
  freq=new Uint8Array(analyser.frequencyBinCount);
  source=audioCtx.createMediaElementSource(voiceAudio); source.connect(analyser); analyser.connect(audioCtx.destination);
}

voiceFile.addEventListener('change',async()=>{
  const file=voiceFile.files?.[0]; if(!file)return;
  if(audioUrl)URL.revokeObjectURL(audioUrl);
  audioUrl=URL.createObjectURL(file); voiceAudio.src=audioUrl;
  voiceName.textContent=file.name; playVoice.disabled=false; stopVoice.disabled=false;
  await ensureAnalyser(); setStatus(`Sprachclip geladen · ${file.name}`);
});
playVoice.addEventListener('click',async()=>{
  try{await ensureAnalyser();if(audioCtx.state==='suspended')await audioCtx.resume();await voiceAudio.play();setAnimation('talk');setStatus('PS BÄR spricht 🗣️');}
  catch(e){console.error(e);setStatus('Audio konnte nicht gestartet werden');}
});
stopVoice.addEventListener('click',()=>{voiceAudio.pause();voiceAudio.currentTime=0;meterFill.style.width='0%';setAnimation('idle');});
voiceAudio.addEventListener('ended',()=>{meterFill.style.width='0%';setAnimation('idle');setStatus('PS BÄR bereit');});

function tick(){
  requestAnimationFrame(tick);
  if(analyser&&!voiceAudio.paused){
    analyser.getByteFrequencyData(freq);let sum=0;for(const v of freq)sum+=v;
    const level=Math.min(1,(sum/freq.length)/115);meterFill.style.width=`${Math.round(level*100)}%`;
    bearRig.style.filter=`brightness(${1+level*.05}) saturate(${1+level*.08})`;
  }else if(state.expression==='normal'){bearRig.style.filter='';}
  voiceTime.textContent=`${fmt(voiceAudio.currentTime)} / ${fmt(voiceAudio.duration)}`;
}
requestAnimationFrame(tick);

syncUi();