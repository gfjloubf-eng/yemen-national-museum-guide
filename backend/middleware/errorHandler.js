/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — middleware/errorHandler.js
   Central error handling + 404 for unknown API routes.
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
"use strict";

// 404 for unmatched /api routes
function api404(req, res) {
  res.status(404).json({ error: "API endpoint not found", path: req.originalUrl });
}

// Central error handler
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error("[server error]", err);
  const status = err.status || 500;
  res.status(status).json({
    error: "Internal server error",
    message: err.message || "Something went wrong"
  });
}

module.exports = { api404, errorHandler };

