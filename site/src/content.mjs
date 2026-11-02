// ─────────────────────────────────────────────────────────────────────────────
// CONTENU DU SITE — seul fichier à modifier pour mettre à jour les informations.
//
// Règle : une valeur `null` signifie « non confirmée par l'hôtel ».
// En mode démonstration, elle s'affiche « À confirmer » (surligné).
// En mode publication, elle est masquée ou remplacée par une formulation
// honnête (« Tarif sur demande »…), jamais par une information inventée.
// Ne remplacez `null` que par une information validée par M. Ouattara.
//
// Informations confirmées par le gérant le 02/11/2026 : nom, quartier et ville,
// lien Google Maps, téléphone, WhatsApp, délai de rappel.
//
// Après modification : `node build.mjs` pour régénérer le dossier dist/.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  // true tant que des informations essentielles ne sont pas confirmées :
  // bandeau « démonstration », balise noindex, aucune donnée structurée publiée.
  demoMode: false,

  // Adresse publique du site, sans « / » final (ex. "https://www.mon-hotel.com").
  // Vide = pas de sitemap ni d'URL canonique.
  url: '',

  hotel: {
    name: 'Hôtel International',
    nameConfirmed: true,

    city: 'Grand-Bassam',
    country: "Côte d'Ivoire",
    address: 'Quartier Château', // adresse telle qu'elle doit apparaître
    directions: null,    // repères pour trouver l'hôtel (« face à… », « à 5 min de… »)
    mapsUrl: 'https://maps.app.goo.gl/sgrpdpkhcQZu2j3j8',
    mapsEmbedUrl: null,  // URL d'intégration Google Maps (iframe), facultatif

    phone: '+225 07 87 87 18 00',
    whatsapp: '+225 07 87 87 18 00', // reçoit aussi les demandes de réservation du site
    // Délai dans lequel l'hôtel rappelle après une demande (affiché sur le site).
    responseTime: 'moins de 5 heures',
    email: null,
    contactHours: null,  // ex. "Réception joignable 24 h/24"

    checkIn: null,       // ex. "À partir de 12 h"
    checkOut: null,      // ex. "Jusqu'à 12 h"
    payment: null,       // ex. "Espèces, mobile money, carte bancaire"
    deposit: null,       // politique d'acompte
    cancellation: null,  // conditions d'annulation
    currency: null,      // ex. "FCFA"
  },

  // Transmission des demandes de réservation :
  //  'demo'     : rien n'est envoyé (prévisualisation)
  //  'whatsapp' : ouvre WhatsApp avec la demande préremplie vers hotel.whatsapp
  //  'endpoint' : POST JSON vers `endpoint` (Formspree, Web3Forms, API maison…)
  reservation: {
    mode: 'whatsapp',
    endpoint: '',
    // Préfixe des références de demande (ex. "HI-20261102-4F7K").
    refPrefix: 'HI',
  },

  // Mesure d'audience. null = aucun outil chargé (les événements restent
  // disponibles dans window.dataLayer). 'plausible' = sans cookie.
  analytics: {
    provider: null,
    domain: '',
  },
};

// Photos : clé = nom de fichier dans assets/img (variantes -800 et -1600).
// Photos fournies pour l'hôtel (dossier du projet).
export const photos = {
  'piscine':                  { w: 1600, h: 1063, alt: "Piscine carrelée de mosaïque bleue, paillotes et bâtiment orange de l'hôtel" },
  'facade':                   { w: 1600, h: 900,  alt: "Façade orange et bordeaux de l'hôtel avec l'enseigne International Hotel" },
  'cour-paillotes':           { w: 1600, h: 1063, alt: "Cour intérieure avec paillotes en chaume, palmier et bord de piscine" },
  'terrasse-restaurant':      { w: 1600, h: 1063, alt: "Terrasse couverte d'un toit de chaume, tables dressées et piliers peints" },
  'espace-billard':           { w: 1600, h: 1063, alt: "Table de billard sous une paillote, banquettes et piscine en arrière-plan" },
  'chambre-a':                { w: 1600, h: 1068, alt: "Chambre avec lit double au couvre-lit bleu et jaune, salle d'eau attenante" },
  'chambre-b':                { w: 1600, h: 1068, alt: "Chambre lumineuse avec lit double, climatiseur mural et salle d'eau attenante" },
  'salon-suite':              { w: 1600, h: 1063, alt: "Salon avec canapé et fauteuils en rotin, bureau et deux portes en bois" },
  'salon-decor-romantique':   { w: 1600, h: 738,  alt: "Coin salon en rotin avec bouteille de vin et pétales de rose sur la table" },
  'chambre-decor-romantique': { w: 1390, h: 1390, alt: "Lit décoré de pétales de rose formant un cœur" },
  'linge-coeurs':             { w: 1390, h: 1390, alt: "Linge de lit rouge à motifs de cœurs" },
  'salle-conference':         { w: 1600, h: 1200, alt: "Salle aménagée en conférence, table d'honneur avec micro et rangées de chaises" },
  'salle-banquet':            { w: 813,  h: 540,  alt: "Salle dressée pour un banquet avec nappes blanches et nœuds violets" },
};

// Catégories de chambres.
// Les noms, capacités, tarifs et équipements ne sont PAS confirmés : chaque
// emplacement correspond à un type de chambre visible sur les photos.
// `observed` = ce que l'on voit sur les photos (à valider), jamais une promesse.
// Icônes disponibles : bed, bath, snow, mirror, window, sofa, desk, door.
// `photoLabel` : intitulé descriptif de la photo, affiché tant que le nom de la
// catégorie n'est pas confirmé (ce n'est pas une catégorie commerciale).
export const rooms = [
  {
    id: 'chambre-1',
    name: null,
    placeholderName: 'Catégorie 1',
    photoLabel: 'Chambre au lit double',
    photos: ['chambre-a'],
    summary: "Une chambre claire et sobre, avec un lit double et une salle d'eau attenante.",
    observed: [
      { icon: 'bed', label: 'Lit double' },
      { icon: 'bath', label: "Salle d'eau avec douche et WC" },
      { icon: 'mirror', label: 'Grand miroir' },
    ],
    capacity: null,  // ex. "2 personnes"
    price: null,     // ex. "À partir de … / nuit"
    amenities: [],   // équipements confirmés uniquement
    conditions: null,
  },
  {
    id: 'chambre-2',
    name: null,
    placeholderName: 'Catégorie 2',
    photoLabel: 'Chambre lumineuse climatisée',
    photos: ['chambre-b'],
    summary: "Une chambre spacieuse et lumineuse, ouverte sur l'extérieur.",
    observed: [
      { icon: 'bed', label: 'Lit double' },
      { icon: 'snow', label: 'Climatiseur mural' },
      { icon: 'bath', label: "Salle d'eau avec douche" },
      { icon: 'window', label: 'Porte-fenêtre' },
    ],
    capacity: null,
    price: null,
    amenities: [],
    conditions: null,
  },
  {
    id: 'chambre-3',
    name: null,
    placeholderName: 'Catégorie 3',
    photoLabel: 'Chambre avec espace salon',
    photos: ['salon-suite', 'salon-decor-romantique'],
    summary: "Un espace salon séparé pour recevoir, travailler ou se détendre.",
    observed: [
      { icon: 'sofa', label: 'Salon en rotin' },
      { icon: 'desk', label: 'Bureau' },
      { icon: 'door', label: 'Pièce attenante' },
    ],
    capacity: null,
    price: null,
    amenities: [],
    conditions: null,
  },
];

// Services visibles sur les photos fournies — tous à confirmer.
// Passez `confirmed: true` uniquement après validation par l'hôtel ;
// en mode publication, seuls les services confirmés sont affichés.
// Icônes disponibles : pool, glass, dish, cue, mic, party, heart.
// `caption` : légende neutre de la photo, utilisée tant que le service n'est pas confirmé.
export const services = [
  { id: 'piscine',    icon: 'pool',  title: 'Piscine extérieure',   photo: 'piscine',              text: "Un bassin carrelé de mosaïque bleue au cœur de la cour, bordé de transats.", caption: "La piscine", details: null, confirmed: false },
  { id: 'bar',        icon: 'glass', title: 'Bar et paillotes',     photo: 'cour-paillotes',       text: "Des paillotes en chaume pour se retrouver à l'ombre, à quelques pas de la piscine.", caption: "Les paillotes", details: null, confirmed: false },
  { id: 'restaurant', icon: 'dish',  title: 'Restaurant',           photo: 'terrasse-restaurant',  text: "Une terrasse couverte aux piliers peints à la main, dressée pour le repas.", caption: "La terrasse couverte", details: null, confirmed: false },
  { id: 'billard',    icon: 'cue',   title: 'Détente et billard',   photo: 'espace-billard',       text: "Une table de billard et des banquettes sous la paillote.", caption: "Le coin billard", details: null, confirmed: false },
  { id: 'conference', icon: 'mic',   title: 'Salle de réunion',     photo: 'salle-conference',     text: "Une salle aménageable en conférence, avec table d'honneur et sonorisation.", caption: "La salle de réunion", details: null, confirmed: false },
  { id: 'reception',  icon: 'party', title: 'Salle de réception',   photo: 'salle-banquet',        text: "Pour vos repas de fête, anniversaires et réceptions.", caption: "La salle de réception", details: null, confirmed: false },
  { id: 'romantique', icon: 'heart', title: 'Décoration romantique', photo: 'chambre-decor-romantique', text: "Pétales de rose et linge assorti pour une occasion particulière.", caption: "Une chambre décorée", details: null, confirmed: false },
];

// Points à vérifier avec l'hôtel (affichés uniquement en mode démonstration).
export const servicesToCheck = [
  'Wi-Fi', 'Climatisation dans toutes les chambres', 'Petit-déjeuner', 'Parking',
  'Navette aéroport', 'Accès piscine pour les non-résidents', 'Capacité des salles',
  'Horaires du restaurant et du bar',
];

// Galerie filtrable : chaque photo appartient à un groupe.
export const galleryGroups = [
  ['chambres', 'Chambres'],
  ['detente', 'Piscine et détente'],
  ['restauration', 'Bar et restaurant'],
  ['salles', 'Salles'],
];
export const gallery = [
  { photo: 'facade', group: 'detente' },
  { photo: 'piscine', group: 'detente' },
  { photo: 'chambre-b', group: 'chambres' },
  { photo: 'cour-paillotes', group: 'restauration' },
  { photo: 'chambre-a', group: 'chambres' },
  { photo: 'terrasse-restaurant', group: 'restauration' },
  { photo: 'espace-billard', group: 'detente' },
  { photo: 'salon-suite', group: 'chambres' },
  { photo: 'chambre-decor-romantique', group: 'chambres' },
  { photo: 'salle-conference', group: 'salles' },
  { photo: 'linge-coeurs', group: 'chambres' },
  { photo: 'salle-banquet', group: 'salles' },
];
