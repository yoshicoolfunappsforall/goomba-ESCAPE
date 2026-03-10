import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { WALLS, FURNITURE, WALLS_2ND_FLOOR_FINAL, FURNITURE_2ND_FLOOR } from '../../data/level';

const PRECOMPUTED_COLLIDERS = (() => {
    const colliders: { minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number, isWall: boolean }[] = [];
    
    // Walls
    const allWalls = [...WALLS, ...WALLS_2ND_FLOOR_FINAL];
    for (const wall of allWalls) {
      const wallPos = new THREE.Vector3(...wall.position);
      const wallSize = new THREE.Vector3(...wall.size);
      const rotation = wall.rotation ? wall.rotation[1] : 0;
      
      let width = wallSize.x;
      let depth = wallSize.z;

      if (Math.abs(rotation - Math.PI / 2) < 0.1) {
        width = wallSize.z;
        depth = wallSize.x;
      }

      const minY = wallPos.y - wallSize.y / 2;
      const maxY = wallPos.y + wallSize.y / 2;
      const minX = wallPos.x - width / 2;
      const maxX = wallPos.x + width / 2;
      const minZ = wallPos.z - depth / 2;
      const maxZ = wallPos.z + depth / 2;

      colliders.push({ minX, maxX, minY, maxY, minZ, maxZ, isWall: true });
    }

    // Furniture
    const allFurniture = [...FURNITURE, ...FURNITURE_2ND_FLOOR];
    for (const item of allFurniture) {
      if (['Rug', 'LivingRug', 'Path', 'UnderBed', 'UnderMasterBed', 'Poster', 'CeilingLight', 'Plant', 'Lamp', 'Book', 'ToiletPaper', 'PlayRug', 'TeleportPad2'].includes(item.name)) continue;

      const pos = new THREE.Vector3(...item.position);
      const size = new THREE.Vector3(...item.size);
      
      const minY = pos.y - size.y / 2;
      const maxY = pos.y + size.y / 2;
      const minX = pos.x - size.x / 2;
      const maxX = pos.x + size.x / 2;
      const minZ = pos.z - size.z / 2;
      const maxZ = pos.z + size.z / 2;

      colliders.push({ minX, maxX, minY, maxY, minZ, maxZ, isWall: false });
    }
    
    return colliders;
})();

const PRECOMPUTED_BOXES = PRECOMPUTED_COLLIDERS.map(c => new THREE.Box3(
    new THREE.Vector3(c.minX, c.minY, c.minZ),
    new THREE.Vector3(c.maxX, c.maxY, c.maxZ)
));

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
    new THREE.Vector3(0, 1, 20), // Hallway Center
    new THREE.Vector3(-10, 1, 25), // Living Room Left
    new THREE.Vector3(5, 1, 25), // Living Room Right
    new THREE.Vector3(0, 1, 10), // Hallway Start
    new THREE.Vector3(20, 1, 20), // Kitchen
    new THREE.Vector3(20, 1, 10), // Dining Room (Door at 20, 15)
    new THREE.Vector3(-20, 1, 10), // Study (Door at -20, 15)
    new THREE.Vector3(-30, 1, 10), // Master Bedroom (Door at -25.5, 17.5)
    new THREE.Vector3(10, 1, 10), // Guest Room (Door at 5, 9.5)
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
  const { setGameState, gameState, isHiding, radioOn, tvOn, difficulty } = useGameStore(useShallow(state => ({
    setGameState: state.setGameState,
    gameState: state.gameState,
    isHiding: state.isHiding,
    radioOn: state.radioOn,
    tvOn: state.tvOn,
    difficulty: state.difficulty
  })));

  // Difficulty Multipliers
  const difficultyMultipliers = {
      easy: { speed: 0.6, view: 0.6, fov: 0.6 },
      medium: { speed: 1.0, view: 1.0, fov: 1.0 },
      hard: { speed: 1.4, view: 1.5, fov: 1.5 }
  };
  
  const mult = difficultyMultipliers[difficulty];
  const effectiveSpeed = speed * mult.speed;
  const effectiveRunSpeed = runSpeed * mult.speed;
  const effectiveViewDistance = viewDistance * mult.view;
  const effectiveFov = fov * mult.fov;
  
  // Load sprite texture
  const texture = useTexture(textureUrl);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  
  type EnemyState = 'patrol' | 'chase' | 'search' | 'investigate';

  // AI State
  const [aiState, setAiState] = useState<EnemyState>('patrol');
  const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(null);
  const [lastKnownPos, setLastKnownPos] = useState<THREE.Vector3 | null>(null);
  const [searchTimer, setSearchTimer] = useState(0);

  const [patrolIndex, setPatrolIndex] = useState(0);
  const [recentPatrolIndices, setRecentPatrolIndices] = useState<number[]>([]);
  const ENEMY_RADIUS = 0.6 * scale;

  // Additional Outside Patrol Points (Indices 9, 10, 11)
  const outsidePatrolPoints = [
      new THREE.Vector3(0, 1, 40), // Path
      new THREE.Vector3(-20, 1, 45), // Near Dog House
      new THREE.Vector3(30, 1, 40), // Near Shed
  ];

  // Raycaster for vision
  const raycaster = useRef(new THREE.Raycaster());
  const switchingPatrol = useRef(false);

  // Reset switching flag when index changes
  useEffect(() => {
      switchingPatrol.current = false;
  }, [patrolIndex]);

  // Helper to get next patrol point
  const getNextPatrolIndex = (currentIndex: number, avoidNearPos?: THREE.Vector3) => {
      const inventory = useGameStore.getState().inventory;
      const studyUnlocked = inventory.includes('Study Key');
      const storageUnlocked = inventory.includes('Storage Key');
      
      if (name !== 'EVIL PARENT') {
          let availableIndices = patrolPoints.map((_, i) => i).filter(i => i !== currentIndex);
          availableIndices = availableIndices.filter(i => !recentPatrolIndices.includes(i));
          if (availableIndices.length === 0) {
              availableIndices = patrolPoints.map((_, i) => i).filter(i => i !== currentIndex);
          }
          if (avoidNearPos) {
              const farIndices = availableIndices.filter(i => patrolPoints[i].distanceTo(avoidNearPos) > 15);
              if (farIndices.length > 0) availableIndices = farIndices;
          }
          if (availableIndices.length === 0) return 0;
          const nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          setRecentPatrolIndices(prev => {
              const newHistory = [...prev, nextIndex];
              if (newHistory.length > Math.floor(patrolPoints.length / 2)) newHistory.shift();
              return newHistory;
          });
          return nextIndex;
      }

      const playerZ = camera.position.z;
      const isPlayerOutside = playerZ > 32;
      
      const allPoints = [...patrolPoints, ...outsidePatrolPoints];
      
      let availableIndices = allPoints.map((_, i) => i).filter(i => i !== currentIndex);
      
      // Filter Locked Rooms
      // Study is index 6 (Door at -20, 15)
      if (!studyUnlocked) {
          availableIndices = availableIndices.filter(i => i !== 6);
      }
      
      // Filter based on Zone
      if (isPlayerOutside) {
          availableIndices = availableIndices.filter(i => i >= 9 || i === 0); 
      } else {
          if (currentIndex >= 9) return 0;
          availableIndices = availableIndices.filter(i => i < 9);
      }

      // Avoid recently visited
      availableIndices = availableIndices.filter(i => !recentPatrolIndices.includes(i));
      
      // If we ran out of points (history too long), just avoid current
      if (availableIndices.length === 0) {
           if (isPlayerOutside) {
              availableIndices = allPoints.map((_, i) => i).filter(i => (i >= 9 || i === 0) && i !== currentIndex);
           } else {
              availableIndices = allPoints.map((_, i) => i).filter(i => i < 9 && i !== currentIndex);
           }
           
           if (!studyUnlocked) {
               availableIndices = availableIndices.filter(i => i !== 6);
           }
      }

      if (avoidNearPos) {
          const farIndices = availableIndices.filter(i => allPoints[i].distanceTo(avoidNearPos) > 15);
          if (farIndices.length > 0) {
              availableIndices = farIndices;
          }
      }

      if (availableIndices.length === 0) return 0; // Fallback

      const nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      
      setRecentPatrolIndices(prev => {
          const newHistory = [...prev, nextIndex];
          if (newHistory.length > 4) newHistory.shift(); // Keep last 4
          return newHistory;
      });

      return nextIndex;
  };

  // Door Opening Logic
  const checkDoors = (pos: THREE.Vector3) => {
      const state = useGameStore.getState();
      const doors = [
          { pos: new THREE.Vector3(1, 2, 5), open: state.bedroomDoorOpen, set: state.setBedroomDoorOpen, locked: false },
          { pos: new THREE.Vector3(-5, 2, 10), open: state.bathroomDoorOpen, set: state.setBathroomDoorOpen, locked: false },
          { pos: new THREE.Vector3(-25.5, 2, 17.5), open: state.masterBedroomDoorOpen, set: state.setMasterBedroomDoorOpen, locked: false },
          { pos: new THREE.Vector3(5, 2, 9.5), open: state.guestDoorOpen, set: state.setGuestDoorOpen, locked: false },
          { pos: new THREE.Vector3(20, 2, 15), open: state.diningDoorOpen, set: state.setDiningDoorOpen, locked: false },
          { pos: new THREE.Vector3(-20, 2, 15), open: state.studyDoorOpen, set: state.setStudyDoorOpen, locked: !state.inventory.includes('Study Key') },
          { pos: new THREE.Vector3(25, 2, 25), open: state.storageOpen, set: state.setStorageOpen, locked: !state.inventory.includes('Storage Key') },
      ];

      for (const door of doors) {
          if (!door.open && pos.distanceTo(door.pos) < 2.5) {
              if (!door.locked) {
                  door.set(true); // Enemy opens door
              }
          }
      }
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
    const enemyBottom = newPos.y - 0.9 * scale; 
    const enemyTop = newPos.y + 0.9 * scale;

    for (let i = 0; i < PRECOMPUTED_COLLIDERS.length; i++) {
        const c = PRECOMPUTED_COLLIDERS[i];
        if (c.maxY < enemyBottom || c.minY > enemyTop) continue;

        if (newPos.x > c.minX - ENEMY_RADIUS && newPos.x < c.maxX + ENEMY_RADIUS && 
            newPos.z > c.minZ - ENEMY_RADIUS && newPos.z < c.maxZ + ENEMY_RADIUS) {
            return true;
        }
    }
    return false;
  };

  const canSeePlayer = (enemyPos: THREE.Vector3, playerPos: THREE.Vector3, ignoreHiding = false) => {
      if (isHiding && !ignoreHiding) return false; 

      const toPlayer = new THREE.Vector3().subVectors(playerPos, enemyPos);
      const dist = toPlayer.length();

      if (dist > effectiveViewDistance) return false;

      // FOV Check
      const enemyDir = new THREE.Vector3();
      enemyRef.current?.getWorldDirection(enemyDir);
      const angle = enemyDir.angleTo(toPlayer);
      
      const maxAngle = effectiveFov * Math.PI;
      if (angle > maxAngle) return false;

      // Raycast check for walls/obstacles using precomputed AABBs
      const ray = new THREE.Ray(enemyPos, toPlayer.clone().normalize());
      const target = new THREE.Vector3();
      
      for (let i = 0; i < PRECOMPUTED_BOXES.length; i++) {
          if (ray.intersectBox(PRECOMPUTED_BOXES[i], target)) {
              const hitDist = enemyPos.distanceTo(target);
              if (hitDist < dist - 0.5) {
                  return false;
              }
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
        checkDoors(enemyPos); // Check for doors to open

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
    if (distToPlayer < catchDistance) {
        if (!isHiding) {
            setGameState('jumpscare');
            return;
        } else {
            // Check if player is hiding but enemy is close and can see them (ignoring hiding flag)
            // If enemy is VERY close (e.g. < 2.5) and has line of sight, jumpscare!
            if (distToPlayer < 2.5 && canSeePlayer(enemyPos, playerPos, true)) {
                 setGameState('jumpscare');
                 return;
            }
        }
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
        
        // Anti-Sniping Logic:
        // If player is hiding and we are far away, we shouldn't know exactly where they hid.
        if (isHiding && lastKnownPos) {
            const distToHidingSpot = enemyPos.distanceTo(lastKnownPos);
            // If more than 8 units away (approx 1 room length), lose the trail
            if (distToHidingSpot > 8.0) {
                // Search at current location instead of running to the hiding spot
                setLastKnownPos(enemyPos.clone());
                setSearchTimer(3.0); // Shorter search since we're confused
            } else {
                // We saw them hide nearby, investigate the spot
                setSearchTimer(5.0);
            }
        } else {
            setSearchTimer(5.0); // Standard search
        }
        
        setAiState('search');
        // Target remains last known pos (which we might have just modified)
    }

    // --- State Behavior ---

    let moveTarget: THREE.Vector3 | null = null;
    let currentSpeed = effectiveSpeed;

    if (aiState === 'chase') {
        moveTarget = playerPos;
        currentSpeed = effectiveRunSpeed;
        // Face player
        enemyRef.current.lookAt(playerPos.x, enemyPos.y, playerPos.z);
    } else if (aiState === 'search') {
        moveTarget = targetPos || lastKnownPos;
        currentSpeed = effectiveSpeed * 1.5;
        
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
        currentSpeed = effectiveSpeed;
        
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
        // Combine points again for lookup
        const allPoints = name === 'EVIL PARENT' ? [...patrolPoints, ...outsidePatrolPoints] : patrolPoints;
        
        if (patrolIndex >= allPoints.length) setPatrolIndex(0);
        moveTarget = allPoints[patrolIndex];
        currentSpeed = effectiveSpeed;

        if (enemyPos.distanceTo(moveTarget) < 1.0 && !switchingPatrol.current) {
            switchingPatrol.current = true;
            const nextIdx = getNextPatrolIndex(patrolIndex);
            setPatrolIndex(nextIdx);
        }
    }

    // --- Movement ---
    if (moveTarget) {
        // 1. Calculate base direction to target
        let moveDir = new THREE.Vector3().subVectors(moveTarget, enemyPos).normalize();
        
        // 2. Obstacle Avoidance (Whiskers)
        // Only apply if moving (not stuck)
        if (currentSpeed > 0) {
            const lookDir = new THREE.Vector3();
            enemyRef.current.getWorldDirection(lookDir);
            
            // Raycast settings
            const whiskerLength = 2.0 * scale; // Increased length for earlier detection
            const avoidanceForce = new THREE.Vector3();
            let obstacleDetected = false;
            let allBlocked = false;

            // Front Ray
            raycaster.current.set(enemyPos, lookDir);
            raycaster.current.far = whiskerLength;
            const frontHits = raycaster.current.intersectObjects(scene.children, true);
            
            // Left Ray (45 degrees) - Wider angle
            const leftDir = lookDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
            raycaster.current.set(enemyPos, leftDir);
            const leftHits = raycaster.current.intersectObjects(scene.children, true);

            // Right Ray (-45 degrees) - Wider angle
            const rightDir = lookDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
            raycaster.current.set(enemyPos, rightDir);
            const rightHits = raycaster.current.intersectObjects(scene.children, true);

            // Filter out enemy itself from hits (helper function)
            const isValidHit = (hits: THREE.Intersection[]) => {
                for (const hit of hits) {
                    let obj: THREE.Object3D | null = hit.object;
                    let isEnemy = false;
                    while (obj) {
                        if (obj === enemyRef.current) { isEnemy = true; break; }
                        obj = obj.parent;
                    }
                    if (!isEnemy && hit.distance < whiskerLength) return true;
                }
                return false;
            };

            const frontBlocked = isValidHit(frontHits);
            const leftBlocked = isValidHit(leftHits);
            const rightBlocked = isValidHit(rightHits);

            if (frontBlocked) {
                obstacleDetected = true;
                // If front blocked, check sides
                if (!leftBlocked && !rightBlocked) {
                    // Both sides clear, pick random or alternate
                    // Default to right for consistency
                    avoidanceForce.add(rightDir.multiplyScalar(3.0));
                } else if (!leftBlocked) {
                    avoidanceForce.add(leftDir.multiplyScalar(3.0)); // Steer Left
                } else if (!rightBlocked) {
                    avoidanceForce.add(rightDir.multiplyScalar(3.0)); // Steer Right
                } else {
                    // All blocked!
                    allBlocked = true;
                }
            } else {
                // Front clear, but check sides for grazing
                if (leftBlocked) {
                    avoidanceForce.add(rightDir.multiplyScalar(1.5)); // Nudge Right strongly
                    obstacleDetected = true;
                }
                if (rightBlocked) {
                    avoidanceForce.add(leftDir.multiplyScalar(1.5)); // Nudge Left strongly
                    obstacleDetected = true;
                }
            }

            if (allBlocked) {
                // Turn around completely
                moveDir.negate();
                // Also force a repath if patrolling
                if (aiState === 'patrol') {
                    const nextIdx = getNextPatrolIndex(patrolIndex, enemyPos);
                    setPatrolIndex(nextIdx);
                }
            } else if (obstacleDetected) {
                // Blend avoidance with target direction
                // If very close to obstacle, avoidance takes priority
                moveDir.add(avoidanceForce).normalize();
            }
        }
        
        // Smooth rotation towards new blended direction
        if (aiState !== 'chase') {
            const targetRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), moveDir);
            enemyRef.current.quaternion.slerp(targetRotation, 8 * delta); // Faster rotation
        } else {
             // In chase, we want to face player, but move around obstacles
             // So we separate "facing" from "moving"
             // Face player
             enemyRef.current.lookAt(playerPos.x, enemyPos.y, playerPos.z);
             // But move along moveDir (which includes avoidance)
        }

        const moveVec = moveDir.multiplyScalar(currentSpeed * delta);
        
        // Try X movement
        const nextX = enemyPos.clone().add(new THREE.Vector3(moveVec.x, 0, 0));
        if (!checkCollision(nextX)) {
            enemyRef.current.position.x += moveVec.x;
        } else {
            // Slide along wall? Or just stop X
            // If stuck on X, maybe push Z slightly to slide?
             enemyRef.current.position.z += (Math.random() - 0.5) * 0.05;
        }

        // Try Z movement
        const nextZ = enemyRef.current.position.clone().add(new THREE.Vector3(0, 0, moveVec.z));
        if (!checkCollision(nextZ)) {
            enemyRef.current.position.z += moveVec.z;
        } else {
             // If stuck on Z, maybe push X slightly to slide?
             enemyRef.current.position.x += (Math.random() - 0.5) * 0.05;
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
