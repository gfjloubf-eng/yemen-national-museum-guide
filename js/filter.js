/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — filter.js
   Advanced multi-filter for exhibits page
   Filters: category, era, floor, civilization, province, material
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    initFilters();
  });

  function initFilters() {
    const grid = document.getElementById("exhibitsGrid");
    const countEl = document.getElementById("filterCount");
    if (!grid) return;

    const fCat = document.getElementById("fCat");
    const fEra = document.getElementById("fEra");
    const fFloor = document.getElementById("fFloor");
    const fCiv = document.getElementById("fCiv");
    const fProv = document.getElementById("fProv");
    const fMat = document.getElementById("fMat");
    const fSort = document.getElementById("fSort");
    const clearBtn = document.getElementById("clearFilters");
    const searchIn = document.getElementById("filterSearch");

    populate(fCat, data.data ? data.data.categories.map((c) => c.name) : data.categories || []);
    populate(fEra, ["القديمة", "الإسلامية", "الحديثة"]);
    populate(fFloor, ["1", "2", "3"]);
    populate(fCiv, data.civilizations.map((c) => c.name));
    populate(fProv, window.YNM ? window.YNM.PROVINCES : []);
    populate(fMat, materials());

    function currentFilters() {
      return {
        cat: fCat ? fCat.value : "",
        era: fEra ? fEra.value : "",
        floor: fFloor ? fFloor.value : "",
        civ: fCiv ? fCiv.value : "",
        prov: fProv ? fProv.value : "",
        mat: fMat ? fMat.value : "",
        q: searchIn ? searchIn.value.trim() : "",
        sort: fSort ? fSort.value : ""
      };
    }

    function apply() {
      const f = currentFilters();
      let list = data.exhibits.slice();

      if (f.cat) list = list.filter((x) => x.category === f.cat);
      if (f.era) list = list.filter((x) => x.era === f.era);
      if (f.floor) list = list.filter((x) => x.floor === Number(f.floor));
      if (f.civ) list = list.filter((x) => x.civilization === f.civ);
      if (f.prov) list = list.filter((x) => x.province === f.prov);
      if (f.mat) list = list.filter((x) => x.material === f.mat);
      if (f.q) {
        const q = f.q.toLowerCase();
        list = list.filter((x) =>
          (x.nameAr + " " + x.nameEn + " " + x.description).toLowerCase().includes(q)
        );
      }

      if (f.sort === "name") {
        list.sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
      } else if (f.sort === "date") {
        list.sort((a, b) => (b.discoveryDate || "").localeCompare(a.discoveryDate || ""));
      } else if (f.sort === "floor") {
        list.sort((a, b) => a.floor - b.floor);
      }

      render(list);
    }

    function render(list) {
      if (countEl) countEl.textContent = list.length;
      if (!list.length) {
        grid.innerHTML =
          '<div class="empty-state"><div class="icon"><i class="fa-solid fa-filter-circle-xmark"></i></div>' +
          "<h3>لا توجد معروضات مطابقة</h3><p>جرّب تعديل الفلاتر أو البحث</p></div>";
        return;
      }
      grid.innerHTML =
        '<div class="cards-grid">' +
        list.map((ex) => window.YNM.exhibitCard(ex)).join("") +
        "</div>";
      if (window.AOS) AOS.refreshHard();
    }

    [fCat, fEra, fFloor, fCiv, fProv, fMat, fSort].forEach((s) => {
      if (s) s.addEventListener("change", apply);
    });
    if (searchIn) searchIn.addEventListener("input", window.YNM.debounce(apply, 200));
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        [fCat, fEra, fFloor, fCiv, fProv, fMat, fSort].forEach((s) => { if (s) s.value = ""; });
        if (searchIn) searchIn.value = "";
        apply();
      });
    }

    apply();
  }

  function populate(sel, options) {
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

