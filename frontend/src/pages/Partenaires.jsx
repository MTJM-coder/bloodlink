import { useEffect, useState } from 'react';
import { FiPhone, FiHome } from 'react-icons/fi';
import api from '../api/axios';

const STATUT_BADGE = {
    OK: 'bg-green-50 text-green-700',
    FAIBLE: 'bg-amber-50 text-amber-700',
    CRITIQUE: 'bg-red-50 text-red-700',
    RUPTURE: 'bg-slate-100 text-slate-500',
};

const TYPE_BADGE = {
    reconnue: 'bg-green-50 text-green-700',
    district: 'bg-slate-100 text-slate-500',
};

const TYPE_LABEL = {
    reconnue: 'Reconnue',
    district: 'District',
};

export default function Partenaires() {
    const [banques, setBanques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtres, setFiltres] = useState({ groupe_sanguin: '', rhesus: '' });

    const charger = () => {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const banqueLat = user?.banque?.latitude;
        const banqueLng = user?.banque?.longitude;

        const params = {
            lat: banqueLat,
            lng: banqueLng,
            rayon: 20,
            ...(filtres.groupe_sanguin && { groupe_sanguin: filtres.groupe_sanguin }),
            ...(filtres.rhesus && { rhesus: filtres.rhesus }),
        };

        api.get('/bank/partenaires', { params })
            .then((res) => setBanques(res.data.resultats || res.data.data || []))
            .catch((err) => {
                console.log("ERREUR COMPLETE :", err);
                console.log("REPONSE :", err.response);
                console.log("DATA :", err.response?.data);

                setError(
                    err.response?.data?.message ||
                    'Impossible de charger les banques partenaires'
                );
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        charger();
    }, [filtres]);

    return (
        <>
            {/* HEADER */}
            <div>
                <h1 className="text-xl font-semibold text-slate-800">Partenaires</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Stock des banques partenaires à Douala
                </p>
            </div>

            {/* FILTRES */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-2.5 items-center">
                <select
                    value={filtres.groupe_sanguin}
                    onChange={(e) => setFiltres((f) => ({ ...f, groupe_sanguin: e.target.value }))}
                    className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
                >
                    <option value="">Tous les groupes</option>
                    {['O', 'A', 'B', 'AB'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>

                <select
                    value={filtres.rhesus}
                    onChange={(e) => setFiltres((f) => ({ ...f, rhesus: e.target.value }))}
                    className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
                >
                    <option value="">Tous les rhésus</option>
                    <option value="+">+</option>
                    <option value="-">-</option>
                </select>
            </div>

            {/* LISTE */}
            {loading ? (
                <p className="text-slate-400 text-sm">Chargement...</p>
            ) : error ? (
                <p className="text-red-700 text-sm">{error}</p>
            ) : banques.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center">
                    <p className="text-sm font-semibold text-slate-800 mb-1">
                        Aucune banque partenaire trouvée
                    </p>
                    <p className="text-xs text-slate-400">
                        Essayez d'élargir les filtres.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {banques.map((b) => (
                        <BanqueCard key={b.id} banque={b} />
                    ))}
                </div>
            )}
        </>
    );
}

function BanqueCard({ banque }) {
    const stockParGroupe = banque.stock?.par_groupe
        ? Object.entries(banque.stock.par_groupe)
        : [];

    const typeBanque = banque.type_banque || 'reconnue';
    const statutGlobal = banque.stock?.statut || 'OK';


    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-3.5 gap-2">
                <div className="flex gap-2.5 items-center min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <FiHome size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{banque.nom}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {banque.quartier}{banque.distance_km != null && `, ${banque.distance_km} km`}
                        </p>
                    </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${TYPE_BADGE[typeBanque] || TYPE_BADGE.reconnue}`}>
                    {TYPE_LABEL[typeBanque] || typeBanque}
                </span>
            </div>

            {/* STOCK */}
            <div className="flex flex-col gap-2 mb-4 flex-1">
                {stockParGroupe.length === 0 ? (
                    <div className="border border-slate-100 rounded-lg px-3 py-2 flex justify-between items-center">
                        <span className="text-sm text-slate-400">Aucun stock disponible</span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUT_BADGE.RUPTURE}`}>
                            Rupture
                        </span>
                    </div>
                ) : (
                    stockParGroupe.map(([groupe, data]) => (
                        <div
                            key={groupe}
                            className="border border-slate-100 rounded-lg p-3"
                        >
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-red-600">
                                    {groupe}
                                </span>

                                <span className="text-xs text-slate-500">
                                    {data.total} poche{data.total > 1 ? 's' : ''}
                                </span>
                            </div>

                            {Object.entries(data.types).map(([type, qte]) => (
                                <div
                                    key={type}
                                    className="flex justify-between text-xs text-slate-500 ml-2"
                                >
                                    <span>{type}</span>
                                    <span>{qte}</span>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center gap-2">
                <span className="text-sm text-slate-500 truncate">{banque.telephone}</span>
                <a href={`tel:${banque.telephone}`}
                    className="bg-red-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 flex-shrink-0"
                >
                    <FiPhone size={13} />
                    Appeler
                </a>
            </div>
        </div>
    );
}