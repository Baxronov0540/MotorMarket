# MotorMarket API Documentation

Bu hujjatda MotorMarket loyihasidagi barcha API endpointlar, ularning URL manzillari va bajaradigan vazifalari keltirilgan.

## 1. Category (Kategoriya)
**Prefix:** `/category`

| URL | Method | Vazifasi (Description) |
|-----|--------|------------------------|
| `/category/catgory` | `GET` | Barcha kategoriyalar ro'yxatini qaytaradi. |
| `/category/category/{category_id}` | `GET` | Berilgan ID bo'yicha bitta maxsus kategoriya ma'lumotlarini qaytaradi. |

---

## 2. Listing (E'lonlar)
**Prefix:** `/listing`

| URL | Method | Vazifasi (Description) |
|-----|--------|------------------------|
| `/listing/create` | `POST` | Yangi e'lon yaratish (joriy foydalanuvchi nomidan). |
| `/listing/list` | `GET` | Barcha e'lonlar ro'yxatini qaytaradi. |
| `/listing/get/{listing_id}` | `GET` | Berilgan ID bo'yicha bitta maxsus e'lon ma'lumotlarini olib keladi. |
| `/listing/delete/{listing_id}` | `DELETE` | Berilgan ID ga ega e'lonni o'chirish (faqat e'lon egasi o'chira oladi). |
| `/listing/user/` | `GET` | Joriy tizimga kirgan foydalanuvchining barcha e'lonlarini qaytaradi. |
| `/listing/filter/` | `GET` | E'lonlarni narxi, subkategoriya, manzil va holatiga ko'ra filterlash va paginatsiya bilan qaytarish. |
| `/listing/media` | `POST` | Maxsus e'lon uchun rasm yoki media fayllarni yuklash. |
| `/listing/count/{category_id}` | `GET` | E'lonlar sonini qaytaradi (ixtiyoriy ravishda kategoriya bo'yicha filtrlanishi mumkin). |

---

## 3. User (Foydalanuvchilar)
**Prefix:** `/user`

| URL | Method | Vazifasi (Description) |
|-----|--------|------------------------|
| `/user/register` | `POST` | Yangi foydalanuvchini ro'yxatdan o'tkazish va emailga tasdiqlash kodini yuborish. |
| `/user/confirm/{code}` | `POST` | Emailga kelgan kod orqali foydalanuvchi akkauntini tasdiqlash va faollashtirish. |
| `/user/login` | `POST` | Foydalanuvchini tizimga kiritish va `access_token` hamda `refresh_token` qaytarish. |
| `/user/refresh` | `POST` | Muddati o'tgan access token'ni refresh token yordamida yangilash. |
| `/user/profile` | `GET` | Joriy tizimdagi foydalanuvchi profil ma'lumotlarini ko'rish. |
| `/user/profile/update` | `PUT` | Joriy foydalanuvchi profilini tahrirlash/yangilash. *(Eslatma: kodda `profile/update` deb yozilgan, URL `/userprofile/update` bo'lishi ham mumkin)* |
| `/user/change/password` | `PUT` | Joriy foydalanuvchi parolini o'zgartirish. |

---

## 4. Saved Listing (Saqlangan E'lonlar)
**Prefix:** `/saved`

| URL | Method | Vazifasi (Description) |
|-----|--------|------------------------|
| `/saved/create` | `POST` | E'lonni "saqlanganlar" (yoqtirganlar) ro'yxatiga qo'shish. |
| `/saved/list` | `GET` | Joriy foydalanuvchi tomonidan saqlangan barcha e'lonlarni ko'rish. |

---

## 5. Conversation (Xabarlar va Suhbatlar)
**Prefix:** `/conversation`

| URL | Method | Vazifasi (Description) |
|-----|--------|------------------------|
| `/conversation/create` | `POST` | Sotuvchi bilan yangi suhbat (chat) boshlash. Ixtiyoriy ravishda maxsus e'lon bilan bog'lash mumkin. |
| `/conversation/list` | `GET` | Joriy foydalanuvchining barcha suhbatlari (sotuvchi yoki xaridor sifatida) ro'yxati. |
| `/conversation/{conversation_id}` | `GET` | Maxsus suhbatni va uning barcha xabarlarini batafsil ko'rish (faqat suhbat ishtirokchilariga ruxsat). Yangi kelgan xabarlarni "o'qilgan" deb belgilaydi. |
| `/conversation/{conversation_id}` | `DELETE` | Suhbatni to'liq o'chirib tashlash. |
| `/conversation/{conversation_id}/message` | `POST` | Suhbatga yangi xabar yuborish. |
| `/conversation/{conversation_id}/messages` | `GET` | Suhbatdagi xabarlarni paginatsiya orqali olish va kelgan xabarlarni "o'qilgan" deb belgilash. |
| `/conversation/{conversation_id}/message/{message_id}` | `DELETE` | Suhbatdagi o'ziga tegishli bo'lgan xabarni o'chirish. |
| `/conversation/{conversation_id}/message/{message_id}/read`| `PATCH` | Maxsus bitta xabarni qo'lda "o'qilgan" (is_read=True) deb belgilash. |
