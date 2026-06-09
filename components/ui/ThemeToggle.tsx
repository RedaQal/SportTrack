'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    setSpinning(true);
    toggle();
    setTimeout(() => setSpinning(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className="theme-toggle"
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
    >
      <span className={spinning ? 'animate-theme-spin' : ''} style={{ display: 'flex' }}>
        {theme === 'dark'
          ? <Sun size={16} color="var(--color-cyan)" />
          : <Moon size={16} color="var(--color-purple)" />
        }
      </span>
    </button>
  );
}
