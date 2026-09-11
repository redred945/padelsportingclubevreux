(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile nav drawer */
  const burger = document.getElementById('c-burger');
  const panel = document.getElementById('c-mobile-panel');
  if (burger && panel) {
    const openPanel = () => {
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fermer le menu');
      panel.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      const first = panel.querySelector('a');
      if (first) first.focus();
    };
    const closePanel = ({ restoreFocus = false } = {}) => {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      panel.classList.remove('is-open');
      document.body.style.overflow = '';
      if (restoreFocus) burger.focus();
    };
    burger.addEventListener('click', () => {
      burger.getAttribute('aria-expanded') === 'true' ? closePanel({ restoreFocus: true }) : openPanel();
    });
    panel.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') closePanel();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel({ restoreFocus: true });
    });
    document.addEventListener('click', (e) => {
      if (panel.classList.contains('is-open') && !panel.contains(e.target) && !burger.contains(e.target)) closePanel();
    });
  }

  /* Credits packs: click to feature a different offer */
  const packsWrap = document.getElementById('c-packs');
  if (packsWrap) {
    const packs = Array.from(packsWrap.querySelectorAll('.c-pack'));
    const selectPack = (pack) => packs.forEach(p => p.classList.toggle('is-active', p === pack));
    packs.forEach(pack => {
      pack.addEventListener('click', () => selectPack(pack));
      pack.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPack(pack); }
      });
    });
  }

  /* Partner logo cloud (grid + seamless marquee) */
  const logoGrid = document.getElementById('c-logo-grid');
  const logoTrack = document.getElementById('c-logo-track');
  if (logoGrid && logoTrack && window.PARTNER_LOGOS) {
    const logoHTML = (l) => `<div class="c-logo-item"><img src="${l.src}" alt="${l.alt}" loading="lazy" width="160" height="90" /></div>`;
    logoGrid.innerHTML = window.PARTNER_LOGOS.map(logoHTML).join('');
    logoTrack.innerHTML = window.PARTNER_LOGOS.concat(window.PARTNER_LOGOS).map(logoHTML).join('');
  }

  /* Partner opportunities: mobile slider dots */
  const partnerCards = document.querySelector('.c-partner-cards');
  const partnerDots = document.getElementById('c-partner-dots');
  if (partnerCards && partnerDots) {
    const items = Array.from(partnerCards.children);
    partnerDots.innerHTML = items.map(() => '<span></span>').join('');
    const dots = Array.from(partnerDots.children);
    const updateDots = () => {
      const idx = Math.round(partnerCards.scrollLeft / (items[0].getBoundingClientRect().width + 12));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };
    updateDots();
    partnerCards.addEventListener('scroll', () => window.requestAnimationFrame(updateDots), { passive: true });
  }

  /* Cursor spotlight on glass cards */
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.c-reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el, i) => { el.style.transitionDelay = `${(i % 6) * 0.06}s`; obs.observe(el); });
  }

  /* Animated bento numbers */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / 1200);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    obs.observe(el);
  });

  /* Mini price simulator (same data model as the production site) */
  const sim = document.getElementById('c-sim');
  if (sim) {
    const TARIFFS = {
      'padel-double': { label: 'Padel double', unit: 'joueur', min: 2, max: 4, durations: { '1h': 9, '1h30': 13, '2h': 16 } },
      'padel-single': { label: 'Padel single', unit: 'joueur', min: 1, max: 2, durations: { '1h30': 16 } },
      'badminton': { label: 'Badminton', unit: 'terrain', min: 1, max: 4, durations: { '1h': 16, '1h30': 24 } },
    };
    const state = { activity: 'padel-double', duration: '1h', players: 4, rackets: 0 };
    const activityPills = sim.querySelectorAll('[data-field="activity"] .c-pill');
    const durationWrap = sim.querySelector('#c-sim-durations');
    const playersValue = sim.querySelector('#c-sim-players');
    const racketsValue = sim.querySelector('#c-sim-rackets');
    const totalEl = sim.querySelector('#c-sim-total');
    const detailEl = sim.querySelector('#c-sim-detail');

    function renderDurations() {
      const cfg = TARIFFS[state.activity];
      const keys = Object.keys(cfg.durations);
      if (!keys.includes(state.duration)) state.duration = keys[0];
      durationWrap.innerHTML = keys.map(k =>
        `<button type="button" class="c-pill${k === state.duration ? ' is-active' : ''}" data-value="${k}">${k}</button>`
      ).join('');
    }
    function render() {
      const cfg = TARIFFS[state.activity];
      state.players = Math.min(cfg.max, Math.max(cfg.min, state.players));
      playersValue.textContent = state.players;
      racketsValue.textContent = state.rackets;
      const unit = cfg.durations[state.duration];
      const total = (cfg.unit === 'joueur' ? unit * state.players : unit) + state.rackets * 3;
      totalEl.textContent = `${total}€`;
      let detail = `${cfg.label} · ${state.duration} · ${cfg.unit === 'joueur' ? state.players + ' joueurs' : 'terrain entier'}`;
      if (state.rackets > 0) detail += ` · ${state.rackets} raquette${state.rackets > 1 ? 's' : ''}`;
      detailEl.textContent = detail;
    }
    activityPills.forEach(btn => btn.addEventListener('click', () => {
      state.activity = btn.dataset.value;
      activityPills.forEach(b => b.classList.toggle('is-active', b === btn));
      renderDurations(); render();
    }));
    durationWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.c-pill'); if (!btn) return;
      state.duration = btn.dataset.value; renderDurations(); render();
    });
    sim.querySelectorAll('.c-step[data-step="players"]').forEach(btn => btn.addEventListener('click', () => {
      state.players += parseInt(btn.dataset.dir, 10); render();
    }));
    sim.querySelectorAll('.c-step[data-step="rackets"]').forEach(btn => btn.addEventListener('click', () => {
      state.rackets = Math.min(8, Math.max(0, state.rackets + parseInt(btn.dataset.dir, 10))); render();
    }));
    renderDurations(); render();
  }

  /* Footer year */
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
