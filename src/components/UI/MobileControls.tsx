import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function MobileControls() {
  const isMobile = useGameStore((state) => state.isMobile);
  const gameState = useGameStore((state) => state.gameState);
  const setMobileMovement = useGameStore((state) => state.setMobileMovement);
  const setMobileInteract = useGameStore((state) => state.setMobileInteract);
  const interactionText = useGameStore((state) => state.interactionText);

  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchId = useRef<number | null>(null);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|ipad|playbook|silk|iphone|ipod/i.test(userAgent) || window.innerWidth <= 768;
      useGameStore.getState().setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || gameState !== 'playing') return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchId.current !== null) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (joystickRef.current && joystickRef.current.contains(touch.target as Node)) {
        touchId.current = touch.identifier;
        setIsDragging(true);
        updateJoystick(touch);
        break;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchId.current === null) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchId.current) {
        updateJoystick(touch);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        touchId.current = null;
        setIsDragging(false);
        setJoystickPos({ x: 0, y: 0 });
        setMobileMovement({ x: 0, y: 0 });
        break;
      }
    }
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    
    const maxRadius = rect.width / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }
    
    setJoystickPos({ x: dx, y: dy });
    
    // Normalize to -1 to 1
    setMobileMovement({
      x: dx / maxRadius,
      y: dy / maxRadius
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex justify-between items-end p-8">
      {/* Left Joystick */}
      <div 
        ref={joystickRef}
        className="w-32 h-32 bg-white/10 rounded-full border-2 border-white/20 relative pointer-events-auto touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div 
          className="w-12 h-12 bg-white/50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg transition-transform duration-75"
          style={{
            transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
          }}
        />
      </div>

      {/* Right Action Buttons */}
      <div className="flex flex-col gap-4 pointer-events-auto">
        {interactionText && (
          <button 
            className="w-20 h-20 bg-red-500/80 hover:bg-red-600 rounded-full border-2 border-white/50 text-white font-bold shadow-[0_0_15px_rgba(255,0,0,0.5)] active:scale-95 transition-all flex items-center justify-center"
            onTouchStart={(e) => {
              e.preventDefault();
              setMobileInteract(true);
              // Reset after a short delay to simulate key press
              setTimeout(() => setMobileInteract(false), 100);
            }}
          >
            USE
          </button>
        )}
      </div>
    </div>
  );
}
