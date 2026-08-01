/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — home.js
   Home page dynamic sections: civilizations preview,
   timeline preview, museum news
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    renderHeroImage();
    renderCivPreview();
    renderHomeTimeline();
    renderHomeGallery();
    renderNews();
  });

  function renderHeroImage() {
    const img = document.getElementById("heroImage");
    if (!img || !data) return;
    const src = (data.home && (data.home.heroImage || data.home.heroThumbnail)) ||
                (data.data && data.data.home && (data.data.home.heroImage || data.data.home.heroThumbnail)) ||
                (data.civilizations && data.civilizations[0] && (data.civilizations[0].banner || data.civilizations[0].image));
    if (src) img.src = src;
  }

  function renderCivPreview() {
    const grid = document.getElementById("civPreviewGrid");
    if (!grid || !data) return;
    const civs = data.civilizations.slice(0, 4);
    grid.innerHTML = civs.map((c) =>
      '<a class="civ-card" href="civilizations.html#civ-' + c.id + '" data-aos="fade-up">' +
      '<img src="' + (c.banner || c.image) + '" alt="' + c.name + '" loading="lazy">' +
      '<div class="civ-body">' +
      '<span class="era">' + c.era + "</span>" +
      "<h3>" + c.name + "</h3>" +
      "<p>" + (c.description || "").slice(0, 90) + "...</p>" +
      "</div></a>"
    ).join("");
    if (window.AOS) AOS.refreshHard();
  }

  function renderHomeTimeline() {
    const wrap = document.getElementById("homeTimeline");
    if (!wrap || !data) return;
    const events = (data.data ? data.data.events : data.events || []).slice(0, 5);
    wrap.innerHTML = events.map((ev) =>
      '<div class="tl-item">' +
      '<span class="tl-year">' + ev.year + "</span>" +
      "<h4>" + ev.title + "</h4>" +
      "<p class='muted-text'>" + ev.description + "</p>" +
      "</div>"
    ).join("");
  }

  function renderHomeGallery() {
    const grid = document.getElementById("homeGallery");
    if (!grid || !data) return;
    const gallery = (data.home && data.home.featuredGallery) ||
                    (data.data && data.data.home && data.data.home.featuredGallery) || [];
    if (!gallery.length) {
      grid.innerHTML = "";
      return;
    }
    grid.innerHTML = gallery.map((g) =>
      '<figure class="gallery-item" data-lightbox="' + g + '">' +
      '<img src="' + g + '" alt="معرض المتحف الوطني اليمني" loading="lazy">' +
      "</figure>"
    ).join("");
    if (window.AOS) AOS.refreshHard();
  }

  function renderNews() {
    const grid = document.getElementById("newsGrid");
    if (!grid || !data) return;
    const news = (data.data ? data.data.news : data.news || []).slice(0, 3);
    grid.innerHTML = news.map((n) => {
      const d = new Date(n.date);
      const dateStr = d.toLocaleDateString("ar-YE", { year: "numeric", month: "long", day: "numeric" });
      const img = n.image || n.thumbnail || "";
      return (
        '<article class="news-card" data-aos="fade-up">' +
        '<div class="media">' + (img ? '<img src="' + img + '" alt="' + n.title + '" loading="lazy">' : "") + "</div>" +
        '<div class="news-body">' +
        '<span class="news-date"><i class="fa-solid fa-calendar-days"></i> ' + dateStr + "</span>" +
        "<h4>" + n.title + "</h4>" +
        "<p>" + n.excerpt + "</p>" +
        '<a href="about.html" class="btn btn-ghost btn-sm">اقرأ المزيد <i class="fa-solid fa-arrow-left"></i></a>' +
        "</div></article>"
      );
    }).join("");
    if (window.AOS) AOS.refreshHard();
  }
})();

