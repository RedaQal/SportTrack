'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/slices/authSlice';
import {
  LayoutDashboard, Dumbbell, History, Target,
  User, LogOut, Activity, Menu, X
} from 'lucide-react';
import { toggleSidebar } from '@/lib/slices/uiSlice';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workouts', label: 'Entraînements', icon: Dumbbell },
  { href: '/history', label: 'Historique', icon: History },
  { href: '/goals', label: 'Objectifs', icon: Target },
  { href: '/profile', label: 'Profil', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { sidebarOpen } = useAppSelector(s => s.ui);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        style={{
          width: sidebarOpen ? '240px' : '0',
          minWidth: sidebarOpen ? '240px' : '0',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={20} color="#000" />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '18px', color: 'var(--text-primary)', whiteSpace: 'nowrap',
            }}>SportTrack</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
                  textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  background: active ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15))' : 'transparent',
                  color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  borderLeft: active ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={18} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px' }}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          {user && (
            <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-card)', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', borderRadius: '10px',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            }}
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
