import { FiX } from 'react-icons/fi';

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <p className="text-base font-semibold text-slate-800">{title}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <FiX size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}