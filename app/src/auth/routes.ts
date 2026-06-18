import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { isStravaConfigured, getStravaAuthUrl, exchangeCodeForToken, setStravaCredentials, getStravaEnvRedirectUri } from './strava';
import { signToken } from './jwt';
import { upsertUser } from './db';
import { authMiddleware } from './middleware';

const stateStore = new Map<string, { state: string; expiresAt: number }>();

const STATE_TTL = 10 * 60 * 1000;

function cleanStateStore() {
  const now = Date.now();
  for (const [key, entry] of stateStore) {
    if (entry.expiresAt < now) stateStore.delete(key);
  }
}

function storeState(state: string) {
  cleanStateStore();
  const key = crypto.randomBytes(8).toString('hex');
  stateStore.set(key, { state, expiresAt: Date.now() + STATE_TTL });
  return key;
}

function verifyState(key: string, state: string): boolean {
  const entry = stateStore.get(key);
  if (!entry) return false;
  stateStore.delete(key);
  return entry.state === state;
}

export function createAuthRouter(): Router {
  const router = Router();

  router.get('/login', (req: Request, res: Response) => {
    if (!isStravaConfigured()) {
      return res.status(500).json({ error: 'Strava ist nicht konfiguriert.' });
    }
    const state = crypto.randomBytes(16).toString('hex');
    const key = storeState(state);
    const envRedirect = process.env.STRAVA_REDIRECT_URI || '';
    console.log('STRAVA_REDIRECT_URI env:', process.env.STRAVA_REDIRECT_URI);
    console.log('STRAVA_REDIRECT_URI from DB:', getStravaEnvRedirectUri());
    const redirectUri = envRedirect || getStravaEnvRedirectUri() || `${req.protocol}://${req.get('host')}/api/auth/strava/callback`;
    console.log('Using redirect URI:', redirectUri);
    const url = getStravaAuthUrl(state, key, redirectUri);
    res.json({ url });
  });

  router.get('/status', (_req: Request, res: Response) => {
    return res.json({ configured: isStravaConfigured() });
  });

  router.post('/strava-config', async (req: Request, res: Response) => {
    const { clientId, clientSecret, redirectUri } = req.body;
    if (!isStravaConfigured() && (!clientId || !clientSecret)) {
      return res.status(400).json({ error: 'Client ID und Client Secret sind erforderlich.' });
    }
    try {
      await setStravaCredentials(clientId, clientSecret, redirectUri);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Fehler beim Speichern der Konfiguration.' });
    }
  });

  router.get('/strava/callback', async (req: Request, res: Response) => {
    const { code, state, sk } = req.query;

    console.log('Callback received:', { code: typeof code, state, sk });

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Fehlender OAuth-Code.');
    }

    if (!state || typeof state !== 'string' || !sk || typeof sk !== 'string' || !verifyState(sk, state)) {
      console.log('State mismatch:', { state, sk });
      return res.status(403).send('Ungültiger State-Parameter.');
    }

    try {
      const tokenData = await exchangeCodeForToken(code);

      const user = await upsertUser(
        tokenData.athlete.id,
        tokenData.athlete.firstname,
        tokenData.athlete.lastname,
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_at
      );

      const jwtToken = signToken({
        userId: user.id,
        stravaAthleteId: user.strava_athlete_id,
      });

      res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect('/');
    } catch (err: any) {
      console.error('Strava callback error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      return res.redirect(`/?loginError=${encodeURIComponent(errorMsg)}`);
    }
  });

  router.get('/me', authMiddleware, (req: Request, res: Response) => {
    return res.json({
      authenticated: true,
      user: req.user,
    });
  });

  router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie('token');
    return res.json({ success: true });
  });

  return router;
}
