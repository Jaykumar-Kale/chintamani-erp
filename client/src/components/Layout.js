import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/bills/new', label: 'New Bill', icon: '➕' },
  { path: '/bills', label: 'All Bills', icon: '🧾' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary text-white flex items-center justify-between px-4 z-20 shadow lg:hidden">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-2xl leading-none"
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="text-base font-bold">श्री चिंतामणी ERP</h1>
        <button
          onClick={handleLogout}
          className="text-xs text-blue-100"
        >
          Logout
        </button>
      </header>

      {isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-primary text-white flex flex-col fixed h-full z-30 shadow-xl transition-transform duration-200 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">श्री चिंतामणी</h1>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden text-blue-200 text-xl leading-none"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <p className="text-blue-300 text-xs mt-1">Electricals ERP System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${
                pathname === item.path
                  ? 'bg-white text-primary font-bold'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <p className="text-blue-300 text-xs mb-1">Logged in as</p>
          <p className="text-white font-semibold text-sm">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left text-xs text-blue-300 hover:text-white transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 min-h-screen lg:ml-64 lg:p-6 lg:pt-6">
        {children}
      </main>
    </div>
  );
}