/**
 * ============================================================
 * Platform Data Crawler for Personal Resume Dashboard
 * ============================================================
 *
 * 功能：自动爬取各平台粉丝数和观看量数据，更新 data.js
 *
 * 支持的平台：
 *   - YouTube    (puppeteer 页面抓取)
 *   - Bilibili   (API fetch)
 *   - Douyin     (puppeteer 页面抓取)
 *   - Xigua      (puppeteer 页面抓取)
 *   - Haokan     (puppeteer 页面抓取)
 *   - Xiaohongshu (需要 cookie，见环境变量 XHS_COOKIE)
 *   - Kuaishou    (需要 cookie，见环境变量 KS_COOKIE)
 *   - Toutiao     (需要 cookie，见环境变量 TT_COOKIE)
 *
 * ------------------------------------------------------------
 * 本地运行方式：
 *   1. npm install
 *   2. npm run crawl
 *      或直接: node scripts/crawl.mjs
 *
 * ------------------------------------------------------------
 * GitHub Actions 运行方式：
 *   - .github/workflows/crawl.yml 每天北京时间 8:00 自动运行
 *   - 也可在 GitHub 仓库的 Actions 页面手动触发 (workflow_dispatch)
 *   - 爬取后自动 commit 并 push 更新后的 data.js
 *
 * ------------------------------------------------------------
 * 需要登录的平台 Cookie 配置：
 *   小红书、快手、头条需要登录态才能访问数据。
 *   在浏览器中登录对应平台后，从开发者工具 → Network →
 *   任意请求的 Request Headers 中复制 Cookie 值。
 *
 *   本地运行时设置环境变量：
 *     set XHS_COOKIE=你的小红书cookie    (Windows CMD)
 *     $env:XHS_COOKIE="你的小红书cookie" (PowerShell)
 *     export XHS_COOKIE=你的小红书cookie  (Linux/Mac)
 *     （KS_COOKIE、TT_COOKIE 同理）
 *
 *   GitHub Actions 中配置：
 *     在仓库 Settings → Secrets and variables → Actions
 *     添加名为 XHS_COOKIE / KS_COOKIE / TT_COOKIE 的 secrets
 *
 *   如果某个 cookie 未设置，对应平台会被跳过，保留 data.js 中的原数据。
 * ============================================================
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ============================================================
// 常量
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data.js');
const TIMEOUT_MS = 15000;

const UA_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

// ============================================================
// 数字解析辅助函数
// ============================================================

/**
 * 解析中文数字字符串，如 "9.9万" → 99000，"1.2亿" → 120000000
 * @param {string|number} str
 * @returns {number|null}
 */
function parseChineseNumber(str) {
  if (str == null) return null;
  const s = String(str).trim().replace(/,/g, '');
  const m = s.match(/([\d.]+)\s*(万|亿)?/);
  if (!m) return null;
  const num = parseFloat(m[1]);
  if (isNaN(num)) return null;
  if (m[2] === '万') return Math.round(num * 10000);
  if (m[2] === '亿') return Math.round(num * 100000000);
  return Math.round(num);
}

/**
 * 解析英文数字字符串，如 "1.7K" → 1700，"2.3M" → 2300000
 * @param {string|number} str
 * @returns {number|null}
 */
function parseEnglishNumber(str) {
  if (str == null) return null;
  const s = String(str).trim().replace(/,/g, '');
  const m = s.match(/([\d.]+)\s*([KkMm])?/);
  if (!m) return null;
  const num = parseFloat(m[1]);
  if (isNaN(num)) return null;
  const suffix = m[2] ? m[2].toUpperCase() : null;
  if (suffix === 'K') return Math.round(num * 1000);
  if (suffix === 'M') return Math.round(num * 1000000);
  return Math.round(num);
}

/**
 * 从 Cookie 字符串中解析出 cookie 对象数组
 * @param {string} cookieStr - "name1=val1; name2=val2" 格式
 * @param {string} domain - cookie 的 domain
 * @returns {Array<{name: string, value: string, domain: string}>}
 */
function parseCookieString(cookieStr, domain) {
  if (!cookieStr) return [];
  return cookieStr
    .split(';')
    .map((c) => c.trim())
    .filter((c) => c && c.includes('='))
    .map((c) => {
      const idx = c.indexOf('=');
      return {
        name: c.substring(0, idx).trim(),
        value: c.substring(idx + 1).trim(),
        domain,
      };
    });
}

// ============================================================
// 各平台爬虫函数
// ============================================================

/**
 * YouTube — 用 puppeteer 打开频道页面，提取订阅数和视频数
 * @returns {Promise<{followers: number, views: number}|null>}
 */
async function crawlYouTube(browser) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(UA_DESKTOP);
    await page.setDefaultTimeout(TIMEOUT_MS);
    await page.goto('https://www.youtube.com/@727601375', {
      waitUntil: 'networkidle2',
      timeout: TIMEOUT_MS,
    });
    // 等待动态内容加载
    await new Promise((r) => setTimeout(r, 4000));

    const text = await page.evaluate(() => document.body.innerText);

    let subscribers = null;
    let videos = null;

    // 订阅数 — 中文格式 "1700位订阅者"
    let m = text.match(/([\d.,]+[KkMm]?)\s*位订阅者/);
    if (m) subscribers = parseEnglishNumber(m[1]);

    // 订阅数 — 英文格式 "1.7K subscribers"
    if (subscribers == null) {
      m = text.match(/([\d.,]+[KkMm]?)\s*subscribers?/i);
      if (m) subscribers = parseEnglishNumber(m[1]);
    }

    // 视频数 — 中文格式 "104 个视频"
    m = text.match(/([\d.,]+)\s*个视频/);
    if (m) videos = parseInt(m[1].replace(/,/g, ''), 10);

    // 视频数 — 英文格式 "104 videos"
    if (videos == null) {
      m = text.match(/([\d.,]+)\s*videos?/i);
      if (m) videos = parseInt(m[1].replace(/,/g, ''), 10);
    }

    return { followers: subscribers, views: videos };
  } finally {
    await page.close();
  }
}

/**
 * Bilibili — 直接用 fetch 调用 API 获取粉丝数
 * @returns {Promise<{followers: number}|null>}
 */
async function crawlBilibili() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(
      'https://api.bilibili.com/x/relation/stat?vmid=32922418',
      {
        headers: {
          'User-Agent': UA_DESKTOP,
          Referer: 'https://space.bilibili.com/32922418',
        },
        signal: controller.signal,
      }
    );
    const json = await response.json();
    if (json.code === 0 && json.data && json.data.follower != null) {
      return { followers: json.data.follower };
    }
    console.warn('  [Bilibili] API 返回异常: code=%s message=%s', json.code, json.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Douyin — 用 puppeteer 打开抖音用户页面，提取粉丝数
 * @returns {Promise<{followers: number}|null>}
 */
async function crawlDouyin(browser) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(UA_DESKTOP);
    await page.setDefaultTimeout(TIMEOUT_MS);
    await page.goto(
      'https://www.douyin.com/user/MS4wLjABAAAAcMVcgWLueUbUgbw9DlmyFiS01QqSuNiRHNVWLWzMwDk',
      { waitUntil: 'networkidle2', timeout: TIMEOUT_MS }
    );
    await new Promise((r) => setTimeout(r, 5000));

    const text = await page.evaluate(() => document.body.innerText);

    let followers = null;

    // "粉丝 9.9万" 或 "粉丝数 9.9万" — 数字在"粉丝"后面
    let m = text.match(/粉丝[数]?\s*[:：]?\s*([\d.]+(?:万|亿)?)/);
    if (m) followers = parseChineseNumber(m[1]);

    // "9.9万粉丝" — 数字在"粉丝"前面
    if (followers == null) {
      m = text.match(/([\d.]+(?:万|亿)?)\s*粉丝/);
      if (m) followers = parseChineseNumber(m[1]);
    }

    return { followers };
  } finally {
    await page.close();
  }
}

/**
 * Xigua — 用 puppeteer 打开西瓜视频用户页面，提取粉丝数
 * @returns {Promise<{followers: number}|null>}
 */
async function crawlXigua(browser) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(UA_MOBILE);
    await page.setDefaultTimeout(TIMEOUT_MS);
    await page.goto('https://m.ixigua.com/user/111263884400', {
      waitUntil: 'networkidle2',
      timeout: TIMEOUT_MS,
    });
    await new Promise((r) => setTimeout(r, 4000));

    const text = await page.evaluate(() => document.body.innerText);

    let followers = null;

    // "粉丝 9.8万" 或 "粉丝数 9.8万"
    let m = text.match(/粉丝[数]?\s*[:：]?\s*([\d.]+(?:万|亿)?)/);
    if (m) followers = parseChineseNumber(m[1]);

    // "9.8万粉丝"
    if (followers == null) {
      m = text.match(/([\d.]+(?:万|亿)?)\s*粉丝/);
      if (m) followers = parseChineseNumber(m[1]);
    }

    return { followers };
  } finally {
    await page.close();
  }
}

/**
 * Haokan — 用 puppeteer 打开好看视频作者页面，提取粉丝数
 * 粉丝数格式为 "1.7万粉丝"（数字在"粉丝"文字之前）
 * @returns {Promise<{followers: number}|null>}
 */
async function crawlHaokan(browser) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(UA_DESKTOP);
    await page.setDefaultTimeout(TIMEOUT_MS);
    await page.goto('https://haokan.baidu.com/author/1658692152565148', {
      waitUntil: 'networkidle2',
      timeout: TIMEOUT_MS,
    });
    await new Promise((r) => setTimeout(r, 4000));

    const text = await page.evaluate(() => document.body.innerText);

    let followers = null;

    // "1.7万粉丝" — 数字在"粉丝"前面
    let m = text.match(/([\d.]+(?:万|亿)?)\s*粉丝/);
    if (m) followers = parseChineseNumber(m[1]);

    // "粉丝 1.7万" — 备用：数字在"粉丝"后面
    if (followers == null) {
      m = text.match(/粉丝[数]?\s*[:：]?\s*([\d.]+(?:万|亿)?)/);
      if (m) followers = parseChineseNumber(m[1]);
    }

    return { followers };
  } finally {
    await page.close();
  }
}

/**
 * Xiaohongshu (小红书) — 需要 cookie 登录态
 * @param {import('puppeteer').Browser} browser
 * @param {string} cookie - XHS_COOKIE 环境变量
 * @returns {Promise<{followers: number}|null>}
 */
async function crawlXiaohongshu(browser, cookie) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(UA_DESKTOP);
    await page.setDefaultTimeout(TIMEOUT_MS);

    // 在导航前设置 cookie
    const cookies = parseCookieString(cookie, '.xiaohongshu.com');
    for (const c of cookies) {
      await page.setCookie(c);
    }

    await page.goto(
      'https://www.xiaohongshu.com/user/profile/575567f250c4b430424a7bda',
      { waitUntil: 'networkidle2', timeout: TIMEOUT_MS }
    );
    await new Promise((r) => setTimeout(r, 4000));

    const text = await page.evaluate(() => document.body.innerText);

    let followers = null;

    // "粉丝 1.8万" 或 "1.8万粉丝"
    let m = text.match(/粉丝[数]?\s*[:：]?\s*([\d.]+(?:万|亿)?)/);
    if (m) followers = parseChineseNumber(m[1]);

    if (followers == null) {
      m = text.match(/([\d.]+(?:万|亿)?)\s*粉丝/);
      if (m) followers = parseChineseNumber(m[1]);
    }

    return { followers };
  } finally {
    await page.close();
  }
}

/**
 * Kuaishou (快手) — 需要 cookie 登录态
 * @param {import('puppeteer').Browser} browser
 * @param {string} cookie - KS_COOKIE 环境变量
 * @returns {Promise<{followers: number}|null>}
 */
async function crawlKuaishou(browser, cookie) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(UA_DESKTOP);
    await page.setDefaultTimeout(TIMEOUT_MS);

    const cookies = parseCookieString(cookie, '.kuaishou.com');
    for (const c of cookies) {
      await page.setCookie(c);
    }

    await page.goto('https://live.kuaishou.com/profile/Heyyou123', {
      waitUntil: 'networkidle2',
      timeout: TIMEOUT_MS,
    });
    await new Promise((r) => setTimeout(r, 4000));

    const text = await page.evaluate(() => document.body.innerText);

    let followers = null;

    let m = text.match(/粉丝[数]?\s*[:：]?\s*([\d.]+(?:万|亿)?)/);
    if (m) followers = parseChineseNumber(m[1]);

    if (followers == null) {
      m = text.match(/([\d.]+(?:万|亿)?)\s*粉丝/);
      if (m) followers = parseChineseNumber(m[1]);
    }

    return { followers };
  } finally {
    await page.close();
  }
}

/**
 * Toutiao (头条) — 需要 cookie 登录态
 * @param {import('puppeteer').Browser} browser
 * @param {string} cookie - TT_COOKIE 环境变量
 * @returns {Promise<{followers: number}|null>}
 */
async function crawlToutiao(browser, cookie) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(UA_DESKTOP);
    await page.setDefaultTimeout(TIMEOUT_MS);

    const cookies = parseCookieString(cookie, '.toutiao.com');
    for (const c of cookies) {
      await page.setCookie(c);
    }

    await page.goto(
      'https://www.toutiao.com/c/user/token/Ciji1bP6Rq6-RyepfEmGMkpoCJ4lN5cBsQMkceOR4j6l86zdOn2xEwqrGkkKPAAAAAAAAAAAAABQwae_eB18l6OI3EAxLPmIkW1zAbVxiUXwJuryib4SLz689sLVv1L2gPujFHDDcW6BlxDf_5gOGMPFg-oEIgEDJvLr2A==/?source=m_redirect',
      { waitUntil: 'networkidle2', timeout: TIMEOUT_MS }
    );
    await new Promise((r) => setTimeout(r, 4000));

    const text = await page.evaluate(() => document.body.innerText);

    let followers = null;

    let m = text.match(/粉丝[数]?\s*[:：]?\s*([\d.]+(?:万|亿)?)/);
    if (m) followers = parseChineseNumber(m[1]);

    if (followers == null) {
      m = text.match(/([\d.]+(?:万|亿)?)\s*粉丝/);
      if (m) followers = parseChineseNumber(m[1]);
    }

    return { followers };
  } finally {
    await page.close();
  }
}

// ============================================================
// data.js 读写函数
// ============================================================

/**
 * 读取当前 data.js 中各平台的 followers 和 views
 * @returns {Object<string, {followers: number, views: number}>}
 */
function readCurrentData() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('data.js 未找到: %s', DATA_FILE);
    return {};
  }
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  const platforms = {};

  // 逐块匹配 id → followers → views
  const blockRegex = /id:\s*"([^"]+)"[\s\S]*?followers:\s*(\d+)[\s\S]*?views:\s*(\d+)/g;
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    platforms[match[1]] = {
      followers: parseInt(match[2], 10),
      views: parseInt(match[3], 10),
    };
  }
  return platforms;
}

/**
 * 用爬取到的新数据更新 data.js（保持原有格式和注释）
 * @param {Object<string, {followers?: number, views?: number}>} updates
 */
function updateDataFile(updates) {
  let content = fs.readFileSync(DATA_FILE, 'utf-8');

  for (const [platformId, data] of Object.entries(updates)) {
    // 更新 followers
    if (data.followers != null) {
      const followersRegex = new RegExp(
        `(id:\\s*"${platformId}"[\\s\\S]*?followers:\\s*)(\\d+)`,
        'g'
      );
      content = content.replace(followersRegex, `$1${data.followers}`);
    }
    // 更新 views
    if (data.views != null) {
      const viewsRegex = new RegExp(
        `(id:\\s*"${platformId}"[\\s\\S]*?views:\\s*)(\\d+)`,
        'g'
      );
      content = content.replace(viewsRegex, `$1${data.views}`);
    }
  }

  // 更新 BOARD_UPDATED_AT 为当前日期
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  content = content.replace(
    /BOARD_UPDATED_AT\s*=\s*"[^"]*"/,
    `BOARD_UPDATED_AT = "${today}"`
  );

  fs.writeFileSync(DATA_FILE, content, 'utf-8');
}

// ============================================================
// 单平台爬取封装（带 try-catch，失败保留原数据）
// ============================================================

/**
 * @param {string} name      平台显示名
 * @param {string} id        data.js 中的 platform id
 * @param {Function} fn      爬虫函数
 * @param {Object} updates   结果收集对象
 * @returns {Promise<void>}
 */
async function tryCrawl(name, id, fn, updates) {
  console.log('[%s] 爬取中...', name);
  try {
    const result = await fn();
    if (result && (result.followers != null || result.views != null)) {
      updates[id] = {};
      if (result.followers != null) {
        updates[id].followers = result.followers;
        console.log('  ✓ 粉丝数: %s', result.followers.toLocaleString());
      }
      if (result.views != null) {
        updates[id].views = result.views;
        console.log('  ✓ 视频数/观看量: %s', result.views.toLocaleString());
      }
    } else {
      console.warn('  ⚠ 未能提取数据，保留原数据');
    }
  } catch (e) {
    console.warn('  ⚠ 爬取失败: %s', e.message);
  }
}

// ============================================================
// 主函数
// ============================================================

async function main() {
  console.log('='.repeat(60));
  console.log('  Platform Data Crawler — 多平台数据爬虫');
  console.log('  时间: %s', new Date().toISOString());
  console.log('='.repeat(60));
  console.log();

  // 读取当前数据
  const currentData = readCurrentData();
  const updates = {};

  // Bilibili 不需要 puppeteer，先爬
  await tryCrawl('Bilibili', 'bilibili', crawlBilibili, updates);
  console.log();

  // 启动 puppeteer 浏览器
  console.log('启动 Puppeteer 浏览器...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  console.log('浏览器已启动。');
  console.log();

  try {
    // YouTube
    await tryCrawl('YouTube', 'youtube', () => crawlYouTube(browser), updates);
    console.log();

    // Douyin
    await tryCrawl('Douyin', 'douyin', () => crawlDouyin(browser), updates);
    console.log();

    // Xigua
    await tryCrawl('Xigua', 'xigua', () => crawlXigua(browser), updates);
    console.log();

    // Haokan
    await tryCrawl('Haokan', 'haokan', () => crawlHaokan(browser), updates);
    console.log();

    // Xiaohongshu (需要 cookie)
    console.log('[Xiaohongshu] 检查 Cookie...');
    if (process.env.XHS_COOKIE) {
      await tryCrawl(
        'Xiaohongshu',
        'xiaohongshu',
        () => crawlXiaohongshu(browser, process.env.XHS_COOKIE),
        updates
      );
    } else {
      console.log('  ⊘ XHS_COOKIE 未设置，跳过（保留原数据）');
    }
    console.log();

    // Kuaishou (需要 cookie)
    console.log('[Kuaishou] 检查 Cookie...');
    if (process.env.KS_COOKIE) {
      await tryCrawl(
        'Kuaishou',
        'kuaishou',
        () => crawlKuaishou(browser, process.env.KS_COOKIE),
        updates
      );
    } else {
      console.log('  ⊘ KS_COOKIE 未设置，跳过（保留原数据）');
    }
    console.log();

    // Toutiao (需要 cookie)
    console.log('[Toutiao] 检查 Cookie...');
    if (process.env.TT_COOKIE) {
      await tryCrawl(
        'Toutiao',
        'toutiao',
        () => crawlToutiao(browser, process.env.TT_COOKIE),
        updates
      );
    } else {
      console.log('  ⊘ TT_COOKIE 未设置，跳过（保留原数据）');
    }
    console.log();
  } finally {
    await browser.close();
    console.log('浏览器已关闭。');
  }

  // 更新 data.js
  console.log();
  console.log('正在更新 data.js ...');
  updateDataFile(updates);

  // 打印摘要
  console.log();
  console.log('='.repeat(60));
  console.log('  爬取结果摘要');
  console.log('='.repeat(60));

  const allIds = [
    'youtube',
    'bilibili',
    'douyin',
    'xigua',
    'haokan',
    'xiaohongshu',
    'kuaishou',
    'toutiao',
  ];

  for (const id of allIds) {
    const old = currentData[id] || {};
    const upd = updates[id];
    const oldF = old.followers != null ? old.followers.toLocaleString() : '?';
    const oldV = old.views != null ? old.views.toLocaleString() : '?';

    if (upd) {
      const newF = upd.followers != null ? upd.followers.toLocaleString() : oldF;
      const newV = upd.views != null ? upd.views.toLocaleString() : oldV;
      console.log(
        '  %-14s  粉丝: %s → %s   观看: %s → %s',
        id,
        oldF,
        newF,
        oldV,
        newV
      );
    } else {
      console.log(
        '  %-14s  粉丝: %s (未更新)   观看: %s (未更新)',
        id,
        oldF,
        oldV
      );
    }
  }

  const updatedCount = Object.keys(updates).length;
  const skippedCount = allIds.length - updatedCount;
  console.log();
  console.log('  已更新: %d 个平台   未更新/跳过: %d 个平台', updatedCount, skippedCount);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('致命错误:', err);
  process.exit(1);
});
