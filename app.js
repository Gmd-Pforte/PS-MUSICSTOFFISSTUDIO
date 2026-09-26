(()=>{
  const D=window.PROMPTER_DATA;
  const $=id=>document.getElementById(id);
  const state={bpm:96,intensity:7,custom:'',...D.presets['PS Dark Rock']};

  const builder=$('builder');
  const output=$('promptOutput');
  const counter=$('counter');
  const badge=$('statusBadge');
  const warnings=$('warnings');
  const presetSelect=$('presetSelect');

  function optionById(cat,id){return cat.options.find(o=>o.id===id)||cat.options[0]}

  function makeSelect(cat){
    const card=document.createElement('div');card.className='field-card';
    const label=document.createElement('label');label.htmlFor=cat.id;label.textContent=cat.label;
    const select=document.createElement('select');select.id=cat.id;
    cat.options.forEach(o=>{const el=document.createElement('option');el.value=o.id;el.textContent=o.label;select.appendChild(el)});
    select.value=state[cat.id]||cat.options[0].id;
    select.addEventListener('change',()=>{state[cat.id]=select.value;renderPrompt()});
    card.append(label,select);builder.appendChild(card);
  }

  function makeRange(id,label,min,max,step){
    const card=document.createElement('div');card.className='field-card';
    card.innerHTML=`<label for="${id}">${label}</label><div class="range-line"><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${state[id]}"><span id="${id}Value" class="range-value">${state[id]}</span></div>`;
    builder.appendChild(card);
    $(id).addEventListener('input',e=>{state[id]=Number(e.target.value);$(`${id}Value`).textContent=e.target.value;renderPrompt()});
  }

  function makeCustom(){
    const card=document.createElement('div');card.className='field-card full';
    card.innerHTML='<label for="custom">Eigene Idee / Besonderheit</label><input id="custom" maxlength="500" placeholder="z. B. letzte Hook fast a cappella, neue Melodie je Generation"><p class="hint">Optional. Wird in den fertigen Prompt integriert.</p>';
    builder.appendChild(card);
    $('custom').addEventListener('input',e=>{state.custom=e.target.value.trim();renderPrompt()});
  }

  function intensityText(n){
    if(n<=3)return 'low emotional intensity, restrained dynamics';
    if(n<=6)return 'moderate emotional intensity with natural dynamic growth';
    if(n<=8)return 'high emotional intensity, controlled and believable';
    return 'very high emotional intensity, near-breaking at peaks but never uncontrolled';
  }

  function getClauses(){
    const clauses=[];
    const genre=D.categories.find(c=>c.id==='genre');
    const mood=D.categories.find(c=>c.id==='mood');
    const voice=D.categories.find(c=>c.id==='voice');
    const delivery=D.categories.find(c=>c.id==='delivery');
    const instr=D.categories.find(c=>c.id==='instrumentation');
    const arr=D.categories.find(c=>c.id==='arrangement');
    const prod=D.categories.find(c=>c.id==='production');
    const neg=D.categories.find(c=>c.id==='negative');
    clauses.push(`${optionById(genre,state.genre).prompt}, ${state.bpm} BPM`);
    clauses.push(optionById(mood,state.mood).prompt);
    const voiceOpt=optionById(voice,state.voice);
    clauses.push(voiceOpt.prompt);
    if(state.voice!=='novocal'&&state.delivery!=='none')clauses.push(optionById(delivery,state.delivery).prompt);
    clauses.push(optionById(instr,state.instrumentation).prompt);
    clauses.push(optionById(arr,state.arrangement).prompt);
    clauses.push(optionById(prod,state.production).prompt);
    clauses.push(intensityText(state.intensity));
    const negative=optionById(neg,state.negative).prompt;if(negative)clauses.push(negative);
    if(state.custom)clauses.push(state.custom);
    return clauses.filter(Boolean);
  }

  function normalize(text){return text.replace(/\s+/g,' ').replace(/\s+,/g,',').replace(/,{2,}/g,',').trim()}

  function buildPrompt(){
    let text=normalize(getClauses().join('. '));
    if(!/[.!?]$/.test(text))text+='.';
    return text;
  }

  function compact(text){
    const replacements=[
      [/emotionally /gi,''],[/with a small but growing sense of /gi,'with '],[/natural dynamic growth/gi,'dynamic growth'],[/very high emotional intensity/gi,'extreme emotional intensity'],[/subtle dark ambience/gi,'dark ambience'],[/human imperfections/gi,'human feel'],[/controlled and believable/gi,'controlled'],[/adult male vocal/gi,'male vocal'],[/electric guitars/gi,'guitars']
    ];
    let t=text;replacements.forEach(([a,b])=>t=t.replace(a,b));return normalize(t);
  }

  function conflictMessages(){
    const active=new Set(Object.entries(state).map(([k,v])=>`${k}:${v}`));
    return D.conflicts.filter(r=>Object.entries(r.when).every(([k,v])=>state[k]===v)&&r.against.some(x=>active.has(x))).map(r=>r.message);
  }

  function renderPrompt(forceCompact=false){
    let text=buildPrompt();if(forceCompact)text=compact(text);
    const msgs=conflictMessages();
    if(text.length>D.maxChars)msgs.push(`Prompt ist ${text.length-D.maxChars} Zeichen zu lang. Bitte Bausteine kürzen oder „Optimieren“ nutzen.`);
    output.value=text;
    counter.textContent=`${text.length} / ${D.maxChars}`;
    const ok=text.length<=D.maxChars&&msgs.length===0;
    badge.textContent=text.length<=D.maxChars?'V6 LÄNGE OK':'ZU LANG';
    badge.className=`badge ${text.length<=D.maxChars?'ok':'bad'}`;
    warnings.textContent=msgs.join(' • ');
    saveState();
  }

  function syncControls(){
    D.categories.forEach(cat=>{const el=$(cat.id);if(el)el.value=state[cat.id]||cat.options[0].id});
    ['bpm','intensity'].forEach(id=>{if($(id)){$(id).value=state[id];$(`${id}Value`).textContent=state[id]}});
    if($('custom'))$('custom').value=state.custom||'';
  }

  function randomize(){
    D.categories.forEach(cat=>{const pool=cat.options;state[cat.id]=pool[Math.floor(Math.random()*pool.length)].id});
    state.bpm=Math.round((60+Math.random()*72)/2)*2;state.intensity=3+Math.floor(Math.random()*8);
    syncControls();renderPrompt();
  }

  function allPresets(){
    let custom={};try{custom=JSON.parse(localStorage.getItem('psPrompterPresets')||'{}')}catch{}
    return {...D.presets,...custom};
  }

  function refreshPresets(){
    presetSelect.innerHTML='';Object.keys(allPresets()).forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;presetSelect.appendChild(o)});
  }

  function loadPreset(name){const p=allPresets()[name];if(!p)return;Object.assign(state,p);state.custom=p.custom||'';syncControls();renderPrompt()}
  function savePreset(){
    const name=prompt('Name für das Preset:');if(!name)return;
    let custom={};try{custom=JSON.parse(localStorage.getItem('psPrompterPresets')||'{}')}catch{}
    custom[name]={...state};localStorage.setItem('psPrompterPresets',JSON.stringify(custom));refreshPresets();presetSelect.value=name;
  }
  function saveState(){localStorage.setItem('psPrompterState',JSON.stringify(state))}
  function restoreState(){try{Object.assign(state,JSON.parse(localStorage.getItem('psPrompterState')||'{}'))}catch{}}

  D.categories.forEach(makeSelect);makeRange('bpm','Tempo / BPM',50,180,1);makeRange('intensity','Emotion / Intensität',1,10,1);makeCustom();
  restoreState();syncControls();refreshPresets();renderPrompt();

  $('randomizeBtn').addEventListener('click',randomize);
  $('optimizeBtn').addEventListener('click',()=>renderPrompt(true));
  $('savePresetBtn').addEventListener('click',savePreset);
  $('loadPresetBtn').addEventListener('click',()=>loadPreset(presetSelect.value));
  $('copyBtn').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(output.value);$('copyBtn').textContent='✅ Kopiert';setTimeout(()=>$('copyBtn').textContent='📋 Kopieren',1200)}catch{output.select();document.execCommand('copy')}
  });
  output.addEventListener('input',()=>{counter.textContent=`${output.value.length} / ${D.maxChars}`;badge.textContent=output.value.length<=D.maxChars?'V6 LÄNGE OK':'ZU LANG';badge.className=`badge ${output.value.length<=D.maxChars?'ok':'bad'}`});
})();
