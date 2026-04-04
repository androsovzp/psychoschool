import codesRaw from './promocodes.json' assert { type: 'json' };

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false });
  }

  const { code } = req.body ?? {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false });
  }

  try {
    const normalizedInput = code.toUpperCase().trim();
    
    const codes = {};
    Object.keys(codesRaw).forEach(k => {
      codes[k.toUpperCase().trim()] = codesRaw[k];
    });
    
    const entry = codes[normalizedInput];

    if (entry && entry.active) {
      return res.status(200).json({ valid: true, discount: entry.discount });
    }

    return res.status(200).json({ valid: false });
  } catch (err) {
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
}
