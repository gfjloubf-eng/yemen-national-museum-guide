/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — backend/app.js
   Express server: CORS, JSON body, REST API, static frontend.
   Run:  npm install && npm run dev
   Server: http://localhost:3000
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
"use strict";

const path = require("path");
const express = require("express");
const cors = require("cors");

const apiRoutes = require("./routes/index");
const { api404, errorHandler } = require("./middleware/errorHandler");

// Initialize database + import JSON datasets on boot
const { init } = require("./database/init");
init();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", apiRoutes);

// Serve the frontend statically (index.html, js/, css/, data/, assets/)
const FRONTEND_ROOT = path.resolve(__dirname, "..");
app.use(express.static(FRONTEND_ROOT));

// Fallback for non-API GET routes -> index.html (SPA-friendly)
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, "index.html"));
});

// Unknown API route -> 404 JSON
app.use("/api", api404);

// Central error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("==============================================");
  console.log("YEMEN NATIONAL MUSEUM — Backend");
  console.log("----------------------------------------------");
  console.log("Server running : http://localhost:" + PORT);
  console.log("API base       : http://localhost:" + PORT + "/api");
  console.log("Frontend       : http://localhost:" + PORT);
  console.log("==============================================");
});

