import { useState } from 'react';
import { FiX, FiPrinter, FiDownload } from 'react-icons/fi';
import api from '../../api/axios';

export default function FactureModal({ cautionId, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useState(() => {
    api.get(`/bank/cautions/${cautionId}/facture`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setPdfUrl(url);
      })
      .catch(() => setError('Impossible de charger la facture'))
      .finally(() => setLoading(false));
  }, []);

  const handleImprimer = () => {
    const iframe = document.getElementById('facture-iframe');
    iframe.contentWindow.print();
  };

  const handleTelecharger = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', `facture_caution_${cautionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl h-[85vh] flex flex-col">

        <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100">
          <p className="text-base font-semibold text-slate-800">Facture de caution</p>
          <div className="flex items-center gap-3">
            {pdfUrl && (
              <>
                <button onClick={handleImprimer} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800">
                  <FiPrinter size={16} /> Imprimer
                </button>
                <button onClick={handleTelecharger} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700">
                  <FiDownload size={16} /> Télécharger
                </button>
              </>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <p className="text-slate-400 text-sm p-5">Chargement de la facture...</p>
          ) : error ? (
            <p className="text-red-700 text-sm p-5">{error}</p>
          ) : (
            <iframe
              id="facture-iframe"
              src={pdfUrl}
              title="Facture"
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}