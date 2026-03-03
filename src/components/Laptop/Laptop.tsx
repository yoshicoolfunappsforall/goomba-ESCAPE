import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, Search, Wifi, Battery, Terminal, FileText, Globe, Gamepad2, Power, Mail, ArrowLeft, ArrowRight, RotateCw, Home, File } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';

export default function Laptop() {
  const setGameState = useGameStore((state) => state.setGameState);
  const setDoorCodeKnown = useGameStore((state) => state.setDoorCodeKnown);
  const setToolboxCodeKnown = useGameStore((state) => state.setToolboxCodeKnown);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bootState, setBootState] = useState<'off' | 'booting' | 'on'>('off');
  
  // Browser State
  const [browserUrl, setBrowserUrl] = useState('https://goomle.com');
  const [browserHistory, setBrowserHistory] = useState<string[]>(['https://goomle.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Mail State
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  // Docs State
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Game State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameHighScore, setGameHighScore] = useState(0);
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [gameGameOver, setGameGameOver] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate boot sequence
    if (bootState === 'off') {
        const t1 = setTimeout(() => setBootState('booting'), 500);
        const t2 = setTimeout(() => setBootState('on'), 3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  // Game Loop
  useEffect(() => {
      if (activeApp !== 'game' || !isPlayingGame || gameGameOver) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let playerY = 200;
      let playerVelocity = 0;
      let obstacles: { x: number, h: number }[] = [];
      let frameCount = 0;
      let score = 0;
      const gravity = 0.6;
      const jumpStrength = -10;
      const speed = 5;

      const handleJump = () => {
          if (playerY > 150) { // Simple ground check
             playerVelocity = jumpStrength;
          }
      };

      const keyDownHandler = (e: KeyboardEvent) => {
          if (e.code === 'Space') handleJump();
      };
      window.addEventListener('keydown', keyDownHandler);
      canvas.addEventListener('mousedown', handleJump);

      const loop = () => {
          frameCount++;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Background
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Ground
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
          ctx.fillStyle = '#32CD32';
          ctx.fillRect(0, canvas.height - 50, canvas.width, 10);

          // Player (Goomba)
          playerVelocity += gravity;
          playerY += playerVelocity;

          // Ground Collision
          if (playerY > canvas.height - 70) {
              playerY = canvas.height - 70;
              playerVelocity = 0;
          }

          // Draw Player
          ctx.fillStyle = '#A52A2A'; // Brown
          ctx.fillRect(50, playerY, 30, 30);
          ctx.fillStyle = 'white'; // Eyes
          ctx.fillRect(55, playerY + 5, 8, 8);
          ctx.fillRect(68, playerY + 5, 8, 8);
          ctx.fillStyle = 'black'; // Pupils
          ctx.fillRect(57, playerY + 7, 4, 4);
          ctx.fillRect(70, playerY + 7, 4, 4);
          ctx.fillStyle = 'black'; // Feet
          if (Math.floor(frameCount / 10) % 2 === 0) {
             ctx.fillRect(50, playerY + 30, 12, 8);
             ctx.fillRect(68, playerY + 30, 12, 8);
          } else {
             ctx.fillRect(48, playerY + 28, 12, 8);
             ctx.fillRect(70, playerY + 28, 12, 8);
          }

          // Obstacles (Pipes)
          if (frameCount % 100 === 0) {
              obstacles.push({ x: canvas.width, h: 40 + Math.random() * 60 });
          }

          for (let i = 0; i < obstacles.length; i++) {
              let obs = obstacles[i];
              obs.x -= speed;

              // Draw Pipe
              ctx.fillStyle = '#228B22';
              ctx.fillRect(obs.x, canvas.height - 40 - obs.h, 40, obs.h);
              ctx.fillStyle = '#006400'; // Pipe rim
              ctx.fillRect(obs.x - 2, canvas.height - 40 - obs.h, 44, 20);

              // Collision
              if (
                  50 < obs.x + 40 &&
                  50 + 30 > obs.x &&
                  playerY + 30 > canvas.height - 40 - obs.h
              ) {
                  setGameGameOver(true);
                  setIsPlayingGame(false);
                  if (score > gameHighScore) setGameHighScore(score);
              }

              // Score
              if (obs.x + 40 < 50 && obs.x + 40 + speed >= 50) {
                  score++;
                  setGameScore(score);
              }
          }

          // Remove off-screen obstacles
          obstacles = obstacles.filter(obs => obs.x > -50);

          // Draw Score
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.fillText(`Score: ${score}`, 10, 30);

          if (!gameGameOver) {
            animationFrameId = requestAnimationFrame(loop);
          }
      };

      loop();

      return () => {
          window.removeEventListener('keydown', keyDownHandler);
          canvas.removeEventListener('mousedown', handleJump);
          cancelAnimationFrame(animationFrameId);
      };
  }, [activeApp, isPlayingGame, gameGameOver]);

  const startGame = () => {
      setGameScore(0);
      setGameGameOver(false);
      setIsPlayingGame(true);
  };

  const closeApp = () => {
      setActiveApp(null);
      setSearchQuery('');
      setBrowserUrl('https://goomle.com');
      setBrowserHistory(['https://goomle.com']);
      setHistoryIndex(0);
      setSelectedEmail(null);
      setSelectedDoc(null);
      setIsPlayingGame(false);
      setGameGameOver(false);
  }

  const navigateTo = (url: string) => {
      const newHistory = browserHistory.slice(0, historyIndex + 1);
      newHistory.push(url);
      setBrowserHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setBrowserUrl(url);
  };

  const handleBack = () => {
      if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setBrowserUrl(browserHistory[historyIndex - 1]);
      }
  };

  const handleForward = () => {
      if (historyIndex < browserHistory.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setBrowserUrl(browserHistory[historyIndex + 1]);
      }
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const q = searchQuery.toLowerCase();
      
      // Parental Controls / Blocking
      const blockedKeywords = ['game', 'play', 'minecraft', 'fortnite', 'roblox', 'youtube', 'twitch', 'steam', 'discord'];
      if (blockedKeywords.some(keyword => q.includes(keyword))) {
          navigateTo(`https://blocked.com?reason=parental_controls&q=${encodeURIComponent(q)}`);
          return;
      }

      navigateTo(`https://goomle.com/search?q=${encodeURIComponent(q)}`);
      
      if (q.includes('safe') || q.includes('code') || q.includes('password')) {
          setDoorCodeKnown(true);
      }
  };

  const renderBrowserContent = () => {
      const url = new URL(browserUrl);
      const path = url.pathname;
      const params = new URLSearchParams(url.search);

      if (url.hostname === 'blocked.com') {
          return (
              <div className="flex-1 flex flex-col items-center justify-center bg-red-50 p-8 text-center">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                      <X size={48} className="text-red-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-red-900 mb-2">Access Denied</h1>
                  <p className="text-red-700 mb-8 max-w-md">
                      This website or search query has been blocked by your parental controls. 
                      <br/><br/>
                      <strong>Reason:</strong> Distraction / Games
                  </p>
                  <button onClick={() => navigateTo('https://goomle.com')} className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 font-bold">
                      Return to Safety
                  </button>
              </div>
          );
      } else if (url.hostname === 'goomle.com') {
          if (path === '/search') {
              const q = params.get('q') || '';
              const qLower = q.toLowerCase();
              let resultsType = 'none';

              if (qLower.includes('safe') || qLower.includes('code') || qLower.includes('password')) resultsType = 'safe_code';
              else if (qLower.includes('vent') || qLower.includes('air') || qLower.includes('grate')) resultsType = 'vent';
              else if (qLower.includes('storage') || qLower.includes('shelf')) resultsType = 'storage';
              else if (qLower.includes('key')) resultsType = 'keys';
              else if (qLower.includes('map') || qLower.includes('layout')) resultsType = 'map';
              else if (qLower.includes('mario')) resultsType = 'mario';
              else if (qLower.includes('luigi')) resultsType = 'luigi';
              else if (qLower.includes('peach') || qLower.includes('princess')) resultsType = 'peach';
              else if (qLower.includes('bowser') || qLower.includes('king')) resultsType = 'bowser';
              else if (qLower.includes('toad')) resultsType = 'toad';
              else if (qLower.includes('yoshi')) resultsType = 'yoshi';
              else if (qLower.includes('goomba')) resultsType = 'goomba';

              return (
                <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-white">
                    <div className="flex items-center mb-6">
                        <span className="text-2xl font-bold text-gray-400 tracking-tighter mr-4 cursor-pointer" onClick={() => navigateTo('https://goomle.com')}>Goomle</span>
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="w-full max-w-lg h-10 border border-gray-300 rounded-full shadow-sm flex items-center px-4 text-gray-600">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 outline-none bg-transparent text-sm"
                                />
                                <Search size={16} className="text-blue-500 cursor-pointer" onClick={handleSearch}/>
                            </div>
                        </form>
                        <button onClick={() => setActiveApp('mail')} className="ml-4 text-gray-600 hover:underline text-sm font-medium">Mail</button>
                    </div>

                    {resultsType === 'safe_code' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">Goomle Drive › My Drive › Passwords</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://drive.goomle.com/my-drive/passwords')}>Safe Combination Backup</div>
                                <div className="text-sm text-gray-600">
                                    ... reminder for the safe in the bathroom. The code is <span className="font-bold bg-yellow-200 px-1">1996</span>. Don't forget it this time!
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'vent' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">DIYHomeRepair.com › hvac</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://diyhomerepair.com/vents')}>How to Open Stuck Vents</div>
                                <div className="text-sm text-gray-600">
                                    ...most standard vents are secured with screws. You will need a <span className="font-bold">Screwdriver</span> to open them.
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'storage' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">MyHomeNotes.com</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://myhomenotes.com/storage')}>Storage Room Organization</div>
                                <div className="text-sm text-gray-600">
                                    I keep all the tools in the storage room now. The key to the storage room is locked in the safe.
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {resultsType === 'keys' && (
                        <div className="space-y-6">
                             <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">Goomle Answers</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1">Where did I put my keys?</div>
                                <div className="text-sm text-gray-600">
                                    Reply: I hid the House Key in the air vent so the burglars won't find it.
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'map' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">Goomle Images</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1">House Blueprint</div>
                                <div className="text-sm font-mono bg-gray-100 p-4 rounded border border-gray-300 whitespace-pre">
                                    [BEDROOM] -- [HALLWAY] -- [LIVING ROOM] -- [EXIT]
                                                    |             |
                                                [BATHROOM]    [STORAGE]
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'mario' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">MushroomKingdomPolice.gov › wanted</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://MushroomKingdomPolice.gov/wanted')}>WANTED: Mario "Jumpman" Mario</div>
                                <div className="text-sm text-gray-600">
                                    Wanted for mass destruction of bricks, stomping on citizens, and plumbing without a license. Approach with extreme caution. He jumps high.
                                </div>
                            </div>
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">GoombaSupportGroup.org</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://GoombaSupportGroup.org')}>Survivors of the Stomp</div>
                                <div className="text-sm text-gray-600">
                                    Has a plumber jumped on your head? You are not alone. Join our weekly meetings. Refreshments provided (no mushrooms).
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'luigi' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">GhostHunters.net</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://GhostHunters.net')}>Green Plumber Sighting</div>
                                <div className="text-sm text-gray-600">
                                    Witnesses report a tall, green-clad plumber looking terrified in a haunted mansion. Seems harmless compared to the red one.
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'peach' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">PrincessPeachCastle.com › news</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://PrincessPeachCastle.com')}>Princess Kidnapped... Again</div>
                                <div className="text-sm text-gray-600">
                                    For the 84th time this month, Princess Peach has been "kidnapped". Castle security budget is under review.
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'bowser' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">KingKoopaOfficial.com</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://KingKoopaOfficial.com')}>Our Glorious Leader</div>
                                <div className="text-sm text-gray-600">
                                    Hail King Bowser! The strongest, coolest, and most awesome turtle ever. Sign up for the Koopa Troop today! Benefits include dental.
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'toad' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">CookingWithKoopa.com</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://CookingWithKoopa.com')}>101 Ways to Cook Mushrooms</div>
                                <div className="text-sm text-gray-600">
                                    Delicious recipes for those annoying little fungi. Sautéed, fried, or stewed!
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'yoshi' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">DinoPedia.org</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://DinoPedia.org')}>Yoshi: Friend or Mount?</div>
                                <div className="text-sm text-gray-600">
                                    Studies show 90% of Yoshis are abandoned in pits by plumbers seeking an extra jump. #YoshiRights
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'goomba' && (
                        <div className="space-y-6">
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">Ancestry.com › goomba</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://Ancestry.com')}>Know Your Roots</div>
                                <div className="text-sm text-gray-600">
                                    Did you know? Goombas were once inhabitants of the Mushroom Kingdom who betrayed the Toads. We are a proud people!
                                </div>
                            </div>
                            <div className="max-w-2xl">
                                <div className="text-sm text-gray-800 mb-1">GoombaSupportGroup.org</div>
                                <div className="text-xl text-blue-800 font-medium hover:underline cursor-pointer mb-1" onClick={() => navigateTo('https://GoombaSupportGroup.org')}>Survivors of the Stomp</div>
                                <div className="text-sm text-gray-600">
                                    Has a plumber jumped on your head? You are not alone. Join our weekly meetings. Refreshments provided (no mushrooms).
                                </div>
                            </div>
                        </div>
                    )}

                    {resultsType === 'none' && (
                        <div className="text-gray-600">
                            <p>Your search - <span className="font-bold">{q}</span> - did not match any documents.</p>
                            <p className="mt-4">Suggestions:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Make sure that all words are spelled correctly.</li>
                                <li>Try different keywords (e.g., "safe code", "vent", "keys").</li>
                                <li>Try more general keywords.</li>
                            </ul>
                        </div>
                    )}
                </div>
              );
          } else {
              // Home Page
              return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative">
                    <div className="absolute top-4 right-4 flex space-x-4 items-center">
                        <button onClick={() => setActiveApp('mail')} className="text-gray-600 hover:underline text-sm font-medium">Mail</button>
                        <button className="text-gray-600 hover:underline text-sm font-medium">Images</button>
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">G</div>
                    </div>
                    <span className="text-6xl font-bold text-gray-300 mb-8 tracking-tighter">Goomle</span>
                    <form onSubmit={handleSearch} className="w-full max-w-lg">
                        <div className="w-full h-12 border border-gray-300 rounded-full shadow-sm flex items-center px-6 text-gray-600 hover:shadow-md transition focus-within:ring-2 focus-within:ring-blue-200">
                            <Search size={20} className="mr-3 text-gray-400"/> 
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Goomle or type a URL"
                                className="flex-1 outline-none bg-transparent"
                                autoFocus
                            />
                        </div>
                        <div className="mt-8 flex space-x-4 justify-center">
                            <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-600 font-medium">Goomle Search</button>
                            <button type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-600 font-medium">I'm Feeling Lucky</button>
                        </div>
                    </form>
                    <div className="mt-12 text-sm text-gray-400">
                        <p className="font-semibold mb-2">Trending Searches:</p>
                        <div className="flex space-x-4">
                            <button onClick={() => { setSearchQuery('safe code'); setTimeout(() => document.querySelector('form')?.requestSubmit(), 100); }} className="text-blue-500 hover:underline">safe code</button>
                            <button onClick={() => { setSearchQuery('vent cleaning'); setTimeout(() => document.querySelector('form')?.requestSubmit(), 100); }} className="text-blue-500 hover:underline">vent cleaning</button>
                            <button onClick={() => { setSearchQuery('lost keys'); setTimeout(() => document.querySelector('form')?.requestSubmit(), 100); }} className="text-blue-500 hover:underline">lost keys</button>
                        </div>
                    </div>
                </div>
              );
          }
      } else if (url.hostname === 'drive.goomle.com') {
          return (
              <div className="flex-1 bg-gray-50 p-8 font-sans">
                  <div className="bg-white p-8 shadow rounded max-w-3xl mx-auto border border-gray-200">
                      <h1 className="text-2xl font-bold mb-4 text-gray-800">Safe Combination Backup</h1>
                      <p className="text-gray-600 mb-4">Last edited: Yesterday</p>
                      <hr className="mb-6"/>
                      <p className="leading-relaxed text-gray-800">
                          Note to self:<br/><br/>
                          The code for the bathroom safe is <strong>1996</strong>.<br/>
                          Inside is the key to the Storage Room.<br/><br/>
                          Don't lose it again!
                      </p>
                  </div>
              </div>
          )
      } else if (url.hostname === 'diyhomerepair.com') {
          return (
              <div className="flex-1 bg-orange-50 p-8 font-serif">
                  <div className="max-w-3xl mx-auto">
                      <h1 className="text-4xl font-bold text-orange-900 mb-4">DIY Home Repair</h1>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Open Stuck Vents</h2>
                      <p className="text-lg leading-relaxed text-gray-700 mb-4">
                          If your air vent is stuck or screwed shut, do not attempt to force it open. 
                          Most residential vents use standard Phillips head screws.
                      </p>
                      <div className="bg-yellow-100 p-4 border-l-4 border-yellow-500 mb-4">
                          <strong>Tip:</strong> You will need a <span className="font-bold">Screwdriver</span>. 
                          Check your toolbox!
                      </div>
                  </div>
              </div>
          )
      } else if (url.hostname === 'myhomenotes.com') {
           return (
              <div className="flex-1 bg-white p-8 font-sans">
                  <div className="max-w-3xl mx-auto">
                      <h1 className="text-3xl font-bold text-blue-600 mb-6">My Home Notes</h1>
                      <div className="space-y-4">
                          <div className="border p-4 rounded bg-gray-50">
                              <h3 className="font-bold text-lg">Storage Room</h3>
                              <p>I moved all the heavy tools to the storage room. The kids kept playing with the screwdriver.</p>
                          </div>
                          <div className="border p-4 rounded bg-gray-50">
                              <h3 className="font-bold text-lg">Toolbox Lock</h3>
                              <p>I put a combination lock on the red toolbox. I emailed the code to myself so I wouldn't forget.</p>
                          </div>
                      </div>
                  </div>
              </div>
          )
      } else if (url.hostname === 'goombasupportgroup.org') {
          return (
              <div className="flex-1 bg-amber-50 p-8 font-sans">
                  <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg border-t-8 border-amber-700">
                      <h1 className="text-4xl font-bold text-amber-900 mb-2">Survivors of the Stomp</h1>
                      <p className="text-amber-700 italic mb-8">"We may be flat, but we are not broken."</p>
                      
                      <div className="space-y-6">
                          <div className="bg-amber-100 p-6 rounded-lg">
                              <h2 className="text-xl font-bold text-amber-800 mb-2">Weekly Meeting</h2>
                              <p className="text-gray-700">Join us every Tuesday at World 1-1. We discuss coping mechanisms for living in fear of falling plumbers.</p>
                          </div>
                          
                          <div className="bg-amber-100 p-6 rounded-lg">
                              <h2 className="text-xl font-bold text-amber-800 mb-2">Testimonials</h2>
                              <p className="text-gray-700 italic">"I was just walking back and forth, minding my own business, when suddenly... darkness. Then I woke up and he was gone." - Gary the Goomba</p>
                          </div>

                          <div className="bg-red-100 p-6 rounded-lg border border-red-200">
                              <h2 className="text-xl font-bold text-red-800 mb-2">Safety Alert!</h2>
                              <p className="text-red-700">Reports of a "Fire Flower" in the area. Stay away from bouncing fireballs!</p>
                          </div>
                      </div>
                  </div>
              </div>
          )
      } else if (url.hostname === 'mushroomkingdompolice.gov') {
          return (
              <div className="flex-1 bg-blue-900 p-8 font-sans text-white">
                  <div className="max-w-3xl mx-auto border-4 border-yellow-400 p-8 bg-blue-800">
                      <h1 className="text-5xl font-black text-center text-yellow-400 mb-8 uppercase tracking-widest">WANTED</h1>
                      <div className="flex justify-center mb-8">
                          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 font-bold border-4 border-white">
                              [IMAGE OF MARIO]
                          </div>
                      </div>
                      <h2 className="text-3xl font-bold text-center mb-4">MARIO "JUMPMAN" MARIO</h2>
                      <div className="grid grid-cols-2 gap-4 text-lg mb-8">
                          <div className="font-bold text-right">CRIMES:</div>
                          <div>Property Damage (Bricks)</div>
                          <div className="font-bold text-right">LAST SEEN:</div>
                          <div>Jumping down a pipe</div>
                          <div className="font-bold text-right">REWARD:</div>
                          <div>10,000 Coins</div>
                      </div>
                      <p className="text-center text-yellow-200">If seen, do not approach. He is armed with shells.</p>
                  </div>
              </div>
          )
      } else if (url.hostname === 'ghosthunters.net') {
          return (
              <div className="flex-1 bg-black p-8 font-mono text-green-500">
                  <div className="max-w-3xl mx-auto border border-green-900 p-4 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                      <h1 className="text-3xl font-bold mb-6 glitch-text">GHOST HUNTERS FORUM</h1>
                      <div className="space-y-4">
                          <div className="border-b border-green-900 pb-4">
                              <div className="text-xs text-green-700">Posted by: BooLover99</div>
                              <h3 className="text-xl font-bold mb-2">Green Plumber?</h3>
                              <p>I saw him again. The tall one in green. He was vacuuming up my cousin! What kind of vacuum does that?!</p>
                          </div>
                          <div className="border-b border-green-900 pb-4">
                              <div className="text-xs text-green-700">Posted by: KingBoo</div>
                              <h3 className="text-xl font-bold mb-2">RE: Green Plumber?</h3>
                              <p>Don't worry, I have a plan. We'll trap him in a painting. It'll be hilarious.</p>
                          </div>
                      </div>
                  </div>
              </div>
          )
      } else if (url.hostname === 'princesspeachcastle.com') {
          return (
              <div className="flex-1 bg-pink-50 p-8 font-serif">
                  <div className="max-w-3xl mx-auto bg-white p-8 shadow-xl rounded-2xl border-4 border-pink-200">
                      <div className="text-center mb-8">
                          <h1 className="text-4xl font-bold text-pink-600">The Royal Gazette</h1>
                          <div className="h-1 w-32 bg-pink-300 mx-auto mt-2"></div>
                      </div>
                      <div className="space-y-8">
                          <div>
                              <h2 className="text-2xl font-bold text-gray-800 mb-2">Princess Kidnapped... Again</h2>
                              <p className="text-gray-600 leading-relaxed">
                                  In a shocking turn of events that absolutely everyone saw coming, Princess Peach has been kidnapped by Bowser. 
                                  Toadsworth released a statement saying, "We really need to fix that back door."
                              </p>
                          </div>
                          <div>
                              <h2 className="text-2xl font-bold text-gray-800 mb-2">Cake Baking Contest Postponed</h2>
                              <p className="text-gray-600 leading-relaxed">
                                  Due to the kidnapping, the annual "Thank You Mario" cake baking has been put on hold.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          )
      } else if (url.hostname === 'kingkoopaofficial.com') {
          return (
              <div className="flex-1 bg-gray-900 p-8 font-sans text-white">
                  <div className="max-w-4xl mx-auto">
                      <div className="bg-red-700 p-8 rounded-t-lg text-center">
                          <h1 className="text-5xl font-black uppercase tracking-tighter">KOOPA TROOP</h1>
                          <p className="text-red-200 font-bold mt-2">STRENGTH. LOYALTY. SPIKES.</p>
                      </div>
                      <div className="bg-gray-800 p-8 rounded-b-lg">
                          <h2 className="text-3xl font-bold mb-6 text-center">Why Join Us?</h2>
                          <div className="grid grid-cols-3 gap-6 text-center">
                              <div className="bg-gray-700 p-4 rounded">
                                  <div className="text-4xl mb-2">💪</div>
                                  <h3 className="font-bold mb-2">Power</h3>
                                  <p className="text-sm text-gray-400">Be part of the biggest army in the world.</p>
                              </div>
                              <div className="bg-gray-700 p-4 rounded">
                                  <div className="text-4xl mb-2">🏰</div>
                                  <h3 className="font-bold mb-2">Housing</h3>
                                  <p className="text-sm text-gray-400">Free lava-side condos for all minions.</p>
                              </div>
                              <div className="bg-gray-700 p-4 rounded">
                                  <div className="text-4xl mb-2">🦷</div>
                                  <h3 className="font-bold mb-2">Dental</h3>
                                  <p className="text-sm text-gray-400">Keep those fangs sharp!</p>
                              </div>
                          </div>
                          <div className="mt-8 text-center">
                              <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full uppercase tracking-wide">Enlist Now</button>
                          </div>
                      </div>
                  </div>
              </div>
          )
      } else if (url.hostname === 'cookingwithkoopa.com') {
          return (
              <div className="flex-1 bg-orange-100 p-8 font-serif">
                  <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded border border-orange-200">
                      <h1 className="text-4xl font-bold text-orange-800 text-center mb-8">Cooking with Koopa</h1>
                      <div className="space-y-8">
                          <div className="flex items-start space-x-4">
                              <div className="w-24 h-24 bg-orange-200 rounded flex-shrink-0"></div>
                              <div>
                                  <h2 className="text-2xl font-bold text-gray-800">Spicy Mushroom Stew</h2>
                                  <p className="text-gray-600 mb-2">A fiery dish to warm your shell.</p>
                                  <p className="text-sm text-orange-600 font-bold">Ingredients: 3 Red Mushrooms, 1 Fire Flower, Lava Sauce</p>
                              </div>
                          </div>
                          <div className="flex items-start space-x-4">
                              <div className="w-24 h-24 bg-green-200 rounded flex-shrink-0"></div>
                              <div>
                                  <h2 className="text-2xl font-bold text-gray-800">1-Up Salad</h2>
                                  <p className="text-gray-600 mb-2">Feeling tired? This salad gives you a second wind!</p>
                                  <p className="text-sm text-orange-600 font-bold">Ingredients: 1 Green Mushroom, Lettuce, Star Bits</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )
      } else if (url.hostname === 'dinopedia.org') {
          return (
              <div className="flex-1 bg-green-50 p-8 font-sans">
                  <div className="max-w-3xl mx-auto bg-white p-8 shadow rounded-lg border-l-8 border-green-500">
                      <h1 className="text-4xl font-bold text-green-800 mb-6">Yoshi (T. Yoshisaur Munchakoopas)</h1>
                      <p className="text-lg leading-relaxed text-gray-700 mb-4">
                          <strong>Yoshi</strong> is a dinosaur-like species from Yoshi's Island. They are known for their long tongues, voracious appetites, and ability to lay eggs immediately after eating enemies.
                      </p>
                      <h2 className="text-2xl font-bold text-green-700 mt-6 mb-2">Diet</h2>
                      <p className="text-gray-700">
                          Yoshis are omnivores. They eat fruit, enemies, and even ghosts. However, they dislike dolphins.
                      </p>
                      <h2 className="text-2xl font-bold text-green-700 mt-6 mb-2">Controversy</h2>
                      <p className="text-gray-700">
                          Many activists claim that Mario mistreats Yoshis by punching them in the back of the head to make them stick out their tongues, and abandoning them in bottomless pits to gain extra jump height.
                      </p>
                  </div>
              </div>
          )
      } else if (url.hostname === 'ancestry.com') {
          return (
              <div className="flex-1 bg-slate-100 p-8 font-serif">
                  <div className="max-w-3xl mx-auto bg-white p-12 shadow-2xl">
                      <h1 className="text-4xl font-bold text-slate-800 text-center mb-8">Discover Your Lineage</h1>
                      <div className="border-t border-b border-slate-200 py-8 text-center">
                          <h2 className="text-2xl font-bold text-slate-600 mb-4">The Goomba History</h2>
                          <p className="text-slate-500 leading-relaxed max-w-lg mx-auto">
                              Originally loyal citizens of the Mushroom Kingdom, the Goombas defected to the Koopa Troop during the first invasion. 
                              Known as "Little Goombas" in ancient texts, they are the backbone of Bowser's army.
                          </p>
                      </div>
                      <div className="mt-8 text-center">
                          <p className="text-sm text-slate-400">Search your family tree. Are you related to Goomboss?</p>
                          <div className="mt-4">
                              <input type="text" placeholder="Enter Last Name" className="border p-2 rounded w-64" />
                              <button className="bg-green-600 text-white px-4 py-2 rounded ml-2">Search</button>
                          </div>
                      </div>
                  </div>
              </div>
          )
      }

      return (
          <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500">
              <div className="text-center">
                  <h1 className="text-4xl font-bold mb-2">404</h1>
                  <p>Page Not Found</p>
              </div>
          </div>
      );
  };

  const emails = [
      { id: 1, from: 'Hardware Store', subject: 'Your Order #12345', body: 'Thank you for buying the Red Toolbox. Your default combination is 7-2-4. Do not forget it!' },
      { id: 2, from: 'Mom', subject: 'Dinner tonight?', body: 'Are you coming over for dinner? Bring the kids!' },
      { id: 3, from: 'Boss', subject: 'Meeting rescheduled', body: 'The meeting is moved to Monday.' },
  ];

  const docs = [
      { id: 'notes', title: 'Secret Notes.txt', content: 'To-Do List:\n- Buy more mushrooms\n- Fix the pipe in the basement\n- Safe Code: Saved in Goomle Drive. Search "safe code".\n- Don\'t let the kid out!' },
      { id: 'plan', title: 'World Domination Plan.doc', content: 'Phase 1: Kidnap Princess.\nPhase 2: Build castles.\nPhase 3: ???\nPhase 4: Profit.' },
      { id: 'diary', title: 'Dear Diary.doc', content: 'Today Mario jumped on me again. It hurts. Why does he do this? I just want to walk back and forth.' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center overflow-hidden font-sans backdrop-blur-sm">
      {/* Bezel */}
      <div className="relative w-[90vw] h-[85vh] max-w-5xl bg-gray-900 p-4 rounded-2xl shadow-2xl border-b-8 border-r-8 border-gray-800 flex flex-col ring-1 ring-white/10">
        
        {/* Webcam */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-black border border-gray-700 z-20">
            <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-blue-900/50"></div>
        </div>

        {/* Screen */}
        <div className="flex-1 bg-black relative rounded-lg overflow-hidden shadow-inner border border-gray-800">
          
          <AnimatePresence mode="wait">
            {bootState === 'booting' && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white flex flex-col items-center justify-center"
                >
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <Globe size={64} className="text-orange-500 mb-4 animate-spin-slow" />
                        <h1 className="text-2xl font-bold text-gray-600">BowserOS</h1>
                    </motion.div>
                    <motion.div 
                        className="mt-8 w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
                    >
                        <motion.div 
                            className="h-full bg-orange-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />
                    </motion.div>
                </motion.div>
            )}

            {bootState === 'on' && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497250681960-ef046c08a56e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}
                >
                    {/* Desktop Icons - Responsive Grid */}
                    <div className="absolute inset-0 p-6 pb-20 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] grid-rows-[repeat(auto-fill,minmax(100px,1fr))] gap-4 content-start justify-items-center pointer-events-none">
                        <div className="pointer-events-auto"><DesktopIcon icon={<FileText className="text-blue-500" />} label="Goomle Docs" onClick={() => setActiveApp('docs')} color="bg-blue-50" /></div>
                        <div className="pointer-events-auto"><DesktopIcon icon={<Globe className="text-orange-500" />} label="Bowser" onClick={() => setActiveApp('browser')} color="bg-white" /></div>
                        <div className="pointer-events-auto"><DesktopIcon icon={<Mail className="text-blue-500" />} label="Mail" onClick={() => setActiveApp('mail')} color="bg-blue-100" /></div>
                        <div className="pointer-events-auto"><DesktopIcon icon={<Gamepad2 className="text-white" />} label="Games" onClick={() => setActiveApp('game')} color="bg-purple-600" /></div>
                        <div className="pointer-events-auto"><DesktopIcon icon={<Terminal className="text-white" />} label="Terminal" onClick={() => setActiveApp('terminal')} color="bg-gray-800" /></div>
                    </div>

                    {/* Windows */}
                    <AnimatePresence>
                        {activeApp === 'docs' && (
                            <Window title="Goomle Docs" onClose={closeApp} width={700} height={500} color="blue">
                                <div className="flex-1 flex bg-white overflow-hidden">
                                     {/* Sidebar */}
                                     <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
                                        <div className="p-4 font-bold text-gray-600">Recent Docs</div>
                                        <div className="flex-1 overflow-y-auto">
                                            {docs.map(doc => (
                                                <div 
                                                    key={doc.id} 
                                                    onClick={() => setSelectedDoc(doc.id)} 
                                                    className={`px-4 py-2 text-sm cursor-pointer truncate ${selectedDoc === doc.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    <div className="flex items-center">
                                                        <File size={14} className="mr-2"/> {doc.title}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-8 overflow-y-auto bg-white">
                                        {selectedDoc ? (
                                            <div className="max-w-2xl mx-auto shadow-sm border p-8 min-h-full">
                                                <h1 className="text-2xl font-bold mb-4">{docs.find(d => d.id === selectedDoc)?.title}</h1>
                                                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif">
                                                    {docs.find(d => d.id === selectedDoc)?.content}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                Select a document to view
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Window>
                        )}

                        {activeApp === 'browser' && (
                            <Window title="Bowser" onClose={closeApp} width={800} height={500}>
                                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                                    {/* Browser Toolbar */}
                                    <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-gray-50">
                                        <div className="flex space-x-1 text-gray-500">
                                            <button onClick={handleBack} disabled={historyIndex === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowLeft size={16}/></button>
                                            <button onClick={handleForward} disabled={historyIndex === browserHistory.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowRight size={16}/></button>
                                            <button onClick={() => navigateTo(browserUrl)} className="p-1 hover:bg-gray-200 rounded"><RotateCw size={16}/></button>
                                            <button onClick={() => navigateTo('https://goomle.com')} className="p-1 hover:bg-gray-200 rounded"><Home size={16}/></button>
                                        </div>
                                        <div className="flex-1 bg-white h-8 rounded-full border border-gray-300 flex items-center px-4 text-sm text-gray-600 shadow-sm overflow-hidden whitespace-nowrap">
                                            <span className="text-green-600 mr-2">🔒</span> {browserUrl}
                                        </div>
                                    </div>
                                    
                                    {/* Browser Content */}
                                    {renderBrowserContent()}
                                </div>
                            </Window>
                        )}

                        {activeApp === 'mail' && (
                            <Window title="Goomle Mail" onClose={closeApp} width={700} height={500} color="blue">
                                <div className="flex-1 flex bg-white overflow-hidden">
                                    {/* Sidebar */}
                                    <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
                                        <div className="p-4">
                                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition">Compose</button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto">
                                            <div className="px-4 py-2 bg-blue-50 text-blue-700 font-medium cursor-pointer">Inbox (3)</div>
                                            <div className="px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer">Sent</div>
                                            <div className="px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer">Drafts</div>
                                            <div className="px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer">Spam</div>
                                        </div>
                                    </div>
                                    
                                    {/* Email List / Detail */}
                                    <div className="flex-1 flex flex-col">
                                        {selectedEmail === null ? (
                                            <div className="flex-1 overflow-y-auto">
                                                {emails.map(email => (
                                                    <div key={email.id} onClick={() => { setSelectedEmail(email.id); if(email.id === 1) setToolboxCodeKnown(true); }} className="border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer transition">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="font-bold text-gray-800">{email.from}</span>
                                                            <span className="text-xs text-gray-400">10:42 AM</span>
                                                        </div>
                                                        <div className="font-medium text-gray-700 text-sm mb-1">{email.subject}</div>
                                                        <div className="text-gray-500 text-sm truncate">{email.body}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col">
                                                <div className="p-4 border-b border-gray-200 flex items-center">
                                                    <button onClick={() => setSelectedEmail(null)} className="mr-4 p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={16}/></button>
                                                    <h2 className="font-bold text-lg text-gray-800">{emails.find(e => e.id === selectedEmail)?.subject}</h2>
                                                </div>
                                                <div className="p-6 flex-1 overflow-y-auto">
                                                    <div className="flex items-center mb-6">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                                            {emails.find(e => e.id === selectedEmail)?.from[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-800">{emails.find(e => e.id === selectedEmail)?.from}</div>
                                                            <div className="text-xs text-gray-500">to me</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                        {emails.find(e => e.id === selectedEmail)?.body}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Window>
                        )}

                        {activeApp === 'game' && (
                            <Window title="Super Goomba Bros" onClose={closeApp} width={600} height={400} color="purple">
                                <div className="flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden">
                                    {!isPlayingGame ? (
                                        <div className="text-center z-10">
                                            <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">Super Goomba Bros</h1>
                                            <p className="text-gray-400 mb-8">Score: {gameScore} | High Score: {gameHighScore}</p>
                                            <button 
                                                onClick={startGame}
                                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition transform hover:scale-105"
                                            >
                                                {gameGameOver ? 'Try Again' : 'Start Game'}
                                            </button>
                                            <p className="mt-4 text-xs text-gray-500">Press Space or Click to Jump</p>
                                        </div>
                                    ) : (
                                        <canvas 
                                            ref={canvasRef} 
                                            width={600} 
                                            height={360} 
                                            className="w-full h-full cursor-pointer"
                                        />
                                    )}
                                </div>
                            </Window>
                        )}

                        {activeApp === 'terminal' && (
                             <Window title="Terminal" onClose={closeApp} width={600} height={400} color="gray">
                                <div className="flex-1 bg-black p-4 font-mono text-green-400 text-sm overflow-y-auto">
                                    <p>goomba@chromebook:~$ <span className="text-white">ls -la</span></p>
                                    <p className="text-gray-400">drwxr-xr-x 2 goomba goomba 4096 Mar 01 17:00 .</p>
                                    <p className="text-gray-400">drwxr-xr-x 3 root   root   4096 Jan 01 00:00 ..</p>
                                    <p className="text-gray-400">-rw-r--r-- 1 goomba goomba   24 Mar 01 16:20 secret_notes.txt</p>
                                    <p>goomba@chromebook:~$ <span className="text-white">cat secret_notes.txt</span></p>
                                    <p>Safe Code: [REDACTED] - Check Goomle Drive</p>
                                    <p>goomba@chromebook:~$ <span className="animate-pulse">_</span></p>
                                </div>
                             </Window>
                        )}
                    </AnimatePresence>

                    {/* Shelf (Taskbar) */}
                    <div className="absolute bottom-4 left-4 right-4 h-14 bg-gray-900/80 backdrop-blur-xl rounded-2xl flex items-center justify-between px-6 shadow-2xl border border-white/5 z-50">
                        <div className="flex items-center space-x-6">
                        <button className="p-3 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition group">
                            <div className="w-3 h-3 rounded-full bg-white/80 group-hover:bg-white transition"></div>
                        </button>
                        <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                        <TaskbarIcon icon={<Globe className="text-orange-400" />} onClick={() => setActiveApp('browser')} active={activeApp === 'browser'} />
                        <TaskbarIcon icon={<Mail className="text-blue-400" />} onClick={() => setActiveApp('mail')} active={activeApp === 'mail'} />
                        <TaskbarIcon icon={<FileText className="text-blue-400" />} onClick={() => setActiveApp('docs')} active={activeApp === 'docs'} />
                        <TaskbarIcon icon={<Gamepad2 className="text-purple-400" />} onClick={() => setActiveApp('game')} active={activeApp === 'game'} />
                        <TaskbarIcon icon={<Terminal className="text-gray-400" />} onClick={() => setActiveApp('terminal')} active={activeApp === 'terminal'} />
                        </div>

                        <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4 bg-gray-800/50 px-4 py-2 rounded-full border border-white/5 hover:bg-gray-800/80 transition cursor-default">
                            <Wifi size={16} className="text-gray-300" />
                            <Battery size={16} className="text-gray-300" />
                            <span className="text-sm font-medium text-gray-200">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Laptop Brand Logo */}
        <div className="h-8 flex items-center justify-center">
            <span className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">Bowserbook</span>
        </div>
      </div>

      {/* Close Button (Physical Interaction) */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setGameState('playing')}
        className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full backdrop-blur-md transition border border-white/10 flex items-center space-x-2 font-medium"
      >
        <Power size={18} />
        <span>Close Laptop (ESC)</span>
      </motion.button>
    </div>
  );
}

function DesktopIcon({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center group w-full">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-200 ring-2 ring-transparent group-hover:ring-white/20`}>
                {/* @ts-ignore */}
                {React.cloneElement(icon as React.ReactElement, { size: 28 })}
            </div>
            <span className="text-white text-xs mt-2 drop-shadow-md font-medium bg-black/20 px-2 py-0.5 rounded-full text-center w-full truncate">{label}</span>
        </button>
    );
}

function TaskbarIcon({ icon, onClick, active }: { icon: React.ReactNode, onClick: () => void, active: boolean }) {
    return (
        <button onClick={onClick} className={`p-2 rounded-xl transition relative ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            {/* @ts-ignore */}
            {React.cloneElement(icon as React.ReactElement, { size: 24 })}
            {active && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
        </button>
    );
}

function Window({ title, children, onClose, width = 500, height = 350, color = 'gray' }: { title: string, children: React.ReactNode, onClose: () => void, width?: number, height?: number, color?: string }) {
    return (
        <motion.div 
            drag
            dragMomentum={false}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`absolute top-20 left-1/2 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200`}
            style={{ width, height, x: '-50%' }}
        >
            <div className={`h-10 bg-${color}-50 border-b border-${color}-100 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing`}>
                <span className={`text-sm text-${color}-900 font-semibold flex items-center`}>
                    {title}
                </span>
                <div className="flex space-x-2">
                    <button onClick={onClose} className={`p-1.5 hover:bg-${color}-200 rounded-full transition`}><Minus size={12} className={`text-${color}-700`}/></button>
                    <button onClick={onClose} className={`p-1.5 hover:bg-${color}-200 rounded-full transition`}><Square size={10} className={`text-${color}-700`}/></button>
                    <button onClick={onClose} className="p-1.5 hover:bg-red-100 rounded-full transition group"><X size={12} className="text-red-500 group-hover:text-red-600"/></button>
                </div>
            </div>
            {children}
        </motion.div>
    );
}
