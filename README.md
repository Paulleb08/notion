# Carnet

Site perso de notes (devoirs, évals, courses, projets pro/perso) avec un emploi du temps, plus un widget Übersicht pour le bureau du Mac.

Ce dépôt est **public** et ne contient aucune donnée : les notes (`notes.json`) et l'emploi du temps (`edt.json`) vivent dans le dépôt privé `Paulleb08/notes-prive`, lus et écrits avec un jeton GitHub gardé dans le navigateur.

## Mise en route

1. Crée le dépôt privé `notes-prive` (coche « Add a README »), puis dépose-y `edt.json` (Add file → Upload files).
2. Crée un jeton *fine-grained* : Settings → Developer settings → Fine-grained tokens. Accès : uniquement `notes-prive`. Permission : **Contents : Read and write**.
3. Ici : Settings → Pages → Deploy from a branch → `claude/admiring-allen-9k3egq`, dossier `/ (root)`.
4. Ouvre https://paulleb08.github.io/notion/ dans Safari et colle le jeton.

## Widget pour le Mac

Installe [Übersicht](https://tracesof.net/uebersicht/), copie ton jeton, puis :

```bash
mkdir -p ~/.config && pbpaste > ~/.config/edt-token && chmod 600 ~/.config/edt-token
```

```bash
d="$HOME/Library/Application Support/Übersicht/widgets/emploi-du-temps.widget" && mkdir -p "$d" && curl -fsSL -o "$d/index.jsx" https://paulleb08.github.io/notion/emploi-du-temps.widget/index.jsx && curl -fsSL -o "$d/edt.js" https://paulleb08.github.io/notion/emploi-du-temps.widget/edt.js
```

Le widget affiche la semaine en cours (le week-end, la suivante) et un trait à l'heure du Mac, rafraîchis chaque minute.

## Format des données

- `notes.json` : `[{ "id", "text", "cat": "devoir|eval|courses|pro|perso|", "due": "AAAA-MM-JJ"|null, "done", "created" }]`
- `edt.json` : `[["AAAA-MM-JJ", "HH:MM", "HH:MM", "MATIERE", "TD|TP|Projet|Test", "salle"]]`

Test du rendu : `node emploi-du-temps.widget/edt.test.mjs`
