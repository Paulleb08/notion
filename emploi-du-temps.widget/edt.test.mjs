// Vérif rapide : node emploi-du-temps.widget/edt.test.mjs  (données fictives, les vraies sont dans le dépôt privé)
import assert from "node:assert/strict";
import { renderWeek, lundiDe } from "./edt.js";

const cours = [
  ["2026-11-09", "08:00", "10:00", "ANGL", "TD", "Salle A"],
  ["2026-11-13", "13:30", "17:30", "BDD", "TP", "Salle B"],
  ["2026-11-16", "08:00", "10:00", "<script>", "TD", "x"],
];
const lundi = new Date(2026, 10, 9, 8, 28);
const html = renderWeek(lundi, 0, cours);
assert.match(html, /class="edt-ligne"/, "marqueur présent un lundi à 8h28");
assert.match(html, /Anglais/);
assert.match(html, /edt-encours"/, "le cours de 8h–10h est en cours");
assert.match(html, /Bases de données/);

// Le week-end, on affiche déjà la semaine suivante.
assert.equal(lundiDe(new Date(2026, 10, 14)).getDate(), 16);
assert.equal(lundiDe(new Date(2026, 10, 15)).getDate(), 16);
assert.equal(lundiDe(new Date(2026, 10, 13)).getDate(), 9);

// Semaine suivante : pas de marqueur, contenu échappé.
const suivante = renderWeek(lundi, 1, cours);
assert.doesNotMatch(suivante, /class="edt-ligne"/);
assert.doesNotMatch(suivante, /<script>/);
assert.match(renderWeek(new Date(2026, 11, 22, 10), 0, cours), /Pas de cours/);
console.log("ok");
