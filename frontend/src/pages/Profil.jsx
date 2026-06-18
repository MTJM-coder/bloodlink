import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Profil() {
    const [banque, setBanque] = useState(null);
    const [form, setForm] = useState({ quartier: '', ville: '', telephone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [passwordForm, setPasswordForm] = useState({
        mot_de_passe_actuel: '',
        nouveau_mot_de_passe: '',
        nouveau_mot_de_passe_confirmation: '',
    });
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdSaving, setPwdSaving] = useState(false);

    useEffect(() => {
        api.get('/bank/profil')
            .then((res) => {
                const b = res.data.banque;
                setBanque(b);
                setForm({
                    quartier: b.quartier || '',
                    ville: b.ville || '',
                    telephone: b.telephone || '',
                });
            })
            .catch(() => setError('Impossible de charger le profil'))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const res = await api.put('/bank/profil', form);
            setBanque(res.data.banque);
            setSuccess('Profil mis à jour avec succès');

            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            if (stored.banque) {
                stored.banque = { ...stored.banque, ...form };
                localStorage.setItem('user', JSON.stringify(stored));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleAnnuler = () => {
        if (!banque) return;
        setForm({
            quartier: banque.quartier || '',
            ville: banque.ville || '',
            telephone: banque.telephone || '',
        });
        setError('');
        setSuccess('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess('');

        if (passwordForm.nouveau_mot_de_passe !== passwordForm.nouveau_mot_de_passe_confirmation) {
            setPwdError('Les mots de passe ne correspondent pas');
            return;
        }

        setPwdSaving(true);
        try {
            await api.put('/bank/profil/password', passwordForm);
            setPwdSuccess('Mot de passe mis à jour');
            setPasswordForm({
                mot_de_passe_actuel: '',
                nouveau_mot_de_passe: '',
                nouveau_mot_de_passe_confirmation: '',
            });
        } catch (err) {
            setPwdError(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setPwdSaving(false);
        }
    };

    if (loading) return <p className="text-slate-400 text-sm">Chargement...</p>;
    if (error && !banque) return <p className="text-red-700 text-sm">{error}</p>;

    const initiales = (banque?.nom || '')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <>
            <div>
                <h1 className="text-xl font-semibold text-slate-800">Profil</h1>
                <p className="text-sm text-slate-400 mt-1">Informations de votre banque de sang</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-3">

                {/* CARTE IDENTITE */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-500 mb-3">
                        {initiales}
                    </div>
                    <p className="text-base font-semibold text-slate-800">{banque?.nom}</p>
                    <p className="text-xs text-slate-400 mt-1 mb-2.5">
                        {banque?.ville}{banque?.quartier && `, ${banque.quartier}`}
                    </p>
                    <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        {banque?.type_banque === 'district' ? 'Banque de district' : 'Banque reconnue'}
                    </span>

                    <div className="w-full border-t border-slate-100 mt-4 pt-4 flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                        <span className="text-xs text-green-600 font-medium">
                            {banque?.statut === 'active' ? 'Compte actif' : banque?.statut}
                        </span>
                    </div>
                </div>

                {/* FORMULAIRE INFOS */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-base font-semibold text-slate-800 mb-3.5">Informations générales</p>

                    {error && (
                        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Nom de la banque</label>
                            <input
                                value={banque?.nom || ''}
                                readOnly
                                className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Quartier</label>
                                <input
                                    value={form.quartier}
                                    onChange={(e) => setForm({ ...form, quartier: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Ville</label>
                                <input
                                    value={form.ville}
                                    onChange={(e) => setForm({ ...form, ville: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Téléphone</label>
                                <input
                                    value={form.telephone}
                                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                                <input
                                    value={banque?.email || ''}
                                    readOnly
                                    className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={handleAnnuler}
                                className="border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                            >
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* SECURITE */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <p className="text-base font-semibold text-slate-800 mb-3.5">Sécurité</p>

                {pwdError && (
                    <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                        {pwdError}
                    </div>
                )}
                {pwdSuccess && (
                    <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                        {pwdSuccess}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Mot de passe actuel</label>
                        <input
                            type="password"
                            value={passwordForm.mot_de_passe_actuel}
                            onChange={(e) => setPasswordForm({ ...passwordForm, mot_de_passe_actuel: e.target.value })}
                            placeholder="********"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Nouveau mot de passe</label>
                        <input
                            type="password"
                            value={passwordForm.nouveau_mot_de_passe}
                            onChange={(e) => setPasswordForm({ ...passwordForm, nouveau_mot_de_passe: e.target.value })}
                            placeholder="********"
                            minLength={8}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={pwdSaving}
                        className="bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg h-[36px] disabled:opacity-50"
                    >
                        {pwdSaving ? 'Mise à jour...' : 'Mettre à jour'}
                    </button>

                    <div className="sm:col-span-3 -mt-1">
                        <label className="block text-xs text-slate-400 mb-1.5">Confirmer le nouveau mot de passe</label>
                        <input
                            type="password"
                            value={passwordForm.nouveau_mot_de_passe_confirmation}
                            onChange={(e) => setPasswordForm({ ...passwordForm, nouveau_mot_de_passe_confirmation: e.target.value })}
                            placeholder="********"
                            minLength={8}
                            className="w-full sm:w-1/3 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            required
                        />
                    </div>
                </form>
            </div>
        </>
    );
}