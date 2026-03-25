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

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-xl font-bold">श्री चिंतामणी</h1>
          <p className="text-blue-300 text-xs mt-1">Electricals ERP System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
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
      <main className="ml-64 flex-1 p-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}