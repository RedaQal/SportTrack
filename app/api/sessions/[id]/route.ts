import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { userId } = verifyToken(token);

    const session = await prisma.workoutSession.findUnique({
      where: { id: parseInt(params.id) },
      include: { exercises: true },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { userId } = verifyToken(token);

    const session = await prisma.workoutSession.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await prisma.workoutSession.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}