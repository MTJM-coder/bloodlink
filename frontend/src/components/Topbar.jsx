import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiChevronDown, FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import api from '../api/axios';

export default function Topbar({ onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const nomBanque = user?.banque?.nom || 'Banque de sang';
  const initiales = nomBanque
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="bg-white border border-slate-100 rounded-2xl px-3 sm:px-5 py-3 flex justify-between items-center shadow-sm gap-3">

      {/* Burger mobile */}
      <button onClick={onMenuClick} className="lg:hidden text-slate-500">
        <FiMenu size={22} />
      </button>

      {/* Recherche - cachée sur mobile */}
      <div className="relative flex-1 max-w-sm hidden sm:block">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
        <input
          type="text"
          placeholder="Rechercher une poche, une alerte..."
          className="w-full border border-slate-100 bg-slate-50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">

        <button className="relative text-slate-500 hover:text-slate-700">
          <FiBell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-600 rounded-full border-[1.5px] border-white" />
        </button>

        <div className="w-px h-6 bg-slate-100 hidden sm:block" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
              {initiales}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-slate-800 leading-tight truncate max-w-[140px]">
                {nomBanque}
              </p>
              <p className="text-xs text-slate-400 leading-tight">
                Responsable banque
              </p>
            </div>
            <FiChevronDown size={16} className="text-slate-400 hidden md:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-20">
              <button
                onClick={() => navigate('/dashboard/profil')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <FiUser size={16} />
                Profil
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <FiLogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}