import codesRaw from '../promocodes.json' assert { type: 'json' };

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
    console.log(`[PROMO] Input: "${code}" -> Normalized: "${normalizedInput}"`);
    
    // Normalize all keys from JSON to be safe
    const codes = {};
    Object.keys(codesRaw).forEach(k => {
      codes[k.toUpperCase().trim()] = codesRaw[k];
    });
    
    console.log('[PROMO] Available normalized keys:', Object.keys(codes));
    
    const entry = codes[normalizedInput];
    console.log('[PROMO] Result for', normalizedInput, ':', entry ? 'FOUND' : 'NOT FOUND');

    if (entry && entry.active) {
      return res.status(200).json({ valid: true, discount: entry.discount });
    }

    return res.status(200).json({ valid: false, reason: 'invalid_or_inactive' });
  } catch (err) {
    console.error('PROMO_CRASH:', err);
    return res.status(500).json({ valid: false, error: err.message });
  }
}
