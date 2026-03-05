import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { WALLS, FURNITURE, WALLS_2ND_FLOOR_FINAL, FURNITURE_2ND_FLOOR } from '../../data/level';

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
    // Reset camera position on mount
    camera.position.set(0, 1.6, 0);
    camera.rotation.set(0, 0, 0);

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
    const allWalls = [...WALLS, ...WALLS_2ND_FLOOR_FINAL];
    for (const wall of allWalls) {
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
      
      // Dynamic height check based on player position
      const playerBottom = newPos.y - 1.5;
      const playerTop = newPos.y + 0.2;

      if (maxY < playerBottom || minY > playerTop) continue;

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
    const allFurniture = [...FURNITURE, ...FURNITURE_2ND_FLOOR];
    for (const item of allFurniture) {
      // Ignore non-collidable items
      if (['Rug', 'LivingRug', 'Poster', 'CeilingLight', 'UnderBed', 'UnderMasterBed', 'Plant', 'Lamp', 'Book', 'ToiletPaper', 'PlayRug', 'TeleportPad2'].includes(item.name)) continue;

      const pos = new THREE.Vector3(...item.position);
      const size = new THREE.Vector3(...item.size);
      
      // Y Check
      const minY = pos.y - size.y / 2;
      const maxY = pos.y + size.y / 2;
      
      const playerBottom = newPos.y - 1.5;
      const playerTop = newPos.y + 0.2;
      
      if (maxY < playerBottom || minY > playerTop) continue;

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
        
        const playerBottom = newPos.y - 1.5;
        const playerTop = newPos.y + 0.2;
        
        if (maxY < playerBottom || minY > playerTop) continue;

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
    const isHiding = useGameStore.getState().isHiding;

    // Movement Logic
    if (!isHiding) {
        direction.z = Number(KEYS.s) - Number(KEYS.w);
        direction.x = Number(KEYS.a) - Number(KEYS.d);
        direction.normalize();

        if (KEYS.w || KEYS.s) velocity.z -= direction.z * 60.0 * dt;
        if (KEYS.a || KEYS.d) velocity.x -= direction.x * 60.0 * dt;
    } else {
        // Stop movement if hiding
        velocity.set(0, 0, 0);
    }

    // Friction
    velocity.x -= velocity.x * 10.0 * dt;
    velocity.z -= velocity.z * 10.0 * dt;

    // Speed Boost Logic
    const hasEnergyDrink = inventory.includes('Energy Drink');
    const currentSpeed = hasEnergyDrink ? SPEED * 1.5 : SPEED;

    // Determine target Y based on current position (Floor Check)
    // 1st Floor: Y ~ 1.6
    // 2nd Floor: Y ~ 21.6
    const onSecondFloor = camera.position.y > 10;
    const targetY = onSecondFloor ? 21.6 : 1.6;

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
    camera.position.y = targetY; 
    
    if (checkCollision(camera.position)) {
      camera.position.copy(currentPos); // Revert if hit
    }
    
    const posAfterX = camera.position.clone();

    // 2. Apply Z-axis movement
    camera.translateZ(-moveForward);
    camera.position.y = targetY;

    if (checkCollision(camera.position)) {
      camera.position.copy(posAfterX); // Revert Z but keep X
    }

    // Head Bob
    if (KEYS.w || KEYS.s || KEYS.a || KEYS.d) {
        const time = state.clock.getElapsedTime();
        camera.position.y = targetY + Math.sin(time * 10) * 0.05;
    } else {
        camera.position.y = targetY;
    }

    // Check interaction distance with Laptop
    // Laptop is at [3, 2, -3] (on desk)
    const laptopPos = new THREE.Vector3(3, 2, -3);
    const distToLaptop = camera.position.distanceTo(laptopPos);
    


    // Safe is at [-40, 1, 15] (Master Bedroom)
    const safePos = new THREE.Vector3(-40, 1, 15);
    const distToSafe = camera.position.distanceTo(safePos);

    // Flashlight is at [32, 0.5, 25] (Storage Room Floor)
    const flashlightPos = new THREE.Vector3(32, 0.5, 25);
    const distToFlashlight = camera.position.distanceTo(flashlightPos);

    // Vent is at [-4.95, 0.5, 12] (Hallway Left)
    const ventPos = new THREE.Vector3(-4.95, 0.5, 12);
    const distToVent = camera.position.distanceTo(ventPos);

    // Storage Door is at [25, 2, 25]
    const storageDoorPos = new THREE.Vector3(25, 2, 25);
    const distToStorageDoor = camera.position.distanceTo(storageDoorPos);

    // Screwdriver is at [32, 0.5, 25] (Storage Room Floor)
    const screwdriverPos = new THREE.Vector3(32, 0.5, 25);
    const distToScrewdriver = camera.position.distanceTo(screwdriverPos);

    // Toolbox is at [34, 3.1, 25]
    const toolboxPos = new THREE.Vector3(34, 3.1, 25);
    const distToToolbox = camera.position.distanceTo(toolboxPos);

    // Arcade Machine (Game Room) - Let's pick one, say at [15, 20.5, 15]
    const arcadePos = new THREE.Vector3(15, 20.5, 15);
    const distToArcade = camera.position.distanceTo(arcadePos);

    // Arcade Coin (Upper Bath)
    const coinPos = new THREE.Vector3(23, 21, -5);
    const distToCoin = camera.position.distanceTo(coinPos);

    // Library Safe (Library)
    const librarySafePos = new THREE.Vector3(-24, 21.5, -10);
    const distToLibrarySafe = camera.position.distanceTo(librarySafePos);

    // Crowbar (Shed)
    const crowbarPos = new THREE.Vector3(30, 2, 40);
    const distToCrowbar = camera.position.distanceTo(crowbarPos);

    // Radio is at [20, 1.5, 20]
    const radioPos = new THREE.Vector3(20, 1.5, 20);
    const distToRadio = camera.position.distanceTo(radioPos);

    // GoomOS Computer (Computer Room)
    const computerPos = new THREE.Vector3(0, 21.5, -28);
    const distToComputer = camera.position.distanceTo(computerPos);

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

    // Dog House is at [-20, 0.75, 45]
    const dogHousePos = new THREE.Vector3(-20, 0.75, 45);
    const distToDogHouse = camera.position.distanceTo(dogHousePos);

    // Big Bush is at [10, 0.75, 45]
    const bigBushPos = new THREE.Vector3(10, 0.75, 45);
    const distToBigBush = camera.position.distanceTo(bigBushPos);

    // Secret Note is at [-24, 0.85, 18]
    const secretNotePos = new THREE.Vector3(-24, 0.85, 18);
    const distToSecretNote = camera.position.distanceTo(secretNotePos);

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

    // Shed Key is at [-20, 0.85, 5.5] (Study Desk)
    const shedKeyPos = new THREE.Vector3(-20, 0.85, 5.5);
    const distToShedKey = camera.position.distanceTo(shedKeyPos);

    // Cabinet Key is at [-10, 21, 5] (Kid Room ToyBox)
    const cabinetKeyPos = new THREE.Vector3(-10, 21, 5);
    const distToCabinetKey = camera.position.distanceTo(cabinetKeyPos);

    // Locked Cabinet is at [-53, 1, 8] (Master Bath)
    const lockedCabinetPos = new THREE.Vector3(-53, 1, 8);
    const distToLockedCabinet = camera.position.distanceTo(lockedCabinetPos);

    // Safe Code is at [-20, 0.85, 5]
    const safeCodePos = new THREE.Vector3(-20, 0.85, 5);
    const distToSafeCode = camera.position.distanceTo(safeCodePos);

    // Battery is at [25, 0.85, 7.5]
    const batteryPos = new THREE.Vector3(25, 0.85, 7.5);
    const distToBattery = camera.position.distanceTo(batteryPos);

    // Energy Drink is at [-13, 1.3, 13]
    const energyDrinkPos = new THREE.Vector3(-13, 1.3, 13);
    const distToEnergyDrink = camera.position.distanceTo(energyDrinkPos);

    // Teleport Pad 1 (1st Floor) at [0, 0.1, 18]
    const telePad1Pos = new THREE.Vector3(0, 0.1, 18);
    // Ignore Y for distance check to make it easier to stand on
    const distToTelePad1 = new THREE.Vector2(camera.position.x, camera.position.z).distanceTo(new THREE.Vector2(telePad1Pos.x, telePad1Pos.z));
    const isNearTelePad1 = distToTelePad1 < 1.0 && Math.abs(camera.position.y - 1.6) < 2;

    // Teleport Pad 2 (2nd Floor) at [0, 20.1, 0]
    const telePad2Pos = new THREE.Vector3(0, 20.1, 0);
    const distToTelePad2 = new THREE.Vector2(camera.position.x, camera.position.z).distanceTo(new THREE.Vector2(telePad2Pos.x, telePad2Pos.z));
    const isNearTelePad2 = distToTelePad2 < 1.0 && Math.abs(camera.position.y - 21.6) < 2;

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
    const cabinetOpen = useGameStore.getState().cabinetOpen;
    const librarySafeOpen = useGameStore.getState().librarySafeOpen;
    const arcadeScoreKnown = useGameStore.getState().arcadeScoreKnown;
    // const inventory = useGameStore.getState().inventory; // Moved up
    const addToInventory = useGameStore.getState().addToInventory;
    // const isHiding = useGameStore.getState().isHiding; // Moved up
    const radioOn = useGameStore.getState().radioOn;
    const tvOn = useGameStore.getState().tvOn;
    const gateKey = useGameStore.getState().gateKey;
    const setGateKey = useGameStore.getState().setGateKey;
    const setLibrarySafeOpen = useGameStore.getState().setLibrarySafeOpen;
    const setArcadeScoreKnown = useGameStore.getState().setArcadeScoreKnown;
    const setToolboxOpen = useGameStore.getState().setToolboxOpen;

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
        // Toolbox is empty now, maybe just a distraction or bonus?
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
    } else if (distToLockedCabinet < 2.5) {
        if (cabinetOpen) {
            if (!inventory.includes('Flashlight')) {
                setInteractionText('Press E to take Flashlight');
                if (KEYS.e) {
                    addToInventory('Flashlight');
                    KEYS.e = false;
                }
            } else {
                setInteractionText('Cabinet is empty.');
            }
        } else {
            if (inventory.includes('Cabinet Key')) {
                setInteractionText('Press E to Unlock Cabinet');
                if (KEYS.e) {
                    useGameStore.getState().setCabinetOpen(true);
                    KEYS.e = false;
                }
            } else {
                setInteractionText('Cabinet is Locked. Need Cabinet Key.');
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
        if (inventory.includes('Shed Key')) {
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
        } else {
            setInteractionText('Shed is Locked. Need Shed Key.');
        }
    } else if (distToDogHouse < 2.5) {
        setInteractionText('Press E to Hide in Dog House');
        if (KEYS.e) {
            useGameStore.getState().setIsHiding(true);
            KEYS.e = false;
        }
    } else if (distToBigBush < 2.5) {
        setInteractionText('Press E to Hide in Bush');
        if (KEYS.e) {
            useGameStore.getState().setIsHiding(true);
            KEYS.e = false;
        }
    } else if (distToSecretNote < 3 && !inventory.includes('Secret Note')) {
        setInteractionText('Press E to read Secret Note');
        if (KEYS.e) {
            addToInventory('Secret Note');
            setInteractionText('Note says: "I hid the Cabinet Key under the Living Room Rug!"');
            KEYS.e = false;
        }
    } else if (distToToolbox < 2.5) {
        if (toolboxOpen) {
            if (!inventory.includes('Screwdriver')) {
                setInteractionText('Press E to take Screwdriver');
                if (KEYS.e) {
                    addToInventory('Screwdriver');
                    KEYS.e = false;
                }
            } else {
                setInteractionText('Toolbox is empty.');
            }
        } else {
            setInteractionText('Press E to Open Toolbox');
            if (KEYS.e) {
                setToolboxOpen(true);
                KEYS.e = false;
            }
        }
    } else if (distToArcade < 2.5) {
        if (arcadeScoreKnown) {
            setInteractionText('High Score: 5932');
        } else {
            if (inventory.includes('Arcade Coin')) {
                setInteractionText('Press E to Insert Coin');
                if (KEYS.e) {
                    setArcadeScoreKnown(true);
                    setInteractionText('High Score: 5932');
                    KEYS.e = false;
                }
            } else {
                setInteractionText('Insert Coin to Play');
            }
        }
    } else if (distToCoin < 2 && !inventory.includes('Arcade Coin')) {
        setInteractionText('Press E to take Arcade Coin');
        if (KEYS.e) {
            addToInventory('Arcade Coin');
            KEYS.e = false;
        }
    } else if (distToLibrarySafe < 2.5) {
        if (librarySafeOpen) {
            if (!inventory.includes('Gate Key')) {
                setInteractionText('Press E to take Gate Key');
                if (KEYS.e) {
                    addToInventory('Gate Key');
                    setGateKey(true);
                    KEYS.e = false;
                }
            } else {
                setInteractionText('Safe is empty.');
            }
        } else {
            setInteractionText('Press E to Enter Code (4 digits)');
            if (KEYS.e) {
                const code = prompt('Enter Safe Code:');
                if (code === '5932') {
                    setLibrarySafeOpen(true);
                    alert('Safe Opened!');
                } else {
                    alert('Wrong Code!');
                }
                KEYS.e = false;
            }
        }
    } else if (distToCrowbar < 3 && !inventory.includes('Crowbar')) {
        setInteractionText('Press E to take Crowbar');
        if (KEYS.e) {
            addToInventory('Crowbar');
            KEYS.e = false;
        }
    } else if (distToComputer < 3) {
        setInteractionText('Press E to use GoomOS Computer');
        if (KEYS.e) {
            setGameState('goomos');
            KEYS.e = false;
        }
    } else if (distToShedKey < 3 && !inventory.includes('Shed Key')) {
        setInteractionText('Press E to take Shed Key');
        if (KEYS.e) {
            addToInventory('Shed Key');
            KEYS.e = false;
        }
    } else if (distToCabinetKey < 3 && !inventory.includes('Cabinet Key')) {
        setInteractionText('Press E to take Cabinet Key');
        if (KEYS.e) {
            addToInventory('Cabinet Key');
            KEYS.e = false;
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
    } else if (distToStudyKey < 3 && !inventory.includes('Study Key')) {
        setInteractionText('Press E to take Study Key');
        if (KEYS.e) {
            addToInventory('Study Key');
            KEYS.e = false;
        }
    } else if (distToSafeCode < 3 && !inventory.includes('Safe Code')) {
        setInteractionText('Press E to take Note (Safe Code)');
        if (KEYS.e) {
            addToInventory('Safe Code');
            setInteractionText('Found Safe Code: 1-9-9-6');
            KEYS.e = false;
        }
    } else if (distToBattery < 3 && !inventory.includes('Battery')) {
        setInteractionText('Press E to take Battery');
        if (KEYS.e) {
            addToInventory('Battery');
            KEYS.e = false;
        }
    } else if (distToEnergyDrink < 3 && !inventory.includes('Energy Drink')) {
        setInteractionText('Press E to drink Energy Drink (Speed Boost)');
        if (KEYS.e) {
            addToInventory('Energy Drink');
            // Apply speed boost? For now just inventory item.
            // Maybe set a state for speed boost.
            // Let's just say "You feel energized!"
            setInteractionText('You feel energized! (Speed Boost)');
            KEYS.e = false;
        }
    } else if (isNearTelePad1) {
        setInteractionText('Press E to Teleport to 2nd Floor');
        if (KEYS.e) {
            camera.position.set(0, 21.6, 0); // Teleport to 2nd Floor
            lastValidPosition.current.copy(camera.position);
            KEYS.e = false;
        }
    } else if (isNearTelePad2) {
        setInteractionText('Press E to Teleport to 1st Floor');
        if (KEYS.e) {
            camera.position.set(0, 1.6, 18); // Teleport to 1st Floor
            lastValidPosition.current.copy(camera.position);
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
