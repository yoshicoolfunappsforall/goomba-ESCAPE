import { create } from 'zustand';

interface GameState {
  gameState: 'menu' | 'intro' | 'playing' | 'laptop' | 'goomos' | 'caught' | 'won' | 'jumpscare' | 'story' | 'paused';
  setGameState: (state: 'menu' | 'intro' | 'playing' | 'laptop' | 'goomos' | 'caught' | 'won' | 'jumpscare' | 'story' | 'paused') => void;
  hasKey: boolean;
  setHasKey: (hasKey: boolean) => void;
  doorCodeKnown: boolean;
  setDoorCodeKnown: (known: boolean) => void;
  doorOpen: boolean;
  setDoorOpen: (open: boolean) => void;
  safeOpen: boolean;
  setSafeOpen: (open: boolean) => void;
  safeKeypadOpen: boolean;
  setSafeKeypadOpen: (open: boolean) => void;
  ventOpen: boolean;
  setVentOpen: (open: boolean) => void;
  storageOpen: boolean;
  setStorageOpen: (open: boolean) => void;
  bedroomDoorOpen: boolean;
  setBedroomDoorOpen: (open: boolean) => void;
  bathroomDoorOpen: boolean;
  setBathroomDoorOpen: (open: boolean) => void;
  masterBedroomDoorOpen: boolean;
  setMasterBedroomDoorOpen: (open: boolean) => void;
  guestDoorOpen: boolean;
  setGuestDoorOpen: (open: boolean) => void;
  studyDoorOpen: boolean;
  setStudyDoorOpen: (open: boolean) => void;
  diningDoorOpen: boolean;
  setDiningDoorOpen: (open: boolean) => void;
  pianoPlaying: boolean;
  setPianoPlaying: (playing: boolean) => void;
  toolboxOpen: boolean;
  setToolboxOpen: (open: boolean) => void;
  toolboxKeypadOpen: boolean;
  setToolboxKeypadOpen: (open: boolean) => void;
  toolboxCodeKnown: boolean;
  setToolboxCodeKnown: (known: boolean) => void;
  cabinetOpen: boolean;
  setCabinetOpen: (open: boolean) => void;
  librarySafeOpen: boolean;
  setLibrarySafeOpen: (open: boolean) => void;
  arcadeScoreKnown: boolean;
  setArcadeScoreKnown: (known: boolean) => void;
  gateKey: boolean;
  setGateKey: (has: boolean) => void;
  
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  lowPerformance: boolean;
  setLowPerformance: (low: boolean) => void;
  espEnabled: boolean;
  setEspEnabled: (enabled: boolean) => void;
  speedHackEnabled: boolean;
  setSpeedHackEnabled: (enabled: boolean) => void;
  godMode: boolean;
  setGodMode: (enabled: boolean) => void;
  speedrunTimerEnabled: boolean;
  setSpeedrunTimerEnabled: (enabled: boolean) => void;
  gameStartTime: number | null;
  setGameStartTime: (time: number | null) => void;
  gameEndTime: number | null;
  setGameEndTime: (time: number | null) => void;
  usedCheats: boolean;
  setUsedCheats: (used: boolean) => void;
  unlag: () => void;
  mobileMovement: { x: number, y: number };
  setMobileMovement: (movement: { x: number, y: number }) => void;
  mobileInteract: boolean;
  setMobileInteract: (interact: boolean) => void;
  
  // Settings
  sensitivity: number;
  setSensitivity: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
  showFps: boolean;
  setShowFps: (show: boolean) => void;
  fpsLimit: number;
  setFpsLimit: (limit: number) => void;
  fov: number;
  setFov: (fov: number) => void;
  headBobbing: boolean;
  setHeadBobbing: (bobbing: boolean) => void;
  invertY: boolean;
  setInvertY: (invert: boolean) => void;
  popupsEnabled: boolean;
  setPopupsEnabled: (enabled: boolean) => void;
  
  isHiding: boolean;
  setIsHiding: (hiding: boolean) => void;
  noiseLevel: number;
  setNoiseLevel: (level: number) => void;
  tvOn: boolean;
  setTvOn: (on: boolean) => void;
  radioOn: boolean;
  setRadioOn: (on: boolean) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (diff: 'easy' | 'medium' | 'hard') => void;
  challengeMode: boolean;
  setChallengeMode: (enabled: boolean) => void;
  threeGoombaMode: boolean;
  setThreeGoombaMode: (enabled: boolean) => void;
  inventory: string[];
  addToInventory: (item: string) => void;
  interactionText: string | null;
  setInteractionText: (text: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameState: 'menu',
  setGameState: (newState) => set((state) => {
    const updates: Partial<GameState> = { gameState: newState };
    if (newState === 'playing' && state.gameStartTime === null) {
      updates.gameStartTime = Date.now();
      updates.gameEndTime = null;
      updates.usedCheats = false;
    } else if (newState === 'won' && state.gameState !== 'won') {
      updates.gameEndTime = Date.now();
    }
    return updates;
  }),
  hasKey: false,
  setHasKey: (hasKey) => set({ hasKey }),
  doorCodeKnown: false,
  setDoorCodeKnown: (known) => set({ doorCodeKnown: known }),
  doorOpen: false,
  setDoorOpen: (open) => set({ doorOpen: open }),
  safeOpen: false,
  setSafeOpen: (open) => set({ safeOpen: open }),
  safeKeypadOpen: false,
  setSafeKeypadOpen: (open) => set({ safeKeypadOpen: open }),
  ventOpen: false,
  setVentOpen: (open) => set({ ventOpen: open }),
  storageOpen: false,
  setStorageOpen: (open) => set({ storageOpen: open }),
  bedroomDoorOpen: false,
  setBedroomDoorOpen: (open) => set({ bedroomDoorOpen: open }),
  bathroomDoorOpen: false,
  setBathroomDoorOpen: (open) => set({ bathroomDoorOpen: open }),
  masterBedroomDoorOpen: false,
  setMasterBedroomDoorOpen: (open) => set({ masterBedroomDoorOpen: open }),
  guestDoorOpen: false,
  setGuestDoorOpen: (open) => set({ guestDoorOpen: open }),
  studyDoorOpen: false,
  setStudyDoorOpen: (open) => set({ studyDoorOpen: open }),
  diningDoorOpen: false,
  setDiningDoorOpen: (open) => set({ diningDoorOpen: open }),
  pianoPlaying: false,
  setPianoPlaying: (playing) => set({ pianoPlaying: playing }),
  toolboxOpen: false,
  setToolboxOpen: (open) => set({ toolboxOpen: open }),
  toolboxKeypadOpen: false,
  setToolboxKeypadOpen: (open) => set({ toolboxKeypadOpen: open }),
  toolboxCodeKnown: false,
  setToolboxCodeKnown: (known) => set({ toolboxCodeKnown: known }),
  cabinetOpen: false,
  setCabinetOpen: (open) => set({ cabinetOpen: open }),
  librarySafeOpen: false,
  setLibrarySafeOpen: (open) => set({ librarySafeOpen: open }),
  arcadeScoreKnown: false,
  setArcadeScoreKnown: (known) => set({ arcadeScoreKnown: known }),
  gateKey: false,
  setGateKey: (has) => set({ gateKey: has }),
  
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
  lowPerformance: false,
  setLowPerformance: (low) => set({ lowPerformance: low }),
  espEnabled: false,
  setEspEnabled: (enabled) => set((state) => ({ espEnabled: enabled, usedCheats: enabled ? true : state.usedCheats })),
  speedHackEnabled: false,
  setSpeedHackEnabled: (enabled) => set((state) => ({ speedHackEnabled: enabled, usedCheats: enabled ? true : state.usedCheats })),
  godMode: false,
  setGodMode: (enabled) => set((state) => ({ godMode: enabled, usedCheats: enabled ? true : state.usedCheats })),
  speedrunTimerEnabled: false,
  setSpeedrunTimerEnabled: (enabled) => set({ speedrunTimerEnabled: enabled }),
  gameStartTime: null,
  setGameStartTime: (time) => set({ gameStartTime: time }),
  gameEndTime: null,
  setGameEndTime: (time) => set({ gameEndTime: time }),
  usedCheats: false,
  setUsedCheats: (used) => set({ usedCheats: used }),
  unlag: () => set({ lowPerformance: true, fpsLimit: 30, fov: 70, headBobbing: false }),
  mobileMovement: { x: 0, y: 0 },
  setMobileMovement: (movement) => set({ mobileMovement: movement }),
  mobileInteract: false,
  setMobileInteract: (interact) => set({ mobileInteract: interact }),
  
  sensitivity: 1,
  setSensitivity: (val) => set({ sensitivity: val }),
  volume: 0.5,
  setVolume: (val) => set({ volume: val }),
  showFps: false,
  setShowFps: (show) => set({ showFps: show }),
  fpsLimit: 60,
  setFpsLimit: (limit) => set({ fpsLimit: limit }),
  fov: 75,
  setFov: (fov) => set({ fov }),
  headBobbing: true,
  setHeadBobbing: (bobbing) => set({ headBobbing: bobbing }),
  invertY: false,
  setInvertY: (invert) => set({ invertY: invert }),
  popupsEnabled: false,
  setPopupsEnabled: (enabled) => set({ popupsEnabled: enabled }),
  
  isHiding: false,
  setIsHiding: (hiding) => set({ isHiding: hiding }),
  noiseLevel: 0,
  setNoiseLevel: (level) => set({ noiseLevel: level }),
  tvOn: false,
  setTvOn: (on) => set({ tvOn: on }),
  radioOn: false,
  setRadioOn: (on) => set({ radioOn: on }),
  difficulty: 'medium',
  setDifficulty: (diff) => set({ difficulty: diff }),
  challengeMode: false,
  setChallengeMode: (enabled) => set({ challengeMode: enabled }),
  threeGoombaMode: false,
  setThreeGoombaMode: (enabled) => set({ threeGoombaMode: enabled }),
  inventory: [],
  addToInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  interactionText: null,
  setInteractionText: (text) => set({ interactionText: text }),
  reset: () => set({ 
    gameState: 'menu', 
    gameStartTime: null,
    gameEndTime: null,
    usedCheats: false,
    hasKey: false, 
    doorCodeKnown: false, 
    doorOpen: false,
    safeOpen: false,
    safeKeypadOpen: false,
    ventOpen: false,
    storageOpen: false,
    bedroomDoorOpen: false,
    bathroomDoorOpen: false,
    masterBedroomDoorOpen: false,
    guestDoorOpen: false,
    studyDoorOpen: false,
    diningDoorOpen: false,
    pianoPlaying: false,
    toolboxOpen: false,
    toolboxKeypadOpen: false,
    toolboxCodeKnown: false,
    cabinetOpen: false,
    librarySafeOpen: false,
    arcadeScoreKnown: false,
    gateKey: false,
    isHiding: false,
    noiseLevel: 0,
    tvOn: false,
    radioOn: false,
    inventory: [],
    interactionText: null
  }),
}));
