// Contenu de chaque page. Les textes s'appuient uniquement sur les réponses
// du gérant et sur les photos fournies ; tout le reste passe par content.mjs.
import { site, rooms, services, servicesToCheck, gallery, galleryGroups } from './content.mjs';
import { esc, page, pageHero, img, value, pending, tbd, fromPhotos, telHref, waHref, mapsHref, icon, hotelName, hasServices } from './lib.mjs';

const h = site.hotel;
const visibleServices = site.demoMode ? services : services.filter((s) => s.confirmed);
// Sans nom de catégorie confirmé : intitulé descriptif de la photo (publication).
const roomName = (r) => (r.name ? esc(r.name) : site.demoMode ? pending(r.placeholderName) : esc(r.photoLabel));
const roomOption = (r) => r.name || (site.demoMode ? r.placeholderName : `Comme la photo « ${r.photoLabel} »`);
const priceLabel = (r) => (r.price || site.demoMode ? 'À partir de' : 'Tarif');
const priceValue = (r, label) => value(r.price, label, 'Sur demande');
const placeLine = () => `${hotelName}, ${value(h.city, 'ville à confirmer')}`;
// Délai de rappel confirmé par l'hôtel, repris dans tout le parcours.
const callback = h.responseTime ? `L'hôtel vous recontacte en ${esc(h.responseTime)}` : "L'hôtel vous recontacte";
const pricesLine = `Pour connaître les chambres disponibles et leurs tarifs à vos dates, envoyez votre demande. ${callback}.`;

function callLine() {
  return h.phone ? `<a href="${telHref()}" data-track="call_inline">${esc(h.phone)}</a>` : pending('Numéro à confirmer');
}

// Champs « Arrivée | Départ » côte à côte, comme une carte de réservation.
function dateFields(prefix = '') {
  return `<div class="dates">
      <div class="date-field">
        <label for="${prefix}arrivee">Arrivée</label>
        <input id="${prefix}arrivee" name="arrivee" type="date" required>
      </div>
      <span class="date-sep" aria-hidden="true">${icon('calendar', 18)}</span>
      <div class="date-field">
        <label for="${prefix}depart">Départ</label>
        <input id="${prefix}depart" name="depart" type="date" required>
      </div>
    </div>`;
}

function photoCard(r) {
  return `<li>
    <a class="photo-card" href="chambres.html#${r.id}">
      ${img(r.photos[0], { sizes: '(min-width: 960px) 30vw, (min-width: 640px) 45vw, 82vw' })}
      <span class="photo-card-body">
        <span class="photo-card-text">
          <span class="photo-card-title">${roomName(r)}</span>
          <span class="photo-card-sub">${esc(r.summary)}</span>
        </span>
        <span class="photo-card-price"><small>${priceLabel(r)}</small>${priceValue(r, 'à confirmer')}</span>
          <span class="photo-card-cta">Voir la chambre${icon('arrow', 16)}</span>
      </span>
    </a>
  </li>`;
}

// ─── Accueil ────────────────────────────────────────────────────────────────
function home() {
  const slides = ['piscine', 'facade', 'cour-paillotes'];
  const slideHtml = slides
    .map((k, i) => `<div class="hero-slide${i === 0 ? ' is-active' : ''}">${img(k, { sizes: '100vw', loading: 'eager', fetchpriority: i === 0 ? 'high' : 'low' })}</div>`)
    .join('');
  const dots = slides
    .map((_, i) => `<button type="button" class="hero-dot" aria-label="Photo ${i + 1} sur ${slides.length}"${i === 0 ? ' aria-current="true"' : ''}></button>`)
    .join('');

  const chips = visibleServices
    .slice(0, 6)
    .map((s) => `<li><a class="chip" href="services.html#${s.id}"><span class="chip-icon">${icon(s.icon, 22)}</span><span>${esc(s.title)}</span></a></li>`)
    .join('');

  // Services confirmés, ou, à défaut, les photos de l'hôtel avec une légende neutre.
  const bento = (hasServices ? visibleServices : services)
    .slice(0, 4)
    .map(
      (s, i) => `<a class="bento-item${i === 0 ? ' bento-main' : ''}" href="services.html${hasServices ? `#${s.id}` : ''}">
      ${img(s.photo, { sizes: i === 0 ? '(min-width: 960px) 50vw, 100vw' : '(min-width: 960px) 25vw, 50vw' })}
      <span class="bento-label">${esc(hasServices ? s.title : s.caption)}</span>
    </a>`,
    )
    .join('');

  // Conditions : affichées si confirmées (ou « À confirmer » en démonstration),
  // complétées par ce que l'hôtel a confirmé sur son fonctionnement.
  const facts = [
    ['clock', 'Réponse de l\'hôtel', h.responseTime ? `En ${h.responseTime}` : null],
    ['phone', 'Réserver', h.phone ? (h.whatsapp ? 'Par téléphone, WhatsApp ou sur place' : 'Par téléphone ou sur place') : null],
    ['checkin', 'Arrivée', h.checkIn],
    ['checkout', 'Départ', h.checkOut],
    ['card', 'Paiement accepté', h.payment],
    ['wallet', 'Acompte', h.deposit],
    ['cancel', 'Annulation', h.cancellation],
    ['bed', 'Tarifs', site.demoMode ? null : 'Communiqués selon vos dates'],
  ]
    .filter(([, , v], i) => v || (site.demoMode && i > 1))
    .map(([ic, label, v]) => `<li><span class="fact-icon">${icon(ic, 22)}</span><span><strong>${label}</strong>${value(v)}</span></li>`)
    .join('');

  const body = `
<section class="hero" aria-label="Présentation de l'hôtel">
  <div class="hero-slides">${slideHtml}</div>
  <div class="wrap hero-copy">
    <p class="hero-place">${icon('pin', 18)}<span>${placeLine()}</span></p>
    <h1>Réservez votre chambre <em>directement</em> auprès de l'hôtel</h1>
    <p class="lead">Découvrez les chambres et les espaces de l'hôtel, puis appelez la réception ou envoyez votre demande en ligne. ${callback} pour confirmer la disponibilité.</p>
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg btn-shine" href="reservation.html" data-track="cta_reserver_hero"><span>Demander une réservation</span>${icon('arrow', 20)}</a>
      <a class="hero-link" href="chambres.html" data-track="cta_chambres_hero"><span>Découvrir les chambres</span>${icon('arrow', 18)}</a>
    </div>
    <div class="hero-dots" role="group" aria-label="Choisir la photo">${dots}</div>
  </div>
</section>

<div class="wrap quick-book-wrap">
  <form class="quick-book" action="reservation.html" method="get" data-quick-book>
    <p class="quick-title">Vos dates de séjour</p>
    ${dateFields('qb-')}
    <div class="guests-field">
      <label for="qb-personnes">Personnes</label>
      <input id="qb-personnes" name="personnes" type="number" inputmode="numeric" min="1" max="20" value="2">
    </div>
    <button class="btn btn-primary" type="submit" data-track="cta_reserver_quickbook">Continuer ma demande</button>
  </form>
</div>

<section class="section" aria-labelledby="ways-title">
  <div class="wrap">
    <h2 id="ways-title">Réservez comme vous préférez</h2>
    <div class="ways-grid">
      <div class="way">
        <span class="tile">${icon('phone', 24)}</span>
        <h3>${h.whatsapp ? 'Par téléphone ou WhatsApp' : 'Par téléphone'}</h3>
        <p>Appelez la réception pour connaître les disponibilités et réserver.</p>
        <p class="way-detail">${callLine()}</p>
        <a class="btn btn-secondary" href="${telHref()}" data-track="call_ways">Appeler l'hôtel</a>
      </div>
      <div class="way">
        <span class="tile">${icon('door', 24)}</span>
        <h3>Sur place</h3>
        <p>Présentez-vous directement à la réception de l'hôtel.</p>
        <p class="way-detail">${value(h.address, 'Adresse à confirmer')}${h.city ? `, ${esc(h.city)}` : ''}</p>
        <a class="btn btn-secondary" href="contact.html#acces" data-track="cta_acces_ways">Voir l'accès</a>
      </div>
      <div class="way way-accent">
        <span class="tile tile-accent">${icon('calendar', 24)}</span>
        <h3>En ligne</h3>
        <p>Indiquez vos dates et la chambre souhaitée. ${callback} pour confirmer.</p>
        <p class="way-detail">Sans inscription ni paiement en ligne</p>
        <a class="btn btn-primary" href="reservation.html" data-track="cta_reserver_ways">Demander une réservation</a>
      </div>
    </div>
  </div>
</section>

<section class="section section-tint" aria-labelledby="rooms-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="rooms-title">Les chambres</h2>
      <a class="view-all" href="chambres.html"><span>Voir tout</span>${icon('arrow', 16)}</a>
    </div>
    ${site.demoMode ? `<p class="demo-note">Noms, capacités et tarifs des catégories : ${pending()}</p>` : `<p class="section-lead">${pricesLine}</p>`}
    <ul class="card-rail">${rooms.map(photoCard).join('')}</ul>
  </div>
</section>

<section class="section" aria-labelledby="places-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="places-title">${hasServices ? 'Sur place' : "L'hôtel en images"}</h2>
      <a class="view-all" href="services.html"><span>${hasServices ? 'Voir tout' : 'Toutes les photos'}</span>${icon('arrow', 16)}</a>
    </div>
    ${fromPhotos()}
    ${hasServices ? `<ul class="chips">${chips}</ul>` : ''}
    <div class="bento">${bento}</div>
  </div>
</section>

<section class="section" aria-labelledby="info-title">
  <div class="wrap">
    <div class="info-panel">
      <h2 id="info-title">Bon à savoir avant de réserver</h2>
      <ul class="facts">${facts}</ul>
    </div>
  </div>
</section>

<section class="section section-flush" aria-labelledby="closing-title" data-dock-stop>
  <div class="wrap">
    <div class="closing-card">
      ${img('cour-paillotes', { sizes: '(min-width: 1200px) 1150px, 100vw' })}
      <div class="closing-copy">
        <h2 id="closing-title">Vos dates sont fixées ?</h2>
        <p>Envoyez votre demande en ligne ou appelez la réception. ${callback} et vous confirme la disponibilité avant toute réservation.</p>
        <div class="actions">
          <a class="btn btn-primary btn-lg btn-shine" href="reservation.html" data-track="cta_reserver_closing"><span>Demander une réservation</span>${icon('arrow', 20)}</a>
          <a class="btn btn-ghost-light btn-lg" href="${telHref()}" data-track="call_closing">${icon('phone', 20)}<span>Appeler l'hôtel</span></a>
        </div>
      </div>
    </div>
  </div>
</section>`;

  return page({
    path: 'index.html',
    title: 'Accueil',
    description: `${h.name}${h.city ? `, hôtel à ${h.city}${h.address ? ` (${h.address})` : ''}` : ''} : découvrez les chambres et réservez directement auprès de l'hôtel, par téléphone, WhatsApp ou en ligne.`,
    ogImage: 'piscine',
    body,
  });
}

// ─── Chambres ───────────────────────────────────────────────────────────────
function chambres() {
  const items = rooms
    .map((r) => {
      const [main, ...more] = r.photos;
      // Capacité seulement si confirmée ; le reste décrit ce que montre la photo.
      const feats = (r.capacity || site.demoMode ? [`<li>${icon('users', 20)}<span>${value(r.capacity, 'Capacité à confirmer')}</span></li>`] : [])
        .concat(r.observed.map((o) => `<li>${icon(o.icon, 20)}<span>${esc(o.label)}</span></li>`))
        .join('');
      const amenities = r.amenities.length
        ? `<ul class="ticks">${r.amenities.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`
        : site.demoMode ? `<p>${pending()}</p>` : '';
      return `<article class="room" id="${r.id}" aria-labelledby="${r.id}-title">
  <div class="room-media${more.length ? ' has-more' : ''}">
    ${img(main, { sizes: '(min-width: 960px) 55vw, 100vw', cls: 'room-main' })}
    ${more.map((k) => img(k, { sizes: '(min-width: 960px) 25vw, 50vw', cls: 'room-more' })).join('')}
  </div>
  <div class="room-panel">
    <h2 id="${r.id}-title">${roomName(r)}</h2>
    <p class="room-loc">${icon('pin', 16)}<span>${placeLine()}</span></p>
    ${site.demoMode ? '' : `<p class="room-feats-note">Visible sur la photo</p>`}
    <ul class="room-feats">${feats}</ul>
    ${site.demoMode ? `<p class="note-photo">Équipements d'après les photos fournies, à valider</p>` : ''}
    <h3>À propos de cette chambre</h3>
    <p>${esc(r.summary)}</p>
    ${amenities ? `<h3>Équipements</h3>${amenities}` : ''}
    ${r.conditions || site.demoMode ? `<h3>Conditions</h3><p>${value(r.conditions)}</p>` : ''}    <div class="room-book">
      <p class="room-price"><small>${priceLabel(r)}</small>${priceValue(r, 'Tarif à confirmer')}</p>
      <a class="btn btn-primary btn-lg" href="reservation.html?chambre=${r.id}" data-track="cta_reserver_chambre" data-room="${r.id}">Demander cette chambre</a>
    </div>
  </div>
</article>`;
    })
    .join('');

  const body = `
${pageHero({
  title: 'Les chambres',
  lead: `Découvrez les chambres en images, puis envoyez votre demande pour vos dates. ${callback} pour confirmer la disponibilité et le tarif.`,
  photo: 'chambre-b',
})}
${site.demoMode ? `<div class="wrap"><p class="demo-note">Les catégories ci-dessous correspondent aux types de chambres visibles sur les photos. Leurs noms, capacités, tarifs et équipements sont ${pending('à confirmer')}.</p></div>` : ''}
<div class="wrap rooms">${items}</div>
<section class="section section-tint" data-dock-stop>
  <div class="wrap narrow center">
    <h2>Vous hésitez entre deux chambres ?</h2>
    <p>La réception peut vous conseiller selon vos dates et le nombre de personnes.</p>
    <div class="actions center">
      <a class="btn btn-secondary" href="${telHref()}" data-track="call_chambres_help">${icon('phone', 20)}<span>Appeler l'hôtel</span></a>
      <a class="btn btn-primary" href="reservation.html" data-track="cta_reserver_chambres_help">Demander une réservation</a>
    </div>
  </div>
</section>`;

  return page({
    path: 'chambres.html',
    title: 'Chambres',
    description: `Les chambres de ${h.name} : photos, équipements et demande de réservation directe auprès de l'hôtel.`,
    ogImage: 'chambre-b',
    body,
  });
}

// ─── Services ───────────────────────────────────────────────────────────────
function servicesPage() {
  const items = visibleServices
    .map(
      (s) => `<article class="service" id="${s.id}">
    <div class="service-media">
      ${img(s.photo, { sizes: '(min-width: 960px) 30vw, (min-width: 640px) 45vw, 100vw' })}
      <span class="tile tile-float">${icon(s.icon, 22)}</span>
    </div>
    <h2>${esc(s.title)}${s.confirmed ? '' : ` ${pending()}`}</h2>
    <p>${esc(s.text)}</p>
    ${s.details ? `<p class="service-details">${esc(s.details)}</p>` : site.demoMode ? `<p class="service-details">Horaires, conditions et tarifs : ${pending()}</p>` : ''}
  </article>`,
    )
    .join('');

  const toCheck = site.demoMode
    ? `<section class="section section-tint" aria-labelledby="check-title">
  <div class="wrap narrow">
    <h2 id="check-title">À vérifier avec l'hôtel</h2>
    <p>Ces services ne figurent pas sur les photos ou doivent être précisés. Ils ne seront affichés qu'une fois confirmés.</p>
    <ul class="checklist">${servicesToCheck.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  </div>
</section>`
    : '';

  const filters = [['tout', 'Tout']]
    .concat(galleryGroups)
    .map(([id, label], i) => `<li><button type="button" class="filter" data-filter="${id}" aria-pressed="${i === 0}">${esc(label)}</button></li>`)
    .join('');
  const thumbs = gallery
    .map(
      (g, i) => `<li data-group="${g.group}"><button type="button" class="thumb" data-index="${i}" aria-label="Agrandir la photo ${i + 1}">${img(g.photo, { sizes: '(min-width: 960px) 24vw, 45vw' })}</button></li>`,
    )
    .join('');

  // Sans service confirmé, la page devient une galerie : aucune prestation n'est annoncée.
  const intro = hasServices
    ? { title: 'Services et espaces', lead: 'Ce que vous trouverez sur place, pour votre séjour comme pour vos événements.' }
    : { title: "L'hôtel en images", lead: `Découvrez l'hôtel, ses chambres et ses espaces. Une question sur votre séjour ? Contactez l'hôtel par téléphone${h.whatsapp ? ' ou WhatsApp' : ''}.` };

  const body = `
${pageHero({ ...intro, photo: 'cour-paillotes', extra: fromPhotos() })}
${hasServices ? `<div class="wrap services">${items}</div>` : ''}
${toCheck}
<section class="section${hasServices ? '' : ' section-flush'}" aria-labelledby="gallery-title">
  <div class="wrap">
    <h2 id="gallery-title">${hasServices ? 'Galerie' : 'Toutes les photos'}</h2>
    <ul class="filters" aria-label="Filtrer la galerie">${filters}</ul>
    <ul class="gallery">${thumbs}</ul>
    <p class="gallery-empty" hidden>Aucune photo dans cette catégorie.</p>
  </div>
</section>
<dialog class="lightbox" aria-label="Photo agrandie">
  <img alt="">
  <p class="lightbox-caption"></p>
  <div class="lightbox-nav">
    <button type="button" data-dir="-1">Photo précédente</button>
    <button type="button" data-close>Fermer</button>
    <button type="button" data-dir="1">Photo suivante</button>
  </div>
</dialog>`;

  return page({
    path: 'services.html',
    title: intro.title,
    description: hasServices
      ? `Services, espaces communs et salles de ${h.name}. Photos et informations pratiques.`
      : `${h.name}${h.city ? ` à ${h.city}` : ''} en images : chambres, piscine, paillotes, terrasse et salles.`,
    ogImage: 'cour-paillotes',
    body,
  });
}

// ─── Réservation ────────────────────────────────────────────────────────────
function reservation() {
  const options = rooms
    .map((r) => `<option value="${r.id}">${esc(roomOption(r))}${r.price ? ` (${esc(r.price)})` : ''}</option>`)
    .join('');
  const viaWhatsapp = site.reservation.mode === 'whatsapp' && h.whatsapp;

  const body = `
${pageHero({
  title: 'Demander une réservation',
  lead: `Indiquez vos dates et vos coordonnées. L'hôtel vérifie la disponibilité ; ${callback.charAt(0).toLowerCase() + callback.slice(1)} pour confirmer votre réservation.`,
  photo: 'piscine',
})}
<div class="wrap booking">
  <div class="booking-card">
    <form id="reservation-form" class="form" novalidate>
      <fieldset>
        <legend><span class="step-num">1</span>Votre séjour</legend>
        ${dateFields()}
        <div class="date-errors">
          <p class="error" id="arrivee-error" hidden></p>
          <p class="error" id="depart-error" hidden></p>
        </div>
        <div class="row-2">
          <div class="field">
            <label for="personnes">Nombre de personnes</label>
            <input id="personnes" name="personnes" type="number" inputmode="numeric" min="1" max="20" value="2" required>
            <p class="error" id="personnes-error" hidden></p>
          </div>
          <div class="field">
            <label for="chambre">Chambre souhaitée</label>
            <select id="chambre" name="chambre">
              <option value="">Je ne sais pas encore</option>
              ${options}
            </select>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend><span class="step-num">2</span>Vos coordonnées</legend>
        <div class="field">
          <label for="nom">Nom et prénom</label>
          <input id="nom" name="nom" type="text" autocomplete="name" maxlength="80" required>
          <p class="error" id="nom-error" hidden></p>
        </div>
        <div class="field">
          <label for="telephone">Téléphone</label>
          <input id="telephone" name="telephone" type="tel" autocomplete="tel" inputmode="tel" maxlength="25" aria-describedby="telephone-hint" required>
          <p class="hint" id="telephone-hint">L'hôtel vous recontacte à ce numéro pour confirmer.</p>
          <p class="error" id="telephone-error" hidden></p>
        </div>
        <div class="field">
          <label for="message">Demande particulière <span class="optional">(facultatif)</span></label>
          <textarea id="message" name="message" rows="3" maxlength="500"></textarea>
        </div>
        <div class="hp" aria-hidden="true">
          <label for="site_web">Ne pas remplir</label>
          <input id="site_web" name="site_web" type="text" tabindex="-1" autocomplete="off">
        </div>
      </fieldset>
      <p class="privacy">Vos informations servent uniquement à traiter votre demande. <a href="confidentialite.html">En savoir plus</a></p>
      ${viaWhatsapp ? `<p class="send-hint">${icon('whatsapp', 18)}<span>Votre demande s'ouvre dans WhatsApp, déjà rédigée : il ne vous reste qu'à l'envoyer.</span></p>` : ''}
      <button class="btn btn-primary btn-lg btn-block btn-shine" type="submit">${viaWhatsapp ? `${icon('whatsapp', 20)}<span>Envoyer ma demande sur WhatsApp</span>` : 'Envoyer ma demande'}</button>
      <p class="form-note">Ceci est une demande : votre réservation n'est confirmée qu'après la réponse de l'hôtel.</p>
      <div class="form-status" role="alert" hidden></div>
    </form>

    <div class="result" id="reservation-result" tabindex="-1" hidden>
      <svg class="result-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7.5 7.5L38 19"/></svg>
      <h2 class="result-title"></h2>
      <p class="result-text"></p>
      <p class="result-ref" hidden>Votre référence : <strong></strong></p>
      <p>Pour toute question : ${h.phone ? `<a href="${telHref()}" data-track="call_result">appeler l'hôtel au ${esc(h.phone)}</a>` : `appeler l'hôtel (${pending('numéro à confirmer')})`}.</p>
      <div class="actions">
        ${viaWhatsapp ? `<a class="btn btn-primary result-wa" target="_blank" rel="noopener" data-track="whatsapp_result" hidden>${icon('whatsapp', 20)}<span>WhatsApp ne s'est pas ouvert ? Ouvrir</span></a>` : ''}
        <button class="btn btn-secondary" type="button" data-new-request>Faire une autre demande</button>
      </div>
    </div>
  </div>

  <aside class="booking-aside" aria-labelledby="steps-title">
    <div class="summary" aria-live="polite">
      <p class="summary-title">Votre demande</p>
      <dl>
        <div><dt>${icon('checkin', 18)}Arrivée</dt><dd data-sum="arrivee">À choisir</dd></div>
        <div><dt>${icon('checkout', 18)}Départ</dt><dd data-sum="depart">À choisir</dd></div>
        <div><dt>${icon('clock', 18)}Durée</dt><dd data-sum="nuits">—</dd></div>
        <div><dt>${icon('users', 18)}Personnes</dt><dd data-sum="personnes">2</dd></div>
        <div><dt>${icon('bed', 18)}Chambre</dt><dd data-sum="chambre">Sans préférence</dd></div>
      </dl>
    </div>
    <h2 id="steps-title">Comment ça se passe</h2>
    <ol class="steps">
      <li><strong>Vous envoyez votre demande</strong> avec vos dates et votre numéro.</li>
      <li><strong>L'hôtel vérifie la disponibilité</strong> de la chambre souhaitée.</li>
      <li><strong>${callback}</strong> pour confirmer la réservation, le tarif et les conditions.</li>
    </ol>
    <div class="aside-call">
      <p>Vous préférez réserver de vive voix ?</p>
      <a class="btn btn-ghost-light btn-block" href="${telHref()}" data-track="call_reservation">${icon('phone', 20)}<span>Appeler l'hôtel</span></a>
      <p class="aside-detail">${callLine()}</p>
      ${h.whatsapp ? `<a class="btn btn-ghost-light btn-block" href="${waHref("Bonjour, je souhaite réserver une chambre.")}" data-track="whatsapp_reservation" target="_blank" rel="noopener">${icon('whatsapp', 20)}<span>Contacter l'hôtel sur WhatsApp</span></a>` : ''}
    </div>
  </aside>
</div>`;

  return page({
    path: 'reservation.html',
    title: 'Demander une réservation',
    description: `Envoyez votre demande de réservation à ${h.name}. L'hôtel vous recontacte pour confirmer la disponibilité.`,
    body,
  });
}

// ─── Contact et accès ───────────────────────────────────────────────────────
function contact() {
  const maps = mapsHref();
  const wa = waHref('Bonjour, ');
  const card = (id, ic, title, content) =>
    `<section class="contact-card"${id ? ` id="${id}"` : ''} aria-labelledby="${id || ic}-title">
      <span class="tile">${icon(ic, 22)}</span>
      <div>
        <h2 id="${id || ic}-title">${title}</h2>
        ${content}
      </div>
    </section>`;

  const cards = [
    card('telephone', 'phone', 'Téléphone', `<p class="contact-value">${callLine()}</p>
      ${h.contactHours ? `<p>${esc(h.contactHours)}</p>` : site.demoMode ? `<p>Horaires de la réception : ${pending()}</p>` : ''}
      ${h.phone ? `<a class="btn btn-primary" href="${telHref()}" data-track="call_contact">Appeler l'hôtel</a>` : ''}`),
    wa
      ? card('', 'whatsapp', 'WhatsApp', `<p class="contact-value">${esc(h.whatsapp)}</p>
      <a class="btn btn-secondary" href="${wa}" target="_blank" rel="noopener" data-track="whatsapp_contact">Contacter l'hôtel sur WhatsApp</a>`)
      : site.demoMode
        ? card('', 'whatsapp', 'WhatsApp', `<p>Numéro professionnel : ${pending('à confirmer, si disponible')}</p>`)
        : '',
    h.email
      ? card('', 'mail', 'E-mail', `<p class="contact-value"><a href="mailto:${esc(h.email)}">${esc(h.email)}</a></p>`)
      : site.demoMode
        ? card('', 'mail', 'E-mail', `<p>${pending()}</p>`)
        : '',
    card('acces', 'pin', 'Adresse', `<p class="contact-value">${value(h.address, 'Adresse à confirmer')}</p>
      <p>${value(h.city, 'Ville à confirmer')}${h.country ? `, ${esc(h.country)}` : ''}</p>
      ${h.directions ? `<p>${esc(h.directions)}</p>` : ''}
      ${maps ? `<a class="btn btn-secondary" href="${esc(maps)}" target="_blank" rel="noopener" data-track="itineraire">${icon('map', 20)}<span>Obtenir l'itinéraire</span></a>` : site.demoMode ? `<p>Lien d'itinéraire Google Maps : ${pending()}</p>` : ''}`),
  ].join('');

  const body = `
${pageHero({
  title: 'Contact et accès',
  lead: "Appelez la réception, venez directement à l'hôtel ou envoyez une demande en ligne.",
  photo: 'facade',
})}
<div class="wrap contact">
  <div class="contact-list">${cards}</div>
  <figure class="contact-photo">
    ${img('facade', { sizes: '(min-width: 960px) 45vw, 100vw' })}
    <figcaption>Repérez la façade orange et bordeaux depuis la rue.</figcaption>
  </figure>
</div>
${h.mapsEmbedUrl ? `<div class="wrap map"><iframe title="Carte d'accès à l'hôtel" src="${esc(h.mapsEmbedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ''}
<section class="section section-tint" data-dock-stop>
  <div class="wrap narrow center">
    <h2>Prêt à réserver ?</h2>
    <p>Envoyez vos dates : ${callback.charAt(0).toLowerCase() + callback.slice(1)} pour confirmer.</p>
    <a class="btn btn-primary btn-lg" href="reservation.html" data-track="cta_reserver_contact"><span>Demander une réservation</span>${icon('arrow', 20)}</a>
  </div>
</section>`;

  return page({
    path: 'contact.html',
    title: 'Contact et accès',
    description: `Téléphone, WhatsApp, adresse et itinéraire de ${h.name}${h.city ? `, ${h.address ? `${h.address}, ` : ''}${h.city}` : ''}. Réservez par téléphone, sur place ou en ligne.`,
    body,
  });
}

// ─── Pages légales (gabarits à faire valider selon la juridiction) ──────────
function mentions() {
  const body = `
<section class="page-intro"><div class="wrap narrow"><h1>Mentions légales</h1></div></section>
<div class="wrap narrow prose">
  ${site.demoMode ? `<p class="demo-note">Gabarit à compléter et à faire valider selon le droit applicable dans le pays de l'hôtel.</p>` : ''}
  <h2>Éditeur du site</h2>
  <p>${hotelName}<br>Exploitant : ${tbd('raison sociale et forme juridique')}<br>Immatriculation : ${tbd('numéro RCCM ou équivalent')}<br>Adresse : ${value(h.address)}${h.city ? `, ${esc(h.city)}` : ''}${h.country ? `, ${esc(h.country)}` : ''}<br>Téléphone : ${value(h.phone)}<br>Responsable de la publication : ${tbd('À confirmer')}</p>
  <h2>Hébergement</h2>
  <p>${tbd("Nom et adresse de l'hébergeur")}</p>
  <h2>Photos</h2>
  <p>Les photos présentées sont la propriété de l'établissement. Toute reproduction sans autorisation est interdite.</p>
</div>`;
  return page({ path: 'mentions-legales.html', title: 'Mentions légales', description: `Mentions légales du site de ${h.name}.`, body });
}

function confidentialite() {
  const body = `
<section class="page-intro"><div class="wrap narrow"><h1>Confidentialité</h1></div></section>
<div class="wrap narrow prose">
  ${site.demoMode ? `<p class="demo-note">Gabarit à compléter et à faire valider selon la réglementation applicable à la protection des données personnelles dans le pays de l'hôtel.</p>` : ''}
  <h2>Données collectées</h2>
  <p>Le formulaire de demande de réservation recueille votre nom, votre numéro de téléphone, vos dates de séjour, le nombre de personnes, la chambre souhaitée et, si vous le souhaitez, une demande particulière.</p>
  <h2>Utilisation</h2>
  <p>Ces informations servent uniquement à traiter votre demande et à vous recontacter. Elles ne sont ni vendues ni cédées à des tiers.</p>
  <h2>Transmission</h2>
  <p>${site.reservation.mode === 'whatsapp' && h.whatsapp
    ? `Votre demande est rédigée dans votre application WhatsApp et transmise à l'hôtel uniquement lorsque vous l'envoyez vous-même. Elle est alors soumise aux conditions d'utilisation de WhatsApp. Le site lui-même n'enregistre aucune donnée.`
    : `Mode de transmission des demandes à l'hôtel : ${tbd('à préciser (WhatsApp, e-mail ou service de formulaire)')}`}</p>
  <h2>Conservation</h2>
  <p>Durée de conservation : ${tbd('À confirmer')}</p>
  <h2>Vos droits</h2>
  <p>Vous pouvez demander l'accès, la rectification ou la suppression de vos données en contactant l'hôtel : ${value(h.phone)}${h.email ? `, ${esc(h.email)}` : ''}.</p>
  <h2>Mesure d'audience</h2>
  <p>${site.analytics.provider ? "Ce site utilise un outil de mesure d'audience sans cookie, qui ne collecte aucune donnée personnelle." : "Ce site n'utilise actuellement aucun outil de mesure d'audience ni cookie publicitaire."}</p>
</div>`;
  return page({ path: 'confidentialite.html', title: 'Confidentialité', description: `Politique de confidentialité du site de ${h.name}.`, body });
}

export const pages = {
  'index.html': home,
  'chambres.html': chambres,
  'services.html': servicesPage,
  'reservation.html': reservation,
  'contact.html': contact,
  'mentions-legales.html': mentions,
  'confidentialite.html': confidentialite,
};
