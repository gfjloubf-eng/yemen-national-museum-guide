/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — app.js
   Core application logic: data loader, nav, favorites, auth,
   toast, counters, gallery, footer injection
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Constants ---------- */
  const STORAGE_KEYS = {
    favorites: "ynm_favorites",
    user: "ynm_user",
    notes: "ynm_notes",
    theme: "ynm_theme"
  };

  const PROVINCES = ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار", "مأرب", "الجوف", "حضرموت", "شبوة", "أبين", "لحج", "المهرة", "صعدة", "البيضاء"];

  const API_BASE = "http://localhost:3000/api";
  const CONTACT_PHONE = "+967712750388";
  const CONTACT_WHATSAPP = "https://wa.me/967712750388";

  /* ---------- State ---------- */
  const state = {
    data: null,        // central museum.json
    civilizations: [],
    exhibits: [],
    halls: [],
    users: [],
    currentUser: null,
    favorites: [],
    notes: []
  };

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function loadJSON(url) {
    return fetch(url).then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status + " " + url);
      return r.json();
    });
  }

  function readLS(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeLS(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* ignore */ }
  }

  function stripHTML(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function debounce(fn, wait = 200) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function esc(s) {
    return stripHTML(s);
  }

  /* ---------- Data loader ---------- */
  async function loadFromAPI() {
    const base = API_BASE;
    const [homeRes, civsRes, exhsRes, hlsRes, usrsRes] = await Promise.all([
      fetch(base + "/home").then((r) => (r.ok ? r.json() : null)),
      fetch(base + "/civilizations").then((r) => (r.ok ? r.json() : null)),
      fetch(base + "/exhibits").then((r) => (r.ok ? r.json() : null)),
      fetch(base + "/halls").then((r) => (r.ok ? r.json() : null)),
      fetch(base + "/users").then((r) => (r.ok ? r.json() : null))
    ]);

    if (!homeRes || !civsRes || !exhsRes || !hlsRes || !usrsRes) {
      throw new Error("Incomplete API response");
    }

    // Compose the same shape as the local JSON dataset.
    const museum = Object.assign({}, homeRes);
    state.data = museum;
    state.civilizations = civsRes.civilizations || [];
    state.exhibits = exhsRes.exhibits || [];
    state.halls = hlsRes.halls || [];
    state.users = usrsRes.users || [];
    return state;
  }

  async function loadFromFiles() {
    const [museum, civs, exhs, hls, usrs] = await Promise.all([
      loadJSON("data/museum.json"),
      loadJSON("data/civilizations.json"),
      loadJSON("data/exhibits.json"),
      loadJSON("data/halls.json"),
      loadJSON("data/users.json")
    ]);
    state.data = museum;
    state.civilizations = civs.civilizations || [];
    state.exhibits = exhs.exhibits || [];
    state.halls = hls.halls || [];
    state.users = usrs.users || [];
    return state;
  }

  async function initData() {
    // API-first (Milestone 9) with graceful fallback to local JSON (SAFE mode).
    try {
      await loadFromAPI();
      state.source = "api";
    } catch (err) {
      console.warn("[app] API unavailable, falling back to local JSON:", err.message || err);
      try {
        await loadFromFiles();
        state.source = "json";
      } catch (err2) {
        console.error("Failed to load data:", err2);
      }
    }
    return state;
  }

  /* ---------- Favorites ---------- */
  function getFavorites() {
    state.favorites = readLS(STORAGE_KEYS.favorites, []);
    return state.favorites;
  }

  function isFavorite(id) {
    return getFavorites().includes(Number(id));
  }

  function toggleFavorite(id, btn) {
    id = Number(id);
    let favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx > -1) {
      favs.splice(idx, 1);
      toast("أُزيلت من المفضلة", "fa-heart-crack", "toast-error");
    } else {
      favs.push(id);
      toast("أُضيفت إلى المفضلة", "fa-heart", "toast-success");
    }
    writeLS(STORAGE_KEYS.favorites, favs);
    state.favorites = favs;
    if (btn) {
      btn.classList.toggle("active", idx === -1);
    }
    updateFavCounts();
    return favs;
  }

  function updateFavCounts() {
    const count = getFavorites().length;
    $$(".fav-count").forEach((el) => { el.textContent = count; });
  }

  /* ---------- Auth ---------- */
  function getCurrentUser() {
    state.currentUser = readLS(STORAGE_KEYS.user, null);
    return state.currentUser;
  }

  function login(username, password) {
    const user = state.users.find(
      (u) => u.username === username.trim() && u.password === password
    );
    if (user) {
      const safe = Object.assign({}, user);
      delete safe.password;
      writeLS(STORAGE_KEYS.user, safe);
      state.currentUser = safe;
      toast("مرحباً بك " + safe.name, "fa-circle-check", "toast-success");
      return safe;
    }
    return null;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.user);
    state.currentUser = null;
    toast("تم تسجيل الخروج", "fa-right-from-bracket");
    setTimeout(() => { window.location.href = "index.html"; }, 700);
  }

  function requireAuth(redirect = "login.html") {
    if (!getCurrentUser()) {
      window.location.href = redirect;
      return false;
    }
    return true;
  }

  function requireRole(role, redirect = "login.html") {
    const u = getCurrentUser();
    if (!u) { window.location.href = redirect; return false; }
    if (u.role !== role) {
      toast("غير مسموح بالوصول", "fa-ban", "toast-error");
      setTimeout(() => { window.location.href = "index.html"; }, 800);
      return false;
    }
    return true;
  }

  /* ---------- Research notes ---------- */
  function getNotes() {
    state.notes = readLS(STORAGE_KEYS.notes, []);
    return state.notes;
  }
  function addNote(exhibitId, text) {
    const notes = getNotes();
    notes.push({ exhibitId: Number(exhibitId), text, date: new Date().toISOString().slice(0, 10) });
    writeLS(STORAGE_KEYS.notes, notes);
    state.notes = notes;
  }

  /* ---------- Toast ---------- */
  function toast(message, icon = "fa-circle-info", type = "") {
    let el = $("#toastMsg");
    if (!el) {
      el = document.createElement("div");
      el.id = "toastMsg";
      el.className = "toast-msg";
      document.body.appendChild(el);
    }
    el.innerHTML = '<i class="fa-solid ' + icon + '"></i><span></span>';
    $("span", el).textContent = message;
    el.className = "toast-msg " + type;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2800);
  }

  /* ---------- Counters ---------- */
  function animateCounters() {
    $$("[data-count]").forEach((el) => {
      const target = Number(el.getAttribute("data-count")) || 0;
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Exhibit card renderer ---------- */
  function exhibitCard(ex, favs) {
    favs = favs || getFavorites();
    const fav = favs.includes(ex.id);
    return (
      '<article class="exhibit-card" data-aos="fade-up">' +
        '<div class="media">' +
          '<span class="badge-floor">الدور ' + esc(ex.floor) + '</span>' +
          '<img src="' + esc(ex.thumbnail || ex.image) + '" alt="' + esc(ex.nameAr) + '" loading="lazy">' +
          '<button class="fav-btn ' + (fav ? "active" : "") + '" data-fav="' + ex.id + '" aria-label="إضافة إلى المفضلة" title="المفضلة">' +
            '<i class="fa-solid ' + (fav ? "fa-heart" : "fa-heart") + '"></i>' +
          '</button>' +
        '</div>' +
        '<div class="body">' +
          '<span class="badge-lux badge-bronze">' + esc(ex.civilization) + '</span>' +
          '<h3>' + esc(ex.nameAr) + '</h3>' +
          '<div class="meta"><span><i class="fa-solid fa-location-dot"></i> ' + esc(ex.province) + '</span>' +
          '<span><i class="fa-solid fa-tag"></i> ' + esc(ex.category) + '</span></div>' +
          '<a class="btn btn-outline btn-sm" href="exhibit-details.html?id=' + ex.id + '">التفاصيل <i class="fa-solid fa-arrow-left"></i></a>' +
        '</div>' +
      '</article>'
    );
  }

  /* ---------- Nav & footer injection ---------- */
  function injectLayout() {
    const header = $("#siteHeader");
    const footer = $("#siteFooter");
    if (header) {
      header.innerHTML = siteHeaderHTML();
      bindNavEvents();
    }
    if (footer) footer.innerHTML = siteFooterHTML();
    updateFavCounts();
    bindGlobalHandlers();
  }

  function siteHeaderHTML() {
    const u = getCurrentUser();
    const path = window.location.pathname;
    const root = path.includes("/pages/") || path.includes("/admin.html") ? "../" : "";
    const active = (p) => (path.endsWith(p) ? "active" : "");
    return (
      '<a class="skip-link" href="#main">تخطي إلى المحتوى</a>' +
      '<div class="container-main nav-wrap">' +
        '<a class="brand" href="' + root + 'index.html">' +
          '<span class="brand-logo"><i class="fa-solid fa-landmark-dome"></i></span>' +
          '<span><span class="brand-name">المتحف الوطني اليمني</span><br><span class="brand-sub">دليل المتحف الرقمي</span></span>' +
        '</a>' +
        '<nav class="nav-menu" id="navMenu" aria-label="القائمة الرئيسية">' +
          '<a class="nav-link ' + active("index.html") + '" href="' + root + 'index.html">الرئيسية</a>' +
          '<a class="nav-link ' + active("civilizations.html") + '" href="' + root + 'civilizations.html">الحضارات</a>' +
          '<a class="nav-link ' + active("exhibits.html") + '" href="' + root + 'exhibits.html">المعروضات</a>' +
          '<a class="nav-link ' + active("halls.html") + '" href="' + root + 'halls.html">القاعات</a>' +
          '<a class="nav-link ' + active("timeline.html") + '" href="' + root + 'timeline.html">الخط الزمني</a>' +
          '<a class="nav-link ' + active("map.html") + '" href="' + root + 'map.html">الخريطة</a>' +
          '<a class="nav-link ' + active("search.html") + '" href="' + root + 'search.html">البحث</a>' +
          '<a class="nav-link ' + active("contact.html") + '" href="' + root + 'contact.html">اتصل بنا</a>' +
        '</nav>' +
        '<div class="nav-cta">' +
          '<a class="btn btn-ghost btn-sm" href="' + root + 'favorites.html" title="المفضلة">' +
            '<i class="fa-solid fa-heart"></i> <span class="fav-count">0</span></a>' +
          (u
            ? '<a class="btn btn-bronze btn-sm" href="' + root + 'profile.html"><i class="fa-solid fa-user"></i> ' + esc(u.name) + '</a>' +
              (u.role === "admin" ? '<a class="btn btn-navy btn-sm" href="' + root + 'admin.html"><i class="fa-solid fa-gauge-high"></i> الإدارة</a>' : "")
            : '<a class="btn btn-bronze btn-sm" href="' + root + 'login.html"><i class="fa-solid fa-right-to-bracket"></i> دخول</a>') +
        '</div>' +
        '<button class="nav-toggle" id="navToggle" aria-label="فتح القائمة"><i class="fa-solid fa-bars"></i></button>' +
      '</div>' +
      '<div class="nav-overlay" id="navOverlay"></div>'
    );
  }

  function siteFooterHTML() {
    const path = window.location.pathname;
    const root = path.includes("/pages/") || path.includes("/admin.html") ? "../" : "";
    return (
      '<div class="container-main">' +
        '<div class="row g-4">' +
          '<div class="col-lg-4 col-md-6">' +
            '<h5><i class="fa-solid fa-landmark-dome me-2"></i>المتحف الوطني اليمني</h5>' +
            '<p class="small" style="color:rgba(255,255,255,.72)">الدليل الرقمي الرسمي للمتحف الوطني اليمني بصنعاء. نستعرض 5000 عام من الحضارة اليمنية عبر العصور.</p>' +
          '</div>' +
          '<div class="col-lg-2 col-md-6">' +
            '<h5>استكشف</h5>' +
            '<a class="footer-link" href="' + root + 'civilizations.html">الحضارات</a>' +
            '<a class="footer-link" href="' + root + 'exhibits.html">المعروضات</a>' +
            '<a class="footer-link" href="' + root + 'halls.html">القاعات</a>' +
            '<a class="footer-link" href="' + root + 'floors.html">الأدوار</a>' +
            '<a class="footer-link" href="' + root + 'timeline.html">الخط الزمني</a>' +
          '</div>' +
          '<div class="col-lg-2 col-md-6">' +
            '<h5>معلومات</h5>' +
            '<a class="footer-link" href="' + root + 'about.html">عن المتحف</a>' +
            '<a class="footer-link" href="' + root + 'map.html">الخريطة والوصول</a>' +
            '<a class="footer-link" href="' + root + 'favorites.html">المفضلة</a>' +
            '<a class="footer-link" href="' + root + 'login.html">تسجيل الدخول</a>' +
            '<a class="footer-link" href="' + root + 'contact.html">اتصل بنا</a>' +
            '<a class="footer-link" href="' + root + 'admin.html">لوحة الإدارة</a>' +
          '</div>' +
          '<div class="col-lg-4 col-md-6">' +
            '<h5>تواصل معنا</h5>' +
            '<p class="small" style="color:rgba(255,255,255,.72)"><i class="fa-solid fa-location-dot me-2"></i>شارع الخمسين، صنعاء - الجمهورية اليمنية</p>' +
            '<p class="small" style="color:rgba(255,255,255,.72)"><i class="fa-solid fa-phone me-2"></i>+967712750388</p>' +
            '<p class="small" style="color:rgba(255,255,255,.72)"><a class="footer-link" style="color:rgba(255,255,255,.72)" href="https://wa.me/967712750388" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp me-2"></i>واتساب: +967712750388</a></p>' +
            '<div class="social-row mt-3">' +
              '<a href="#" aria-label="فيسبوك"><i class="fa-brands fa-facebook-f"></i></a>' +
              '<a href="#" aria-label="تويتر"><i class="fa-brands fa-x-twitter"></i></a>' +
              '<a href="#" aria-label="يوتيوب"><i class="fa-brands fa-youtube"></i></a>' +
              '<a href="#" aria-label="انستغرام"><i class="fa-brands fa-instagram"></i></a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© ' + new Date().getFullYear() + ' المتحف الوطني اليمني — جميع الحقوق محفوظة</span>' +
          '<span>إدارة التراث والثقافة | وزارة الثقافة</span>' +
          '<span>هندسة: Eng. Ammar Adel Al-Masouei</span>' +
        '</div>' +
      '</div>'
    );
  }

  function bindNavEvents() {
    const toggle = $("#navToggle");
    const menu = $("#navMenu");
    const overlay = $("#navOverlay");
    if (toggle && menu) {
      const close = () => {
        menu.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      };
      toggle.addEventListener("click", () => {
        menu.classList.toggle("open");
        if (overlay) overlay.classList.toggle("show");
        toggle.setAttribute("aria-expanded", menu.classList.contains("open") ? "true" : "false");
      });
      if (overlay) overlay.addEventListener("click", close);
      $$("a", menu).forEach((a) => a.addEventListener("click", close));
    }
  }

  function bindGlobalHandlers() {
    // Favorite buttons (event delegation)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-fav]");
      if (btn) {
        e.preventDefault();
        toggleFavorite(btn.getAttribute("data-fav"), btn);
      }
    });

    // Copy QR
    document.addEventListener("click", (e) => {
      const qr = e.target.closest("[data-qr]");
      if (qr) {
        e.preventDefault();
        const src = qr.getAttribute("data-qr");
        toast("رمز QR — المتاح للطباعة", "fa-qrcode");
      }
    });

    // Tabs
    document.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]");
      if (!tab) return;
      const group = tab.closest(".tabs-lux");
      if (!group) return;
      const target = tab.getAttribute("data-tab");
      $$(".tab-btn", group).forEach((b) => b.classList.toggle("active", b === tab));
      const panes = group.parentElement ? $$("[data-pane]") : [];
      panes.forEach((p) => p.classList.toggle("active", p.getAttribute("data-pane") === target));
    });

    // Lightbox
    document.addEventListener("click", (e) => {
      const img = e.target.closest("[data-lightbox]");
      if (img) openLightbox(img.getAttribute("data-lightbox"));
    });
  }

  /* ---------- Lightbox ---------- */
  function openLightbox(src) {
    let lb = $("#lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "lightbox";
      lb.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:5000;display:none;align-items:center;justify-content:center;cursor:zoom-out";
      lb.innerHTML = '<img style="max-width:92vw;max-height:88vh;border-radius:12px">';
      lb.addEventListener("click", () => (lb.style.display = "none"));
      document.body.appendChild(lb);
    }
    lb.querySelector("img").src = src;
    lb.style.display = "flex";
  }

  /* ---------- Stats injection (home) ---------- */
  function renderHeroStats() {
    const wrap = $("#heroStats");
    if (!wrap || !state.data) return;
    const s = state.data.stats;
    const items = [
      { n: s.artifacts, l: "قطعة أثرية", i: "fa-vault" },
      { n: s.civilizations, l: "حضارة", i: "fa-landmark" },
      { n: s.halls, l: "قاعة عرض", i: "fa-door-open" },
      { n: s.floors, l: "أدوار", i: "fa-layer-group" }
    ];
    wrap.innerHTML = items.map((it) =>
      '<div class="hero-stat"><div class="num"><i class="fa-solid ' + it.i + '"></i> ' +
      '<span data-count="' + it.n + '">0</span></div><div class="lbl">' + it.l + "</div></div>"
    ).join("");
    animateCounters();
  }

  /* ---------- AOS init ---------- */
  function initAOS() {
    if (window.AOS) {
      AOS.init({ duration: 700, once: true, offset: 80 });
    }
  }

  /* ---------- Boot ---------- */
  async function boot() {
    await initData();
    injectLayout();
    renderHeroStats();
    initAOS();
    window.YNM = {
      state,
      getFavorites,
      isFavorite,
      toggleFavorite,
      login,
      logout,
      getCurrentUser,
      requireAuth,
      requireRole,
      getNotes,
      addNote,
      toast,
      exhibitCard,
      animateCounters,
      getParam,
      debounce,
      esc,
      $,
      $$,
      PROVINCES,
      API_BASE,
      CONTACT_PHONE,
      CONTACT_WHATSAPP
    };
    document.dispatchEvent(new CustomEvent("ynm:ready", { detail: state }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

