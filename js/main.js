/* ============================================================
 * Creator Station — Dashboard rendering & rich interactions
 * Particle system, cursor glow, 3D tilt, spring animations
 * ============================================================ */

/* ---------- Platform Logos (official brand SVG paths, 48x48 rounded card) ----------
 * Each logo uses the official vector path from brand guidelines / simple-icons.
 * Background = brand color rounded square; foreground = white glyph centered.
 * ------------------------------------------------------------------- */
const ICONS = {
  // YouTube: official red rounded rect + white play triangle (YouTube Full Color)
  youtube: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#FF0000"/>
    <path d="M46.996 12.372c-.55-2.05-2.167-3.667-4.217-4.22C38.99 7.224 24 7.224 24 7.224s-14.99 0-18.779.928c-2.05.553-3.667 2.17-4.217 4.22C.08 16.16.08 24 .08 24s0 7.84.924 11.628c.55 2.05 2.167 3.667 4.217 4.22C9.01 40.776 24 40.776 24 40.776s14.99 0 18.779-.928c2.05-.553 3.667-2.17 4.217-4.22.924-3.788.924-11.628.924-11.628s0-7.84-.924-11.628zM19.09 31.136V16.864L31.636 24 19.09 31.136z" fill="#FFFFFF" transform="translate(0,0)"/>
  </svg>`,

  // Douyin: black bg + official cyan (#25F4EE) & red (#FE2C55) offset note glyph
  douyin: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#000000"/>
    <g transform="translate(11,8) scale(1.08)">
      <path d="M25.05 10.52c-2.92 0-5.3-2.38-5.3-5.3V3.2h-3.92v14.93c0 1.82-1.48 3.3-3.3 3.3s-3.3-1.48-3.3-3.3 1.48-3.3 3.3-3.3c.34 0 .67.05.98.15v-3.98a7.28 7.28 0 0 0-.98-.07C8.55 10.93 5 14.48 5 18.9s3.55 7.97 7.97 7.97 7.97-3.55 7.97-7.97v-7.6a9.6 9.6 0 0 0 5.6 1.79V9.97c-.5 0-.99-.05-1.49-.15.34.55.49 1.18.49 1.83l-.49-1.13z" fill="#25F4EE" transform="translate(1.2,1.2)"/>
      <path d="M25.05 10.52c-2.92 0-5.3-2.38-5.3-5.3V3.2h-3.92v14.93c0 1.82-1.48 3.3-3.3 3.3s-3.3-1.48-3.3-3.3 1.48-3.3 3.3-3.3c.34 0 .67.05.98.15v-3.98a7.28 7.28 0 0 0-.98-.07C8.55 10.93 5 14.48 5 18.9s3.55 7.97 7.97 7.97 7.97-3.55 7.97-7.97v-7.6a9.6 9.6 0 0 0 5.6 1.79V9.97c-.5 0-.99-.05-1.49-.15.34.55.49 1.18.49 1.83l-.49-1.13z" fill="#FFFFFF"/>
      <path d="M25.05 10.52c-2.92 0-5.3-2.38-5.3-5.3V3.2h-3.92v14.93c0 1.82-1.48 3.3-3.3 3.3s-3.3-1.48-3.3-3.3 1.48-3.3 3.3-3.3c.34 0 .67.05.98.15v-3.98a7.28 7.28 0 0 0-.98-.07C8.55 10.93 5 14.48 5 18.9s3.55 7.97 7.97 7.97 7.97-3.55 7.97-7.97v-7.6a9.6 9.6 0 0 0 5.6 1.79V9.97c-.5 0-.99-.05-1.49-.15.34.55.49 1.18.49 1.83l-.49-1.13z" fill="#FE2C55" transform="translate(-1.2,-1.2)"/>
    </g>
  </svg>`,

  // Xiaohongshu (RED): red bg + white "小红书" style glyph using official "小" + "红书" wordmark
  xiaohongshu: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#FF2442"/>
    <g fill="#FFFFFF">
      <rect x="11" y="14" width="3.2" height="20" rx="0.5"/>
      <path d="M16.5 14h3v8.2l5.3-8.2h3.6l-6.2 9 6.6 11h-3.8l-5.1-8.6v8.6h-3.4z"/>
      <path d="M30 14h2.8l2.2 6 2.2-6h2.8l-3.6 9 3.8 11h-3l-2.4-7-2.4 7h-3l3.8-11z"/>
    </g>
  </svg>`,

  // Bilibili: blue bg + official white TV-with-antenna mascot glyph
  bilibili: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#00A1D6"/>
    <path d="M35.627 9.3h-1.14l2.54-2.54c1.8-1.8-.9-4.5-2.7-2.7l-5.22 5.22H15.173L9.953 4.06c-1.8-1.8-4.5.9-2.7 2.7l2.54 2.54h-1.14C5.969 9.3 4 11.269 4 13.669v21c0 2.4 1.969 4.369 4.369 4.369h27.258c2.4 0 4.369-1.969 4.369-4.369v-21c0-2.4-1.969-4.369-4.369-4.369zm-12.672 18.672H12.06v-3h10.895v3zm9.236-6H21.1v-3h11.091v3z" fill="#FFFFFF" transform="translate(2,3)"/>
  </svg>`,

  // Kuaishou: orange bg + official white camera+film glyph (Kuaishou brand mark)
  kuaishou: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#FF4906"/>
    <g fill="#FFFFFF" transform="translate(10,10)">
      <path d="M23 3.2c.8-.2 1.6.3 1.8 1.1.1.5 0 .9-.3 1.3l-4.3 5.2 3.2 1.9c1.2.7 1.6 2.3.9 3.5-.2.4-.5.7-.9.9l-3.2 1.9 4.3 5.2c.5.6.4 1.5-.2 2-.4.3-.8.4-1.3.3L4.5 21.5c-1.4-.3-2.3-1.6-2-3 .2-.9.8-1.6 1.7-1.9L23 3.2z"/>
      <circle cx="3.5" cy="6.5" r="2.5"/>
    </g>
  </svg>`,

  // Toutiao (Jinri Toutiao): red bg + white official "头条" abstract news glyph
  toutiao: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#D9262C"/>
    <g fill="#FFFFFF" transform="translate(8,9)">
      <path d="M0 2.5h32v4.2H20.5V30h-8.8V6.7H0z"/>
    </g>
  </svg>`,

  // Xigua Video: red bg + white watermelon+play glyph (official brand mark)
  xigua: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#FE3020"/>
    <g transform="translate(9,9)">
      <circle cx="15" cy="15" r="13" fill="#FFFFFF"/>
      <circle cx="15" cy="15" r="10.5" fill="#FE3020"/>
      <polygon points="12,9 21,15 12,21" fill="#FFFFFF"/>
      <ellipse cx="15" cy="2" rx="3" ry="1.5" fill="#4CAF50"/>
      <ellipse cx="11" cy="3" rx="2" ry="1" fill="#4CAF50" transform="rotate(-30 11 3)"/>
      <ellipse cx="19" cy="3" rx="2" ry="1" fill="#4CAF50" transform="rotate(30 19 3)"/>
    </g>
  </svg>`,

  // Haokan (Baidu Haokan Video): blue bg + white play-in-hexagon glyph
  haokan: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#2A6EFF"/>
    <g fill="#FFFFFF" transform="translate(10,11)">
      <path d="M14 0 1.8 7v14L14 28l12.2-7V7L14 0z" opacity="0.25"/>
      <path d="M14 0 1.8 7v14L14 28l12.2-7V7L14 0zm0 4 8.5 4.9v9.8L14 23.4 5.5 18.7v-9.8L14 4z"/>
      <polygon points="11,9 19,14 11,19"/>
    </g>
  </svg>`
};

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
          <span class="pcard__icon" style="box-shadow: 0 4px 20px ${p.color}30;">${ICONS[p.slug] || ''}</span>
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
