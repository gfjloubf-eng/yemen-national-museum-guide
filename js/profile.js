/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — profile.js
   Profile page: user info, favorites list, research notes
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    renderProfile();
  });

  function renderProfile() {
    const u = window.YNM.getCurrentUser();
    if (!u) {
      window.location.href = "login.html";
      return;
    }

    const roleAr = { admin: "مدير النظام", researcher: "باحث", visitor: "زائر" };
    const nameEl = document.getElementById("profileName");
    const roleEl = document.getElementById("profileRole");
    if (nameEl) nameEl.textContent = u.name;
    if (roleEl) roleEl.textContent = roleAr[u.role] || u.role;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => window.YNM.logout());

    renderFavs();
    renderNotes();
  }

  function renderFavs() {
    const wrap = document.getElementById("profileFavs");
    if (!wrap || !data) return;
    const favs = window.YNM.getFavorites();
    if (!favs.length) {
      wrap.innerHTML = '<p class="muted-text"><i class="fa-regular fa-heart"></i> لا توجد مفضلة بعد. تصفح المعروضات وأضف ما يعجبك.</p>';
      return;
    }
    const items = data.exhibits.filter((x) => favs.includes(x.id));
    wrap.innerHTML = items.length
      ? '<div class="cards-grid tight">' + items.map((x) => window.YNM.exhibitCard(x)).join("") + "</div>"
      : '<p class="muted-text">القطع المفضلة غير متوفرة حالياً.</p>';
  }

  function renderNotes() {
    const wrap = document.getElementById("profileNotes");
    const section = document.getElementById("profileNotesSection");
    if (!wrap || !data) return;
    const u = window.YNM.getCurrentUser();
    if (u && u.role !== "researcher") {
      if (section) section.style.display = "none";
      return;
    }
    const notes = window.YNM.getNotes();
    if (!notes.length) {
      wrap.innerHTML = '<p class="muted-text">لا توجد ملاحظات بحثية بعد.</p>';
      return;
    }
    wrap.innerHTML = notes.map((n) => {
      const ex = data.exhibits.find((x) => x.id === n.exhibitId);
      return (
        '<div class="glass-card mb-2">' +
        '<div class="d-flex justify-content-between align-items-start">' +
        "<strong>" + (ex ? ex.nameAr : "قطعة #" + n.exhibitId) + "</strong>" +
        '<span class="muted-text small">' + n.date + "</span>" +
        "</div>" +
        "<p class='mt-1 muted-text'>" + n.text + "</p>" +
        "</div>"
      );
    }).join("");
  }
})();
