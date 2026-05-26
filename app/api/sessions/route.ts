import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

const exerciseSchema = z.object({
  exerciseId:   z.number(),
  exerciseName: z.string(),
  category:     z.enum(['cardio', 'strength', 'flexibility', 'hiit', 'sports']),
  duration:     z.number(),
  calories:     z.number(),
  sets:         z.number().optional(),
  reps:         z.number().optional(),
  weight:       z.number().optional(),
  distance:     z.number().optional(),
});

const sessionSchema = z.object({
  date:      z.string(),
  mood:      z.number().min(1).max(5),
  notes:     z.string().optional(),
  exercises: z.array(exerciseSchema).min(1),
});

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { userId } = verifyToken(token);

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        date: { gte: since },
      },
      include: { exercises: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(sessions);
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
    const data = sessionSchema.parse(body);

    // Get user weight for accurate calorie calculation
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userWeight = user?.weight ?? 75;

    // Recalculate calories using MET formula: (MET × weight × 3.5) / 200
    const MET: Record<string, number> = {
      cardio: 8, strength: 5, flexibility: 3, hiit: 12, sports: 9,
    };

    const exercises = data.exercises.map(ex => {
      const met = MET[ex.category] ?? 7;
      const calories = Math.round((met * userWeight * 3.5 * ex.duration) / 200);
      return { ...ex, calories };
    });

    const totalCalories = exercises.reduce((s, e) => s + e.calories, 0);
    const totalDuration = exercises.reduce((s, e) => s + e.duration, 0);

    const session = await prisma.workoutSession.create({
      data: {
        userId,
        date: new Date(data.date),
        mood: data.mood,
        notes: data.notes,
        totalCalories,
        totalDuration,
        exercises: {
          create: exercises,
        },
      },
      include: { exercises: true },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}