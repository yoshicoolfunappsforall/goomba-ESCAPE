import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function ToolboxKeypad() {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const setToolboxOpen = useGameStore((state) => state.setToolboxOpen);
  const setToolboxKeypadOpen = useGameStore((state) => state.setToolboxKeypadOpen);
  const setGameState = useGameStore((state) => state.setGameState);

  const handlePress = (num: string) => {
    if (input.length < 3) {
      setInput(prev => prev + num);
      setError(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setError(false);
  };

  const handleEnter = () => {
    if (input === '724') {
      setToolboxOpen(true);
      setToolboxKeypadOpen(false);
      setGameState('playing');
    } else {
      setError(true);
      setInput('');
    }
  };

  const handleClose = () => {
    setToolboxKeypadOpen(false);
    setGameState('playing');
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-xl border-4 border-gray-600 shadow-2xl w-80">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-200">TOOLBOX LOCK</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-xl font-bold">✕</button>
        </div>
        
        <div className={`bg-black p-4 mb-6 rounded border-2 ${error ? 'border-red-500' : 'border-green-500/30'} h-16 flex items-center justify-center`}>
          <span className={`text-3xl font-mono tracking-widest ${error ? 'text-red-500' : 'text-green-500'}`}>
            {input.padEnd(3, '_')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded shadow active:transform active:scale-95 transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="bg-red-900 hover:bg-red-800 text-white font-bold py-4 rounded shadow active:transform active:scale-95 transition"
          >
            CLR
          </button>
          <button
            onClick={() => handlePress('0')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded shadow active:transform active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handleEnter}
            className="bg-green-700 hover:bg-green-600 text-white font-bold py-4 rounded shadow active:transform active:scale-95 transition"
          >
            ENT
          </button>
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-4">
          Hint: Check the laptop...
        </p>
      </div>
    </div>
  );
}
