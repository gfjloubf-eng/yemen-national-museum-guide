# تقرير المرحلة 9 — الخادم الخلفي (Backend Foundation)

**المشروع**: المتحف الوطني اليمني — دليل المتحف الرقمي
**المرحلة**: Milestone 9 — Node.js + Express + SQLite (REST API + صفحة اتصال)
**التاريخ**: 2025
**المهندس**: Eng. Ammar Adel Al-Masouei

---

## الملخص

تمت إضافة خادم خلفي كامل (`backend/`) يقدّم بيانات المتحف عبر REST API من قاعدة بيانات SQLite، مع الحفاظ على عمل الواجهة الأمامية بالكامل في وضع الأمان (SAFE mode) بدون خادم — إذ تحاول `js/app.js` الاتصال بالـ API أولاً وتتحول تلقائياً إلى ملفات `data/*.json` المحلية إذا كان الخادم غير متاح.

كما أُضيفت صفحة **اتصل بنا** (`contact.html`) بنموذج يرسل الرسائل إلى `POST /api/contact` لتُخزَّن في جدول `contact_messages` في SQLite وتستمر عبر إعادة التشغيل.

---

## ما تم إنجازه

### 1. بنية الخادم
| الملف | الوظيفة |
|-------|---------|
| `backend/package.json` | التبعيات: `express`, `better-sqlite3@^12`, `cors` — سكربتات `start`, `dev`, `init-db` |
| `backend/app.js` | خادم Express: CORS، ربط `/api`، تقديم الواجهة الأمامية، منفذ 3000 |
| `backend/database/schema.sql` | 11 جدولاً: civilizations, exhibits, halls, floors, events, figures, categories, provinces, users, contact_messages, museum_meta |
| `backend/database/init.js` | إنشاء `museum.db` + استيراد تلقائي لكل ملفات JSON عند بدء التشغيل |
| `backend/models/index.js` | طبقة الوصول للبيانات (prepared statements + تحليل أعمدة JSON) |
| `backend/services/museumService.js` | منطق الأعمال: `getHome`, `searchExhibits`, `login`, `submitContact` |
| `backend/controllers/museumController.js` | معالجات الطلبات + التحقق من صحة الإدخال |
| `backend/routes/index.js` | تعريفات REST API |
| `backend/middleware/errorHandler.js` | معالجة 404 + معالج الأخطاء المركزي |

### 2. نقاط النهاية (Endpoints)
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/api/health` | فحص صحة الخادم |
| GET | `/api/home` | البيانات المجمّعة للرئيسية |
| GET | `/api/exhibits` | كل القطع الأثرية (120) |
| GET | `/api/exhibits/:id` | تفاصيل قطعة |
| GET | `/api/civilizations` | الحضارات (8) |
| GET | `/api/halls` | القاعات (15) |
| GET | `/api/floors` | الأدوار (3) |
| GET | `/api/events` | الأحداث التاريخية (20) |
| GET | `/api/figures` | الشخصيات التاريخية (30) |
| GET | `/api/users` | المستخدمون (بدون كلمات مرور) |
| POST | `/api/login` | التحقق من بيانات الدخول على الخادم |
| GET | `/api/search?q=...` | البحث النصي مع الفلاتر |
| POST | `/api/contact` | حفظ رسالة اتصال في SQLite |

### 3. قاعدة البيانات (استيراد JSON)
| الجدول | العدد |
|--------|-------|
| civilizations | 8 |
| categories | 15 |
| provinces | 15 |
| floors | 3 |
| events | 20 |
| figures | 30 |
| halls | 15 |
| exhibits | 120 |
| users | 4 |
| contact_messages | محفوظة عبر إعادة التشغيل |
| museum_meta | 1 (meta/stats/news/map/home) |

### 4. الواجهة الأمامية
- `js/app.js`: إعادة كتابة `initData()` ليكون **API أولاً** مع **احتياطي JSON محلي** (SAFE mode)
- إضافة رابط **"اتصل بنا"** إلى القائمة العلوية والتذييل (تُحقن في كل الصفحات)
- تحديث هاتف التذييل إلى **+967712750388** وإضافة رابط **واتساب** `https://wa.me/967712750388`
- `js/login.js`: عند تشغيل الخادم يتم التحقق من بيانات الدخول عبر `POST /api/login` (بدون إرسال كلمات المرور إلى المتصفح)
- `js/contact.js`: نموذج اتصال يتحقق من المدخلات ويرسل `POST /api/contact` (أو يحفظ محلياً في وضع الأمان)
- إظهار مصدر البيانات (`api` أو `local`) عبر `window.YNM.state.source`

### 5. صفحة اتصل بنا
- `contact.html`: حقول (الاسم الكامل، البريد الإلكتروني، الموضوع، الرسالة) + معلومات التواصل
- هاتف: `+967712750388` | واتساب: `https://wa.me/967712750388`
- العنوان: شارع الخمسين، صنعاء — الجمهورية اليمنية
- أوقات العمل: السبت - الخميس، 9 صباحاً - 5 مساءً (الجمعة مغلق)

---

## التحقق والاختبار

تم تنفيذ الاختبارات على **Windows 10 / Node v24.15.0**:

| الاختبار | النتيجة |
|----------|---------|
| `npm.cmd install` | ✅ 106 حزمة، 0 ثغرات |
| تشغيل `npm run dev` | ✅ إنشاء DB + استيراد JSON + تشغيل على :3000 |
| `GET /api/health` | ✅ `{"status":"ok"}` |
| `GET /api/exhibits` | ✅ 120 قطعة |
| `GET /api/civilizations` | ✅ 8 حضارات |
| `GET /api/halls` | ✅ 15 قاعة |
| `GET /api/floors` | ✅ 3 أدوار |
| `GET /api/events` | ✅ 20 حدثاً |
| `GET /api/figures` | ✅ 30 شخصية |
| `GET /api/users` | ✅ 4 مستخدمين — بدون كلمة مرور |
| `GET /api/search?q=statue` | ✅ 12 نتيجة |
| `POST /api/login` | ✅ يعيد المستخدم بدون حقل `password` |
| `POST /api/contact` (صالح) | ✅ حفظ الرسالة في SQLite |
| `POST /api/contact` (غير صالح) | ✅ HTTP 422 مع تفاصيل الخطأ |
| `GET /` (واجهة) | ✅ 200 |
| `GET /contact.html` | ✅ 200 |
| `GET /js/app.js` | ✅ 200 |

### أخطاء تم إصلاحها أثناء التطوير
1. **`better-sqlite3@11.x` لا يعمل مع Node 24** (يتطلب node-gyp/Python) → الترقية إلى `^12.x` (ثنائيات مُجمّعة مسبقاً).
2. **`POST /api/login` → `TypeError: models.findUserByCredentials is not a function`** → إضافة الدالة إلى `module.exports` في `models/index.js` وإعادة تشغيل الخادم.
3. **`package.json` كان سطراً واحداً مضغوطاً** → إعادة كتابته بصيغة JSON منسّقة.
4. **PowerShell/curl**: `curl` في PowerShell يعمل كـ `Invoke-WebRequest` → استخدام `curl.exe`، وتمرير أجسام JSON عبر `--data @file`.

---

## كيفية التشغيل

```bash
cd backend
npm install
npm run dev
# ثم افتح http://localhost:3000
```

---

## الخلاصة

المرحلة 9 مكتملة: الخادم الخلفي يعمل، قاعدة البيانات تُنشأ وتُستورد تلقائياً، كل نقاط النهاية تستجيب بشكل صحيح، نموذج الاتصال يخزّن الرسائل في SQLite، والواجهة الأمامية تعمل بوضع مزدوج (API أولاً + احتياطي محلي) دون أي كسر في الوظائف الحالية.

© 2025 المتحف الوطني اليمني — جميع الحقوق محفوظة

