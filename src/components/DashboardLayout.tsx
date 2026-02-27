import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, BookOpen, LogOut, Search, Bell, Menu, X, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PlusCircle, label: 'Create Quiz', path: '/create-quiz' },
    { icon: BookOpen, label: 'My Quizzes', path: '/my-quizzes' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-[280px] bg-bg-dark flex flex-col p-8 text-text-white z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-[#60a5fa] to-[#3b82f6] rounded-[10px] flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">QuizMaster</h2>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-text-muted hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full p-4 bg-transparent border-none text-text-muted cursor-pointer text-base hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className="h-[70px] bg-white border-b border-[#e2e8f0] px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 text-[#64748b] hover:text-text-dark transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="relative max-w-[400px] w-full hidden sm:block">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search quizzes..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] outline-hidden text-[0.9rem]"
            />
          </div>

          <div className="flex items-center gap-3 lg:gap-6 ml-auto">
            <button className="relative border-none bg-none cursor-pointer text-[#64748b]">
              <Bell size={22} />
              <span className="absolute top-[2px] right-[2px] w-2 h-2 bg-[#ef4444] rounded-full border-2 border-white"></span>
            </button>
            <Link to="/profile" className="flex items-center gap-3 no-underline group">
              <div className="text-right hidden xs:block">
                <p className="text-[0.9rem] font-semibold text-text-dark group-hover:text-primary transition-colors">Dhanrajsinh Jadeja</p>
                <p className="text-[0.75rem] text-[#94a3b8] hidden md:block">dhanraj@example.com</p>
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                <UserIcon size={20} />
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
