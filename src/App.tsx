import { StrictMode, useEffect, Suspense, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from './store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import Laptop from './components/Laptop/Laptop';
import { SafeKeypad } from './components/UI/SafeKeypad';
import { ToolboxKeypad } from './components/UI/ToolboxKeypad';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Loader, Environment, PerformanceMonitor, BakeShadows, Bvh, Stats } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { House } from './components/World/House';
import { Player } from './components/World/Player';
import { Enemy } from './components/World/Enemy';
import { Controls } from './components/World/Controls';
import { MobileControls } from './components/UI/MobileControls';

import { GoomOS } from './components/UI/GoomOS';
import { useThree, useFrame } from '@react-three/fiber';

function PlayerLight() {
    const { camera } = useThree();
    const [inBasement, setInBasement] = useState(false);
    // We can't easily access lowPerformance from parent here without context or props, 
    // but we can just default to showing stars if not in basement.
    // Or better, move this logic back into the main component or pass props.
    // For simplicity, let's just render the environment here.

    useFrame(() => {
        if (camera.position.y > 40) {
            if (!inBasement) setInBasement(true);
        } else {
            if (inBasement) setInBasement(false);
        }
    });

    return (
        <>
            {!inBasement && (
                <>
                    <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Environment preset="night" />
                    <ambientLight intensity={0.1} />
                </>
            )}
            {inBasement && <ambientLight intensity={0.01} />}
        </>
    );
}

function useAutoUiScale() {
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width <= 768) {
          setScale(1); // Don't scale on mobile, use responsive CSS instead
          return;
      }
      
      // Target a smaller "safe area" to make UI elements larger
      // Lowering this value makes the UI bigger
      const targetWidth = 1000; 
      const targetHeight = 600;
      
      const scaleX = width / targetWidth;
      const scaleY = height / targetHeight;
      
      // Use the smaller scale to ensure everything fits (contain)
      const newScale = Math.min(scaleX, scaleY);
      
      // Allow it to scale up quite a bit (2.5x) for large screens
      // Minimum 0.6x for desktop screens
      setScale(Math.max(0.6, Math.min(newScale, 2.5)));
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return scale;
}

function HUD() {
  const interactionText = useGameStore((state) => state.interactionText);
  const inventory = useGameStore((state) => state.inventory);
  const uiScale = useAutoUiScale();
  
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8" style={{ transform: `scale(${uiScale})`, transformOrigin: 'top left', width: `${100/uiScale}%`, height: `${100/uiScale}%` }}>
      <div className="flex justify-between items-start">
        <div className="bg-black/50 text-white p-2 rounded backdrop-blur-sm">
          <h2 className="text-base md:text-xl font-bold">Goomba Escape</h2>
          <p className="text-xs md:text-sm text-gray-300">Find the code. Unlock the safe. Escape.</p>
        </div>
        
        {/* Inventory */}
        <div className="flex space-x-2">
            {inventory.map((item, i) => (
                <div key={i} className="bg-black/50 p-2 rounded border border-white/20 backdrop-blur-sm flex items-center space-x-2 animate-in fade-in slide-in-from-right">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-[10px] md:text-xs">
                        {item === 'House Key' ? '🔑' : item === 'Storage Key' ? '🗝️' : item === 'Flashlight' ? '🔦' : item === 'Screwdriver' ? '🔧' : '📦'}
                    </div>
                    <span className="text-white text-xs md:text-sm font-bold hidden md:inline-block">{item}</span>
                </div>
            ))}
        </div>
      </div>
      
      {interactionText && (
        <div className="self-center bg-black/70 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold animate-pulse backdrop-blur-md border border-white/20 mb-16 md:mb-0">
          {interactionText}
        </div>
      )}
      
      <div className="text-white/50 text-[10px] md:text-sm self-end hidden md:block">
        WASD to Move • Mouse to Look • E to Interact • ESC to Pause
      </div>
    </div>
  );
}

function Menu() {
  const {
    setGameState, difficulty, setDifficulty, challengeMode, setChallengeMode,
    sensitivity, setSensitivity, volume, setVolume, showFps, setShowFps,
    fpsLimit, setFpsLimit, fov, setFov, headBobbing, setHeadBobbing,
    invertY, setInvertY, threeGoombaMode, setThreeGoombaMode,
    popupsEnabled, setPopupsEnabled
  } = useGameStore(useShallow(state => ({
    setGameState: state.setGameState,
    difficulty: state.difficulty,
    setDifficulty: state.setDifficulty,
    challengeMode: state.challengeMode,
    setChallengeMode: state.setChallengeMode,
    sensitivity: state.sensitivity,
    setSensitivity: state.setSensitivity,
    volume: state.volume,
    setVolume: state.setVolume,
    showFps: state.showFps,
    setShowFps: state.setShowFps,
    fpsLimit: state.fpsLimit,
    setFpsLimit: state.setFpsLimit,
    fov: state.fov,
    setFov: state.setFov,
    headBobbing: state.headBobbing,
    setHeadBobbing: state.setHeadBobbing,
    invertY: state.invertY,
    setInvertY: state.setInvertY,
    threeGoombaMode: state.threeGoombaMode,
    setThreeGoombaMode: state.setThreeGoombaMode,
    popupsEnabled: state.popupsEnabled,
    setPopupsEnabled: state.setPopupsEnabled
  })));
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const uiScale = useAutoUiScale();
  
  const [splashText, setSplashText] = useState("Horror Edition");

  useEffect(() => {
    const splashTexts = [
      "Don't look back!",
      "He is watching...",
      "Run for your life!",
      "No escape...",
      "Silence is golden",
      "Hide or die",
      "Not your average mushroom",
      "Mario can't save you",
      "Stomp won't work",
      "Behind you!",
      "Do not blink",
      "Fear the Goomba",
      "It sees you",
      "Keep moving",
      "Don't make a sound",
      "They are everywhere",
      "Trust no one",
      "Is that a footstep?",
      "Goomba sees all"
    ];
    setSplashText(splashTexts[Math.floor(Math.random() * splashTexts.length)]);
  }, []);
  
  if (showSettings) {
      return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div 
            className="bg-gray-900/80 p-6 md:p-12 rounded-none border border-gray-800 shadow-2xl max-w-2xl w-full text-center animate-in fade-in zoom-in duration-300 relative overflow-hidden"
            style={{ transform: `scale(${uiScale})` }}
          >
            {/* Decorative Lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-50"></div>

            <h2 className="text-2xl md:text-4xl font-black text-white mb-8 md:mb-12 tracking-[0.2em] uppercase border-b border-gray-800 pb-4">Settings</h2>
            
            <div className="space-y-8 md:space-y-10 text-left px-2 md:px-8">
                <div className="group">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase tracking-widest mb-4 group-hover:text-blue-400 transition-colors">Mouse Sensitivity: <span className="text-white ml-2">{sensitivity.toFixed(1)}</span></label>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="3.0" 
                        step="0.1" 
                        value={sensitivity} 
                        onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-none appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                    />
                </div>
                
                <div className="group">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase tracking-widest mb-4 group-hover:text-blue-400 transition-colors">Volume: <span className="text-white ml-2">{(volume * 100).toFixed(0)}%</span></label>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-none appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                    />
                </div>

                <div className="group flex items-center justify-between">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase tracking-widest group-hover:text-blue-400 transition-colors">Show FPS</label>
                    <button 
                        onClick={() => setShowFps(!showFps)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${showFps ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${showFps ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                <div className="group flex items-center justify-between">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase tracking-widest group-hover:text-blue-400 transition-colors">Head Bobbing</label>
                    <button 
                        onClick={() => setHeadBobbing(!headBobbing)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${headBobbing ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${headBobbing ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                <div className="group flex items-center justify-between">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase tracking-widest group-hover:text-blue-400 transition-colors">Invert Y-Axis</label>
                    <button 
                        onClick={() => setInvertY(!invertY)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${invertY ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${invertY ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                <div className="group flex items-center justify-between">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase tracking-widest group-hover:text-blue-400 transition-colors">Popups</label>
                    <button 
                        onClick={() => setPopupsEnabled(!popupsEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${popupsEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${popupsEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                <div className="group">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase tracking-widest mb-4 group-hover:text-blue-400 transition-colors">Field of View (FOV): <span className="text-white ml-2">{fov}</span></label>
                    <input 
                        type="range" 
                        min="60" 
                        max="120" 
                        step="1" 
                        value={fov} 
                        onChange={(e) => setFov(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-none appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                    />
                </div>

                <div className="group">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase tracking-widest mb-4 group-hover:text-blue-400 transition-colors">FPS Limit: <span className="text-white ml-2">{fpsLimit}</span></label>
                    <input 
                        type="range" 
                        min="30" 
                        max="144" 
                        step="1" 
                        value={fpsLimit} 
                        onChange={(e) => setFpsLimit(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-none appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                    />
                </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="mt-12 md:mt-16 w-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold py-3 md:py-4 px-6 border border-gray-700 hover:border-gray-500 transition-all duration-300 uppercase tracking-widest text-xs md:text-sm"
            >
              Return to Menu
            </button>
          </div>
        </div>
      );
  }

  if (showAbout) {
      return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-md p-4 overflow-y-auto">
          <div 
            className="bg-gray-900/80 p-6 md:p-12 rounded-none border border-gray-800 shadow-2xl max-w-2xl w-full text-center animate-in fade-in zoom-in duration-300 relative overflow-hidden"
            style={{ transform: `scale(${uiScale})` }}
          >
            {/* Decorative Lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent opacity-50"></div>

            <h2 className="text-2xl md:text-4xl font-black text-white mb-8 md:mb-12 tracking-[0.2em] uppercase border-b border-gray-800 pb-4">About Goomba Escape</h2>
            
            <div className="space-y-6 text-left px-2 md:px-8 text-gray-300 text-sm md:text-base leading-relaxed">
                <p>
                    <strong>Goomba Escape</strong> is a thrilling horror survival game where you must outsmart your strict Goomba parents. 
                    They expect nothing but perfection, and an A- is simply unacceptable. 
                </p>
                <p>
                    Navigate through the house, find the hidden codes, unlock the safe, and escape before they catch you. 
                    Use your wits, hide in closets, and remember: silence is your best friend.
                </p>
                <p>
                    Developed with React Three Fiber and Zustand.
                </p>

                <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Coming Soon</h3>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <img src="https://i.ibb.co/XkJGY2z2/windows-22.png" alt="Windows" className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                        <img src="https://i.ibb.co/DgrV1Nb8/get-it-on-google-play.jpg" alt="Google Play" className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                        <img src="https://i.ibb.co/rfcRbF0r/2026-03-09-0xn-Kleki.png" alt="App Store" className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            <button 
              onClick={() => setShowAbout(false)}
              className="mt-12 md:mt-16 w-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold py-3 md:py-4 px-6 border border-gray-700 hover:border-gray-500 transition-all duration-300 uppercase tracking-widest text-xs md:text-sm"
            >
              Return to Menu
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-4xl flex flex-col items-center"
        style={{ transform: `scale(${uiScale})` }}
      >
        
        {/* Title Section */}
        <div className="mb-8 md:mb-16 text-center relative">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                GOOMBA
            </h1>
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-red-900 tracking-tighter relative -mt-2 md:-mt-4">
                ESCAPE
            </h1>
            <div className="absolute -right-4 md:-right-12 top-0 rotate-12 bg-yellow-500 text-black font-bold px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs uppercase tracking-widest shadow-lg transform hover:scale-110 transition-transform cursor-default animate-pulse">
                {splashText}
            </div>
        </div>
        
        {/* Menu Items */}
        <div className="w-full max-w-md space-y-3 md:space-y-4 relative z-10 px-4 md:px-0">
            
            {/* Play Button */}
            <button 
              onClick={() => setGameState('story')}
              className="group w-full bg-white/5 hover:bg-red-900/20 backdrop-blur-md border border-white/10 hover:border-red-500/50 text-white font-bold py-4 md:py-6 px-6 md:px-8 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] flex items-center justify-between"
            >
              <span className="text-lg md:text-xl tracking-[0.2em] uppercase group-hover:text-red-500 transition-colors">Start Game</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500">►</span>
            </button>

            {/* Difficulty Selector */}
            <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`py-3 text-xs font-bold uppercase tracking-widest transition-all border ${
                            difficulty === diff 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
                        }`}
                    >
                        {diff}
                    </button>
                ))}
            </div>
            
            {/* Challenge Mode */}
            <div 
                onClick={() => setChallengeMode(!challengeMode)}
                className={`cursor-pointer w-full py-4 px-6 border transition-all duration-300 flex items-center justify-between group ${
                    challengeMode 
                    ? 'bg-red-900/10 border-red-900/50' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
            >
                <div className="flex flex-col text-left">
                    <span className={`text-sm font-bold uppercase tracking-widest ${challengeMode ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'}`}>Challenge Mode</span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">Double Enemies • Double Fear</span>
                </div>
                <div className={`w-4 h-4 border ${challengeMode ? 'bg-red-600 border-red-600' : 'border-gray-600'} transition-colors`}></div>
            </div>

            {/* 3 Goomba Mode */}
            <div 
                onClick={() => setThreeGoombaMode(!threeGoombaMode)}
                className={`cursor-pointer w-full py-4 px-6 border transition-all duration-300 flex items-center justify-between group ${
                    threeGoombaMode 
                    ? 'bg-purple-900/10 border-purple-900/50' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
            >
                <div className="flex flex-col text-left">
                    <span className={`text-sm font-bold uppercase tracking-widest ${threeGoombaMode ? 'text-purple-500' : 'text-gray-500 group-hover:text-gray-300'}`}>3 Goomba Mode</span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">Triple the Threat</span>
                </div>
                <div className={`w-4 h-4 border ${threeGoombaMode ? 'bg-purple-600 border-purple-600' : 'border-gray-600'} transition-colors`}></div>
            </div>

            {/* Settings & About Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="w-full py-4 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-[0.3em] transition-colors hover:bg-white/5 border border-transparent hover:border-gray-800"
              >
                Settings
              </button>
              <button 
                onClick={() => setShowAbout(true)}
                className="w-full py-4 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-[0.3em] transition-colors hover:bg-white/5 border border-transparent hover:border-gray-800"
              >
                About
              </button>
            </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-[-100px] text-gray-700 text-[10px] uppercase tracking-[0.5em]">
            v2.1 • Build 2026
        </div>
      </div>
    </div>
  );
}

function WinScreen() {
  const reset = useGameStore((state) => state.reset);
  const uiScale = useAutoUiScale();
  
  return (
    <div className="absolute inset-0 bg-green-900/90 flex items-center justify-center z-50 animate-in fade-in duration-1000 p-4">
      <div 
        className="text-center max-w-2xl p-6 md:p-8 bg-black/30 backdrop-blur-sm rounded-3xl border border-green-500/30"
        style={{ transform: `scale(${uiScale})` }}
      >
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">ESCAPED!</h1>
        <div className="flex justify-center mb-6 md:mb-8">
            <img 
                src="https://i.ibb.co/ZzBBDd8c/Koopa-Troopa.webp" 
                alt="Jeremy" 
                className="h-32 md:h-48 object-contain drop-shadow-2xl animate-bounce"
            />
        </div>
        <p className="text-xl md:text-2xl text-green-200 mb-6 md:mb-8">You found Jeremy! Let's play!</p>
        <button 
          onClick={reset}
          className="bg-white text-green-900 font-bold py-3 md:py-4 px-6 md:px-8 rounded-full hover:bg-gray-200 transition transform hover:scale-110 shadow-xl w-full md:w-auto text-sm md:text-base"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function WarningScreen({ onAccept }: { onAccept: () => void }) {
  const uiScale = useAutoUiScale();
  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center z-[100] p-8 text-center">
      <div 
        className="max-w-3xl animate-in fade-in duration-1000 border-2 border-red-900/30 p-12 bg-black/80 backdrop-blur-sm shadow-[0_0_100px_rgba(255,0,0,0.1)]"
        style={{ transform: `scale(${uiScale})` }}
      >
        <h1 className="text-3xl md:text-5xl font-black text-red-600 mb-4 md:mb-8 uppercase tracking-[0.2em] border-b-2 border-red-900 pb-4 md:pb-6 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
          WARNING
        </h1>
        
        <div className="space-y-4 md:space-y-6 text-gray-300 font-mono text-sm md:text-lg leading-relaxed">
          <p>
            This experience contains <span className="text-red-500 font-bold">intense flashing lights</span>, 
            <span className="text-red-500 font-bold"> loud sudden noises</span>, and 
            <span className="text-red-500 font-bold"> extreme jumpscares</span>.
          </p>
          
          <p className="text-gray-400 italic">
            It is not suitable for individuals with photosensitive epilepsy, heart conditions, or those who are easily frightened.
          </p>

          <p className="text-base md:text-xl text-red-400 font-bold border-l-4 border-red-600 pl-4 py-2 my-4 md:my-8 bg-red-900/10">
            This game is designed to <span className="text-red-500 uppercase tracking-widest">make you fear Goombas</span>.
          </p>
        </div>

        <div className="mt-8 md:mt-12">
          <p className="text-xs md:text-sm text-gray-600 mb-4 uppercase tracking-widest">By continuing, you accept these terms</p>
          <button 
            onClick={onAccept}
            className="bg-red-950 hover:bg-red-900 text-red-500 border border-red-800 font-bold py-3 md:py-4 px-8 md:px-16 transition-all duration-300 uppercase tracking-[0.15em] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:text-red-400 text-sm md:text-base w-full md:w-auto"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function JumpscareScreen() {
  const reset = useGameStore((state) => state.reset);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      reset();
    }, 3000); // Increased to 3 seconds to let the player see it
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="absolute inset-0 z-[100] overflow-hidden flex items-center justify-center bg-black">
      {/* Flashing Background with Colors */}
      <div 
        className="absolute inset-0" 
        style={{
            animation: 'flashColors 0.1s infinite', // Slower flash
            opacity: 0.8,
        }}
      />
      
      {/* Jumpscare Image - Erratic Movement */}
      <div className="relative w-full h-full flex items-center justify-center">
         {/* Wrapper for position movement */}
         <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'moveAround 0.4s infinite' }} // Slower movement (was 0.15s)
         >
             <img 
                src="https://i.ibb.co/hRSfLyq9/2026-03-01-0tk-Kleki.png" 
                alt="JUMPSCARE" 
                className="w-[85vmin] h-[85vmin] object-contain drop-shadow-[0_0_50px_rgba(255,0,0,0.8)]"
                style={{
                    animation: 'zoomAndShake 0.5s infinite alternate', // Slower zoom/shake (was 0.2s)
                }}
             />
         </div>
      </div>
      
      <style>{`
        @keyframes flashColors {
            0% { background-color: #ff0000; }
            20% { background-color: #000000; }
            40% { background-color: #ffffff; }
            60% { background-color: #0000ff; }
            80% { background-color: #00ff00; }
            100% { background-color: #ff0000; }
        }
        @keyframes moveAround {
            0% { transform: translate(0, 0); }
            20% { transform: translate(-10vw, 5vh); }
            40% { transform: translate(10vw, -10vh); }
            60% { transform: translate(-5vw, -5vh); }
            80% { transform: translate(15vw, 10vh); }
            100% { transform: translate(0, 0); }
        }
        @keyframes zoomAndShake {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.3) rotate(-5deg); }
            100% { transform: scale(1.1) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

function PauseMenu() {
  const setGameState = useGameStore((state) => state.setGameState);
  const uiScale = useAutoUiScale();

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-md flex flex-col items-center"
        style={{ transform: `scale(${uiScale})` }}
      >
        <h1 className="text-6xl md:text-8xl font-black text-white mb-12 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            PAUSED
        </h1>
        
        <div className="w-full space-y-4">
            <button 
              onClick={() => setGameState('playing')}
              className="group w-full bg-white/5 hover:bg-blue-900/20 backdrop-blur-md border border-white/10 hover:border-blue-500/50 text-white font-bold py-4 md:py-6 px-6 md:px-8 transition-all duration-300 transform hover:scale-105 flex items-center justify-between"
            >
              <span className="text-lg md:text-xl tracking-[0.2em] uppercase group-hover:text-blue-500 transition-colors">Resume</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">►</span>
            </button>

            <button 
              onClick={() => setGameState('menu')}
              className="group w-full bg-white/5 hover:bg-red-900/20 backdrop-blur-md border border-white/10 hover:border-red-500/50 text-white font-bold py-4 md:py-6 px-6 md:px-8 transition-all duration-300 transform hover:scale-105 flex items-center justify-between"
            >
              <span className="text-lg md:text-xl tracking-[0.2em] uppercase group-hover:text-red-500 transition-colors">Quit to Menu</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500">►</span>
            </button>
        </div>
      </div>
    </div>
  );
}

function StoryScreen() {
  const setGameState = useGameStore((state) => state.setGameState);
  const uiScale = useAutoUiScale();
  
  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center z-50 animate-in fade-in duration-1000 p-4">
      <div 
        className="max-w-3xl p-6 md:p-12 text-center bg-black/80 backdrop-blur-sm border border-white/10"
        style={{ transform: `scale(${uiScale})` }}
      >
        <h1 className="text-2xl md:text-4xl font-black text-white mb-6 md:mb-8 uppercase tracking-widest border-b border-white/20 pb-4">
          The Report Card
        </h1>
        
        <div className="space-y-4 md:space-y-6 text-base md:text-xl text-gray-300 font-mono leading-relaxed text-left">
          <p>
            You are a <span className="text-blue-400 font-bold">Child Goomba</span>.
          </p>
          <p>
            You came home with a <span className="text-red-500 font-bold">B+</span> in Stomping Class.
          </p>
          <p>
            To your <span className="text-red-500 font-bold">Goomba Parents</span>, that is a FAILURE.
            "No mushrooms. No jumping. No sunlight."
          </p>
          <p>
            They locked you in the mansion to "study" until you become a <span className="text-red-500 font-bold">Doctor Goomba</span>.
          </p>
          <p className="text-red-400 italic">
            Mom and Dad are patrolling the halls. They are very disappointed.
          </p>
          <p className="mt-6 md:mt-8 font-bold text-white">
            Escape the house. Don't let them catch you.
          </p>
        </div>

        <button 
          onClick={() => setGameState('playing')}
          className="mt-8 md:mt-12 bg-white text-black hover:bg-gray-200 font-bold py-3 md:py-4 px-8 md:px-12 uppercase tracking-widest transition-all hover:scale-105 w-full md:w-auto text-sm md:text-base"
        >
          Begin Nightmare
        </button>
      </div>
    </div>
  );
}

function DialogueBox({ name, text, image, visible }: { name: string, text: string, image: string, visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40 animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-none">
      <div className="bg-black/80 border-2 border-white/20 backdrop-blur-md p-4 flex items-center gap-6 rounded-xl shadow-2xl">
        <div className="relative shrink-0">
            <div className="w-24 h-24 bg-red-900/20 rounded-lg border border-red-500/30 overflow-hidden">
                <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
        </div>
        <div className="flex-1">
            <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">{name}</h3>
            <p className="text-white font-mono text-lg leading-snug">{text}</p>
        </div>
      </div>
    </div>
  );
}

function PlatformSelectScreen({ onSelect }: { onSelect: (platform: 'pc' | 'mobile') => void }) {
  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 p-4">
      <h1 className="text-4xl font-black text-white mb-8 tracking-widest uppercase text-center">Select Platform</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <button 
          onClick={() => onSelect('pc')}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-6 px-12 rounded-xl border-2 border-gray-600 hover:border-blue-500 transition-all text-xl uppercase tracking-wider"
        >
          PC
        </button>
        <button 
          onClick={() => onSelect('mobile')}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-6 px-12 rounded-xl border-2 border-gray-600 hover:border-blue-500 transition-all text-xl uppercase tracking-wider"
        >
          Mobile
        </button>
        <button 
          disabled
          className="bg-gray-900 text-gray-600 font-bold py-6 px-12 rounded-xl border-2 border-gray-800 cursor-not-allowed text-xl uppercase tracking-wider"
        >
          Console
        </button>
      </div>
    </div>
  );
}

function AdPopup() {
  const popupsEnabled = useGameStore((state) => state.popupsEnabled);
  const [popup, setPopup] = useState<{ id: number, side: 'left' | 'right' } | null>(null);

  useEffect(() => {
    if (!popupsEnabled) {
      setPopup(null);
      return;
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setPopup({
          id: Date.now(),
          side: Math.random() > 0.5 ? 'left' : 'right'
        });
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [popupsEnabled]);

  const removePopup = () => {
    setPopup(null);
  };

  if (!popupsEnabled || !popup) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <div 
          key={popup.id}
          className={`absolute pointer-events-auto shadow-2xl border-2 border-red-500 bg-black animate-in fade-in zoom-in duration-300 top-1/2 -translate-y-1/2`}
          style={{
            [popup.side]: '20px',
            width: '160px',
            height: 'auto'
          }}
        >
          <button 
            onClick={removePopup}
            className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs border border-white hover:bg-red-500 z-10"
          >
            X
          </button>
          <img src="https://i.ibb.co/spYdRg6K/2026-03-09-0xz-Kleki.png" alt="Ad" className="w-full h-auto block" />
        </div>
    </div>
  );
}

function FpsLimiter() {
  const fpsLimit = useGameStore((state) => state.fpsLimit);
  const { invalidate } = useThree();

  useEffect(() => {
    if (fpsLimit >= 144) return; // Assume 144 is "unlimited" or max monitor refresh rate

    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);
      const delta = time - lastTime;
      const interval = 1000 / fpsLimit;

      if (delta >= interval) {
        lastTime = time - (delta % interval);
        invalidate();
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [fpsLimit, invalidate]);

  return null;
}

export default function App() {
  const {
    gameState, setGameState, safeKeypadOpen, toolboxKeypadOpen, challengeMode,
    threeGoombaMode, lowPerformance, setLowPerformance, showFps, fpsLimit, setIsMobile
  } = useGameStore(useShallow(state => ({
    gameState: state.gameState,
    setGameState: state.setGameState,
    safeKeypadOpen: state.safeKeypadOpen,
    toolboxKeypadOpen: state.toolboxKeypadOpen,
    challengeMode: state.challengeMode,
    threeGoombaMode: state.threeGoombaMode,
    lowPerformance: state.lowPerformance,
    setLowPerformance: state.setLowPerformance,
    showFps: state.showFps,
    fpsLimit: state.fpsLimit,
    setIsMobile: state.setIsMobile
  })));
  const [dpr, setDpr] = useState(1.5);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [platformSelected, setPlatformSelected] = useState(false);

  // Dialogue System
  const [dialogue, setDialogue] = useState<{name: string, text: string, image: string} | null>(null);
  const [showDialogue, setShowDialogue] = useState(false);

  useEffect(() => {
    if (gameState !== 'playing') {
        setShowDialogue(false);
        return;
    }

    const parentNames = ["Dad Goomba", "Mom Goomba"];
    const parentTexts = [
        "Why only B+?",
        "You bring shame to family!",
        "Go study now!",
        "No dinner until you become Doctor!",
        "I hear you walking! Go back to room!",
        "Do not disappoint us again.",
        "Your cousin Koopa got an A++.",
        "We sacrifice everything for you!",
        "Where are you going? Study!",
        "Calculus is easy! Why you struggle?",
        "I will stomp YOU if you don't study!",
        "You want to be a Minion forever?"
    ];
    const goombaImage = "https://i.ibb.co/hRSfLyq9/2026-03-01-0tk-Kleki.png"; // Use the scary one

    const triggerDialogue = () => {
        const name = parentNames[Math.floor(Math.random() * parentNames.length)];
        const text = parentTexts[Math.floor(Math.random() * parentTexts.length)];
        
        setDialogue({ name, text, image: goombaImage });
        setShowDialogue(true);

        // Hide after 5 seconds
        return setTimeout(() => {
            setShowDialogue(false);
        }, 5000);
    };

    let hideTimer: NodeJS.Timeout;

    // Fixed interval of 20 seconds
    const intervalId = setInterval(() => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = triggerDialogue();
    }, 20000);

    return () => {
        clearInterval(intervalId);
        if (hideTimer) clearTimeout(hideTimer);
    };
  }, [gameState]);

  if (!platformSelected) {
      return <PlatformSelectScreen onSelect={(platform) => {
          setIsMobile(platform === 'mobile');
          setPlatformSelected(true);
      }} />;
  }

  if (!warningAccepted) {
      return <WarningScreen onAccept={() => setWarningAccepted(true)} />;
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 3D World Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas 
            shadows 
            dpr={dpr} 
            camera={{ fov: 75, position: [0, 1.6, 0] }}
            frameloop={fpsLimit >= 144 ? 'always' : 'demand'}
        >
            <FpsLimiter />
            <PerformanceMonitor 
                onIncline={() => { setDpr(2); setLowPerformance(false); }} 
                onDecline={() => { setDpr(1); setLowPerformance(true); }}
            />
            
            <PlayerLight />

            {/* Reduced shadow map size for performance */}
            <pointLight position={[0, 4, 0]} intensity={0.5} castShadow={!lowPerformance} shadow-mapSize={[512, 512]} />
            <pointLight position={[0, 4, 10]} intensity={0.3} castShadow={!lowPerformance} shadow-mapSize={[512, 512]} />
            <pointLight position={[0, 4, 25]} intensity={0.5} castShadow={!lowPerformance} shadow-mapSize={[512, 512]} />
            
            {lowPerformance && <BakeShadows />}

            <Suspense fallback={null}>
              <Bvh firstHitOnly>
                <House />
                {/* Main Enemy (1st Floor) */}
                <Enemy />
              {/* Challenge Mode: Extra Enemy (1st Floor) */}
              {(challengeMode || threeGoombaMode) && (
                  <Enemy 
                    name="MOM GOOMBA"
                    initialPosition={[2, 1, 20]} // Next to Dad ([0, 1, 20])
                    patrolPoints={[
                        new THREE.Vector3(2, 1, 20), // Start
                        new THREE.Vector3(20, 1.6, 20), // Kitchen
                        new THREE.Vector3(25, 1.6, 7.5), // Dining
                        new THREE.Vector3(-10, 1.6, 25), // Living Room
                        new THREE.Vector3(-20, 1.6, 5), // Study
                    ]}
                    scale={1.2}
                    speed={2.5}
                    runSpeed={4.5}
                    viewDistance={12}
                    fov={0.6}
                    catchDistance={1.5}
                  />
              )}

              {/* 3 Goomba Mode: 3rd Enemy (1st Floor) */}
              {threeGoombaMode && (
                  <Enemy 
                    name="BROTHER GOOMBA"
                    initialPosition={[-2, 1, 20]} // Next to Dad
                    patrolPoints={[
                        new THREE.Vector3(-2, 1, 20),
                        new THREE.Vector3(10, 1.6, 10), // Hallway
                        new THREE.Vector3(25, 1.6, 25), // Storage
                        new THREE.Vector3(45, 1.6, 15), // Garage
                        new THREE.Vector3(-35, 1.6, 10), // Master Bedroom
                    ]}
                    scale={0.8}
                    speed={3.0}
                    runSpeed={5.5}
                    viewDistance={15}
                    fov={0.5}
                    catchDistance={1.2}
                  />
              )}

              {/* Kid Goomba (2nd Floor) */}
              <Enemy 
                name="KID GOOMBA"
                initialPosition={[0, 21, 10]} // 2nd Floor Hallway
                patrolPoints={[
                    new THREE.Vector3(0, 21, 10), // Hallway Center
                    new THREE.Vector3(0, 21, -5), // Hallway Back
                    new THREE.Vector3(0, 21, 25), // Hallway Front
                    new THREE.Vector3(-15, 21, 10), // Kid Room Center
                    new THREE.Vector3(-20, 21, 5), // Kid Room Bed
                    new THREE.Vector3(15, 21, 10), // Game Room Center
                    new THREE.Vector3(20, 21, 5), // Game Room Pool Table
                ]}
                scale={0.5}
                speed={5.0} // Faster
                runSpeed={8.0} // Much Faster
                viewDistance={15} // Bad Vision
                fov={0.4} // Narrower FOV
                catchDistance={1.0}
              />
              {/* Challenge Mode: Extra Enemy (2nd Floor) */}
              {(challengeMode || threeGoombaMode) && (
                  <Enemy 
                    name="UNCLE GOOMBA"
                    initialPosition={[2, 21, 10]} // Next to Kid ([0, 21, 10])
                    patrolPoints={[
                        new THREE.Vector3(2, 21, 10), // Start
                        new THREE.Vector3(0, 21, -25), // Computer Room
                        new THREE.Vector3(0, 21, -5), // Hallway Back
                        new THREE.Vector3(-15, 21, -10), // Library
                        new THREE.Vector3(23, 21, -5), // Upper Bath
                    ]}
                    scale={1.0}
                    speed={3.5}
                    runSpeed={6.0}
                    viewDistance={10}
                    fov={0.5}
                    catchDistance={1.2}
                  />
              )}

              {/* 3 Goomba Mode: 3rd Enemy (2nd Floor) */}
              {threeGoombaMode && (
                  <Enemy 
                    name="AUNT GOOMBA"
                    initialPosition={[-2, 21, 10]} // Next to Kid
                    patrolPoints={[
                        new THREE.Vector3(-2, 21, 10),
                        new THREE.Vector3(0, 21, 5), // Hallway
                        new THREE.Vector3(-15, 21, 10), // Kid Room
                        new THREE.Vector3(15, 21, 10), // Game Room
                        new THREE.Vector3(0, 21, -25), // Computer Room
                    ]}
                    scale={1.1}
                    speed={2.8}
                    runSpeed={5.0}
                    viewDistance={12}
                    fov={0.6}
                    catchDistance={1.3}
                  />
              )}

              {/* 3 Goomba Mode: Extra Enemies (Basement) */}
              {threeGoombaMode && (
                <>
                  <Enemy 
                    name="GRANDPA GOOMBA"
                    initialPosition={[0, 51.6, 5]} // Basement
                    patrolPoints={[
                        new THREE.Vector3(0, 51.6, 5),
                        new THREE.Vector3(6, 51.6, 6),
                        new THREE.Vector3(6, 51.6, -6),
                        new THREE.Vector3(-6, 51.6, -6),
                        new THREE.Vector3(-6, 51.6, 6),
                    ]}
                    scale={1.5} // Big and slow
                    speed={1.5}
                    runSpeed={3.0}
                    viewDistance={8}
                    fov={0.4}
                    catchDistance={1.8}
                  />
                  <Enemy 
                    name="GRANDMA GOOMBA"
                    initialPosition={[2, 51.6, 5]} // Basement
                    patrolPoints={[
                        new THREE.Vector3(2, 51.6, 5),
                        new THREE.Vector3(-6, 51.6, 6),
                        new THREE.Vector3(6, 51.6, -6),
                        new THREE.Vector3(0, 51.6, -5),
                        new THREE.Vector3(6, 51.6, 6),
                    ]}
                    scale={1.3}
                    speed={1.8}
                    runSpeed={3.5}
                    viewDistance={10}
                    fov={0.5}
                    catchDistance={1.6}
                  />
                  <Enemy 
                    name="COUSIN GOOMBA"
                    initialPosition={[-2, 51.6, 5]} // Basement
                    patrolPoints={[
                        new THREE.Vector3(-2, 51.6, 5),
                        new THREE.Vector3(0, 51.6, -5),
                        new THREE.Vector3(-6, 51.6, -6),
                        new THREE.Vector3(6, 51.6, 6),
                        new THREE.Vector3(-6, 51.6, 6),
                    ]}
                    scale={0.9}
                    speed={4.0}
                    runSpeed={6.5}
                    viewDistance={14}
                    fov={0.6}
                    catchDistance={1.1}
                  />
                </>
              )}
              </Bvh>
            </Suspense>

            {(gameState === 'playing' || gameState === 'paused') && !lowPerformance && (
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={0.5} />
                <Noise opacity={0.1} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
            )}
            
            {(gameState === 'playing' || gameState === 'laptop' || gameState === 'paused') && (
            <>
                {gameState === 'playing' && <Controls />}
                <Player />
            </>
            )}
            {showFps && <Stats />}
        </Canvas>
      </div>

      {/* UI Layers */}
      {gameState === 'playing' && (
        <>
            <HUD />
            <MobileControls />
            {dialogue && <DialogueBox name={dialogue.name} text={dialogue.text} image={dialogue.image} visible={showDialogue} />}
        </>
      )}
      {gameState === 'menu' && <Menu />}
      {gameState === 'paused' && <PauseMenu />}
      {gameState === 'story' && <StoryScreen />}
      {gameState === 'laptop' && safeKeypadOpen && <SafeKeypad />}
      {gameState === 'laptop' && toolboxKeypadOpen && <ToolboxKeypad />}
      {gameState === 'laptop' && !safeKeypadOpen && !toolboxKeypadOpen && <Laptop />}
      {gameState === 'goomos' && <GoomOS />}
      {gameState === 'won' && <WinScreen />}
      {gameState === 'jumpscare' && <JumpscareScreen />}
      <AdPopup />
      <Loader />
    </div>
  );
}
