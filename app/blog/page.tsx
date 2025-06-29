'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useDarkMode } from '@/context/DarkModeContext';

// Initialisation du client Supabase (comme dans ton exemple)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const { darkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation basique
    if (!email || !email.includes('@')) {
      setMessage({ text: 'Veuillez saisir une adresse email valide', type: 'error' });
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletter')
        .insert([{ email }]);

      if (error) throw error;
      setMessage({ text: 'Merci pour votre inscription à la Newsletter !', type: 'success' });
      setEmail('');
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Une erreur est survenue, veuillez réessayer', type: 'error' });
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Contenu principal (centré, largeur limitée) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Titre principal */}
        <div className="text-center mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
            Découvrez SpotIn
          </h1>
          <p className={`text-sm sm:text-base max-w-lg mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Votre guide pour ne jamais rater les meilleurs événements musicaux de Paris
          </p>
        </div>

        {/* Vidéo principale */}
        <div className="rounded-xl overflow-hidden mb-6">
          {/* Conteneur pour la vidéo responsive */}
          <div className="relative w-full pb-[56.25%]"> {/* 16:9 aspect ratio */}
            <iframe
              src="https://www.youtube.com/embed/MGgFGVg1bP0"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
          {/* Légende */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-3 py-2 text-xs sm:text-sm ${
            darkMode ? 'text-gray-200' : 'text-gray-800'
          } border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <span className="font-semibold">Paris by Night</span> : Fête de la musique 2023 à Paris<br />
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Quartier animé et vue sur la tour Eiffel</span>
          </div>
        </div>

        {/* Sections principales */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {/* Spots incontournables */}
          <section className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center mb-2">
              <span className="text-orange-400 mr-2 text-lg">●</span>
              <h2 className={`font-semibold text-base sm:text-lg ${darkMode ? 'text-white' : 'text-black'}`}>
                Spots incontournables à Paris
              </h2>
            </div>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              De l’Opynia au Rex Club, en passant par les quais animés et les soirées open air, SpotIn t’aide à trouver les meilleurs lieux pour vibrer au rythme de la musique parisienne, toute l’année.
            </p>
          </section>

          {/* Restez à la page */}
          <section className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center mb-2">
              <span className="bg-gradient-to-br from-orange-400 to-pink-400 w-3 h-3 rounded-full mr-2"></span>
              <h2 className={`font-semibold text-base sm:text-lg ${darkMode ? 'text-white' : 'text-black'}`}>
                Restez à la page !
              </h2>
            </div>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Grâce à notre sélection, retrouvez les spots qui font l’actualité musicale et ne manquez aucun événement, du concert intimiste aux grands festivals.
            </p>
          </section>
        </div>

        {/* Cartes catégories */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className={`rounded-xl p-4 flex flex-col items-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <span className={`text-lg sm:text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Tous les genres
            </span>
            <span className={`text-xs sm:text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Rock, électro, hip-hop, jazz… découvre tous les styles de musique à Paris.
            </span>
          </div>
          <div className={`rounded-xl p-4 flex flex-col items-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <span className={`text-lg sm:text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-purple-700'}`}>
              Curation Experte
            </span>
            <span className={`text-xs sm:text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Notre équipe sélectionne les meilleurs événements pour toi.
            </span>
          </div>
        </div>

        {/* Cartes (sections en fin de page) */}
        <div className="grid gap-6 mb-6">
          {/* Carte Newsletter */}
          <div className="bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl p-6 shadow-lg">
            <h3 className="text-white font-bold mb-2 text-lg sm:text-xl">Restez dans le beat !</h3>
            <p className="text-white text-sm sm:text-base mb-4">
              Recevez notre alerte hebdo sélection des meilleurs événements musicaux à Paris.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm sm:text-base flex-1 outline-none"
              />
              <button
                type="submit"
                className="bg-black hover:bg-gray-900 text-white rounded-lg px-4 py-2 font-semibold transition"
              >
                Valider
              </button>
            </form>
            {message && (
              <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                {message.text}
              </p>
            )}
          </div>

          {/* Carte CTA */}
          <div className="bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl p-6 shadow-lg">
            <h3 className="text-white font-bold mb-2 text-lg sm:text-xl">Prêt à explore Paris ?</h3>
            <p className="text-white text-sm sm:text-base mb-4">
              Découvrez dès maintenant les spots musicaux incontournables de la capitale.
            </p>
            <div className="flex justify-center sm:justify-start">
              <Link href="/">
                <button
                  className="bg-white text-black rounded-lg px-6 py-2 font-semibold shadow hover:bg-gray-100 transition"
                >
                  Explorer les spots
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
