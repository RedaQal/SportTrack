import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { userId } = verifyToken(token);

    const body = await req.json();
    const goal = await prisma.goal.findUnique({ where: { id: parseInt(id) } });

    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const updated = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { userId } = verifyToken(token);

    const goal = await prisma.goal.findUnique({ where: { id: parseInt(id) } });
    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await prisma.goal.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}