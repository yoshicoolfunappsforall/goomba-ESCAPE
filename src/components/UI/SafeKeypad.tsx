import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { X } from 'lucide-react';

export function SafeKeypad() {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { setSafeKeypadOpen, setSafeOpen, setGameState } = useGameStore(useShallow(state => ({
    setSafeKeypadOpen: state.setSafeKeypadOpen,
    setSafeOpen: state.setSafeOpen,
    setGameState: state.setGameState
  })));

  const handlePress = (num: string) => {
    if (input.length < 4) {
      setInput(prev => prev + num);
      setError(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setError(false);
  };

  const handleSubmit = () => {
    if (input === '1996') {
      setSuccess(true);
      setTimeout(() => {
        setSafeOpen(true);
        setSafeKeypadOpen(false);
        setGameState('playing');
      }, 1000);
    } else {
      setError(true);
      setInput('');
    }
  };

  const handleClose = () => {
      setSafeKeypadOpen(false);
      setGameState('playing');
  }

  // Handle keyboard input
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key >= '0' && e.key <= '9') {
              handlePress(e.key);
          } else if (e.key === 'Backspace') {
              setInput(prev => prev.slice(0, -1));
          } else if (e.key === 'Enter') {
              handleSubmit();
          } else if (e.key === 'Escape') {
              handleClose();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-600 w-80 relative">
        <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
            <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Security Safe</h2>
        
        {/* Display */}
        <div className={`bg-black/50 p-4 rounded-lg mb-6 text-center text-3xl font-mono tracking-widest h-16 flex items-center justify-center border-2 ${error ? 'border-red-500 text-red-500' : success ? 'border-green-500 text-green-500' : 'border-gray-600 text-green-400'}`}>
          {success ? 'OPEN' : error ? 'ERROR' : input.padEnd(4, '_')}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-lg transition shadow-lg active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="bg-red-900/50 hover:bg-red-800/50 text-red-200 font-bold py-4 rounded-lg transition shadow-lg active:scale-95"
          >
            C
          </button>
          <button
            onClick={() => handlePress('0')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-lg transition shadow-lg active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-900/50 hover:bg-green-800/50 text-green-200 font-bold py-4 rounded-lg transition shadow-lg active:scale-95"
          >
            ↵
          </button>
        </div>
        
        <p className="text-center text-gray-500 text-sm">Enter 4-digit passcode</p>
      </div>
    </div>
  );
}
