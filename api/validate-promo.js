import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false });
  }

  const { code } = req.body ?? {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false });
  }

  try {
    const raw = readFileSync(join(process.cwd(), 'promocodes.json'), 'utf8');
    const codes = JSON.parse(raw);
    const entry = codes[code.toUpperCase().trim()];

    if (entry && entry.active) {
      // Return discount only — referrer stays server-side
      return res.status(200).json({ valid: true, discount: entry.discount });
    }

    return res.status(200).json({ valid: false });
  } catch (err) {
    console.error('Promo validation error:', err);
    return res.status(200).json({ valid: false });
  }
}
