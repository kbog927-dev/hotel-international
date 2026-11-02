// Comportements du site : menu, mesure des clics, galerie, demande de réservation.
// La configuration (mode d'envoi, numéros) vient de assets/js/config.js, généré par build.mjs.
(function () {
  'use strict';
  var cfg = window.HOTEL_CONFIG || {};

  // ── Mesure : événements poussés dans dataLayer (+ Plausible si configuré) ──
  window.dataLayer = window.dataLayer || [];
  function track(name, props) {
    window.dataLayer.push(Object.assign({ event: name }, props || {}));
    if (typeof window.plausible === 'function') window.plausible(name, { props: props || {} });
  }
  if (cfg.analytics && cfg.analytics.provider === 'plausible' && cfg.analytics.domain) {
    var s = document.createElement('script');
    s.defer = true;
    s.src = 'https://plausible.io/js/script.js';
    s.setAttribute('data-domain', cfg.analytics.domain);
    document.head.appendChild(s);
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    var props = { page: location.pathname.split('/').pop() || 'index.html' };
    if (el.dataset.room) props.chambre = el.dataset.room;
    track(el.dataset.track, props);
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var today = iso(new Date());
  var isoDate = /^\d{4}-\d{2}-\d{2}$/;

  // Dates liées : départ au plus tôt le lendemain de l'arrivée.
  function linkDates(arrivee, depart) {
    arrivee.min = today;
    depart.min = today;
    arrivee.addEventListener('change', function () {
      if (!arrivee.value) return;
      var next = new Date(arrivee.value + 'T00:00:00');
      next.setDate(next.getDate() + 1);
      depart.min = iso(next);
      if (!depart.value || depart.value <= arrivee.value) depart.value = iso(next);
    });
  }

  // ── Menu mobile ──
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
  }

  // ── En-tête posé sur la photo d'accueil : fixé dès qu'on quitte la photo ──
  var header = document.querySelector('.site-header.is-overlay');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 120); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
    onScroll();
  }

  // ── Carrousel de l'accueil ──
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var active = 0;
    var timer = null;
    var go = function (i) {
      slides[active].classList.remove('is-active');
      dots[active].removeAttribute('aria-current');
      active = (i + slides.length) % slides.length;
      slides[active].classList.add('is-active');
      dots[active].setAttribute('aria-current', 'true');
    };
    var start = function () { if (!reduceMotion) timer = setInterval(function () { go(active + 1); }, 6500); };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { clearInterval(timer); go(i); start(); });
    });
    document.addEventListener('visibilitychange', function () { clearInterval(timer); if (!document.hidden) start(); });
    // Le carrousel démarre après l'écran d'accueil, s'il est affiché.
    setTimeout(start, document.documentElement.classList.contains('intro') ? 2700 : 0);
  }

  // ── Animations : titres mot à mot, apparitions au défilement, parallaxe ──
  var animOn = document.documentElement.classList.contains('anim');

  // Découpe un titre en mots masqués ; le texte reste identique pour les lecteurs d'écran.
  function splitWords(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span');
            var inner = document.createElement('span');
            w.className = 'w';
            inner.textContent = part;
            inner.style.setProperty('--i', i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains('pending')) {
          walk(child);
        }
      });
    })(el);
    el.classList.add('split');
  }

  // Une seule boucle au défilement (throttlée par requestAnimationFrame) pilote :
  // apparitions, parallaxe, barre flottante et halo. Calcul direct des positions,
  // pour que le contenu à l'écran s'affiche toujours, quel que soit le navigateur.
  var pending = [];
  var para = null, paraHost = null;
  var tabBook = null, roomsZone = null;

  if (animOn) {
    document.querySelectorAll('.hero h1, .page-hero h1').forEach(splitWords);

    // [sélecteur, type d'apparition, décalage en cascade entre éléments frères]
    var revealSets = [
      ['.section h2, .page-intro h1, .section-head .view-all, .demo-note, .section .actions, .checklist, .filters', 'up'],
      ['.ways-grid > *, .card-rail > li, .chips > li, .facts li, .contact-card', 'up', true],
      ['.service', 'up', 3],
      ['.bento-item', 'mask', true],
      ['.info-panel, .booking-card', 'up'],
      ['.closing-card, .room-media, .contact-photo', 'mask'],
      ['.room-panel, .booking-aside', 'side'],
    ];
    revealSets.forEach(function (set) {
      document.querySelectorAll(set[0]).forEach(function (el) {
        if (el.hasAttribute('data-reveal')) return;
        el.setAttribute('data-reveal', set[1]);
        if (set[2]) {
          var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
          el.style.setProperty('--i', set[2] === true ? idx : idx % set[2]);
        }
        pending.push(el);
      });
    });

    para = document.querySelector('.hero-slides, .page-hero-media');
    paraHost = para && para.parentElement;
    tabBook = document.querySelector('.tab-book');
    roomsZone = document.querySelector('.card-rail, .rooms');
  }

  var dock = document.querySelector('.book-dock');
  var dockStart = document.querySelector('.quick-book-wrap, .page-hero, .page-intro');
  var dockStops = Array.prototype.slice.call(document.querySelectorAll('[data-dock-stop], .site-footer'));
  var inView = function (r, vh) { return r.top < vh && r.bottom > 0; };

  function frame() {
    var vh = window.innerHeight;
    var y = window.scrollY;

    // Apparitions : dès qu'un élément entre dans les 92 % du haut de l'écran.
    if (pending.length) {
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { el.classList.add('is-visible'); return false; }
        return true;
      });
    }

    // Parallaxe : la grande photo défile plus lentement que la page.
    if (para && y < paraHost.offsetHeight + 200) para.style.setProperty('--py', (y * 0.3).toFixed(1) + 'px');

    // Halo sur l'onglet « Réserver » quand les chambres apparaissent (une fois).
    if (tabBook && roomsZone && !tabBook.classList.contains('is-calling')) {
      var rz = roomsZone.getBoundingClientRect();
      if (rz.top < vh * 0.6 && rz.bottom > 0) tabBook.classList.add('is-calling');
    }

    // Barre flottante : après la première incitation à réserver, hors des appels finaux.
    if (dock && dockStart) {
      var past = dockStart.getBoundingClientRect().bottom < 0;
      var nearStop = dockStops.some(function (s) { return inView(s.getBoundingClientRect(), vh); });
      var show = past && !nearStop;
      if (show !== dock.classList.contains('is-shown')) {
        dock.classList.toggle('is-shown', show);
        if (show) dock.removeAttribute('inert');
        else dock.setAttribute('inert', '');
      }
    }
  }

  var ticking = false;
  var trailing = null;
  var schedule = function () {
    clearTimeout(trailing);
    trailing = setTimeout(frame, 120); // rattrapage si aucune image n'est rendue
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; frame(); });
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', frame);
  frame();
  // Filet de sécurité : si aucune image n'est rendue (onglet en arrière-plan), on vérifie quand même.
  setTimeout(frame, 400);

  // ── Carte « Vos dates de séjour » (accueil) ──
  var quick = document.querySelector('[data-quick-book]');
  if (quick) {
    linkDates(quick.elements.arrivee, quick.elements.depart);
    quick.addEventListener('submit', function (e) {
      var a = quick.elements.arrivee, d = quick.elements.depart;
      if (a.value && d.value && d.value <= a.value) {
        e.preventDefault();
        d.setCustomValidity("La date de départ doit suivre la date d'arrivée.");
        d.reportValidity();
      }
    });
    quick.elements.depart.addEventListener('input', function () { this.setCustomValidity(''); });
  }

  // ── Galerie : filtres et visionneuse ──
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery li'));
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var shown = 0;
      items.forEach(function (li) {
        var on = group === 'tout' || li.dataset.group === group;
        li.hidden = !on;
        if (on) li.style.setProperty('--i', shown++);
      });
      document.querySelector('.gallery-empty').hidden = shown > 0;
      track('galerie_filtre', { groupe: group });
    });
  });

  var dialog = document.querySelector('.lightbox');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.thumb'));
  if (dialog && thumbs.length && typeof dialog.showModal === 'function') {
    var big = dialog.querySelector('img');
    var caption = dialog.querySelector('.lightbox-caption');
    var visible = thumbs;
    var current = 0;
    var show = function (i) {
      current = (i + visible.length) % visible.length;
      var small = visible[current].querySelector('img');
      big.src = small.getAttribute('src').replace('-800.jpg', '-1600.jpg');
      big.alt = small.alt;
      caption.textContent = small.alt + ' (' + (current + 1) + '/' + visible.length + ')';
    };
    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // La visionneuse ne parcourt que les photos du filtre actif.
        visible = thumbs.filter(function (t) { return !t.parentElement.hidden; });
        show(visible.indexOf(btn));
        dialog.showModal();
      });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) dialog.close();
      var dir = e.target.closest('[data-dir]');
      if (dir) show(current + Number(dir.dataset.dir));
    });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
    dialog.addEventListener('close', function () { visible[current].focus(); });
  }

  // ── Demande de réservation ──
  var form = document.getElementById('reservation-form');
  if (!form) return;
  var result = document.getElementById('reservation-result');
  var statusBox = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var f = form.elements;

  var fr = function (d) { var p = d.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
  linkDates(f.arrivee, f.depart);

  // Préremplissage depuis la page Chambres (?chambre=) ou la carte de l'accueil (?arrivee=&depart=&personnes=).
  var params = new URLSearchParams(location.search);
  var wanted = params.get('chambre');
  if (wanted && f.chambre.querySelector('option[value="' + CSS.escape(wanted) + '"]')) f.chambre.value = wanted;
  var pa = params.get('arrivee'), pd = params.get('depart'), pp = Number(params.get('personnes'));
  if (pa && isoDate.test(pa) && pa >= today) { f.arrivee.value = pa; f.arrivee.dispatchEvent(new Event('change')); }
  if (pd && isoDate.test(pd) && pd > (f.arrivee.value || today)) f.depart.value = pd;
  if (Number.isInteger(pp) && pp >= 1 && pp <= 20) f.personnes.value = pp;
  function setError(name, msg) {
    var input = f[name];
    var err = document.getElementById(name + '-error');
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', [name === 'telephone' ? 'telephone-hint' : '', name + '-error'].join(' ').trim());
      err.textContent = msg;
      err.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      if (name === 'telephone') input.setAttribute('aria-describedby', 'telephone-hint');
      else input.removeAttribute('aria-describedby');
      err.hidden = true;
    }
  }

  function validate() {
    var errors = {};
    var a = f.arrivee.value, d = f.depart.value;
    if (!a) errors.arrivee = "Indiquez votre date d'arrivée.";
    else if (a < today) errors.arrivee = "La date d'arrivée ne peut pas être passée.";
    if (!d) errors.depart = 'Indiquez votre date de départ.';
    else if (a && d <= a) errors.depart = "La date de départ doit suivre la date d'arrivée.";
    var n = Number(f.personnes.value);
    if (!Number.isInteger(n) || n < 1 || n > 20) errors.personnes = 'Indiquez un nombre de personnes entre 1 et 20.';
    var nom = f.nom.value.trim();
    if (nom.length < 2) errors.nom = 'Indiquez votre nom.';
    var tel = f.telephone.value.trim();
    var digits = tel.replace(/\D/g, '');
    if (!tel) errors.telephone = 'Indiquez un numéro pour que l’hôtel puisse vous recontacter.';
    else if (!/^[+\d\s().-]+$/.test(tel) || digits.length < 8 || digits.length > 15) errors.telephone = 'Ce numéro semble incomplet. Indiquez-le en entier, avec l’indicatif du pays si vous appelez de l’étranger.';
    ['arrivee', 'depart', 'personnes', 'nom', 'telephone'].forEach(function (k) { setError(k, errors[k]); });
    return errors;
  }

  function reference() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var rnd = '';
    var buf = new Uint32Array(4);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    for (var i = 0; i < 4; i++) rnd += chars[buf[i] % chars.length];
    return ((cfg.reservation && cfg.reservation.refPrefix) || 'RES') + '-' + today.replace(/-/g, '') + '-' + rnd;
  }

  function collect(ref) {
    var room = (cfg.rooms || []).filter(function (r) { return r.id === f.chambre.value; })[0];
    var nights = Math.round((new Date(f.depart.value) - new Date(f.arrivee.value)) / 86400000);
    return {
      reference: ref,
      nom: f.nom.value.trim(),
      telephone: f.telephone.value.trim(),
      arrivee: f.arrivee.value,
      depart: f.depart.value,
      nuits: nights,
      personnes: Number(f.personnes.value),
      chambre: room ? room.label : 'Sans préférence',
      message: f.message.value.trim(),
      envoye_le: new Date().toISOString(),
    };
  }

  function asText(r) {
    return [
      'Bonjour, voici ma demande de réservation (réf. ' + r.reference + ') :',
      'Nom : ' + r.nom,
      'Téléphone : ' + r.telephone,
      'Arrivée : ' + fr(r.arrivee),
      'Départ : ' + fr(r.depart) + ' (' + r.nuits + ' nuit' + (r.nuits > 1 ? 's' : '') + ')',
      'Personnes : ' + r.personnes,
      'Chambre : ' + r.chambre,
      r.message ? 'Demande particulière : ' + r.message : '',
    ].filter(Boolean).join('\n');
  }

  function showResult(title, text, ref) {
    result.querySelector('.result-title').textContent = title;
    result.querySelector('.result-text').textContent = text;
    var refLine = result.querySelector('.result-ref');
    refLine.hidden = !ref;
    if (ref) refLine.querySelector('strong').textContent = ref;
    form.hidden = true;
    result.hidden = false;
    result.focus();
    result.scrollIntoView({ block: 'start' });
  }

  function showStatus(msg) {
    statusBox.textContent = msg;
    statusBox.hidden = !msg;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showStatus('');
    var errors = validate();
    var first = Object.keys(errors)[0];
    if (first) {
      track('reservation_erreur_saisie', { champ: first });
      f[first].focus();
      return;
    }
    var ref = reference();
    var data = collect(ref);
    var mode = (cfg.reservation && cfg.reservation.mode) || 'demo';
    track('reservation_envoi', { mode: mode, chambre: data.chambre, nuits: data.nuits });

    // Robot détecté (champ caché rempli) : on n'envoie rien.
    if (f.site_web.value) { showResult('Demande envoyée', '', null); return; }

    if (mode === 'demo') {
      console.info('[Démonstration] Demande qui serait transmise :\n' + asText(data));
      showResult(
        'Demande prête (démonstration)',
        "Mode démonstration : aucune demande n'a été transmise à l'hôtel. Une fois le site configuré, ce message confirmera l'envoi de la demande, sans annoncer une réservation confirmée.",
        ref
      );
      return;
    }

    if (mode === 'whatsapp') {
      if (!cfg.whatsapp) { showStatus("L'envoi en ligne n'est pas disponible pour le moment. Appelez l'hôtel pour réserver."); return; }
      var url = 'https://wa.me/' + cfg.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(asText(data));
      window.open(url, '_blank', 'noopener');
      track('reservation_whatsapp_ouvert', { chambre: data.chambre });
      // Bouton de secours si WhatsApp ne s'est pas ouvert automatiquement.
      var waBtn = result.querySelector('.result-wa');
      if (waBtn) { waBtn.href = url; waBtn.hidden = false; }
      showResult(
        'Votre demande est prête dans WhatsApp',
        "Appuyez sur « Envoyer » dans WhatsApp pour la transmettre à l'hôtel. L'hôtel vérifie la disponibilité et vous recontacte" +
          (cfg.responseTime ? ' en ' + cfg.responseTime : '') + ' pour confirmer votre réservation.',
        ref
      );
      return;
    }

    if (mode === 'endpoint' && cfg.reservation.endpoint) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 15000);
      fetch(cfg.reservation.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: 'Demande de réservation ' + ref, resume: asText(data) }, data)),
        signal: ctrl.signal,
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          track('reservation_transmise', { chambre: data.chambre, nuits: data.nuits });
          showResult(
            'Demande envoyée',
            "Votre demande a bien été transmise à l'hôtel. L'hôtel vérifie la disponibilité et vous recontacte au " + data.telephone + ". Votre réservation n'est confirmée qu'après cet échange.",
            ref
          );
        })
        .catch(function () {
          track('reservation_echec', {});
          showStatus("La demande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez, ou appelez l'hôtel.");
        })
        .finally(function () {
          clearTimeout(timer);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Envoyer ma demande';
        });
      return;
    }

    showStatus("L'envoi en ligne n'est pas encore configuré. Appelez l'hôtel pour réserver.");
  });

  // Récapitulatif en direct de la demande (colonne de droite).
  var sum = {};
  document.querySelectorAll('[data-sum]').forEach(function (dd) { sum[dd.dataset.sum] = dd; });
  var setSum = function (key, text) {
    var dd = sum[key];
    if (!dd || dd.textContent === text) return;
    dd.textContent = text;
    dd.classList.remove('bump');
    void dd.offsetWidth; // relance l'animation
    dd.classList.add('bump');
  };
  var longDate = function (d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  function updateSummary() {
    setSum('arrivee', f.arrivee.value ? longDate(f.arrivee.value) : 'À choisir');
    setSum('depart', f.depart.value ? longDate(f.depart.value) : 'À choisir');
    var n = f.arrivee.value && f.depart.value ? Math.round((new Date(f.depart.value) - new Date(f.arrivee.value)) / 86400000) : 0;
    setSum('nuits', n > 0 ? n + ' nuit' + (n > 1 ? 's' : '') : '—');
    var p = Number(f.personnes.value);
    setSum('personnes', Number.isInteger(p) && p >= 1 ? String(p) : '—');
    setSum('chambre', f.chambre.value ? f.chambre.options[f.chambre.selectedIndex].text : 'Sans préférence');
  }
  form.addEventListener('input', updateSummary);
  form.addEventListener('change', updateSummary);
  updateSummary();

  // Corrige les erreurs au fil de la saisie, une fois signalées.
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') validate();
  });

  result.querySelector('[data-new-request]').addEventListener('click', function () {
    form.reset();
    ['arrivee', 'depart', 'personnes', 'nom', 'telephone'].forEach(function (k) { setError(k, null); });
    result.hidden = true;
    form.hidden = false;
    updateSummary();
    f.arrivee.focus();
  });
})();
