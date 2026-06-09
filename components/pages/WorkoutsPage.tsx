'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addSessionThunk } from '@/lib/slices/workoutSlice';
import { addNotification } from '@/lib/slices/uiSlice';
import { WorkoutExercise } from '@/types';
import { Plus, Trash2, Play, X } from 'lucide-react';
import { format } from 'date-fns';

const categoryLabels: Record<string, string> = {
  cardio: 'Cardio', strength: 'Musculation',
  flexibility: 'Flexibilité', hiit: 'HIIT', sports: 'Sports',
};

const categoryColors: Record<string, string> = {
  cardio:      'var(--color-cyan)',
  strength:    'var(--color-purple)',
  flexibility: 'var(--color-green)',
  hiit:        'var(--color-orange)',
  sports:      'var(--color-pink)',
};

export default function WorkoutsPage() {
  const dispatch     = useAppDispatch();
  const { exercises } = useAppSelector(s => s.workout);

  const [selectedCategory, setSelectedCategory]   = useState<string>('all');
  const [workoutExercises, setWorkoutExercises]   = useState<WorkoutExercise[]>([]);
  const [mood, setMood]       = useState<1|2|3|4|5>(3);
  const [notes, setNotes]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedExId, setSelectedExId] = useState('');
  const [duration, setDuration] = useState(30);
  const [sets, setSets]   = useState(3);
  const [reps, setReps]   = useState(10);
  const [weight, setWeight]   = useState(0);
  const [distance, setDistance] = useState(0);

  const categories = ['all', 'cardio', 'strength', 'flexibility', 'hiit', 'sports'];
  const filtered   = selectedCategory === 'all' ? exercises : exercises.filter(e => e.category === selectedCategory);

  const addExercise = () => {
    const ex = exercises.find(e => e.id === selectedExId);
    if (!ex) return;
    const calories = Math.round(duration * (ex.caloriesPerMinute || 7));
    const we: WorkoutExercise = {
      exerciseId:   ex.id,
      exerciseName: ex.name,
      category:     ex.category,
      duration,
      calories,
      ...(ex.category === 'strength' ? { sets, reps, weight: weight || undefined } : {}),
      ...(ex.category === 'cardio' && distance ? { distance } : {}),
    };
    setWorkoutExercises(prev => [...prev, we]);
    setShowForm(false);
    setSelectedExId('');
    setDuration(30);
  };

  const removeExercise = (idx: number) =>
    setWorkoutExercises(prev => prev.filter((_, i) => i !== idx));

  const saveWorkout = async () => {
    if (!workoutExercises.length) return;
    const result = await dispatch(addSessionThunk({
      date:          format(new Date(), 'yyyy-MM-dd'),
      exercises:     workoutExercises,
      totalCalories: workoutExercises.reduce((s, e) => s + e.calories, 0),
      totalDuration: workoutExercises.reduce((s, e) => s + e.duration, 0),
      mood,
      notes,
    }));
    if (addSessionThunk.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Séance enregistrée ! 🎉' }));
      setWorkoutExercises([]); setNotes(''); setMood(3);
    } else {
      dispatch(addNotification({ type: 'error', message: "Erreur lors de l'enregistrement" }));
    }
  };

  const selectedEx = exercises.find(e => e.id === selectedExId);

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px',
    color: 'var(--text-secondary)', marginBottom: '6px',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

        {/* ── Left: exercise picker ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
            Choisir un exercice
          </h2>

          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {categories.map(cat => {
              const active  = selectedCategory === cat;
              const color   = cat === 'all' ? 'var(--color-cyan)' : categoryColors[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                    fontFamily: 'var(--font-display)', fontWeight: 600, cursor: 'pointer',
                    border:      `1px solid ${active ? color : 'var(--border)'}`,
                    background:  active ? `color-mix(in srgb, ${color} 15%, transparent)` : 'transparent',
                    color:       active ? color : 'var(--text-muted)',
                    transition:  'all 0.2s',
                  }}
                >
                  {cat === 'all' ? 'Tous' : categoryLabels[cat]}
                </button>
              );
            })}
          </div>

          {/* Exercise grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {filtered.map(ex => (
              <button
                key={ex.id}
                onClick={() => { setSelectedExId(ex.id); setShowForm(true); }}
                className="card"
                style={{
                  cursor: 'pointer', textAlign: 'left',
                  borderColor: selectedExId === ex.id ? categoryColors[ex.category] : undefined,
                  transform: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = categoryColors[ex.category])}
                onMouseLeave={e => {
                  if (selectedExId !== ex.id) e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{ex.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                  {ex.name}
                </div>
                <span
                  className="badge"
                  style={{
                    background: `color-mix(in srgb, ${categoryColors[ex.category]} 15%, transparent)`,
                    color: categoryColors[ex.category],
                  }}
                >
                  {categoryLabels[ex.category]}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  ~{ex.caloriesPerMinute} kcal/min
                </div>
              </button>
            ))}
          </div>

          {/* Exercise form */}
          {showForm && selectedEx && (
            <div
              className="card"
              style={{
                marginTop: '20px',
                borderColor: `color-mix(in srgb, ${categoryColors[selectedEx.category]} 30%, transparent)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {selectedEx.icon} {selectedEx.name}
                </h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Durée (min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} min={1} max={300} />
                </div>
                {selectedEx.category === 'strength' && (<>
                  <div>
                    <label style={labelStyle}>Séries</label>
                    <input type="number" value={sets} onChange={e => setSets(+e.target.value)} min={1} max={20} />
                  </div>
                  <div>
                    <label style={labelStyle}>Reps</label>
                    <input type="number" value={reps} onChange={e => setReps(+e.target.value)} min={1} max={100} />
                  </div>
                  <div>
                    <label style={labelStyle}>Poids (kg)</label>
                    <input type="number" value={weight} onChange={e => setWeight(+e.target.value)} min={0} />
                  </div>
                </>)}
                {selectedEx.category === 'cardio' && (
                  <div>
                    <label style={labelStyle}>Distance (km)</label>
                    <input type="number" value={distance} onChange={e => setDistance(+e.target.value)} min={0} step={0.1} />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Estimation :{' '}
                <strong style={{ color: categoryColors[selectedEx.category] }}>
                  {Math.round(duration * (selectedEx.caloriesPerMinute || 7))} kcal
                </strong>
              </div>

              <button onClick={addExercise} className="btn-primary" style={{ marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus size={16} /> Ajouter à la séance
              </button>
            </div>
          )}
        </div>

        {/* ── Right: current session ── */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={16} color="var(--color-green)" /> Séance en cours
            </h3>

            {workoutExercises.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💪</div>
                Sélectionnez des exercices pour démarrer votre séance
              </div>
            ) : (<>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {workoutExercises.map((we, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{we.exerciseName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {we.duration} min · {we.calories} kcal
                        {we.sets ? ` · ${we.sets}×${we.reps}` : ''}
                        {we.distance ? ` · ${we.distance}km` : ''}
                      </div>
                    </div>
                    <button onClick={() => removeExercise(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total calories</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-orange)' }}>
                    {workoutExercises.reduce((s, e) => s + e.calories, 0)} kcal
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Durée totale</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-cyan)' }}>
                    {workoutExercises.reduce((s, e) => s + e.duration, 0)} min
                  </div>
                </div>
              </div>

              {/* Mood */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Votre ressenti</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                  {([1,2,3,4,5] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      style={{
                        fontSize: '20px', background: 'none',
                        border: `2px solid ${mood === m ? 'var(--color-cyan)' : 'var(--border)'}`,
                        borderRadius: '8px', padding: '6px',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {['😴','😐','🙂','😊','🔥'][m - 1]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <textarea
                  placeholder="Notes (optionnel)..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'none', height: '70px', fontSize: '13px' }}
                />
              </div>

              <button onClick={saveWorkout} className="btn-primary" style={{ width: '100%', fontSize: '14px' }}>
                Enregistrer la séance
              </button>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}
