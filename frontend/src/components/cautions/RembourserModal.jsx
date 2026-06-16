import { useState } from 'react';
import api from '../../api/axios';
import Modal from '../stock/Modal';

export default function RembourserModal({ caution, onClose, onSuccess }) {
  const [nbRamenes, setNbRamenes] = useState(caution.nb_donneurs_ramenes || 0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/bank/cautions/${caution.id}/rembourser`, {
        nb_donneurs_ramenes: nbRamenes,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du remboursement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Rembourser — ${caution.famille_nom}`} onClose={onClose}>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-3.5 mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Montant</span>
          <span className="font-medium text-slate-800">
            {(caution.montant || 0).toLocaleString('fr-FR')} FCFA
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Donneurs dus</span>
          <span className="font-medium text-slate-800">{caution.nb_donneurs_dus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Déjà ramenés</span>
          <span className="font-medium text-slate-800">{caution.nb_donneurs_ramenes || 0}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1.5">
            Nombre de donneurs ramenés au total
          </label>
          <input
            type="number"
            required
            min={caution.nb_donneurs_ramenes || 0}
            max={caution.nb_donneurs_dus}
            value={nbRamenes}
            onChange={(e) => setNbRamenes(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Remboursement...' : 'Confirmer le remboursement'}
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