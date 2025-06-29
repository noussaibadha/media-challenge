'use client';
import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [shouldShowSplash, setShouldShowSplash] = useState(false);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  // Au montage, vérifie si l'animation a déjà été vue
  useEffect(() => {
    const hasSeenSplash = localStorage.getItem("hasSeenSplash");
    if (hasSeenSplash !== "true") {
      setShouldShowSplash(true);
    } else {
      setVisible(false);
      onFinish();
    }
  }, [onFinish]);

  // Gestion de l'animation
  useEffect(() => {
    if (!shouldShowSplash || !visible) return;

    const steps = [
      { delay: 500, next: () => setStep(1) }, // 0: point apparaît
      { delay: 500, next: () => setStep(2) }, // 1: morphing/couleur
      { delay: 2000, next: () => setStep(3) }, // 2: rotation (2 tours, 2s)
      { delay: 500, next: () => setStep(4) }, // 3: fondu vers le logo
      { delay: 500, next: () => setStep(5) }, // 4: texte SpotIn
      { delay: 500, next: () => setStep(6) }, // 5: slogan
      { delay: 2000, next: () => {
          setVisible(false);
          localStorage.setItem("hasSeenSplash", "true");
          onFinish();
        }
      }, // 6: fin (2s de plus)
    ];

    const timeout = setTimeout(steps[step].next, steps[step].delay);
    return () => clearTimeout(timeout);
  }, [step, visible, onFinish, shouldShowSplash]);

  if (!shouldShowSplash || !visible) return null;

  // Animation CSS inline pour la rotation (2 tours en 2s)
  const rotateAnimation = step === 2 ? {
    animation: "rotate-2turns 2s linear forwards",
  } : {};

  // Classe pour le carré orange
  const dotClass = `w-16 h-16 transition-all duration-700 ease-in-out ${
    step >= 1 ? "bg-[#f69435]" : "bg-gradient-to-br from-yellow-400 to-pink-400"
  } ${
    step === 0 ? "scale-0 opacity-0" :
    step === 1 ? "scale-125 opacity-100 rounded-full" :
    step === 2 ? "scale-125 opacity-100 rounded-[20%]" :
    step === 3 ? "scale-125 opacity-100 rounded-[20%]" :
    "scale-0 opacity-0"
  }`;

  // Classe pour le logo
  const logoClass = `h-16 w-auto transition-all duration-700 ease-in-out ${
    step >= 4 ? "opacity-100 scale-100" : "opacity-0 scale-90"
  }`;

  // Background change au moment du logo
  const bgClass = `fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
    step >= 4 ? 'bg-gradient-to-br from-orange-400 to-pink-400' : 'bg-white'
  }`;

  // Slogan
  const sloganClass = `text-white mt-2 text-sm transition-all duration-700 ease-in-out ${
    step >= 6 ? "opacity-100" : "opacity-0"
  }`;

  // Le carré et le logo sont superposés, mais seul l'un ou l'autre est visible selon step
  return (
    <div className={bgClass}>
      {/* Animation CSS inline pour la rotation */}
      <style>
        {`
          @keyframes rotate-2turns {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(720deg); }
          }
        `}
      </style>
      {/* Carré orange, disparaît progressivement */}
      {step < 4 && (
        <div className={`absolute ${dotClass}`} style={rotateAnimation}></div>
      )}
      {/* Logo, apparaît progressivement */}
      {step >= 3 && (
        <img
          src="/logo_spottin.webp"
          alt="SpotIn Logo"
          className={`absolute ${logoClass}`}
        />
      )}
      {/* Slogan */}
      <span className={sloganClass} style={{ marginTop: "8rem" }}>
        Le Spot des événements musicaux
      </span>
    </div>
  );
}
