// Composants HTML réutilisables (gabarits en chaînes, sans dépendance).
import { site, photos, services } from './content.mjs';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const h = site.hotel;
export const hotelName = esc(h.name);

// Valeur confirmée, ou marqueur visible « À confirmer ».
export function pending(label = 'À confirmer') {
  return `<mark class="pending" title="Information non confirmée par l'hôtel">${esc(label)}</mark>`;
}
// Valeur confirmée ; sinon « À confirmer » en démonstration, ou la formulation
// de repli (souvent vide) en publication.
export const value = (v, label, fallback = '') => (v ? esc(v) : site.demoMode ? pending(label) : esc(fallback));
// Mentions obligatoires non fournies (pages légales).
export const tbd = (label) => (site.demoMode ? pending(label) : '<span class="tbd">à compléter</span>');
// Les services ne sont présentés comme tels qu'une fois confirmés ; sinon, galerie.
export const hasServices = site.demoMode || services.some((s) => s.confirmed);
export const responseTime = h.responseTime;

// Mention pour un contenu issu des photos, en attente de validation.
export const fromPhotos = () =>
  site.demoMode ? `<p class="note-photo">D'après les photos fournies, à valider</p>` : '';

export function img(key, { sizes = '100vw', cls = '', loading = 'lazy', fetchpriority = '' } = {}) {
  const p = photos[key];
  if (!p) throw new Error(`Photo inconnue : ${key}`);
  const small = Math.min(800, p.w);
  return `<img class="${cls}" src="assets/img/${key}-800.jpg" srcset="assets/img/${key}-800.jpg ${small}w, assets/img/${key}-1600.jpg ${p.w}w" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="${loading}" decoding="async"${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ''}>`;
}

// Liens d'action : jamais de numéro fictif. Sans numéro confirmé,
// le bouton mène à la section contact qui l'indique.
export const telHref = () => (h.phone ? `tel:${h.phone.replace(/[^+\d]/g, '')}` : 'contact.html#telephone');
export const waHref = (text = '') =>
  h.whatsapp ? `https://wa.me/${h.whatsapp.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
export const mapsHref = () => h.mapsUrl || null;

// Icônes au trait (24 × 24), couleur héritée du texte.
const paths = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  bed: 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M3 18v2M21 18v2M6 9V6.5h5V9M13 9V6.5h5V9',
  bath: 'M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V5.5a2 2 0 0 1 4 0M7 20l-1 1.5M17 20l1 1.5',
  snow: 'M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7M9 4l3 2 3-2M9 20l3-2 3 2',
  mirror: 'M12 2c3.3 0 6 3.6 6 8s-2.7 8-6 8-6-3.6-6-8 2.7-8 6-8zM9 22h6M12 18v4',
  window: 'M4 3h16v18H4zM12 3v18M4 12h16',
  sofa: 'M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 18v2M19 18v2',
  desk: 'M3 8h18M5 8v12M19 8v12M14 8v6h5',
  door: 'M6 21V3h12v18M3 21h18M14 12h.01',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6',
  pool: 'M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 0-4 0M8 9h8M8 12h8',
  glass: 'M6 3h12l-1 6a5 5 0 0 1-10 0zM12 14v7M8 21h8',
  dish: 'M3 17h18M5 17a7 7 0 0 1 14 0M12 10V8M10 8h4M2 20h20',
  cue: 'M4 20 17 7M15 5l4 4M16 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  mic: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8',
  party: 'M4 20l4-12 8 8zM14 4l1 2M19 5l-2 2M20 10h-2M11 3v2',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  checkin: 'M10 4H5v16h5M14 8l4 4-4 4M18 12H8',
  checkout: 'M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10',
  card: 'M3 6h18v12H3zM3 10h18M7 15h3',
  wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3zM3 7l12-4v4M16 13h2',
  cancel: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  pin: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  menu: 'M4 7h16M4 12h16M4 17h16',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
};
const whatsappPath = 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2m4.5-6.1c-.25-.12-1.47-.72-1.7-.8s-.39-.13-.56.12-.64.8-.78.97-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.71-1.33a.45.45 0 0 0-.02-.42c-.06-.13-.56-1.35-.77-1.85s-.4-.42-.56-.43h-.48a.92.92 0 0 0-.66.31 2.8 2.8 0 0 0-.87 2.07 4.85 4.85 0 0 0 1 2.58 11.1 11.1 0 0 0 4.27 3.77c1.58.68 2.2.74 3 .62a2.55 2.55 0 0 0 1.67-1.18 2.07 2.07 0 0 0 .15-1.18c-.06-.11-.23-.17-.48-.3';

export function icon(name, size = 20) {
  if (name === 'whatsapp') {
    return `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}"><path fill="currentColor" d="${whatsappPath}"/></svg>`;
  }
  return `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`;
}

// Bandeau photo des pages intérieures.
export function pageHero({ title, lead, photo, extra = '' }) {
  return `<section class="page-hero">
  <div class="page-hero-media">${img(photo, { sizes: '100vw', loading: 'eager', fetchpriority: 'high' })}</div>
  <div class="wrap page-hero-copy">
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
    ${extra}
  </div>
</section>`;
}

const nav = [
  ['index.html', 'Accueil'],
  ['chambres.html', 'Chambres'],
  ['services.html', hasServices ? 'Services' : 'Galerie'],
  ['contact.html', 'Contact et accès'],
];

function demoBanner() {
  if (!site.demoMode) return '';
  return `<div class="demo-banner" role="note">
  <p><strong>Démonstration :</strong> les éléments surlignés ${pending()} et les photos ne sont pas encore validés par l'hôtel.</p>
</div>`;
}

function header(current) {
  const links = nav
    .map(([href, label]) => `<li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`)
    .join('');
  return `<header class="site-header${current === 'index.html' ? ' is-overlay' : ''}">
  <div class="wrap header-inner">
    <a class="brand" href="index.html">
      <img src="assets/img/logo-192.png" width="44" height="44" alt="">
      <span>${hotelName}</span>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Ouvrir le menu">${icon('menu', 22)}</button>
    <nav id="site-nav" class="site-nav" aria-label="Navigation principale">
      <ul>${links}</ul>
      <a class="btn btn-primary btn-sm btn-shine" href="reservation.html" data-track="cta_reserver_header">Demander une réservation</a>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <p class="footer-name"><img src="assets/img/logo-192.png" width="40" height="40" alt="">${hotelName}</p>
      <p>${value(h.address, 'Adresse à confirmer')}</p>
      <p>${value(h.city, 'Ville à confirmer')}${h.country ? `, ${esc(h.country)}` : ''}</p>
    </div>
    <div>
      <p class="footer-title">Réserver</p>
      <ul class="plain">
        <li><a href="${telHref()}" data-track="call_footer">Par téléphone : ${value(h.phone, 'numéro à confirmer')}</a></li>
        ${h.whatsapp ? `<li><a href="${waHref('Bonjour, ')}" target="_blank" rel="noopener" data-track="whatsapp_footer">Par WhatsApp : ${esc(h.whatsapp)}</a></li>` : ''}
        <li>Directement à la réception de l'hôtel</li>
        <li><a href="reservation.html" data-track="cta_reserver_footer">En ligne : demande de réservation</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-title">Informations</p>
      <ul class="plain">
        <li><a href="contact.html">Contact et accès</a></li>
        <li><a href="mentions-legales.html">Mentions légales</a></li>
        <li><a href="confidentialite.html">Confidentialité</a></li>
      </ul>
    </div>
  </div>
  <p class="wrap footer-copy">© ${new Date().getFullYear()} ${hotelName}</p>
</footer>`;
}

// Barre de navigation mobile, en pilule flottante. « Réserver » reste toujours en avant.
function tabBar(current) {
  const item = (href, ic, label, extra = '') =>
    `<a href="${href}" class="tab${extra}"${href === current ? ' aria-current="page"' : ''}>${icon(ic, 22)}<span>${label}</span></a>`;
  return `<nav class="tab-bar" aria-label="Accès rapide">
  ${item('index.html', 'home', 'Accueil')}
  ${item('chambres.html', 'bed', 'Chambres')}
  <a href="reservation.html" class="tab tab-book"${current === 'reservation.html' ? ' aria-current="page"' : ''} data-track="cta_reserver_tabbar">${icon('calendar', 22)}<span>Réserver</span></a>
  ${item('services.html', 'grid', hasServices ? 'Services' : 'Galerie')}
  <a href="${telHref()}" class="tab" data-track="call_tabbar">${icon('phone', 22)}<span>Appeler</span></a>
</nav>`;
}

// Barre de réservation flottante (ordinateur) : apparaît quand la première
// incitation à réserver sort de l'écran, disparaît près des appels finaux.
function bookDock(current) {
  if (current === 'reservation.html') return '';
  return `<aside class="book-dock" aria-label="Réservation rapide" inert>
  <span class="book-dock-logo"><img src="assets/img/logo-192.png" width="36" height="36" alt=""></span>
  <p><strong>${hotelName}</strong><span>Réservez directement auprès de l'hôtel</span></p>
  <a class="btn btn-ghost-dark btn-sm" href="${telHref()}" data-track="call_dock">${icon('phone', 18)}<span>Appeler</span></a>
  <a class="btn btn-primary btn-sm btn-shine" href="reservation.html" data-track="cta_reserver_dock"><span>Demander une réservation</span>${icon('arrow', 18)}</a>
</aside>`;
}

function jsonLd() {
  // Données structurées publiées uniquement hors démonstration, avec les champs confirmés.
  if (site.demoMode || !site.hotel.nameConfirmed) return '';
  const data = { '@context': 'https://schema.org', '@type': 'Hotel', name: h.name };
  if (site.url) { data.url = site.url; data.image = `${site.url}/assets/img/facade-1600.jpg`; }
  if (h.phone) data.telephone = h.phone;
  if (h.email) data.email = h.email;
  if (h.address || h.city) data.address = { '@type': 'PostalAddress', streetAddress: h.address || undefined, addressLocality: h.city || undefined, addressCountry: h.country === "Côte d'Ivoire" ? 'CI' : h.country || undefined };
  if (h.mapsUrl) data.hasMap = h.mapsUrl;
  if (h.checkIn) data.checkinTime = h.checkIn;
  if (h.checkOut) data.checkoutTime = h.checkOut;
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

// Écran d'accueil (3 s) : logo puis nom de l'hôtel. Affiché seulement si le script
// de <head> a ajouté la classe .intro ; il disparaît de lui-même (CSS).
function splash() {
  const words = h.name.split(/s+/).map((w, i) => `<span style="--i:${i}">${esc(w)}</span>`).join(' ');
  return `<div class="splash" aria-hidden="true">
  <div class="splash-inner">
    <span class="splash-logo"><img src="assets/img/logo-512.png" width="140" height="140" alt=""></span>
    <p class="splash-name">${words}</p>
  </div>
</div>`;
}

export function page({ path, title, description, body, ogImage = 'facade' }) {
  const fullTitle = path === 'index.html' ? `${h.name}${h.city ? ` à ${h.city}` : ''} | Réservation directe` : `${title} | ${h.name}`;
  const canonical = site.url ? `<link rel="canonical" href="${site.url}/${path === 'index.html' ? '' : path}">` : '';
  const og = site.url ? `<meta property="og:image" content="${site.url}/assets/img/${ogImage}-1600.jpg">` : '';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window)document.documentElement.classList.add("anim")</script>
<script>/* Écran d'accueil : à l'arrivée sur le site et à chaque actualisation, pas entre deux pages. */
(function(d){var show=true;try{var n=performance.getEntriesByType("navigation")[0];show=(n&&n.type==="reload")||!sessionStorage.getItem("hi-intro");sessionStorage.setItem("hi-intro","1")}catch(e){}
if(show){d.classList.add("intro","splash-on");setTimeout(function(){d.classList.remove("splash-on")},3000)}})(document.documentElement)</script>
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${site.demoMode ? '<meta name="robots" content="noindex, nofollow">' : ''}
${canonical}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
${og}
<meta name="theme-color" content="#14302b">
<link rel="icon" href="assets/img/logo-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;0,700;1,500&family=Figtree:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
${jsonLd()}
</head>
<body class="page-${path.replace('.html', '')}">
${splash()}
<a class="skip" href="#contenu">Aller au contenu</a>
${demoBanner()}
${header(path)}
<main id="contenu">
${body}
</main>
${footer()}
${bookDock(path)}
${tabBar(path)}
<script src="assets/js/config.js"></script>
<script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}
