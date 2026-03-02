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
  toolboxOpen: boolean;
  setToolboxOpen: (open: boolean) => void;
  toolboxCodeKnown: boolean;
  setToolboxCodeKnown: (known: boolean) => void;
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
  toolboxOpen: false,
  setToolboxOpen: (open) => set({ toolboxOpen: open }),
  toolboxCodeKnown: false,
  setToolboxCodeKnown: (known) => set({ toolboxCodeKnown: known }),
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
    toolboxOpen: false,
    toolboxCodeKnown: false,
    inventory: [],
    interactionText: null
  }),
}));
