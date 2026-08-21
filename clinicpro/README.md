# ClinicFlow ERP - Klinika Boshqaruv Tizimi

To'liq ishlaydigan klinika boshqaruv tizimi - Stitch design asosida qurilgan.

## Stack
- **Frontend**: 19 ta Stitch HTML design sahifasi + Tailwind CSS (CDN)
- **Backend**: Cloudflare Workers + TiDB Cloud (serverless MySQL)
- **JavaScript**: Vanilla JS - login, queue, billing, staff management

## Sahifalar (19 ta)
- `/` - Login (klinika kirish)
- `/register` - Yangi klinika ro'yxatdan o'tish
- `/dashboard` - Boshqaruv paneli
- `/reception` - Qabulxona va ro'yxatdan o'tish
- `/reception-pro` - Professional qabulxona
- `/patients` - Bemorlar ro'yxati
- `/patient-detail` - Bemor kartochkasi
- `/patient-history` - Bemor kasallik tarixi
- `/doctor` - Shifokor kabineti
- `/doctor-cabinet` - Shifokor shaxsiy kabineti
- `/doctor-salary` - Shifokorlar ish haqi va maoshlari
- `/cashier` - Kassa va moliyaviy boshqaruv
- `/invoice` - To'lov va hisob-faktura
- `/analytics` - Moliyaviy hisobotlar va tahlil
- `/expenses` - Xarajatlar tahlili va hisoboti
- `/prescription-new` - Yangi retsept yozish
- `/prescription-print` - Retseptni chop etish
- `/settings` - Tizim boshqaruvi va xavfsizlik sozlamalari
- `/system-status` - Klinika tizimi holati va monitoring

## Funksiyalar
- ✅ Klinika login (shifonur / 123)
- ✅ Bemor ro'yxatga olish (qabulxona)
- ✅ Bemorni shifokorga yo'naltirish (navbat)
- ✅ Shifokor kabineti - navbatdagi bemorni qabul qilish
- ✅ Kassa - to'lov qabul qilish
- ✅ Xodimlar boshqaruvi (admin)
- ✅ TiDB Cloud bilan sinxronizatsiya
- ✅ Toast bildirishnomalar
- ✅ Modal dialoglar (bemor qo'shish, va h.k.)

## API Routes (Cloudflare Worker)
- `GET /api/clinic/clinics` - Barcha klinikalar ro'yxati
- `GET /api/clinic/load/:id` - Klinika ma'lumotlarini yuklash
- `POST /api/clinic/save/:id` - Klinika ma'lumotlarini saqlash
- `POST /api/clinic/register` - Yangi klinika ro'yxatdan o'tkazish

## Deploy
```bash
npm install -g wrangler
wrangler deploy
```

## Login
- **Login:** `shifonur`
- **Parol:** `123`
