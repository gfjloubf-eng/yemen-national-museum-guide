# Milestone 9 — Backend Foundation (Node.js + Express + SQLite) — TODO

## Steps

- [x] M8. Frontend Image Binding complete
- [x] 1. Backend scaffold — `backend/package.json`, `app.js`, folder structure (routes/controllers/services/models/middleware/database/uploads)
- [x] 2. Database schema — `backend/database/schema.sql` (civilizations, exhibits, halls, floors, events, figures, categories, provinces, users, museum_meta, contact_messages)
- [x] 3. Auto-import all JSON datasets into SQLite — `backend/database/init.js` (museum.json, civilizations.json, exhibits.json, halls.json, users.json)
- [x] 4. Models layer — `backend/models/index.js` (prepared statements + JSON column parsing)
- [x] 5. Service layer — `backend/services/museumService.js` (home aggregate, search, contact)
- [x] 6. Controllers — `backend/controllers/museumController.js` (async/await handlers + validation)
- [x] 7. Routes — `backend/routes/index.js` (REST API endpoints + POST /login + POST /contact)
- [x] 8. Middleware — `backend/middleware/errorHandler.js` (404 + central error handler)
- [x] 9. Frontend — `js/app.js` API-first data loading with local JSON fallback; add Contact link in nav/footer; update footer phone + WhatsApp
- [x] 10. Contact page — `contact.html` + `js/contact.js` (Full Name, Email, Subject, Message; phone +967712750388; WhatsApp wa.me/967712750388; stores to contact_messages)
- [x] 11. Docs — update README.md; write `reports/milestone9_backend_report.md`
- [x] 12. Validation — `npm install`, `npm run dev`, verify DB created, JSON imported, API working, frontend connected, images/search/filters/timeline/gallery work, contact stores messages, zero console/server errors

## Status

- Milestone 9 complete — backend foundation with Express + SQLite, REST API, and Contact page.

