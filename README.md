# Fernweh

Ein Land, zehn Hinweise, ein Punktekonto. Jeder Hinweis kostet Punkte, und
genau die willst du behalten.

Live: https://schlaufuchs26.github.io/fernweh/

## Wie es läuft

Acht Runden, jede mit einem versteckten Land. Zu Beginn jeder Runde steht nur
der Kontinent da, geschenkt. Aus einem Konto von **1000 Punkten** kaufst du
dir Hinweise: Postkarte, Währung, Flagge, Nationalgericht, Nachbarländer,
Fläche, Einwohner, Export, Verkehr, Steckdose. Alle zehn zusammen kosten 1150,
du kannst dir also nie alles leisten. Ein Tipp ist endgültig; ein falscher
kostet 250 Punkte, vier falsche leeren das Konto und die Runde ist verloren.
Wer richtig rät, behält, was übrig ist.

Nach der Auflösung nennt das Spiel einen Fakt zum Land und zeigt die Hinweise,
die du nicht gekauft hast. So lernt man auch aus einer verlorenen Runde etwas.

## Zwei Wege zum Ziel (mindestens einer ohne Fachwissen)

1. **Die Postkarte lesen; ohne Vorwissen.** Sie ist in der Landessprache und
   -schrift geschrieben. Wer keine Sprache der Welt spricht, erkennt trotzdem
   die Schrift: lateinisch, kyrillisch, arabisch, Devanagari, Hangul, Thai,
   Han. Danach tragen die Sonderzeichen: `¿` und `¡` heißt Spanisch, `ã` und
   `ç` Portugiesisch, `ạ` Vietnamesisch, `ł` und `ę` Polnisch, `ø` Norwegisch
   oder Dänisch. Einstieg: Postkarte kaufen, Schrift bestimmen, dann die
   Sprachgruppe eingrenzen. Die Postkarte ist absichtlich teuer (260) und
   absichtlich mehrdeutig: fünf Länder im Pool schreiben Spanisch, zwei
   Portugiesisch, vier Englisch.
2. **Alltagsspuren; ohne Vorwissen.** Steckdose, Verkehr, Währung und
   Nationalgericht sind billig und geografisch eindeutig. Linksverkehr plus
   Typ G deutet auf ein ehemaliges britisches Land, Typ A/B mit 127 V auf
   Nordamerika, Typ I auf Australien, Argentinien oder China. Ein Gericht mit
   Mais, Bohnen und Kakao führt nach Amerika, Fisch mit Skyr nach Island.
   Einstieg: zwei, drei billige Hinweise kaufen und Kontinent plus Region
   festnageln, statt sofort zu raten.
3. **Zahlen und Handel; Fachwissen, aber nicht nötig.** Nachbarzahl, Fläche,
   Einwohner und Exporte beschreiben eine Volkswirtschaft. Wer weiß, dass
   Chile Kupfer und Neuseeland Milchpulver exportiert, spart sich die
   Postkarte. Diese Route ist die schnellste für Geografie-Kenner und die
   langsamste für alle anderen.

Die vierte Route ist das Konto selbst: Du musst nicht wissen, welches Land es
ist, sondern nur, wann du sicher genug bist. Ein Sieg mit 300 übrigen Punkten
ist besser als ein Sieg mit 100.

## Was das Spiel nicht ist

- Keine Street-View-Kopie: es gibt keine Karte, keinen Pin, kein Foto.
- Kein Globle oder Countryle: keine Nähe-Rückmeldung, kein Raten ohne Kosten.
- Kein Quiz: Hinweise haben Preise, und falsch raten kostet. Die Entscheidung
  ist, wann man aufhört zu kaufen.

Die Flagge wird als Text beschrieben, nicht gezeichnet. Ein gezeichnetes Bild
wäre für jeden Flaggenkenner die Antwort in einem Blick; die Beschreibung
zwingt zum Übersetzen und lässt die Runde länger offen.

## Daten

36 Länder im Antwortpool, alle Hinweise von Hand geschrieben. Flächen und
Einwohnerzahlen sind gerundet (Stand 2024/25), Steckdosen und
Nationalgerichte sind die landesüblichen, nicht die einzigen. Fehler bitte als
Issue melden; die Datei `src/data/countries.ts` ist die einzige Quelle.

## Entwicklung

```bash
bun install
bun index.html        # Dev-Server
bun test              # Regeln, Daten und Komponenten
bun run checks        # Format, tsc, Biome, Knip, Tests
bun run build         # statisches Bundle nach dist/
bun run test:e2e      # Playwright gegen den Dev-Server
```

Aufbau: `src/data/` hält Hinweise, Länder und die Rate-Liste, `src/game/engine.ts`
die Regeln (reine Funktionen, ohne DOM), `src/components/` die Oberfläche,
`frontend.tsx` den Spielzustand. Gebaut mit Bun, React 19 und TypeScript, ohne
weitere Abhängigkeiten.
