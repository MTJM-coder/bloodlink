const TYPE_BADGE = {
  urgence_immediate: { label: 'Urgente', className: 'bg-red-50 text-red-800' },
 reconstitution: { label: 'Reconstitution', className: 'bg-amber-50 text-amber-800' },
};

const GROUPE_ICON_BG = {
  urgence_immediate: 'bg-red-50 text-red-600',
  reconstitution: 'bg-blue-50 text-blue-600',
};

export default function AlerteCard({ alerte, onCloturer }) {
  const badge = TYPE_BADGE[alerte.type_alerte] || TYPE_BADGE.reconstitution;
  const iconBg = GROUPE_ICON_BG[alerte.type_alerte] || GROUPE_ICON_BG.reconstitution;
  const reponses = alerte.reponsesAlertes || [];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-3.5 gap-3">
        <div className="flex gap-3 items-center min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 ${iconBg}`}>
            {alerte.groupe_sanguin}{alerte.rhesus}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {alerte.type_alerte === 'URGENCE_IMMEDIATE' ? 'Urgence immédiate' : 'Reconstitution de stock'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Créée le {formatDateHeure(alerte.created_at)}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        <MiniStat label="Rayon de recherche" value={`${alerte.rayon_km} km`} />
        <MiniStat label="Donneurs notifiés" value={alerte.nb_citoyens_notifies ?? '—'} />
        <MiniStat label="Réponses reçues" value={reponses.length} valueColor="text-green-600" />
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
        <div className="flex -space-x-1.5">
          {reponses.slice(0, 3).map((r, i) => (
            <div
              key={i}
              className="w-6.5 h-6.5 w-[26px] h-[26px] rounded-full bg-green-50 border-2 border-white flex items-center justify-center text-[11px] font-semibold text-green-700"
            >
              {initiales(r.citoyen)}
            </div>
          ))}
          {reponses.length > 3 && (
            <div className="w-[26px] h-[26px] rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[11px] font-semibold text-slate-500">
              +{reponses.length - 3}
            </div>
          )}
          {reponses.length === 0 && (
            <span className="text-xs text-slate-400">Aucune réponse pour le moment</span>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {reponses.length > 0 && (
            <button className="text-xs font-medium text-blue-600">
              Voir les réponses
            </button>
          )}
          {alerte.statut === 'active' && (
            <button
              onClick={() => onCloturer(alerte.id)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clôturer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, valueColor = 'text-slate-800' }) {
  return (
    <div className="border border-slate-100 rounded-lg px-3 py-2.5">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-medium ${valueColor}`}>{value}</p>
    </div>
  );
}

function initiales(citoyen) {
  if (!citoyen) return '?';
  return citoyen.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDateHeure(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}