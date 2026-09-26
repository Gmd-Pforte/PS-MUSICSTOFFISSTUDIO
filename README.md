# PS AI MUSIC – Song Prompter V6

Modularer Prompt-Builder für Suno v6 mit großer kombinierbarer Musik-Datenbasis.

## Aktueller Umfang

- 621 Prompt-Bausteine
- 33 Kategorien
- 12 Master-Presets
- 6 große Bereiche: Stil & Richtung, Stimme & Gesang, Instrumente, Rhythmus & Energie, Songaufbau, Produktion & Sound
- Genres von Rock, Metal, Hip-Hop, R&B und Soul über House, Techno, Trance, DnB, Ambient und Synthwave bis Jazz, Folk, Country, World, Orchestral, Cinematic und Experimental
- einzelne Bausteine für Gitarren, Piano/Keys, Streicher, Bass, Drums, Percussion, Synths, Bläser und World-Instrumente
- Vocal-Typen, Stimmcharaktere, Gesangsarten und Backing-Vocals/Chöre
- Intro, Strophe, Pre-Chorus, Refrain, Bridge, Breakdown/Drop, Outro und Gesamt-Dynamik
- Produktionsstil, Raum/Reverb, Mix, Sounddesign und Ausschlüsse

## V6-Logik

- Live-Prompt mit 1000-Zeichen-Kontrolle
- intelligenter V6-Optimierer mit Prioritäten
- wichtige Angaben wie Genre, Stimme, Stimmung, Ausschlüsse und eigene Wünsche werden möglichst geschützt
- niedrig priorisierte Detailbausteine werden bei Überlänge zuerst entfernt
- Konfliktwarnungen für widersprüchliche Kombinationen
- Instrumental-Modus überspringt Gesangsdetails automatisch
- Smart-Variation erzeugt neue Kombinationen, ohne jede optionale Kategorie zwangsläufig zu aktivieren

## Weitere Funktionen

- BPM 40–220
- Emotion/Intensität 1–10
- eigene Zusatzanweisung
- eigene Presets im Browser speichern
- responsive Oberfläche für Handy und Desktop
- einklappbare Kategorien für den großen Datensatz
- kein Backend und kein Build-Schritt nötig

## Technik

Reine HTML/CSS/JavaScript-Web-App. Sie kann direkt über GitHub Pages oder jeden statischen Webserver ausgeliefert werden.

## Erweiterung

Die Oberfläche wird komplett aus `data.js` erzeugt. Neue Genres, Instrumente, Stimmen, Produktionsarten oder Regeln können deshalb ergänzt werden, ohne die Oberfläche neu zu programmieren.
