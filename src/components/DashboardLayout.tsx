import React from 'react';
import { LayoutDashboard, PlusCircle, BookOpen, LogOut, Search, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PlusCircle, label: 'Create Quiz', path: '/create-quiz' },
    { icon: BookOpen, label: 'My Quizzes', path: '/my-quizzes' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-light)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        color: 'var(--text-white)'
      }}>
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>QuizMaster</h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  transition: 'all 0.3s ease',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent'
                }}
              >
                <item.icon size={20} color={isActive ? 'var(--primary)' : 'inherit'} />
                <span style={{ fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            padding: '1rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          height: '70px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ position: 'relative', maxWidth: '400px', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search quizzes, students..."
              style={{
                width: '100%',
                padding: '0.7rem 1rem 0.7rem 3rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ position: 'relative', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
              <Bell size={22} />
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)' }}>Admin User</p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>admin@quizmaster.com</p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
