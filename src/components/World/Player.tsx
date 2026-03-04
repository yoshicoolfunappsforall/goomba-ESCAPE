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
  const lastValidPosition = useRef(new THREE.Vector3(0, 1.6, 0));

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
      // Ignore non-collidable items
      if (['Rug', 'LivingRug', 'Poster', 'CeilingLight', 'UnderBed', 'UnderMasterBed', 'Plant', 'Lamp', 'Book', 'ToiletPaper'].includes(item.name)) continue;

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

    // Check Doors
    const state = useGameStore.getState();
    const doors = [
        { position: [0, 2, 35], size: [4, 4, 0.2], open: false }, // Front Door
        { position: [25, 2, 25], size: [0.2, 4, 3.8], open: state.storageOpen }, // Storage Door
        { position: [1, 2, 5], size: [4, 4, 0.2], open: state.bedroomDoorOpen }, // Bedroom Door
        { position: [-5, 2, 10], size: [0.2, 4, 2], open: state.bathroomDoorOpen }, // Bathroom Door
        { position: [-25.5, 2, 17.5], size: [0.2, 4, 3], open: state.masterBedroomDoorOpen }, // Master Bedroom Door
        { position: [5, 2, 9.5], size: [0.2, 4, 3], open: state.guestDoorOpen }, // Guest Room Door
        { position: [20, 2, 15], size: [4, 4, 0.2], open: state.diningDoorOpen }, // Dining Room Door
        { position: [-20, 2, 15], size: [4, 4, 0.2], open: state.studyDoorOpen } // Study Door
    ];

    for (const door of doors) {
        if (door.open) continue;
        
        const pos = new THREE.Vector3(...door.position);
        const size = new THREE.Vector3(...door.size);

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

    // Clamp delta to prevent huge jumps on lag (max 0.1s)
    const dt = Math.min(delta, 0.1);
    const inventory = useGameStore.getState().inventory;

    // Movement Logic
    direction.z = Number(KEYS.s) - Number(KEYS.w);
    direction.x = Number(KEYS.a) - Number(KEYS.d);
    direction.normalize();

    if (KEYS.w || KEYS.s) velocity.z -= direction.z * 60.0 * dt;
    if (KEYS.a || KEYS.d) velocity.x -= direction.x * 60.0 * dt;

    // Friction
    velocity.x -= velocity.x * 10.0 * dt;
    velocity.z -= velocity.z * 10.0 * dt;

    // Speed Boost Logic
    const hasEnergyDrink = inventory.includes('Energy Drink');
    const currentSpeed = hasEnergyDrink ? SPEED * 1.5 : SPEED;

    // Calculate potential new position
    const moveForward = velocity.z * dt * currentSpeed;
    const moveRight = velocity.x * dt * currentSpeed;

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
    


    // Safe is at [-40, 1, 15] (Master Bedroom)
    const safePos = new THREE.Vector3(-40, 1, 15);
    const distToSafe = camera.position.distanceTo(safePos);

    // Flashlight is at [3, 0.85, -3]
    const flashlightPos = new THREE.Vector3(3, 0.85, -3);
    const distToFlashlight = camera.position.distanceTo(flashlightPos);

    // Vent is at [-4.95, 0.5, 12] (Hallway Left)
    const ventPos = new THREE.Vector3(-4.95, 0.5, 12);
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

    // Master Bedroom Door is at [-25.5, 2, 16] (pivot) -> Center roughly [-25.5, 2, 17.5]
    const masterBedroomDoorPos = new THREE.Vector3(-25.5, 2, 17.5);
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

    // Guest Door is at [5, 2, 9.5]
    const guestDoorPos = new THREE.Vector3(5, 2, 9.5);
    const distToGuestDoor = camera.position.distanceTo(guestDoorPos);

    // Dining Door is at [20, 2, 15]
    const diningDoorPos = new THREE.Vector3(20, 2, 15);
    const distToDiningDoor = camera.position.distanceTo(diningDoorPos);

    // Study Door is at [-20, 2, 15]
    const studyDoorPos = new THREE.Vector3(-20, 2, 15);
    const distToStudyDoor = camera.position.distanceTo(studyDoorPos);

    // Study Key is at [13, 1.1, 2]
    const studyKeyPos = new THREE.Vector3(13, 1.1, 2);
    const distToStudyKey = camera.position.distanceTo(studyKeyPos);

    // Safe Code is at [-20, 0.85, 5]
    const safeCodePos = new THREE.Vector3(-20, 0.85, 5);
    const distToSafeCode = camera.position.distanceTo(safeCodePos);

    // Battery is at [25, 0.85, 7.5]
    const batteryPos = new THREE.Vector3(25, 0.85, 7.5);
    const distToBattery = camera.position.distanceTo(batteryPos);

    // Energy Drink is at [-13, 1.3, 13]
    const energyDrinkPos = new THREE.Vector3(-13, 1.3, 13);
    const distToEnergyDrink = camera.position.distanceTo(energyDrinkPos);

    const setInteractionText = useGameStore.getState().setInteractionText;
    const gameState = useGameStore.getState().gameState;
    // const inventory = useGameStore.getState().inventory; // Moved to top of useFrame
    const doorCodeKnown = useGameStore.getState().doorCodeKnown;
    const safeOpen = useGameStore.getState().safeOpen;
    const ventOpen = useGameStore.getState().ventOpen;
    const storageOpen = useGameStore.getState().storageOpen;
    const bedroomDoorOpen = useGameStore.getState().bedroomDoorOpen;
    const bathroomDoorOpen = useGameStore.getState().bathroomDoorOpen;
    const guestDoorOpen = useGameStore.getState().guestDoorOpen;
    const diningDoorOpen = useGameStore.getState().diningDoorOpen;
    const studyDoorOpen = useGameStore.getState().studyDoorOpen;
    const toolboxOpen = useGameStore.getState().toolboxOpen;
    const toolboxCodeKnown = useGameStore.getState().toolboxCodeKnown;
    // const inventory = useGameStore.getState().inventory; // Moved up
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
             if (!inventory.includes('Screwdriver')) {
                 setInteractionText('Press E to take Screwdriver');
                 if (KEYS.e) {
                     addToInventory('Screwdriver');
                     KEYS.e = false;
                 }
             } else {
                 setInteractionText('Toolbox is open. Empty.');
             }
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
                 lastValidPosition.current.copy(camera.position);
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
    } else if (distToGuestDoor < 3) {
        setInteractionText(guestDoorOpen ? 'Press E to Close Door' : 'Press E to Open Door');
        if (KEYS.e) {
            useGameStore.getState().setGuestDoorOpen(!guestDoorOpen);
            KEYS.e = false;
        }
    } else if (distToDiningDoor < 3) {
        setInteractionText(diningDoorOpen ? 'Press E to Close Door' : 'Press E to Open Door');
        if (KEYS.e) {
            useGameStore.getState().setDiningDoorOpen(!diningDoorOpen);
            KEYS.e = false;
        }
    } else if (distToStudyDoor < 3) {
        if (studyDoorOpen) {
             setInteractionText('Press E to Close Door');
             if (KEYS.e) {
                 useGameStore.getState().setStudyDoorOpen(false);
                 KEYS.e = false;
             }
        } else {
             if (inventory.includes('Study Key')) {
                 setInteractionText('Press E to Open Door');
                 if (KEYS.e) {
                     useGameStore.getState().setStudyDoorOpen(true);
                     KEYS.e = false;
                 }
             } else {
                 setInteractionText('Locked. Need Study Key.');
             }
        }
    } else if (distToStudyKey < 2 && !inventory.includes('Study Key')) {
        setInteractionText('Press E to take Study Key');
        if (KEYS.e) {
            addToInventory('Study Key');
            KEYS.e = false;
        }
    } else if (distToSafeCode < 2 && !inventory.includes('Safe Code')) {
        setInteractionText('Press E to take Note (Safe Code)');
        if (KEYS.e) {
            addToInventory('Safe Code');
            setInteractionText('Found Safe Code: 1-9-9-6');
            KEYS.e = false;
        }
    } else if (distToBattery < 2 && !inventory.includes('Battery')) {
        setInteractionText('Press E to take Battery');
        if (KEYS.e) {
            addToInventory('Battery');
            KEYS.e = false;
        }
    } else if (distToEnergyDrink < 2 && !inventory.includes('Energy Drink')) {
        setInteractionText('Press E to drink Energy Drink (Speed Boost)');
        if (KEYS.e) {
            addToInventory('Energy Drink');
            // Apply speed boost? For now just inventory item.
            // Maybe set a state for speed boost.
            // Let's just say "You feel energized!"
            setInteractionText('You feel energized! (Speed Boost)');
            KEYS.e = false;
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
