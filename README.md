# Hôtel International, Grand-Bassam

Site de réservation directe de l'Hôtel International (Quartier Château, Grand-Bassam, Côte d'Ivoire).

- **Code du site** : dossier [`site/`](site/). Documentation complète : [`site/README.md`](site/README.md).
- **Photos et logo originaux** : à la racine du dépôt. Ils sont redimensionnés et étalonnés par `site/tools/optimize-images.ps1`.

## Lancer le site en local

Il faut Node.js 18 ou plus récent. Aucune dépendance à installer.

```bash
cd site
node build.mjs
node serve.mjs
```

Ouvrir ensuite http://localhost:4173

## Mettre en ligne

Connecter ce dépôt à Netlify : le fichier `netlify.toml` configure tout (génération avec `node build.mjs`, publication du dossier `site/dist/`). Sans dépôt connecté, on peut aussi glisser le dossier `site/dist/` sur https://app.netlify.com/drop.
