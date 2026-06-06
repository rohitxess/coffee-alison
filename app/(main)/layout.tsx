

'use client';

import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
import { Sidebar } from '@/ui/sidebar';
import { Footer } from '@/ui/footer';

function MainContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: open ? '240px' : '64px',
        transition: 'margin-left 0.25s ease',
        minHeight: '100vh',
      }}
    >
      <main style={{ flex: 1, padding: '32px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}