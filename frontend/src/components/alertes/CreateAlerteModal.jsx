import { useState } from 'react';
import api from '../../api/axios';
import Modal from '../stock/Modal';

export default function CreateAlerteModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    type_alerte: 'urgence_immediate',
    groupe_sanguin: 'O',
    rhesus: '-',
    rayon: 10,
    type_don_accepte: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await api.post('/bank/alerts', form);
    onSuccess();

  } catch (err) {
    console.log("ERREUR", err);
    setError(err.response?.data?.message || 'Erreur lors de la création');
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal title="Déclarer une alerte" onClose={onClose}>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm text-slate-500 mb-1.5">Type d'alerte</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'urgence_immediate', label: 'Urgence immédiate' },
              { value: 'reconstitution', label: 'Reconstitution' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center justify-center gap-2 border rounded-lg px-3 py-2.5 text-sm cursor-pointer transition ${
                  form.type_alerte === opt.value ? 'border-red-600 bg-red-50/50 text-red-700 font-medium' : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="type_alerte"
                  value={opt.value}
                  checked={form.type_alerte === opt.value}
                  onChange={(e) => setForm({ ...form, type_alerte: e.target.value })}
                  className="hidden"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

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
          <label className="block text-sm text-slate-500 mb-1.5">
            Rayon de recherche : <span className="font-medium text-slate-800">{form.rayon} km</span>
          </label>
          <input
            type="range"
            min={1}
            max={50}
            value={form.rayon}
            onChange={(e) => setForm({ ...form, rayon: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1.5">
            Type de don accepté <span className="text-slate-300">(optionnel)</span>
          </label>
          <input
            type="text"
            value={form.type_don_accepte}
            onChange={(e) => setForm({ ...form, type_don_accepte: e.target.value })}
            placeholder="Ex : don du sang total"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1.5">
            Message <span className="text-slate-300">(optionnel)</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Message affiché aux donneurs..."
            rows={3}
            maxLength={500}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Envoi...' : "Déclarer l'alerte"}
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