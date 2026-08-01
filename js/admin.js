/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — admin.js
   Dashboard statistics, charts (Chart.js), tables, CRUD demo
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    initAdmin();
  });

  function initAdmin() {
    // Gate: admin only
    const u = window.YNM.getCurrentUser();
    const isAdminPage = document.getElementById("adminRoot");
    if (isAdminPage && (!u || u.role !== "admin")) {
      document.getElementById("adminRoot").innerHTML =
        '<div class="dash-login-gate"><div class="auth-card text-center">' +
        '<div class="icon" style="font-size:3rem;color:#8a5a2b"><i class="fa-solid fa-lock"></i></div>' +
        "<h3>صلاحية الإدارة مطلوبة</h3>" +
        '<p class="muted-text">هذه الصفحة مخصصة لمدير النظام فقط.</p>' +
        '<a class="btn btn-bronze mt-3" href="login.html">تسجيل الدخول</a></div></div>';
      return;
    }

    renderStats();
    renderCharts();
    renderRecentTable();
    renderUsersTable();
    renderCategoriesList();
    bindSidebar();
    bindUploadZone();
  }

  /* ---------- Stats ---------- */
  function renderStats() {
    const els = {
      artifacts: document.getElementById("statArtifacts"),
      civilizations: document.getElementById("statCivilizations"),
      halls: document.getElementById("statHalls"),
      users: document.getElementById("statUsers")
    };
    if (!data) return;
    if (els.artifacts) els.artifacts.textContent = data.exhibits.length;
    if (els.civilizations) els.civilizations.textContent = data.civilizations.length;
    if (els.halls) els.halls.textContent = data.halls.length;
    if (els.users) els.users.textContent = (data.users || []).length;
  }

  /* ---------- Charts ---------- */
  function renderCharts() {
    if (!window.Chart) return;

    // By civilization
    const civCanvas = document.getElementById("chartCiv");
    if (civCanvas) {
      const counts = data.civilizations.map((c) =>
        data.exhibits.filter((x) => x.civilizationId === c.id).length
      );
      new Chart(civCanvas, {
        type: "bar",
        data: {
          labels: data.civilizations.map((c) => c.name),
          datasets: [{
            label: "عدد القطع",
            data: counts,
            backgroundColor: "rgba(138,90,43,.75)",
            borderRadius: 8
          }]
        },
        options: chartOpts("عدد القطع حسب الحضارة")
      });
    }

    // By category
    const catCanvas = document.getElementById("chartCat");
    if (catCanvas) {
      const cats = data.data ? data.data.categories : data.categories || [];
      const catCounts = cats.map((c) =>
        data.exhibits.filter((x) => x.categoryId === c.id).length
      );
      new Chart(catCanvas, {
        type: "doughnut",
        data: {
          labels: cats.map((c) => c.name),
          datasets: [{
            data: catCounts,
            backgroundColor: ["#8a5a2b", "#c9a227", "#12263a", "#b07d3e", "#e3c25b", "#1a3450", "#6f4420", "#cfc6b4", "#dcd2bf", "#f5efe3"]
          }]
        },
        options: chartOpts("التوزيع حسب القسم")
      });
    }

    // By floor
    const floorCanvas = document.getElementById("chartFloor");
    if (floorCanvas) {
      const floors = [1, 2, 3].map((f) => data.exhibits.filter((x) => x.floor === f).length);
      new Chart(floorCanvas, {
        type: "pie",
        data: {
          labels: ["الدور الأول", "الدور الثاني", "الدور الثالث"],
          datasets: [{
            data: floors,
            backgroundColor: ["#8a5a2b", "#12263a", "#c9a227"]
          }]
        },
        options: chartOpts("القطع حسب الدور")
      });
    }
  }

  function chartOpts(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", rtl: true },
        title: { display: false }
      }
    };
  }

  /* ---------- Recent exhibits table ---------- */
  function renderRecentTable() {
    const tbody = document.getElementById("recentTable");
    if (!tbody || !data) return;
    const recent = data.exhibits.slice(0, 8);
    tbody.innerHTML = recent.map((ex, i) => {
      const status = i % 4 === 0 ? "published" : i % 4 === 1 ? "draft" : i % 4 === 2 ? "pending" : "archived";
      const statusAr = { published: "منشور", draft: "مسودة", pending: "قيد المراجعة", archived: "مؤرشف" };
      return (
        "<tr>" +
        "<td>" + ex.id + "</td>" +
        '<td><img class="thumb" src="' + (ex.thumbnail || ex.image) + '" alt="' + ex.nameAr + '"></td>' +
        "<td>" + ex.nameAr + "</td>" +
        "<td>" + ex.civilization + "</td>" +
        "<td>" + ex.category + "</td>" +
        '<td><span class="status status-' + status + '">' + statusAr[status] + "</span></td>" +
        '<td><div class="row-actions">' +
        '<button class="action-btn view" title="عرض"><i class="fa-solid fa-eye"></i></button>' +
        '<button class="action-btn edit" title="تعديل"><i class="fa-solid fa-pen"></i></button>' +
        '<button class="action-btn del" title="حذف"><i class="fa-solid fa-trash"></i></button>' +
        "</div></td></tr>"
      );
    }).join("");
  }

  /* ---------- Users table ---------- */
  function renderUsersTable() {
    const tbody = document.getElementById("usersTable");
    if (!tbody || !data) return;
    const roleAr = { admin: "مدير", researcher: "باحث", visitor: "زائر" };
    tbody.innerHTML = (data.users || []).map((u) =>
      "<tr>" +
      '<td><i class="fa-solid ' + (u.avatar || "fa-user") + '"></i></td>' +
      "<td>" + u.name + "</td>" +
      "<td>" + (u.email || "-") + "</td>" +
      '<td><span class="badge-lux badge-gold">' + roleAr[u.role] + "</span></td>" +
      "<td>" + (u.joined || "-") + "</td>" +
      '<td><div class="row-actions">' +
      '<button class="action-btn edit"><i class="fa-solid fa-pen"></i></button>' +
      '<button class="action-btn del"><i class="fa-solid fa-trash"></i></button>' +
      "</div></td></tr>"
    ).join("");
  }

  /* ---------- Categories list ---------- */
  function renderCategoriesList() {
    const wrap = document.getElementById("categoriesList");
    if (!wrap || !data) return;
    const cats = data.data ? data.data.categories : data.categories || [];
    wrap.innerHTML = cats.map((c) => {
      const count = data.exhibits.filter((x) => x.categoryId === c.id).length;
      return (
        '<div class="admin-link-card">' +
        '<span class="ic"><i class="fa-solid ' + (c.icon || "fa-tag") + '"></i></span>' +
        "<span><strong>" + c.name + "</strong><br><small class='muted-text'>" + count + " قطعة</small></span>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------- Sidebar ---------- */
  function bindSidebar() {
    const toggle = document.getElementById("dashToggle");
    const side = document.getElementById("dashSide");
    if (toggle && side) {
      toggle.addEventListener("click", () => side.classList.toggle("open"));
    }
    // Filter recent rows
    const search = document.getElementById("tableSearch");
    if (search) {
      search.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll("#recentTable tr").forEach((tr) => {
          tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
        });
      });
    }
  }

  /* ---------- Upload dropzone ---------- */
  function bindUploadZone() {
    const dz = document.getElementById("dropzone");
    if (!dz) return;
    dz.addEventListener("click", () => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "image/*";
      inp.multiple = true;
      inp.onchange = () => window.YNM.toast("تم اختيار الصور", "fa-image", "toast-success");
      inp.click();
    });
    ["dragover", "dragenter"].forEach((ev) =>
      dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("dragover"); })
    );
    ["dragleave", "drop"].forEach((ev) =>
      dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("dragover"); })
    );
    dz.addEventListener("drop", (e) => {
      if (e.dataTransfer.files.length) {
        window.YNM.toast("تم رفع " + e.dataTransfer.files.length + " صورة", "fa-cloud-arrow-up", "toast-success");
      }
    });
  }
})();

