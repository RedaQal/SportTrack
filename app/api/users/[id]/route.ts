import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  name:   z.string().min(2).optional(),
  age:    z.number().min(10).max(120).optional(),
  weight: z.number().min(20).max(300).optional(),
  height: z.number().min(100).max(250).optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { userId } = verifyToken(token);
    if (userId !== parseInt(params.id)) {
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { userId } = verifyToken(token);
    if (userId !== parseInt(params.id)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: { goals: true },
    });

    const { password: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}