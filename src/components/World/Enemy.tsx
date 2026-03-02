import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { WALLS, FURNITURE } from '../../data/level';

export function Enemy() {
  const enemyRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const setGameState = useGameStore((state) => state.setGameState);
  const gameState = useGameStore((state) => state.gameState);
  
  // Load sprite texture
  const texture = useTexture('https://i.ibb.co/hRSfLyq9/2026-03-01-0tk-Kleki.png');
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  
  // Simple patrol points
  const patrolPoints = [
    new THREE.Vector3(0, 1, 20), // Hallway end
    new THREE.Vector3(-10, 1, 25), // Kitchen
    new THREE.Vector3(5, 1, 25), // Living room
    new THREE.Vector3(0, 1, 10), // Hallway start
  ];
  
  const [targetIndex, setTargetIndex] = useState(0);
  const speed = 2.5; // Meters per second
  const ENEMY_RADIUS = 0.5;

  // Reset enemy when game starts
  useState(() => {
    useGameStore.subscribe((state, prevState) => {
        if (state.gameState === 'menu' && prevState.gameState !== 'menu' && enemyRef.current) {
            enemyRef.current.position.set(0, 1, 20);
            setTargetIndex(0);
        }
    });
  });

  const checkCollision = (newPos: THREE.Vector3) => {
    // Check Walls
    for (const wall of WALLS) {
      const wallPos = new THREE.Vector3(...wall.position);
      const wallSize = new THREE.Vector3(...wall.size);
      const rotation = wall.rotation ? wall.rotation[1] : 0;
      
      let width = wallSize.x;
      let depth = wallSize.z;

      if (Math.abs(rotation - Math.PI / 2) < 0.1) {
        width = wallSize.z;
        depth = wallSize.x;
      }

      // Y Check (Height)
      const minY = wallPos.y - wallSize.y / 2;
      const maxY = wallPos.y + wallSize.y / 2;
      if (maxY < 0.5 || minY > 1.8) continue;

      // AABB Check
      const minX = wallPos.x - width / 2 - ENEMY_RADIUS;
      const maxX = wallPos.x + width / 2 + ENEMY_RADIUS;
      const minZ = wallPos.z - depth / 2 - ENEMY_RADIUS;
      const maxZ = wallPos.z + depth / 2 + ENEMY_RADIUS;

      if (newPos.x > minX && newPos.x < maxX && newPos.z > minZ && newPos.z < maxZ) {
        return true;
      }
    }

    // Check Furniture
    for (const item of FURNITURE) {
      const pos = new THREE.Vector3(...item.position);
      const size = new THREE.Vector3(...item.size);
      
      // Y Check
      const minY = pos.y - size.y / 2;
      const maxY = pos.y + size.y / 2;
      if (maxY < 0.5 || minY > 1.8) continue;

      const minX = pos.x - size.x / 2 - ENEMY_RADIUS;
      const maxX = pos.x + size.x / 2 + ENEMY_RADIUS;
      const minZ = pos.z - size.z / 2 - ENEMY_RADIUS;
      const maxZ = pos.z + size.z / 2 + ENEMY_RADIUS;

      if (newPos.x > minX && newPos.x < maxX && newPos.z > minZ && newPos.z < maxZ) {
        return true;
      }
    }

    return false;
  };

  useFrame((state, delta) => {
    if (!enemyRef.current || gameState !== 'playing') return;

    const enemyPos = enemyRef.current.position;
    
    // Check if player is seen or out of bedroom
    // Bedroom is roughly z < 0. If player z > 0, they are out.
    const playerOut = camera.position.z > 0;
    
    const toPlayer = new THREE.Vector3().subVectors(camera.position, enemyPos);
    const distance = toPlayer.length();
    
    let moveDir = new THREE.Vector3();
    let moveSpeed = speed;

    if (playerOut || distance < 5) {
      // Chase player!
      moveDir = toPlayer.normalize();
      moveSpeed = speed * 1.8;
      
      // Face player
      enemyRef.current.lookAt(camera.position.x, 1, camera.position.z);
      
      if (distance < 1.5) {
        setGameState('caught');
      }
    } else {
        // Patrol logic
        const target = patrolPoints[targetIndex];
        moveDir = new THREE.Vector3().subVectors(target, enemyPos).normalize();

        if (enemyPos.distanceTo(target) < 0.5) {
            setTargetIndex((prev) => (prev + 1) % patrolPoints.length);
        }
    }

    // Apply movement with collision detection
    const moveVec = moveDir.multiplyScalar(moveSpeed * delta);
    
    // Try X movement
    const nextX = enemyPos.clone().add(new THREE.Vector3(moveVec.x, 0, 0));
    if (!checkCollision(nextX)) {
        enemyPos.x += moveVec.x;
    }

    // Try Z movement
    const nextZ = enemyPos.clone().add(new THREE.Vector3(0, 0, moveVec.z));
    if (!checkCollision(nextZ)) {
        enemyPos.z += moveVec.z;
    }
  });

  return (
    <group ref={enemyRef} position={[0, 1, 20]}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <mesh>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
      {/* Floating Name */}
      <Text position={[0, 1.2, 0]} fontSize={0.3} color="red">
        EVIL PARENT
      </Text>
    </group>
  );
}
