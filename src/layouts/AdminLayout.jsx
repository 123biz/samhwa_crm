import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Send, BarChart3, Headphones, QrCode, Bot, Menu, X, LogOut, Bell } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: '대시보드', end: true },
  { to: '/admin/qr-stats', icon: QrCode, label: 'QR 코드 관리' },
  { to: '/admin/customers', icon: Users, label: '고객 DB 관리' },
  { href: 'https://typebot.co/samhwa-as-bodylove?utm_source=crm&utm_medium=web', icon: Bot, label: 'A/S 챗봇' },
  { to: '/admin/as-stats', icon: Headphones, label: 'A/S 통계' },
  { to: '/admin/broadcast', icon: Send, label: '발신 관리' },
  { to: '/admin/analytics', icon: BarChart3, label: '발신 효과 분석' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setUserEmail(user?.email ?? '');
      setDisplayName(user?.user_metadata?.display_name || user?.email?.split('@')[0] || '');
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const avatarLetter = displayName[0]?.toUpperCase() ?? '?';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-primary text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          {sidebarOpen ? (
            <Link to="/admin" className="flex items-center gap-2 no-underline text-white">
              <span className="text-2xl">🏥</span>
              <span className="font-bold text-sm">삼화메디칼 CRM</span>
            </Link>
          ) : (
            <span className="text-2xl mx-auto">🏥</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const NavIcon = item.icon;
            const commonClass = 'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-lg no-underline transition-colors text-white/70 hover:bg-white/10 hover:text-white';
            if (item.href) {
              return (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={commonClass}>
                  {NavIcon && <NavIcon size={20} className="flex-shrink-0" />}
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              );
            }
            return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              target={item.target}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-lg no-underline transition-colors ${
                  isActive ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {NavIcon && <NavIcon size={20} className="flex-shrink-0" />}
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
            );
          })}
        </nav>

        {/* Mobile Pages Links */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-lg text-white/40 mb-2 font-semibold">모바일 미리보기</p>
            <Link to="/landing/all?preview=1" target="_blank" className="block text-lg text-white/60 hover:text-white py-1 no-underline">📱 QR 스캔 화면</Link>
            <Link to="/register" target="_blank" className="block text-lg text-white/60 hover:text-white py-1 no-underline">✍️ 고객등록 폼</Link>
          </div>
        )}

        {/* Collapse btn */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-12 flex items-center justify-center border-t border-white/10 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer bg-transparent border-x-0 border-b-0"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-border flex-shrink-0">
          <h1 className="text-lg font-bold text-primary m-0">삼화메디칼 CRM</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-sub hover:text-primary bg-transparent border-0 cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">{avatarLetter}</div>
              <span className="text-txt font-medium">{displayName}님</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-sub hover:text-error bg-transparent border-0 cursor-pointer">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
