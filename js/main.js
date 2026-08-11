/* ERHU STUDIO - interactions + i18n */

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

/* ---------- i18n ---------- */
const I18N = {
  en: {
    htmlLang: 'en',
    title: 'Erhu Studio - Creator Dashboard',
    topbarUpdated: 'UPDATED',
    topbarPlatforms: '8 PLATFORMS',
    heroKicker: ['CREATOR', 'ERHU TEACHER', 'GLOBAL REACH'],
    heroTitle: [
      { t: 'Sound of' },
      { t: 'two strings,', i: true },
      { t: 'eight screens.' }
    ],
    heroSub: 'One erhu teacher. Eight video platforms. Every follower, every view, every channel, in a single command center.',
    ctaEnter: 'Enter channels',
    ctaNumbers: 'See the numbers',
    discFollowers: 'FOLLOWERS',
    discRing: 'ERHU STUDIO · GLOBAL CREATOR · TWO STRINGS · ',
    numFollowers: 'TOTAL FOLLOWERS',
    numViews: 'TOTAL VIEWS',
    numPlatforms: 'PLATFORMS',
    channelsTitle: [
      { t: 'All channels,' },
      { t: 'one click away.', i: true }
    ],
    channelsSub: 'Pick a platform. Open the channel. The music continues there.',
    outroEyebrow: 'START LISTENING',
    outroTitle: [
      { t: 'Two strings,' },
      { t: 'infinite reach.', i: true }
    ],
    outroSub: 'Tap any card above to jump into a live channel, a lesson, or a performance.',
    footerTag: 'Designed for sound. Built for reach.',
    unitMap: { subscribers: 'subscribers', followers: 'followers', views: 'views' }
  },
  zh: {
    htmlLang: 'zh-CN',
    title: 'Erhu Studio - 全平台数据中心',
    topbarUpdated: '更新于',
    topbarPlatforms: '8 个平台',
    heroKicker: ['创作者', '二胡教师', '全球覆盖'],
    heroTitle: [
      { t: '两弦之音' },
      { t: '八屏共鸣。', i: true }
    ],
    heroSub: '一位二胡老师，八大视频平台。粉丝、播放、所有频道，尽在一个数据中心。',
    ctaEnter: '进入频道',
    ctaNumbers: '查看数据',
    discFollowers: '粉丝',
    discRing: 'ERHU 工作室 · 全球创作者 · 两弦之声 · ',
    numFollowers: '全网粉丝',
    numViews: '累计播放',
    numPlatforms: '入驻平台',
    channelsTitle: [
      { t: '所有频道，' },
      { t: '一键直达。', i: true }
    ],
    channelsSub: '选择一个平台，打开频道，音乐在那里继续。',
    outroEyebrow: '开始聆听',
    outroTitle: [
      { t: '两根琴弦，' },
      { t: '无限触达。', i: true }
    ],
    outroSub: '点击上方任意卡片，进入直播、课程或演奏现场。',
    footerTag: '为声音而设计，为触达而构建。',
    unitMap: { subscribers: '订阅', followers: '粉丝', views: '播放' }
  },
  ja: {
    htmlLang: 'ja',
    title: 'Erhu Studio - クリエイターダッシュボード',
    topbarUpdated: '更新',
    topbarPlatforms: '8 プラットフォーム',
    heroKicker: ['クリエイター', '二胡講師', 'グローバル展開'],
    heroTitle: [
      { t: '二本の弦' },
      { t: '八つの画面。', i: true }
    ],
    heroSub: '一人の二胡講師、8つの動画プラットフォーム。フォロワーも再生数も、すべてのチャンネルを一つの指揮台に。',
    ctaEnter: 'チャンネルへ',
    ctaNumbers: '数字を見る',
    discFollowers: 'フォロワー',
    discRing: 'ERHU スタジオ · グローバルクリエイター · 二本の弦 · ',
    numFollowers: '総フォロワー',
    numViews: '総再生数',
    numPlatforms: 'プラットフォーム',
    channelsTitle: [
      { t: 'すべてのチャンネル、' },
      { t: 'ワンクリックで。', i: true }
    ],
    channelsSub: 'プラットフォームを選んでチャンネルを開く。音楽はそこで続く。',
    outroEyebrow: '聴き始める',
    outroTitle: [
      { t: '二本の弦、' },
      { t: '無限のリーチ。', i: true }
    ],
    outroSub: '上のカードをタップして、ライブ配信、レッスン、演奏へ。',
    footerTag: '音のために設計。リーチのために構築。',
    unitMap: { subscribers: '登録者', followers: 'フォロワー', views: '再生回数' }
  }
};

let currentLang = localStorage.getItem('erhu-lang') || 'en';
const board = document.getElementById('platformBoard');

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

/* ---------- Cursor glow (rAF lerp) ---------- */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || reduceMotion) return;
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty;
  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  function loop() {
    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();
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
  if (el.dataset.done === '1') return;
  el.dataset.done = '1';
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

function whenVisible(el, cb, threshold = 0.15) {
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      cb();
      io.disconnect();
    });
  }, { threshold, rootMargin: '0px 0px 15% 0px' });
  io.observe(el);
}

/* ---------- Split text titles (rebuilt per language) ---------- */
function splitTitle(el, lines, animate) {
  if (!el) return;
  el.innerHTML = lines.map((line) => {
    return `<span class="line ${line.i ? 'line--italic' : ''}">` +
      `<span class="line__inner">${line.t}</span></span>`;
  }).join('');

  if (reduceMotion || !animate) {
    el.querySelectorAll('.line__inner').forEach(i => i.style.transform = 'none');
    return;
  }
  const inners = el.querySelectorAll('.line__inner');
  inners.forEach((inner, li) => {
    inner.style.transform = 'translateY(110%)';
    inner.style.transitionDelay = (li * 0.12) + 's';
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    inners.forEach(i => { i.style.transform = 'translateY(0)'; });
  }));
}

/* ---------- Card spotlight ---------- */
function bindSpotlight(card) {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

/* ---------- Render platform grid ---------- */
function renderCards(animate) {
  if (!board) return;
  const t = I18N[currentLang];
  const totalFollowers = PLATFORMS.reduce((s, p) => s + p.followers, 0);
  const totalViews = PLATFORMS.reduce((s, p) => s + p.views, 0);

  board.innerHTML = PLATFORMS.map((p, i) => {
    const logo = LOGOS[p.slug];
    const cc = p.accent || p.color;
    const isDouyin = p.slug === 'douyin';
    const unit = t.unitMap[p.unit] || p.unit;
    const viewsUnit = t.unitMap[p.viewsUnit] || p.viewsUnit;
    return `
      <a class="card${isDouyin ? ' card--douyin' : ''}"
         href="${p.url}" target="_blank" rel="noopener noreferrer"
         style="--cc:${cc};"
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
            <div class="stat__val" ${animate ? '' : 'data-done="1"'}>${animate ? '0' : fmt(p.followers)}</div>
            <div class="stat__lab">${unit}</div>
          </div>
          <div class="stat">
            <div class="stat__val" ${animate ? '' : 'data-done="1"'}>${animate ? '0' : fmt(p.views)}</div>
            <div class="stat__lab">${viewsUnit}</div>
          </div>
        </div>
        <span class="card__arrow">${ARROW}</span>
      </a>
    `;
  }).join('');

  const cards = Array.from(board.querySelectorAll('.card'));
  cards.forEach(bindSpotlight);

  if (animate) {
    whenVisible(board, () => {
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('is-in');
          const vals = card.querySelectorAll('.stat__val');
          countUp(vals[0], +card.dataset.f, 1400 + i * 80);
          countUp(vals[1], +card.dataset.v, 1600 + i * 80);
        }, i * 70);
      });
    }, 0.1);
  } else {
    cards.forEach(c => c.classList.add('is-in'));
  }

  return { totalFollowers, totalViews };
}

let totalAnimated = false;
let discAnimated = false;

function animateTotals(totalFollowers, totalViews) {
  const totalF = document.getElementById('totalFollowers');
  const totalV = document.getElementById('totalViews');
  const discF = document.getElementById('discFollowers');

  if (!discAnimated && discF) {
    discAnimated = true;
    countUp(discF, totalFollowers, 2000);
  } else if (discF) {
    discF.textContent = fmt(totalFollowers);
  }

  const run = () => {
    if (totalAnimated) {
      if (totalF) totalF.textContent = fmt(totalFollowers);
      if (totalV) totalV.textContent = fmt(totalViews);
      return;
    }
    totalAnimated = true;
    countUp(totalF, totalFollowers, 1800);
    countUp(totalV, totalViews, 2000);
  };

  if (totalAnimated) {
    run();
  } else {
    whenVisible(document.querySelector('.numbers'), run, 0.25);
  }
}
function applyLang(lang, animateTitles) {
  const t = I18N[lang];
  if (!t) return;
  currentLang = lang;
  localStorage.setItem('erhu-lang', lang);
  document.documentElement.lang = t.htmlLang;
  document.title = t.title;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key] && typeof t[key] === 'string') el.textContent = t[key];
  });

  const kicker = document.querySelector('.hero__kicker');
  if (kicker) kicker.innerHTML = t.heroKicker.map(k => `<span>${k}</span>`).join('');

  splitTitle(document.getElementById('heroTitle'), t.heroTitle, animateTitles);
  splitTitle(document.getElementById('channelsTitle'), t.channelsTitle, animateTitles);
  splitTitle(document.getElementById('outroTitle'), t.outroTitle, animateTitles);

  document.querySelectorAll('.lang__btn').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.lang === lang);
  });

  const totals = renderCards(animateTitles);
  if (totals) animateTotals(totals.totalFollowers, totals.totalViews);
}

/* ---------- Language switcher ---------- */
function initLangSwitch() {
  document.querySelectorAll('.lang__btn').forEach((btn) => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang, true));
  });
}

/* ---------- Boot ---------- */
function boot() {
  initNoise();
  initCursorGlow();
  initLangSwitch();
  const updated = document.getElementById('boardUpdated');
  if (updated) updated.textContent = BOARD_UPDATED_AT;
  applyLang(currentLang, true);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
