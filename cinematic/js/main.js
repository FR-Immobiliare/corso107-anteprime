/* =========================================================
   Corso Suite 107 — motion
   GSAP + ScrollTrigger + Lenis · movimento lento e continuo
   ========================================================= */

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'power3.out';

/* ---------------------------------------------------------
   1 · Smooth scroll (Lenis) agganciato al ticker di GSAP
--------------------------------------------------------- */
let lenis = null;
// se il CDN di Lenis non risponde la pagina resta funzionante con lo scroll nativo
if (!REDUCED && typeof Lenis === 'function') {
  lenis = new Lenis({ duration: 1.4, lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
} else if (!REDUCED) {
  document.documentElement.style.scrollBehavior = 'smooth';
}

/* ---------------------------------------------------------
   2 · Utility: divide un testo in righe / parole mascherate
--------------------------------------------------------- */
function splitWords(el) {
  const html = el.innerHTML;
  // conserva i tag <em> spezzando solo i nodi di testo
  const frag = document.createElement('div');
  frag.innerHTML = html;
  const out = [];
  const walk = (node, wrapper) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        child.textContent.split(/(\s+)/).forEach((chunk) => {
          if (!chunk.trim()) { wrapper.appendChild(document.createTextNode(chunk)); return; }
          const w = document.createElement('span');
          w.className = 'word';
          const inner = document.createElement('span');
          inner.textContent = chunk;
          w.appendChild(inner);
          wrapper.appendChild(w);
          out.push(inner);
        });
      } else if (child.nodeType === 1) {
        const clone = child.cloneNode(false);
        wrapper.appendChild(clone);
        walk(child, clone);
      }
    });
  };
  const holder = document.createElement('div');
  walk(frag, holder);
  el.innerHTML = holder.innerHTML;
  return el.querySelectorAll('.word > span');
}

/* ---------------------------------------------------------
   3 · Preloader
--------------------------------------------------------- */
function runLoader() {
  const loader = document.getElementById('loader');
  const bar = loader.querySelector('.loader-bar i');
  const num = document.getElementById('loaderNum');
  const counter = { v: 0 };

  document.body.classList.add('js-ready');

  const tl = gsap.timeline();
  tl.to(counter, {
    v: 100, duration: 1.7, ease: 'power2.inOut',
    onUpdate: () => { num.textContent = Math.round(counter.v); }
  }, 0)
  .to(bar, { width: '100%', duration: 1.7, ease: 'power2.inOut' }, 0)
  .to(loader.querySelector('.loader-inner'), { opacity: 0, y: -18, duration: 0.7, ease: EASE }, '+=0.15')
  .to(loader, {
    yPercent: -100, duration: 1.15, ease: 'expo.inOut',
    onComplete: () => { loader.style.display = 'none'; ScrollTrigger.refresh(); }
  }, '-=0.25')
  .add(heroIntro, '-=0.75');

  return tl;
}

/* ---------------------------------------------------------
   4 · Intro dell'hero
--------------------------------------------------------- */
function heroIntro() {
  const lines = document.querySelectorAll('.hero-title .line > span');
  const tl = gsap.timeline();
  tl.from(lines, { yPercent: 118, duration: 1.5, ease: 'expo.out', stagger: 0.11 })
    .to('.hero .eyebrow', { opacity: 1, y: 0, duration: 1, ease: EASE }, 0.25)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 1.1, ease: EASE }, 0.55)
    .from('.hero-foot', { opacity: 0, y: 18, duration: 1, ease: EASE }, 0.7)
    .from('.nav', { opacity: 0, y: -16, duration: 1, ease: EASE }, 0.4)
    .from('#heroImg', { scale: 1.16, duration: 2.4, ease: 'power2.out' }, 0);
}

/* ---------------------------------------------------------
   5 · Reveal generici
--------------------------------------------------------- */
function initReveals() {
  gsap.utils.toArray('.reveal-el').forEach((el) => {
    if (el.closest('.hero')) return; // gestiti dall'intro
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.25, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.035,
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
  });
}

/* ---------------------------------------------------------
   6 · Parallasse su elementi con data-speed
--------------------------------------------------------- */
function initParallax() {
  if (REDUCED) return;
  gsap.utils.toArray('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed);
    gsap.fromTo(el,
      { yPercent: -speed * 100 },
      {
        yPercent: speed * 100, ease: 'none',
        scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true }
      }
    );
  });
}

/* ---------------------------------------------------------
   7 · Immagine che si espande a tutto schermo
--------------------------------------------------------- */
function initExpand() {
  if (REDUCED) return;
  const fig = document.getElementById('expandFigure');
  const img = fig.querySelector('img');
  const cap = document.getElementById('expandCaption');
  const capLines = cap.querySelectorAll('.line > span');

  gsap.set(capLines, { yPercent: 110 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.expand', start: 'top top', end: 'bottom bottom', scrub: 1.1 }
  });

  tl.to(fig, { width: '100vw', height: '100svh', ease: 'none', duration: 1 }, 0)
    .to(img, { scale: 1, ease: 'none', duration: 1 }, 0)
    .to(capLines, { yPercent: 0, duration: 0.22, ease: 'power2.out', stagger: 0.05 }, 0.42)
    .to(cap, { opacity: 0, duration: 0.14, ease: 'none' }, 0.9);
}

/* ---------------------------------------------------------
   8 · Suite: scorrimento orizzontale + trascinamento
--------------------------------------------------------- */
function initHorizontal() {
  if (REDUCED) return;
  const wrap = document.getElementById('trackWrap');
  const track = document.getElementById('track');
  const distance = () => track.scrollWidth - window.innerWidth;
  if (distance() <= 0) return;

  const st = gsap.to(track, {
    x: () => -distance(), ease: 'none',
    scrollTrigger: {
      trigger: '.suites', start: 'top top', end: () => '+=' + distance(),
      pin: true, scrub: 1.1, invalidateOnRefresh: true, anticipatePin: 1
    }
  });

  // trascinamento con il puntatore, tradotto in scroll verticale
  let down = false, startX = 0, startScroll = 0;
  wrap.addEventListener('pointerdown', (e) => {
    down = true; startX = e.clientX;
    startScroll = lenis ? lenis.scroll : window.scrollY;
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!down) return;
    const delta = (startX - e.clientX) * 1.5;
    const target = startScroll + delta;
    if (lenis) lenis.scrollTo(target, { immediate: true }); else window.scrollTo(0, target);
  });
  const release = (e) => { if (down) { down = false; try { wrap.releasePointerCapture(e.pointerId); } catch (_) {} } };
  wrap.addEventListener('pointerup', release);
  wrap.addEventListener('pointercancel', release);

  return st;
}

/* ---------------------------------------------------------
   9 · Contatori
--------------------------------------------------------- */
function initCounters() {
  gsap.utils.toArray('.fig').forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || '';
    const obj = { v: end > 1000 ? end - 120 : 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        if (REDUCED) { el.textContent = prefix + (end > 1000 ? String(end).slice(-3) : end); return; }
        gsap.to(obj, {
          v: end, duration: 2, ease: 'power2.out',
          onUpdate: () => {
            const n = Math.round(obj.v);
            el.textContent = prefix + (end > 1000 ? String(n).slice(-3) : n);
          }
        });
      }
    });
  });
}

/* ---------------------------------------------------------
   10 · Nav che si fissa
--------------------------------------------------------- */
function initNav() {
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => document.getElementById('nav').classList.toggle('is-stuck', self.scroll() > 80)
  });
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.6 });
      else t.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ---------------------------------------------------------
   11 · Cursore e bottoni magnetici
--------------------------------------------------------- */
function initCursor() {
  if (REDUCED || window.matchMedia('(hover: none)').matches) return;
  const cur = document.querySelector('.cursor');
  const dot = cur.querySelector('.cursor-dot');
  const ring = cur.querySelector('.cursor-ring');
  const label = cur.querySelector('.cursor-label');

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };
  const setDot = { x: gsap.quickSetter(dot, 'x', 'px'), y: gsap.quickSetter(dot, 'y', 'px') };
  const setRing = { x: gsap.quickSetter(ring, 'x', 'px'), y: gsap.quickSetter(ring, 'y', 'px') };

  window.addEventListener('pointermove', (e) => { pos.x = e.clientX; pos.y = e.clientY; });
  gsap.ticker.add(() => {
    setDot.x(pos.x); setDot.y(pos.y);
    ringPos.x += (pos.x - ringPos.x) * 0.14;
    ringPos.y += (pos.y - ringPos.y) * 0.14;
    setRing.x(ringPos.x); setRing.y(ringPos.y);
  });

  document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      cur.classList.add('is-active');
      label.textContent = el.dataset.cursor || '';
    });
    el.addEventListener('pointerleave', () => {
      cur.classList.remove('is-active');
      label.textContent = '';
    });
  });

  // magnetismo
  document.querySelectorAll('.btn-magnetic').forEach((btn) => {
    const strength = 0.32;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - (r.left + r.width / 2)) * strength,
        y: (e.clientY - (r.top + r.height / 2)) * strength,
        duration: 0.9, ease: EASE
      });
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ---------------------------------------------------------
   Avvio
--------------------------------------------------------- */
function boot() {
  initNav();
  initReveals();
  initParallax();
  initExpand();
  initHorizontal();
  initCounters();
  initCursor();

  if (REDUCED) {
    document.body.classList.add('js-ready');
    document.getElementById('loader').style.display = 'none';
    gsap.set('.reveal-el', { opacity: 1, y: 0 });
  } else {
    runLoader();
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 220); });
}

document.addEventListener('DOMContentLoaded', boot);
