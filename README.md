# Школа психологічного консультування — Landing Page

Лендінг авторського 6-місячного курсу психологічного консультування з Telegram-ботом для збору лідів та комунікації з тренером.

---

## Стек

- **Frontend:** Static HTML + [Tailwind CSS CDN](https://cdn.tailwindcss.com) — без build step
- **Backend:** Vercel Serverless Functions (Node 20.x)
- **Повідомлення:** Telegram Bot API
- **Деплой:** [Vercel](https://vercel.com)
- **Шрифт:** Inter (Google Fonts)
- **Кольорова схема:** чорний `#1a1a1a` + жовтий `#FFEF00`

---

## Структура файлів

```
PsychoSchool/
├── public/
│   ├── index.html          ← Головний лендінг (всі секції)
│   ├── offer.html          ← Договір публічної оферти
│   ├── privacy.html        ← Політика конфіденційності
│   ├── hero.png            ← Зображення в Hero-секції
│   ├── photo.jpg           ← Фото автора (Hero + About)
│   ├── Certificate-1.png   ← Сертифікат: успішне навчання і сертифікація
│   ├── Certificate-2.png   ← Сертифікат: прослуховування
│   ├── logo.svg            ← Логотип ШПК
│   ├── icon.svg            ← Favicon
│   └── План.pdf            ← Програма курсу для скачування
├── api/
│   ├── submit.js           ← POST /api/submit — форма реєстрації → Telegram
│   └── webhook.js          ← POST /api/webhook — Telegram Bot webhook
├── .env.local              ← Локальні змінні середовища (не в git)
├── vercel.json             ← outputDirectory: "public"
├── package.json            ← engines: node 20.x
└── dev.bat                 ← Запуск локального dev-сервера (Windows)
```

---

## Секції лендінгу (`index.html`)

| Секція | Опис |
|--------|------|
| **Header** | Навігація з мобільним hamburger-меню |
| **Hero** | Заголовок, підзаголовок, CTA-кнопки, фото автора |
| **Stats** | Цифрові показники курсу |
| **About Author** | Фото, ім'я, біо, чипи з регаліями |
| **Certificates** | Сертифікати з лайтбоксом |
| **AI Agent** | Секція про AI-асистента курсу |
| **Program** | 31 модуль + кнопка скачування PDF |
| **Pricing** | Тарифи |
| **FAQ** | Акордеон з питаннями |
| **Registration Form** | Форма (ім'я, телефон, Telegram) → `POST /api/submit` |
| **Footer** | Посилання на оферту та політику конфіденційності |

---

## API

### `POST /api/submit` — Форма реєстрації

Приймає заявку з лендінгу та надсилає повідомлення адміністратору в Telegram.

**Request body (JSON):**
```json
{
  "name": "Ім'я користувача",
  "phone": "+380...",
  "telegram": "@username"
}
```

**Відповіді:**
- `200 { success: true }` — заявка надіслана
- `400` — не всі поля заповнені
- `405` — не POST
- `500/502` — помилка Telegram API або конфігурації

---

### `POST /api/webhook` — Telegram Bot

Обробляє вхідні оновлення від Telegram через webhook.

**Команди та дії:**

| Тригер | Поведінка |
|--------|-----------|
| `/start` | Привітальне повідомлення + головне меню |
| `/start lessons` | Deep link → одразу 4 безкоштовні уроки |
| `/start program` | Deep link → програма курсу (31 модуль) |
| `/chatid` | Повертає Chat ID поточного чату |
| Кнопка «Перші 4 безкоштовні уроки» | Посилання на YouTube-уроки |
| Кнопка «Програма курсу (31 модуль)» | Повний список модулів |
| Кнопка «Задати питання тренеру» | Force reply → форвардить адміну |
| Кнопка «Розказати про себе» | Force reply шаблон анкети |
| Будь-яке повідомлення | Форвард адміну з ID відправника |
| Reply адміна на форвард | Відповідь надсилається назад користувачу |

**Безкоштовні уроки (YouTube):**
1. Підлаштування під клієнта. Активне слухання
2. Перші 5 хвилин консультації
3. Питання, які виявляють сфери роботи
4. Невербальні реакції клієнта

---

## Змінні середовища

| Змінна | Опис |
|--------|------|
| `TELEGRAM_BOT_TOKEN` | Токен бота від @BotFather |
| `TELEGRAM_CHAT_ID` | ID чату/групи адміністратора для отримання заявок |

**Локально:** файл `.env.local` (не комітити!)

**На Vercel:** Settings → Environment Variables → додати обидві змінні.

### Як отримати CHAT_ID

1. Напишіть боту будь-яке повідомлення
2. Відкрийте `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Знайдіть `message.chat.id` у відповіді
4. Або надішліть боту `/chatid`

### Як зареєструвати webhook

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.vercel.app/api/webhook"}'
```

---

## Локальна розробка

**Windows (подвійний клік):**
```
dev.bat
```

**Або вручну:**
```bash
npm install -g vercel   # один раз
vercel dev              # запускає на http://localhost:3000
```

Vercel CLI автоматично підтягне `.env.local` і проксує `/api/*` до serverless-функцій.

---

## Деплой

```bash
vercel --prod
```

Або через Git-інтеграцію: push в `main` → автодеплой на Vercel.

---

## Placeholders (потрібно заповнити)

У [public/index.html](public/index.html) в секції `#author`:

- `[Ім'я Прізвище]` — ім'я та прізвище автора курсу
- `[ТЕКСТ БІО]` — 2–3 речення про автора
- `[X]+ років практики` — кількість років
- Чипи КПТ-практик, Супервізор — підтвердити точність формулювань
