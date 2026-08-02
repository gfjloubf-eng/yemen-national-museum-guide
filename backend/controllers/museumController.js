/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — controllers/museumController.js
   Request handlers using async/await + validation.
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
"use strict";

const service = require("../services/museumService");

const ok = (res, data) => res.status(200).json(data);
const created = (res, data) => res.status(201).json(data);
const notFound = (res, msg) => res.status(404).json({ error: msg || "Not found" });

async function getHome(req, res, next) {
  try {
    ok(res, service.getHome());
  } catch (err) {
    next(err);
  }
}

async function getExhibits(req, res, next) {
  try {
    ok(res, { exhibits: service.getExhibits() });
  } catch (err) {
    next(err);
  }
}

async function getExhibitById(req, res, next) {
  try {
    const ex = service.getExhibitById(req.params.id);
    if (!ex) return notFound(res, "Exhibit not found");
    ok(res, { exhibit: ex });
  } catch (err) {
    next(err);
  }
}

async function getCivilizations(req, res, next) {
  try {
    ok(res, { civilizations: service.getCivilizations() });
  } catch (err) {
    next(err);
  }
}

async function getHalls(req, res, next) {
  try {
    ok(res, { halls: service.getHalls() });
  } catch (err) {
    next(err);
  }
}

async function getFloors(req, res, next) {
  try {
    ok(res, { floors: service.getFloors() });
  } catch (err) {
    next(err);
  }
}

async function getEvents(req, res, next) {
  try {
    ok(res, { events: service.getEvents() });
  } catch (err) {
    next(err);
  }
}

async function getFigures(req, res, next) {
  try {
    ok(res, { figures: service.getFigures() });
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    ok(res, { users: service.getUsers() });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const username = String((req.body || {}).username || "").trim();
    const password = String((req.body || {}).password || "");
    if (!username || !password) {
      return res.status(422).json({ error: "username and password are required" });
    }
    const user = service.login(username, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    ok(res, { user });
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const results = service.searchExhibits(req.query.q, {
      cat: req.query.cat,
      civ: req.query.civ,
      prov: req.query.prov,
      floor: req.query.floor,
      mat: req.query.mat
    });
    ok(res, { results, count: results.length });
  } catch (err) {
    next(err);
  }
}

/* ---------- Contact validation ---------- */
function validateContact(body) {
  const errors = [];
  const fullName = String(body.fullName || body.full_name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();

  if (!fullName) errors.push("fullName is required");
  if (fullName.length < 2) errors.push("fullName must be at least 2 characters");
  if (!email) errors.push("email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email is invalid");
  if (!subject) errors.push("subject is required");
  if (subject.length < 3) errors.push("subject must be at least 3 characters");
  if (!message) errors.push("message is required");
  if (message.length < 5) errors.push("message must be at least 5 characters");

  return { errors, payload: { fullName, email, subject, message } };
}

async function createContact(req, res, next) {
  try {
    const { errors, payload } = validateContact(req.body || {});
    if (errors.length) {
      return res.status(422).json({ error: "Validation failed", details: errors });
    }
    const id = service.submitContact(payload);
    created(res, {
      success: true,
      id,
      message: "تم استلام رسالتك بنجاح. سنتواصل معك قريباً."
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHome,
  getExhibits,
  getExhibitById,
  getCivilizations,
  getHalls,
  getFloors,
  getEvents,
  getFigures,
  getUsers,
  login,
  search,
  createContact
};

