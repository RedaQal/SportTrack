import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  name:           z.string().min(2).optional(),
  weight:         z.number().min(20).max(300).optional(),
  height:         z.number().min(100).max(250).optional(),
  birthday:       z.string().optional(),
  onboardingDone: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { userId } = verifyToken(token);
    if (userId !== parseInt(id)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { goals: true },
    });

    if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

    const { password: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { userId } = verifyToken(token);
    if (userId !== parseInt(id)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    // Convert birthday string → Date for Prisma
    const updateData: any = { ...data };
    if (data.birthday) {
      updateData.birthday = new Date(data.birthday);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { goals: true },
    });

    const { password: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}