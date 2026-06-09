'use client';

import { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { deleteSessionThunk } from '@/lib/slices/workoutSlice';
import { addNotification } from '@/lib/slices/uiSlice';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp, Calendar, Flame, Clock, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const categoryColors: Record<string, string> = {
  cardio:      'var(--color-cyan)',
  strength:    'var(--color-purple)',
  flexibility: 'var(--color-green)',
  hiit:        'var(--color-orange)',
  sports:      'var(--color-pink)',
};

export default function HistoryPage() {
  const dispatch     = useAppDispatch();
  const { sessions } = useAppSelector(s => s.workout);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter]     = useState('all');
  const [range, setRange]       = useState(30);

  const filtered = useMemo(() => {
    const since = subDays(new Date(), range);
    return sessions.filter(s => {
      const d = new Date(s.date);
      if (d < since) return false;
      if (filter === 'all') return true;
      return s.exercises.some(e => e.category === filter);
    });
  }, [sessions, range, filter]);

  const trendData = useMemo(() => {
    const days: Record<string, { calories: number; duration: number }> = {};
    filtered.forEach(s => {
      const k = format(new Date(s.date), 'yyyy-MM-dd');
      if (!days[k]) days[k] = { calories: 0, duration: 0 };
      days[k].calories += s.totalCalories;
      days[k].duration += s.totalDuration;
    });
    return Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date:     format(new Date(date), 'd MMM', { locale: fr }),
        Calories: v.calories,
        Durée:    v.duration,
      }));
  }, [filtered]);

  const handleDelete = async (id: number) => {
    await dispatch(deleteSessionThunk(String(id)));
    dispatch(addNotification({ type: 'info', message: 'Séance supprimée' }));
  };

  /* ── filter pill helper ── */
  const pill = (label: string, key: string, active: boolean, color?: string, type: 'range' | 'filter' = 'filter') => {
    const c = color || 'var(--color-cyan)';
    return (
      <button
        key={key}
        onClick={() => type === 'range' ? setRange(+key) : setFilter(key)}
        style={{
          padding: '5px 12px', borderRadius: '16px', fontSize: '12px',
          fontFamily: 'var(--font-display)', fontWeight: 600, cursor: 'pointer',
          border:     `1px solid ${active ? c : 'var(--border)'}`,
          background: active ? `color-mix(in srgb, ${c} 15%, transparent)` : 'transparent',
          color:      active ? c : 'var(--text-muted)',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Area chart */}
      {trendData.length > 1 && (
        <div className="card animate-fade-in" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            Évolution des performances
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-cyan)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Area type="monotone" dataKey="Calories" stroke="var(--color-cyan)" fill="url(#colorCal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <Filter size={16} color="var(--text-muted)" />
        {[7, 30, 90].map(r => pill(`${r}j`, String(r), range === r, undefined, 'range'))}
        {['all', 'cardio', 'strength', 'hiit', 'sports', 'flexibility'].map(cat =>
          pill(cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1), cat, filter === cat, categoryColors[cat])
        )}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} séance{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Session list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Aucune séance trouvée pour cette période.
          </div>
        )}

        {filtered.map(session => (
          <div
            key={session.id}
            className="animate-fade-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s, background-color 0.3s' }}
          >
            {/* Row header */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === session.id ? null : session.id)}
            >
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {session.exercises[0]?.exerciseName.includes('Course') ? '🏃'
                  : session.exercises[0]?.category === 'strength' ? '🏋️'
                  : session.exercises[0]?.category === 'hiit'     ? '⚡'
                  : session.exercises[0]?.category === 'sports'   ? '⚽' : '💪'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                  {session.exercises.map(e => e.exerciseName).join(' + ')}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={11} /> {format(new Date(session.date), 'd MMMM yyyy', { locale: fr })}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={11} /> {session.totalCalories} kcal
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {session.totalDuration} min
                  </span>
                  <span style={{ fontSize: '14px' }}>{'😴😐🙂😊🔥'[session.mood - 1]}</span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(session.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', flexShrink: 0, display: 'flex' }}
              >
                <Trash2 size={16} />
              </button>
              {expanded === session.id
                ? <ChevronUp size={16} color="var(--text-muted)" />
                : <ChevronDown size={16} color="var(--text-muted)" />}
            </div>

            {/* Expanded details */}
            {expanded === session.id && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {session.exercises.map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{e.exerciseName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {e.duration} min
                          {e.sets     ? ` · ${e.sets} séries × ${e.reps} reps` : ''}
                          {e.weight   ? ` · ${e.weight}kg` : ''}
                          {e.distance ? ` · ${e.distance}km` : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-orange)' }}>{e.calories} kcal</div>
                        <span
                          className="badge"
                          style={{
                            background: `color-mix(in srgb, ${categoryColors[e.category]} 15%, transparent)`,
                            color: categoryColors[e.category],
                          }}
                        >
                          {e.category}
                        </span>
                      </div>
                    </div>
                  ))}
                  {session.notes && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--color-cyan)' }}>
                      📝 {session.notes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}