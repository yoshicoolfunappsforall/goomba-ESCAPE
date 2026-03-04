import { StrictMode, useEffect, Suspense, useState } from 'react';
import { useGameStore } from './store/gameStore';
import Laptop from './components/Laptop/Laptop';
import { SafeKeypad } from './components/UI/SafeKeypad';
import { ToolboxKeypad } from './components/UI/ToolboxKeypad';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Sky, Stars, Loader, Environment, PerformanceMonitor, BakeShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { House } from './components/World/House';
import { Player } from './components/World/Player';
import { Enemy } from './components/World/Enemy';

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
  
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Goomba Escape</h1>
        <p className="text-gray-400 mb-8">Escape your evil parent's house to play with Jeremy!</p>
        
        <button 
          onClick={() => setGameState('playing')}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 mb-4"
        >
          Start Game
        </button>
        
        <div className="text-left text-gray-500 text-sm mt-4 bg-gray-800 p-4 rounded-lg">
          <p className="font-bold mb-1">Controls:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>WASD to Move</li>
            <li>Mouse to Look</li>
            <li>E to Interact with Laptop/Door</li>
            <li>Don't get caught by the Evil Goomba!</li>
          </ul>
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

  // Handle pointer lock unlock
  // We only want to go to menu if we unlocked MANUALLY (ESC), not if we won/lost
  const onUnlock = () => {
    const current = useGameStore.getState().gameState;
    if (current === 'playing') {
      setGameState('menu');
    }
  };

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
                {gameState === 'playing' && <PointerLockControls onUnlock={onUnlock} />}
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
