# PS BÄR MASTER GLB Contract

`PS_BAER_MASTER.glb` ist das Produktionsmodell für Character 01.

## Optisches Ziel

Das Modell muss die freigegebene PS-BÄR-Vorlage treffen: freundlicher stilisierter Plush-Bär, warmbraunes Fell, große aber natürliche braune Augen, helle Schnauze, schwarze rechteckige Brille, schwarze Baseball-Cap und schwarzer PS-AI-MUSIC-Hoodie.

Keine primitiven Kugel-/Box-Proportionen, kein Plastik-Look und keine Monster-Proportionen.

## Technische Ziele

- Format: GLB / glTF 2.0
- Höhe: ca. 1,10 m im Studio-Koordinatensystem
- Y-Up
- Ziel LOD0: ca. 40k–70k Dreiecke
- Texturen: maximal 2048 px pro Hauptmaterial für die mobile Version
- PBR-Materialien
- Echtzeit-tauglich auf modernem Android

## Rig-Namen

Bevorzugt: `ROOT`, `HIPS`, `SPINE_01`, `SPINE_02`, `CHEST`, `NECK`, `HEAD`, `EAR_L`, `EAR_R`, `EYE_L`, `EYE_R`, `JAW`, `ARM_L`, `PAW_L`, `ARM_R`, `PAW_R`, `LEG_L`, `FOOT_L`, `LEG_R`, `FOOT_R`.

## Morph Targets / Gesicht

Pflichtziel für die Serienversion:

`blink_L`, `blink_R`, `viseme_rest`, `viseme_A`, `viseme_E`, `viseme_I`, `viseme_O`, `viseme_U`, `viseme_MBP`, `viseme_FV`, `viseme_L`, `viseme_WQ`, `viseme_CH`, `mouth_smile`, `mouth_sad`, `brow_happy`, `brow_sad`, `brow_surprised`.

## Animationen

Bevorzugte Clipnamen:

`PSB_Idle_01`, `PSB_Idle_02`, `PSB_Walk`, `PSB_Run`, `PSB_Wave`, `PSB_LookAround`, `PSB_Sit`, `PSB_Happy`, `PSB_Sad`, `PSB_Surprised`, `PSB_Talk_Idle`.

Das Studio kann auch ein GLB ohne alle Clips laden; fehlende Animationen werden einfach nicht abgespielt. Der Vertrag beschreibt das Ziel für die High-End-Produktionsfigur.
