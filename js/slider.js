/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — slider.js
   Swiper slider initializers for hero, exhibits, civilizations
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    initHeroSlider();
    initExhibitSliders();
  });

  function initHeroSlider() {
    const el = document.getElementById("heroSwiper");
    if (!el || !window.Swiper) return;
    new Swiper(el, {
      loop: true,
      speed: 900,
      effect: "fade",
      autoplay: { delay: 6000, disableOnInteraction: false },
      pagination: { el: el.querySelector(".swiper-pagination"), clickable: true },
      navigation: {
        nextEl: el.querySelector(".swiper-button-next"),
        prevEl: el.querySelector(".swiper-button-prev")
      }
    });
  }

  function initExhibitSliders() {
    const els = document.querySelectorAll(".swiper-exhibits");
    if (!els.length || !window.Swiper || !data) return;

    els.forEach((container) => {
      const civ = container.getAttribute("data-civ");
      const limit = Number(container.getAttribute("data-limit") || 8);
      let items = data.exhibits;
      if (civ) items = items.filter((x) => x.civilization === civ);
      if (container.getAttribute("data-featured")) items = items.filter((x) => x.featured);
      items = items.slice(0, limit);

      const wrap = container.querySelector(".swiper-wrapper");
      wrap.innerHTML = items.map((ex) => '<div class="swiper-slide">' + window.YNM.exhibitCard(ex) + "</div>").join("");

      new Swiper(container, {
        slidesPerView: 1,
        spaceBetween: 18,
        loop: items.length > 2,
        autoplay: items.length > 4 ? { delay: 5000, disableOnInteraction: false } : false,
        pagination: { el: container.querySelector(".swiper-pagination"), clickable: true },
        navigation: {
          nextEl: container.querySelector(".swiper-button-next"),
          prevEl: container.querySelector(".swiper-button-prev")
        },
        breakpoints: {
          576: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
          1200: { slidesPerView: 4 }
        }
      });
    });
  }
})();

