'use client';

import { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateGoalThunk } from '@/lib/slices/authSlice';
import { addNotification } from '@/lib/slices/uiSlice';
import { startOfWeek, parseISO } from 'date-fns';
import { Award, Edit3, Check, X } from 'lucide-react';

const goalColors = [
  'var(--color-cyan)',
  'var(--color-orange)',
  'var(--color-green)',
  'var(--color-purple)',
];

export default function GoalsPage() {
  const dispatch     = useAppDispatch();
  const { user }     = useAppSelector(s => s.auth);
  const { sessions } = useAppSelector(s => s.workout);
  const [editing, setEditing]       = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState(0);

  const goalsWithProgress = useMemo(() => {
    if (!user?.goals) return [];
    const weekStart   = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekSessions = sessions.filter(s => parseISO(s.date) >= weekStart);
    const weekCalories = weekSessions.reduce((sum, s) => sum + s.totalCalories, 0);
    const weekWorkouts = weekSessions.length;

    return user.goals.map(goal => {
      let current = goal.current;
      if (goal.type === 'calories') current = weekCalories;
      if (goal.type === 'workouts') current = weekWorkouts;
      const pct = Math.min(100, Math.round((current / goal.target) * 100));
      return { ...goal, current, pct };
    });
  }, [user?.goals, sessions]);

  const handleEdit = (id: string, target: number) => { setEditing(id); setEditTarget(target); };

  const handleSave = async (id: string) => {
    const result = await dispatch(updateGoalThunk({ id, target: editTarget }));
    if (updateGoalThunk.fulfilled.match(result))
      dispatch(addNotification({ type: 'success', message: 'Objectif mis à jour !' }));
    setEditing(null);
  };

  const badges = [
    { label: 'Premier pas', icon: '🥇', desc: '1ère séance enregistrée',    earned: sessions.length >= 1 },
    { label: 'Habitué',     icon: '🔥', desc: '5 séances au total',          earned: sessions.length >= 5 },
    { label: 'Déterminé',  icon: '💪', desc: '10 séances au total',          earned: sessions.length >= 10 },
    { label: 'Brûleur',    icon: '⚡', desc: '5000 kcal brûlées',            earned: sessions.reduce((s, c) => s + c.totalCalories, 0) >= 5000 },
    { label: 'Endurant',   icon: '🏅', desc: "500 min d'entraînement",       earned: sessions.reduce((s, c) => s + c.totalDuration, 0) >= 500 },
    { label: 'Polyvalent', icon: '🌟', desc: "3 types d'exercices",           earned: new Set(sessions.flatMap(s => s.exercises.map(e => e.category))).size >= 3 },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Goals grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {goalsWithProgress.map((goal, i) => {
          const color     = goalColors[i % 4];
          const nextColor = goalColors[(i + 1) % 4];
          return (
            <div
              key={goal.id}
              className="card animate-fade-in"
              style={{
                animationDelay: `${i * 0.1}s`,
                position: 'relative',
                borderColor: goal.pct >= 100 ? `color-mix(in srgb, ${color} 50%, transparent)` : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                    {goal.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {goal.type === 'workouts' || goal.type === 'calories' ? 'cette semaine' : 'objectif total'}
                  </div>
                </div>
                {editing === goal.id ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleSave(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-green)', display: 'flex' }}>
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleEdit(goal.id, goal.target)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    <Edit3 size={14} />
                  </button>
                )}
              </div>

              {/* Progress */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color, fontSize: '20px', fontFamily: 'var(--font-display)' }}>
                    {goal.current.toLocaleString()}
                  </span>
                  {editing === goal.id ? (
                    <input
                      type="number"
                      value={editTarget}
                      onChange={e => setEditTarget(+e.target.value)}
                      style={{ width: '90px', textAlign: 'right', fontSize: '12px', padding: '2px 8px' }}
                    />
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      / {goal.target.toLocaleString()} {goal.unit}
                    </span>
                  )}
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    width: `${goal.pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${nextColor})`,
                    transition: 'width 0.6s ease',
                    boxShadow: `0 0 8px color-mix(in srgb, ${color} 40%, transparent)`,
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{goal.pct}% accompli</span>
                {goal.pct >= 100 ? (
                  <span style={{ color: 'var(--color-green)', fontWeight: 700 }}>✅ Objectif atteint !</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>
                    {(goal.target - goal.current).toLocaleString()} {goal.unit} restants
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Award size={18} color="var(--color-orange)" />
          Badges &amp; Récompenses
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {badges.map(badge => (
            <div
              key={badge.label}
              style={{
                padding: '16px 12px', borderRadius: '12px', textAlign: 'center',
                background: badge.earned ? 'rgba(0,255,136,0.05)' : 'var(--bg-secondary)',
                border: `1px solid ${badge.earned ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
                opacity: badge.earned ? 1 : 0.4, transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px', filter: badge.earned ? 'none' : 'grayscale(1)' }}>
                {badge.icon}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', marginBottom: '4px', color: badge.earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {badge.label}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3 }}>{badge.desc}</div>
              {badge.earned && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-green)', fontWeight: 700 }}>Débloqué ✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
