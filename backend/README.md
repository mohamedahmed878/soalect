# SOOLECT Backend

Node.js + Express + MongoDB (Mongoose) API, with JWT auth (roles: customer/admin)
and Socket.io for live sync between the storefront and the admin dashboard.

## إعداد سريع

### 1. جهّز MongoDB
- محليًا: نزّل ونشغّل [MongoDB Community](https://www.mongodb.com/try/download/community)، هيشتغل على `mongodb://127.0.0.1:27017`
- أو استخدم [MongoDB Atlas](https://www.mongodb.com/atlas) (مجاني) واخد الـ connection string

### 2. اعمل ملف .env

```bash
cd backend
cp .env.example .env
```

افتح `.env` وعدّل:
- `MONGO_URI` — رابط قاعدة البيانات بتاعتك
- `JWT_SECRET` — أي نص عشوائي طويل
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — بيانات أول حساب أدمن

### 3. ثبّت وشغّل

```bash
npm install
npm run dev
```

السيرفر هيشتغل على `http://localhost:5000`

### 4. اعمل Seed للبيانات (مرة واحدة)

في نافذة تانية، وأنت لسه جوه مجلد `backend`:

```bash
npm run seed:products   # يحط الـ 6 منتجات التجريبية في قاعدة البيانات
npm run seed:admin      # يعمل حساب أدمن من بيانات .env
```

بعد كده، سجّل دخول بـ `ADMIN_EMAIL` و `ADMIN_PASSWORD` (اللي حطيتهم في .env) في
**الأدمن** (`admin/`) — وهيبقى نفس الحساب ده لو سجّلت بيه في **المتجر** (`frontend/`)
هيظهرلك رابط "لوحة التحكم" في الناف بار لأنه role = admin.

## المسارات (API Routes)

| Method | Route                        | الوصول        | الوظيفة                          |
|--------|-------------------------------|----------------|-----------------------------------|
| POST   | /api/auth/register             | عام            | تسجيل عميل جديد                   |
| POST   | /api/auth/login                 | عام            | تسجيل دخول عميل                   |
| POST   | /api/auth/admin-login           | عام            | تسجيل دخول أدمن (يرفض غير الأدمن) |
| GET    | /api/auth/me                    | مسجل دخول      | بيانات المستخدم الحالي            |
| GET    | /api/products                   | عام            | كل المنتجات (فلترة بـ ?category=) |
| GET    | /api/products/:slug             | عام            | منتج واحد                         |
| POST   | /api/products                   | أدمن           | إضافة منتج                        |
| PUT    | /api/products/:id                | أدمن           | تعديل منتج                        |
| DELETE | /api/products/:id                | أدمن           | حذف منتج                          |
| POST   | /api/orders                     | مسجل دخول      | إنشاء طلب                         |
| GET    | /api/orders/mine                 | مسجل دخول      | طلباتي                            |
| PATCH  | /api/orders/:id/cancel            | مسجل دخول      | إلغاء طلبي (بس وهو "طلب جديد")    |
| GET    | /api/orders                     | أدمن           | كل الطلبات                        |
| PATCH  | /api/orders/:id/status           | أدمن           | تغيير حالة الطلب                  |
| DELETE | /api/orders/:id                  | أدمن           | حذف الطلب نهائيًا                 |
| GET    | /api/users                      | أدمن           | كل العملاء                        |
| POST   | /api/upload                      | أدمن           | رفع صورة منتج                     |
| POST   | /api/affiliates/apply             | مسجل دخول      | تقديم طلب انضمام كمسوق            |
| GET    | /api/affiliates/mine               | مسجل دخول      | حالة طلبي وإحصائياتي              |
| GET    | /api/affiliates/validate/:code      | عام            | التحقق من كود خصم/إحالة           |
| GET    | /api/affiliates                    | أدمن           | كل طلبات التسويق بعمولة           |
| GET    | /api/affiliates/:id                 | أدمن           | تفاصيل مسوق كاملة + طلباته        |
| PATCH  | /api/affiliates/:id/status          | أدمن           | قبول/رفض طلب مسوق                 |
| PATCH  | /api/affiliates/:id/code             | أدمن           | تحديد كود مخصص + قيمة الخصم       |
| POST   | /api/auth/admin-google              | عام            | تسجيل دخول أدمن بجوجل (حسابات أدمن فقط) |
| GET    | /api/settings                    | عام            | إعدادات الصورة الرئيسية (Hero)    |
| PUT    | /api/settings                    | أدمن           | تعديل صورة الصفحة الرئيسية        |
| GET    | /sitemap.xml                     | عام            | Sitemap ديناميكي (مش تحت /api)    |

## المزامنة الحية (Socket.io)

- لما عميل يعمل طلب جديد → حدث `order:new` يوصل لكل شاشات الأدمن المفتوحة فورًا
- لما الأدمن يغيّر حالة طلب → حدث `order:updated` يوصل لشاشات الأدمن ولحساب
  العميل صاحب الطلب، فيتحدث تلقائي من غير ما يعمل Refresh

## البنية

```
backend/
├── config/db.js              اتصال MongoDB
├── models/                   User, Product, Order (Mongoose schemas)
├── controllers/               منطق كل route
├── routes/                    Express routers
├── middleware/                 auth (JWT) / admin guard / error handler
├── utils/
│   ├── generateToken.js        توليد JWT
│   ├── socket.js                Socket.io singleton + event helpers
│   ├── seedProducts.js          سكريبت تعبئة المنتجات
│   └── seedAdmin.js             سكريبت إنشاء/ترقية حساب أدمن
└── server.js                   نقطة الدخول
```
