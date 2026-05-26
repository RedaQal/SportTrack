'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeNotification } from '@/lib/slices/uiSlice';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: { icon: CheckCircle, color: 'var(--accent-green)' },
  error: { icon: AlertCircle, color: '#ef4444' },
  info: { icon: Info, color: 'var(--accent-cyan)' },
  warning: { icon: AlertTriangle, color: 'var(--accent-orange)' },
};

export default function Notifications() {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector(s => s.ui);

  useEffect(() => {
    notifications.forEach(n => {
      const timer = setTimeout(() => dispatch(removeNotification(n.id)), 4000);
      return () => clearTimeout(timer);
    });
  }, [notifications]);

  if (!notifications.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {notifications.map(n => {
        const { icon: Icon, color } = icons[n.type];
        return (
          <div
            key={n.id}
            className="animate-fade-in"
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px',
              background: 'var(--bg-card)', border: `1px solid ${color}40`,
              boxShadow: `0 4px 20px ${color}20`,
              minWidth: '280px', maxWidth: '360px',
            }}
          >
            <Icon size={18} color={color} />
            <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}>{n.message}</span>
            <button
              onClick={() => dispatch(removeNotification(n.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
