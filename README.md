# PS AI MUSIC – Song Prompter V6

Modularer Prompt-Builder für Suno v6.

## Enthalten

- kombinierbare Datensätze für Genre, Stimmung, Stimme, Gesangsart, Instrumentierung, Arrangement, Produktion und Ausschlüsse
- BPM- und Intensitätsregler
- Live-Prompt mit 1000-Zeichen-Kontrolle
- einfache Konfliktprüfung
- Prompt-Optimierung
- Zufallsvariationen
- PS-AI-MUSIC-Master-Presets
- eigene Presets im Browser speichern
- eigener Zusatzwunsch pro Prompt
- responsive Oberfläche für Handy und Desktop

## Technik

Reine HTML/CSS/JavaScript-Web-App ohne Backend und ohne Build-Schritt. Dadurch kann sie direkt über GitHub Pages oder jeden statischen Webserver ausgeliefert werden.

## Datensätze erweitern

Neue Prompt-Bausteine werden zentral in `data.js` ergänzt. Die Oberfläche erzeugt die Auswahlfelder automatisch aus diesen Datensätzen.

## Ziel

Aus vielen kleinen, kontrollierbaren Musikbausteinen entstehen sehr viele unterschiedliche, dennoch kompakte Suno-v6-Prompts. Die Architektur ist bewusst so angelegt, dass später weitere Stimmen, Genres, Instrumente, Produktionsarten, Kompatibilitätsregeln und Presets ergänzt werden können.
