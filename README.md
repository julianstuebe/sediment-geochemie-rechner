# Sediment-Geochemie Rechner

Einfache Webseite zur Berechnung geochemischer Größen aus der Sediment-Geochemie
(Key Equations – Stabile Isotope, Vorlesungssheet Lecture 1).
Werte in Felder eingeben, Formel berechnen lassen. Stück für stück erweiterbar.

## Start

`index.html` direkt im Browser öffnen — keine Installation, kein Build-Schritt nötig.
Optional als GitHub Pages veröffentlichen (Repo → Settings → Pages).

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
    { id: "rA", label: "R<sub>A</sub>", placeholder: "z. B. 0,0112", nonZero: true },
    { id: "richtung", type: "select", label: "Richtung",
      options: [{ value: "a", label: "A → B" }, { value: "b", label: "B → A" }] },
    { id: "optional", label: "Optional", optional: true, default: 0 }
  ],
  validate: (v) => null,              // optional: eigene Prüfung, liefert Fehlermeldung oder null
  compute: (v) => v.rA / 2,            // Zahl ODER Objekt { key: wert } bei mehreren Ergebnissen
  resultLabel: "α",                    // Einzel-Ergebnis ...
  resultUnit: "",
  decimals: 4,
  // ... oder results: [{ key: "alpha", label: "α", unit: "", decimals: 5 }, ...]
}
```

- `inputs`: jedes Feld braucht `id`, `label` (HTML erlaubt) und optional `placeholder`, `unit`, `nonZero` (Division durch 0 verhindern), `type: "select"` mit `options`, `optional` + `default` (leeres Feld → Standardwert) sowie `validate(values)` für eigene Prüfungen.
- `compute(values)` erhält die geparsten Werte (Selects als String) und liefert eine Zahl oder ein Objekt.
- `resultLabel`/`resultUnit`/`decimals` für ein Ergebnis, `results` (Array mit `key`/`label`/`unit`/`decimals`) für mehrere.

## Enthaltene Formeln (Key Equations – Stabile Isotope)

1. δ-Notation: δ = (R_Probe / R_Standard − 1) × 1000 [‰]
2. Standard-Konvertierung δ¹⁸O: VPDB ↔ VSMOW (Coplen et al. 1983)
3. Fraktionierungsfaktor: α = (1000+δ_A)/(1000+δ_B), ε = (α−1)×1000, Δ = δ_A−δ_B
4. Calcit–Wasser-Thermometer: 10³ ln α = 18,03·(10³/T) − 32,42 (Kim & O'Neil 1997)
5. Massenbilanz (Mischung): δ_mix = Σ f_i·δ_i, f_i = V_i/ΣV
6. Rayleigh-Destillation (R_Dampf, δ_Regen) & meteorische Wasserlinie (δ²H = 8·δ¹⁸O + 10, d = δ²H − 8·δ¹⁸O)
