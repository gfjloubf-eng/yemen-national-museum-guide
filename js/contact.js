/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — contact.js
   Contact page form: validates input and submits the message
   to POST /api/contact (stored in SQLite contact_messages).
   In local JSON fallback mode the message is stored locally.
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  document.addEventListener("ynm:ready", () => {
    initContact();
  });

  function initContact() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const nameEl = document.getElementById("contactName");
    const emailEl = document.getElementById("contactEmail");
    const subjectEl = document.getElementById("contactSubject");
    const messageEl = document.getElementById("contactMessage");
    const errorEl = document.getElementById("contactError");
    const submitBtn = document.getElementById("contactSubmit");

    const validate = () => {
      const errors = [];
      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const subject = subjectEl.value.trim();
      const message = messageEl.value.trim();

      if (name.length < 2) errors.push("يرجى إدخال الاسم الكامل");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("يرجى إدخال بريد إلكتروني صحيح");
      if (subject.length < 3) errors.push("يرجى إدخال الموضوع");
      if (message.length < 5) errors.push("يرجى كتابة رسالة أطول قليلاً");

      return { errors, payload: { fullName: name, email, subject, message } };
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.textContent = "";

      const { errors, payload } = validate();
      if (errors.length) {
        if (errorEl) errorEl.textContent = errors.join(" · ");
        return;
      }

      const btnText = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جارٍ الإرسال...';
      }

      try {
        // API mode: persist the message in SQLite via the backend
        if (window.YNM.state && window.YNM.state.source === "api") {
          const res = await fetch(window.YNM.API_BASE + "/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (!res.ok) {
            const detail = (data && data.details) ? (" — " + data.details.join(" · ")) : "";
            throw new Error((data && data.error || "تعذر الإرسال") + detail);
          }
        } else {
          // Local fallback: store locally
          const msgs = JSON.parse(localStorage.getItem("ynm_messages") || "[]");
          msgs.push(Object.assign({}, payload, { createdAt: new Date().toISOString() }));
          localStorage.setItem("ynm_messages", JSON.stringify(msgs));
        }

        form.reset();
        if (errorEl) errorEl.textContent = "";
        window.YNM.toast("تم استلام رسالتك بنجاح. شكراً لتواصلك معنا", "fa-circle-check", "toast-success");
      } catch (err) {
        if (errorEl) errorEl.textContent = err.message || "تعذر إرسال الرسالة، حاول مرة أخرى";
        window.YNM.toast("تعذر إرسال الرسالة", "fa-triangle-exclamation", "toast-error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = btnText;
        }
      }
    });
  }
})();

