import { useState } from 'react';
import api from '../../api/axios';
import Modal from '../stock/Modal';

export default function CreateCautionModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    famille_nom: '',
    famille_telephone: '',
    montant: 30000,
    nb_donneurs_attendus: 2,
    id_poche: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/bank/cautions', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Enregistrer une caution" onClose={onClose}>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1.5">Nom de la famille</label>
          <input
            type="text"
            required
            value={form.famille_nom}
            onChange={(e) => setForm({ ...form, famille_nom: e.target.value })}
            placeholder="Ex : Famille Mballa"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1.5">Téléphone</label>
          <input
            type="tel"
            required
            value={form.famille_telephone}
            onChange={(e) => setForm({ ...form, famille_telephone: e.target.value })}
            placeholder="+237 6 XX XX XX XX"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Montant (FCFA)</label>
            <input
              type="number"
              required
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Donneurs dus</label>
            <input
              type="number"
              required
              min={1}
              value={form.nb_donneurs_attendus}
              onChange={(e) => setForm({ ...form, nb_donneurs_attendus: Number(e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1.5">
            ID Poche concernée
            <span className="text-slate-300 ml-1">(optionnel)</span>
          </label>
          <input
            type="number"
            value={form.id_poche}
            onChange={(e) => setForm({ ...form, id_poche: e.target.value })}
            placeholder="ID de la poche de sang"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
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