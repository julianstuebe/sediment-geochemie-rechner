# Sediment-Geochemie Rechner

Einfache Webseite zur Berechnung geochemischer Größen aus der Sediment-Geochemie.
Werte in Felder eingeben, Formel berechnen lassen. Stück für stück erweiterbar.

## Start

`index.html` direkt im Browser öffnen — keine Installation, kein Build-Schritt nötig.

## Aufbau

- `index.html` — Grundgerüst der Seite
- `styles.css` — Gestaltung
- `app.js` — Formel-Registry (`sections`) und Rendering-Logik

## Neue Formel hinzufügen

In `app.js` einen neuen Eintrag in `sections` anlegen (neue Sektion oder neue Karte in einer bestehenden Sektion):

```js
{
  id: "meine-formel",
  title: "Titel der Formel",
  formula: "z. B. α = R<sub>A</sub> / R<sub>B</sub>",
  description: "Kurze Erklärung.",
  inputs: [
    { id: "rA", label: "R<sub>A</sub>", placeholder: "z. B. 0,0112", nonZero: true }
  ],
  compute: (v) => v.rA / v.rB,
  resultLabel: "α",
  resultUnit: "",
  decimals: 4
}
```

- `inputs`: jedes Feld braucht `id`, `label` (HTML erlaubt) und optional `placeholder`, `unit`, `nonZero` (Division durch 0 verhindern) sowie `validate(values)` für eigene Prüfungen.
- `compute(values)` erhält die geparsten Zahlen und liefert das Ergebnis.
- `resultLabel`, `resultUnit`, `decimals` steuern die Ausgabe.

## Aktuelle Sektionen

### Key Equations – Stabile Isotope

- δ-Notation: δ = (R_Probe / R_Standard − 1) × 1000 [‰]
