/* ERHU STUDIO - interactions */

const LOGOS = {
  youtube:     { file: 'assets/logos/youtube.svg',     bg: '#FF0000' },
  douyin:      { file: 'assets/logos/tiktok.svg',      bg: '#000000' },
  xiaohongshu: { file: 'assets/logos/xiaohongshu.svg', bg: '#FF2442' },
  bilibili:    { file: 'assets/logos/bilibili.svg',    bg: '#00A1D6' },
  kuaishou:    { file: 'assets/logos/kuaishou.svg',    bg: '#FF4906' },
  toutiao:     { file: 'assets/logos/toutiao.png',     bg: '#D9262C' },
  xigua:       { file: 'assets/logos/xigua.ico',       bg: '#FE3020' },
  haokan:      { file: 'assets/logos/haokan.png',      bg: '#2A6EFF' },
};

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Noise canvas (cheap grain) ---------- */
function initNoise() {
  const canvas = document.getElementById('noiseCanvas');
  if (!canvas || reduceMotion) {
    if (canvas) canvas.style.display = 'none';
    return;
  }
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, raf;
  function resize() {
    w = canvas.width = Math.floor(window.innerWidth / 2);
    h = canvas.height = Math.floor(window.innerHeight / 2);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  function draw() {
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 18;
    }
    ctx.putImageData(img, 0, 0);
    raf = setTimeout(() => requestAnimationFrame(draw), 90);
  }
  resize();
  draw();
  window.addEventListener('resize', () => {
    clearTimeout(raf);
    resize();
    draw();
  }, { passive: true });
}

/* ---------- Cursor glow (rAF lerp, no React state) ---------- */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || reduceMotion) return;
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty, raf;
  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  function loop() {
    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- Split-text line reveal ---------- */
function initSplitReveal() {
  const blocks = document.querySelectorAll('[data-split]');
  blocks.forEach((block, bi) => {
    const lines = block.querySelectorAll('.line');
    lines.forEach((line, li) => {
      const text = line.textContent;
      line.textContent = '';
      const inner = document.createElement('span');
      inner.className = 'line__inner';
      [...text].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        inner.appendChild(s);
      });
      line.appendChild(inner);

      if (reduceMotion) {
        inner.style.transform = 'none';
        return;
      }
      inner.style.transform = 'translateY(110%)';
      inner.style.transition = `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${(bi * 0.1) + (li * 0.12)}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { inner.style.transform = 'translateY(0)'; });
      });
    });
  });
}

/* ---------- Number formatting ---------- */
function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString('en-US');
}

function countUp(el, target, dur = 1600) {
  if (!el) return;
  if (reduceMotion) { el.textContent = fmt(target); return; }
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = fmt(Math.round(target * e));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- Card spotlight (mouse position per card) ---------- */
function bindSpotlight(card) {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

/* ---------- Render platform grid ---------- */
function render() {
  const board = document.getElementById('platformBoard');
  if (!board) return;

  const updated = document.getElementById('boardUpdated');
  if (updated) updated.textContent = BOARD_UPDATED_AT;

  const totalFollowers = PLATFORMS.reduce((s, p) => s + p.followers, 0);
  const totalViews = PLATFORMS.reduce((s, p) => s + p.views, 0);

  board.innerHTML = PLATFORMS.map((p, i) => {
    const logo = LOGOS[p.slug];
    const cc = p.accent || p.color;
    const isDouyin = p.slug === 'douyin';
    return `
      <a class="card${isDouyin ? ' card--douyin' : ''}"
         href="${p.url}" target="_blank" rel="noopener noreferrer"
         style="--cc:${cc}; --i:${i};"
         data-f="${p.followers}" data-v="${p.views}">
        <div class="card__top">
          <div class="card__logo"><img src="${logo.file}" alt="${p.name}"></div>
          <span class="card__idx">0${i + 1}</span>
        </div>
        <div class="card__mid">
          <div class="card__name">${p.name}</div>
          <div class="card__handle">${p.handle}</div>
        </div>
        <div class="card__stats">
          <div class="stat">
            <div class="stat__val">0</div>
            <div class="stat__lab">${p.unit}</div>
          </div>
          <div class="stat">
            <div class="stat__val">0</div>
            <div class="stat__lab">${p.viewsUnit}</div>
          </div>
        </div>
        <span class="card__arrow">${ARROW}</span>
      </a>
    `;
  }).join('');

  const cards = Array.from(board.querySelectorAll('.card'));
  cards.forEach(bindSpotlight);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('is-in');
          const vals = card.querySelectorAll('.stat__val');
          countUp(vals[0], +card.dataset.f, 1400 + i * 80);
          countUp(vals[1], +card.dataset.v, 1600 + i * 80);
        }, i * 70);
      });
      countUp(document.getElementById('totalFollowers'), totalFollowers, 2000);
      countUp(document.getElementById('totalViews'), totalViews, 2200);
      countUp(document.getElementById('discFollowers'), totalFollowers, 2200);
      io.disconnect();
    });
  }, { threshold: 0.15 });
  io.observe(board);
}

/* ---------- Boot ---------- */
function boot() {
  initNoise();
  initCursorGlow();
  initSplitReveal();
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
