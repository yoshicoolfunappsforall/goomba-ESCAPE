import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { WALLS, FURNITURE } from '../../data/level';

type EnemyState = 'patrol' | 'chase' | 'search' | 'investigate';

export function Enemy() {
  const enemyRef = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();
  const setGameState = useGameStore((state) => state.setGameState);
  const gameState = useGameStore((state) => state.gameState);
  const isHiding = useGameStore((state) => state.isHiding);
  const radioOn = useGameStore((state) => state.radioOn);
  const tvOn = useGameStore((state) => state.tvOn);
  
  // Load sprite texture
  const texture = useTexture('https://i.ibb.co/hRSfLyq9/2026-03-01-0tk-Kleki.png');
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  
  // AI State
  const [aiState, setAiState] = useState<EnemyState>('patrol');
  const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(null);
  const [lastKnownPos, setLastKnownPos] = useState<THREE.Vector3 | null>(null);
  const [searchTimer, setSearchTimer] = useState(0);

  // Patrol points
  const patrolPoints = [
    new THREE.Vector3(0, 1, 20), // Hallway end
    new THREE.Vector3(-10, 1, 25), // Kitchen
    new THREE.Vector3(5, 1, 25), // Living room
    new THREE.Vector3(0, 1, 10), // Hallway start
    new THREE.Vector3(20, 1, 20), // Kitchen/Radio area
    new THREE.Vector3(30, 1, 25), // Storage area
    new THREE.Vector3(-30, 1, 10), // Master Bedroom
    new THREE.Vector3(45, 1, 15), // Garage
    new THREE.Vector3(0, 1, 40), // Outside Front
  ];
  
  const [patrolIndex, setPatrolIndex] = useState(0);
  const [recentPatrolIndices, setRecentPatrolIndices] = useState<number[]>([]);
  const speed = 3.5; // Faster
  const runSpeed = 6.0; // Much faster
  const ENEMY_RADIUS = 0.6;
  const VIEW_DISTANCE = 25; // Further vision
  const FOV = 0.5; // Wider FOV (0.7 is narrow, 0 is 180 deg, 0.5 is 120 deg)

  // Raycaster for vision
  const raycaster = useRef(new THREE.Raycaster());
  const switchingPatrol = useRef(false);

  // Reset switching flag when index changes
  useEffect(() => {
      switchingPatrol.current = false;
  }, [patrolIndex]);

  // Helper to get next patrol point
  const getNextPatrolIndex = (currentIndex: number, avoidNearPos?: THREE.Vector3) => {
      let availableIndices = patrolPoints.map((_, i) => i).filter(i => i !== currentIndex);
      
      // Avoid recently visited
      availableIndices = availableIndices.filter(i => !recentPatrolIndices.includes(i));
      
      // If we ran out of points (history too long), just avoid current
      if (availableIndices.length === 0) {
          availableIndices = patrolPoints.map((_, i) => i).filter(i => i !== currentIndex);
      }

      // If we need to avoid a specific position (e.g. after searching), filter by distance
      if (avoidNearPos) {
          const farIndices = availableIndices.filter(i => patrolPoints[i].distanceTo(avoidNearPos) > 15);
          if (farIndices.length > 0) {
              availableIndices = farIndices;
          }
      }

      const nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      
      // Update history
      setRecentPatrolIndices(prev => {
          const newHistory = [...prev, nextIndex];
          if (newHistory.length > 4) newHistory.shift(); // Keep last 4
          return newHistory;
      });

      return nextIndex;
  };

  // Reset enemy when game starts
  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prevState) => {
        if (state.gameState === 'menu' && prevState.gameState !== 'menu' && enemyRef.current) {
            enemyRef.current.position.set(0, 1, 20);
            setAiState('patrol');
            setPatrolIndex(0);
            setRecentPatrolIndices([]);
        }
    });
    return unsub;
  }, []);

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

  const canSeePlayer = (enemyPos: THREE.Vector3, playerPos: THREE.Vector3) => {
      if (isHiding) return false; 

      const toPlayer = new THREE.Vector3().subVectors(playerPos, enemyPos);
      const dist = toPlayer.length();

      if (dist > VIEW_DISTANCE) return false;

      // Raycast check for walls/obstacles
      raycaster.current.set(enemyPos, toPlayer.clone().normalize());
      raycaster.current.far = dist;
      
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      
      for (const hit of intersects) {
          // Ignore enemy itself (billboard or mesh)
          let isEnemy = false;
          let obj: THREE.Object3D | null = hit.object;
          while (obj) {
              if (obj === enemyRef.current) {
                  isEnemy = true;
                  break;
              }
              obj = obj.parent;
          }
          if (isEnemy) continue;

          // If hit distance is less than dist to player (minus small buffer), it's an obstacle
          if (hit.distance < dist - 0.5) {
              return false;
          }
      }

      return true;
  };

  useFrame((state, delta) => {
    if (!enemyRef.current || gameState !== 'playing') return;

    const enemyPos = enemyRef.current.position.clone();
    const playerPos = camera.position.clone();
    const distToPlayer = enemyPos.distanceTo(playerPos);

    // --- ALWAYS CHECK CATCH ---
    if (distToPlayer < 1.5 && !isHiding) { // Increased catch radius
        setGameState('caught');
        return;
    }

    // --- State Transitions ---

    // 1. Check Hearing (Radio/TV)
    // Only if not already chasing
    if (aiState !== 'chase') {
        if (radioOn) {
            setAiState('investigate');
            setTargetPos(new THREE.Vector3(20, 1, 20)); // Radio pos
            setSearchTimer(5.0);
        } else if (tvOn) {
            setAiState('investigate');
            setTargetPos(new THREE.Vector3(-24, 1, 25)); // TV pos
            setSearchTimer(5.0);
        }
    }

    // 2. Check Vision
    const seesPlayer = canSeePlayer(enemyPos, playerPos);
    
    if (seesPlayer) {
        setAiState('chase');
        setLastKnownPos(playerPos.clone());
        setTargetPos(playerPos.clone()); // Target is player
    } else if (aiState === 'chase') {
        // Lost sight
        setAiState('search');
        setSearchTimer(5.0); // Search for 5 seconds
        // Target remains last known pos
    }

    // --- State Behavior ---

    let moveTarget: THREE.Vector3 | null = null;
    let currentSpeed = speed;

    if (aiState === 'chase') {
        moveTarget = playerPos;
        currentSpeed = runSpeed;
        // Face player
        enemyRef.current.lookAt(playerPos.x, 1, playerPos.z);
    } else if (aiState === 'search') {
        moveTarget = targetPos || lastKnownPos;
        currentSpeed = speed * 1.5;
        
        // Timer logic
        setSearchTimer((prev) => prev - delta);
        if (searchTimer <= 0) {
            setAiState('patrol');
            // Force move away from search area
            const nextIdx = getNextPatrolIndex(patrolIndex, enemyPos);
            setPatrolIndex(nextIdx);
        }
    } else if (aiState === 'investigate') {
        moveTarget = targetPos;
        currentSpeed = speed;
        
        if (moveTarget && enemyPos.distanceTo(moveTarget) < 2.0) {
             // Reached noise source
             // Turn off if close
             if (radioOn) useGameStore.getState().setRadioOn(false);
             if (tvOn) useGameStore.getState().setTvOn(false);
             
             setSearchTimer((prev) => prev - delta);
             if (searchTimer <= 0) {
                 setAiState('patrol');
                 // Force move away from noise source
                 const nextIdx = getNextPatrolIndex(patrolIndex, enemyPos);
                 setPatrolIndex(nextIdx);
             }
        }
    } else {
        // Patrol
        // Ensure patrol index is valid
        if (patrolIndex >= patrolPoints.length) setPatrolIndex(0);
        moveTarget = patrolPoints[patrolIndex];
        currentSpeed = speed;

        if (enemyPos.distanceTo(moveTarget) < 1.0 && !switchingPatrol.current) {
            switchingPatrol.current = true;
            const nextIdx = getNextPatrolIndex(patrolIndex);
            setPatrolIndex(nextIdx);
        }
    }

    // --- Movement ---
    if (moveTarget) {
        const moveDir = new THREE.Vector3().subVectors(moveTarget, enemyPos).normalize();
        
        // Smooth rotation
        if (aiState !== 'chase') {
            const targetRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), moveDir);
            enemyRef.current.quaternion.slerp(targetRotation, 5 * delta);
        }

        const moveVec = moveDir.multiplyScalar(currentSpeed * delta);
        
        // Try X movement
        const nextX = enemyPos.clone().add(new THREE.Vector3(moveVec.x, 0, 0));
        if (!checkCollision(nextX)) {
            enemyRef.current.position.x += moveVec.x;
        } else {
            // Slide along wall? Or just stop X
        }

        // Try Z movement
        const nextZ = enemyRef.current.position.clone().add(new THREE.Vector3(0, 0, moveVec.z));
        if (!checkCollision(nextZ)) {
            enemyRef.current.position.z += moveVec.z;
        }
    }
  });

  return (
    <group ref={enemyRef} position={[0, 1, 20]}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <mesh>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} color={aiState === 'chase' ? '#ffaaaa' : 'white'} />
        </mesh>
      </Billboard>
      {/* Floating Name/Status */}
      <Text position={[0, 1.2, 0]} fontSize={0.3} color={aiState === 'chase' ? 'red' : aiState === 'search' ? 'orange' : 'white'}>
        {aiState === 'chase' ? '!!!' : aiState === 'search' ? '???' : aiState === 'investigate' ? '?!' : 'EVIL PARENT'}
      </Text>
      {/* Flashlight/Vision Cone visualization (optional) */}
      {aiState === 'chase' && <pointLight color="red" distance={5} intensity={2} />}
    </group>
  );
}
