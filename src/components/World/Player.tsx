import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { WALLS, FURNITURE } from '../../data/level';

const SPEED = 6;
const PLAYER_RADIUS = 0.3;
const KEYS = { w: false, a: false, s: false, d: false, e: false };

export function Player() {
  const { camera } = useThree();
  const setGameState = useGameStore((state) => state.setGameState);
  const [velocity] = useState(new THREE.Vector3());
  const [direction] = useState(new THREE.Vector3());

  useEffect(() => {
    // Reset keys on mount
    KEYS.w = false;
    KEYS.a = false;
    KEYS.s = false;
    KEYS.d = false;
    KEYS.e = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (useGameStore.getState().gameState !== 'playing') return;
      switch (e.key.toLowerCase()) {
        case 'w': KEYS.w = true; break;
        case 'a': KEYS.a = true; break;
        case 's': KEYS.s = true; break;
        case 'd': KEYS.d = true; break;
        case 'e': KEYS.e = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': KEYS.w = false; break;
        case 'a': KEYS.a = false; break;
        case 's': KEYS.s = false; break;
        case 'd': KEYS.d = false; break;
        case 'e': KEYS.e = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Helper to check collision with a box
  const checkCollision = (newPos: THREE.Vector3) => {
    // Check Walls
    for (const wall of WALLS) {
      const wallPos = new THREE.Vector3(...wall.position);
      const wallSize = new THREE.Vector3(...wall.size);
      const rotation = wall.rotation ? wall.rotation[1] : 0;

      // Simple AABB check doesn't work well with rotation.
      // For this specific level, rotations are only 0 or 90 degrees (PI/2).
      // We can swap width/depth if rotated.
      
      let width = wallSize.x;
      let depth = wallSize.z;

      if (Math.abs(rotation - Math.PI / 2) < 0.1) {
        width = wallSize.z;
        depth = wallSize.x;
      }

      // Y Check (Height)
      const minY = wallPos.y - wallSize.y / 2;
      const maxY = wallPos.y + wallSize.y / 2;
      // Player is approx 1.8m tall (camera at 1.6)
      if (maxY < 0.5 || minY > 1.8) continue;

      // AABB Check
      const minX = wallPos.x - width / 2 - PLAYER_RADIUS;
      const maxX = wallPos.x + width / 2 + PLAYER_RADIUS;
      const minZ = wallPos.z - depth / 2 - PLAYER_RADIUS;
      const maxZ = wallPos.z + depth / 2 + PLAYER_RADIUS;

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

      const minX = pos.x - size.x / 2 - PLAYER_RADIUS;
      const maxX = pos.x + size.x / 2 + PLAYER_RADIUS;
      const minZ = pos.z - size.z / 2 - PLAYER_RADIUS;
      const maxZ = pos.z + size.z / 2 + PLAYER_RADIUS;

      if (newPos.x > minX && newPos.x < maxX && newPos.z > minZ && newPos.z < maxZ) {
        return true;
      }
    }

    return false;
  };

  useFrame((state, delta) => {
    if (useGameStore.getState().gameState !== 'playing') return;

    // Movement Logic
    direction.z = Number(KEYS.s) - Number(KEYS.w);
    direction.x = Number(KEYS.a) - Number(KEYS.d);
    direction.normalize();

    if (KEYS.w || KEYS.s) velocity.z -= direction.z * 60.0 * delta;
    if (KEYS.a || KEYS.d) velocity.x -= direction.x * 60.0 * delta;

    // Friction
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    // Calculate potential new position
    const moveForward = velocity.z * delta * SPEED;
    const moveRight = velocity.x * delta * SPEED;

    const currentPos = camera.position.clone();
    
    // Try X movement
    camera.translateX(moveRight);
    const newPosX = camera.position.clone();
    // Revert to check Z separately (sliding along walls)
    camera.position.copy(currentPos);
    
    // Convert local movement to world space for collision check
    // Actually, translateX/Z moves relative to camera rotation.
    // We need to calculate the world space delta.
    
    // Easier way: Apply move, check collision, revert if hit.
    
    // 1. Apply X-axis movement (relative to camera view)
    camera.translateX(moveRight);
    // We need to ensure we are only moving in X/Z plane, not flying up/down
    camera.position.y = 1.6; 
    
    if (checkCollision(camera.position)) {
      camera.position.copy(currentPos); // Revert if hit
    }
    
    const posAfterX = camera.position.clone();

    // 2. Apply Z-axis movement
    camera.translateZ(-moveForward);
    camera.position.y = 1.6;

    if (checkCollision(camera.position)) {
      camera.position.copy(posAfterX); // Revert Z but keep X
    }

    // Head Bob
    if (KEYS.w || KEYS.s || KEYS.a || KEYS.d) {
        const time = state.clock.getElapsedTime();
        camera.position.y = 1.6 + Math.sin(time * 10) * 0.05;
    } else {
        camera.position.y = 1.6;
    }

    // Check interaction distance with Laptop
    // Laptop is at [3, 2, -3] (on desk)
    const laptopPos = new THREE.Vector3(3, 2, -3);
    const distToLaptop = camera.position.distanceTo(laptopPos);
    
    // Front Door is at [0, 2, 35]
    const doorPos = new THREE.Vector3(0, 2, 35);
    const distToDoor = camera.position.distanceTo(doorPos);

    // Safe is at [-14, 1, 6]
    const safePos = new THREE.Vector3(-14, 1, 6);
    const distToSafe = camera.position.distanceTo(safePos);

    // Flashlight is at [3, 0.85, -3]
    const flashlightPos = new THREE.Vector3(3, 0.85, -3);
    const distToFlashlight = camera.position.distanceTo(flashlightPos);

    // Vent is at [5, 0.5, 10]
    const ventPos = new THREE.Vector3(5, 0.5, 10);
    const distToVent = camera.position.distanceTo(ventPos);

    // Storage Door is at [25, 2, 25]
    const storageDoorPos = new THREE.Vector3(25, 2, 25);
    const distToStorageDoor = camera.position.distanceTo(storageDoorPos);

    // Screwdriver is at [34, 3.2, 25] (inside toolbox)
    const screwdriverPos = new THREE.Vector3(34, 3.2, 25);
    const distToScrewdriver = camera.position.distanceTo(screwdriverPos);

    // Toolbox is at [34, 3.1, 25]
    const toolboxPos = new THREE.Vector3(34, 3.1, 25);
    const distToToolbox = camera.position.distanceTo(toolboxPos);

    // Radio is at [20, 1.5, 20]
    const radioPos = new THREE.Vector3(20, 1.5, 20);
    const distToRadio = camera.position.distanceTo(radioPos);

    // Under Bed is at [-3, 0.5, -3]
    const underBedPos = new THREE.Vector3(-3, 0.5, -3);
    const distToUnderBed = camera.position.distanceTo(underBedPos);

    // Cabinet is at [20, 0.5, 18]
    const cabinetPos = new THREE.Vector3(20, 0.5, 18);
    const distToCabinet = camera.position.distanceTo(cabinetPos);

    // TV is at [-24, 2, 25]
    const tvPos = new THREE.Vector3(-24, 2, 25);
    const distToTV = camera.position.distanceTo(tvPos);

    // Bedroom Door is at [-1, 2, 5] (pivot) -> Center is roughly [1, 2, 5]
    const bedroomDoorPos = new THREE.Vector3(1, 2, 5);
    const distToBedroomDoor = camera.position.distanceTo(bedroomDoorPos);

    // Bathroom Door is at [-5, 2, 9] (pivot) -> Center is roughly [-5, 2, 10]
    const bathroomDoorPos = new THREE.Vector3(-5, 2, 10);
    const distToBathroomDoor = camera.position.distanceTo(bathroomDoorPos);

    // Master Bedroom Door is at [-25, 2, 10] (pivot) -> Center roughly [-25, 2, 12.5]
    const masterBedroomDoorPos = new THREE.Vector3(-25, 2, 12.5);
    const distToMasterBedroomDoor = camera.position.distanceTo(masterBedroomDoorPos);

    // Front Door (Exit) is at [0, 2, 35]
    const frontDoorPos = new THREE.Vector3(0, 2, 35);
    const distToFrontDoor = camera.position.distanceTo(frontDoorPos);

    // Gate is at [0, 1.5, 50]
    const gatePos = new THREE.Vector3(0, 1.5, 50);
    const distToGate = camera.position.distanceTo(gatePos);

    // Shed is at [30, 1.5, 40]
    const shedPos = new THREE.Vector3(30, 1.5, 40);
    const distToShed = camera.position.distanceTo(shedPos);

    // Under Master Bed is at [-35, 0.2, 10]
    const underMasterBedPos = new THREE.Vector3(-35, 0.2, 10);
    const distToUnderMasterBed = camera.position.distanceTo(underMasterBedPos);

    // Wardrobe is at [-40, 1.5, 5]
    const wardrobePos = new THREE.Vector3(-40, 1.5, 5);
    const distToWardrobe = camera.position.distanceTo(wardrobePos);

    const setInteractionText = useGameStore.getState().setInteractionText;
    const gameState = useGameStore.getState().gameState;
    const doorCodeKnown = useGameStore.getState().doorCodeKnown;
    const safeOpen = useGameStore.getState().safeOpen;
    const ventOpen = useGameStore.getState().ventOpen;
    const storageOpen = useGameStore.getState().storageOpen;
    const bedroomDoorOpen = useGameStore.getState().bedroomDoorOpen;
    const bathroomDoorOpen = useGameStore.getState().bathroomDoorOpen;
    const toolboxOpen = useGameStore.getState().toolboxOpen;
    const toolboxCodeKnown = useGameStore.getState().toolboxCodeKnown;
    const inventory = useGameStore.getState().inventory;
    const addToInventory = useGameStore.getState().addToInventory;
    const isHiding = useGameStore.getState().isHiding;
    const radioOn = useGameStore.getState().radioOn;
    const tvOn = useGameStore.getState().tvOn;
    const gateKey = useGameStore.getState().gateKey;
    const setGateKey = useGameStore.getState().setGateKey;

    if (isHiding) {
        setInteractionText('Press E to Stop Hiding');
        if (KEYS.e) {
            useGameStore.getState().setIsHiding(false);
            // Move player out slightly so they don't get stuck or hide immediately again
            camera.position.y = 1.6;
            KEYS.e = false;
        }
        // Force crouch
        camera.position.y = 0.5;
        return; // Skip other interactions while hiding
    }

    if (distToLaptop < 3) {
      setInteractionText('Press E to use Laptop');
      if (KEYS.e) { 
         setGameState('laptop');
         KEYS.e = false; 
      }
    } else if (distToBedroomDoor < 3) {
        setInteractionText(bedroomDoorOpen ? 'Press E to Close Door' : 'Press E to Open Door');
        if (KEYS.e) {
            useGameStore.getState().setBedroomDoorOpen(!bedroomDoorOpen);
            KEYS.e = false;
        }
    } else if (distToBathroomDoor < 3) {
        setInteractionText(bathroomDoorOpen ? 'Press E to Close Door' : 'Press E to Open Door');
        if (KEYS.e) {
            useGameStore.getState().setBathroomDoorOpen(!bathroomDoorOpen);
            KEYS.e = false;
        }
    } else if (distToMasterBedroomDoor < 3) {
        const isOpen = useGameStore.getState().masterBedroomDoorOpen;
        setInteractionText(isOpen ? 'Press E to Close Door' : 'Press E to Open Door');
        if (KEYS.e) {
            useGameStore.getState().setMasterBedroomDoorOpen(!isOpen);
            KEYS.e = false;
        }
    } else if (distToRadio < 2) {
        setInteractionText(radioOn ? 'Press E to Turn Off Radio' : 'Press E to Turn On Radio');
        if (KEYS.e) {
            useGameStore.getState().setRadioOn(!radioOn);
            useGameStore.getState().setNoiseLevel(radioOn ? 0 : 80); // High noise if on
            KEYS.e = false;
        }
    } else if (distToTV < 3) {
        setInteractionText(tvOn ? 'Press E to Turn Off TV' : 'Press E to Turn On TV');
        if (KEYS.e) {
            useGameStore.getState().setTvOn(!tvOn);
            useGameStore.getState().setNoiseLevel(tvOn ? 0 : 90); // TV is louder
            KEYS.e = false;
        }
    } else if (distToToolbox < 2) {
        if (toolboxOpen) {
             setInteractionText('Toolbox is open. Empty.');
        } else {
             setInteractionText('Press E to Unlock Toolbox');
             if (KEYS.e) {
                 useGameStore.getState().setToolboxKeypadOpen(true);
                 setGameState('laptop'); // Pause game/show cursor
                 KEYS.e = false;
             }
        }
    } else if (distToUnderBed < 2.5) {
        setInteractionText('Press E to Hide Under Bed');
        if (KEYS.e) {
            useGameStore.getState().setIsHiding(true);
            KEYS.e = false;
        }
    } else if (distToUnderMasterBed < 2.5) {
        setInteractionText('Press E to Hide Under Bed');
        if (KEYS.e) {
            useGameStore.getState().setIsHiding(true);
            KEYS.e = false;
        }
    } else if (distToWardrobe < 2.5) {
        setInteractionText('Press E to Hide in Wardrobe');
        if (KEYS.e) {
            useGameStore.getState().setIsHiding(true);
            KEYS.e = false;
        }
    } else if (distToCabinet < 2.5) {
        setInteractionText('Press E to Hide in Cabinet');
        if (KEYS.e) {
            useGameStore.getState().setIsHiding(true);
            KEYS.e = false;
        }
    } else if (distToFrontDoor < 3) {
        if (inventory.includes('House Key')) {
             setInteractionText('Press E to Go Outside');
             if (KEYS.e) {
                 camera.position.set(0, 1.6, 40);
                 KEYS.e = false;
             }
        } else {
             setInteractionText('Door is Locked. Need House Key.');
        }
    } else if (distToGate < 4) {
        if (inventory.includes('Gate Key')) {
             setInteractionText('Press E to Escape!');
             if (KEYS.e) {
                 setGameState('won');
                 KEYS.e = false;
             }
        } else {
             setInteractionText('Gate is Locked. Need Gate Key.');
        }
    } else if (distToShed < 3) {
        if (!inventory.includes('Gate Key')) {
            setInteractionText('Press E to Search Shed');
            if (KEYS.e) {
                addToInventory('Gate Key');
                setInteractionText('Found Gate Key!');
                KEYS.e = false;
            }
        } else {
            setInteractionText('Shed is empty.');
        }
    } else if (distToFlashlight < 2 && !inventory.includes('Flashlight')) {
        setInteractionText('Press E to take Flashlight');
        if (KEYS.e) {
            addToInventory('Flashlight');
            KEYS.e = false;
        }
    } else if (distToScrewdriver < 2 && !inventory.includes('Screwdriver')) {
        if (toolboxOpen) {
            setInteractionText('Press E to take Screwdriver');
            if (KEYS.e) {
                addToInventory('Screwdriver');
                KEYS.e = false;
            }
        }
    } else if (distToToolbox < 3 && !toolboxOpen) {
        if (toolboxCodeKnown) {
             setInteractionText('Press E to unlock Toolbox (Code: 7-2-4)');
             if (KEYS.e) {
                 useGameStore.getState().setToolboxOpen(true);
                 KEYS.e = false;
             }
        } else {
            setInteractionText('Toolbox is locked. Need combination.');
        }
    } else if (distToStorageDoor < 3) {
        if (storageOpen) {
            setInteractionText(null);
        } else {
            if (inventory.includes('Storage Key')) {
                setInteractionText('Press E to unlock Storage Room');
                if (KEYS.e) {
                    useGameStore.getState().setStorageOpen(true);
                    KEYS.e = false;
                }
            } else {
                setInteractionText('Locked. Need Storage Key.');
            }
        }
    } else if (distToVent < 3) {
        if (ventOpen) {
            if (!inventory.includes('House Key')) {
                setInteractionText('Press E to take House Key');
                if (KEYS.e) {
                    addToInventory('House Key');
                    KEYS.e = false;
                }
            }
        } else {
            if (inventory.includes('Screwdriver')) {
                setInteractionText('Press E to unscrew Vent');
                if (KEYS.e) {
                    useGameStore.getState().setVentOpen(true);
                    KEYS.e = false;
                }
            } else {
                setInteractionText('Vent is screwed shut. Need Screwdriver.');
            }
        }
    } else if (distToSafe < 3) {
        if (safeOpen) {
            if (!inventory.includes('Storage Key')) {
                setInteractionText('Press E to take Storage Key');
                if (KEYS.e) {
                    addToInventory('Storage Key');
                    KEYS.e = false;
                }
            } else {
                setInteractionText('Empty Safe');
            }
        } else {
            setInteractionText('Press E to Unlock Safe');
            if (KEYS.e) {
                useGameStore.getState().setSafeKeypadOpen(true);
                setGameState('laptop'); // Re-use 'laptop' state to unlock cursor/pause game
                KEYS.e = false;
            }
        }
    } else if (distToDoor < 4) {
        if (inventory.includes('House Key')) {
             setInteractionText('Press E to Escape!');
             if (KEYS.e) {
                setGameState('won');
             }
        } else {
            setInteractionText('Door Locked. Need House Key.');
        }
    } else {
      setInteractionText(null);
    }
  });

  const spotLightRef = useRef<THREE.SpotLight>(null);
  const inventory = useGameStore((state) => state.inventory);
  const hasFlashlight = inventory.includes('Flashlight');

  useFrame((state) => {
    if (spotLightRef.current) {
        spotLightRef.current.position.copy(camera.position);
        spotLightRef.current.target.position.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()));
        spotLightRef.current.target.updateMatrixWorld();
        spotLightRef.current.intensity = hasFlashlight ? 2 : 0;
    }
  });

  return (
    <>
        <spotLight 
            ref={spotLightRef}
            intensity={1.5} 
            angle={0.6} 
            penumbra={0.5} 
            distance={15} 
            castShadow 
            color="#ffffee"
        />
    </>
  );
}
