/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — timeline.js
   Interactive timeline page with events and historical figures
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    renderTimeline();
    renderTimelineStats();
    renderFigures();
  });

  function renderTimeline() {
    const wrap = document.getElementById("timelineList");
    if (!wrap || !data) return;
    const events = (data.data ? data.data.events : data.events || []);
    if (!events.length) {
      wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-timeline"></i><h3>لا توجد أحداث معروضة</h3></div>';
      return;
    }
    wrap.innerHTML = events.map((ev) =>
      '<div class="tl-item" data-aos="fade-up">' +
      (ev.thumbnail || ev.image ? '<img class="tl-img" src="' + (ev.thumbnail || ev.image) + '" alt="' + ev.title + '" loading="lazy">' : "") +
      '<span class="tl-year">' + (ev.year || "") + "</span>" +
      "<h4>" + ev.title + "</h4>" +
      "<p class='muted-text'>" + ev.description + "</p>" +
      (ev.figure ? '<span class="badge-lux badge-gold"><i class="fa-solid fa-user"></i> ' + ev.figure + "</span>" : "") +
      "</div>"
    ).join("");
    if (window.AOS) AOS.refreshHard();
  }

  function renderFigures() {
    const wrap = document.getElementById("figuresGrid");
    if (!wrap || !data) return;
    const figures = (data.data ? data.data.figures : data.figures || []);
    if (!figures.length) {
      wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-user"></i><h3>لا توجد شخصيات معروضة</h3></div>';
      return;
    }
    wrap.innerHTML =
      '<div class="cards-grid">' +
      figures.map((fg) =>
        '<article class="figure-card" data-aos="fade-up">' +
        '<img src="' + (fg.thumbnail || fg.image) + '" alt="' + fg.name + '" loading="lazy">' +
        '<div class="figure-body">' +
        '<span class="badge-lux badge-bronze">' + (fg.civilization || "") + "</span>" +
        "<h4>" + fg.name + "</h4>" +
        "<p class='muted-text'>" + (fg.role || "") + " — " + (fg.period || "") + "</p>" +
        "</div></article>"
      ).join("") +
      "</div>";
    if (window.AOS) AOS.refreshHard();
  }

  function renderTimelineStats() {
    const wrap = document.getElementById("timelineStats");
    if (!wrap || !data) return;
    const events = (data.data ? data.data.events : data.events || []);
    const figures = (data.data ? data.data.figures : data.figures || []);
    wrap.innerHTML = [
      '<div class="stat-box"><div class="num">' + events.length + '</div><div class="lbl">حدث تاريخي</div></div>',
      '<div class="stat-box"><div class="num">' + figures.length + '</div><div class="lbl">شخصية تاريخية</div></div>',
      '<div class="stat-box"><div class="num">' + data.civilizations.length + '</div><div class="lbl">حضارة</div></div>'
    ].join("");
  }
})();
