'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateProfileThunk } from '@/lib/slices/authSlice';
import { addNotification } from '@/lib/slices/uiSlice';
import { ChevronRight, ChevronLeft, Check, Calendar, Scale, Target } from 'lucide-react';

interface WizardData {
    birthday: string;
    weight: number;
    height: number;
    weeklyWorkouts: number;
    targetWeight: number;
    weeklyCalories: number;
}

const steps = [
    { label: 'Anniversaire', icon: Calendar, desc: 'Pour calculer votre âge automatiquement' },
    { label: 'Morphologie', icon: Scale, desc: 'Pour des calculs de calories précis' },
    { label: 'Objectifs', icon: Target, desc: 'Définissez vos objectifs hebdomadaires' },
];

const inputStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: 8,
    padding: '12px 14px',
    width: '100%',
    outline: 'none',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: 8,
};

export default function OnboardingWizard() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(s => s.auth);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [data, setData] = useState<WizardData>({
        birthday: '',
        weight: 70,
        height: 175,
        weeklyWorkouts: 3,
        targetWeight: 70,
        weeklyCalories: 1500,
    });

    const set = (key: keyof WizardData, value: string | number) =>
        setData(prev => ({ ...prev, [key]: value }));

    // Auto-calculate age from birthday
    const calcAge = (birthday: string): number => {
        if (!birthday) return 0;
        const birth = new Date(birthday);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
        return age;
    };

    const age = calcAge(data.birthday);

    const canNext = () => {
        if (step === 0) return !!data.birthday && age >= 10 && age <= 100;
        if (step === 1) return data.weight > 0 && data.height > 0;
        return true;
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            await dispatch(updateProfileThunk({
                weight: data.weight,
                height: data.height,
                birthday: data.birthday,   // ← removed age
            } as any));

            if (user?.goals) {
                for (const goal of user.goals) {
                    let target = goal.target;
                    if (goal.type === 'workouts') target = data.weeklyWorkouts;
                    if (goal.type === 'calories') target = data.weeklyCalories;
                    if (goal.type === 'weight') target = data.targetWeight;

                    await fetch(`/api/goals/${goal.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ target }),
                    });
                }
            }

            await fetch(`/api/users/${user?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ onboardingDone: true }),
            });

            dispatch(addNotification({ type: 'success', message: 'Profil configuré ! Bienvenue 🎉' }));
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            dispatch(addNotification({ type: 'error', message: 'Erreur lors de la sauvegarde' }));
        } finally {
            setLoading(false);
        }
    };

    const bmi = data.weight && data.height
        ? (data.weight / ((data.height / 100) ** 2)).toFixed(1) : null;

    return (
        <div style={{ maxWidth: 540, margin: '0 auto', padding: '20px 0' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
                    Configurons votre profil
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                    Bonjour {user?.name?.split(' ')[0]} ! Quelques infos pour personnaliser votre expérience.
                </p>
            </div>

            {/* Step indicators */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
                {steps.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: done ? 'var(--green)' : active
                                        ? 'linear-gradient(135deg, var(--cyan), var(--purple))'
                                        : 'var(--bg-card)',
                                    border: `2px solid ${done ? 'var(--green)' : active ? 'transparent' : 'var(--border)'}`,
                                    transition: 'all 0.3s',
                                }}>
                                    {done
                                        ? <Check size={20} color="#000" />
                                        : <s.icon size={20} color={active ? '#000' : 'var(--text-muted)'} />}
                                </div>
                                <span style={{
                                    fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600,
                                    color: active ? 'var(--cyan)' : done ? 'var(--green)' : 'var(--text-muted)',
                                }}>
                                    {s.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div style={{
                                    width: 80, height: 2, marginBottom: 28,
                                    background: i < step ? 'var(--green)' : 'var(--border)',
                                    transition: 'background 0.3s',
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Card */}
            <div className="card" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    {steps[step].desc}
                </p>

                {/* Step 1 — Birthday */}
                {step === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={labelStyle}>Date de naissance</label>
                            <input
                                type="date"
                                value={data.birthday}
                                onChange={e => set('birthday', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                style={inputStyle}
                            />
                        </div>

                        {data.birthday && age >= 10 && (
                            <div style={{
                                padding: '16px 20px', borderRadius: 12,
                                background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(124,58,237,0.08))',
                                border: '1px solid rgba(0,229,255,0.2)',
                                display: 'flex', alignItems: 'center', gap: 16,
                            }}>
                                <div style={{ fontSize: 36 }}>🎂</div>
                                <div>
                                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--cyan)', lineHeight: 1 }}>
                                        {age} ans
                                    </p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                        Âge calculé automatiquement
                                    </p>
                                </div>
                            </div>
                        )}

                        {data.birthday && (age < 10 || age > 100) && (
                            <p style={{ color: '#ef4444', fontSize: 13 }}>Date de naissance invalide</p>
                        )}
                    </div>
                )}

                {/* Step 2 — Weight & Height */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Poids actuel (kg)</label>
                                <input
                                    type="number"
                                    value={data.weight}
                                    onChange={e => set('weight', +e.target.value)}
                                    min={20} max={300} step={0.5}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Taille (cm)</label>
                                <input
                                    type="number"
                                    value={data.height}
                                    onChange={e => set('height', +e.target.value)}
                                    min={100} max={250}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {bmi && (
                            <div style={{
                                padding: '16px 20px', borderRadius: 12,
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                            }}>
                                <div>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>IMC calculé</p>
                                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--cyan)' }}>{bmi}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Statut</p>
                                    <p style={{
                                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                                        color: +bmi < 18.5 ? 'var(--cyan)' : +bmi < 25 ? 'var(--green)' : +bmi < 30 ? 'var(--orange)' : '#ef4444',
                                    }}>
                                        {+bmi < 18.5 ? 'Insuffisance pondérale' : +bmi < 25 ? 'Poids normal ✓' : +bmi < 30 ? 'Surpoids' : 'Obésité'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Calories de base/jour</p>
                                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--orange)' }}>
                                        {Math.round(10 * data.weight + 6.25 * data.height - 5 * (age || 25) + 5)} kcal
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Poids idéal estimé</p>
                                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--purple)' }}>
                                        {(22 * ((data.height / 100) ** 2)).toFixed(1)} kg
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3 — Goals */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[
                            {
                                key: 'weeklyWorkouts' as const,
                                label: 'Séances par semaine',
                                icon: '🏋️',
                                min: 1, max: 14, step: 1,
                                color: 'var(--cyan)',
                                hint: `${data.weeklyWorkouts} séance${data.weeklyWorkouts > 1 ? 's' : ''} / semaine`,
                            },
                            {
                                key: 'targetWeight' as const,
                                label: 'Objectif poids (kg)',
                                icon: '⚖️',
                                min: 30, max: 200, step: 0.5,
                                color: 'var(--green)',
                                hint: data.weight > data.targetWeight
                                    ? `Perdre ${(data.weight - data.targetWeight).toFixed(1)} kg`
                                    : data.weight < data.targetWeight
                                        ? `Prendre ${(data.targetWeight - data.weight).toFixed(1)} kg`
                                        : 'Maintenir le poids actuel',
                            },
                            {
                                key: 'weeklyCalories' as const,
                                label: 'Calories à brûler / semaine',
                                icon: '🔥',
                                min: 500, max: 10000, step: 100,
                                color: 'var(--orange)',
                                hint: `~${Math.round(data.weeklyCalories / 7)} kcal/jour`,
                            },
                        ].map(({ key, label, icon, min, max, step: s, color, hint }) => (
                            <div key={key}>
                                <label style={labelStyle}>{icon} {label}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input
                                        type="range"
                                        min={min} max={max} step={s}
                                        value={data[key]}
                                        onChange={e => set(key, +e.target.value)}
                                        style={{ flex: 1, accentColor: color, height: 4 }}
                                    />
                                    <input
                                        type="number"
                                        min={min} max={max} step={s}
                                        value={data[key]}
                                        onChange={e => set(key, +e.target.value)}
                                        style={{ ...inputStyle, width: 80, textAlign: 'center' }}
                                    />
                                </div>
                                <p style={{ fontSize: 12, color, marginTop: 6, fontWeight: 600 }}>{hint}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {step > 0 ? (
                    <button onClick={() => setStep(s => s - 1)}
                        className="btn-ghost flex items-center gap-2"
                        style={{ padding: '10px 20px', fontSize: 14 }}>
                        <ChevronLeft size={16} /> Retour
                    </button>
                ) : (
                    <div />
                )}

                {step < steps.length - 1 ? (
                    <button
                        onClick={() => setStep(s => s + 1)}
                        disabled={!canNext()}
                        className="btn-grad flex items-center gap-2"
                        style={{ padding: '10px 24px', fontSize: 14, opacity: canNext() ? 1 : 0.5, cursor: canNext() ? 'pointer' : 'not-allowed' }}>
                        Suivant <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        disabled={loading}
                        className="btn-grad flex items-center gap-2"
                        style={{ padding: '10px 24px', fontSize: 14, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? '...' : <><Check size={16} /> Commencer !</>}
                    </button>
                )}
            </div>

            {/* Skip */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button onClick={() => router.push('/dashboard')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}>
                    Passer cette étape →
                </button>
            </div>
        </div>
    );
}