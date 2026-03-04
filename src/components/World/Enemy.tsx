import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { WALLS, FURNITURE } from '../../data/level';

interface EnemyProps {
  initialPosition?: [number, number, number];
  patrolPoints?: THREE.Vector3[];
  speed?: number;
  runSpeed?: number;
  scale?: number;
  textureUrl?: string;
  name?: string;
  viewDistance?: number;
  fov?: number; // 0 to 1 (1 is 360, 0.5 is 180, etc - roughly)
  catchDistance?: number;
}

export function Enemy({
  initialPosition = [0, 1, 20],
  patrolPoints = [
    new THREE.Vector3(0, 1, 20),
    new THREE.Vector3(-10, 1, 25),
    new THREE.Vector3(5, 1, 25),
    new THREE.Vector3(0, 1, 10),
    new THREE.Vector3(20, 1, 20),
    new THREE.Vector3(30, 1, 25),
    new THREE.Vector3(-20, 1, 17.5),
    new THREE.Vector3(-30, 1, 10),
    new THREE.Vector3(45, 1, 15),
    new THREE.Vector3(0, 1, 40),
  ],
  speed = 3.5,
  runSpeed = 6.0,
  scale = 1,
  textureUrl = 'https://i.ibb.co/hRSfLyq9/2026-03-01-0tk-Kleki.png',
  name = 'EVIL PARENT',
  viewDistance = 25,
  fov = 0.5,
  catchDistance = 1.5
}: EnemyProps) {
  const enemyRef = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();
  const setGameState = useGameStore((state) => state.setGameState);
  const gameState = useGameStore((state) => state.gameState);
  const isHiding = useGameStore((state) => state.isHiding);
  const radioOn = useGameStore((state) => state.radioOn);
  const tvOn = useGameStore((state) => state.tvOn);
  
  // Load sprite texture
  const texture = useTexture(textureUrl);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  
  // AI State
  const [aiState, setAiState] = useState<EnemyState>('patrol');
  const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(null);
  const [lastKnownPos, setLastKnownPos] = useState<THREE.Vector3 | null>(null);
  const [searchTimer, setSearchTimer] = useState(0);

  const [patrolIndex, setPatrolIndex] = useState(0);
  const [recentPatrolIndices, setRecentPatrolIndices] = useState<number[]>([]);
  const ENEMY_RADIUS = 0.6 * scale;

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

      if (availableIndices.length === 0) return 0; // Fallback

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
            enemyRef.current.position.set(...initialPosition);
            setAiState('patrol');
            setPatrolIndex(0);
            setRecentPatrolIndices([]);
        }
    });
    return unsub;
  }, [initialPosition]);

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
      
      // Adjust collision height check based on enemy scale/position
      // Enemy center is at Y, height is roughly 2*scale
      const enemyBottom = newPos.y - 1 * scale;
      const enemyTop = newPos.y + 1 * scale;

      if (maxY < enemyBottom || minY > enemyTop) continue;

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
      
      const enemyBottom = newPos.y - 1 * scale;
      const enemyTop = newPos.y + 1 * scale;
      
      if (maxY < enemyBottom || minY > enemyTop) continue;

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

      if (dist > viewDistance) return false;

      // FOV Check
      const enemyDir = new THREE.Vector3();
      enemyRef.current?.getWorldDirection(enemyDir);
      const angle = enemyDir.angleTo(toPlayer);
      
      // fov prop: 1 = 360 (PI), 0.5 = 180 (PI/2), 0.25 = 90 (PI/4)
      // Actually let's map it: fov is the dot product threshold or angle threshold?
      // Let's treat fov as "percentage of 360 vision". 
      // 1.0 = 360 deg. 0.5 = 180 deg (front). 0.25 = 90 deg.
      // Angle is 0 to PI. 
      // If fov is 1, we see everything.
      // If fov is 0.5, we see if angle < PI/2.
      const maxAngle = fov * Math.PI;
      if (angle > maxAngle) return false;

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

  // Stuck check
  const lastPos = useRef(new THREE.Vector3());
  const stuckTimer = useRef(0);

  useFrame((state, delta) => {
    if (!enemyRef.current || gameState !== 'playing') return;

    const enemyPos = enemyRef.current.position.clone();
    
    // Check if stuck (only if moving)
    if (aiState === 'patrol' || aiState === 'chase' || aiState === 'search' || aiState === 'investigate') {
        if (enemyPos.distanceTo(lastPos.current) < 0.01 * delta * 60) { // Very small movement
            stuckTimer.current += delta;
            if (stuckTimer.current > 1.0) {
                // Stuck for 1 second
                // Force pick new point or jump slightly
                stuckTimer.current = 0;
                if (aiState === 'patrol') {
                     const nextIdx = getNextPatrolIndex(patrolIndex, enemyPos);
                     setPatrolIndex(nextIdx);
                     // Teleport slightly towards center to unstuck?
                     // enemyRef.current.position.y += 0.1;
                }
            }
        } else {
            stuckTimer.current = 0;
        }
        lastPos.current.copy(enemyPos);
    }

    const playerPos = camera.position.clone();
    const distToPlayer = enemyPos.distanceTo(playerPos);

    // --- ALWAYS CHECK CATCH ---
    if (distToPlayer < catchDistance && !isHiding) { 
        setGameState('caught');
        return;
    }

    // --- State Transitions ---

    // 1. Check Hearing (Radio/TV) - Only main enemy hears? Or both?
    // Let's assume only the main enemy (Evil Parent) cares about noise for now, or both.
    // If name is "Kid", maybe they don't care about radio?
    // Let's keep it general: everyone investigates noise if close enough?
    // For now, global radio/tv check.
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
        enemyRef.current.lookAt(playerPos.x, enemyPos.y, playerPos.z);
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
    <group ref={enemyRef} position={initialPosition}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <mesh>
          <planeGeometry args={[2 * scale, 2 * scale]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} color={aiState === 'chase' ? '#ffaaaa' : 'white'} />
        </mesh>
      </Billboard>
      {/* Floating Name/Status */}
      <Text position={[0, 1.2 * scale, 0]} fontSize={0.3 * scale} color={aiState === 'chase' ? 'red' : aiState === 'search' ? 'orange' : 'white'}>
        {aiState === 'chase' ? '!!!' : aiState === 'search' ? '???' : aiState === 'investigate' ? '?!' : name}
      </Text>
      {/* Flashlight/Vision Cone visualization (optional) */}
      {aiState === 'chase' && <pointLight color="red" distance={5 * scale} intensity={2} />}
    </group>
  );
}
