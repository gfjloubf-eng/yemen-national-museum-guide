/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — detail.js
   Exhibit detail page renderer with gallery, specs,
   related exhibits, QR, audio, research notes
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    renderDetail();
  });

  function renderDetail() {
    const root = document.getElementById("detailRoot");
    if (!root || !data) return;
    const id = Number(window.YNM.getParam("id"));
    const ex = data.exhibits.find((x) => x.id === id);
    if (!ex) {
      root.innerHTML =
        '<div class="empty-state"><div class="icon"><i class="fa-solid fa-vault"></i></div>' +
        "<h3>لم يتم العثور على القطعة</h3>" +
        '<a class="btn btn-bronze mt-3" href="exhibits.html">العودة للمعروضات</a></div>';
      return;
    }

    // Update title
    const title = document.getElementById("detailTitle");
    const sub = document.getElementById("detailSubtitle");
    const crumb = document.getElementById("detailCrumb");
    if (title) title.textContent = ex.nameAr;
    if (sub) sub.textContent = ex.civilization + " — " + ex.era;
    if (crumb) crumb.textContent = ex.nameAr;
    document.title = ex.nameAr + " — المتحف الوطني اليمني";

    const hall = data.halls.find((h) => h.id === ex.hallId);
    const related = data.exhibits
      .filter((x) => x.id !== ex.id && (x.civilizationId === ex.civilizationId || x.categoryId === ex.categoryId))
      .slice(0, 4);

    const gallery = [ex.image, ex.image2, ex.image3].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

    root.innerHTML =
      '<div class="detail-hero">' +
      '<div class="detail-media">' +
      '<img id="mainImg" src="' + ex.image + '" alt="' + ex.nameAr + '">' +
      '<div class="detail-gallery">' +
      gallery.map((g, i) => '<img src="' + g + '" alt="" data-lb="' + g + '" class="' + (i === 0 ? "active" : "") + '" onclick="document.getElementById(\'mainImg\').src=this.src;document.querySelectorAll(\'.detail-gallery img\').forEach(x=>x.classList.remove(\'active\'));this.classList.add(\'active\')">').join("") +
      "</div>" +
      (ex.caption ? '<figcaption class="detail-caption">' + ex.caption + "</figcaption>" : "") +
      "</div>" +
      '<div class="detail-info">' +
      '<span class="badge-lux badge-gold"><i class="fa-solid fa-tag"></i> ' + ex.category + "</span>" +
      '<span class="badge-lux badge-bronze ms-1"><i class="fa-solid fa-flag"></i> ' + ex.civilization + "</span>" +
      "<h1 class='mt-3'>" + ex.nameAr + "</h1>" +
      "<h4 class='muted-text'>" + ex.nameEn + "</h4>" +
      "<p class='mt-3'>" + ex.description + "</p>" +
      "<div class='detail-specs'>" +
      spec("الحضارة", ex.civilization) +
      spec("العصر", ex.era) +
      spec("القرن", ex.century) +
      spec("القسـم", ex.category) +
      spec("المادة", ex.material) +
      spec("المحافظة", ex.province) +
      spec("موقع الاكتشاف", ex.discoveryLocation) +
      spec("تاريخ الاكتشاف", ex.discoveryDate) +
      spec("الدور", "الدور " + ex.floor) +
      spec("القاعة", hall ? hall.name : ex.hallNumber || "—") +
      spec("رقم القاعة", ex.hallNumber || "—") +
      spec("الرقم التعريفي", ex.inventoryNo || "—") +
      "</div>" +
      '<div class="d-flex flex-wrap gap-2 mt-3">' +
      '<button class="btn btn-gold" data-fav="' + ex.id + '"><i class="fa-solid fa-heart"></i> <span>أضف للمفضلة</span></button>' +
      '<button class="btn btn-outline" data-qr="' + ex.id + '"><i class="fa-solid fa-qrcode"></i> رمز QR</button>' +
      '<button class="btn btn-navy" data-audio><i class="fa-solid fa-headphones"></i> دليل صوتي</button>' +
      "</div>" +
      '<div class="glass-card mt-4" id="researchBox">' +
      "<h5><i class='fa-solid fa-flask gold-text'></i> للباحثين</h5>" +
      '<p class="muted-text small">' + (ex.researchNotes || ex.description.slice(0, 160) + "...") + "</p>" +
      '<a class="btn btn-ghost btn-sm" data-refs><i class="fa-solid fa-book"></i> المراجع العلمية</a>' +
      "</div>" +
      "</div>" +
      "</div>" +
      (related.length
        ? '<div class="mt-5"><div class="section-head"><h2 class="section-title">قطع ذات صلة</h2></div>' +
          '<div class="cards-grid tight">' + related.map((x) => window.YNM.exhibitCard(x)).join("") + "</div></div>"
        : "");

    if (window.AOS) AOS.refreshHard();
  }

  function spec(k, v) {
    return "<div class='spec-item'><div class='k'>" + k + "</div><div class='v'>" + (v || "—") + "</div></div>";
  }
})();

