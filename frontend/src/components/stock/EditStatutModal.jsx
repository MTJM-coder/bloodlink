import { useState } from 'react';
import api from '../../api/axios';
import Modal from './Modal';

const OPTIONS = [
  { value: 'utilisee', label: 'Utilisée — don confirmé' },
  { value: 'expiree', label: 'Expirée' },
  { value: 'rejetee', label: 'Rejetée — non conforme' },
];

export default function EditStatutModal({ poche, onClose, onSuccess }) {
  const [statut, setStatut] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statut) return;

    setError('');
    setLoading(true);

    try {
      await api.put(`/bank/poches/${poche.id}/status`, { statut });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Modifier ${poche.groupe_sanguin}${poche.rhesus} — ${poche.type_produit}`} onClose={onClose}>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1.5">Nouveau statut</label>
          <div className="space-y-2">
            {OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2.5 border rounded-lg px-3 py-2.5 text-sm cursor-pointer transition ${
                  statut === opt.value ? 'border-red-600 bg-red-50/50' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="statut"
                  value={opt.value}
                  checked={statut === opt.value}
                  onChange={(e) => setStatut(e.target.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading || !statut}
            className="flex-1 bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Mise à jour...' : 'Confirmer'}
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