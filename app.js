const sections = [
  {
    id: "key-equations-stabile-isotope",
    title: "Key Equations – Stabile Isotope",
    formulas: [
      {
        id: "delta-notation",
        title: "1 · δ-Notation (Isotopensignatur)",
        formula: "δ = ( R<sub>Probe</sub> / R<sub>Standard</sub> − 1 ) × 1000 [‰]",
        description:
          "R = Verhältnis schweres/leichtes Isotop (D/H, ¹³C/¹²C, ¹⁸O/¹⁶O, ³⁴S/³²S). " +
          "δ > 0: schwereres Isotop angereichert; δ < 0: abgereichert. Ein δ-Wert ohne Standard ist wertlos (z. B. ‰ VSMOW oder ‰ VPDB).",
        inputs: [
          {
            id: "rProbe",
            label: "R<sub>Probe</sub> — Isotopenverhältnis der Probe",
            placeholder: "z. B. 0,0112372",
          },
          {
            id: "rStandard",
            label: "R<sub>Standard</sub> — Isotopenverhältnis des Standards",
            placeholder: "z. B. 0,0111802",
            nonZero: true,
          },
        ],
        compute: (v) => (v.rProbe / v.rStandard - 1) * 1000,
        resultLabel: "δ",
        resultUnit: "‰",
        decimals: 3,
      },
      {
        id: "delta-r-conversion",
        title: "1b · Umrechnung δ ↔ R (mit festem Standard)",
        formula:
          "R<sub>Probe</sub> = ( δ/1000 + 1 ) · R<sub>Standard</sub><br>" +
          "δ = ( R<sub>Probe</sub> / R<sub>Standard</sub> − 1 ) × 1000 [‰]",
        description:
          "Standard einmal festlegen (z. B. R<sub>VPDB</sub> = 0,0111802 für ¹³C/¹²C, R<sub>VSMOW</sub> = 0,0020052 für ¹⁸O/¹⁶O). " +
          "δ- und R-Feld synchronisieren sich live; Änderung des Standards rechnet R neu.",
        inputs: [
          {
            id: "rStandard",
            label: "R<sub>Standard</sub> (festlegen)",
            placeholder: "z. B. 0,0111802",
            nonZero: true,
            value: "0,0111802",
          },
          { id: "delta", label: "δ", unit: "‰", placeholder: "z. B. −5", value: "0", decimals: 2 },
          {
            id: "rSample",
            label: "R<sub>Probe</sub>",
            placeholder: "wird automatisch ergänzt",
            value: "0,0111802",
            decimals: 8,
          },
        ],
        sync: {
          a: "delta",
          b: "rSample",
          aToB: (v, vals) => (v / 1000 + 1) * vals.rStandard,
          bToA: (v, vals) => (v / vals.rStandard - 1) * 1000,
          refreshFrom: ["rStandard"],
        },
        compute: (v) => ({ delta: v.delta, r: v.rSample }),
        results: [
          { key: "delta", label: "δ", unit: "‰", decimals: 2 },
          { key: "r", label: "R<sub>Probe</sub>", unit: "", decimals: 8 },
        ],
      },
      {
        id: "standards-conversion",
        title: "2 · Standard-Konvertierung δ¹⁸O (VPDB ↔ VSMOW)",
        formula:
          "δ¹⁸O<sub>VSMOW</sub> = 1,03091 · δ¹⁸O<sub>VPDB</sub> + 30,91<br>" +
          "δ¹⁸O<sub>VPDB</sub> = 0,97002 · δ¹⁸O<sub>VSMOW</sub> − 29,98",
        description:
          "Coplen et al. (1983). Beide Felder gleich sich automatisch aus: Wert in einem Feld ändern, " +
          "das andere rechnet sofort mit. VSMOW für Wässer, VPDB für Karbonate (δ¹³C immer vs. VPDB). " +
          "Werte der beiden Skalen nie in einer Gleichung mischen.",
        inputs: [
          {
            id: "deltaVsmow",
            label: "δ¹⁸O<sub>VSMOW</sub>",
            unit: "‰",
            placeholder: "z. B. 28,45",
            value: "0",
          },
          {
            id: "deltaVpdb",
            label: "δ¹⁸O<sub>VPDB</sub>",
            unit: "‰",
            placeholder: "z. B. −2,38",
            value: "-29,98",
          },
        ],
        sync: {
          a: "deltaVsmow",
          b: "deltaVpdb",
          aToB: (v) => 0.97002 * v - 29.98,
          bToA: (v) => 1.03091 * v + 30.91,
        },
        compute: (v) => ({ vsmow: v.deltaVsmow, vpdb: v.deltaVpdb }),
        results: [
          { key: "vsmow", label: "δ¹⁸O<sub>VSMOW</sub>", unit: "‰", decimals: 2 },
          { key: "vpdb", label: "δ¹⁸O<sub>VPDB</sub>", unit: "‰", decimals: 2 },
        ],
      },
      {
        id: "fractionation-factor",
        title: "3 · Fraktionierungsfaktor α, ε und Δ",
        formula:
          "α<sub>A−B</sub> = R<sub>A</sub>/R<sub>B</sub> = (1000 + δ<sub>A</sub>)/(1000 + δ<sub>B</sub>)<br>" +
          "ε<sub>A−B</sub> = (α − 1) × 1000 &nbsp;·&nbsp; Δ<sub>A−B</sub> = δ<sub>A</sub> − δ<sub>B</sub>",
        description:
          "Reihenfolge beachten: α<sub>Wasser–Calcit</sub> = 1 / α<sub>Calcit–Wasser</sub>. " +
          "Für kleine Fraktionierungen (δ nahe 0 ‰) gilt Δ ≈ ε ≈ 10³ ln α.",
        inputs: [
          { id: "deltaA", label: "δ<sub>A</sub>", unit: "‰", placeholder: "z. B. 28,45" },
          { id: "deltaB", label: "δ<sub>B</sub>", unit: "‰", placeholder: "z. B. 0" },
        ],
        validate: (v) =>
          v.deltaB === -1000 ? "δ_B = −1000 ‰ ist nicht erlaubt (Division durch 0)." : null,
        compute: (v) => {
          const alpha = (1000 + v.deltaA) / (1000 + v.deltaB);
          return {
            alpha,
            eps: (alpha - 1) * 1000,
            delta: v.deltaA - v.deltaB,
            lnAlpha: 1000 * Math.log(alpha),
          };
        },
        results: [
          { key: "alpha", label: "α<sub>A−B</sub>", unit: "", decimals: 5 },
          { key: "eps", label: "ε<sub>A−B</sub>", unit: "‰", decimals: 3 },
          { key: "delta", label: "Δ<sub>A−B</sub>", unit: "‰", decimals: 3 },
          { key: "lnAlpha", label: "10³ ln α", unit: "‰", decimals: 3 },
        ],
      },
      {
        id: "calcite-water-thermometer",
        title: "4 · Calcit–Wasser-Thermometer (Kim & O'Neil 1997)",
        formula: "10³ ln α<sub>Calcit–Wasser</sub> = 18,03 · (10³/T) − 32,42 &nbsp; (T in K)",
        description:
          "Kalibriert für 10–40 °C; T wird aus °C umgerechnet. " +
          "δ<sub>Calcit</sub> = α · (δ<sub>Wasser</sub> + 1000) − 1000.",
        inputs: [
          { id: "tempC", label: "T (Temperatur)", unit: "°C", placeholder: "z. B. 25" },
          {
            id: "deltaWater",
            label: "δ¹⁸O<sub>Wasser</sub> (optional, Standard: 0 ‰ VSMOW)",
            unit: "‰",
            placeholder: "z. B. 0",
            optional: true,
            default: 0,
          },
        ],
        validate: (v) =>
          v.tempC <= -273.15 ? "T muss größer als −273,15 °C sein." : null,
        compute: (v) => {
          const tKelvin = v.tempC + 273.15;
          const x = 18.03 * (1000 / tKelvin) - 32.42;
          const alpha = Math.exp(x / 1000);
          return {
            x,
            alpha,
            deltaCalcite: alpha * (v.deltaWater + 1000) - 1000,
          };
        },
        results: [
          { key: "x", label: "10³ ln α<sub>Calcit–Wasser</sub>", unit: "‰", decimals: 2 },
          { key: "alpha", label: "α<sub>Calcit–Wasser</sub>", unit: "", decimals: 5 },
          { key: "deltaCalcite", label: "δ¹⁸O<sub>Calcit</sub>", unit: "‰ VSMOW", decimals: 2 },
        ],
      },
      {
        id: "mass-balance",
        title: "5 · Massenbilanz (Mischung zweier Komponenten)",
        formula: "δ<sub>mix</sub> = Σ f<sub>i</sub> · δ<sub>i</sub>, &nbsp; f<sub>i</sub> = V<sub>i</sub> / ΣV",
        description:
          "Beispiel: 2 L mit −10 ‰ + 3 L mit +2 ‰ → (2·(−10) + 3·2)/5 = −2,8 ‰ (nicht der einfache Mittelwert −4 ‰). " +
          "Die Mischung liegt zwischen den Endgliedern, näher am größeren Anteil.",
        inputs: [
          { id: "v1", label: "V₁ (Volumen Komponente 1)", unit: "L", placeholder: "z. B. 2" },
          { id: "delta1", label: "δ₁ (Komponente 1)", unit: "‰", placeholder: "z. B. −10" },
          { id: "v2", label: "V₂ (Volumen Komponente 2)", unit: "L", placeholder: "z. B. 3" },
          { id: "delta2", label: "δ₂ (Komponente 2)", unit: "‰", placeholder: "z. B. 2" },
        ],
        validate: (v) =>
          v.v1 + v.v2 <= 0 ? "Die Summe der Volumina muss größer als 0 sein." : null,
        compute: (v) => (v.v1 * v.delta1 + v.v2 * v.delta2) / (v.v1 + v.v2),
        resultLabel: "δ_mix",
        resultUnit: "‰",
        decimals: 2,
      },
      {
        id: "rayleigh-rvapour",
        title: "6a · Rayleigh-Destillation: R<sub>Dampf</sub>",
        formula: "R<sub>Dampf</sub> = R₀ · f<sup>(α−1)</sup>",
        description: "f = verbleibender Dampfanteil (0 < f ≤ 1).",
        inputs: [
          { id: "r0", label: "R₀ (Anfangsverhältnis)", placeholder: "z. B. 0,0112372" },
          { id: "f", label: "f (verbleibender Dampfanteil)", placeholder: "z. B. 0,5" },
          { id: "alpha", label: "α (Fraktionierungsfaktor)", placeholder: "z. B. 1,0098" },
        ],
        validate: (v) => {
          if (v.f <= 0 || v.f > 1) return "f muss im Bereich 0 < f ≤ 1 liegen.";
          if (v.alpha <= 0) return "α muss größer als 0 sein.";
          return null;
        },
        compute: (v) => v.r0 * Math.pow(v.f, v.alpha - 1),
        resultLabel: "R_Dampf",
        resultUnit: "",
        decimals: 8,
      },
      {
        id: "rayleigh-rain",
        title: "6b · Rayleigh-Destillation: δ<sub>Regen</sub>",
        formula: "δ<sub>Regen</sub> = α · (δ<sub>Dampf</sub> + 1000) − 1000",
        description: "Niederschlag aus dem Dampf bei Fraktionierungsfaktor α.",
        inputs: [
          { id: "alpha", label: "α (Fraktionierungsfaktor)", placeholder: "z. B. 1,0098" },
          { id: "deltaVapour", label: "δ<sub>Dampf</sub>", unit: "‰", placeholder: "z. B. −10" },
        ],
        compute: (v) => v.alpha * (v.deltaVapour + 1000) - 1000,
        resultLabel: "δ_Regen",
        resultUnit: "‰",
        decimals: 2,
      },
      {
        id: "meteoric-water-line",
        title: "6c · Meteorische Wasserlinie (GMWL) & Deuterium-Exzess",
        formula: "δ²H = 8 · δ¹⁸O + 10 &nbsp;·&nbsp; d = δ²H − 8 · δ¹⁸O",
        description:
          "Global Meteoric Water Line: Craig (1961); Deuterium-Exzess: Dansgaard (1964).",
        inputs: [
          { id: "d18O", label: "δ¹⁸O", unit: "‰", placeholder: "z. B. −10" },
          { id: "d2H", label: "δ²H", unit: "‰", placeholder: "z. B. −70" },
        ],
        compute: (v) => ({ gwl: 8 * v.d18O + 10, d: v.d2H - 8 * v.d18O }),
        results: [
          { key: "gwl", label: "δ²H auf der GMWL (8·δ¹⁸O + 10)", unit: "‰", decimals: 2 },
          { key: "d", label: "d (Deuterium-Exzess)", unit: "‰", decimals: 2 },
        ],
      },
    ],
  },
  {
    id: "paleotemperatur-lecture2",
    title: "Paleotemperatur – Lecture 2",
    formulas: [
      {
        id: "aa-paleotemp",
        title: "L2-1 · Calcit-Paläothermometer (Anderson & Arthur 1983)",
        formula:
          "T(°C) = 16,0 − 4,14 · (δ<sub>c</sub> − δ<sub>w</sub>) + 0,13 · (δ<sub>c</sub> − δ<sub>w</sub>)²",
        description:
          "δ_c = δ¹⁸O des Calcits, δ_w = δ¹⁸O des Wassers — beide auf derselben Skala (VPDB/VSMOW vorher umrechnen, siehe Formel 2). " +
          "Vorzeichen in den Klammern beibehalten; Klammer quadrieren, bevor mit 0,13 multipliziert wird.",
        inputs: [
          { id: "deltaC", label: "δ<sub>c</sub> (Calcit)", unit: "‰", placeholder: "z. B. −2" },
          { id: "deltaW", label: "δ<sub>w</sub> (Wasser)", unit: "‰", placeholder: "z. B. −1" },
        ],
        compute: (v) => {
          const d = v.deltaC - v.deltaW;
          return 16.0 - 4.14 * d + 0.13 * d * d;
        },
        resultLabel: "T",
        resultUnit: "°C",
        decimals: 2,
      },
      {
        id: "aa-water-delta",
        title: "L2-2 · Dieselbe Gleichung nach dem Wasser aufgelöst",
        formula:
          "(δ<sub>c</sub> − δ<sub>w</sub>) = [ 4,14 − √( 4,14² − 0,52 · (16,0 − T) ) ] / 0,26 &nbsp; (T in °C)",
        description:
          "Umgestellt nach (δ_c − δ_w). Optional δ_c angeben, dann wird δ_w = δ_c − (δ_c − δ_w) mit ausgegeben.",
        inputs: [
          { id: "temp", label: "T", unit: "°C", placeholder: "z. B. 25" },
          {
            id: "deltaC",
            label: "δ<sub>c</sub> (optional, ergibt δ<sub>w</sub>)",
            unit: "‰",
            placeholder: "z. B. −2",
            optional: true,
            default: null,
          },
        ],
        validate: (v) => {
          const disc = 4.14 * 4.14 - 0.52 * (16.0 - v.temp);
          return disc < 0
            ? "Diskriminante negativ — T liegt außerhalb des gültigen Bereichs (ca. T ≥ −17 °C)."
            : null;
        },
        compute: (v) => {
          const disc = 4.14 * 4.14 - 0.52 * (16.0 - v.temp);
          const diff = (4.14 - Math.sqrt(disc)) / 0.26;
          const out = { diff };
          if (v.deltaC !== null && v.deltaC !== undefined) out.deltaW = v.deltaC - diff;
          return out;
        },
        results: [
          { key: "diff", label: "δ<sub>c</sub> − δ<sub>w</sub>", unit: "‰", decimals: 2 },
          { key: "deltaW", label: "δ<sub>w</sub> (bei angegebenem δ<sub>c</sub>)", unit: "‰", decimals: 2 },
        ],
      },
      {
        id: "clumped-isotope",
        title: "L2-3 · Clumped-Isotope-Kalibration (Anderson et al. 2021)",
        formula:
          "Δ<sub>47</sub> = 0,0391 · 10⁶/T² + 0,154 &nbsp;→&nbsp; T = √[ 0,0391 · 10⁶ / (Δ<sub>47</sub> − 0,154) ]",
        description:
          "T kommt in Kelvin heraus — vor Verwendung in L2-2 erst 273,15 abziehen.",
        inputs: [
          { id: "delta47", label: "Δ<sub>47</sub>", unit: "‰", placeholder: "z. B. 0,52" },
        ],
        validate: (v) =>
          v.delta47 <= 0.154 ? "Δ47 muss größer als 0,154 ‰ sein." : null,
        compute: (v) => {
          const tK = Math.sqrt(0.0391e6 / (v.delta47 - 0.154));
          return { tK, tC: tK - 273.15 };
        },
        results: [
          { key: "tK", label: "T", unit: "K", decimals: 2 },
          { key: "tC", label: "T", unit: "°C", decimals: 2 },
        ],
      },
    ],
  },
  {
    id: "uran-isotope",
    title: "Uran-Isotope (²³⁸U) – Redox / Massenbilanz",
    formulas: [
      {
        id: "u-mass-balance",
        title: "U-1 · U-Massenbilanz im Gleichgewicht (Brennecka et al. 2011)",
        formula:
          "δ²³⁸U<sub>input</sub> = f<sub>anox</sub> · δ²³⁸U<sub>anoxic</sub> + (1 − f<sub>anox</sub>) · δ²³⁸U<sub>other</sub>",
        description:
          "Steady state. Beispielwerte aus der Arbeit: Fluss-Input δ²³⁸U_input = −0,30 ‰; " +
          "anoxische Senken 0,50 ‰ schwerer als Meerwasser, alle anderen Senken 0,10 ‰ schwerer.",
        inputs: [
          { id: "fAnox", label: "f<sub>anox</sub> (Anteil anoxische Senken)", placeholder: "z. B. 0,1" },
          { id: "dAnoxic", label: "δ²³⁸U<sub>anoxic</sub>", unit: "‰", placeholder: "z. B. 0,20" },
          { id: "dOther", label: "δ²³⁸U<sub>other</sub>", unit: "‰", placeholder: "z. B. −0,20" },
        ],
        validate: (v) =>
          v.fAnox < 0 || v.fAnox > 1 ? "f_anox muss zwischen 0 und 1 liegen." : null,
        compute: (v) => v.fAnox * v.dAnoxic + (1 - v.fAnox) * v.dOther,
        resultLabel: "δ²³⁸U_input",
        resultUnit: "‰",
        decimals: 3,
      },
      {
        id: "u-fanox",
        title: "U-2 · f_anox umgestellt (Werte aus Brennecka et al. 2011)",
        formula:
          "f<sub>anox</sub> = ( δ²³⁸U<sub>input</sub> − 0,10 − δ²³⁸U<sub>Meerwasser</sub> ) / 0,40",
        description:
          "Umgestellt mit den Offsets der Arbeit: anoxische Senken +0,50 ‰, andere Senken +0,10 ‰ gegenüber Meerwasser (Differenz 0,40). " +
          "Beide Offsets optional anpassbar.",
        inputs: [
          { id: "dInput", label: "δ²³⁸U<sub>input</sub> (Fluss)", unit: "‰", placeholder: "z. B. −0,30", value: "-0,30" },
          { id: "dSea", label: "δ²³⁸U<sub>Meerwasser</sub>", unit: "‰", placeholder: "z. B. −0,30", value: "-0,30" },
          { id: "offAnox", label: "Offset anoxisch (optional)", unit: "‰", placeholder: "0,50", optional: true, default: 0.5 },
          { id: "offOther", label: "Offset andere Senken (optional)", unit: "‰", placeholder: "0,10", optional: true, default: 0.1 },
        ],
        validate: (v) =>
          v.offAnox === v.offOther
            ? "Die Offsets dürfen nicht gleich sein (Division durch 0)."
            : null,
        compute: (v) => (v.dInput - v.offOther - v.dSea) / (v.offAnox - v.offOther),
        resultLabel: "f_anox",
        resultUnit: "",
        decimals: 3,
      },
      {
        id: "u-seawater-limestone",
        title: "U-3 · Meerwasser aus Kalkstein (diagenetischer Offset)",
        formula: "δ²³⁸U<sub>Meerwasser</sub> = δ²³⁸U<sub>Kalkstein</sub> − offset",
        description:
          "Der Kalkstein ist nicht das Meerwasser. Diagenetischer Offset typisch 0,2–0,4 ‰. " +
          "Kalkstein- und Meerwasser-Feld synchronisieren sich live; Änderung des Offsets rechnet neu.",
        inputs: [
          { id: "dLimestone", label: "δ²³⁸U<sub>Kalkstein</sub>", unit: "‰", placeholder: "z. B. −0,30", value: "-0,30", decimals: 2 },
          { id: "dSea", label: "δ²³⁸U<sub>Meerwasser</sub>", unit: "‰", placeholder: "wird ergänzt", value: "-0,60", decimals: 2 },
          { id: "offset", label: "offset (diagenetisch)", unit: "‰", placeholder: "z. B. 0,30", value: "0,30" },
        ],
        sync: {
          a: "dLimestone",
          b: "dSea",
          aToB: (v, vals) => v - vals.offset,
          bToA: (v, vals) => v + vals.offset,
          refreshFrom: ["offset"],
        },
        compute: (v) => ({ sea: v.dSea, lime: v.dLimestone }),
        results: [
          { key: "sea", label: "δ²³⁸U<sub>Meerwasser</sub>", unit: "‰", decimals: 2 },
          { key: "lime", label: "δ²³⁸U<sub>Kalkstein</sub>", unit: "‰", decimals: 2 },
        ],
      },
    ],
  },
];

function parseNumber(raw) {
  return parseFloat(String(raw).trim().replace(",", "."));
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, "");
}

function formatResult(value, decimals) {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function createField(formula, input) {
  const field = document.createElement("div");
  field.className = "field";

  const label = document.createElement("label");
  label.htmlFor = `${formula.id}-${input.id}`;
  label.innerHTML = input.label + (input.unit ? ` <span class="unit">[${input.unit}]</span>` : "");

  let inputEl;
  if (input.type === "select") {
    inputEl = document.createElement("select");
    for (const option of input.options) {
      const optionEl = document.createElement("option");
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      inputEl.appendChild(optionEl);
    }
    inputEl.value = input.options[0].value;
  } else {
    inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.inputMode = "decimal";
    inputEl.placeholder = input.placeholder || "";
    inputEl.autocomplete = "off";
    if (input.value !== undefined) inputEl.value = input.value;
  }
  inputEl.id = `${formula.id}-${input.id}`;

  field.appendChild(label);
  field.appendChild(inputEl);
  return { field, inputEl, def: input };
}

function createFormulaCard(formula) {
  const card = document.createElement("article");
  card.className = "card";

  const heading = document.createElement("h3");
  heading.textContent = formula.title;
  card.appendChild(heading);

  const formulaEl = document.createElement("p");
  formulaEl.className = "formula-display";
  formulaEl.innerHTML = formula.formula;
  card.appendChild(formulaEl);

  if (formula.description) {
    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = formula.description;
    card.appendChild(desc);
  }

  const form = document.createElement("form");
  form.noValidate = true;

  const inputRefs = {};
  for (const input of formula.inputs) {
    const { field, inputEl, def } = createField(formula, input);
    form.appendChild(field);
    inputRefs[input.id] = { el: inputEl, def };
  }

  if (formula.sync) {
    const { a, b, aToB, bToA } = formula.sync;

    const collectNumeric = () => {
      const vals = {};
      for (const [id, ref] of Object.entries(inputRefs)) {
        if (ref.def.type === "select") {
          vals[id] = ref.el.value;
          continue;
        }
        const raw = ref.el.value;
        if (raw.trim() === "") {
          if (ref.def.optional) {
            vals[id] = ref.def.default;
            continue;
          }
          return null;
        }
        const n = parseNumber(raw);
        if (!Number.isFinite(n)) return null;
        vals[id] = n;
      }
      return vals;
    };

    const formatSync = (n, toId) => {
      if (!Number.isFinite(n)) return null;
      const dec = inputRefs[toId].def.decimals ?? 2;
      return n.toFixed(dec).replace(".", ",");
    };

    const bindSync = (fromId, toId, convert) => {
      inputRefs[fromId].el.addEventListener("input", () => {
        const num = parseNumber(inputRefs[fromId].el.value);
        if (!Number.isFinite(num)) return;
        const vals = collectNumeric();
        if (!vals) return;
        const out = formatSync(convert(num, vals), toId);
        if (out !== null) inputRefs[toId].el.value = out;
      });
    };
    bindSync(a, b, aToB);
    bindSync(b, a, bToA);

    for (const fid of formula.sync.refreshFrom || []) {
      inputRefs[fid].el.addEventListener("input", () => {
        const vals = collectNumeric();
        if (!vals || typeof vals[a] !== "number") return;
        const out = formatSync(aToB(vals[a], vals), b);
        if (out !== null) inputRefs[b].el.value = out;
      });
    }
  }

  const button = document.createElement("button");
  button.type = "submit";
  button.className = "calculate";
  button.textContent = "Berechnen";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "copy";
  copyButton.textContent = "Kopieren";

  const buttonRow = document.createElement("div");
  buttonRow.className = "button-row";
  buttonRow.appendChild(button);
  buttonRow.appendChild(copyButton);
  form.appendChild(buttonRow);

  const errorEl = document.createElement("p");
  errorEl.className = "error";
  errorEl.hidden = true;

  const resultEl = document.createElement("p");
  resultEl.className = "result";
  resultEl.hidden = true;

  let copyText = null;

  form.appendChild(errorEl);
  form.appendChild(resultEl);

  const showResult = (result) => {
    if (formula.results) {
      const shown = formula.results.filter((r) => result[r.key] !== undefined);
      resultEl.innerHTML = shown
        .map(
          (r) =>
            `<strong>${r.label}</strong> = ${formatResult(result[r.key], r.decimals ?? 3)} ${r.unit}`
        )
        .join("<br>");
      copyText = shown
        .map(
          (r) =>
            `${stripTags(r.label)} = ${formatResult(result[r.key], r.decimals ?? 3)} ${r.unit}`
        )
        .join("\n");
    } else {
      resultEl.innerHTML = `<strong>${formula.resultLabel}</strong> = ${formatResult(result, formula.decimals ?? 3)} ${formula.resultUnit}`;
      copyText = `${stripTags(formula.resultLabel)} = ${formatResult(result, formula.decimals ?? 3)} ${formula.resultUnit}`;
    }
    resultEl.hidden = false;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.hidden = true;
    resultEl.hidden = true;
    copyText = null;

    const values = {};
    for (const [id, ref] of Object.entries(inputRefs)) {
      const def = ref.def;
      if (def.type === "select") {
        values[id] = ref.el.value;
        continue;
      }
      const raw = ref.el.value;
      if (raw.trim() === "") {
        if (def.optional) {
          values[id] = def.default;
          continue;
        }
        errorEl.textContent = "Bitte alle Felder ausfüllen.";
        errorEl.hidden = false;
        ref.el.focus();
        return;
      }
      const num = parseNumber(raw);
      if (!Number.isFinite(num)) {
        errorEl.textContent = `„${raw}“ ist keine gültige Zahl.`;
        errorEl.hidden = false;
        ref.el.focus();
        return;
      }
      if (def.nonZero && num === 0) {
        errorEl.textContent = "Dieser Wert darf nicht 0 sein.";
        errorEl.hidden = false;
        ref.el.focus();
        return;
      }
      values[id] = num;
    }

    if (formula.validate) {
      const message = formula.validate(values);
      if (message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
        return;
      }
    }

    showResult(formula.compute(values));
  });

  copyButton.addEventListener("click", async () => {
    if (!copyText) {
      errorEl.textContent = "Bitte zuerst berechnen.";
      errorEl.hidden = false;
      return;
    }
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = copyText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    copyButton.textContent = "Kopiert ✓";
    setTimeout(() => {
      copyButton.textContent = "Kopieren";
    }, 1500);
  });

  if (formula.sync) {
    button.style.display = "none";
    const liveUpdate = () => {
      const values = {};
      for (const [id, ref] of Object.entries(inputRefs)) {
        if (ref.def.type === "select") {
          values[id] = ref.el.value;
          continue;
        }
        const raw = ref.el.value;
        if (raw.trim() === "") {
          if (ref.def.optional) {
            values[id] = ref.def.default;
            continue;
          }
          resultEl.hidden = true;
          errorEl.hidden = true;
          copyText = null;
          return;
        }
        const num = parseNumber(raw);
        if (!Number.isFinite(num) || (ref.def.nonZero && num === 0)) {
          resultEl.hidden = true;
          errorEl.hidden = true;
          copyText = null;
          return;
        }
        values[id] = num;
      }
      if (formula.validate && formula.validate(values)) {
        resultEl.hidden = true;
        copyText = null;
        return;
      }
      errorEl.hidden = true;
      showResult(formula.compute(values));
    };
    for (const ref of Object.values(inputRefs)) {
      ref.el.addEventListener("input", liveUpdate);
    }
    liveUpdate();
  }

  card.appendChild(form);
  return card;
}

function render() {
  const main = document.getElementById("app");
  main.innerHTML = "";

  for (const section of sections) {
    const sectionEl = document.createElement("section");
    sectionEl.className = "formula-section";
    sectionEl.id = section.id;

    const heading = document.createElement("h2");
    heading.textContent = section.title;
    sectionEl.appendChild(heading);

    for (const formula of section.formulas) {
      sectionEl.appendChild(createFormulaCard(formula));
    }

    main.appendChild(sectionEl);
  }
}

const PASSWORD_HASH = "b2901485afd6fab6b55c15e20f6b59707254c97de87cf3cc45d8f40bf4b04c26";
const UNLOCK_KEY = "sgc-unlocked";

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function initGate() {
  const form = document.getElementById("gate-form");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.getElementById("gate-password");
    const errorEl = document.getElementById("gate-error");
    const hash = await sha256Hex(input.value);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem(UNLOCK_KEY, "1");
      document.documentElement.classList.add("unlocked");
      input.value = "";
      errorEl.hidden = true;
    } else {
      errorEl.hidden = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  initGate();
});
