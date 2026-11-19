/* Sold in Style Studio: interactions & motion */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  $$('.js-year').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis) + anchor links
  ------------------------------------------------------------------ */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.25, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  const scrollToTarget = (hash) => {
    const target = hash === '#top' ? 0 : $(hash);
    if (target === null) return;
    if (lenis) return lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    const behavior = reduced ? 'auto' : 'smooth';
    if (target === 0) window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior });
  };

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(hash);
      if (hash !== '#top') history.replaceState(null, '', hash);
    });
  });

  /* ------------------------------------------------------------------
     Nav: hide on scroll down, show on scroll up
  ------------------------------------------------------------------ */
  const nav = $('.nav');
  const progress = $('.progress span');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 60);
    if (!document.body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  const mCta = $('.m-cta');
  const heroEl = $('.hero');
  const contactEl = $('#contact');
  const updateCta = () => {
    if (!mCta) return;
    const pastHero = window.scrollY > heroEl.offsetHeight * 0.75;
    const atContact = contactEl.getBoundingClientRect().top < innerHeight * 0.9;
    mCta.classList.toggle('is-on', pastHero && !atContact);
  };
  window.addEventListener('scroll', () => { onScroll(); updateCta(); }, { passive: true });
  onScroll(); updateCta();

  /* ------------------------------------------------------------------
     Overlay menu
  ------------------------------------------------------------------ */
  const burger = $('.nav__burger');
  const menu = $('#menu');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    menu.setAttribute('aria-hidden', 'true');
    lenis && lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    if (!open) return closeMenu();
    document.body.classList.add('menu-open');
    nav.classList.remove('is-hidden');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    menu.setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
  });
  document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

  /* ------------------------------------------------------------------
     Reviews carousel
  ------------------------------------------------------------------ */
  const quotes = $$('.quote');
  const dots = $$('.quotes__dots button');
  let qi = 0, qTimer;
  const showQuote = (i) => {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, n) => q.classList.toggle('is-active', n === qi));
    dots.forEach((d, n) => {
      d.classList.remove('is-active'); d.setAttribute('aria-selected', n === qi);
      void d.offsetWidth; // restart fill animation
      if (n === qi) d.classList.add('is-active');
    });
    if (hasGsap && !reduced) {
      const words = $$('.split-word', quotes[qi]);
      gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.1, delay: .3, ease: 'expo.out', stagger: .018 });
      gsap.fromTo($('footer', quotes[qi]), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .9, delay: .65, ease: 'power3.out' });
    }
    clearInterval(qTimer);
    qTimer = setInterval(() => showQuote(qi + 1), 7000);
  };
  $$('.qbtn').forEach(b => b.addEventListener('click', () => showQuote(qi + Number(b.dataset.dir))));
  dots.forEach((d, n) => d.addEventListener('click', () => showQuote(n)));
  const qWrap = $('.quotes');
  let tx = null;
  qWrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  qWrap.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 45) showQuote(qi + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* Mobile gallery: progress bar + counter follow the swipe */
  const wTrack = $('.work__track');
  const wBar = $('.work__bar i');
  const wCount = $('.js-work-count');
  const wCards = $$('.card:not(.card--end)');
  wTrack.addEventListener('scroll', () => {
    if (innerWidth > 760) return;
    const max = wTrack.scrollWidth - wTrack.clientWidth;
    const p = max > 0 ? wTrack.scrollLeft / max : 0;
    wBar.style.transform = `scaleX(${p})`;
    const mid = wTrack.getBoundingClientRect().left + wTrack.clientWidth / 2;
    let n = 1, best = Infinity;
    wCards.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < best) { best = d; n = i + 1; } });
    wCount.textContent = `${String(n).padStart(2, '0')} / ${String(wCards.length).padStart(2, '0')}`;
    if (wTrack.scrollLeft > 20) $('.work').classList.add('is-swiped');
  }, { passive: true });

  /* ------------------------------------------------------------------
     Enquiry form (mailto hand-off; swap for a form backend later)
  ------------------------------------------------------------------ */
  const form = $('#enquiry');
  const STUDIO_EMAIL = 'hello@soldinstylestudio.com'; // TODO: replace with the studio's real inbox
  form.addEventListener('submit', e => {
    e.preventDefault();
    const status = $('.form__status', form);
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    let ok = true;
    [['name', !!name], ['email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)]].forEach(([k, valid]) => {
      form[k].closest('.field').classList.toggle('is-invalid', !valid);
      form[k].setAttribute('aria-invalid', String(!valid));
      if (!valid) ok = false;
    });
    if (!ok) { status.textContent = 'Please add your name and a valid email.'; return; }
    const services = $$('input[name="service"]:checked', form).map(i => i.value).join(', ') || 'Not specified';
    const body = `Name: ${name}\nEmail: ${email}\nPhone: ${form.phone.value.trim() || '-'}\nInterested in: ${services}\n\n${form.message.value.trim()}`;
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent('New enquiry from ' + name)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Thank you. Your email app is opening with your enquiry ready to send.';
  });

  /* ------------------------------------------------------------------
     Text splitting (keeps <em>/.script wrappers)
  ------------------------------------------------------------------ */
  const splitWords = (root) => {
    const walk = (node) => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const mask = document.createElement('span'); mask.className = 'split-mask';
            const w = document.createElement('span'); w.className = 'split-word'; w.textContent = part;
            mask.appendChild(w); frag.appendChild(mask);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          if (child.classList.contains('script')) child.classList.add('split-script');
          else walk(child);
        }
      });
    };
    walk(root);
    return root;
  };

  $$('.js-split').forEach(splitWords);
  quotes.forEach(q => splitWords($('p', q)));

  /* ------------------------------------------------------------------
     No GSAP? Show everything and stop here.
  ------------------------------------------------------------------ */
  const loader = $('.loader');
  const finishLoader = () => { loader && loader.remove(); document.body.classList.remove('is-loading'); };

  showQuote(0);

  if (!hasGsap || reduced) {
    finishLoader();
    // simple counters + process steps without motion
    $$('.js-countup').forEach(el => (el.textContent = Number(el.dataset.to).toFixed(Number(el.dataset.dec || 0))));
    $$('.step').forEach(s => s.classList.add('is-active'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  document.documentElement.classList.add('has-motion');

  /* Mobile services: each row lights up as it crosses the middle of the screen */
  mm.add('(max-width: 960px)', () => {
    const rows = $$('.svc');
    const triggers = rows.map(row => ScrollTrigger.create({
      trigger: row, start: 'top 62%', end: 'bottom 38%',
      toggleClass: 'is-lit',
      onEnter: () => row.classList.add('is-seen'),
      onEnterBack: () => row.classList.add('is-seen')
    }));
    rows.forEach(row => ScrollTrigger.create({ trigger: row, start: 'top 92%', once: true, onEnter: () => row.classList.add('is-seen') }));
    return () => { triggers.forEach(t => t.kill()); rows.forEach(r => r.classList.remove('is-lit')); };
  });

  /* Mobile gallery cards drift in as they appear */
  mm.add('(max-width: 760px)', () => {
    gsap.from('.work .card', { y: 60, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.work__track', start: 'top 85%', once: true } });
  });

  /* ------------------------------------------------------------------
     Preloader → hero intro
  ------------------------------------------------------------------ */
  const heroImg = $('.hero__media img');
  const count = $('.js-count');
  const counter = { v: 0 };

  gsap.set('.hero__title .word, .hero__title .script', { yPercent: 120 });
  gsap.set('.hero__eyebrow, .hero__lede, .hero__actions > *, .hero__rating, .hero__scroll', { autoAlpha: 0, y: 24 });
  gsap.set(heroImg, { scale: 1.3 });

  const imgReady = new Promise(res => {
    if (heroImg.complete) return res();
    heroImg.addEventListener('load', res, { once: true });
    heroImg.addEventListener('error', res, { once: true });
    setTimeout(res, 4000);
  });

  const intro = gsap.timeline({ paused: true })
    .to('.loader__logo', { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'expo.inOut' }, 0);

  const loadTl = gsap.timeline();
  loadTl.add(intro.play(), 0)
    .to(counter, { v: 82, duration: 1.4, ease: 'power2.inOut', onUpdate: () => (count.textContent = Math.round(counter.v)) }, 0)
    .to('.loader__bar span', { scaleX: .82, duration: 1.4, ease: 'power2.inOut' }, 0);

  imgReady.then(() => {
    loadTl.then(() => {
      gsap.timeline({ onComplete: finishLoader })
        .to(counter, { v: 100, duration: .5, ease: 'power2.out', onUpdate: () => (count.textContent = Math.round(counter.v)) })
        .to('.loader__bar span', { scaleX: 1, duration: .5, ease: 'power2.out' }, '<')
        .to('.loader__inner', { autoAlpha: 0, y: -20, duration: .6, ease: 'power3.in' }, '+=.15')
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.1')
        .to(heroImg, { scale: 1.06, duration: 2.4, ease: 'expo.out' }, '<.2')
        .to('.hero__title .word, .hero__title .script', { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: .08 }, '<.35')
        .to('.hero__eyebrow, .hero__lede, .hero__actions > *, .hero__rating, .hero__scroll', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .08 }, '<.5');
    });
  });

  /* Hero scroll parallax */
  gsap.to(heroImg, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { yPercent: -18, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

  /* ------------------------------------------------------------------
     Section titles: word mask reveal
  ------------------------------------------------------------------ */
  $$('.js-split').forEach(el => {
    const words = $$('.split-word', el);
    const scripts = $$('.split-script', el);
    gsap.set(words, { yPercent: 110 });
    gsap.set(scripts, { autoAlpha: 0, y: 30, rotate: -4 });
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(words, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .05 });
        gsap.to(scripts, { autoAlpha: 1, y: 0, rotate: 0, duration: 1.6, ease: 'expo.out', delay: .3 });
      }
    });
  });

  /* Eyebrows */
  $$('.eyebrow').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from(el, { autoAlpha: 0, x: -20, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* Intro manifesto: words light up as you scroll */
  const scrub = $('.js-scrub');
  if (scrub) {
    scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    gsap.fromTo($$('.w', scrub), { opacity: .2 }, {
      opacity: 1, ease: 'none', stagger: .1,
      scrollTrigger: { trigger: scrub, start: 'top 85%', end: 'bottom 60%', scrub: true }
    });
  }

  /* Clip-path image reveals */
  $$('.reveal').forEach(fig => {
    const img = $('img', fig);
    gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } })
      .fromTo(fig, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 2, ease: 'expo.out' }, '<.1');
  });

  /* Parallax figures */
  mm.add('(min-width: 761px)', () => {
    $$('[data-speed]').forEach(el => {
      const img = $('img', el);
      gsap.fromTo(el, { y: () => -innerHeight * Number(el.dataset.speed) }, {
        y: () => innerHeight * Number(el.dataset.speed), ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
      gsap.fromTo(img, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  /* Service rows stagger in */
  gsap.from('.svc', { y: 40, autoAlpha: 0, duration: 1.1, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: '.svc-list', start: 'top 80%', once: true } });

  /* ------------------------------------------------------------------
     Services: preview stage with directional wipe transition
  ------------------------------------------------------------------ */
  mm.add('(min-width: 961px)', () => {
    const rows = $$('.svc');
    const frames = $$('.svc-stage img');
    const num = $('.js-svc-num');
    const cap = $('.js-svc-cap');
    let active = 0, z = 1;
    gsap.set(frames, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.25 });
    gsap.set(frames[0], { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, zIndex: z });

    const swapText = (el, text, dir) => {
      gsap.timeline()
        .to(el, { yPercent: -100 * dir, autoAlpha: 0, duration: .35, ease: 'power2.in' })
        .add(() => { el.textContent = text; })
        .set(el, { yPercent: 100 * dir })
        .to(el, { yPercent: 0, autoAlpha: 1, duration: .6, ease: 'expo.out' });
    };

    const activate = (i) => {
      if (i === active) return;
      const dir = i > active ? 1 : -1;
      const prev = frames[active], next = frames[i];
      rows.forEach((r, n) => r.classList.toggle('is-active', n === i));
      gsap.killTweensOf([prev, next]);
      gsap.set(next, { zIndex: ++z });
      // incoming: wipe in from the direction of travel, settle from a zoom
      gsap.fromTo(next,
        { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', scale: 1.3, yPercent: 12 * dir },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, yPercent: 0, duration: 1.15, ease: 'expo.inOut' });
      // outgoing: pushed away and slightly darkened
      gsap.to(prev, { yPercent: -14 * dir, scale: 1.08, duration: 1.15, ease: 'expo.inOut',
        onComplete: () => gsap.set(prev, { yPercent: 0, scale: 1.25, clipPath: 'inset(100% 0% 0% 0%)' }) });
      swapText(num, String(i + 1).padStart(2, '0'), dir);
      swapText(cap, next.dataset.cap, dir);
      active = i;
    };

    const handlers = rows.map((row, i) => {
      const fn = () => activate(i);
      row.addEventListener('mouseenter', fn);
      row.addEventListener('focusin', fn);
      return [row, fn];
    });
    return () => handlers.forEach(([row, fn]) => { row.removeEventListener('mouseenter', fn); row.removeEventListener('focusin', fn); });
  });

  /* ------------------------------------------------------------------
     Work: pinned horizontal gallery (desktop)
  ------------------------------------------------------------------ */
  mm.add('(min-width: 761px)', () => {
    const track = $('.work__track');
    const bar = $('.work__bar i');
    const label = $('.js-work-count');
    const cards = $$('.card:not(.card--end)', track);
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);

    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.work', start: 'top top', end: () => '+=' + dist(),
        pin: '.work__pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => {
          bar.style.transform = `scaleX(${self.progress})`;
          const n = Math.min(cards.length, Math.floor(self.progress * cards.length) + 1);
          label.textContent = `${String(n).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
        }
      }
    });

    cards.forEach(card => {
      const img = $('img', card);
      gsap.fromTo(img, { xPercent: 6, scale: 1.18 }, {
        xPercent: -6, scale: 1.18, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      });
      gsap.from($('figcaption', card), {
        autoAlpha: 0, y: 20, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 85%', once: true }
      });
    });

    return () => gsap.set(track, { clearProps: 'transform' });
  });

  /* ------------------------------------------------------------------
     Proof counters
  ------------------------------------------------------------------ */
  $$('.js-countup').forEach(el => {
    const to = Number(el.dataset.to), dec = Number(el.dataset.dec || 0), o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: 'expo.out', onUpdate: () => (el.textContent = o.v.toFixed(dec)) })
    });
  });
  gsap.from('.proof__item', { y: 50, autoAlpha: 0, duration: 1.2, ease: 'power3.out', stagger: .12, scrollTrigger: { trigger: '.proof', start: 'top 80%', once: true } });

  /* ------------------------------------------------------------------
     Process: sticky image swaps with active step
  ------------------------------------------------------------------ */
  const frames = $$('.process__frame img');
  const stepNum = $('.js-step-num');
  const steps = $$('.step');
  let current = 0;
  const setStep = (i) => {
    steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
    if (i === current) return;
    frames.forEach((f, n) => { f.classList.toggle('was-active', n === current); f.classList.toggle('is-active', n === i); });
    current = i;
    gsap.fromTo(stepNum, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .7, ease: 'expo.out' });
    stepNum.textContent = String(i + 1).padStart(2, '0');
  };
  mm.add('(min-width: 961px)', () => {
    steps.forEach((s, i) => ScrollTrigger.create({
      trigger: s, start: 'top 60%', end: 'bottom 60%',
      onToggle: self => self.isActive && setStep(i)
    }));
    steps[0].classList.add('is-active');
  });
  mm.add('(max-width: 960px)', () => { steps.forEach(s => s.classList.add('is-active')); });

  /* Contact background drift */
  gsap.fromTo('.contact__media', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.form > *', { y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '.form', start: 'top 80%', once: true } });

  /* Footer big wordmark */
  gsap.from('.footer__big', { yPercent: 40, autoAlpha: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.footer__big', start: 'top 95%', once: true } });

  /* Marquee responds to scroll velocity */
  const mq = $('.marquee__track');
  if (mq) {
    const skew = gsap.quickTo(mq, 'skewX', { duration: .6, ease: 'power3' });
    ScrollTrigger.create({ onUpdate: self => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -300)) });
  }

  /* ------------------------------------------------------------------
     Cursor + magnetic buttons (fine pointers only)
  ------------------------------------------------------------------ */
  if (finePointer) {
    const cursor = $('.cursor');
    const label = $('.cursor__label');
    const cx = gsap.quickTo(cursor, 'x', { duration: .25, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: .25, ease: 'power3' });
    window.addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); cursor.style.opacity = 1; }, { passive: true });
    document.addEventListener('mouseleave', () => (cursor.style.opacity = 0));

    document.addEventListener('mouseover', e => {
      const view = e.target.closest('[data-cursor]');
      const hov = e.target.closest('a, button, [data-hover], label');
      cursor.classList.toggle('is-view', !!view);
      cursor.classList.toggle('is-hover', !view && !!hov);
      if (view) label.textContent = view.dataset.cursor;
    });

    $$('.magnetic').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const yTo = gsap.quickTo(btn, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .3);
        yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* Refresh after fonts/images settle so pin distances are right */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
