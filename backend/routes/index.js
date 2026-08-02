/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — routes/index.js
   REST API route definitions.
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
"use strict";

const express = require("express");
const controller = require("../controllers/museumController");

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "yemen-museum-backend" });
});

// Home aggregate
router.get("/home", controller.getHome);

// Exhibits
router.get("/exhibits", controller.getExhibits);
router.get("/exhibits/:id", controller.getExhibitById);

// Civilizations
router.get("/civilizations", controller.getCivilizations);

// Halls
router.get("/halls", controller.getHalls);

// Floors
router.get("/floors", controller.getFloors);

// Events
router.get("/events", controller.getEvents);

// Figures
router.get("/figures", controller.getFigures);

// Users (safe — no passwords)
router.get("/users", controller.getUsers);

// Login (server-side credential check)
router.post("/login", controller.login);

// Search
router.get("/search", controller.search);

// Contact
router.post("/contact", controller.createContact);

module.exports = router;

