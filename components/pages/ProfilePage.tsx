'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateProfileThunk } from '@/lib/slices/authSlice';
import { addNotification } from '@/lib/slices/uiSlice';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Scale, Ruler, Save, Activity } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────
const calcAge = (birthday?: string): number | null => {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
};

// ── Schema ────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  birthday: z.string().optional(),
  weight: z.number().min(20).max(300).optional(),
  height: z.number().min(100).max(250).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

// ── Component ─────────────────────────────────────────────
export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { sessions } = useAppSelector(s => s.workout);
  const [editing, setEditing] = useState(false);

  const age = calcAge(user?.birthday);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
      weight: user?.weight,
      height: user?.height,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    const result = await dispatch(updateProfileThunk(data));
    if (updateProfileThunk.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Profil mis à jour !' }));
      setEditing(false);
    } else {
      dispatch(addNotification({ type: 'error', message: 'Erreur lors de la mise à jour' }));
    }
  };

  const totalCalories = sessions.reduce((s, c) => s + c.totalCalories, 0);
  const totalDuration = sessions.reduce((s, c) => s + c.totalDuration, 0);
  const avgMood = sessions.length
    ? (sessions.reduce((s, c) => s + c.mood, 0) / sessions.length).toFixed(1)
    : '-';

  const bmi = user?.weight && user?.height
    ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
    : null;

  const bmiLabel = bmi
    ? +bmi < 18.5 ? { label: 'Insuffisance pondérale', color: 'var(--cyan)' }
      : +bmi < 25 ? { label: 'Poids normal', color: 'var(--green)' }
        : +bmi < 30 ? { label: 'Surpoids', color: 'var(--orange)' }
          : { label: 'Obésité', color: '#ef4444' }
    : null;

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px',
    color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600,
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gap: '20px' }}>

      {/* Profile card */}
      <div className="card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px' }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user?.email}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
              Membre depuis {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={editing ? 'btn-ghost' : 'btn-grad'}
            style={{ marginLeft: 'auto', padding: '10px 22px', fontSize: 14 }}
          >
            {editing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Nom complet', name: 'name' as const, type: 'text' },
              { label: 'Email', name: 'email' as const, type: 'email' },
              { label: 'Date de naissance', name: 'birthday' as const, type: 'date' },
              { label: 'Poids (kg)', name: 'weight' as const, type: 'number' },
              { label: 'Taille (cm)', name: 'height' as const, type: 'number' },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={type}
                  {...register(name, { valueAsNumber: type === 'number' })}
                />
                {errors[name] && (
                  <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" className="btn-grad"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%', padding: '12px', fontSize: 14 }}>
                <Save size={15} /> Enregistrer les modifications
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              {
                label: 'Âge',
                value: age !== null ? `${age} ans` : '—',
                icon: '📅',
                extra: user?.birthday
                  ? { label: new Date(user.birthday).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), color: 'var(--text-muted)' }
                  : null,
              },
              { label: 'Poids', value: user?.weight ? `${user.weight} kg` : '—', icon: '⚖️', extra: null },
              { label: 'Taille', value: user?.height ? `${user.height} cm` : '—', icon: '📏', extra: null },
              { label: 'IMC', value: bmi || '—', icon: '💊', extra: bmiLabel },
            ].map(({ label, value, icon, extra }) => (
              <div key={label} style={{
                padding: '14px', borderRadius: '12px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>{value}</div>
                {extra && (
                  <div style={{ fontSize: '10px', color: extra.color, marginTop: '2px' }}>{extra.label}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats summary */}
      <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px',
          marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center',
        }}>
          <Activity size={16} color="var(--cyan)" />
          Statistiques globales
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Séances totales', value: sessions.length, color: 'var(--cyan)' },
            { label: 'Calories brûlées', value: `${totalCalories.toLocaleString()} kcal`, color: 'var(--orange)' },
            { label: "Temps d'entraînement", value: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}min`, color: 'var(--purple)' },
            {
              label: 'Humeur moyenne',
              value: `${[...'😴😐🙂😊🔥'][Math.round(+avgMood) - 1] || '?'} ${avgMood}/5`,
              color: 'var(--green)'
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: '14px', borderRadius: '12px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color, marginBottom: '4px' }}>
                {value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}