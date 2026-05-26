import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET = process.env.JWT_SECRET!;

export const hashPassword = (password: string) =>
  bcrypt.hash(password, 12);

export const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const signToken = (payload: { userId: number; email: string }) =>
  jwt.sign(payload, SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
  jwt.verify(token, SECRET) as { userId: number; email: string };