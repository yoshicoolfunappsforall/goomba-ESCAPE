import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export function Controls() {
  const { camera, gl } = useThree();
  const isLocked = useRef(false);
  const sensitivity = useGameStore((state) => state.sensitivity);
  const gameState = useGameStore((state) => state.gameState);
  const isMobile = useGameStore((state) => state.isMobile);

  useEffect(() => {
    if (gameState === 'playing' && !isMobile) {
        gl.domElement.requestPointerLock();
    }

    const onMouseDown = () => {
      if (gameState === 'playing' && !isLocked.current && !isMobile) {
        gl.domElement.requestPointerLock();
      }
    };

    const onPointerLockChange = () => {
      if (isMobile) return;
      const locked = document.pointerLockElement === gl.domElement;
      isLocked.current = locked;
      if (!locked && useGameStore.getState().gameState === 'playing') {
          useGameStore.getState().setGameState('menu');
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isLocked.current && gameState === 'playing' && !isMobile) {
        const { movementX, movementY } = event;
        
        // Yaw (Y-axis rotation)
        camera.rotation.y -= movementX * 0.002 * sensitivity;

        // Pitch (X-axis rotation)
        camera.rotation.x -= movementY * 0.002 * sensitivity;
        
        // Clamp pitch to avoid flipping
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        
        // Ensure standard rotation order
        camera.rotation.order = 'YXZ';
      }
    };

    let lastTouchX = 0;
    let lastTouchY = 0;
    let activeTouchId: number | null = null;

    const onTouchStart = (event: TouchEvent) => {
      if (gameState !== 'playing') return;
      // Find a touch on the right side of the screen
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        if (touch.clientX > window.innerWidth / 2 && activeTouchId === null) {
          activeTouchId = touch.identifier;
          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;
        }
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (gameState !== 'playing' || activeTouchId === null) return;
      
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        if (touch.identifier === activeTouchId) {
          const movementX = touch.clientX - lastTouchX;
          const movementY = touch.clientY - lastTouchY;
          
          camera.rotation.y -= movementX * 0.004 * sensitivity;
          camera.rotation.x -= movementY * 0.004 * sensitivity;
          camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
          camera.rotation.order = 'YXZ';
          
          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;
        }
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      for (let i = 0; i < event.changedTouches.length; i++) {
        if (event.changedTouches[i].identifier === activeTouchId) {
          activeTouchId = null;
        }
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [camera, gl, gameState, sensitivity, isMobile]);

  // Unlock when not playing
  useEffect(() => {
      if (gameState !== 'playing' && !isMobile) {
          document.exitPointerLock();
          isLocked.current = false;
      }
  }, [gameState, isMobile]);

  return null;
}
