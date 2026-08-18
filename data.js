/* ============================================================
 * Platform data — auto-updated by GitHub Actions crawler
 * Last crawl: Aug 8, 2026 via Chrome DevTools (all platforms verified)
 *
 * Data sources:
 *   YouTube   — channel page scrape (1700 subscribers confirmed)
 *   Douyin    — profile page scrape (9.9万 followers confirmed)
 *   RED       — logged-in profile scrape (413 followers confirmed)
 *   Bilibili  — api.bilibili.com/x/relation/stat (6278 followers confirmed)
 *   Kuaishou  — logged-in profile scrape (6776 followers confirmed)
 *   Toutiao   — logged-in profile scrape (9.0万 followers confirmed)
 *   Xigua     — profile page scrape (9.8万 followers confirmed)
 *   Haokan    — author page scrape (1.7万 followers confirmed)
 * ============================================================ */
const PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    handle: "@727601375",
    url: "https://www.youtube.com/@727601375",
    followers: 1700,
    views: 80000,
    unit: "subscribers",
    viewsUnit: "views",
    color: "#FF0000",
    slug: "youtube"
  },
  {
    id: "douyin",
    name: "Douyin",
    handle: "Buerhu",
    url: "https://www.douyin.com/user/MS4wLjABAAAAcMVcgWLueUbUgbw9DlmyFiS01QqSuNiRHNVWLWzMwDk",
    followers: 99000,
    views: 1280000,
    unit: "followers",
    viewsUnit: "views",
    color: "#000000",
    accent: "#25F4EE",
    slug: "douyin"
  },
  {
    id: "xiaohongshu",
    name: "RED",
    handle: "你好二胡",
    url: "https://www.xiaohongshu.com/user/profile/575567f250c4b430424a7bda",
    followers: 413,
    views: 899,
    unit: "followers",
    viewsUnit: "views",
    color: "#FF2442",
    slug: "xiaohongshu"
  },
  {
    id: "bilibili",
    name: "Bilibili",
    handle: "UID: 32922418",
    url: "https://space.bilibili.com/32922418",
    followers: 6280,
    views: 456000,
    unit: "followers",
    viewsUnit: "views",
    color: "#00A1D6",
    slug: "bilibili"
  },
  {
    id: "kuaishou",
    name: "Kuaishou",
    handle: "Heyyou123",
    url: "https://www.kuaishou.com/profile/3x7yniq73r8a769",
    followers: 6776,
    views: 18000,
    unit: "followers",
    viewsUnit: "views",
    color: "#FF4906",
    slug: "kuaishou"
  },
  {
    id: "toutiao",
    name: "Toutiao",
    handle: "Buer",
    url: "https://www.toutiao.com/c/user/token/Ciji1bP6Rq6-RyepfEmGMkpoCJ4lN5cBsQMkceOR4j6l86zdOn2xEwqrGkkKPAAAAAAAAAAAAABQwae_eB18l6OI3EAxLPmIkW1zAbVxiUXwJuryib4SLz689sLVv1L2gPujFHDDcW6BlxDf_5gOGMPFg-oEIgEDJvLr2A==/?source=m_redirect",
    followers: 90000,
    views: 19000,
    unit: "followers",
    viewsUnit: "views",
    color: "#D9262C",
    slug: "toutiao"
  },
  {
    id: "xigua",
    name: "Xigua",
    handle: "ID: 111263884400",
    url: "https://m.ixigua.com/user/111263884400",
    followers: 98000,
    views: 234000,
    unit: "followers",
    viewsUnit: "views",
    color: "#FE3020",
    slug: "xigua"
  },
  {
    id: "haokan",
    name: "Haokan",
    handle: "@erhu_video",
    url: "https://baijiahao.baidu.com/u?app_id=1658692152565148",
    followers: 17000,
    views: 670000,
    unit: "followers",
    viewsUnit: "views",
    color: "#2A6EFF",
    slug: "haokan"
  }
];

const BOARD_UPDATED_AT = "Aug 18, 2026";
