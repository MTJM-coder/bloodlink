import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import api from '../api/axios';
import DonneurDetailModal from '../components/Donneurs/DonneurDetailModal';

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

export default function Donneurs() {
    const [donneurs, setDonneurs] = useState([]);
    const [stats, setStats] = useState({ total: 0, nb_eligibles: 0, nb_non_eligibles: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detailId, setDetailId] = useState(null);


    const [filtres, setFiltres] = useState({
        recherche: '',
        groupe_sanguin: '',
        eligibilite: '',
    });

    const charger = () => {
        setLoading(true);
        const params = Object.fromEntries(
            Object.entries(filtres).filter(([, v]) => v !== '')
        );

        api.get('/bank/donneurs', { params })
            .then((res) => {
                setDonneurs(res.data.donneurs || []);
                setStats({
                    total: res.data.total ?? 0,
                    nb_eligibles: res.data.nb_eligibles ?? 0,
                    nb_non_eligibles: res.data.nb_non_eligibles ?? 0,
                });
            })
            .catch(() => setError('Impossible de charger les donneurs'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timeout = setTimeout(charger, 300);
        return () => clearTimeout(timeout);
    }, [filtres]);

    return (
        <>
            <div>
                <h1 className="text-xl font-semibold text-slate-800">Donneurs</h1>
                <p className="text-sm text-slate-400 mt-1">
                    {stats.total} donneur{stats.total > 1 ? 's' : ''} lié{stats.total > 1 ? 's' : ''} à votre banque
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard label="Total donneurs" value={stats.total} valueColor="text-slate-800" />
                <StatCard label="Éligibles maintenant" value={stats.nb_eligibles} valueColor="text-green-600" />
                <StatCard label="Non éligibles" value={stats.nb_non_eligibles} valueColor="text-slate-400" />
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-2.5 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                    <input
                        type="text"
                        value={filtres.recherche}
                        onChange={(e) => setFiltres((f) => ({ ...f, recherche: e.target.value }))}
                        placeholder="Rechercher un donneur..."
                        className="w-full border border-slate-100 bg-slate-50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20"
                    />
                </div>

                <select
                    value={filtres.groupe_sanguin}
                    onChange={(e) => setFiltres((f) => ({ ...f, groupe_sanguin: e.target.value }))}
                    className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
                >
                    <option value="">Tous les groupes</option>
                    {['O', 'A', 'B', 'AB'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>

                <select
                    value={filtres.eligibilite}
                    onChange={(e) => setFiltres((f) => ({ ...f, eligibilite: e.target.value }))}
                    className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
                >
                    <option value="">Tous les statuts</option>
                    <option value="eligible">Éligible</option>
                    <option value="non_eligible">Non éligible</option>
                    <option value="indisponible">Indisponible</option>
                </select>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <p className="text-slate-400 text-sm p-5">Chargement...</p>
                ) : error ? (
                    <p className="text-red-700 text-sm p-5">{error}</p>
                ) : donneurs.length === 0 ? (
                    <p className="text-slate-400 text-sm p-8 text-center">
                        Aucun donneur ne correspond à ces filtres
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-4 py-3 font-medium text-slate-400">Donneur</th>
                                    <th className="px-4 py-3 font-medium text-slate-400">Groupe</th>
                                    <th className="px-4 py-3 font-medium text-slate-400">Dernier don</th>
                                    <th className="px-4 py-3 font-medium text-slate-400">Dons au total</th>
                                    <th className="px-4 py-3 font-medium text-slate-400">Éligibilité</th>
                                    <th className="px-4 py-3 font-medium text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donneurs.map((d) => (
                                    <tr key={d.id_citoyen} className="border-t border-slate-100">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar nom={d.nom} prenom={d.prenom} eligible={d.eligibilite === 'eligible'} />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{d.prenom} {d.nom}</p>
                                                    <p className="text-xs text-slate-400">{d.telephone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {d.groupe_sanguin}{d.rhesus}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {formatDate(d.date_dernier_don)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{d.nb_dons_total}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full ${ELIGIBILITE_BADGE[d.eligibilite]}`}
                                                title={d.raison || ''}
                                            >
                                                {ELIGIBILITE_LABEL[d.eligibilite]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => setDetailId(d.id_citoyen)} className="text-xs text-blue-600">
                                                Voir fiche
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
    {detailId && (
  <DonneurDetailModal donneurId={detailId} onClose={() => setDetailId(null)} />
)}F
}

function StatCard({ label, value, valueColor }) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 mb-2">{label}</p>
            <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
        </div>
    );
}

function Avatar({ nom, prenom, eligible }) {
    const initiales = `${(prenom?.[0] || '')}${(nom?.[0] || '')}`.toUpperCase();
    const bg = eligible ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500';
    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${bg}`}>
            {initiales}
        </div>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return 'Jamais';
    return new Date(dateStr).toLocaleDateString('fr-FR');
}