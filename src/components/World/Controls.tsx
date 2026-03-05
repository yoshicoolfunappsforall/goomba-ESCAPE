import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export function Controls() {
  const { camera, gl } = useThree();
  const isLocked = useRef(false);
  const sensitivity = useGameStore((state) => state.sensitivity);
  const gameState = useGameStore((state) => state.gameState);

  useEffect(() => {
    if (gameState === 'playing') {
        gl.domElement.requestPointerLock();
    }

    const onMouseDown = () => {
      if (gameState === 'playing' && !isLocked.current) {
        gl.domElement.requestPointerLock();
      }
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === gl.domElement;
      isLocked.current = locked;
      if (!locked && useGameStore.getState().gameState === 'playing') {
          useGameStore.getState().setGameState('menu');
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isLocked.current && gameState === 'playing') {
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

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [camera, gl, gameState, sensitivity]);

  // Unlock when not playing
  useEffect(() => {
      if (gameState !== 'playing') {
          document.exitPointerLock();
          isLocked.current = false;
      }
  }, [gameState]);

  return null;
}
