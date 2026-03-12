import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function IntroCutscene() {
  const setGameState = useGameStore((state) => state.setGameState);
  const [step, setStep] = useState(0);

  const lines = [
    "You are a Goomba.",
    "For years, the Evil Parents have kept you trapped in this house.",
    "They stomp on your kind. They show no mercy.",
    "But tonight, they left the front door locked and the keys scattered.",
    "This is your chance.",
    "Find the keys. Unlock the doors. Escape.",
    "Don't let them catch you."
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < lines.length - 1) {
        setStep(step + 1);
      } else {
        setGameState('playing');
      }
    }, 4000); // 4 seconds per line

    return () => clearTimeout(timer);
  }, [step, setGameState, lines.length]);

  return (
    <div className="absolute inset-0 bg-black z-50 flex items-center justify-center p-8 cursor-pointer" onClick={() => setGameState('playing')}>
      <div className="max-w-2xl text-center">
        <p 
          key={step}
          className="text-white text-2xl md:text-4xl font-serif tracking-wider leading-relaxed animate-fade-in-out"
          style={{
            animation: 'fadeInOut 4s ease-in-out forwards'
          }}
        >
          {lines[step]}
        </p>
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-sm tracking-widest uppercase animate-pulse">
          Click to skip
        </p>
      </div>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
