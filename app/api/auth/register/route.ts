import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email déjà utilisé' },
        { status: 409 }
      );
    }

    const password = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
        goals: {
          create: [
            { type: 'workouts', label: 'Séances / semaine', target: 4, current: 0, unit: 'séances' },
            { type: 'calories', label: 'Calories / semaine', target: 2000, current: 0, unit: 'kcal' },
            { type: 'weight',   label: 'Objectif poids',    target: 75,   current: 0, unit: 'kg' },
          ],
        },
      },
      include: { goals: true },
    });

    const token = signToken({ userId: user.id, email: user.email });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ token, user: userWithoutPassword }, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}