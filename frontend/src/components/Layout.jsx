import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600/20 text-primary-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight">Quotation Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">SaaS</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
          <NavLink to="/quotations" className={navClass}>Quotations</NavLink>
          <NavLink to="/quotations/new" className={navClass}>New Quotation</NavLink>
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className="px-4 py-2 text-sm text-slate-400 truncate" title={user?.email}>{user?.name || user?.email}</div>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-red-400 rounded-lg transition-colors">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}
