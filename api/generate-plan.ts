import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateFitnessPlan } from '../src/lib/planGenerator';
import { UserFitnessProfile } from '../src/types/fitness';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for Vercel deployment & preview URLs
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const rawBody = req.body;
    const profile = (typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody) as UserFitnessProfile;

    if (!profile || !profile.age || !profile.heightCm || !profile.weightKg || !profile.fitnessGoal) {
      res.status(400).json({
        error: 'Incomplete fitness profile received. Please ensure age, height, weight, and fitness goal are provided.'
      });
      return;
    }

    const plan = await generateFitnessPlan(profile);
    res.status(200).json(plan);
  } catch (err: any) {
    console.error('Vercel API plan generation error:', err);
    res.status(500).json({
      error: 'Failed to generate fitness plan: ' + (err?.message || 'Internal server error')
    });
  }
}
