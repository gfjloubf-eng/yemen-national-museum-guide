/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — search.js
   Full-text search across name, civilization, province,
   century, category, material, hall, floor
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    initSearch();
  });

  function initSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    const results = document.getElementById("searchResults");
    const count = document.getElementById("resultCount");
    const mode = document.getElementById("searchMode");

    // Quick search from home page
    const q = window.YNM.getParam("q");
    if (q) input.value = q;

    // URL param filter (civ / hall / category)
    const civParam = window.YNM.getParam("civ");
    const hallParam = window.YNM.getParam("hall");
    const catParam = window.YNM.getParam("cat");

    populateSelects();

    function populateSelects() {
      const cats = data.data ? data.data.categories : data.categories || [];
      populate("sCat", cats.map((c) => c.name));
      populate("sCiv", data.civilizations.map((c) => c.name));
      populate("sProv", window.YNM.PROVINCES);
      populate("sFloor", ["1", "2", "3"]);
      populate("sMat", materials());
      if (civParam) document.getElementById("sCiv").value = civParam;
      if (catParam) document.getElementById("sCat").value = catParam;
    }

    function run() {
      const term = input.value.trim().toLowerCase();
      const fCat = val("sCat");
      const fCiv = val("sCiv");
      const fProv = val("sProv");
      const fFloor = val("sFloor");
      const fMat = val("sMat");

      let list = data.exhibits.slice();

      if (fCat) list = list.filter((x) => x.category === fCat);
      if (fCiv) list = list.filter((x) => x.civilization === fCiv);
      if (fProv) list = list.filter((x) => x.province === fProv);
      if (fFloor) list = list.filter((x) => x.floor === Number(fFloor));
      if (fMat) list = list.filter((x) => x.material === fMat);

      // Hall param filter
      if (hallParam) list = list.filter((x) => x.hallId === Number(hallParam));

      if (term) {
        const hallMap = {};
        data.halls.forEach((h) => { hallMap[h.id] = h.name; });
        list = list.filter((x) => {
          const haystack = [
            x.nameAr, x.nameEn, x.description,
            x.civilization, x.province, x.century, x.category,
            x.material, x.discoveryLocation,
            hallMap[x.hallId] || x.hallNumber || "",
            "الدور " + x.floor
          ].join(" ").toLowerCase();
          return haystack.includes(term);
        });
      }

      if (mode) mode.textContent = term ? "نتائج «" + input.value.trim() + "»" : "كل المعروضات";
      if (count) count.textContent = list.length;

      if (!list.length) {
        results.innerHTML =
          '<div class="empty-state"><div class="icon"><i class="fa-solid fa-magnifying-glass"></i></div>' +
          "<h3>لا توجد نتائج</h3><p class='muted-text'>جرّب كلمات مختلفة أو أزل الفلاتر</p></div>";
        return;
      }

      results.innerHTML =
        '<div class="cards-grid">' +
        list.slice(0, 60).map((x) => window.YNM.exhibitCard(x)).join("") +
        "</div>";
      if (window.AOS) AOS.refreshHard();
    }

    function val(id) {
      const el = document.getElementById(id);
      return el ? el.value : "";
    }

    input.addEventListener("input", window.YNM.debounce(run, 180));
    ["sCat", "sCiv", "sProv", "sFloor", "sMat"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", run);
    });

    run();
  }

  function populate(id, options) {
    const sel = document.getElementById(id);
    if (!sel) return;
    const first = document.createElement("option");
    first.value = "";
    first.textContent = "الكل";
    sel.appendChild(first);
    options.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      sel.appendChild(o);
    });
  }

  function materials() {
    const set = new Set();
    data.exhibits.forEach((x) => set.add(x.material));
    return Array.from(set);
  }
})();

