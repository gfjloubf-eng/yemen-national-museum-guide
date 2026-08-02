/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — login.js
   Login page: auth tabs, demo credentials, form submission
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    initLogin();
  });

  function initLogin() {
    const loginBtn = document.getElementById("loginBtn");
    const loginUser = document.getElementById("loginUser");
    const loginPass = document.getElementById("loginPass");
    const loginError = document.getElementById("loginError");

    if (loginBtn) {
      loginBtn.addEventListener("click", async () => {
        const u = loginUser.value.trim();
        const p = loginPass.value;
        if (!u || !p) {
          loginError.textContent = "يرجى إدخال اسم المستخدم وكلمة المرور";
          return;
        }

        // API mode: verify credentials on the server (no passwords shipped to browser)
        if (window.YNM.state && window.YNM.state.source === "api") {
          try {
            const res = await fetch(window.YNM.API_BASE + "/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: u, password: p })
            });
            const data = await res.json();
            if (!res.ok || !data.user) {
              loginError.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة";
              return;
            }
            // Store the safe user object (no password) in localStorage
            const safe = Object.assign({}, data.user);
            delete safe.password;
            window.YNM.state.currentUser = safe;
            localStorage.setItem("ynm_user", JSON.stringify(safe));
            loginError.textContent = "";
            setTimeout(() => {
              window.location.href = safe.role === "admin" ? "admin.html" : "profile.html";
            }, 500);
            return;
          } catch (err) {
            loginError.textContent = "تعذر الاتصال بالخادم، جرّب مرة أخرى";
            return;
          }
        }

        // Local JSON fallback mode
        const user = window.YNM.login(u, p);
        if (user) {
          loginError.textContent = "";
          setTimeout(() => {
            window.location.href = user.role === "admin" ? "admin.html" : "profile.html";
          }, 500);
        } else {
          loginError.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة";
        }
      });
    }

    // Auth tabs
    document.querySelectorAll("[data-auth-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-auth-tab]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.getAttribute("data-auth-tab");
        document.querySelectorAll("[data-pane]").forEach((p) => {
          p.style.display = p.getAttribute("data-pane") === target ? "" : "none";
        });
      });
    });

    // Demo credentials
    document.querySelectorAll("[data-demo]").forEach((el) => {
      el.addEventListener("click", () => {
        const role = el.getAttribute("data-demo");
        const creds = {
          admin: { user: "admin", pass: "admin123" },
          researcher: { user: "researcher", pass: "res123" },
          visitor: { user: "visitor", pass: "vis123" }
        }[role];
        if (creds && loginUser && loginPass) {
          loginUser.value = creds.user;
          loginPass.value = creds.pass;
        }
      });
    });

    // Enter key submission
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && loginBtn) loginBtn.click();
    });
  }
})();
