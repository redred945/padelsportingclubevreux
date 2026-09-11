(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header: solid on scroll */
  const hd = document.getElementById('hd');
  const onScroll = () => {
    if (window.scrollY > 40) hd.classList.add('is-solid');
    else hd.classList.remove('is-solid');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Hero intro */
  const hero = document.getElementById('hero');
  if (hero) requestAnimationFrame(() => setTimeout(() => hero.classList.add('is-in'), 120));

  /* Mobile nav */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const backdrop = document.getElementById('nav-backdrop');
  let lastFocus = null;

  function openNav() {
    lastFocus = document.activeElement;
    nav.classList.add('is-open');
    backdrop.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const first = nav.querySelector('a');
    if (first) first.focus();
  }
  function closeNav() {
    nav.classList.remove('is-open');
    backdrop.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  if (burger) {
    burger.addEventListener('click', () => {
      burger.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });
    backdrop.addEventListener('click', closeNav);
    nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') closeNav(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
      if (e.key === 'Tab' && nav.classList.contains('is-open')) {
        const items = nav.querySelectorAll('a');
        const firstEl = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    });
  }

  /* Active nav spy */
  const navLinks = Array.from(document.querySelectorAll('.nav a[data-spy]'));
  const spyTargets = navLinks
    .map(a => ({ a, el: document.getElementById(a.dataset.spy) }))
    .filter(t => t.el);
  if (spyTargets.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = spyTargets.find(t => t.el === entry.target);
        if (!target) return;
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('is-active'));
          target.a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(t => spyObserver.observe(t.el));
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* Animated counters */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCount(entry.target); countObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => countObserver.observe(el));
  }

  /* Hero parallax (subtle, desktop only, disabled on reduced motion) */
  const heroMedia = document.querySelector('.hero-media img');
  if (heroMedia && !reduceMotion && window.innerWidth > 760) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroMedia.style.transform = `scale(1.06) translateY(${y * 0.12}px)`;
      }
    }, { passive: true });
  }

  /* Partner logo cloud (grid + seamless marquee) */
  const logoGrid = document.getElementById('logo-grid');
  const logoTrack = document.getElementById('logo-track');
  if (logoGrid && logoTrack && window.PARTNER_LOGOS) {
    const logoHTML = (l) => `<div class="logo-item"><img src="${l.src}" alt="${l.alt}" loading="lazy" width="160" height="90" /></div>`;
    logoGrid.innerHTML = window.PARTNER_LOGOS.map(logoHTML).join('');
    logoTrack.innerHTML = window.PARTNER_LOGOS.concat(window.PARTNER_LOGOS).map(logoHTML).join('');
  }

  /* Partner opportunities: mobile slider dots */
  const partnerGrid = document.querySelector('.partner-grid');
  const partnerDots = document.getElementById('partner-dots');
  if (partnerGrid && partnerDots) {
    const items = Array.from(partnerGrid.children);
    partnerDots.innerHTML = items.map(() => '<span></span>').join('');
    const dots = Array.from(partnerDots.children);
    const updateDots = () => {
      const idx = Math.round(partnerGrid.scrollLeft / (items[0].getBoundingClientRect().width + 12));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };
    updateDots();
    partnerGrid.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateDots);
    }, { passive: true });
  }

  /* Price simulator */
  const simulator = document.getElementById('simulator');
  if (simulator) {
    const TARIFFS = {
      'padel-double': { label: 'Padel double', unit: 'joueur', min: 2, max: 4, durations: { '1h': 9, '1h30': 13, '2h': 16 } },
      'padel-single': { label: 'Padel single', unit: 'joueur', min: 1, max: 2, durations: { '1h30': 16 } },
      'badminton': { label: 'Badminton', unit: 'terrain', min: 1, max: 4, durations: { '1h': 16, '1h30': 24 } },
    };
    const state = { activity: 'padel-double', duration: '1h', players: 4, rackets: 0 };

    const activityPills = simulator.querySelectorAll('[data-field="activity"] .sim-pill');
    const durationWrap = document.getElementById('sim-durations');
    const playersValue = document.getElementById('sim-players-value');
    const racketsValue = document.getElementById('sim-rackets-value');
    const totalEl = document.getElementById('sim-total');
    const detailEl = document.getElementById('sim-detail');

    function renderDurations() {
      const cfg = TARIFFS[state.activity];
      const keys = Object.keys(cfg.durations);
      if (!keys.includes(state.duration)) state.duration = keys[0];
      durationWrap.innerHTML = keys.map(k =>
        `<button type="button" class="sim-pill${k === state.duration ? ' is-active' : ''}" data-value="${k}" aria-pressed="${k === state.duration}">${k}</button>`
      ).join('');
    }

    function clampPlayers() {
      const cfg = TARIFFS[state.activity];
      state.players = Math.min(cfg.max, Math.max(cfg.min, state.players));
    }

    function render() {
      const cfg = TARIFFS[state.activity];
      clampPlayers();
      playersValue.textContent = state.players;
      racketsValue.textContent = state.rackets;

      const unitPrice = cfg.durations[state.duration];
      let total, detail;
      if (cfg.unit === 'joueur') {
        total = unitPrice * state.players + state.rackets * 3;
        detail = `${cfg.label} · ${state.duration} · ${state.players} joueur${state.players > 1 ? 's' : ''}`;
      } else {
        total = unitPrice + state.rackets * 3;
        const perPlayer = state.players > 0 ? Math.ceil((total / state.players) * 100) / 100 : total;
        detail = `${cfg.label} · ${state.duration} · terrain entier${state.players > 1 ? ` (soit ${perPlayer.toFixed(2).replace('.00', '')}€/joueur à ${state.players})` : ''}`;
      }
      if (state.rackets > 0) detail += ` · ${state.rackets} raquette${state.rackets > 1 ? 's' : ''}`;

      totalEl.textContent = `${total}€`;
      detailEl.textContent = detail;
    }

    activityPills.forEach(btn => btn.addEventListener('click', () => {
      state.activity = btn.dataset.value;
      activityPills.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', b === btn); });
      renderDurations();
      render();
    }));

    durationWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.sim-pill');
      if (!btn) return;
      state.duration = btn.dataset.value;
      renderDurations();
      render();
    });

    simulator.querySelectorAll('.sim-step').forEach(btn => btn.addEventListener('click', () => {
      const field = btn.dataset.step;
      const dir = parseInt(btn.dataset.dir, 10);
      if (field === 'players') {
        state.players += dir;
        clampPlayers();
      } else if (field === 'rackets') {
        state.rackets = Math.min(8, Math.max(0, state.rackets + dir));
      }
      render();
    }));

    renderDurations();
    render();
  }

  /* Footer year */
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
