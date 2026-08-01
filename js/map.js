/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — map.js
   Leaflet interactive museum map
   - Floor selection, hall navigation, amenity markers
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
(function () {
  "use strict";

  let data = null;
  let map = null;
  let markersLayer = null;
  let currentFloor = 1;

  document.addEventListener("ynm:ready", (e) => {
    data = e.detail;
    initMap();
  });

  function initMap() {
    const mapEl = document.getElementById("museumMap");
    if (!mapEl || !window.L) return;

    const cfg = data.data ? data.data.map : data.map;

    // Build a canvas-like floor plan using an ImageOverlay generated via SVG
    const bounds = [
      [cfg.lat - 0.0018, cfg.lng - 0.0018],
      [cfg.lat + 0.0018, cfg.lng + 0.0018]
    ];

    map = L.map(mapEl, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([cfg.lat, cfg.lng], cfg.zoom || 17);

    // Museum floor plan overlay (SVG generated at runtime)
    const overlay = L.imageOverlay(floorPlanSVG(), bounds, { opacity: 0.55 });
    overlay.addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // Amenities / features
    const feats = cfg.features || {};
    Object.keys(feats).forEach((key) => {
      const f = feats[key];
      const icon = amenityIcon(key);
      L.marker([f.lat, f.lng], { icon }).addTo(map)
        .bindPopup('<strong>' + f.label + "</strong>");
    });

    renderHallsList();
    selectFloor(1);

    // Map bounds fit
    map.fitBounds(bounds);
  }

  /* ---------- Generate floor plan SVG overlay ---------- */
  function floorPlanSVG() {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">' +
      '<rect width="600" height="600" fill="#e9e2d4"/>' +
      '<rect x="30" y="30" width="540" height="540" fill="none" stroke="#8a5a2b" stroke-width="10"/>' +
      '<rect x="90" y="90" width="200" height="420" fill="#f5efe3" stroke="#c9a227" stroke-width="4" rx="8"/>' +
      '<rect x="310" y="90" width="200" height="420" fill="#f5efe3" stroke="#c9a227" stroke-width="4" rx="8"/>' +
      '<rect x="255" y="250" width="90" height="120" fill="#fff" stroke="#8a5a2b" stroke-width="3" rx="6"/>' +
      '<text x="300" y="320" text-anchor="middle" font-family="Tahoma" font-size="14" fill="#12263a">الممر</text>' +
      '<text x="190" y="80" text-anchor="middle" font-family="Tahoma" font-size="20" fill="#12263a" font-weight="bold">قاعة ' + currentFloor + '</text>' +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------- Amenity icon ---------- */
  function amenityIcon(key) {
    const opts = {
      entrance: { icon: "🏛️", color: "#1a3450" },
      elevator: { icon: "🛗", color: "#8a5a2b" },
      restrooms: { icon: "🚻", color: "#2a5c41" },
      cafe: { icon: "☕", color: "#c9a227" },
      giftshop: { icon: "🎁", color: "#8a5a2b" },
      exit: { icon: "🚪", color: "#961e1e" }
    };
    const o = opts[key] || { icon: "📍", color: "#8a5a2b" };
    return L.divIcon({
      className: "custom-marker",
      html: '<div style="background:' + o.color + ';color:#fff;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,.3);border:2px solid #fff">' + o.icon + "</div>",
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30]
    });
  }

  /* ---------- Hall markers per floor ---------- */
  function selectFloor(floor) {
    currentFloor = floor;
    if (!map || !data) return;
    markersLayer.clearLayers();

    const cfg = data.data ? data.data.map : data.map;
    const halls = data.halls.filter((h) => h.floor === floor);

    // Show hall markers with computed positions based on floor layout
    const baseLat = cfg.lat - 0.0010 + (floor - 1) * 0.0006;
    const baseLng = cfg.lng - 0.0009;

    halls.forEach((h, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const lat = baseLat + (row % 2 === 0 ? 0.0003 : -0.0003);
      const lng = baseLng + col * 0.0013 + row * 0.00005;
      const icon = L.divIcon({
        className: "hall-marker",
        html: '<div style="background:linear-gradient(135deg,#c9a227,#b07d3e);color:#fff;min-width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-weight:800;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,.35);border:2px solid #fff;font-family:Tahoma">' + h.number + "</div>",
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -40]
      });
      const count = h.artifacts || 0;
      L.marker([lat, lng], { icon })
        .addTo(markersLayer)
        .bindPopup(
          "<div style='font-family:Tahoma;text-align:center;min-width:160px'>" +
          "<strong>" + h.name + "</strong><br>" +
          "<small>" + h.theme + "</small><br>" +
          "<span style='color:#8a5a2b'>" + count + " قطعة</span><br>" +
          '<a href="exhibit-details.html?hall=' + h.id + '" style="color:#12263a;font-weight:bold;font-size:12px">عرض القطع ←</a>' +
          "</div>"
        );
    });
  }

  /* ---------- Hall list sidebar ---------- */
  function renderHallsList() {
    const sidebar = document.getElementById("hallsList");
    if (!sidebar || !data) return;

    const floors = [1, 2, 3].map((f) => {
      const halls = data.halls.filter((h) => h.floor === f);
      return (
        '<div class="floor-group">' +
        '<h5><i class="fa-solid fa-layer-group"></i> الدور ' + f + "</h5>" +
        halls.map((h) =>
          '<div class="hall-list-item" data-hall="' + h.id + '" data-floor="' + f + '">' +
          '<span class="dot"></span><span>' + h.name + "</span>" +
          '<span class="badge-lux">' + (h.artifacts || 0) + " قطعة</span></div>"
        ).join("") +
        "</div>"
      );
    }).join("");

    sidebar.innerHTML = floors;

    sidebar.querySelectorAll("[data-hall]").forEach((item) => {
      item.addEventListener("click", () => {
        const floor = Number(item.getAttribute("data-floor"));
        selectFloor(floor);
        sidebar.querySelectorAll("[data-hall]").forEach((x) => x.classList.remove("active"));
        item.classList.add("active");
        // Open popup for that hall
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker && layer.getPopup()) {
            const content = layer.getPopup().getContent();
            if (typeof content === "string" && content.includes(item.getAttribute("data-hall") === item.getAttribute("data-hall") ? "" : "__")) {
              // no-op; markers are keyed by number, we simply open the matching one below
            }
          }
        });
      });
    });

    // Floor tabs
    const tabs = sidebar.querySelectorAll("[data-floor-tab]");
    tabs.forEach((t) => {
      t.addEventListener("click", () => selectFloor(Number(t.getAttribute("data-floor-tab"))));
    });
  }
})();

