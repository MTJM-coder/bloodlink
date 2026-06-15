import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiDroplet, FiBell, FiDollarSign,
  FiHome, FiSettings, FiLogOut,
  FiBookOpen,
} from 'react-icons/fi';
import api from '../api/axios';

const menuItems = [
  { label: 'Tableau de bord', path: '/bank/dashboard', icon: <FiGrid /> },
  { label: 'Stock', path: '/bank/dashboard/stock', icon: <FiDroplet /> },
  {label: 'historique',path:'bank/dashboard/historique',icon:<FiBookOpen/>},
  { label: 'Alertes', path: '/bank/dashboard/alertes', icon: <FiBell /> },
  { label: 'Cautions', path: '/bank/dashboard/cautions', icon: <FiDollarSign /> },
  { label: 'Partenaires', path: '/bank/dashboard/partenaires', icon: <FiHome /> },
  { label: 'Profil', path: '/bank/dashboard/profil', icon: <FiSettings /> },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nomBanque = user?.banque?.nom || 'Banque de sang';
  const ville = user?.banque?.ville || '';

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-full lg:w-52 bg-white border border-slate-100 rounded-2xl p-3 flex flex-col flex-shrink-0 shadow-sm lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">

      {/* Bloc identité */}
      <div className="mb-4 p-2.5 rounded-xl bg-slate-50">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0">
            <FiDroplet size={16} />
          </div>
          <p className="text-sm font-semibold text-slate-800">BloodLink</p>
        </div>
        <p className="text-sm font-medium text-slate-800 truncate">{nomBanque}</p>
        {ville && <p className="text-xs text-slate-400 mt-0.5">{ville}</p>}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
          <span className="text-xs text-green-600 font-medium">Connecté</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition ${
                isActive
                  ? 'bg-red-50 text-red-600 font-medium'
                  : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-400 border-t border-slate-100 mt-2 pt-3 hover:bg-slate-50"
      >
        <FiLogOut size={18} />
        Déconnexion
      </button>
    </aside>
  );
}