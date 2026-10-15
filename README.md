# Temir Jurnal

Zal uchun mashg'ulotlar jurnali: setlarni yozish, rekordlarni kuzatish, progressni ko'rish. Telefon uchun yasalgan, internetsiz ham ishlaydi va telefonga ilova sifatida o'rnatiladi (PWA).

## Imkoniyatlar

- **Jurnal:** setlarni ✓ bilan belgilash. Bo'sh set o'tgan safargi natija bilan to'ldiriladi, shundan keyin dam olish taymeri o'zi boshlanadi.
- **Tayyor kunlik mashqlar:** mashqlar to'plami, har mashq uchun reja (masalan 3 set × 8-10); yangi mashqni shu yerning o'zida yaratish mumkin.
- **Superset** (A1/A2), mashg'ulot vaqti (Boshlash / Tugatish / Davom), avtomatik saqlanadigan qoralama.
- **Jonli rekordlar:** natija tarixdagi eng yaxshisidan oshsa 🔥 belgisi chiqadi va telefon titraydi.
- **Tahlil:** hajm grafiklari, mashq progressi, mushak guruhlari bo'yicha taqsimot, kalendar, yutuqlar.
- **Tana:** vazn (kg) va aylana o'lchamlari (sm), progress suratlari ("Oldin / Keyin" taqqoslash). Mashg'ulot va o'lchovdagi vazn bitta grafikda.
- **Eksport:** JSON zaxira, CSV (Excel).

## Texnologiyalar

React 18 · Vite 5 · Tailwind CSS · Firebase (Auth, Firestore offline keshi, Storage) · Recharts

## Lokal ishga tushirish

```bash
npm install
cp .env.example .env   # va Firebase qiymatlarini to'ldiring
npm run dev            # http://localhost:5180
```

| Buyruq            | Vazifasi                                                        |
| ----------------- | --------------------------------------------------------------- |
| `npm run dev`     | Ishlab chiqish serveri (5180-port)                              |
| `npm run build`   | Production build (`dist/`)                                      |
| `npm run preview` | Build'ni ko'rish (5181-port, service worker shu yerda ishlaydi) |
| `npm test`        | Mantiq testlari (`tests/`, qo'shimcha kutubxonasiz)             |
| `npm run lint`    | ESLint                                                          |

## Maxfiy sozlamalar

`.env` fayli **repozitoriyga kirmaydi** (`.gitignore`). Kerakli nomlar [`.env.example`](.env.example) da.

Firebase'ning veb-konfiguratsiyasi build paytida brauzer kodiga yoziladi, ya'ni uni to'liq yashirib bo'lmaydi. Ma'lumotni quyidagilar himoya qiladi:

1. **[`firestore.rules`](firestore.rules) va [`storage.rules`](storage.rules).** Har kim faqat o'z `users/{uid}` ma'lumotiga kira oladi, hujjat shakli va hajmi tekshiriladi.
2. **Firebase Auth → Settings → Authorized domains.** Ro'yxatda faqat o'z domenlaringiz bo'lsin.
3. **Google Cloud Console → APIs & Services → Credentials → API key.** Kalitga _Application restrictions → Websites_ cheklovi qo'yiladi va unga faqat o'z domenlaringiz yoziladi.

## Vercel'ga deploy

1. Vercel'da **Add New → Project** ni tanlab, shu repozitoriyni import qiling. Framework (Vite) [`vercel.json`](vercel.json) dan o'zi aniqlanadi.
2. **Settings → Environment Variables** bo'limiga `.env.example` dagi 6 ta `VITE_FIREBASE_*` o'zgaruvchini kiriting (Production va Preview uchun).
3. Deploy qiling.
4. Vercel bergan domenni (`*.vercel.app` va o'z domeningizni) Firebase'dagi **Authorized domains** ga va API kalit cheklovlariga qo'shing.
5. `firestore.rules` va `storage.rules` ni Firebase konsolida e'lon qiling (**Publish**).

`vercel.json` quyidagilarni ta'minlaydi: SPA marshrutlari (`/tarix` yangilanganda 404 chiqmaydi), service worker keshlanmaydi (yangi versiya darhol yetib boradi), hash'li fayllar bir yilga keshlanadi va xavfsizlik sarlavhalari qo'yiladi.

## Tuzilish

```
src/
  pages/        sahifalar (Jurnal, Tarix, Tahlil, Profil)
  components/   UI bloklari bo'limlar bo'yicha
  context/      provayderlar: auth, sinxronizatsiya, kolleksiyalar, forma
  hooks/        sahifa mantig'i
  services/     Firebase bilan ishlaydigan YAGONA qatlam
  utils/        sof funksiyalar (hisob-kitob, formatlash) — testlanadi
  constants/    ma'lumot sifatida yozilgan ro'yxatlar
public/         PWA: manifest, service worker, ikonkalar
tests/          node:assert testlari
```
