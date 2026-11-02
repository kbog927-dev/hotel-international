# Site de l'Hôtel International, Grand-Bassam (M. Ali Ouattara)

Site statique, rapide et pensé pour le mobile. Son objectif : **obtenir davantage de demandes de réservation directes**, tout en gardant le téléphone et la réservation sur place.

## État au 02/11/2026 : prêt à publier

| Information | Statut | Affichage |
|---|---|---|
| Nom : Hôtel International | Confirmé | Partout, données Google (JSON-LD) |
| Adresse : Quartier Château, Grand-Bassam, Côte d'Ivoire | Confirmé | Accueil, Contact, pied de page |
| Itinéraire : lien Google Maps | Confirmé | Bouton « Obtenir l'itinéraire » |
| Téléphone et WhatsApp : +225 07 87 87 18 00 | Confirmé | Boutons d'appel et WhatsApp |
| Demandes en ligne : par WhatsApp, rappel en moins de 5 heures | Confirmé | Formulaire, messages, « Bon à savoir » |
| Catégories de chambres, tarifs | Non fourni | Chambres présentées par leurs photos, « Tarif sur demande » |
| Arrivée, départ, paiement, acompte, annulation | Non fourni | Masqués |
| Services (piscine, bar, restaurant…) | Non fourni | Aucun service annoncé : page « L'hôtel en images » |
| Nom de domaine, hébergement | Non fourni | Sitemap et URL canonique à générer une fois le domaine connu |
| Mentions légales (raison sociale, RCCM, hébergeur) | Non fourni | Indiqué « à compléter » sur la page Mentions légales |

Rien n'a été inventé : une information non fournie est masquée ou remplacée par une formulation honnête. Pour revoir le site avec les marqueurs « À confirmer », passer `demoMode: true` dans `src/content.mjs`.

## Démarrage

Il faut Node.js 18 ou plus récent. Aucune dépendance à installer.

```bash
node build.mjs     # génère dist/
node serve.mjs     # prévisualisation sur http://localhost:4173
```

## Fichiers

```
site/
├── build.mjs                 générateur : src/ + assets/ → dist/
├── serve.mjs                 serveur local de prévisualisation
├── src/
│   ├── content.mjs           ★ TOUTES les informations modifiables (hôtel, chambres, services, envoi)
│   ├── lib.mjs               composants communs (en-tête, pied de page, barre d'action, SEO)
│   └── pages.mjs             contenu des 7 pages
├── assets/
│   ├── css/style.css         styles (mobile d'abord)
│   ├── js/main.js            menu, galerie, formulaire de réservation, mesure des clics
│   └── img/                  photos optimisées (800 px et 1600 px)
├── tools/optimize-images.ps1 redimensionne et étalonne les photos sources (niveaux auto, saturation +12 %, légère chaleur)
├── outils/suivi-demandes.csv modèle de suivi des demandes pour le gérant
└── dist/                     site prêt à publier (généré, ne pas modifier à la main)
```

Pages : Accueil, Chambres, Services, Demander une réservation, Contact et accès, Mentions légales, Confidentialité.

## Parcours visiteur et animations

Chaque animation sert un objectif : mener le visiteur vers « Demander une réservation ».

| Étape | Ce que voit le visiteur | But |
|---|---|---|
| Écran d'accueil (3 s) | Logo puis « Hôtel International » sur fond vert, puis l'écran se lève comme un rideau. Affiché à l'arrivée sur le site et à chaque actualisation, jamais entre deux pages | Installer l'identité de l'hôtel dès la première seconde |
| Arrivée | Photo en zoom lent, titre révélé mot à mot, bouton avec reflet lumineux et flèche qui avance | Capter l'attention, montrer l'action principale |
| Juste après | La carte « Vos dates de séjour » monte sous la photo et s'illumine quand on la remplit | Convertir tout de suite les visiteurs décidés |
| Défilement | Sections qui se dévoilent (photos qui se découvrent, cartes en cascade, bandeau à losanges qui se dessine) | Rassurer et donner envie, sans surcharger |
| Toujours | Ordinateur : barre de réservation flottante après la carte de dates, masquée près des appels finaux. Mobile : halo sur l'onglet « Réserver » à l'arrivée sur les chambres | Ne jamais perdre l'action de vue |
| Formulaire | Étapes numérotées, récapitulatif en direct (dates, nuits, personnes, chambre), coche animée à l'envoi | Réduire l'hésitation, confirmer clairement |

Les animations sont désactivées si le visiteur a demandé à réduire les animations dans son système. Le contenu reste toujours visible sans JavaScript.

Le logo est détouré automatiquement (fond transparent) par `tools/logo-transparent.ps1`.

## Ce que le gérant doit pouvoir modifier

Tout se trouve dans `src/content.mjs`, puis on relance `node build.mjs`.

| Information | Champ |
|---|---|
| Nom, ville, adresse, accès, lien Google Maps | `site.hotel.*` |
| Téléphone, WhatsApp, e-mail, horaires de la réception | `site.hotel.phone`, `whatsapp`, `email`, `contactHours` |
| Arrivée, départ, paiement, acompte, annulation | `site.hotel.checkIn` … `cancellation` |
| Chambres : nom, photos, description, capacité, tarif, équipements | `rooms[]` |
| Services : texte, photo, détails, statut confirmé | `services[]` (`confirmed: true` pour publier) |
| Galerie | `gallery[]` |

Règle : une valeur `null` n'est jamais présentée comme une information réelle. En publication, elle est masquée ou remplacée (« Tarif sur demande ») ; en démonstration, elle s'affiche « À confirmer ».

Dès que le gérant fournit ses catégories de chambres : renseigner `name`, `capacity`, `price`, `amenities` de chaque chambre. Le site passe alors automatiquement de « Comme la photo… » aux vraies catégories. Pour un service confirmé, passer `confirmed: true` : la page « L'hôtel en images » redevient « Services et espaces ».

Pour une modification autonome sans développeur, voir la priorité 2 ci-dessous (interface d'administration).

## Transmission des demandes de réservation

Le réglage se fait dans `site.reservation.mode`.

| Mode | Fonctionnement | Ce qu'il faut |
|---|---|---|
| `demo` | Rien n'est envoyé. Le message indique clairement qu'il s'agit d'une démonstration. | — |
| `whatsapp` (**actif**) | Ouvre WhatsApp avec la demande déjà rédigée vers le +225 07 87 87 18 00. Le client doit appuyer sur « Envoyer ». Un bouton de secours apparaît si WhatsApp ne s'ouvre pas. | Le numéro WhatsApp professionnel dans `hotel.whatsapp` |
| `endpoint` | Envoie la demande (POST JSON) à un service de formulaire, qui la transmet par e-mail. | L'URL dans `reservation.endpoint` (Formspree, Web3Forms ou une API) |

Dans tous les cas, le client ne voit jamais « Réservation confirmée ». Chaque demande reçoit une référence (`HI-AAAAMMJJ-XXXX`), reprise dans le message WhatsApp, qui permet de la suivre jusqu'à la confirmation.

Exemple de message reçu par l'hôtel :

```
Bonjour, voici ma demande de réservation (réf. HI-20261102-SSDK) :
Nom : Awa Koné
Téléphone : +225 07 00 00 00 00
Arrivée : 20/12/2026
Départ : 23/12/2026 (3 nuits)
Personnes : 2
Chambre : Comme la photo « Chambre lumineuse climatisée »
Demande particulière : Arrivée vers 18 h
```

L'URL d'un service de formulaire comme Formspree est publique par nature. Si une API maison est utilisée, ses clés restent côté serveur, dans des variables d'environnement, et jamais dans `content.mjs`.

Recommandation : les réservations arrivent surtout par téléphone. L'option la plus simple est `whatsapp`, à condition que l'hôtel ait un numéro WhatsApp suivi. Sinon, `endpoint` vers un e-mail consulté chaque jour, et le gérant rappelle le client.

## Mesure des résultats

Les clics et les envois produisent des événements dans `window.dataLayer`. Ils sont transmis à Plausible, un outil sans cookie, si `analytics.provider = 'plausible'`.

| Événement | Signification |
|---|---|
| `call_*` | Clic sur un bouton « Appeler » (`call_actionbar`, `call_ways`…) |
| `cta_reserver_*` | Clic vers la page de réservation |
| `whatsapp_*` | Clic vers WhatsApp |
| `reservation_envoi` | Formulaire valide soumis |
| `reservation_transmise` / `reservation_whatsapp_ouvert` | Demande transmise / WhatsApp ouvert |
| `reservation_echec`, `reservation_erreur_saisie` | Échec d'envoi / erreur de saisie |

**Distinguer les demandes des réservations confirmées.** Le gérant note chaque demande reçue, quel que soit le canal (site, téléphone, sur place, WhatsApp), dans `outils/suivi-demandes.csv`. Ce fichier s'ouvre dans Excel ou Google Sheets. La colonne `statut` prend les valeurs reçue, rappelée, confirmée, refusée ou sans suite.

Chaque mois, on calcule :
- visiteurs (outil d'audience) → clics « Réserver » et « Appeler » → demandes envoyées (`reservation_transmise`) → demandes reçues (fichier) → réservations confirmées (fichier) ;
- taux visiteurs → demandes, et taux demandes → réservations confirmées.

## Tests réalisés

- Rendu sur ordinateur (1366 px), tablette (768 px) et mobile (390 px), sans débordement horizontal ; menu mobile, barre d'onglets, en-tête fixé au défilement, carrousel de l'accueil.
- Carte « Vos dates de séjour » : les dates et le nombre de personnes sont transmis au formulaire de réservation (`?arrivee=&depart=&personnes=`).
- Galerie : filtres par catégorie, visionneuse limitée aux photos du filtre actif.
- 243 liens, ancres et images locaux vérifiés automatiquement : aucun lien cassé, aucun lien fictif (`tel:` n'est généré que si un numéro est renseigné).
- Formulaire : champs obligatoires, dates passées, départ avant l'arrivée, nombre de personnes, téléphone invalide. Messages d'erreur reliés aux champs (`aria-invalid`, `aria-describedby`) et focus placé sur la première erreur.
- Chambre présélectionnée depuis la page Chambres (`?chambre=`) ; date de départ proposée automatiquement.
- Modes d'envoi simulés : `demo`, `endpoint` (succès et échec réseau, avec message clair), `whatsapp` (avec et sans numéro), `endpoint` sans URL.
- Galerie : ouverture, navigation au clavier (flèches), légendes.
- Aucune erreur JavaScript.

Version publiée, testée le 02/11/2026 :
- Parcours WhatsApp complet (ouverture simulée) : message prérempli vers `wa.me/2250787871800` avec référence, dates, nuits, personnes, chambre, demande particulière ; récapitulatif en direct ; message de confirmation mentionnant le rappel en moins de 5 heures ; bouton de secours.
- Aucune mention « À confirmer » ni bandeau de démonstration dans `dist/` ; indexation autorisée ; données structurées `Hotel` générées.
- 275 liens et images vérifiés ; rendu mobile et ordinateur contrôlé.

Non testé : l'envoi réel d'un message WhatsApp depuis un téléphone (à faire une fois en ligne), un audit Lighthouse complet.

## Mise en ligne

1. `node build.mjs`, puis publier **le contenu de `dist/`** sur un hébergement statique. Le plus simple : glisser le dossier `dist/` sur [app.netlify.com/drop](https://app.netlify.com/drop) (gratuit, HTTPS inclus). Autres options : Cloudflare Pages, GitHub Pages ou un hébergement mutualisé.
2. Une fois le nom de domaine choisi, le renseigner dans `url` (`src/content.mjs`) et relancer `node build.mjs` : le sitemap et l'URL canonique sont alors générés.
3. Depuis un téléphone, envoyer une vraie demande et vérifier sa réception sur le WhatsApp de l'hôtel.
4. Ajouter le lien du site à la fiche Google Business Profile de l'hôtel. C'est le premier levier de visibilité locale à Grand-Bassam.
5. Compléter les mentions légales (raison sociale, RCCM, hébergeur, responsable de la publication) et les faire valider.

## Intégrations restant à connecter

| Priorité | Élément | État |
|---|---|---|
| 1 | Coordonnées, téléphone, adresse | Fait |
| 1 | Transmission des demandes | Fait : WhatsApp |
| 1 | Hébergement et nom de domaine | À choisir |
| 1 | Mentions légales | À compléter |
| 2 | Catégories, tarifs, conditions, services | Gabarit prêt, informations à fournir par l'hôtel |
| 2 | Bouton WhatsApp | Fait |
| 2 | Carte et itinéraire | Bouton fait ; carte intégrée possible avec une URL d'intégration (`mapsEmbedUrl`) |
| 2 | Statistiques | Événements en place, outil à choisir (Plausible recommandé) |
| 2 | Avis clients authentiques | Non intégré : aucun avis fourni |
| 2 | Interface d'administration | À évaluer : CMS sans serveur (Decap CMS) ou édition guidée du fichier |
| 3 | Moteur de réservation, disponibilités en temps réel, paiement en ligne | Non développé volontairement : nécessite un logiciel de gestion hôtelière fiable et un prestataire de paiement choisi |
