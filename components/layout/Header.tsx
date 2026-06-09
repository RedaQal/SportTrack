'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { toggleSidebar } from '@/lib/slices/uiSlice';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/workouts':  'Entraînements',
  '/history':   'Historique',
  '/goals':     'Objectifs',
  '/profile':   'Profil',
};

export default function Header() {
  const dispatch   = useAppDispatch();
  const pathname   = usePathname();
  const title      = pageTitles[pathname] || 'SportTrack';
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
  }, []);

  return (
    <header
      style={{
        height: '64px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Left: menu + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn-icon" onClick={() => dispatch(toggleSidebar())}>
          <Menu size={18} />
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right: date + theme toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{dateStr}</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
