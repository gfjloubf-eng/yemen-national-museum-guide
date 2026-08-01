/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — favorites.js
   Renders favorite exhibits from localStorage
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    renderFavorites();
  });

  function renderFavorites() {
    const root = document.getElementById("favoritesRoot");
    if (!root || !data) return;

    const favs = window.YNM.getFavorites();
    const list = data.exhibits.filter((x) => favs.includes(x.id));

    if (!list.length) {
      root.innerHTML =
        '<div class="empty-state"><div class="icon"><i class="fa-solid fa-heart-crack"></i></div>' +
        "<h3>لا توجد قطع في المفضلة</h3>" +
        '<p class="muted-text">استكشف المعروضات وأضف ما يعجبك إلى المفضلة.</p>' +
        '<a class="btn btn-gold mt-3" href="exhibits.html">تصفح المعروضات <i class="fa-solid fa-arrow-left"></i></a></div>';
      return;
    }

    root.innerHTML =
      '<div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">' +
      '<span class="muted-text"><strong>' + list.length + "</strong> قطعة محفوظة</span>" +
      '<button class="btn btn-ghost btn-sm" id="clearAllFavs"><i class="fa-solid fa-trash"></i> مسح الكل</button>' +
      "</div>" +
      '<div class="cards-grid">' + list.map((x) => window.YNM.exhibitCard(x)).join("") + "</div>";

    const clear = document.getElementById("clearAllFavs");
    if (clear) {
      clear.addEventListener("click", () => {
        localStorage.removeItem("ynm_favorites");
        renderFavorites();
        window.YNM.toast("تم مسح المفضلة", "fa-trash", "toast-error");
      });
    }
  }
})();
