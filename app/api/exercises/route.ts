import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    verifyToken(token);

    const exercises = await prisma.exercise.findMany({
      orderBy: { category: 'asc' },
    });

    return NextResponse.json(exercises);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}