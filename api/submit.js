import { readFileSync } from 'fs';
import { join } from 'path';

function getPromoEntry(code) {
  if (!code) return null;
  try {
    const raw = readFileSync(join(process.cwd(), 'promocodes.json'), 'utf8');
    const codes = JSON.parse(raw);
    const entry = codes[code.toLowerCase().trim()];
    return entry && entry.active ? entry : null;
  } catch {
    return null;
  }
}

async function logToSheets(payload) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Sheets log failed (non-critical):', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, telegram, source, promo } = req.body;

  if (!name || !phone || !telegram) {
    return res.status(400).json({ error: "Усі поля обов'язкові" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing Telegram env vars');
    return res.status(500).json({ error: 'Серверна помилка конфігурації' });
  }

  const sourceLabel = source === 'installment' ? '💳 Оплата частинами' : '📋 Повна оплата';
  const promoEntry = getPromoEntry(promo);
  const promoLine = promoEntry
    ? `🎫 Промокод: ${promo.trim()} (реферер: ${promoEntry.referrer}, знижка ${promoEntry.discount.toLocaleString('uk-UA')} грн)`
    : null;

  const textParts = [
    '🎓 Нова заявка на курс',
    sourceLabel,
    promoLine,
    `👤 Ім'я: ${name}`,
    `📞 Телефон: ${phone}`,
    `✈️ Telegram: ${telegram}`,
    `🕐 ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}`
  ].filter(Boolean);
  const text = textParts.join('\n');

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
      }
    );

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error('Telegram API error:', tgData);
      return res.status(502).json({ error: 'Помилка відправки повідомлення' });
    }

    await logToSheets({ type: 'registration', name, phone, telegram, source: source || 'full' });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fetch to Telegram failed:', err);
    return res.status(500).json({ error: 'Мережева помилка' });
  }
}
