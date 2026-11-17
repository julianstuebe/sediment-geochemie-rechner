const sections = [
  {
    id: "key-equations-stabile-isotope",
    title: "Key Equations – Stabile Isotope",
    formulas: [
      {
        id: "delta-notation",
        title: "δ-Notation (Isotopensignatur)",
        formula: "δ = ( R<sub>Probe</sub> / R<sub>Standard</sub> − 1 ) × 1000 [‰]",
        description:
          "Berechnet die Isotopensignatur δ einer Probe relativ zu einem Standard. " +
          "R ist das Verhältnis von schwerem zu leichtem Isotop (z. B. ¹³C/¹²C oder ¹⁸O/¹⁶O).",
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
    ],
  },
];

function parseNumber(raw) {
  return parseFloat(String(raw).trim().replace(",", "."));
}

function formatResult(value, decimals) {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
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
    const field = document.createElement("div");
    field.className = "field";

    const label = document.createElement("label");
    label.htmlFor = `${formula.id}-${input.id}`;
    label.innerHTML = input.label + (input.unit ? ` <span class="unit">[${input.unit}]</span>` : "");

    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.id = `${formula.id}-${input.id}`;
    inputEl.inputMode = "decimal";
    inputEl.placeholder = input.placeholder || "";
    inputEl.autocomplete = "off";

    field.appendChild(label);
    field.appendChild(inputEl);
    form.appendChild(field);
    inputRefs[input.id] = { el: inputEl, def: input };
  }

  const button = document.createElement("button");
  button.type = "submit";
  button.className = "calculate";
  button.textContent = "Berechnen";
  form.appendChild(button);

  const errorEl = document.createElement("p");
  errorEl.className = "error";
  errorEl.hidden = true;

  const resultEl = document.createElement("p");
  resultEl.className = "result";
  resultEl.hidden = true;

  form.appendChild(errorEl);
  form.appendChild(resultEl);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.hidden = true;
    resultEl.hidden = true;

    const values = {};
    for (const [id, ref] of Object.entries(inputRefs)) {
      const raw = ref.el.value;
      if (raw.trim() === "") {
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
      if (ref.def.nonZero && num === 0) {
        errorEl.textContent = "Der Standardwert darf nicht 0 sein.";
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

    const result = formula.compute(values);
    resultEl.innerHTML = `<strong>${formula.resultLabel}</strong> = ${formatResult(result, formula.decimals ?? 3)} ${formula.resultUnit}`;
    resultEl.hidden = false;
  });

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

document.addEventListener("DOMContentLoaded", render);
