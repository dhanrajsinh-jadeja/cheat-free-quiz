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
    <div className="flex h-screen bg-bg-light">
      {/* Sidebar */}
      <aside className="w-[280px] bg-bg-dark flex flex-col p-8 text-text-white">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#60a5fa] to-[#3b82f6] rounded-[10px] flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">QuizMaster</h2>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-4 p-4 rounded-xl no-underline transition-all duration-300
                  ${isActive ? 'text-white bg-blue-500/15 border border-blue-500/30' : 'text-text-muted border border-transparent'}
                `}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'inherit'} />
                <span className={isActive ? 'font-semibold' : 'font-normal'}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-color pt-6">
          <button className="flex items-center gap-4 w-full p-4 bg-transparent border-none text-text-muted cursor-pointer text-base">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[70px] bg-white border-b border-[#e2e8f0] px-8 flex items-center justify-between">
          <div className="relative max-w-[400px] w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search quizzes, students..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] outline-hidden text-[0.9rem]"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative border-none bg-none cursor-pointer text-[#64748b]">
              <Bell size={22} />
              <span className="absolute top-[2px] right-[2px] w-2 h-2 bg-[#ef4444] rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[0.9rem] font-semibold text-text-dark">Admin User</p>
                <p className="text-[0.75rem] text-[#94a3b8]">admin@quizmaster.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#e2e8f0]"></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 p-8 overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
