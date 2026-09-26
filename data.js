window.PROMPTER_DATA={
  maxChars:1000,
  categories:[
    {id:'genre',label:'Genre / Basis',options:[
      ['altrock','Alternative Rock','emotional alternative rock'],['darktechno','Dark Techno','dark industrial techno'],['minimaltechno','Minimal Techno','minimal hypnotic techno'],['sadhh','Deep Sad Hip-Hop','deep melancholic hip-hop'],['piano','Solo Piano','intimate solo piano ballad'],['metal','Alternative Metal','dark alternative metal'],['cinematic','Cinematic','cinematic emotional score'],['lofiJazz','Lo-fi Jazz Ballad','lo-fi jazz ballad'],['artpop','Art Pop','modern dark art-pop'],['powerballad','Power Ballad','epic emotional power ballad']
    ]},
    {id:'mood',label:'Stimmung',options:[
      ['sad','Traurig','deeply melancholic and vulnerable'],['grief','Trauer','grief-stricken, intimate and restrained'],['hope','Traurig + Hoffnung','melancholic with a small but growing sense of hope'],['dark','Dunkel','dark, tense and emotionally heavy'],['empty','Leer','emotionally numb, sparse and hollow'],['angry','Wütend','controlled anger with rising emotional pressure'],['nostalgic','Nostalgisch','warm, bittersweet and nostalgic'],['romantic','Romantisch','tender, intimate and sincere'],['panic','Panik / Unruhe','anxious, claustrophobic and increasingly urgent'],['uplifting','Aufbauend','emotional, resilient and gradually uplifting']
    ]},
    {id:'voice',label:'Stimme',options:[
      ['deepmale','Tiefe Männerstimme','deep adult male vocal, warm and close-mic'],['fragilemale','Fragile Männerstimme','deep male vocal, fragile, intimate, audible breath and subtle breaks'],['roughmale','Raue Männerstimme','low gritty male vocal, emotional but controlled'],['cleanmale','Klare Männerstimme','adult male vocal, warm, clean and expressive'],['powermale','Power Männerstimme','powerful male lead, full chest voice with emotional cracks'],['female','Warme Frauenstimme','warm intimate female vocal, natural and expressive'],['duetmm','2 Männerstimmen','two contrasting male leads, one deep and warm, one brighter and powerful'],['duetmf','Mann + Frau','emotional male and female duet with distinct voices'],['narrator','Erzähler','adult German male narrator, warm, clean, steady distance and volume'],['novocal','Instrumental','instrumental only, no vocals']
    ]},
    {id:'delivery',label:'Gesangsart',options:[
      ['sung','Emotional gesungen','emotionally sung, natural phrasing, never over-performed'],['cracked','Gebrochener Hook','restrained verses, cracked sung chorus, never screamed'],['rapsing','Rap + Gesang','intimate rhythmic rap verses with a softly sung emotional hook'],['spoken','Spoken / Erzählt','spoken performance, clear diction, natural pauses'],['power','Power Gesang','controlled power vocal with strong dynamic lift in the chorus'],['whisperless','Intim ohne Flüstern','intimate delivery with audible breath but no whispering'],['raw','Roh / menschlich','raw human performance with small imperfections and dynamic variation'],['chant','Fragmentiert','minimal fragmented vocal phrases used rhythmically'],['none','Keine Vorgabe','natural vocal delivery']
    ]},
    {id:'instrumentation',label:'Instrumentierung',options:[
      ['pianostrings','Piano + Streicher','dark piano, low cello and restrained strings'],['rockband','Rockband','clean-to-gritty electric guitars, warm bass and punchy live drums'],['heavyguitar','Tiefe Gitarren','drop-tuned guitars, heavy bass and tight live drums'],['technoindustrial','Industrial Techno','deep warehouse kick, rolling sub, metallic percussion and dark synth pulses'],['minimalmachine','Minimal Maschine','dry kick, repetitive bass loop, metallic percussion, mechanical impulses, almost no melody'],['hiphop','Sad Hip-Hop','tragic piano texture, warm 808, dry snare and sparse atmosphere'],['pianosolo','Nur Klavier','close-recorded concert grand piano only'],['guitarvoice','Gitarre + Stimme','single intimate guitar with lots of space around the vocal'],['jazz','Jazz klein','felt piano, tenor sax, upright bass and brushes'],['cinematic','Cinematic Hybrid','piano, low strings, distant impacts and restrained cinematic textures']
    ]},
    {id:'arrangement',label:'Song-Dynamik',options:[
      ['slowbuild','Langsamer Aufbau','start sparse and intimate, build gradually into a wide final chorus'],['direct','Direkter Einstieg','start immediately with the core groove and vocal, no long intro'],['quietbig','Ruhig → groß','small verses, rising pre-chorus, powerful wide chorus'],['breakdown','Mit Breakdown','steady build, tense breakdown, then a larger final return'],['minimal','Konstant minimal','keep the arrangement minimal, repetitive and hypnotic'],['cinematicarc','Cineastischer Bogen','fragile opening, growing middle, emotional climax, quiet release'],['rawlive','Live-Dynamik','organic band dynamics, natural pauses and imperfect human transitions'],['hookfirst','Hook früh','introduce the main hook early, then deepen the arrangement']
    ]},
    {id:'production',label:'Produktion / Mix',options:[
      ['close','Close Mic','close-mic vocal, dry center image, subtle dark ambience'],['raw','Roh','raw organic production, human imperfections, no over-polish'],['wide','Breit','wide chorus, focused verses, strong front-to-back depth'],['darkstudio','Dunkles Studio','dark modern mix, controlled low end, restrained top end'],['live','Live Feel','natural room feel, live dynamics, minimal vocal processing'],['warehouse','Warehouse','deep club low end, industrial space, dry punch and controlled reverb'],['lofi','Lo-fi','soft saturation, intimate room tone, slightly worn texture'],['cinematic','Cinematic Mix','deep dynamic range, spacious depth, detailed low mids']
    ]},
    {id:'negative',label:'Ausschlüsse',options:[
      ['default','PS AI MUSIC Standard','no autotune, no glossy pop, no festival supersaws, no generic radio-rock polish'],['notrap','Kein Trap','no trap clichés, no rapid hi-hat rolls, no glossy pop'],['noedm','Kein EDM','no festival EDM, no supersaws, no big-room drops'],['norock','Keine Rock-Klischees','no generic radio-rock chords, no arena-rock clichés'],['natural','Natürlich','no autotune, no over-compression, no over-polished vocals'],['minimal','Minimal halten','no unnecessary layers, no bright lead melody, no oversized effects'],['none','Keine Ausschlüsse','']
    ]}
  ],
  presets:{
    'PS Dark Rock':{genre:'altrock',mood:'grief',voice:'fragilemale',delivery:'cracked',instrumentation:'rockband',arrangement:'slowbuild',production:'raw',negative:'default',bpm:92,intensity:8},
    'Dark Techno × Rap Rock':{genre:'darktechno',mood:'dark',voice:'roughmale',delivery:'rapsing',instrumentation:'technoindustrial',arrangement:'breakdown',production:'warehouse',negative:'noedm',bpm:128,intensity:9},
    'Deep Sad Hip-Hop':{genre:'sadhh',mood:'sad',voice:'deepmale',delivery:'rapsing',instrumentation:'hiphop',arrangement:'slowbuild',production:'close',negative:'notrap',bpm:72,intensity:7},
    'Solo Piano':{genre:'piano',mood:'grief',voice:'fragilemale',delivery:'whisperless',instrumentation:'pianosolo',arrangement:'cinematicarc',production:'close',negative:'natural',bpm:64,intensity:6},
    'Minimal Techno':{genre:'minimaltechno',mood:'dark',voice:'novocal',delivery:'none',instrumentation:'minimalmachine',arrangement:'minimal',production:'warehouse',negative:'minimal',bpm:130,intensity:8},
    'Power Ballad':{genre:'powerballad',mood:'hope',voice:'powermale',delivery:'power',instrumentation:'pianostrings',arrangement:'quietbig',production:'wide',negative:'default',bpm:76,intensity:9}
  },
  conflicts:[
    {when:{voice:'novocal'},against:['delivery:spoken','delivery:rapsing','delivery:power','delivery:cracked'],message:'Instrumental gewählt: Gesangsart wird ignoriert.'},
    {when:{instrumentation:'pianosolo'},against:['genre:darktechno','genre:minimaltechno'],message:'Nur Klavier kollidiert mit Techno-Basis.'},
    {when:{arrangement:'minimal'},against:['production:wide'],message:'Minimal-Arrangement und extrem breiter Mix können sich widersprechen.'}
  ]
};

window.PROMPTER_DATA.categories=window.PROMPTER_DATA.categories.map(c=>({...c,options:c.options.map(o=>({id:o[0],label:o[1],prompt:o[2]}))}));
