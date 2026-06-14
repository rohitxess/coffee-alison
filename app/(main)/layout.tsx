'use client';

import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
import { Sidebar } from '@/ui/sidebar';
import { Footer } from '@/ui/footer';

function MainContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div
      style={{
        marginLeft: open ? '240px' : '64px',
        transition: 'margin-left 0.25s ease',
        width: open ? 'calc(100% - 240px)' : 'calc(100% - 64px)',
        height: '100vh',              // ← exact viewport height
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',           // ← no scroll on layout
        boxSizing: 'border-box',
      }}
    >
      {/* Page content fills available space */}
      <main
        style={{
          flex: 1,
          padding: '32px',
          // overflow: 'hidden',        
          overflowY: 'auto',           
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div
        style={{
          display: 'flex',
          height: '100vh',            // ← full viewport, no overflow
          overflow: 'hidden',
          backgroundColor: '#f9fafb',
        }}
      >
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}