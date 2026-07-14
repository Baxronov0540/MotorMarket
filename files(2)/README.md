# MotorMarket — Frontend

`app/` (FastAPI) backendingiz uchun tayyor, static HTML/CSS/JS frontend (build tizimisiz, to'g'ridan-to'g'ri brauzerda ishlaydi).

## Ishga tushirish

1. Backendni ishga tushiring (odatda `http://127.0.0.1:8000`).
2. `index.html`ni istalgan static-server orqali oching, masalan:
   ```bash
   cd frontend
   python3 -m http.server 5500
   ```
   va brauzerda `http://127.0.0.1:5500` ni oching.
3. Agar backend boshqa manzilda bo'lsa, brauzer konsolida yoki har bir HTML faylning `<head>`iga quyidagini qo'shing:
   ```html
   <script>window.MOTORMARKET_API_URL = "http://your-backend:8000";</script>
   ```
   (`js/api.js` dan oldin joylashtiring). Standart holatda `http://127.0.0.1:8000` ishlatiladi.

## Sahifalar

| Fayl | Vazifasi |
|---|---|
| `index.html` | E'lonlar ro'yxati, filtr (narx, subkategoriya, hudud, holat), sahifalash |
| `listing.html?id=` | E'lon tafsilotlari, texnik xususiyatlar, galereya, saqlash |
| `auth.html` | Kirish / ro'yxatdan o'tish (email tasdiqlash kodi bilan) |
| `profile.html` | Profilni tahrirlash, parol o'zgartirish, "Mening e'lonlarim" |
| `create.html` | Yangi e'lon joylash + rasm(lar) yuklash |
| `saved.html` | Saqlangan e'lonlar ro'yxati |

Token (`access_token` / `refresh_token`) brauzerning `localStorage`ida saqlanadi.

## Backenddan aniqlangan cheklovlar/xatoliklar

Frontendni yozish jarayonida quyidagilar aniqlandi — agar to'liq funksionallik kerak bo'lsa, backendda tuzatish tavsiya etiladi:

1. **`app/routers/user.py`** — `@router.put("profile/update")` va `@router.put("change/password")` dekoratorlarida yo'l boshida `/` yo'q. FastAPI'da bu odatda ishga tushish xatosiga olib keladi. Tuzatish: `@router.put("/profile/update")` va `@router.put("/change/password")`.
2. **`ListingResponse` sxemasi** (`app/schemas/listing.py`) — `media` (rasmlar) maydonini o'z ichiga olmaydi, shu sabab `/listing/list`, `/listing/get/{id}`, `/listing/user/` javoblarida rasm URL'lari qaytmaydi. Frontend buni "RASM YO'Q" bilan yumshoq qoplaydi. Tuzatish uchun `ListingResponse`ga `media: list[ListingMediaResponse] = []` qo'shish kerak (va `ListingMediaResponse` sxemasini yaratish).
3. **`SavedListingResponse`** — bog'langan `listing` obyektini qaytarmaydi (router `joinedload` qilsa ham). Frontend buni har bir saqlangan yozuv uchun qo'shimcha `/listing/get/{id}` so'rovi bilan qoplaydi.
4. **Subkategoriyalar uchun endpoint yo'q** — `Category`/`Subcategory` modellari bor, lekin `/category` routerida faqat kategoriya nomi va IDsi qaytadi, subkategoriyalar ro'yxati uchun endpoint mavjud emas. Shu sabab e'lon yaratishda foydalanuvchi `subcategory_id`ni qo'lda kiritadi. Tavsiya: `GET /category/{id}/subcategories` kabi endpoint qo'shish.
5. **`/listing/create`** — `title`, `condition`, `status`, `location` maydonlarini so'rovda qabul qiladi, lekin `Listing(...)` yaratishda faqat `subcategory_id`, `price`, `description`ni ishlatadi — qolganlari saqlanmaydi. Frontend to'liq formani yuboradi, backend ularni saqlashi uchun `listing_create` funksiyasini to'ldirish kerak.
6. **`/user/confirm/{code}`** access/refresh token qaytarmaydi (kod kommentariyada o'chirilgan) — shu sabab frontend tasdiqlashdan so'ng foydalanuvchini alohida "Kirish" formasiga yo'naltiradi.

Bularning hech biri frontendni ishlatishga xalaqit bermaydi — faqat mos joylarda funksionallik cheklangan bo'ladi, toki backend tuzatilmaguncha.
