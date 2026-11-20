# Sediment-Geochemie Rechner

Einfache Webseite zur Berechnung geochemischer Größen aus der Sediment-Geochemie
(Key Equations – Stabile Isotope, Vorlesungssheet Lecture 1).
Werte in Felder eingeben, Formel berechnen lassen. Stück für stück erweiterbar.

## Start

`index.html` direkt im Browser öffnen — keine Installation, kein Build-Schritt nötig.
Optional als GitHub Pages veröffentlichen (Repo → Settings → Pages).

## Aufbau

- `index.html` — Grundgerüst der Seite (inkl. Passwortmaske `#gate`)
- `styles.css` — Gestaltung (Farben zentral in `:root`)
- `app.js` — Formel-Registry (`sections`), Rendering, Passwort-Gate

## Funktionen

- Jede Formelkarte hat einen **Kopieren-Button** fürs Ergebnis (Klartext, bei Mehrfach-Ergebnissen zeilenweise; mit Fallback ohne Clipboard-API)
- Formel 2: VSMOW-/VPDB-Felder synchronisieren sich live (`sync` in der Formel-Definition) — bei `sync`-Karten rechnet die Seite sofort mit und der Berechnen-Button wird ausgeblendet
- Karten im Zweier-Raster, Felder pro Karte zweispaltig (mobil jeweils einspaltig)

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

- `inputs`: jedes Feld braucht `id`, `label` (HTML erlaubt) und optional `placeholder`, `unit`, `value` (Startwert), `nonZero` (Division durch 0 verhindern), `type: "select"` mit `options`, `optional` + `default` (leeres Feld → Standardwert) sowie `validate(values)` für eigene Prüfungen.
- `sync: { a, b, aToB, bToA, refreshFrom? }`: zwei Felder, die sich live synchronisieren — Änderung in Feld `a` rechnet Feld `b` über `aToB(wert, alleWerte)` neu (und umgekehrt). Dezimalstellen fürs Zielfeld über `decimals` am Input; `refreshFrom` listet Felder, deren Änderung `b` aus `a` neu berechnet (z. B. Standard-Feld). Siehe Formeln 2 und 1b.
- `compute(values)` erhält die geparsten Werte (Selects als String) und liefert eine Zahl oder ein Objekt.
- `resultLabel`/`resultUnit`/`decimals` für ein Ergebnis, `results` (Array mit `key`/`label`/`unit`/`decimals`) für mehrere.

## Passwortschutz (clientseitig)

Vor die Seite ist eine Passwortmaske geschaltet (`#gate` in `index.html`, Logik in `app.js`).
Die Freischaltung gilt pro Browser-Session (`sessionStorage`).

**Passwort ändern:** SHA-256-Hash des neuen Passworts in `PASSWORD_HASH` in `app.js` eintragen, z. B.:

```bash
printf '%s' "NEUES_PASSWORT" | sha256sum
```

Das Klartext-Passwort wird absichtlich nicht im Repo abgelegt — nur der Hash.

Hinweis: rein statische Seite — der Hash liegt im öffentlichen Quelltext. Das schützt nur vor
zufälligen Besuchern, nicht vor jemandem, der den Quelltext liest. Echter Schutz nur über
privates Repo + Pages (kostenpflichtiger Plan) oder einen Auth-Proxy.

## Enthaltene Formeln (Key Equations – Stabile Isotope)

1. δ-Notation: δ = (R_Probe / R_Standard − 1) × 1000 [‰]
1b. δ ↔ R bei festem Standard (live synchronisierte Felder): R = (δ/1000 + 1)·R_Standard
2. Standard-Konvertierung δ¹⁸O: VPDB ↔ VSMOW (Coplen et al. 1983) — VSMOW- und VPDB-Feld synchronisieren sich automatisch
3. Fraktionierungsfaktor: α = (1000+δ_A)/(1000+δ_B), ε = (α−1)×1000, Δ = δ_A−δ_B
4. Calcit–Wasser-Thermometer: 10³ ln α = 18,03·(10³/T) − 32,42 (Kim & O'Neil 1997)
5. Massenbilanz (Mischung): δ_mix = Σ f_i·δ_i, f_i = V_i/ΣV
6. Rayleigh-Destillation (R_Dampf, δ_Regen) & meteorische Wasserlinie (δ²H = 8·δ¹⁸O + 10, d = δ²H − 8·δ¹⁸O)

### Paleotemperatur – Lecture 2

- L2-1 Calcit-Paläothermometer (Anderson & Arthur 1983): T = 16,0 − 4,14·(δ_c−δ_w) + 0,13·(δ_c−δ_w)²
- L2-2 nach Wasser aufgelöst: (δ_c−δ_w) = [4,14 − √(4,14² − 0,52·(16,0−T))]/0,26; optional δ_w über δ_c
- L2-3 Clumped Isotopes (Anderson et al. 2021): T = √[0,0391·10⁶/(Δ47 − 0,154)] in K, zusätzlich °C

### Uran-Isotope (²³⁸U) – Redox / Massenbilanz

- U-1 Massenbilanz im Gleichgewicht: δ²³⁸U_input = f_anox·δ_anoxic + (1−f_anox)·δ_other (Brennecka et al. 2011)
- U-2 umgestellt: f_anox = (δ_input − 0,10 − δ_Meerwasser)/0,40, Offsets optional anpassbar
- U-3 Meerwasser aus Kalkstein (live synchronisiert): δ_Meerwasser = δ_Kalkstein − offset (0,2–0,4 ‰)
