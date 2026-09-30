import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateFitnessPlan } from './src/lib/planGenerator';
import { UserFitnessProfile } from './src/types/fitness';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

// Plan Generation Route (compatible with local development and self-hosted environments)
app.post('/api/generate-plan', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = req.body as UserFitnessProfile;

    if (!profile || !profile.age || !profile.heightCm || !profile.weightKg || !profile.fitnessGoal) {
      res.status(400).json({
        error: 'Incomplete fitness profile received. Please ensure age, height, weight, and fitness goal are provided.'
      });
      return;
    }

    const plan = await generateFitnessPlan(profile);
    res.status(200).json(plan);
  } catch (err: any) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: 'Failed to generate fitness plan: ' + (err?.message || 'Internal error') });
  }
});

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server online on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
