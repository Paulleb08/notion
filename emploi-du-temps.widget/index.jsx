// Widget Übersicht : semaine en cours + marqueur à l'heure du Mac.
// edt.json est lu dans ton dépôt privé (jeton dans ~/.config/edt-token), gardé en cache 1 h pour marcher hors ligne.
import { renderWeek } from "./edt.js";

const DEPOT = "Paulleb08/notes-prive";

export const command = `f="$HOME/.cache/edt.json"; mkdir -p "$HOME/.cache"
if [ -z "$(find "$f" -mmin -60 2>/dev/null)" ]; then
  curl -sf -H "Authorization: Bearer $(cat "$HOME/.config/edt-token")" -H "Accept: application/vnd.github.raw" \
    "https://api.github.com/repos/${DEPOT}/contents/edt.json" -o "$f.tmp" && mv "$f.tmp" "$f"
fi
cat "$f" 2>/dev/null`;

export const refreshFrequency = 60 * 1000; // la semaine et le marqueur suivent l'heure du Mac, minute par minute

export const className = `
  top: 40px;
  right: 40px;
`;

export const render = ({ output }) => {
  let cours;
  try { cours = JSON.parse(output); } catch { cours = null; }
  if (!Array.isArray(cours)) {
    return <div style={{ padding: 12, borderRadius: 12, background: "rgba(18,20,26,.8)", color: "#fff", font: "13px -apple-system" }}>
      Emploi du temps introuvable : vérifie ~/.config/edt-token et ta connexion.
    </div>;
  }
  return <div dangerouslySetInnerHTML={{ __html: renderWeek(new Date(), 0, cours) }} />;
};
