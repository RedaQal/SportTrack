'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { initSessions } from '@/lib/slices/workoutSlice';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Notifications from '@/components/ui/Notifications';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const { sidebarOpen } = useAppSelector(s => s.ui);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push('/');
    } else {
      dispatch(initSessions());
    }
  }, [isAuthenticated, router, dispatch]);

  if (!isMounted || !isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        marginLeft: sidebarOpen ? '240px' : '0',
        transition: 'margin-left 0.3s ease',
        minWidth: 0,
      }}>
        <Header />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <Notifications />
    </div>
  );
}
