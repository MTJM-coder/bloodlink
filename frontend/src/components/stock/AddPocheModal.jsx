import { useState } from 'react';
import api from '../../api/axios';
import Modal from './Modal';

export default function AddPocheModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    groupe_sanguin: 'O',
    rhesus: '+',
    type_produit: 'CGR',
    date_prelevement: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/bank/stock', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Ajouter une poche" onClose={onClose}>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Groupe sanguin</label>
            <select
              value={form.groupe_sanguin}
              onChange={(e) => setForm({ ...form, groupe_sanguin: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              {['O', 'A', 'B', 'AB'].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Rhésus</label>
            <select
              value={form.rhesus}
              onChange={(e) => setForm({ ...form, rhesus: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="+">+</option>
              <option value="-">-</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1.5">Type de produit</label>
          <select
            value={form.type_produit}
            onChange={(e) => setForm({ ...form, type_produit: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="CGR">CGR</option>
            <option value="plasma">Plasma</option>
            <option value="plaquettes">Plaquettes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1.5">Date de prélèvement</label>
          <input
            type="date"
            value={form.date_prelevement}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setForm({ ...form, date_prelevement: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            required
          />
          <p className="text-xs text-slate-400 mt-1.5">
            La date d'expiration sera calculée automatiquement
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer la poche'}
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