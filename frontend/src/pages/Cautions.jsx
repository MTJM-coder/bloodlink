import { useEffect, useState } from 'react';
import { FiPlus, FiClock, FiCheckCircle, FiDollarSign, FiUsers,FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import CreateCautionModal from '../components/cautions/CreateCautionModal';
import RembourserModal from '../components/cautions/RembourserModal';

const STATUT_BADGE = {
  en_attente: 'bg-amber-50 text-amber-700',
  partiellement_remboursee: 'bg-blue-50 text-blue-700',
  remboursee: 'bg-slate-100 text-slate-500',
};

const STATUT_LABEL = {
  en_attente: 'En attente',
  partiellement_remboursee: 'Partiellement remboursée',
  remboursee: 'Remboursée',
};
export default function Cautions() {
  const [cautions, setCautions] = useState([]);
  const [onglet, setOnglet] = useState('ACTIVES');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [rembourserCaution, setRembourserCaution] = useState(null);

  const charger = () => {
    setLoading(true);
    api.get('/bank/cautions')
      .then((res) => setCautions(res.data.cautions || []))
      .catch(() => setError('Impossible de charger les cautions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const cautionsFiltrees = cautions.filter((c) =>
    onglet === 'ACTIVES' ? c.statut !== 'remboursee' : c.statut === 'remboursee'
  );

  const nbActives = cautions.filter((c) => c.statut === 'en_attente').length;
  const nbPartielles = cautions.filter((c) => c.statut === 'partiellement_remboursee').length;
  const nbRemboursees = cautions.filter((c) => c.statut === 'remboursee').length;
  const montantTotal = cautions
    .filter((c) => c.statut !== 'remboursee')
    .reduce((sum, c) => sum + (c.montant || 0), 0);
  const donneursAttente = cautions
    .filter((c) => c.statut !== 'remboursee')
    .reduce((sum, c) => sum + Math.max(0, (c.nb_donneurs_attendus || 0) - (c.nb_donneurs_ramenes || 0)), 0);

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Cautions</h1>
          <p className="text-sm text-slate-400 mt-1">
            {cautions.length} caution{cautions.length > 1 ? 's' : ''} enregistrée{cautions.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <FiPlus size={16} />
          Enregistrer une caution
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<FiClock size={18} />} iconBg="bg-amber-50 text-amber-600" label="Cautions actives" value={nbActives} />
        <StatCard icon={<FiCheckCircle size={18} />} iconBg="bg-green-50 text-green-600" label="Remboursées" value={nbRemboursees} />
        <StatCard icon={<FiDollarSign size={18} />} iconBg="bg-blue-50 text-blue-600" label="Montant total retenu" value={`${montantTotal.toLocaleString('fr-FR')} FCFA`} />
        <StatCard icon={<FiUsers size={18} />} iconBg="bg-red-50 text-red-600" label="Donneurs en attente" value={donneursAttente} />
        <StatCard icon={<FiRefreshCw size={18} />} iconBg="bg-blue-50 text-blue-600" label="Partiellement remboursées" value={nbPartielles}/>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-2">
        {[
          { value: 'ACTIVES', label: 'Actives' },
          { value: 'REMBOURSEES', label: 'Remboursées' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setOnglet(tab.value)}
            className={`text-sm px-3.5 py-1.5 rounded-lg transition ${onglet === tab.value
              ? 'bg-white border border-slate-100 text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:bg-slate-100'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABLEAU */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-slate-400 text-sm p-5">Chargement...</p>
        ) : error ? (
          <p className="text-red-700 text-sm p-5">{error}</p>
        ) : cautionsFiltrees.length === 0 ? (
          <p className="text-slate-400 text-sm p-8 text-center">
            Aucune caution {onglet === 'ACTIVES' ? 'active' : 'remboursée'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-400">Famille</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Téléphone</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Montant</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Donneurs</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Statut</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cautionsFiltrees.map((c) => {
                  const statut = c.statut
                  const pct = Math.round(((c.nb_donneurs_ramenes || 0) / (c.nb_donneurs_attendus || 2)) * 100);
                  const barColor = pct >= 100 ? 'bg-green-600' : pct > 0 ? 'bg-amber-500' : 'bg-red-700';
                  const peutRembourser = c.statut !== 'remboursee';

                  return (
                    <tr key={c.id_caution} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">{c.representant_nom}</td>
                      <td className="px-4 py-3 text-slate-500">{c.representant_telephone}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {(c.montant || 0).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-slate-500 text-xs whitespace-nowrap">
                            {c.nb_donneurs_ramenes || 0} / {c.nb_donneurs_attendus || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUT_BADGE[statut]}`}>
                          {STATUT_LABEL[statut]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button className="text-xs text-blue-600 mr-3">
                          Voir facture
                        </button>
                        {onglet === 'ACTIVES' && (
                          <button
                            onClick={() => peutRembourser && setRembourserCaution(c)}
                            disabled={!peutRembourser}
                            className={`text-xs font-medium ${peutRembourser
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-slate-300 cursor-not-allowed'
                              }`}
                          >
                            Rembourser
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateCautionModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); charger(); }}
        />
      )}

      {rembourserCaution && (
        <RembourserModal
          caution={rembourserCaution}
          onClose={() => setRembourserCaution(null)}
          onSuccess={() => { setRembourserCaution(null); charger(); }}
        />
      )}
    </>
  );
}

function StatCard({ icon, iconBg, label, value }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-400 mb-2">{label}</p>
          <p className="text-2xl font-semibold text-slate-800">{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}