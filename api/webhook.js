const BOT_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const FREE_LESSONS = [
    { n: 1, title: 'Підлаштування під клієнта. Активне слухання', url: 'https://youtu.be/lcvBUbh8y9g' },
    { n: 2, title: 'Перші 5 хвилин консультації', url: 'https://youtu.be/zz2pAT7aYcg' },
    { n: 3, title: 'Питання, які виявляють сфери роботи', url: 'https://youtu.be/eh2KWi4tLeg' },
    { n: 4, title: 'Невербальні реакції клієнта', url: 'https://youtu.be/g62O_GiOdlo' },
];

async function send(chat_id, text, extra = {}) {
    await fetch(`${BOT_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text, parse_mode: 'Markdown', ...extra }),
    });
}

async function answerCallback(callback_query_id, text = '') {
    await fetch(`${BOT_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id, text }),
    });
}

const PROGRAM = [
    "Підлаштування під клієнта. Підтримуюче та активне слухання",
    "Перші 5 хвилин консультації: Психологічний контракт",
    "Питання, які виявляють сфери роботи",
    "Невербальні реакції клієнта",
    "Додаткова інформація про клієнта: вік, ролі, типи",
    "Рівні розвитку особистості",
    "Ієрархія когнітивних механізмів, АВС-аналіз",
    "«Кодекс невротика», стратегії обробки інформації",
    "Другий план, саморефлексія",
    "Теорія установок. Дезадаптивні установки",
    "Розлади особистості: Кластери А, В та С",
    "Умови поставлення якісного результату",
    "Сократівські питання",
    "Основи коучінгової роботи",
    "Рівні роботи та показання",
    "Когнітивні помилки та їх корекція",
    "Корекція установок",
    "Сугестивні речення та метафори",
    "Вправи та домашні завдання",
    "Консультування депресивного розладу",
    "Консультування тривожного розладу та панічних атак",
    "Консультування ОКР",
    "Консультування ПТСР",
    "Консультування розладів харчової поведінки",
    "Консультування осіб із залежностями",
    "Консультування із приводу горя та втрати",
    "Проблеми сексуальної дисфункції",
    "Робота із сімейними парами",
    "Робота із дітьми",
    "Робота із болем. Техніки знеболення",
    "28 годин відпрацювання та рольові вправи",
];

function mainMenu() {
    return {
        inline_keyboard: [
            [{ text: '🎬 Перші 4 безкоштовні уроки', callback_data: 'free_lessons' }],
            [{ text: '📋 Програма курсу (31 модуль)', callback_data: 'program'      }],
            [{ text: '💬 Задати питання тренеру',    callback_data: 'ask_trainer'  }],
            [{ text: '📝 Розказати про себе',         callback_data: 'about_me'    }],
        ],
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const update = req.body ?? {};

    // ── Callback query (inline button press) ────────────────────────────────
    if (update.callback_query) {
        const { id, data, from, message } = update.callback_query;
        const chatId = message.chat.id;

        await answerCallback(id);

        if (data === 'program') {
            const list = PROGRAM.map((t, i) => `${String(i + 1).padStart(2, '0')}. ${t}`).join('\n');
            await send(chatId,
                `📋 *Програма курсу — 31 модуль:*\n\n${list}\n\n` +
                `Хочете дізнатися більше або записатися? 👇`,
                { reply_markup: mainMenu() }
            );
        }

        if (data === 'free_lessons') {
            const lessonsText = FREE_LESSONS
                .map(l => `*${l.n}.* [${l.title}](${l.url})`)
                .join('\n');
            await send(chatId,
                `🎬 *Перші 4 безкоштовні уроки курсу:*\n\n${lessonsText}\n\n` +
                `Якщо виникнуть питання — натисніть кнопку нижче 👇`,
                { reply_markup: mainMenu() }
            );
        }

        if (data === 'ask_trainer') {
            await send(chatId,
                `💬 *Задати питання тренеру*\n\n` +
                `Напишіть ваше запитання наступним повідомленням — і ми передамо його тренеру. ` +
                `Відповідь надійде особисто вам.`,
                { reply_markup: { force_reply: true, input_field_placeholder: 'Ваше запитання...' } }
            );
        }

        if (data === 'about_me') {
            await send(chatId,
                `📝 *Розкажіть про себе*\n\n` +
                `Щоб тренер міг підготуватися до розмови з вами, надішліть коротку інформацію ` +
                `у довільній формі або за шаблоном:\n\n` +
                `▸ *Ім'я:*\n` +
                `▸ *Вік:*\n` +
                `▸ *Освіта / досвід у психології:*\n` +
                `▸ *Чому хочете пройти курс:*\n` +
                `▸ *Очікування від навчання:*`,
                { reply_markup: { force_reply: true, input_field_placeholder: 'Ваша відповідь...' } }
            );
        }

        return res.status(200).end();
    }

    // ── Regular message ──────────────────────────────────────────────────────
    const message = update.message;
    if (!message?.text) return res.status(200).end();

    const chatId = message.chat.id;
    const text   = message.text.trim();
    const name   = message.from?.first_name ?? 'Користувач';

    // /start
    if (text.startsWith('/start')) {
        await send(chatId,
            `👋 *Привіт, ${name}!*\n\n` +
            `Вітаємо в боті *Школи психологічного консультування* — авторського 6-місячного курсу ` +
            `від теорії до впевненої приватної практики.\n\n` +
            `Оберіть, що вас цікавить 👇`,
            { reply_markup: mainMenu() }
        );
        return res.status(200).end();
    }

    // /chatid
    if (text.startsWith('/chatid')) {
        await send(chatId, `Ваш Chat ID: \`${chatId}\``);
        return res.status(200).end();
    }

    // Any other message — forward to admin group with context
    if (ADMIN_CHAT_ID) {
        const username = message.from?.username ? `@${message.from.username}` : '—';
        const forwardText =
            `📩 *Повідомлення від користувача*\n\n` +
            `👤 ${name} (${username})\n` +
            `🆔 chat_id: \`${chatId}\`\n\n` +
            `💬 ${text}`;
        await send(ADMIN_CHAT_ID, forwardText);

        await send(chatId,
            `✅ Ваше повідомлення отримано! Тренер відповість вам найближчим часом.\n\n` +
            `Поки що ви можете переглянути безкоштовні уроки 👇`,
            { reply_markup: mainMenu() }
        );
    }

    return res.status(200).end();
}
