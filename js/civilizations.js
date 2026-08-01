/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — civilizations.js
   Renders civilization cards with full details
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    renderCivs();
  });

  function renderCivs() {
    const grid = document.getElementById("civGrid");
    if (!grid || !data) return;

    grid.innerHTML = data.civilizations.map((c, i) =>
      '<article class="civ-card" id="civ-' + c.id + '" data-aos="fade-up">' +
      '<img src="' + (c.banner || c.image) + '" alt="' + c.name + '" loading="lazy">' +
      '<div class="civ-body">' +
      '<span class="era"><i class="fa-solid fa-hourglass-half"></i> ' + c.era + "</span>" +
      "<h3>" + c.name + "</h3>" +
      "<p>" + (c.description || "").slice(0, 100) + "...</p>" +
      '<a class="btn btn-gold btn-sm mt-2" href="#" data-civ-detail="' + c.id + '">التفاصيل <i class="fa-solid fa-arrow-left"></i></a>' +
      "</div></article>"
    ).join("");

    if (window.AOS) AOS.refreshHard();

    grid.querySelectorAll("[data-civ-detail]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openCivModal(btn.getAttribute("data-civ-detail"));
      });
    });
  }

  function openCivModal(id) {
    const civ = data.civilizations.find((c) => c.id === id);
    if (!civ) return;

    const hall = data.halls.find((h) => h.id === civ.hallId);
    const artifacts = data.exhibits.filter((x) => x.civilizationId === id);

    let modal = document.getElementById("civModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "civModal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(18,38,58,.7);z-index:4000;display:none;align-items:center;justify-content:center;padding:1rem";
      modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
      document.body.appendChild(modal);
    }

    modal.innerHTML =
      '<div class="glass-card" style="max-width:760px;max-height:88vh;overflow-y:auto;width:100%">' +
      (civ.banner || civ.image ? '<img class="civ-modal-banner" src="' + (civ.banner || civ.image) + '" alt="' + civ.name + '">' : "") +
      '<div class="d-flex justify-content-between align-items-start mb-3">' +
      "<h2>" + civ.name + "</h2>" +
      '<button class="btn btn-ghost" onclick="document.getElementById(\'civModal\').style.display=\'none\'" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>' +
      "</div>" +
      '<span class="badge-lux badge-gold mb-3"><i class="fa-solid fa-hourglass-half"></i> ' + civ.era + "</span>" +
      '<span class="badge-lux badge-bronze mb-3 ms-1"><i class="fa-solid fa-location-dot"></i> العاصمة: ' + civ.capital + "</span>" +
      "<p>" + civ.history + "</p>" +
      "<h4 class='mt-3'>أبرز المواقع</h4>" +
      '<ul class="mt-2">' + (civ.keySites || []).map((s) => "<li><i class='fa-solid fa-map-pin text-bronze me-2'></i>" + s + "</li>").join("") + "</ul>" +
      (hall ? '<p class="mt-3"><i class="fa-solid fa-door-open text-gold me-2"></i> القاعة: <strong>' + hall.name + "</strong> — الدور " + hall.floor + "</p>" : "") +
      "<h4 class='mt-3'>مقتنيات المتحف (" + artifacts.length + ")</h4>" +
      '<div class="related-strip mt-2">' + artifacts.slice(0, 4).map((x) => window.YNM.exhibitCard(x)).join("") + "</div>" +
      '<a class="btn btn-bronze mt-3" href="exhibits.html?civ=' + encodeURIComponent(civ.name) + '">عرض كل القطع <i class="fa-solid fa-arrow-left"></i></a>' +
      "</div>";

    modal.style.display = "flex";
  }
})();

