import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiActivity,
  FiDroplet,
} from 'react-icons/fi';
import api from '../api/axios';

export default function Login() {
  const [email_or_phone, setEmail_or_phone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email_or_phone,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if(user.role==='citoyen') {
        navigate('/citoyen/dashboard');
      }else{
        navigate('/bank/dashboard')
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'identifiants incorrect'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white p-12">

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <FiDroplet size={28} />
              </div>

              <div>
                <h1 className="text-4xl font-bold">
                  BloodLink
                </h1>

                <p className="text-red-100 text-sm">
                  Plateforme nationale de gestion du sang
                </p>
              </div>
            </div>

            <h2 className="text-5xl font-bold leading-tight mb-6">
              Trouver du sang ne devrait jamais être une urgence.
            </h2>

            <p className="text-red-100 text-lg leading-relaxed">
              BloodLink connecte les banques de sang,
              les donneurs et les établissements de santé
              afin de faciliter l'accès aux produits sanguins
              partout au Cameroun.
            </p>
          </div>

          <div className="space-y-5">

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <FiActivity size={20} />
                <h3 className="font-semibold">
                  Disponibilité en temps réel
                </h3>
              </div>

              <p className="text-red-100 text-sm">
                Consultez instantanément les stocks
                sanguins disponibles dans les banques partenaires.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">

              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold">1500+</p>
                <p className="text-xs text-red-100">
                  Donneurs
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold">32</p>
                <p className="text-xs text-red-100">
                  Banques
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-xs text-red-100">
                  Disponibilité
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center p-8 md:p-12">

          <div className="w-full max-w-md">

            <div className="text-center lg:text-left mb-8">

              <div className="lg:hidden flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white">
                  <FiDroplet size={26} />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                Connexion
              </h2>

              <p className="text-gray-500 mt-2">
                Connectez-vous à votre espace BloodLink.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    required
                    value={email_or_phone}
                    onChange={(e) =>
                      setEmail_or_phone(e.target.value)
                    }
                    placeholder="banque@bloodlink.cm"
                    className="w-full border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  py-3
                  rounded-xl
                  bg-gradient-to-r
                  from-red-600
                  to-red-700
                  text-white
                  font-semibold
                  shadow-lg
                  hover:scale-[1.01]
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-50
                "
              >
                {loading ? (
                  'Connexion...'
                ) : (
                  <>
                    Se connecter
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-400">
              © 2026 BloodLink — Douala, Cameroun
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}