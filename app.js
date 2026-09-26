(()=>{
  const D=window.PROMPTER_DATA;
  const $=id=>document.getElementById(id);
  const state={bpm:96,intensity:7,custom:''};
  const builder=$('builder');
  const output=$('promptOutput');
  const counter=$('counter');
  const badge=$('statusBadge');
  const warnings=$('warnings');
  const presetSelect=$('presetSelect');
  const stats=$('catalogStats');
  const vocalCategoryIds=new Set(['voice','vocalTexture','delivery','backingVocals']);

  function optionById(cat,id){
    return cat.options.find(o=>o.id===id)||cat.options[0];
  }

  function isNoneOption(opt){
    return !opt || !opt.prompt || opt.id==='none';
  }

  function baseState(){
    const s={bpm:96,intensity:7,custom:''};
    D.categories.forEach(cat=>s[cat.id]=cat.options[0].id);
    Object.assign(s,D.presets['PS Dark Rock']||{});
    return s;
  }

  Object.assign(state,baseState());

  function makeSelect(cat,parent){
    const card=document.createElement('div');
    card.className='field-card';
    const label=document.createElement('label');
    label.htmlFor=cat.id;
    label.textContent=cat.label;
    const select=document.createElement('select');
    select.id=cat.id;
    cat.options.forEach(o=>{
      const el=document.createElement('option');
      el.value=o.id;
      el.textContent=o.label;
      el.title=o.prompt||'';
      select.appendChild(el);
    });
    select.value=state[cat.id]||cat.options[0].id;
    select.addEventListener('change',()=>{
      state[cat.id]=select.value;
      renderPrompt();
    });
    const meta=document.createElement('span');
    meta.className='option-count';
    meta.textContent=`${cat.options.length} Optionen`;
    card.append(label,select,meta);
    parent.appendChild(card);
  }

  function renderSections(){
    builder.innerHTML='';
    D.sections.forEach((sectionName,sectionIndex)=>{
      const detail=document.createElement('details');
      detail.className='category-section';
      detail.open=sectionIndex<2;
      const summary=document.createElement('summary');
      const count=D.categories.filter(c=>c.section===sectionName).reduce((n,c)=>n+c.options.length,0);
      summary.innerHTML=`<span>${sectionName}</span><small>${count} Bausteine</small>`;
      const grid=document.createElement('div');
      grid.className='section-grid';
      D.categories.filter(c=>c.section===sectionName).forEach(cat=>makeSelect(cat,grid));
      detail.append(summary,grid);
      builder.appendChild(detail);
    });
  }

  function makeRange(id,label,min,max,step){
    const card=document.createElement('div');
    card.className='field-card utility-card';
    card.innerHTML=`<label for="${id}">${label}</label><div class="range-line"><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${state[id]}"><span id="${id}Value" class="range-value">${state[id]}</span></div>`;
    $('utilityControls').appendChild(card);
    $(id).addEventListener('input',e=>{
      state[id]=Number(e.target.value);
      $(`${id}Value`).textContent=e.target.value;
      renderPrompt();
    });
  }

  function makeCustom(){
    const card=document.createElement('div');
    card.className='field-card utility-card full';
    card.innerHTML='<label for="custom">Eigene Idee / Besonderheit</label><input id="custom" maxlength="500" placeholder="z. B. letzte Hook fast a cappella, neue Melodie je Generation"><p class="hint">Optional. Hohe Priorität beim Optimieren.</p>';
    $('utilityControls').appendChild(card);
    $('custom').addEventListener('input',e=>{
      state.custom=e.target.value.trim();
      renderPrompt();
    });
  }

  function intensityText(n){
    if(n<=2)return 'very restrained emotional intensity';
    if(n<=4)return 'low emotional intensity with subtle dynamics';
    if(n<=6)return 'moderate emotional intensity with natural growth';
    if(n<=8)return 'high emotional intensity, controlled and believable';
    return 'extreme emotional intensity at peaks, still controlled';
  }

  function selectedItems(){
    const items=[];
    D.categories.forEach((cat,index)=>{
      const opt=optionById(cat,state[cat.id]);
      if(isNoneOption(opt))return;
      if(state.voice==='novocal' && vocalCategoryIds.has(cat.id) && cat.id!=='voice')return;
      let prompt=opt.prompt;
      if(cat.id==='genre')prompt=`${prompt}, ${state.bpm} BPM`;
      items.push({catId:cat.id,prompt,priority:opt.priority??5,index});
    });
    items.push({catId:'intensity',prompt:intensityText(state.intensity),priority:8,index:900});
    if(state.custom)items.push({catId:'custom',prompt:state.custom,priority:10,index:901});
    return items.filter(x=>x.prompt);
  }

  function normalize(text){
    return text.replace(/\s+/g,' ').replace(/\s+,/g,',').replace(/,{2,}/g,',').replace(/\.\s*\./g,'.').trim();
  }

  const replacements=[
    [/emotionally /gi,''],
    [/with a small growing sense of /gi,'with '],
    [/with natural phrasing/gi,'naturally phrased'],
    [/controlled and believable/gi,'controlled'],
    [/adult male vocal/gi,'male vocal'],
    [/adult German male narrator/gi,'German male narrator'],
    [/close-recorded /gi,'close '],
    [/subtle emotional /gi,'emotional '],
    [/very soft distant /gi,'distant '],
    [/restrained /gi,''],
    [/modern /gi,''],
    [/expressive /gi,''],
    [/natural /gi,''],
    [/production and arrangement/gi,'production'],
    [/with strong front-to-back depth/gi,'with depth'],
    [/large dynamic range/gi,'wide dynamics'],
    [/instrumental only, no vocals/gi,'instrumental, no vocals']
  ];

  function compactText(text){
    let t=text;
    replacements.forEach(([a,b])=>t=t.replace(a,b));
    return normalize(t);
  }

  function joinItems(items){
    let text=normalize(items.sort((a,b)=>a.index-b.index).map(x=>x.prompt).join('. '));
    if(text && !/[.!?]$/.test(text))text+='.';
    return text;
  }

  function optimizeToLimit(items){
    let kept=[...items];
    let text=compactText(joinItems(kept));
    if(text.length<=D.maxChars)return {text,removed:[]};

    const protectedIds=new Set(['genre','mood','voice','delivery','negative','custom']);
    const removable=kept
      .filter(x=>!protectedIds.has(x.catId))
      .sort((a,b)=>(a.priority-b.priority)||(b.index-a.index));
    const removed=[];
    for(const item of removable){
      kept=kept.filter(x=>x!==item);
      removed.push(item.catId);
      text=compactText(joinItems(kept));
      if(text.length<=D.maxChars)break;
    }

    if(text.length>D.maxChars){
      const fallback=kept
        .filter(x=>!['genre','voice','custom'].includes(x.catId))
        .sort((a,b)=>(a.priority-b.priority)||(b.index-a.index));
      for(const item of fallback){
        kept=kept.filter(x=>x!==item);
        if(!removed.includes(item.catId))removed.push(item.catId);
        text=compactText(joinItems(kept));
        if(text.length<=D.maxChars)break;
      }
    }

    if(text.length>D.maxChars && state.custom){
      const overflow=text.length-D.maxChars;
      const customItem=kept.find(x=>x.catId==='custom');
      if(customItem && customItem.prompt.length>overflow+24){
        customItem.prompt=customItem.prompt.slice(0,Math.max(24,customItem.prompt.length-overflow-4)).trim()+'…';
        text=compactText(joinItems(kept));
      }
    }
    return {text,removed};
  }

  function activeTokens(){
    return new Set(D.categories.map(c=>`${c.id}:${state[c.id]}`));
  }

  function conflictMessages(){
    const active=activeTokens();
    const messages=[];
    D.conflicts.forEach(rule=>{
      const matches=Object.entries(rule.when||{}).every(([k,v])=>state[k]===v);
      if(!matches)return;
      const valueHit=(rule.againstValues||[]).some(v=>active.has(v));
      const prefixHit=(rule.againstPrefixes||[]).some(prefix=>{
        const [catId]=prefix.split(':');
        const cat=D.categories.find(c=>c.id===catId);
        if(!cat)return false;
        const opt=optionById(cat,state[catId]);
        return !isNoneOption(opt);
      });
      if(valueHit||prefixHit)messages.push(rule.message);
    });
    return messages;
  }

  function renderPrompt(forceOptimize=false){
    const items=selectedItems();
    let text=joinItems(items);
    let removed=[];
    if(forceOptimize){
      const result=optimizeToLimit(items);
      text=result.text;
      removed=result.removed;
    }
    const msgs=conflictMessages();
    if(text.length>D.maxChars && !forceOptimize){
      msgs.push(`Prompt ist ${text.length-D.maxChars} Zeichen zu lang – „Optimieren“ kürzt intelligent nach Priorität.`);
    }
    if(removed.length){
      msgs.push(`${removed.length} niedrig priorisierte Bausteine wurden für das 1000-Zeichen-Limit ausgelassen.`);
    }
    output.value=text;
    counter.textContent=`${text.length} / ${D.maxChars}`;
    badge.textContent=text.length<=D.maxChars?'V6 LÄNGE OK':'ZU LANG';
    badge.className=`badge ${text.length<=D.maxChars?'ok':'bad'}`;
    warnings.textContent=msgs.join(' • ');
    saveState();
  }

  function syncControls(){
    D.categories.forEach(cat=>{
      const el=$(cat.id);
      if(el)el.value=cat.options.some(o=>o.id===state[cat.id])?state[cat.id]:cat.options[0].id;
    });
    ['bpm','intensity'].forEach(id=>{
      if($(id)){
        $(id).value=state[id];
        $(`${id}Value`).textContent=state[id];
      }
    });
    if($('custom'))$('custom').value=state.custom||'';
  }

  function smartRandomize(){
    D.categories.forEach(cat=>{
      const noneOpt=cat.options.find(o=>o.id==='none');
      const core=['genre','style','mood','voice','delivery','arrangement','production','negative'].includes(cat.id);
      if(!core && noneOpt && Math.random()<0.58){
        state[cat.id]=noneOpt.id;
        return;
      }
      const pool=cat.options.filter(o=>o.id!=='none');
      state[cat.id]=pool[Math.floor(Math.random()*pool.length)].id;
    });
    if(state.voice==='novocal'){
      ['vocalTexture','delivery','backingVocals'].forEach(id=>{
        const cat=D.categories.find(c=>c.id===id);
        if(cat)state[id]=(cat.options.find(o=>o.id==='none')||cat.options[0]).id;
      });
    }
    state.bpm=Math.round(55+Math.random()*120);
    state.intensity=3+Math.floor(Math.random()*8);
    syncControls();
    renderPrompt(true);
  }

  function allPresets(){
    let custom={};
    try{custom=JSON.parse(localStorage.getItem('psPrompterPresets')||'{}')}catch{}
    return {...D.presets,...custom};
  }

  function refreshPresets(){
    presetSelect.innerHTML='';
    Object.keys(allPresets()).forEach(name=>{
      const o=document.createElement('option');
      o.value=name;
      o.textContent=name;
      presetSelect.appendChild(o);
    });
  }

  function loadPreset(name){
    const p=allPresets()[name];
    if(!p)return;
    Object.assign(state,baseState(),p);
    state.custom=p.custom||'';
    syncControls();
    renderPrompt(true);
  }

  function savePreset(){
    const name=prompt('Name für das Preset:');
    if(!name)return;
    let custom={};
    try{custom=JSON.parse(localStorage.getItem('psPrompterPresets')||'{}')}catch{}
    custom[name]={...state};
    localStorage.setItem('psPrompterPresets',JSON.stringify(custom));
    refreshPresets();
    presetSelect.value=name;
  }

  function resetAll(){
    Object.assign(state,baseState());
    syncControls();
    renderPrompt();
  }

  function saveState(){
    localStorage.setItem('psPrompterState',JSON.stringify(state));
  }

  function restoreState(){
    try{
      const restored=JSON.parse(localStorage.getItem('psPrompterState')||'{}');
      Object.assign(state,restored);
    }catch{}
  }

  restoreState();
  renderSections();
  makeRange('bpm','Tempo / BPM',40,220,1);
  makeRange('intensity','Emotion / Intensität',1,10,1);
  makeCustom();
  syncControls();
  refreshPresets();
  if(stats){
    const optionCount=D.categories.reduce((n,c)=>n+c.options.length,0);
    stats.textContent=`${optionCount} Bausteine · ${D.categories.length} Kategorien · ${Object.keys(D.presets).length} Master-Presets`;
  }
  renderPrompt();

  $('randomizeBtn').addEventListener('click',smartRandomize);
  $('optimizeBtn').addEventListener('click',()=>renderPrompt(true));
  $('resetBtn').addEventListener('click',resetAll);
  $('savePresetBtn').addEventListener('click',savePreset);
  $('loadPresetBtn').addEventListener('click',()=>loadPreset(presetSelect.value));
  $('copyBtn').addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(output.value);
      $('copyBtn').textContent='✅ Kopiert';
      setTimeout(()=>$('copyBtn').textContent='📋 Kopieren',1200);
    }catch{
      output.select();
      document.execCommand('copy');
    }
  });
  output.addEventListener('input',()=>{
    counter.textContent=`${output.value.length} / ${D.maxChars}`;
    badge.textContent=output.value.length<=D.maxChars?'V6 LÄNGE OK':'ZU LANG';
    badge.className=`badge ${output.value.length<=D.maxChars?'ok':'bad'}`;
  });
})();
