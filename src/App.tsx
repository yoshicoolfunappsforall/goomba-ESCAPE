import { StrictMode, useEffect, Suspense, useState } from 'react';
import { useGameStore } from './store/gameStore';
import Laptop from './components/Laptop/Laptop';
import { SafeKeypad } from './components/UI/SafeKeypad';
import { ToolboxKeypad } from './components/UI/ToolboxKeypad';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Loader, Environment, PerformanceMonitor, BakeShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { House } from './components/World/House';
import { Player } from './components/World/Player';
import { Enemy } from './components/World/Enemy';
import { Controls } from './components/World/Controls';

function HUD() {
  const interactionText = useGameStore((state) => state.interactionText);
  const inventory = useGameStore((state) => state.inventory);
  
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
      <div className="flex justify-between items-start">
        <div className="bg-black/50 text-white p-2 rounded backdrop-blur-sm">
          <h2 className="text-xl font-bold">Goomba Escape</h2>
          <p className="text-sm text-gray-300">Find the code. Unlock the safe. Escape.</p>
        </div>
        
        {/* Inventory */}
        <div className="flex space-x-2">
            {inventory.map((item, i) => (
                <div key={i} className="bg-black/50 p-2 rounded border border-white/20 backdrop-blur-sm flex items-center space-x-2 animate-in fade-in slide-in-from-right">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs">
                        {item === 'House Key' ? '🔑' : item === 'Storage Key' ? '🗝️' : item === 'Flashlight' ? '🔦' : item === 'Screwdriver' ? '🔧' : '📦'}
                    </div>
                    <span className="text-white text-sm font-bold">{item}</span>
                </div>
            ))}
        </div>
      </div>
      
      {interactionText && (
        <div className="self-center bg-black/70 text-white px-6 py-3 rounded-full text-lg font-bold animate-pulse backdrop-blur-md border border-white/20">
          {interactionText}
        </div>
      )}
      
      <div className="text-white/50 text-sm self-end">
        WASD to Move • Mouse to Look • E to Interact • ESC to Pause
      </div>
    </div>
  );
}

function Menu() {
  const setGameState = useGameStore((state) => state.setGameState);
  const difficulty = useGameStore((state) => state.difficulty);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const [showSettings, setShowSettings] = useState(false);
  const sensitivity = useGameStore((state) => state.sensitivity);
  const setSensitivity = useGameStore((state) => state.setSensitivity);
  const volume = useGameStore((state) => state.volume);
  const setVolume = useGameStore((state) => state.setVolume);
  
  if (showSettings) {
      return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
            
            <div className="space-y-6 text-left">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Mouse Sensitivity: {sensitivity.toFixed(1)}</label>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="3.0" 
                        step="0.1" 
                        value={sensitivity} 
                        onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
                
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Volume: {(volume * 100).toFixed(0)}%</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="mt-8 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Back
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2 drop-shadow-sm">
            Goomba Escape
        </h1>
        <p className="text-gray-400 mb-8 text-sm tracking-wide uppercase">Stealth Horror Adventure</p>
        
        {/* Difficulty Selection */}
        <div className="mb-6">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Select Difficulty</p>
            <div className="flex justify-center space-x-2">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`px-4 py-2 rounded-lg font-bold capitalize transition text-sm border ${
                            difficulty === diff 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                            : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                        }`}
                    >
                        {diff}
                    </button>
                ))}
            </div>
            <p className="text-xs text-blue-300 mt-3 h-4 font-medium transition-all duration-300">
                {difficulty === 'easy' && "Enemy is slow and has poor vision."}
                {difficulty === 'medium' && "Standard challenge. Stay quiet!"}
                {difficulty === 'hard' && "Enemy is fast, smart, and hears everything."}
            </p>
        </div>
        
        <div className="space-y-3">
            <button 
              onClick={() => setGameState('playing')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-[1.02] shadow-lg border border-blue-500/30"
            >
              START GAME
            </button>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl transition border border-gray-700"
            >
              SETTINGS
            </button>
        </div>
        
        <div className="text-left text-gray-500 text-xs mt-8 bg-black/20 p-4 rounded-lg border border-white/5">
          <p className="font-bold mb-2 text-gray-400 uppercase tracking-wider">Controls</p>
          <div className="grid grid-cols-2 gap-2">
            <span>WASD to Move</span>
            <span>Mouse to Look</span>
            <span>E to Interact</span>
            <span>SHIFT to Sprint</span>
            <span>C to Crouch</span>
            <span>ESC to Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaughtScreen() {
  const reset = useGameStore((state) => state.reset);
  
  return (
    <div className="absolute inset-0 bg-red-900/90 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">CAUGHT!</h1>
        <p className="text-2xl text-red-200 mb-8">"GO TO YOUR ROOM!"</p>
        <button 
          onClick={reset}
          className="bg-white text-red-900 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition transform hover:scale-110 shadow-xl"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function WinScreen() {
  const reset = useGameStore((state) => state.reset);
  
  return (
    <div className="absolute inset-0 bg-green-900/90 flex items-center justify-center z-50 animate-in fade-in duration-1000">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">ESCAPED!</h1>
        <div className="flex justify-center mb-8">
            <img 
                src="https://i.ibb.co/ZzBBDd8c/Koopa-Troopa.webp" 
                alt="Jeremy" 
                className="h-48 object-contain drop-shadow-2xl animate-bounce"
            />
        </div>
        <p className="text-2xl text-green-200 mb-8">You found Jeremy! Let's play!</p>
        <button 
          onClick={reset}
          className="bg-white text-green-900 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition transform hover:scale-110 shadow-xl"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const safeKeypadOpen = useGameStore((state) => state.safeKeypadOpen);
  const toolboxKeypadOpen = useGameStore((state) => state.toolboxKeypadOpen);
  const [dpr, setDpr] = useState(1.5);
  const [lowPerformance, setLowPerformance] = useState(false);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 3D World Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={dpr} camera={{ fov: 75, position: [0, 1.6, 0] }}>
            <PerformanceMonitor 
                onIncline={() => { setDpr(2); setLowPerformance(false); }} 
                onDecline={() => { setDpr(1); setLowPerformance(true); }}
            />
            
            <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
            {!lowPerformance && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
            <Environment preset="night" />
            
            <ambientLight intensity={0.1} />
            {/* Reduced shadow map size for performance */}
            <pointLight position={[0, 4, 0]} intensity={0.5} castShadow={!lowPerformance} shadow-mapSize={[512, 512]} />
            <pointLight position={[0, 4, 10]} intensity={0.3} castShadow={!lowPerformance} shadow-mapSize={[512, 512]} />
            <pointLight position={[0, 4, 25]} intensity={0.5} castShadow={!lowPerformance} shadow-mapSize={[512, 512]} />
            
            {/* Bake static shadows if possible, though we have dynamic lights */}
            {/* <BakeShadows /> */}

            <Suspense fallback={null}>
              <House />
              <Enemy />
            </Suspense>

            {gameState === 'playing' && !lowPerformance && (
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={0.5} />
                <Noise opacity={0.1} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
            )}
            
            {(gameState === 'playing' || gameState === 'laptop') && (
            <>
                {gameState === 'playing' && <Controls />}
                <Player />
            </>
            )}
        </Canvas>
      </div>

      {/* UI Layers */}
      {gameState === 'playing' && <HUD />}
      {gameState === 'menu' && <Menu />}
      {gameState === 'laptop' && safeKeypadOpen && <SafeKeypad />}
      {gameState === 'laptop' && toolboxKeypadOpen && <ToolboxKeypad />}
      {gameState === 'laptop' && !safeKeypadOpen && !toolboxKeypadOpen && <Laptop />}
      {gameState === 'caught' && <CaughtScreen />}
      {gameState === 'won' && <WinScreen />}
      <Loader />
    </div>
  );
}
