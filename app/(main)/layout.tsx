import { Sidebar } from '@/ui/sidebar';
import { Footer } from '@/ui/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: '240px',
        }}
      >
        <main style={{ flex: 1, padding: '32px' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}