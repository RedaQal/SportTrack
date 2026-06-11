'use client';

import AppShell from '@/components/layout/AppShell';
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/pages/Dashboard'), { ssr: false });

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}