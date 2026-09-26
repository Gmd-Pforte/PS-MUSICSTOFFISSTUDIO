# PS MUSIC STOFFIS STUDIO

3D-Studio für die **Stoffis-Serie von PS AI MUSIC**.

## Character 01 – PS BÄR

PS BÄR wird ab jetzt als echtes Produktions-Asset aufgebaut. Die alte prozedurale Kugel-/Box-Figur bleibt nur als technischer Fallback, solange das finale GLB noch nicht im Projekt liegt.

### Produktionsmodell

Zieldatei:

`assets/characters/ps_baer/model/PS_BAER_MASTER.glb`

Sobald diese Datei vorhanden ist, lädt Stoffis Studio automatisch das echte GLB-Modell. Das Android-Projekt packt den kompletten `assets/`-Ordner in die APK.

### Asset-Struktur

```text
assets/characters/ps_baer/
├── MODEL_CONTRACT.md
├── config/
│   └── ps_baer.json
├── model/
│   └── PS_BAER_MASTER.glb
├── reference/
│   ├── front.jpg
│   ├── side.jpg
│   ├── back.jpg
│   └── three_quarter.jpg
└── textures/
```

### High-End-Ziel

- stilisierter hochwertiger Plush-Look
- Master-Proportionen nach der freigegebenen PS-BÄR-Vorlage
- schwarze Cap, rechteckige Brille, schwarzer Hoodie
- PS AI MUSIC Logo als sauberes Hoodie-Material
- PBR-Materialien und mobile Echtzeit-Performance
- Rig für Kopf, Ohren, Augen, Arme, Pfoten, Beine und Kiefer
- Morph Targets für Blinzeln, Emotionen und Visemes
- ElevenLabs-/Audio-Clips als spätere Quelle für Lippen-/Schnauzen-Sync

## Studio-Funktionen

- 3D-Kamera drehen und zoomen
- Audio-Datei vom Handy laden
- Audio-Mund-Sync als Fallback
- vorbereitet für echte Visemes im Master-GLB
- Animation Controller für Idle, Walk, Run, Wave, Look, Sit, Happy, Sad und weitere Clips
- Android-APK-Build über GitHub Actions

## Android

Der aktuelle Build nutzt Hardwarebeschleunigung über WebGL im Android WebView. GPU/CPU/RAM benötigen keine zusätzlichen Android-Berechtigungen. Sprachclips werden über den Android-Dateiauswahldialog geladen.

## Qualitätsprüfung

`scripts/validate_ps_baer_glb.py` prüft ein eingespieltes GLB auf glTF-2.0-Struktur und meldet fehlende bevorzugte Rig-Nodes, Animationen und Gesichtsmorphs. Der Workflow `Validate PS BÄR Master GLB` startet automatisch, sobald das Mastermodell geändert wird.

## Nächster Meilenstein

Das echte `PS_BAER_MASTER.glb` aus den freigegebenen Front-/Side-/Back-/3/4-Referenzen erstellen und anschließend direkt in der Android-App testen.

---

**PS AI MUSIC · STOFFIS STUDIO**
