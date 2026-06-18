import { useEffect, useState } from 'react';
import { FiPhone, FiMail, FiCalendar, FiDroplet } from 'react-icons/fi';
import api from '../../api/axios';
import Modal from '../stock/Modal';

const ELIGIBILITE_BADGE = {
  eligible: 'bg-green-50 text-green-700',
  non_eligible: 'bg-amber-50 text-amber-700',
  indisponible: 'bg-slate-100 text-slate-500',
};

const ELIGIBILITE_LABEL = {
  eligible: 'Éligible',
  non_eligible: 'Non éligible',
  indisponible: 'Indisponible',
};

export default function DonneurDetailModal({ donneurId, onClose }) {
  const [donneur, setDonneur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/banque/donneurs/${donneurId}`)
      .then((res) => setDonneur(res.data.donneur))
      .catch(() => setError('Impossible de charger ce donneur'))
      .finally(() => setLoading(false));
  }, [donneurId]);

  return (
    <Modal title="Fiche donneur" onClose={onClose}>
      {loading ? (
        <p className="text-slate-400 text-sm">Chargement...</p>
      ) : error ? (
        <p className="text-red-700 text-sm">{error}</p>
      ) : donneur ? (
        <div className="space-y-4">

          {/* IDENTITE */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center text-base font-semibold flex-shrink-0">
              {(donneur.prenom?.[0] || '') + (donneur.nom?.[0] || '')}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                {donneur.prenom} {donneur.nom}
              </p>
              <p className="text-xs text-slate-400">
                {donneur.age ? `${donneur.age} ans` : ''}
              </p>
            </div>
            <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${ELIGIBILITE_BADGE[donneur.eligibilite]}`}>
              {ELIGIBILITE_LABEL[donneur.eligibilite]}
            </span>
          </div>

          {donneur.raison && (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              {donneur.raison}
            </p>
          )}

          {/* CONTACT */}
          <div className="grid grid-cols-2 gap-2.5">
            <InfoItem icon={<FiPhone size={14} />} label="Téléphone" value={donneur.telephone} />
            <InfoItem icon={<FiMail size={14} />} label="Email" value={donneur.email || '—'} />
            <InfoItem icon={<FiDroplet size={14} />} label="Groupe sanguin" value={`${donneur.groupe_sanguin}${donneur.rhesus}`} />
            <InfoItem icon={<FiCalendar size={14} />} label="Dernier don" value={formatDate(donneur.date_dernier_don)} />
          </div>

          {/* HISTORIQUE DONS */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2">
              Historique des dons ({donneur.historique_dons?.length || 0})
            </p>

            {!donneur.historique_dons || donneur.historique_dons.length === 0 ? (
              <p className="text-sm text-slate-400 border border-slate-100 rounded-lg p-3 text-center">
                Aucun don enregistré dans votre banque
              </p>
            ) : (
              <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
                {donneur.historique_dons.map((d) => (
                  <div key={d.id_don} className="flex justify-between items-center px-3 py-2.5">
                    <span className="text-sm text-slate-700">{d.type_don}</span>
                    <span className="text-xs text-slate-400">{formatDate(d.date_don)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : null}
    </Modal>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="border border-slate-100 rounded-lg px-3 py-2.5">
      <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return 'Jamais';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}