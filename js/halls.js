/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — halls.js
   Renders hall cards grouped by floor with tabs
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    renderHalls("floor-1");
  });

  function renderHalls(floorKey) {
    const grid = document.getElementById("hallsGrid");
    if (!grid || !data) return;
    const floor = Number(floorKey.split("-")[1]);

    const halls = data.halls.filter((h) => h.floor === floor);
    grid.innerHTML =
      '<div class="cards-grid">' +
      halls.map((h) => {
        const artifacts = data.exhibits.filter((x) => x.hallId === h.id);
        return (
          '<article class="glass-card hoverable hall-card" id="hall-' + h.id + '" data-aos="fade-up">' +
          (h.cover || h.image ? '<img class="hall-cover" src="' + (h.cover || h.image) + '" alt="' + h.name + '" loading="lazy">' : "") +
          '<div class="d-flex justify-content-between align-items-start">' +
          '<span class="hall-num">' + h.number + "</span>" +
          '<span class="badge-lux badge-gold"><i class="fa-solid fa-layer-group"></i> الدور ' + h.floor + "</span>" +
          "</div>" +
          "<h3 class='mt-2'>" + h.name + "</h3>" +
          "<p class='muted-text'>" + h.theme + "</p>" +
          '<div class="d-flex flex-wrap gap-2 mt-2 mb-3">' +
          '<span class="badge-lux badge-bronze"><i class="fa-solid fa-vault"></i> ' + artifacts.length + " قطعة</span>" +
          '<span class="badge-lux"><i class="fa-solid fa-ruler"></i> ' + (h.area || "—") + "</span>" +
          "</div>" +
          '<a class="btn btn-bronze btn-sm" href="exhibits.html?hall=' + h.id + '">عرض القطع <i class="fa-solid fa-arrow-left"></i></a>' +
          "</article>"
        );
      }).join("") +
      "</div>";

    if (!halls.length) {
      grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-door-open"></i><h3>لا توجد قاعات في هذا الدور</h3></div>';
      return;
    }

    if (window.AOS) AOS.refreshHard();
  }
})();

