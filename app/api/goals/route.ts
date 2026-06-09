import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  type:    z.enum(['weight', 'calories', 'workouts', 'distance', 'custom']),
  label:   z.string(),
  target:  z.number(),
  current: z.number().default(0),
  unit:    z.string(),
  deadline: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { userId } = verifyToken(token);

    const goals = await prisma.goal.findMany({ where: { userId } });
    return NextResponse.json(goals);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { userId } = verifyToken(token);

    const body = await req.json();
    const data = schema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        ...data,
        userId,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}