export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contact, question } = req.body;

  if (!contact || !question) {
    return res.status(400).json({ error: "Усі поля обов'язкові" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing Telegram env vars');
    return res.status(500).json({ error: 'Серверна помилка конфігурації' });
  }

  const text = [
    '❓ Питання тренеру (з сайту)',
    `📞 Контакт: ${contact}`,
    `💬 Питання: ${question}`,
    `🕐 ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}`
  ].join('\n');

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

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fetch to Telegram failed:', err);
    return res.status(500).json({ error: 'Мережева помилка' });
  }
}
