'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleSidebar } from '@/lib/slices/uiSlice';
import { Menu, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/workouts': 'Entraînements',
  '/history': 'Historique',
  '/goals': 'Objectifs',
  '/profile': 'Profil',
};

export default function Header() {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector(s => s.ui);
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'SportTrack';
  const [isMounted, setIsMounted] = useState(false);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
  }, []);

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => dispatch(toggleSidebar())}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer',
            padding: '8px', borderRadius: '8px', display: 'flex', transition: 'all 0.2s',
          }}
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '18px', color: 'var(--text-primary)',
          }}>{title}</h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {isMounted ? dateStr : ''}
        </span>
      </div>
    </header>
  );
}
