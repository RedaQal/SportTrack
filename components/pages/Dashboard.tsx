'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Flame, Clock, Dumbbell, TrendingUp, Activity, Zap } from 'lucide-react';

const COLORS = {
  cardio: '#00e5ff',
  strength: '#7c3aed',
  flexibility: '#00ff88',
  hiit: '#ff6b35',
  sports: '#ec4899',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value} {p.name === 'Calories' ? 'kcal' : p.name === 'Durée' ? 'min' : ''}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAppSelector(s => s.auth);
  const { sessions } = useAppSelector(s => s.workout);

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekSessions = sessions.filter(s => parseISO(s.date) >= weekStart);
    const monthSessions = sessions.filter(s => parseISO(s.date) >= subDays(now, 30));
    return {
      weekCalories: weekSessions.reduce((sum, s) => sum + s.totalCalories, 0),
      weekDuration: weekSessions.reduce((sum, s) => sum + s.totalDuration, 0),
      weekWorkouts: weekSessions.length,
      monthWorkouts: monthSessions.length,
      totalCalories: sessions.reduce((sum, s) => sum + s.totalCalories, 0),
      avgDuration: sessions.length
        ? Math.round(sessions.reduce((sum, s) => sum + s.totalDuration, 0) / sessions.length)
        : 0,
    };
  }, [sessions]);

  const weeklyData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    return days.map(day => {
      const ds = sessions.filter(s => isSameDay(parseISO(s.date), day));
      return {
        day: format(day, 'EEE', { locale: fr }),
        Calories: ds.reduce((sum, s) => sum + s.totalCalories, 0),
        Durée: ds.reduce((sum, s) => sum + s.totalDuration, 0),
        séances: ds.length,
      };
    });
  }, [sessions]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => s.exercises.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + e.calories;
    }));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  const recentSessions = sessions.slice(0, 4);

  const statCards = [
    { label: 'Calories cette semaine', value: stats.weekCalories.toLocaleString(), unit: 'kcal', icon: Flame, color: 'var(--color-orange)', bg: 'rgba(255,107,53,0.1)' },
    { label: 'Durée cette semaine', value: stats.weekDuration, unit: 'min', icon: Clock, color: 'var(--color-cyan)', bg: 'rgba(0,229,255,0.1)' },
    { label: 'Séances cette semaine', value: stats.weekWorkouts, unit: 'séances', icon: Dumbbell, color: 'var(--color-green)', bg: 'rgba(0,255,136,0.1)' },
    { label: 'Durée moyenne', value: stats.avgDuration, unit: 'min/séance', icon: Activity, color: 'var(--color-purple)', bg: 'rgba(124,58,237,0.1)' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Welcome */}
      <div className="animate-fade-in" style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', marginBottom: '4px' }}>
          {greeting}, {user?.name?.split(' ')[0]}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Voici votre résumé sportif. Continuez sur votre lancée !
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {statCards.map(({ label, value, unit, icon: Icon, color, bg }, i) => (
          <div key={label} className="card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              <TrendingUp size={14} color="var(--color-green)" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color, lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{unit}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: '16px', marginBottom: '28px' }}>

        {/* Bar chart */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="var(--color-cyan)" />
            Activité — 7 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Calories" fill="var(--color-cyan)" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="Durée" fill="var(--color-purple)" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            {[['var(--color-cyan)', 'Calories'], ['var(--color-purple)', 'Durée (min)']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '2px', background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
            Répartition par type
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={160} height={160}>
              <Pie data={categoryData} cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {categoryData.map(entry => (
                  <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || '#666'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v} kcal`, '']} />
            </PieChart>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {categoryData.map(({ name, value }) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[name as keyof typeof COLORS] || '#666' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{value} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
          Séances récentes
        </h3>
        {recentSessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '24px' }}>
            Aucune séance enregistrée. Commencez votre premier entraînement !
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentSessions.map(session => (
              <div
                key={session.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(124,58,237,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>
                  {session.exercises[0]?.exerciseName.includes('Course') ? '🏃'
                    : session.exercises[0]?.exerciseName.includes('Vélo') ? '🚴'
                      : session.exercises[0]?.category === 'strength' ? '🏋️'
                        : session.exercises[0]?.category === 'hiit' ? '⚡' : '💪'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                    {session.exercises.map(e => e.exerciseName).join(', ')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {format(parseISO(session.date), 'd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-orange)' }}>
                    {session.totalCalories} kcal
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{session.totalDuration} min</div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `rgba(0,255,136,${session.mood / 5})`,
                  border: '1px solid rgba(0,255,136,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', flexShrink: 0,
                }}>
                  {['😴', '😐', '🙂', '😊', '🔥'][session.mood - 1]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
