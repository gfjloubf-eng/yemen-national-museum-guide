/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — floors.js
   Renders the 3 museum floors with their halls
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    renderFloors();
  });

  const FLOOR_THEMES = {
    1: { title: "اليمن القديم", icon: "fa-landmark-dome", desc: "الحضارات اليمنية القديمة: سبأ، معين، قتبان، أوسان، حضرموت، حمير", color: "linear-gradient(135deg,#12263a,#1a3450)" },
    2: { title: "العصر الإسلامي", icon: "fa-mosque", desc: "المخطوطات، العملات، المصاحف، الأسلحة، الفخار الإسلامي", color: "linear-gradient(135deg,#8a5a2b,#b07d3e)" },
    3: { title: "اليمن الحديث", icon: "fa-hat-cowboy", desc: "الأزياء التقليدية، التراث، الوثائق التاريخية، التصوير، الفن الحديث", color: "linear-gradient(135deg,#c9a227,#e3c25b)" }
  };

  function renderFloors() {
    const wrap = document.getElementById("floorsList");
    if (!wrap || !data) return;

    const floorImages = {};
    (data.floors || (data.data && data.data.floors) || []).forEach((f) => {
      if (f && f.id != null) floorImages[Number(f.id)] = f.image || f.banner || "";
    });

    wrap.innerHTML = [1, 2, 3].map((f, idx) => {
      const t = FLOOR_THEMES[f];
      const halls = data.halls.filter((h) => h.floor === f);
      const artifacts = data.exhibits.filter((x) => x.floor === f).length;
      const bg = floorImages[f];
      return (
        '<section class="glass-card mb-4 floor-card" id="floor-' + f + '" data-aos="fade-up">' +
        (bg ? '<img class="floor-img" src="' + bg + '" alt="الدور ' + f + '" loading="lazy">' : "") +
        '<div class="row g-4 align-items-center">' +
        '<div class="col-lg-4">' +
        '<div class="floor-badge" style="background:' + t.color + '">' +
        '<i class="fa-solid ' + t.icon + '"></i>' +
        "<h3>الدور " + f + "</h3>" +
        "<span>" + halls.length + " قاعات</span>" +
        "</div>" +
        "</div>" +
        '<div class="col-lg-8">' +
        "<h2 class='section-title'>" + t.title + "</h2>" +
        "<p class='muted-text'>" + t.desc + "</p>" +
        '<div class="d-flex flex-wrap gap-2 mt-3 mb-3">' +
        '<span class="badge-lux badge-gold"><i class="fa-solid fa-vault"></i> ' + artifacts + " قطعة</span>" +
        '<span class="badge-lux badge-bronze"><i class="fa-solid fa-door-open"></i> ' + halls.length + " قاعات</span>" +
        "</div>" +
        '<div class="d-flex flex-wrap gap-2">' +
        halls.map((h) =>
          '<a class="btn btn-outline btn-sm" href="halls.html#hall-' + h.id + '">' +
          '<i class="fa-solid fa-door-open"></i> ' + h.number + " — " + h.name + "</a>"
        ).join("") +
        "</div>" +
        "</div>" +
        "</div>" +
        "</section>"
      );
    }).join("");

    if (window.AOS) AOS.refreshHard();
  }
})();

