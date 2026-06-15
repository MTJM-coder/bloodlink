import { useEffect, useState } from 'react';
import {
  FiBell, FiPackage, FiActivity, FiAlertTriangle,
  FiClock, FiCheck,
} from 'react-icons/fi';
import api from '../api/axios';

const STATUT_BADGE = {
  OK: 'bg-green-50 text-green-700',
  FAIBLE: 'bg-amber-50 text-amber-700',
  CRITIQUE: 'bg-red-50 text-red-700',
  RUPTURE: 'bg-slate-100 text-slate-500',
};

const STATUT_LABEL = {
  OK: 'OK',
  FAIBLE: 'Faible',
  CRITIQUE: 'Critique',
  RUPTURE: 'Rupture',
};

const TYPES = ['Tous', 'CGR', 'plasma', 'plaquettes'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [typeActif, setTypeActif] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bank/stock')
      .then((res) => setData(res.data))
      .catch(() => setError('Impossible de charger le stock'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400 text-sm">Chargement...</p>;
  if (error) return <p className="text-red-700 text-sm">{error}</p>;

  const resume = data?.resume || [];
  const alertes = data?.alertes || [];
  const totalPoches = data?.total_poches ?? 0;

  const nbOk = resume.filter((g) => g.statut === 'OK').length;
  const nbFaible = resume.filter((g) => g.statut === 'FAIBLE').length;
  const nbCritique = resume.filter((g) => g.statut === 'CRITIQUE' || g.statut === 'RUPTURE').length;
  const totalGroupes = resume.length || 1;
  const tauxDispo = Math.round((nbOk / totalGroupes) * 100);

  // Stock par type (proportions)
  const totalParType = {};
  resume.forEach((g) => {
    totalParType[g.type_produit] = (totalParType[g.type_produit] || 0) + g.quantite;
  });
  const totalGlobal = Object.values(totalParType).reduce((a, b) => a + b, 0) || 1;

  const resumeFiltre = typeActif === 'Tous'
    ? resume
    : resume.filter((g) => g.type_produit === typeActif);

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Tableau de bord</h1>
          <p className="text-sm text-slate-400 mt-1">
            {data?.banque} — vue d'ensemble du stock en temps réel
          </p>
        </div>
        <button className="bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto">
          <FiBell size={16} />
          Déclarer une alerte
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<FiPackage size={18} />}
          iconBg="bg-red-50 text-red-600"
          label="Total poches"
          value={totalPoches}
          note="+12% ce mois"
          noteColor="text-green-600"
        />
        <StatCard
          icon={<FiActivity size={18} />}
          iconBg="bg-green-50 text-green-600"
          label="Groupes OK"
          value={nbOk}
          note={`sur ${totalGroupes} groupes suivis`}
          noteColor="text-slate-400"
        />
        <StatCard
          icon={<FiAlertTriangle size={18} />}
          iconBg="bg-amber-50 text-amber-600"
          label="Stocks critiques"
          value={nbCritique}
          note={nbCritique > 0 ? 'action requise' : 'rien à signaler'}
          noteColor={nbCritique > 0 ? 'text-amber-600' : 'text-slate-400'}
        />
        <StatCard
          icon={<FiClock size={18} />}
          iconBg="bg-blue-50 text-blue-600"
          label="Alertes expiration"
          value={alertes.length}
          note={alertes.length > 0 ? 'à vérifier' : 'rien à signaler'}
          noteColor={alertes.length > 0 ? 'text-red-600' : 'text-slate-400'}
        />
      </div>

      {/* ETAT DU STOCK + STOCK PAR TYPE */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-3">

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-base font-semibold text-slate-800 mb-3.5">État du stock</p>

          <div className="flex flex-col gap-2.5 mb-4">
            <EtatRow couleur="bg-green-600" label="Groupes OK" valeur={nbOk} />
            <EtatRow couleur="bg-amber-500" label="Groupes faibles" valeur={nbFaible} />
            <EtatRow couleur="bg-red-700" label="Groupes critiques" valeur={nbCritique} />
          </div>

          <div className="border-t border-slate-100 pt-3.5">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-400">Taux de disponibilité</span>
              <span className="text-sm font-semibold text-slate-800">{tauxDispo}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all"
                style={{ width: `${tauxDispo}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-base font-semibold text-slate-800 mb-4">Stock par type</p>

          <div className="flex flex-col gap-3.5">
            {['CGR', 'plasma', 'plaquettes'].map((type) => {
              const valeur = totalParType[type] || 0;
              const pct = Math.round((valeur / totalGlobal) * 100);
              const couleurs = {
                CGR: 'bg-red-600',
                plasma: 'bg-blue-600',
                plaquettes: 'bg-amber-500',
              };
              return (
                <div key={type}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-slate-600">{type}</span>
                    <span className="text-sm font-medium text-slate-800">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${couleurs[type]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STOCK PAR GROUPE */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3.5">
          <p className="text-base font-semibold text-slate-800">Stock par groupe sanguin</p>
          <div className="flex gap-2 overflow-x-auto">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeActif(type)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  typeActif === type
                    ? 'bg-slate-100 text-slate-800 font-medium'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {resumeFiltre.map((g) => (
            <div
              key={`${g.groupe}${g.rhesus}-${g.type_produit}`}
              className="border border-slate-100 rounded-xl px-3.5 py-3 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {g.groupe}{g.rhesus}{' '}
                  <span className="text-xs text-slate-400 font-normal">{g.type_produit}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {g.quantite} poche{g.quantite > 1 ? 's' : ''}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUT_BADGE[g.statut] || STATUT_BADGE.RUPTURE}`}>
                {STATUT_LABEL[g.statut] || g.statut}
              </span>
            </div>
          ))}

          {resumeFiltre.length === 0 && (
            <p className="text-sm text-slate-400 col-span-full text-center py-6">
              Aucune donnée pour ce filtre
            </p>
          )}
        </div>
      </div>

      {/* EXPIRATIONS */}
      {alertes.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <FiCheck size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Aucune poche proche de l'expiration
          </p>
          <p className="text-xs text-slate-400">
            Toutes les poches ont plus de 7 jours avant expiration.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3.5">
            <FiClock className="text-slate-400" size={18} />
            <p className="text-base font-semibold text-slate-800">
              Poches proches de l'expiration
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-left">
                  <th className="py-2 font-medium">Groupe</th>
                  <th className="py-2 font-medium">Expiration</th>
                  <th className="py-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {alertes.map((a) => {
                  const urgent = a.type === 'EXPIRATION_J3_URGENT';
                  return (
                    <tr key={a.id_poche} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 font-medium text-slate-800">{a.groupe}</td>
                      <td className="py-2.5 text-slate-500">
                        Dans {a.jours_restants} jour{a.jours_restants > 1 ? 's' : ''}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgent ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                          {urgent ? 'J-3 urgent' : 'J-7'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ icon, iconBg, label, value, note, noteColor }) {
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
      <p className={`text-xs mt-2.5 ${noteColor}`}>{note}</p>
    </div>
  );
}

function EtatRow({ couleur, label, valeur }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${couleur}`} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-800">{valeur}</span>
    </div>
  );
}