import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../api/axios';
import CreateAlerteModal from '../components/alertes/CreateAlerteModal';
import AlerteCard from '../components/alertes/AlerteCard';

export default function Alertes() {
  const [alertes, setAlertes] = useState([]);
  const [onglet, setOnglet] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const charger = () => {
    setLoading(true);
    api.get('/bank/alerts')
      .then((res) => setAlertes(res.data.alertes || []))
      .catch(() => setError('Impossible de charger les alertes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const alertesFiltrees = alertes.filter((a) =>
    onglet === 'active' ? a.statut === 'active' : a.statut !== 'active'
  );

  const handleCloturer = async (id) => {
    if (!confirm('Clôturer cette alerte ?')) return;
    try {
      await api.put(`/bank/alerts/${id}/close`);
      
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la clôture');
    }
  };

  const nbActives = alertes.filter((a) => a.statut === 'active').length;

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Alertes</h1>
          <p className="text-sm text-slate-400 mt-1">
            {nbActives} alerte{nbActives > 1 ? 's' : ''} active{nbActives > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <FiPlus size={16} />
          Déclarer une alerte
        </button>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-2">
        {[
          { value: 'active', label: 'Actives' },
          { value: 'cloturee', label: 'Clôturées' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setOnglet(tab.value)}
            className={`text-sm px-3.5 py-1.5 rounded-lg transition ${
              onglet === tab.value
                ? 'bg-white border border-slate-100 text-slate-800 font-medium shadow-sm'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LISTE */}
      {loading ? (
        <p className="text-slate-400 text-sm">Chargement...</p>
      ) : error ? (
        <p className="text-red-700 text-sm">{error}</p>
      ) : alertesFiltrees.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-800 mb-1">
            Aucune alerte {onglet === 'active' ? 'active' : 'clôturée'}
          </p>
          <p className="text-xs text-slate-400">
            {onglet === 'active'
              ? "Déclarez une alerte pour mobiliser des donneurs."
              : "Les alertes clôturées apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alertesFiltrees.map((alerte) => (
            <AlerteCard key={alerte.id} alerte={alerte} onCloturer={handleCloturer} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateAlerteModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); charger(); }}
        />
      )}
    </>
  );
}