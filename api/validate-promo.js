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
    const filePath = join(process.cwd(), 'promocodes.json');
    console.log('Validating code:', code, 'Normalized:', code.toUpperCase().trim());
    console.log('Looking for file at:', filePath);
    
    const raw = readFileSync(filePath, 'utf8');
    const codes = JSON.parse(raw);
    console.log('Available codes:', Object.keys(codes));
    
    const entry = codes[code.toUpperCase().trim()];
    console.log('Found entry:', entry);

    if (entry && entry.active) {
      return res.status(200).json({ valid: true, discount: entry.discount });
    }

    return res.status(200).json({ valid: false });
  } catch (err) {
    console.error('PROMO_ERROR:', err.message);
    if (err.code === 'ENOENT') {
      console.error('File promocodes.json NOT FOUND at', join(process.cwd(), 'promocodes.json'));
    }
    return res.status(200).json({ valid: false, error: 'Internal server error during validation' });
  }
}
