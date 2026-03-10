import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useShallow } from 'zustand/react/shallow';

export const GoomOS: React.FC = () => {
  const { setGameState } = useGameStore(useShallow(state => ({
    setGameState: state.setGameState
  })));
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [app, setApp] = useState<'desktop' | 'mail' | 'browser' | 'files'>('desktop');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'goom') {
      setUnlocked(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const closeOS = () => {
    setGameState('playing');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOS();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!unlocked) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center z-50 font-mono text-green-500">
        <div className="bg-gray-900 p-8 border-2 border-green-500 rounded w-96 relative">
          <button 
            onClick={closeOS} 
            className="absolute top-2 right-2 text-green-500 hover:text-white font-bold"
          >
            X
          </button>
          <h1 className="text-2xl mb-4 text-center">GoomOS v1.0</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="bg-black border border-green-500 p-2 text-green-500 focus:outline-none"
              autoFocus
            />
            <button type="submit" className="bg-green-900 hover:bg-green-800 text-green-100 p-2 border border-green-500">
              Login
            </button>
            <div className="text-center mt-2 text-xs text-green-700">
                Press ESC to Shutdown
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-teal-900 z-50 font-sans select-none overflow-hidden">
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col gap-4">
        <div onClick={() => setApp('mail')} className="flex flex-col items-center cursor-pointer hover:bg-white/10 p-2 rounded w-20">
          <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-1 flex items-center justify-center text-2xl">✉️</div>
          <span className="text-white text-xs drop-shadow-md">Mail</span>
        </div>
        <div onClick={() => setApp('browser')} className="flex flex-col items-center cursor-pointer hover:bg-white/10 p-2 rounded w-20">
          <div className="w-12 h-12 bg-blue-500 rounded-full mb-1 flex items-center justify-center text-2xl">🌐</div>
          <span className="text-white text-xs drop-shadow-md">GoomNet</span>
        </div>
        <div onClick={() => setApp('files')} className="flex flex-col items-center cursor-pointer hover:bg-white/10 p-2 rounded w-20">
          <div className="w-12 h-12 bg-orange-300 rounded-lg mb-1 flex items-center justify-center text-2xl">📁</div>
          <span className="text-white text-xs drop-shadow-md">Files</span>
        </div>
      </div>

      {/* Window */}
      {app !== 'desktop' && (
        <div className="absolute top-10 left-32 right-10 bottom-16 bg-gray-100 rounded-t-lg shadow-2xl flex flex-col border border-gray-400">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-1 px-2 flex justify-between items-center rounded-t-lg">
            <span className="font-bold text-sm">
              {app === 'mail' ? 'GoomMail' : app === 'browser' ? 'GoomNet Explorer' : 'File Manager'}
            </span>
            <button onClick={() => setApp('desktop')} className="bg-red-500 hover:bg-red-600 w-5 h-5 flex items-center justify-center rounded text-xs font-bold">X</button>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 overflow-auto bg-white text-black">
            {app === 'mail' && (
              <div className="flex flex-col gap-2">
                <div className="border-b pb-2 mb-2 font-bold">Inbox (1)</div>
                <div className="bg-blue-50 p-2 border rounded cursor-pointer hover:bg-blue-100">
                  <div className="font-bold text-sm">From: Dad</div>
                  <div className="text-xs text-gray-500">Subject: Safe Code Reminder</div>
                  <div className="mt-1 text-sm">
                    Hey, I keep forgetting the safe code. It's the same as the high score on the arcade machine downstairs... wait, no, upstairs now.
                    <br/><br/>
                    - Dad
                  </div>
                </div>
              </div>
            )}
            {app === 'browser' && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-6xl mb-4">🦖</div>
                <div>No Internet Connection</div>
                <div className="text-xs mt-2">Try checking the network cables... just kidding.</div>
              </div>
            )}
            {app === 'files' && (
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded mb-1"></div>
                  <span className="text-xs">family_photo.jpg</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded mb-1"></div>
                  <span className="text-xs">taxes_2024.pdf</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded mb-1"></div>
                  <span className="text-xs">secret_plan.txt</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-300 border-t border-white flex items-center px-2 shadow-inner">
        <button 
          onClick={() => setApp(app === 'desktop' ? 'mail' : 'desktop')}
          className="bg-gradient-to-b from-green-400 to-green-600 px-4 py-1 rounded-sm border-2 border-white/50 shadow text-white font-bold text-sm hover:brightness-110 active:brightness-90 mr-2 flex items-center gap-1"
        >
          <span className="text-lg leading-none">🍄</span> Start
        </button>
        <div className="bg-gray-400/50 px-2 py-1 rounded text-xs border border-gray-500 inset-shadow">
          {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
        <div className="flex-1"></div>
        <button onClick={closeOS} className="text-xs text-gray-600 hover:text-black px-2">
          Power Off
        </button>
      </div>
    </div>
  );
};
