import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { userId } = verifyToken(token);

    const now = new Date();

    // Week start (Monday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    // Month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [weekSessions, monthSessions, allSessions] = await Promise.all([
      prisma.workoutSession.findMany({
        where: { userId, date: { gte: weekStart } },
        include: { exercises: true },
      }),
      prisma.workoutSession.findMany({
        where: { userId, date: { gte: monthStart } },
        include: { exercises: true },
      }),
      prisma.workoutSession.findMany({
        where: { userId },
        include: { exercises: true },
        orderBy: { date: 'desc' },
      }),
    ]);

    const sum = (arr: typeof allSessions, key: 'totalCalories' | 'totalDuration') =>
      arr.reduce((s, x) => s + x[key], 0);

    // Category breakdown
    const categoryCalories: Record<string, number> = {};
    allSessions.forEach(s =>
      s.exercises.forEach(e => {
        categoryCalories[e.category] = (categoryCalories[e.category] || 0) + e.calories;
      })
    );

    return NextResponse.json({
      week: {
        sessions: weekSessions.length,
        calories: sum(weekSessions, 'totalCalories'),
        duration: sum(weekSessions, 'totalDuration'),
      },
      month: {
        sessions: monthSessions.length,
        calories: sum(monthSessions, 'totalCalories'),
        duration: sum(monthSessions, 'totalDuration'),
      },
      all: {
        sessions: allSessions.length,
        calories: sum(allSessions, 'totalCalories'),
        duration: sum(allSessions, 'totalDuration'),
        avgDuration: allSessions.length
          ? Math.round(sum(allSessions, 'totalDuration') / allSessions.length)
          : 0,
        avgMood: allSessions.length
          ? +(allSessions.reduce((s, x) => s + x.mood, 0) / allSessions.length).toFixed(1)
          : 0,
      },
      categoryCalories,
      recentSessions: allSessions.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}