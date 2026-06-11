'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchMeThunk } from '@/lib/slices/authSlice';
import { fetchSessionsThunk, fetchExercisesThunk } from '@/lib/slices/workoutSlice';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Notifications from '@/components/ui/Notifications';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const { sidebarOpen } = useAppSelector(s => s.ui);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setMounted(true);
    dispatch(fetchMeThunk()).unwrap()
      .then((user) => {
        dispatch(fetchSessionsThunk(90));
        dispatch(fetchExercisesThunk());
        // Redirect to onboarding if not done yet
        if (!user.onboardingDone && pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      })
      .catch(() => router.push('/'));
  }, []);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: sidebarOpen ? '240px' : '0',
          transition: 'margin-left 0.3s ease',
          minWidth: 0,
        }}
      >
        <Header />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <Notifications />
    </div>
  );
}
