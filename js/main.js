/* ============================================================
 * Creator Station — Dashboard rendering & rich interactions
 * Particle system, cursor glow, 3D tilt, spring animations
 * ============================================================ */

/* ---------- Platform Logos — official brand icons from simple-icons + platform CDNs ----------
 * 5 SVGs from simple-icons (official brand icons, MIT licensed)
 * 3 PNG/ICO fetched directly from each platform's official favicon CDN
 * All rendered as <img> inside a rounded brand-color card.
 */
const LOGO_FILES = {
  youtube:     { file: 'assets/logos/youtube.svg',     bg: '#FF0000' },
  douyin:      { file: 'assets/logos/tiktok.svg',      bg: '#000000' },
  xiaohongshu: { file: 'assets/logos/xiaohongshu.svg', bg: '#FF2442' },
  bilibili:    { file: 'assets/logos/bilibili.svg',    bg: '#00A1D6' },
  kuaishou:    { file: 'assets/logos/kuaishou.svg',    bg: '#FF4906' },
  toutiao:     { file: 'assets/logos/toutiao.png',     bg: '#D9262C' },
  xigua:       { file: 'assets/logos/xigua.ico',       bg: '#FE3020' },
  haokan:      { file: 'assets/logos/haokan.png',      bg: '#2A6EFF' },
};

function buildLogo(slug) {
  const l = LOGO_FILES[slug];
  if (!l) return '';
  return `<div class="logo-card" style="background:${l.bg};"><img src="${l.file}" alt="${slug}"/></div>`;
}

/* ---------- Arrow icon ---------- */
const ARROW_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;

/* ============================================================
 * PARTICLE SYSTEM
 * ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let mouseX = -1000, mouseY = -1000;
  const PARTICLE_COUNT = window.innerWidth < 768 ? 30 : 70;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3 - 0.1;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.5 ? '99,102,241' : '168,85,247';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interaction
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        this.x -= (dx / dist) * force * 2;
        this.y -= (dy / dist) * force * 2;
      }

      // Wrap edges
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 120) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    animId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    if (particles.length !== PARTICLE_COUNT) init();
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  init();
  animate();
}

/* ============================================================
 * CURSOR GLOW
 * ============================================================ */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  let currentX = 0, currentY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    currentX = lerp(currentX, targetX, 0.12);
    currentY = lerp(currentY, targetY, 0.12);
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animate);
  }
  animate();
}

/* ============================================================
 * Number formatting (Western K/M)
 * ============================================================ */
function formatCompact(n) {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString('en-US');
}

/* ============================================================
 * Eased count-up animation
 * ============================================================ */
function countUp(el, target, duration = 1800) {
  if (!el) return;
  if (target <= 0) { el.textContent = '0'; return; }
  const start = performance.now();
  const startVal = 0;
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    const val = Math.round(startVal + (target - startVal) * eased);
    el.textContent = formatCompact(val);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============================================================
 * Sparkline/area chart
 * ============================================================ */
function drawSparkline(container, color) {
  if (!container) return;
  const w = container.offsetWidth || container.parentElement.offsetWidth || 400;
  const h = 80;
  const points = 24;
  const seed = container.dataset.seed || 42;
  container.dataset.seed = seed;

  let pts = '';
  let y = h * 0.6;
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * w;
    y = y + (Math.sin(i * 0.45 + seed) * 7) + (Math.cos(i * 0.28 + seed * 0.6) * 5) - (i * 0.2);
    y = Math.max(12, Math.min(h - 12, y));
    pts += `${i === 0 ? 'M' : 'L'}${x},${y} `;
  }
  const area = pts + `L${w},${h} L0,${h} Z`;
  const cid = color.replace('#','');

  container.innerHTML = `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:100%">
      <defs>
        <linearGradient id="g-${cid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#g-${cid})"/>
      <path d="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

/* ============================================================
 * Mouse spotlight per card
 * ============================================================ */
function initSpotlight(el) {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  });
}

/* ============================================================
 * Subtle 3D tilt on hover (spring feel)
 * ============================================================ */
function initTilt(el) {
  let rafId = null;
  let isHovering = false;
  let currentRX = 0, currentRY = 0;

  el.addEventListener('mouseenter', () => { isHovering = true; });
  el.addEventListener('mouseleave', () => {
    isHovering = false;
    if (rafId) cancelAnimationFrame(rafId);
    function reset() {
      currentRX *= 0.85;
      currentRY *= 0.85;
      el.style.transform = `perspective(1000px) rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;
      if (Math.abs(currentRX) > 0.1 || Math.abs(currentRY) > 0.1) {
        rafId = requestAnimationFrame(reset);
      } else {
        el.style.transform = '';
      }
    }
    reset();
  });

  el.addEventListener('mousemove', (e) => {
    if (!isHovering) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      currentRX = currentRX + ((-dy * 5) - currentRX) * 0.15;
      currentRY = currentRY + ((dx * 5) - currentRY) * 0.15;
      el.style.transform = `perspective(1000px) rotateX(${currentRX.toFixed(2)}deg) rotateY(${currentRY.toFixed(2)}deg) translateY(-8px) scale(1.01)`;
    });
  });
}

/* ============================================================
 * Platform card glow color
 * ============================================================ */
function getCardGlow(color) {
  return `radial-gradient(500px circle at var(--mx,50%) var(--my,50%), ${color}20, transparent 50%)`;
}

/* ============================================================
 * Render dashboard
 * ============================================================ */
function render() {
  const board = document.getElementById('platformBoard');
  if (!board) return;

  const updatedEl = document.getElementById('boardUpdated');
  if (updatedEl) updatedEl.textContent = BOARD_UPDATED_AT;

  const totalFollowers = PLATFORMS.reduce((s, p) => s + p.followers, 0);
  const totalViews = PLATFORMS.reduce((s, p) => s + p.views, 0);

  board.innerHTML = PLATFORMS.map((p, i) => {
    const glowStyle = `background: ${getCardGlow(p.accent || p.color)};`;
    const textColor = p.accent || p.color;
    const isDouyin = p.slug === 'douyin';
    return `
      <a class="pcard" href="${p.url}" target="_blank" rel="noopener noreferrer"
         style="--card-color:${textColor}; animation-delay: ${i * 0.07}s;"
         data-followers="${p.followers}" data-views="${p.views}"
         ${isDouyin ? 'data-douyin="true"' : ''}>
        <div class="pcard__glow" style="${glowStyle}"></div>
        <div class="pcard__head">
          <span class="pcard__icon" style="box-shadow: 0 4px 20px ${p.color}30;">${buildLogo(p.slug)}</span>
          <div class="pcard__info">
            <div class="pcard__name">${p.name}</div>
            <div class="pcard__handle">${p.handle}</div>
          </div>
          <span class="pcard__arrow">${ARROW_SVG}</span>
        </div>
        <div class="pcard__body">
          <div class="pcard__followers" ${!isDouyin ? `style="color:${textColor}"` : ''}>0</div>
          <div class="pcard__followers-label">${p.unit}</div>
        </div>
        <div class="pcard__foot">
          <div>
            <div class="pcard__views-val" ${!isDouyin ? `style="color:${textColor}"` : ''}>0</div>
            <div class="pcard__views-label">${p.viewsUnit}</div>
          </div>
          <div class="pcard__bars" style="color:${textColor}" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  const pcardEls = board.querySelectorAll('.pcard');

  // Staggered entrance with IntersectionObserver
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Animate cards in with spring stagger
      pcardEls.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('shown');
          countUp(card.querySelector('.pcard__followers'), Number(card.dataset.followers), 1600 + i * 100);
          countUp(card.querySelector('.pcard__views-val'), Number(card.dataset.views), 1800 + i * 100);
          initSpotlight(card);
          initTilt(card);
        }, i * 90);
      });

      // Animate total stats
      setTimeout(() => {
        countUp(document.getElementById('totalFollowers'), totalFollowers, 2200);
        countUp(document.getElementById('totalViews'), totalViews, 2400);
      }, 300);

      // Draw sparkline
      setTimeout(() => drawSparkline(document.getElementById('followersChart'), '#6366F1'), 600);

      io.disconnect();
    });
  }, { threshold: 0.05 });
  io.observe(board);

  // Spotlight on stat tiles and header
  document.querySelectorAll('.tile').forEach(t => initSpotlight(t));

  // Redraw sparkline on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drawSparkline(document.getElementById('followersChart'), '#6366F1');
    }, 250);
  });
}

/* ============================================================
 * Parallax for background shapes
 * ============================================================ */
function initParallax() {
  const shapes = document.querySelectorAll('.shape');
  if (!shapes.length) return;

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    shapes.forEach((shape, i) => {
      const depth = (i + 1) * 8;
      const x = dx * depth;
      const y = dy * depth;
      shape.style.transform = `translate(${x}px, ${y}px)`;
    });
  }, { passive: true });
}

/* ============================================================
 * Boot everything
 * ============================================================ */
function boot() {
  initParticles();
  initCursorGlow();
  initParallax();
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
