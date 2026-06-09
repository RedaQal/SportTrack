'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loginThunk, registerThunk } from '@/lib/slices/authSlice';
import { addNotification } from '@/lib/slices/uiSlice';
import { Activity, Eye, EyeOff, Zap, TrendingUp, Award } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

const registerSchema = z.object({
  name:            z.string().min(2, 'Minimum 2 caractères'),
  email:           z.string().email('Email invalide'),
  password:        z.string().min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type LoginForm    = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const features = [
  { icon: Zap,       label: 'Suivi en temps réel',   desc: 'Calories, durée, performances' },
  { icon: TrendingUp, label: 'Statistiques avancées', desc: 'Graphiques interactifs' },
  { icon: Award,     label: 'Objectifs personnels',   desc: 'Progressez à votre rythme' },
];

export default function AuthPage() {
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const router    = useRouter();
  const dispatch  = useAppDispatch();
  const { isAuthenticated } = useAppSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated]);

  const loginForm    = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginForm) => {
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Connexion réussie ! Bienvenue 👋' }));
      router.push('/dashboard');
    } else {
      dispatch(addNotification({ type: 'error', message: result.payload as string }));
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    const result = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Compte créé avec succès !' }));
      router.push('/dashboard');
    } else {
      dispatch(addNotification({ type: 'error', message: result.payload as string }));
    }
  };

  /* ── shared label style ── */
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '6px',
  };
  const errorStyle: React.CSSProperties = {
    color: 'var(--color-red)', fontSize: '12px', marginTop: '4px',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>

      {/* ── Left panel (hidden on mobile) ── */}
      <div
        className="md:flex lg:flex"
        style={{
          flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          borderRight: '1px solid var(--border)',
          padding: '48px', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--color-cyan), var(--color-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={26} color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px' }}>SportTrack</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '42px', lineHeight: 1.2, marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--text-primary), var(--color-cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Atteignez vos<br />objectifs sportifs
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '48px', lineHeight: 1.6 }}>
            Suivez vos entraînements, analysez vos performances et progressez chaque jour.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '12px',
                  background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color="var(--color-cyan)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Logo (mobile only) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '32px', justifyContent: 'center',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-cyan), var(--color-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={22} color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px' }}>SportTrack</span>
          </div>

          {/* Mode tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg-secondary)',
            borderRadius: '12px', padding: '4px', marginBottom: '28px',
            border: '1px solid var(--border)',
          }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '9px',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: mode === m
                    ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15))'
                    : 'transparent',
                  color:       mode === m ? 'var(--color-cyan)' : 'var(--text-muted)',
                  borderBottom: mode === m ? '1px solid var(--color-cyan)' : '1px solid transparent',
                }}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Login form */}
          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="alex@email.com" {...loginForm.register('email')} />
                {loginForm.formState.errors.email && (
                  <p style={errorStyle}>{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p style={errorStyle}>{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px', fontSize: '15px', padding: '13px' }}>
                Se connecter
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                Démo : entrez n'importe quel email + mot de passe (6 chars min)
              </p>
            </form>
          ) : (
            /* Register form */
            <form onSubmit={registerForm.handleSubmit(handleRegister)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nom complet</label>
                <input type="text" placeholder="Alex Martin" {...registerForm.register('name')} />
                {registerForm.formState.errors.name && (
                  <p style={errorStyle}>{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="alex@email.com" {...registerForm.register('email')} />
                {registerForm.formState.errors.email && (
                  <p style={errorStyle}>{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerForm.register('password')}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p style={errorStyle}>{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Confirmer le mot de passe</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...registerForm.register('confirmPassword')}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p style={errorStyle}>{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px', fontSize: '15px', padding: '13px' }}>
                Créer mon compte
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
