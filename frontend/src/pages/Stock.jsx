import { useEffect, useState } from 'react';
import { FiPlus, FiArchive, FiEdit2 } from 'react-icons/fi';
import api from '../api/axios';
import AddPocheModal from '../components/stock/AddPocheModal';
import EditStatutModal from '../components/stock/EditStatutModal';
import ArchivePocheModal from '../components/stock/ArchivePocheModal';

const STATUT_BADGE = {
  disponible: 'bg-green-50 text-green-700',
  utilisee: 'bg-amber-50 text-amber-700',
  expiree: 'bg-slate-100 text-slate-500',
  rejetee: 'bg-red-50 text-red-700',
};

const STATUT_LABEL = {
  disponible: 'Disponible',
  utilisee: 'Utilisée',
  expiree: 'Expirée',
  rejetee: 'Rejetée',
};

export default function Stock() {
  const [poches, setPoches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtres, setFiltres] = useState({
    groupe_sanguin: '',
    rhesus: '',
    type_produit: '',
    statut: '',
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editPoche, setEditPoche] = useState(null);
  const [archivePoche, setArchivePoche] = useState(null);

  const chargerPoches = () => {
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries(filtres).filter(([, v]) => v !== '')
    );

    api.get('/bank/stock', { params })
      .then((res) => setPoches(res.data.poches || []))
      .catch(() => setError('Impossible de charger le stock'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    chargerPoches();
  }, [filtres]);

  const handleFiltre = (champ, valeur) => {
    setFiltres((f) => ({ ...f, [champ]: valeur }));
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Stock de poches</h1>
          <p className="text-sm text-slate-400 mt-1">
            {poches.length} poche{poches.length > 1 ? 's' : ''} affichée{poches.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <FiPlus size={16} />
          Ajouter une poche
        </button>
      </div>

      {/* FILTRES */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-2.5 items-center">
        <select
          value={filtres.groupe_sanguin}
          onChange={(e) => handleFiltre('groupe_sanguin', e.target.value)}
          className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
        >
          <option value="">Tous les groupes</option>
          {['O', 'A', 'B', 'AB'].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          value={filtres.rhesus}
          onChange={(e) => handleFiltre('rhesus', e.target.value)}
          className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
        >
          <option value="">Tous les rhésus</option>
          <option value="+">+</option>
          <option value="-">-</option>
        </select>

        <select
          value={filtres.type_produit}
          onChange={(e) => handleFiltre('type_produit', e.target.value)}
          className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
        >
          <option value="">Tous les types</option>
          <option value="CGR">CGR</option>
          <option value="plasma">Plasma</option>
          <option value="plaquettes">Plaquettes</option>
        </select>

        <select
          value={filtres.statut}
          onChange={(e) => handleFiltre('statut', e.target.value)}
          className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
        >
          <option value="">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="utilisee">Utilisée</option>
          <option value="expiree">Expirée</option>
          <option value="rejetee">Rejetée</option>
        </select>
      </div>

      {/* TABLEAU */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-slate-400 text-sm p-5">Chargement...</p>
        ) : error ? (
          <p className="text-red-700 text-sm p-5">{error}</p>
        ) : poches.length === 0 ? (
          <p className="text-slate-400 text-sm p-8 text-center">
            Aucune poche ne correspond à ces filtres
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-400">Groupe</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Prélèvement</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Expiration</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Statut</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {poches.map((p) => {
                  const peutModifier = p.statut === 'disponible';
                  return (
                    <tr key={p.id_poche} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.groupe_sanguin}{p.rhesus}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.type_produit}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(p.date_prelevement)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(p.date_expiration)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUT_BADGE[p.statut] || STATUT_BADGE.EXPIREE}`}>
                          {STATUT_LABEL[p.statut] || p.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => peutModifier && setEditPoche(p)}
                          disabled={!peutModifier}
                          className={`inline-flex items-center gap-1 text-xs mr-3 ${
                            peutModifier ? 'text-blue-600' : 'text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <FiEdit2 size={13} />
                          Modifier
                        </button>
                        <button
                          onClick={() => setArchivePoche(p)}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                        >
                          <FiArchive size={13} />
                          Archiver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALES */}
      {showAdd && (
        <AddPocheModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); chargerPoches(); }}
        />
      )}

      {editPoche && (
        <EditStatutModal
          poche={editPoche}
          onClose={() => setEditPoche(null)}
          onSuccess={() => { setEditPoche(null); chargerPoches(); }}
        />
      )}

      {archivePoche && (
        <ArchivePocheModal
          poche={archivePoche}
          onClose={() => setArchivePoche(null)}
          onSuccess={() => { setArchivePoche(null); chargerPoches(); }}
        />
      )}
    </>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}