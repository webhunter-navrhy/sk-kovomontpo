// KOVOMONT-PO – náhľad (bez knižníc, natívny scroll)
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // nav
  const nav = $('#nav'), toggle = $('#toggle');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); toggle.setAttribute('aria-expanded', false); document.body.style.overflow = '';
  }));

  // reveal
  $$('.ref__row.reveal').forEach((el, i) => el.style.setProperty('--d', i % 5));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // counters
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, from = +(el.dataset.from || 0), t0 = performance.now(), dur = 1600;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * k);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-to]').forEach(el => { el.textContent = el.dataset.from || 0; cio.observe(el); });

  // činnosti – náhľad fotky pri kurzore
  const pv = $('#preview');
  if (fine && pv) {
    const img = $('img', pv);
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (x - cx) * .18; cy += (y - cy) * .18;
      pv.style.transform = `translate3d(${cx + 28}px, ${cy - 110}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > .5 ? requestAnimationFrame(loop) : 0;
    };
    $$('.svc__row').forEach(row => {
      row.addEventListener('mouseenter', e => { img.src = row.dataset.img; x = cx = e.clientX; y = cy = e.clientY; pv.classList.add('on'); });
      row.addEventListener('mouseleave', () => pv.classList.remove('on'));
      row.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }

  // magnetické tlačidlá
  if (fine) $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1), background .3s'; b.style.transform = ''; });
    b.addEventListener('mouseenter', () => { b.style.transition = 'background .3s'; });
  });

  // strojový park – ťahanie myšou
  const rail = $('#rail');
  if (rail && fine) {
    let down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; rail.classList.add('drag'); }
      rail.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => { if (!down) return; down = false; rail.classList.remove('drag'); });
    rail.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
  }

  // lightbox
  const lb = $('#lb'), lbImg = $('img', lb);
  const close = () => { lb.classList.remove('on'); setTimeout(() => { lb.hidden = true; lbImg.src = ''; }, 300); document.body.style.overflow = ''; };
  $$('[data-full]').forEach(el => el.addEventListener('click', () => {
    lbImg.src = el.dataset.full; lbImg.alt = $('img', el)?.alt || el.textContent.trim();
    lb.hidden = false; requestAnimationFrame(() => lb.classList.add('on')); document.body.style.overflow = 'hidden';
  }));
  lb.addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });

  // formulár (náhľad)
  const f = $('#form'), msg = $('#fmsg'), fname = $('#fname');
  $('input[type=file]', f).addEventListener('change', e => {
    const n = [...e.target.files].map(x => x.name).join(', ');
    fname.textContent = n || 'PDF, DWG, JPG';
  });
  f.addEventListener('submit', e => {
    e.preventDefault();
    msg.textContent = 'Toto je náhľad webu – formulár bude funkčný v hotovej verzii.';
  });
})();
