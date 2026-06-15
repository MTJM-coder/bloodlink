import {
FiDroplet,
FiSearch,
FiMapPin,
FiBell,
FiBox,
FiUsers,
FiArrowRight,
FiPhone,
FiShield,
} from "react-icons/fi";

export default function Home() {
return ( <div className="bg-slate-50 min-h-screen">

  {/* NAVBAR */}
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center text-white">
          <FiDroplet size={22} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            BloodLink
          </h1>
          <p className="text-xs text-slate-500">
            Plateforme nationale
          </p>
        </div>
      </div>

      <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
        <a href="#">Accueil</a>
        <a href="#">Banques de sang</a>
        <a href="#">Alertes</a>
        <a href="#">Contact</a>
      </div>

      <a
        href="/login"
        className="bg-red-600 text-white px-5 py-3 rounded-xl font-medium"
      >
        Connexion
      </a>
    </div>
  </nav>

  {/* HERO */}
  <section className="max-w-7xl mx-auto px-6 py-20">

    <div className="grid lg:grid-cols-2 gap-16 items-center">

      <div>

        <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <FiDroplet />
          Réseau national des banques de sang
        </span>

        <h2 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
          Trouvez rapidement du sang et
          sauvez des vies.
        </h2>

        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          BloodLink permet aux citoyens, hôpitaux et banques de sang
          de localiser instantanément les poches disponibles
          partout au Cameroun.
        </p>

        <div className="flex flex-wrap gap-4">
          <button className="bg-red-600 text-white px-7 py-4 rounded-xl font-semibold flex items-center gap-2">
            Rechercher du sang
            <FiArrowRight />
          </button>

          <button className="border border-slate-300 px-7 py-4 rounded-xl font-semibold">
            Devenir donneur
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

        <h3 className="text-xl font-semibold mb-6">
          Rechercher une disponibilité
        </h3>

        <div className="space-y-4">

          <select className="w-full border rounded-xl px-4 py-3">
            <option>Groupe sanguin</option>
            <option>O</option>
            <option>A</option>
            <option>B</option>
            <option>AB</option>
          </select>

          <select className="w-full border rounded-xl px-4 py-3">
            <option>Rhésus</option>
            <option>+</option>
            <option>-</option>
          </select>

          <input
            placeholder="Ville"
            className="w-full border rounded-xl px-4 py-3"
          />

          <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold flex justify-center items-center gap-2">
            <FiSearch />
            Rechercher
          </button>
        </div>
      </div>
    </div>
  </section>

  {/* STATS */}
  <section className="max-w-7xl mx-auto px-6 pb-20">

    <div className="grid md:grid-cols-4 gap-6">

      {[
        ["85", "Banques connectées"],
        ["18 900", "Poches suivies"],
        ["2 540", "Donneurs actifs"],
        ["430", "Urgences traitées"],
      ].map(([value, label]) => (
        <div
          key={label}
          className="bg-white rounded-2xl p-8 border border-slate-200"
        >
          <h3 className="text-4xl font-bold text-red-600">
            {value}
          </h3>

          <p className="text-slate-500 mt-2">
            {label}
          </p>
        </div>
      ))}
    </div>
  </section>

  {/* FEATURES */}
  <section className="bg-white py-20">

    <div className="max-w-7xl mx-auto px-6">

      <div className="text-center mb-14">
        <h2 className="text-4xl font-bold text-slate-900">
          Fonctionnalités principales
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">

        {[
          {
            icon: <FiSearch />,
            title: "Recherche intelligente",
            text: "Localisez rapidement les banques disposant du groupe sanguin recherché."
          },
          {
            icon: <FiBell />,
            title: "Alertes d'urgence",
            text: "Diffusion instantanée des besoins critiques."
          },
          {
            icon: <FiBox />,
            title: "Gestion des stocks",
            text: "Suivi des poches disponibles et expirantes."
          },
        ].map((item) => (
          <div
            key={item.title}
            className="border border-slate-200 rounded-2xl p-8"
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-5">
              {item.icon}
            </div>

            <h3 className="font-semibold text-lg mb-3">
              {item.title}
            </h3>

            <p className="text-slate-500">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* HOW IT WORKS */}
  <section className="py-20">

    <div className="max-w-7xl mx-auto px-6">

      <h2 className="text-center text-4xl font-bold mb-14">
        Comment ça fonctionne ?
      </h2>

      <div className="grid md:grid-cols-4 gap-8">

        {[
          "Rechercher",
          "Localiser",
          "Contacter",
          "Recevoir"
        ].map((step, index) => (
          <div
            key={step}
            className="bg-white rounded-2xl p-8 text-center border border-slate-200"
          >
            <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
              {index + 1}
            </div>

            <h3 className="font-semibold">
              {step}
            </h3>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="max-w-7xl mx-auto px-6 pb-20">

    <div className="bg-red-600 rounded-3xl p-12 text-center text-white">

      <h2 className="text-4xl font-bold mb-4">
        Chaque don peut sauver jusqu'à 3 vies
      </h2>

      <p className="mb-8 text-red-100">
        Rejoignez le réseau BloodLink et contribuez à sauver des vies.
      </p>

      <button className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold">
        Commencer maintenant
      </button>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="bg-slate-900 text-white">

    <div className="max-w-7xl mx-auto px-6 py-14">

      <div className="grid md:grid-cols-4 gap-10">

        <div>
          <h3 className="font-semibold mb-4">
            BloodLink
          </h3>

          <p className="text-slate-400">
            Plateforme nationale de gestion des banques de sang.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">
            Navigation
          </h3>

          <div className="space-y-2 text-slate-400">
            <p>Accueil</p>
            <p>Banques</p>
            <p>Alertes</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">
            Partenaires
          </h3>

          <div className="space-y-2 text-slate-400">
            <p>CNTS</p>
            <p>MINSANTE</p>
            <p>Hôpitaux</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">
            Contact
          </h3>

          <div className="space-y-2 text-slate-400">
            <p>contact@bloodlink.cm</p>
            <p>+237 XXX XXX XXX</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-slate-500">
        © 2026 BloodLink - Tous droits réservés
      </div>
    </div>
  </footer>
</div>

);
}
