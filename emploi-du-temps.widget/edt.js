// Rendu de l'emploi du temps, partagé par le site et le widget Übersicht.
// Aucune donnée ici (ce dépôt est public) : les cours viennent de edt.json, dans le dépôt privé.
// Format d'un cours : [date "AAAA-MM-JJ", début "HH:MM", fin "HH:MM", matière, type (TD|TP|Projet|Test), salle]

const NOMS = {
  ENERG: "Énergétique", MATE: "Matériaux", MATHINFO: "Maths-info", COM: "Communication",
  ANGL: "Anglais", DEVPERSO2: "Dév. perso", MECA: "Mécanique", EEA: "EEA", BDD: "Bases de données",
  CONCEVOIR: "Concevoir", MANA: "Management", INNOV: "Innovation", PROJET: "Projet", TPS: "TPS",
};

const DEBUT = 8 * 60, FIN = 18 * 60; // la grille couvre 8:00–18:00
const pad = (n) => String(n).padStart(2, "0");
const cle = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const minutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const pct = (m) => ((Math.min(Math.max(m, DEBUT), FIN) - DEBUT) / (FIN - DEBUT)) * 100;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Lundi de la semaine à afficher : le week-end, on passe déjà à la semaine suivante.
export function lundiDe(now) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const j = d.getDay();
  d.setDate(d.getDate() + (j === 6 ? 2 : j === 0 ? 1 : 1 - j));
  return d;
}

const STYLE = `<style>
.edt{--c-TD:#8e2f6b;--c-TP:#1f6fd1;--c-Projet:#5d7480;--c-Test:#d23c34;
  background:var(--edt-bg,rgba(18,20,26,.8));color:var(--edt-fg,#f4f5f7);border-radius:var(--edt-radius,16px);
  padding:14px;font:12px/1.3 var(--edt-font,-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif);
  -webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);width:var(--edt-w,560px);max-width:100%;box-sizing:border-box}
.edt *{box-sizing:border-box}
.edt-tete{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:2px}
.edt-date{font-weight:600;font-size:15px}
.edt-date::first-letter{text-transform:uppercase}
.edt-heure{font:600 22px/1 var(--edt-mono,ui-monospace,"SF Mono",Menlo,monospace);font-variant-numeric:tabular-nums}
.edt-sem{color:var(--edt-muted,rgba(244,245,247,.6));margin-bottom:10px}
.edt-grille{display:grid;grid-template-columns:30px repeat(5,minmax(0,1fr));gap:0 4px;padding-bottom:8px}
.edt-j{text-align:center;color:var(--edt-muted,rgba(244,245,247,.6));padding-bottom:4px;font-size:11px}
.edt-j.edt-auj{color:var(--edt-now,#ff6a3d);font-weight:700}
.edt-heures,.edt-col{position:relative;height:var(--edt-h,330px)}
.edt-heures span{position:absolute;right:4px;transform:translateY(-50%);font:10px var(--edt-mono,ui-monospace,Menlo,monospace);color:var(--edt-muted,rgba(244,245,247,.6))}
.edt-col{border-left:1px solid var(--edt-line,rgba(255,255,255,.12));background:repeating-linear-gradient(to bottom,transparent 0 calc(10% - 1px),var(--edt-line,rgba(255,255,255,.12)) calc(10% - 1px) 10%)}
.edt-col.edt-auj{background-color:var(--edt-auj,rgba(255,106,61,.08))}
.edt-c{position:absolute;left:2px;right:2px;border-radius:6px;padding:3px 5px;overflow:hidden;color:#fff;background:var(--c-TD);display:flex;flex-direction:column;gap:1px}
.edt-c b{font-size:11px;font-weight:600;line-height:1.15;overflow-wrap:anywhere}
.edt-c span{font-size:9.5px;opacity:.85;font-variant-numeric:tabular-nums}
.edt-TP{background:var(--c-TP)}.edt-Projet{background:var(--c-Projet)}.edt-Test{background:var(--c-Test)}
.edt-c.edt-passe{opacity:.4}
.edt-c.edt-encours{outline:2px solid var(--edt-now,#ff6a3d);outline-offset:1px}
.edt-ligne{position:absolute;left:-4px;right:-2px;height:2px;margin-top:-1px;background:var(--edt-now,#ff6a3d);z-index:2;pointer-events:none}
.edt-ligne::before{content:"";position:absolute;left:0;top:-3px;width:8px;height:8px;border-radius:50%;background:inherit}
.edt-vide{grid-column:2/-1;text-align:center;padding:8px;color:var(--edt-muted,rgba(244,245,247,.6))}
</style>`;

// Rend la semaine en HTML. offset = semaines avant (-) ou après (+) la semaine courante.
export function renderWeek(now, offset, cours) {
  const lundi = lundiDe(now);
  lundi.setDate(lundi.getDate() + 7 * offset);
  const jours = [0, 1, 2, 3, 4].map((i) => new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + i));
  const auj = cle(now);
  const mNow = now.getHours() * 60 + now.getMinutes();
  const fmtM = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  let total = 0;

  const cols = jours.map((j) => {
    const k = cle(j);
    const blocs = cours.filter((c) => c[0] === k).map(([, deb, fin, code, type, salle]) => {
      total++;
      const a = minutes(deb), b = minutes(fin), nom = esc(NOMS[code] || code);
      const etat = k < auj || (k === auj && b <= mNow) ? " edt-passe" : k === auj && a <= mNow && mNow < b ? " edt-encours" : "";
      return `<div class="edt-c edt-${esc(type)}${etat}" style="top:${pct(a)}%;height:${pct(b) - pct(a)}%" title="${nom} ${deb}–${fin} ${esc(salle)}">` +
        `<b>${nom}${type === "Test" ? " · test" : ""}</b><span>${deb}–${fin}${salle ? " · " + esc(salle) : ""}</span></div>`;
    }).join("");
    const ligne = k === auj && mNow >= DEBUT && mNow <= FIN ? `<div class="edt-ligne" style="top:${pct(mNow)}%"></div>` : "";
    return `<div class="edt-col${k === auj ? " edt-auj" : ""}">${blocs}${ligne}</div>`;
  });

  const heures = Array.from({ length: 11 }, (_, i) => `<span style="top:${i * 10}%">${8 + i}h</span>`).join("");
  const tetes = jours.map((j) => `<div class="edt-j${cle(j) === auj ? " edt-auj" : ""}">${j.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}</div>`).join("");

  return STYLE + `<div class="edt">` +
    `<div class="edt-tete"><span class="edt-date">${now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>` +
    `<span class="edt-heure">${pad(now.getHours())}:${pad(now.getMinutes())}</span></div>` +
    `<div class="edt-sem">Semaine du ${fmtM(jours[0])} au ${fmtM(jours[4])}</div>` +
    `<div class="edt-grille"><div></div>${tetes}<div class="edt-heures">${heures}</div>${cols.join("")}` +
    (total ? "" : `<div class="edt-vide">Pas de cours cette semaine</div>`) + `</div></div>`;
}
