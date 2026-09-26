const $=(s)=>document.querySelector(s);const $$=(s)=>[...document.querySelectorAll(s)];
const stage=$('#stagePanel'),rig=$('#bearRig'),sheet=$('#studioSheet'),activeSection=$('#activeSection'),status=$('#statusText');
const STORAGE='stoffis.studio.touch.v07';
const state={mode:'move',sheet:'none',x:0,y:0,scale:1,selected:'body',parts:{head:{x:0,y:0,r:0},body:{x:0,y:0,r:0},leftArm:{x:0,y:0,r:0},rightArm:{x:0,y:0,r:0},leftLeg:{x:0,y:0,r:0},rightLeg:{x:0,y:0,r:0}}};
const layerIds={head:'headLayer',body:'bodyLayer',leftArm:'leftArmLayer',rightArm:'rightArmLayer',leftLeg:'leftLegLayer',rightLeg:'rightLegLayer'};
const labels={head:'Kopf',body:'Gesamte Figur',leftArm:'Linker Arm',rightArm:'Rechter Arm',leftLeg:'Linkes Bein',rightLeg:'Rechtes Bein'};
const pointers=new Map();let drag=null,pinch=null,lastTap=0;
function setStatus(t){if(status)status.textContent=t}
function applyView(){rig.style.translate=`${state.x}px ${state.y}px`;rig.style.scale=String(state.scale)}
function layerFor(name){return document.getElementById(layerIds[name]||'')}
function applyPart(name){const el=layerFor(name);if(!el)return;const p=state.parts[name];el.style.setProperty('--pose-x',`${p.x}px`);el.style.setProperty('--pose-y',`${p.y}px`);el.style.setProperty('--pose-r',`${p.r}deg`)}
function applyAll(){applyView();Object.keys(state.parts).forEach(applyPart);syncSelection()}
function syncSelection(){
  $$('.pose-chip').forEach(b=>b.classList.toggle('active',b.dataset.pose===state.selected));
  if(activeSection)activeSection.textContent=labels[state.selected]||'Figur';
}
function setSelected(name){if(!state.parts[name])return;state.selected=name;syncSelection();const btn=document.querySelector(`.pose-chip[data-pose="${name}"]`);if(btn&&!btn.classList.contains('active'))btn.click();setStatus(`Ausgewählt · ${labels[name]}`)}
function setMode(mode){state.mode=mode;$$('[data-touch-mode]').forEach(b=>b.classList.toggle('active',b.dataset.touchMode===mode));setStatus(mode==='pose'?'Pose · Teil direkt anfassen':mode==='zoom'?'Zoom · ziehen oder zwei Finger':'Bühne · Figur bewegen')}
function openSheet(name){
 state.sheet=name;sheet.classList.toggle('open',name!=='none');$$('.sheet-page').forEach(p=>p.classList.toggle('active',p.dataset.page===name));$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.sheet===name||(name==='none'&&b.dataset.sheet==='none')));
}
$$('[data-sheet]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.sheet;openSheet(state.sheet===n&&n!=='none'?'none':n)}));
$$('.sheet-close').forEach(b=>b.addEventListener('click',()=>openSheet('none')));$('#projectButton')?.addEventListener('click',()=>openSheet(state.sheet==='project'?'none':'project'));
$$('[data-touch-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.touchMode)));
$$('.pose-chip').forEach(b=>b.addEventListener('click',()=>setSelected(b.dataset.pose)));
function localPoint(ev){const r=rig.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width*525,y:(ev.clientY-r.top)/r.height*785}}
function hitTest(ev){
 const order=['head','rightArm','leftArm','body','rightLeg','leftLeg'];const pt=localPoint(ev);
 for(const name of order){const el=layerFor(name);const c=el?.querySelector('canvas');if(!c)continue;try{const x=Math.max(0,Math.min(c.width-1,Math.round(pt.x/c.clientWidth*c.width)));const y=Math.max(0,Math.min(c.height-1,Math.round(pt.y/c.clientHeight*c.height)));if(c.getContext('2d').getImageData(x,y,1,1).data[3]>18)return name}catch{}}
 return state.selected;
}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
stage.addEventListener('pointerdown',ev=>{
 if(ev.target.closest('button,.studio-sheet,.bottom-nav,.topbar'))return;stage.setPointerCapture?.(ev.pointerId);pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 const now=Date.now();if(now-lastTap<280){state.x=0;state.y=0;state.scale=1;applyView();setStatus('Ansicht zentriert');lastTap=0;return}lastTap=now;
 if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={d:dist(a,b),scale:state.scale};drag=null;return}
 if(state.mode==='pose'){setSelected(hitTest(ev))}
 drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,startX:state.x,startY:state.y,part:{...state.parts[state.selected]}};
});
stage.addEventListener('pointermove',ev=>{
 if(!pointers.has(ev.pointerId))return;pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 if(pointers.size>=2){const [a,b]=[...pointers.values()];if(!pinch)pinch={d:dist(a,b),scale:state.scale};state.scale=Math.max(.55,Math.min(1.75,pinch.scale*(dist(a,b)/Math.max(1,pinch.d))));applyView();return}
 if(!drag||drag.id!==ev.pointerId)return;const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;
 if(state.mode==='move'){state.x=drag.startX+dx;state.y=drag.startY+dy;applyView()}
 else if(state.mode==='zoom'){state.scale=Math.max(.55,Math.min(1.75,pinch?.scale||state.scale-dy*.003));applyView()}
 else if(state.mode==='pose'){
   const p=state.parts[state.selected];p.x=drag.part.x+dx*.72;p.y=drag.part.y+dy*.72;
   if(state.selected!=='body')p.r=Math.max(-55,Math.min(55,drag.part.r+dx*.18));else p.r=Math.max(-15,Math.min(15,drag.part.r+dx*.06));applyPart(state.selected)
 }
});
function endPointer(ev){pointers.delete(ev.pointerId);if(drag?.id===ev.pointerId)drag=null;if(pointers.size<2)pinch=null}
stage.addEventListener('pointerup',endPointer);stage.addEventListener('pointercancel',endPointer);
$('#saveBear')?.addEventListener('click',()=>{localStorage.setItem(STORAGE,JSON.stringify(state));setStatus('Studio-Stand gespeichert 💾')});
$('#loadBear')?.addEventListener('click',()=>{try{const s=JSON.parse(localStorage.getItem(STORAGE)||'null');if(s){Object.assign(state,s);state.parts={...state.parts,...s.parts};applyAll();setStatus('Studio-Stand geladen')}}catch{}});
$('#resetBear')?.addEventListener('click',()=>{state.x=0;state.y=0;state.scale=1;state.selected='body';Object.keys(state.parts).forEach(k=>state.parts[k]={x:0,y:0,r:0});localStorage.removeItem(STORAGE);applyAll();setStatus('Studio zurückgesetzt')});
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved){Object.assign(state,saved);state.parts={...state.parts,...saved.parts}}}catch{}
setMode('move');openSheet('none');setTimeout(applyAll,120);