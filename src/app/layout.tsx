import './globals.css';
import type { Metadata } from 'next';
import { FleetProvider } from '@/context/FleetContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'FleetPulse — Smart Fleet Operations & Maintenance Management System',
  description:
    'Enterprise-grade fleet operations, dispatch tracking, vehicle registry, driver cockpit, and maintenance management system developed for Jeevix Technologies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-teal-500 selection:text-white">
        <FleetProvider>
          <AppShell>{children}</AppShell>
        </FleetProvider>
      </body>
    </html>
  );
}
