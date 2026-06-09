import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET = process.env.JWT_SECRET!;

export const hashPassword = (password: string) =>
  bcrypt.hash(password, 12);

export const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const signToken = (payload: { userId: number; email: string }) =>
  jwt.sign(payload, SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string): { userId: number; email: string } => {
  const decoded = jwt.verify(token, SECRET) as { userId: number; email: string };
  return {
    userId: Number(decoded.userId),  // ← force number
    email: decoded.email,
  };
};

export const getTokenFromRequest = (req: Request): string | null => {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
};