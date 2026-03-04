import { create } from 'zustand';

interface GameState {
  gameState: 'menu' | 'playing' | 'laptop' | 'caught' | 'won';
  setGameState: (state: 'menu' | 'playing' | 'laptop' | 'caught' | 'won') => void;
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
  gateKey: boolean;
  setGateKey: (has: boolean) => void;
  isHiding: boolean;
  setIsHiding: (hiding: boolean) => void;
  noiseLevel: number;
  setNoiseLevel: (level: number) => void;
  tvOn: boolean;
  setTvOn: (on: boolean) => void;
  radioOn: boolean;
  setRadioOn: (on: boolean) => void;
  inventory: string[];
  addToInventory: (item: string) => void;
  interactionText: string | null;
  setInteractionText: (text: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameState: 'menu',
  setGameState: (state) => set({ gameState: state }),
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
  gateKey: false,
  setGateKey: (has) => set({ gateKey: has }),
  isHiding: false,
  setIsHiding: (hiding) => set({ isHiding: hiding }),
  noiseLevel: 0,
  setNoiseLevel: (level) => set({ noiseLevel: level }),
  tvOn: false,
  setTvOn: (on) => set({ tvOn: on }),
  radioOn: false,
  setRadioOn: (on) => set({ radioOn: on }),
  inventory: [],
  addToInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  interactionText: null,
  setInteractionText: (text) => set({ interactionText: text }),
  reset: () => set({ 
    gameState: 'menu', 
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
    gateKey: false,
    isHiding: false,
    noiseLevel: 0,
    tvOn: false,
    radioOn: false,
    inventory: [],
    interactionText: null
  }),
}));
