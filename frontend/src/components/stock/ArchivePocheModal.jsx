import { useState } from 'react';
import api from '../../api/axios';
import Modal from './Modal';

const SUGGESTIONS = [
  'expiration',
  'transfert',
  'destruction',
  'correction_erreur',
  'perte',
  'rejet_medical',
];

export default function ArchivePocheModal({ poche, onClose, onSuccess }) {
  const [raisonArchivage, setRaisonArchivage] = useState('');
  const [raisonDetail, setRaisonDetail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (raisonDetail.trim().length < 10) {
      setError("L'explication doit contenir au moins 10 caractères");
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.delete(`/bank/poches/${poche.id}/archive`, {
        data: {
          raison_archivage: raisonArchivage || null,
          raison_detail: raisonDetail,
        },
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'archivage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Archiver ${poche.groupe_sanguin}${poche.rhesus} — ${poche.type_produit}`} onClose={onClose}>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1.5">
            Motif (suggestions, libre sinon)
          </label>
          <input
            type="text"
            list="motif-suggestions"
            value={raisonArchivage}
            onChange={(e) => setRaisonArchivage(e.target.value)}
            placeholder="expiration, transfert, correction_erreur..."
            maxLength={100}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <datalist id="motif-suggestions">
            {SUGGESTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1.5">
            Explication détaillée *
          </label>
          <textarea
            value={raisonDetail}
            onChange={(e) => setRaisonDetail(e.target.value)}
            placeholder="Pourquoi archivez-vous cette poche ?"
            rows={3}
            maxLength={500}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">{raisonDetail.length}/500 — min. 10 caractères</p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Archivage...' : 'Archiver'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-lg"
          >
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}