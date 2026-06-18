import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cycling-breaks-dev-secret-change-in-production';

export interface JwtPayload {
  userId: number;
  stravaAthleteId: number;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
