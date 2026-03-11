import * as THREE from 'three';

export interface Wall {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
}

// Thicker walls
const T = 1.0; 
const H = 6.0; 

// OVERRIDE WALLS to fix the split
export const WALLS: Wall[] = [
  // --- BEDROOM (Start) ---
  { position: [0, H/2, -5 - T/2], size: [10 + 2*T, H, T] }, 
  { position: [-5 - T/2, H/2, 0], size: [10, H, T], rotation: [0, Math.PI / 2, 0] }, 
  { position: [5 + T/2, H/2, 0], size: [10, H, T], rotation: [0, Math.PI / 2, 0] }, 
  { position: [-3 - T/2, H/2, 5 + T/2], size: [4 + T, H, T] }, 
  { position: [4 + T/2, H/2, 5 + T/2], size: [2 + T, H, T] }, 
  { position: [1, 5, 5 + T/2], size: [4, 2, T] }, 

  // --- HALLWAY ---
  // Right Wall (Shared with Guest Room) - Split for Door
  { position: [5 + T/2, H/2, 2.5], size: [5, H, T], rotation: [0, Math.PI / 2, 0] }, // z=0 to 5 (Added to close gap)
  { position: [5 + T/2, H/2, 6.5], size: [3, H, T], rotation: [0, Math.PI / 2, 0] }, // z=5 to 8
  { position: [5 + T/2, 5, 9.5], size: [3, 2, T], rotation: [0, Math.PI / 2, 0] }, // Door Header z=8 to 11
  { position: [5 + T/2, H/2, 13], size: [4, H, T], rotation: [0, Math.PI / 2, 0] }, // z=11 to 15

  // Left Wall (Shared with Bathroom)
  { position: [-5 - T/2, H/2, 7], size: [4, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [-5 - T/2, 5, 10], size: [2, 2, T], rotation: [0, Math.PI / 2, 0] },
  // Vent Hole at z=12?
  // Wall is z=11 to 15.
  // Let's make a hole at z=12.
  // Wall 1: z=11 to 11.5
  // Hole: z=11.5 to 12.5
  // Wall 2: z=12.5 to 15
  { position: [-5 - T/2, H/2, 11.25], size: [0.5, H, T], rotation: [0, Math.PI / 2, 0] }, // z=11 to 11.5
  { position: [-5 - T/2, 5, 12], size: [1, 2, T], rotation: [0, Math.PI / 2, 0] }, // Vent Header z=11.5 to 12.5
  { position: [-5 - T/2, 0.25, 12], size: [1, 0.5, T], rotation: [0, Math.PI / 2, 0] }, // Vent Bottom z=11.5 to 12.5
  { position: [-5 - T/2, H/2, 13.75], size: [2.5, H, T], rotation: [0, Math.PI / 2, 0] }, // z=12.5 to 15

  // --- BATHROOM ---
  { position: [-10, H/2, 5 - T/2], size: [10 + T, H, T] },
  { position: [-15 - T/2, H/2, 10], size: [10, H, T], rotation: [0, Math.PI / 2, 0] },
  // Front Wall (Shared with Living Room) - Defined below

  // --- GUEST ROOM (Right of Hallway) ---
  { position: [10, H/2, 0], size: [10, H, T] }, // Back Wall (z=0)
  { position: [15 + T/2, H/2, 7.5], size: [15, H, T], rotation: [0, Math.PI / 2, 0] }, // Right Wall (Shared with Dining Room)
  // Front Wall (Shared with Kitchen) - Defined below

  // --- DINING ROOM (Right of Guest Room) ---
  { position: [25, H/2, 0], size: [20, H, T] }, // Back Wall (z=0)
  { position: [35 + T/2, H/2, 7.5], size: [15, H, T], rotation: [0, Math.PI / 2, 0] }, // Right Wall (Shared with Garage?)
  // Front Wall (Shared with Kitchen) - Defined below

  // --- STUDY (Left of Bathroom) ---
  { position: [-20, H/2, 0], size: [10, H, T] }, // Back Wall (z=0)
  { position: [-25 - T/2, H/2, 7.5], size: [15, H, T], rotation: [0, Math.PI / 2, 0] }, // Left Wall (Shared with Master Bedroom)
  // Right Wall (Shared with Bathroom) - Check Bathroom Left Wall
  // Bathroom Left Wall is at x=-15. Study Right Wall is at x=-15.
  // Bathroom Left Wall: z=5 to 15.
  // Study is z=0 to 15.
  // Need to extend Bathroom Left Wall to z=0?
  { position: [-15 - T/2, H/2, 2.5], size: [5, H, T], rotation: [0, Math.PI / 2, 0] }, // z=0 to 5 (Study/Bathroom divider extension)

  // --- LIVING ROOM / KITCHEN ---
  // Back Wall (Left) - Separates Living Room from Bathroom & Study
  // Range x=-25 to -5.
  // Bathroom is x=-15 to -5. Study is x=-25 to -15.
  // Need Door to Study (x=-20).
  { position: [-10, H/2, 15 - T/2], size: [10, H, T] }, // Bathroom Front (x=-15 to -5)
  { position: [-16.5, H/2, 15 - T/2], size: [3, H, T] }, // Study Front Right (x=-18 to -15)
  { position: [-20, 5, 15 - T/2], size: [4, 2, T] }, // Study Door Header (x=-22 to -18)
  { position: [-23.5, H/2, 15 - T/2], size: [3, H, T] }, // Study Front Left (x=-25 to -22)

  // Back Wall (Right) - Separates Kitchen from Guest Room & Dining Room
  // Range x=5 to 25.
  // Guest Room is x=5 to 15. Dining Room is x=15 to 35.
  // Need Door to Dining Room (x=20).
  { position: [10, H/2, 15 - T/2], size: [10, H, T] }, // Guest Room Front (x=5 to 15)
  { position: [16.5, H/2, 15 - T/2], size: [3, H, T] }, // Dining Room Front Left (x=15 to 18)
  { position: [20, 5, 15 - T/2], size: [4, 2, T] }, // Dining Room Door Header (x=18 to 22)
  { position: [23.5, H/2, 15 - T/2], size: [3, H, T] }, // Dining Room Front Right (x=22 to 25)
  // Dining Room extends to x=35. Need more wall for Kitchen/Dining separation?
  // Kitchen is x=15 to 25. Dining Room is x=15 to 35.
  // So the wall at z=15 only goes up to x=25 (Kitchen limit).
  // But Dining Room is wider.
  // We need a wall at z=15 from x=25 to 35?
  // No, Garage is at x=35.
  // Storage is at x=25 to 35, z=20 to 30.
  // So x=25 to 35, z=15 to 20 is empty? Or part of Kitchen?
  // Let's extend the wall at z=15 to x=35.
  { position: [30, H/2, 15 - T/2], size: [10, H, T] }, // Dining Room Front (x=25 to 35)

  // Left Wall (Shared with Master Bedroom) - Split for Door
  { position: [-25 - T/2, H/2, 8], size: [16, H, T], rotation: [0, Math.PI / 2, 0] }, // z=0 to 16
  { position: [-25 - T/2, 5, 17.5], size: [3, 2, T], rotation: [0, Math.PI / 2, 0] }, // Door Header z=16 to 19
  { position: [-25 - T/2, H/2, 19.5], size: [1, H, T], rotation: [0, Math.PI / 2, 0] }, // z=19 to 20
  { position: [-25 - T/2, H/2, 27.5], size: [15, H, T], rotation: [0, Math.PI / 2, 0] }, // z=20 to 35 (Restored Living Room Left Wall)
  
  // Right Wall (Split for Storage Room)
  { position: [25 + T/2, H/2, 19], size: [8, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [25 + T/2, H/2, 31], size: [8, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [25 + T/2, 5, 25], size: [4, 2, T], rotation: [0, Math.PI / 2, 0] },

  // Front Wall (Exit)
  { position: [-16, H/2, 35 + T/2], size: [28, H, T] },
  { position: [13.5, H/2, 35 + T/2], size: [23, H, T] },
  { position: [0, 5, 35 + T/2], size: [4, 2, T] }, 

  // Kitchen Divider - REMOVED (Blocking way)
  // { position: [10, H/2, 25], size: [10, H, T], rotation: [0, Math.PI / 2, 0] },

  // --- STORAGE ROOM ---
  { position: [35 + T/2, H/2, 25], size: [10, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [30, H/2, 20 - T/2], size: [10 + T, H, T] },
  { position: [30, H/2, 30 + T/2], size: [10 + T, H, T] },

  // --- MASTER BEDROOM (Left of Living Room) ---
  // Right wall is shared with Living Room (defined above)
  { position: [-35, H/2, 0], size: [20, H, 1] }, // Back Wall Master
  // Left Wall Master (Shared with Master Bath) - Split for Door
  { position: [-45, H/2, 1.75], size: [3.5, H, 1], rotation: [0, Math.PI / 2, 0] }, // z=0 to 3.5 (FIXED SIZE)
  { position: [-45, 5, 5], size: [3, 2, 1], rotation: [0, Math.PI / 2, 0] }, // Door Header z=3.5 to 6.5 (FIXED SIZE)
  { position: [-45, H/2, 13.25], size: [13.5, H, 1], rotation: [0, Math.PI / 2, 0] }, // z=6.5 to 20 (FIXED SIZE)
  
  { position: [-35, H/2, 20], size: [20, H, 1] }, // Front Wall Master

  // --- MASTER BATHROOM (Left of Master Bedroom) ---
  { position: [-50, H/2, 0], size: [10, H, 1] }, // Back Wall
  { position: [-50, H/2, 10], size: [10, H, 1] }, // Front Wall
  { position: [-55, H/2, 5], size: [10, H, 1], rotation: [0, Math.PI / 2, 0] }, // Left Wall (FIXED SIZE)

  // --- GARAGE (Right of Kitchen) ---
  { position: [35, H/2, 15], size: [1, H, 20] }, // Wall separating Garage from House
  { position: [45, H/2, 5], size: [20, H, 1] }, // Back Wall Garage
  { position: [55, H/2, 15], size: [1, H, 20] }, // Right Wall Garage
  { position: [45, H/2, 25], size: [20, H, 1] }, // Front Wall Garage

  // --- OUTSIDE FENCES ---
  { position: [-40, 1.5, 50], size: [70, 3, 1] }, // Front Fence Left
  { position: [40, 1.5, 50], size: [70, 3, 1] }, // Front Fence Right
  { position: [-75, 1.5, 25], size: [1, 3, 50] }, // Left Fence
  { position: [75, 1.5, 25], size: [1, 3, 50] }, // Right Fence
];

export const FURNITURE = [
  // Bedroom
  { position: [3, 0.75, -3], size: [3, 0.1, 1.5], color: '#5D4037', name: 'Desk' }, 
  { position: [-3, 0.5, -3], size: [3, 1, 4], color: '#1E88E5', name: 'Bed' },
  { position: [0, 0.1, 0], size: [4, 0.05, 6], color: '#795548', name: 'Rug' },
  
  // Bathroom
  { position: [-13, 0.5, 7], size: [2, 1, 2], color: '#fff', name: 'Toilet' },
  { position: [-13, 1, 13], size: [2, 0.1, 3], color: '#fff', name: 'BathCounter' },
  { position: [-18, 1.5, 7], size: [0.1, 2, 1.5], color: '#E0F7FA', name: 'Mirror' }, // On wall
  { position: [-18, 1, 13], size: [3, 2, 3], color: '#B2EBF2', name: 'Shower' },

  // Living Room
  { position: [-5, 0.5, 25], size: [4, 1, 8], color: '#444', name: 'Sofa' },
  { position: [5, 0.5, 25], size: [2, 1, 4], color: '#5D4037', name: 'CoffeeTable' },
  { position: [-14, 1.5, 25], size: [1, 3, 6], color: '#3E2723', name: 'Bookshelf' },
  { position: [0, 0.1, 25], size: [8, 0.05, 10], color: '#37474F', name: 'LivingRug' },
  { position: [-24, 1, 25], size: [1, 1.5, 4], color: '#212121', name: 'TVStand' },
  { position: [-24, 2, 25], size: [0.2, 1.5, 3], color: '#000', name: 'TV' },
  { position: [-10, 0, 20], size: [1, 1, 1], color: '#2E7D32', name: 'Plant' }, // New Plant
  { position: [5, 1.5, 25], size: [0.5, 1, 0.5], color: '#FBC02D', name: 'Lamp' }, // New Lamp (on table)
  
  // Bedroom
  { position: [3, 0.75, -3], size: [3, 0.1, 1.5], color: '#5D4037', name: 'Desk' }, 
  { position: [-3, 0.5, -3], size: [3, 1, 4], color: '#1E88E5', name: 'Bed' },
  { position: [0, 0.1, 0], size: [4, 0.05, 6], color: '#795548', name: 'Rug' },
  { position: [-4.9, 2.5, 0], size: [0.1, 1.5, 1], color: '#fff', name: 'Poster' }, // New Poster

  // Books (on desk)
  { position: [3.5, 0.9, -3.2], size: [0.2, 0.4, 0.3], color: '#D32F2F', name: 'Book' },
  { position: [3.6, 0.85, -2.8], size: [0.3, 0.1, 0.4], color: '#1976D2', name: 'Book' }, // Flat book
  { position: [2.5, 0.9, -3], size: [0.2, 0.4, 0.3], color: '#388E3C', name: 'Book' },
  
  // Kitchen
  { position: [20, 1, 20], size: [4, 2, 8], color: '#CFD8DC', name: 'Counter' },
  { position: [20, 2, 30], size: [2, 4, 2], color: '#eee', name: 'Fridge' },
  { position: [15, 0.75, 25], size: [3, 1.5, 3], color: '#8D6E63', name: 'KitchenTable' },
  { position: [15, 1.7, 25], size: [0.8, 0.4, 0.8], color: '#fff', name: 'Cake' }, // Yoshi Cake
  { position: [20, 1.1, 22], size: [1.5, 0.1, 1.5], color: '#212121', name: 'Stove' },
  { position: [15, 0.5, 23], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },
  { position: [15, 0.5, 27], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },
  { position: [13, 0.5, 25], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },
  { position: [20, 1.5, 20], size: [1, 0.5, 0.5], color: '#333', name: 'Radio' }, // New Radio

  // Bathroom
  { position: [-13, 0.5, 7], size: [2, 1, 2], color: '#fff', name: 'Toilet' },
  { position: [-13, 1, 13], size: [2, 0.1, 3], color: '#fff', name: 'BathCounter' },
  { position: [-13, 1.2, 13], size: [1, 0.2, 1], color: '#eee', name: 'Sink' }, // New Sink
  { position: [-18, 1.5, 7], size: [0.1, 2, 1.5], color: '#E0F7FA', name: 'Mirror' }, 
  { position: [-18, 1, 13], size: [3, 2, 3], color: '#B2EBF2', name: 'Shower' },
  { position: [-12, 0.8, 7], size: [0.3, 0.3, 0.3], color: '#fff', name: 'ToiletPaper' }, // New TP
  { position: [-13, 3.8, 10], size: [0, 0, 0], color: '#fff', name: 'CeilingLight' }, // Bathroom Light

  // Hiding Spots (Visual representation only, logic handled in Player/House)
  { position: [-3, 0.2, -3], size: [2.5, 0.4, 3.5], color: '#000', name: 'UnderBed' }, // Hiding Spot
  { position: [20, 0.5, 30], size: [1.8, 3.8, 1.8], color: '#000', name: 'InsideFridge' }, // Joke/Hiding Spot? No, maybe Cabinet
  { position: [20, 0.5, 18], size: [3, 1.8, 2], color: '#5D4037', name: 'Cabinet' }, // Hiding Spot

  // Storage Room
  { position: [34, 1.5, 25], size: [1, 3, 6], color: '#607D8B', name: 'MetalShelf' },
  { position: [34, 3.1, 25], size: [0.8, 0.4, 0.4], color: '#D32F2F', name: 'Toolbox' }, 

  // Master Bedroom
  { position: [-35, 0.5, 10], size: [4, 1, 6], color: '#3E2723', name: 'MasterBed' },
  { position: [-40, 1.5, 5], size: [1, 3, 2], color: '#5D4037', name: 'Wardrobe' },
  { position: [-30, 0.5, 18], size: [2, 1, 1], color: '#5D4037', name: 'Nightstand' },
  { position: [-35, 3.8, 10], size: [0, 0, 0], color: '#fff', name: 'CeilingLight' }, // Master Bedroom Light
  // Safe (Moved to Master Bedroom)
  { position: [-40, 1, 15], size: [1.5, 1.5, 1.5], color: '#333', name: 'Safe' },

  // Garage
  { position: [45, 1, 15], size: [4, 2, 6], color: '#ef5350', name: 'Car' },
  { position: [50, 1.5, 24], size: [2, 3, 1], color: '#607D8B', name: 'ToolRack' },

  // --- NEW ROOMS FURNITURE ---
  
  // Guest Room (x=5 to 15, z=0 to 15)
  { position: [10, 0.5, 5], size: [3, 1, 5], color: '#8E24AA', name: 'GuestBed' },
  { position: [13, 0.5, 2], size: [2, 1, 1], color: '#5D4037', name: 'Nightstand' },
  { position: [10, 3.8, 7.5], size: [0, 0, 0], color: '#fff', name: 'CeilingLight' },

  // Dining Room (x=15 to 35, z=0 to 15)
  { position: [25, 0.75, 7.5], size: [8, 0.1, 4], color: '#3E2723', name: 'DiningTable' },
  { position: [22, 0.5, 7.5], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },
  { position: [28, 0.5, 7.5], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },
  { position: [25, 0.5, 5], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },
  { position: [25, 0.5, 10], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },
  { position: [32, 1, 3], size: [4, 2, 2], color: '#000', name: 'Piano' },
  { position: [25, 3.8, 7.5], size: [0, 0, 0], color: '#fff', name: 'CeilingLight' },

  // Study (x=-25 to -15, z=0 to 15)
  { position: [-20, 0.75, 5], size: [4, 0.1, 2], color: '#3E2723', name: 'StudyDesk' },
  { position: [-20, 0.5, 7], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },
  { position: [-23, 1.5, 2], size: [1, 3, 4], color: '#3E2723', name: 'Bookshelf' },
  { position: [-17, 1.5, 2], size: [1, 3, 4], color: '#3E2723', name: 'Bookshelf' },
  { position: [-20, 3.8, 7.5], size: [0, 0, 0], color: '#fff', name: 'CeilingLight' },

  // Master Bathroom (New)
  { position: [-53, 0.5, 2], size: [2, 1, 2], color: '#fff', name: 'Toilet' },
  { position: [-53, 1, 5], size: [2, 0.1, 3], color: '#fff', name: 'BathCounter' },
  { position: [-53, 1.2, 5], size: [1, 0.2, 1], color: '#eee', name: 'Sink' },
  { position: [-53, 1, 8], size: [2, 2, 2], color: '#5D4037', name: 'LockedCabinet' }, // Locked Cabinet
  { position: [-52.5, 0.05, 5], size: [4, 0.1, 6], color: '#004D40', name: 'Rug' }, // Bath Rug
  { position: [-54, 0, 1], size: [0, 0, 0], color: '#fff', name: 'Plant' }, // Bath Plant
  { position: [-50, 2, 0.1], size: [0, 0, 0], color: '#fff', name: 'Poster' }, // Bath Poster

  // Outside
  { position: [30, 1.5, 40], size: [3, 3, 3], color: '#795548', name: 'Shed' }, 
  { position: [-20, 1, 40], size: [1, 2, 1], color: '#8D6E63', name: 'TreeTrunk' },
  { position: [-20, 3, 40], size: [3, 3, 3], color: '#2E7D32', name: 'TreeLeaves' },
  { position: [15, 1, 45], size: [1, 2, 1], color: '#8D6E63', name: 'TreeTrunk' },
  { position: [15, 3, 45], size: [3, 3, 3], color: '#2E7D32', name: 'TreeLeaves' },
  { position: [-35, 1, 42], size: [1, 2, 1], color: '#8D6E63', name: 'TreeTrunk' },
  { position: [-35, 3, 42], size: [3, 3, 3], color: '#2E7D32', name: 'TreeLeaves' },
  { position: [40, 1, 38], size: [1, 2, 1], color: '#8D6E63', name: 'TreeTrunk' },
  { position: [40, 3, 38], size: [3, 3, 3], color: '#2E7D32', name: 'TreeLeaves' },
  
  // Bushes
  { position: [-10, 0.5, 38], size: [1.5, 1, 1.5], color: '#4CAF50', name: 'Bush' },
  { position: [10, 0.5, 38], size: [1.5, 1, 1.5], color: '#4CAF50', name: 'Bush' },
  { position: [-25, 0.5, 45], size: [2, 1.2, 2], color: '#4CAF50', name: 'Bush' },
  { position: [25, 0.5, 42], size: [1.8, 1, 1.8], color: '#4CAF50', name: 'Bush' },

  // Path
  { position: [0, 0.05, 42.5], size: [3, 0.1, 15], color: '#9E9E9E', name: 'Path' },

  { position: [-35, 0.2, 10], size: [3.5, 0.4, 5.5], color: '#000', name: 'UnderMasterBed' }, // Hiding Spot
  
  // New Yard Items
  { position: [-20, 0.75, 45], size: [2, 1.5, 3], color: '#795548', name: 'DogHouse' },
  { position: [10, 0.75, 45], size: [2.5, 1.5, 2.5], color: '#2E7D32', name: 'BigBush' }, // Hiding Spot
];

// --- 2ND FLOOR DATA (Y=20) ---
const H2 = 6.0;
const T2 = 1.0;
const Y2 = 20 + H2/2; // Center Y of walls

export const WALLS_2ND_FLOOR: Wall[] = []; // Unused, we use FINAL below

export const WALLS_2ND_FLOOR_FINAL: Wall[] = [
    // --- COMPUTER ROOM (End of Hallway) ---
    // x = -5 to 5, z = -30 to -20
    { position: [0, Y2, -30 - T2/2], size: [10 + 2*T2, H2, T2] }, // Back Wall
    { position: [-5 - T2/2, Y2, -25], size: [10, H2, T2], rotation: [0, Math.PI / 2, 0] }, // Left Wall
    { position: [5 + T2/2, Y2, -25], size: [10, H2, T2], rotation: [0, Math.PI / 2, 0] }, // Right Wall
    // Front is open to Hallway at z=-20

    // --- HALLWAY ---
    // x = -5 to 5, z = -20 to 30 (Extended back to -20)
    // { position: [0, Y2, -20 - T2/2], size: [10 + 2*T2, H2, T2] }, // Back End (z=-20) REMOVED to open to Computer Room
    { position: [0, Y2, 30 + T2/2], size: [10 + 2*T2, H2, T2] }, // Front End (z=30)

    // Left Hallway Wall (x=-5)
    // Segments:
    // 1. z=-20 to -10 (Library Door?) -> Let's say Door at z=-15
    // 2. z=-10 to 8 (Kid Room Wall)
    // 3. z=8 to 12 (Kid Room Door)
    // 4. z=12 to 30 (Front)
    
    // Let's simplify: Open Archways for new rooms too.
    // Left Wall:
    { position: [-5 - T2/2, Y2, -17.5], size: [5, H2, T2], rotation: [0, Math.PI / 2, 0] }, // z=-20 to -15
    { position: [-5 - T2/2, 20 + 5, -12.5], size: [5, 2, T2], rotation: [0, Math.PI / 2, 0] }, // Header Library Door (z=-15 to -10)
    { position: [-5 - T2/2, Y2, -1], size: [18, H2, T2], rotation: [0, Math.PI / 2, 0] }, // z=-10 to 8
    { position: [-5 - T2/2, 20 + 5, 10], size: [4, 2, T2], rotation: [0, Math.PI / 2, 0] }, // Header Kid Door (z=8 to 12)
    { position: [-5 - T2/2, Y2, 21], size: [18, H2, T2], rotation: [0, Math.PI / 2, 0] }, // z=12 to 30

    // Right Hallway Wall (x=5)
    // Segments similar to Left
    { position: [5 + T2/2, Y2, -17.5], size: [5, H2, T2], rotation: [0, Math.PI / 2, 0] }, // z=-20 to -15
    { position: [5 + T2/2, 20 + 5, -12.5], size: [5, 2, T2], rotation: [0, Math.PI / 2, 0] }, // Header Bath Door (z=-15 to -10)
    { position: [5 + T2/2, Y2, -1], size: [18, H2, T2], rotation: [0, Math.PI / 2, 0] }, // z=-10 to 8
    { position: [5 + T2/2, 20 + 5, 10], size: [4, 2, T2], rotation: [0, Math.PI / 2, 0] }, // Header Game Door (z=8 to 12)
    { position: [5 + T2/2, Y2, 21], size: [18, H2, T2], rotation: [0, Math.PI / 2, 0] }, // z=12 to 30

    // --- KID ROOM (Left Front) ---
    // x = -25 to -5, z = 0 to 20
    { position: [-15, Y2, 0 - T2/2], size: [20, H2, T2] }, // Back (Shared with Library Front?) No, Library is -20 to 0.
    // Wait, Library is z=-20 to -10? Or -20 to 0?
    // Let's make Library z=-20 to 0.
    // So Kid Room Back Wall at z=0 is shared with Library Front Wall.
    // We only need one wall there.
    { position: [-15, Y2, 0], size: [20, H2, T2] }, // Divider Wall (Kid/Library)
    { position: [-25 - T2/2, Y2, 10], size: [20, H2, T2], rotation: [0, Math.PI / 2, 0] }, // Left
    { position: [-15, Y2, 20 + T2/2], size: [20, H2, T2] }, // Front

    // --- GAME ROOM (Right Front) ---
    // x = 5 to 25, z = 0 to 20
    { position: [15, Y2, 0], size: [20, H2, T2] }, // Divider Wall (Game/Bath)
    { position: [25 + T2/2, Y2, 10], size: [20, H2, T2], rotation: [0, Math.PI / 2, 0] }, // Right
    { position: [15, Y2, 20 + T2/2], size: [20, H2, T2] }, // Front

    // --- LIBRARY (Left Back) ---
    // x = -25 to -5, z = -20 to 0
    { position: [-15, Y2, -20 - T2/2], size: [20, H2, T2] }, // Back
    { position: [-25 - T2/2, Y2, -10], size: [20, H2, T2], rotation: [0, Math.PI / 2, 0] }, // Left
    // Front is Divider Wall at z=0 (Already defined)
    // Right is Hallway Left Wall (Already defined)

    // --- UPPER BATH (Right Back) ---
    // x = 5 to 25, z = -20 to 0
    { position: [15, Y2, -20 - T2/2], size: [20, H2, T2] }, // Back
    { position: [25 + T2/2, Y2, -10], size: [20, H2, T2], rotation: [0, Math.PI / 2, 0] }, // Right
    // Front is Divider Wall at z=0 (Already defined)
    // Left is Hallway Right Wall (Already defined)
];

export const FURNITURE_2ND_FLOOR = [
    // Kid Room
    { position: [-20, 20.5, 5], size: [4, 1, 6], color: '#1E88E5', name: 'KidBed' },
    { position: [-10, 20.5, 5], size: [3, 1, 3], color: '#FFEB3B', name: 'ToyBox' },
    { position: [-20, 20.1, 15], size: [6, 0.1, 6], color: '#FF5722', name: 'PlayRug' },
    { position: [-15, 20.5, 18], size: [2, 1, 2], color: '#8D6E63', name: 'SmallTable' },
    
    // Game Room
    { position: [20, 20.5, 5], size: [6, 1, 3], color: '#4CAF50', name: 'PoolTable' },
    { position: [10, 20.5, 15], size: [3, 2, 1], color: '#212121', name: 'ArcadeMachine' },
    { position: [15, 20.5, 15], size: [3, 2, 1], color: '#212121', name: 'ArcadeMachine' },
    { position: [20, 20.5, 18], size: [4, 1, 2], color: '#3E2723', name: 'Couch' },
    
    // Library
    { position: [-24, 20.5, -10], size: [1, 5, 10], color: '#5D4037', name: 'Bookshelf' },
    { position: [-15, 20.5, -10], size: [4, 1, 4], color: '#5D4037', name: 'LibraryTable' },
    { position: [-15, 20.1, -10], size: [6, 0.1, 6], color: '#3E2723', name: 'Rug' },
    { position: [-24, 21.5, -10], size: [1.2, 1.2, 1.2], color: '#333', name: 'LibrarySafe' }, // New Safe

    // Upper Bath
    { position: [23, 20.5, -15], size: [2, 1, 3], color: '#FFFFFF', name: 'Bathtub' },
    { position: [23, 20.5, -5], size: [1, 1, 1], color: '#FFFFFF', name: 'Toilet' },
    { position: [10, 20.5, -10], size: [1, 2, 2], color: '#BDBDBD', name: 'Mirror' },

    // Hallway
    { position: [0, 20.1, 0], size: [4, 0.1, 4], color: '#00BCD4', name: 'TeleportPad2' }, // Visual only

    // Computer Room
    { position: [0, 20.5, -28], size: [6, 1, 3], color: '#333', name: 'ComputerDesk' },
    { position: [0, 21.5, -28], size: [2, 1.5, 0.1], color: '#000', name: 'GoomOSComputer' }, // Screen
    { position: [0, 20.5, -26], size: [1, 1, 1], color: '#5D4037', name: 'Chair' },

    // Basement (Moved to Y=50 to avoid Y<0 issues)
    { position: [0, 49.5, 0], size: [20, 1, 20], color: '#333', name: 'BasementFloor' }, // Floor
    { position: [0, 55, 10], size: [20, 10, 1], color: '#222', name: 'BasementWallBack' },
    { position: [0, 55, -10], size: [20, 10, 1], color: '#222', name: 'BasementWallFront' },
    { position: [10, 55, 0], size: [1, 10, 20], color: '#222', name: 'BasementWallRight' },
    { position: [-10, 55, 0], size: [1, 10, 20], color: '#222', name: 'BasementWallLeft' },
    { position: [0, 51, 0], size: [2, 4, 0.5], color: '#5D4037', name: 'BasementLadder' }, // Ladder to exit
    { position: [5, 51, 5], size: [2, 2, 2], color: '#444', name: 'BasementBox1' },
    { position: [-5, 51, -5], size: [3, 1.5, 3], color: '#444', name: 'BasementBox2' },
    { position: [8, 51, -8], size: [1, 3, 1], color: '#555', name: 'BasementPipe' },
    { position: [-30, 0.1, 12], size: [2, 0.1, 2], color: '#3E2723', name: 'Trapdoor' }, // Trapdoor in Master Bedroom
];

export const ITEMS = [
    { position: [-40, 1, 15], name: 'Storage Key', type: 'key' }, // Inside Safe (Master Bedroom)
    { position: [-53, 1, 8], name: 'Flashlight', type: 'tool' }, // Moved to Cabinet (Master Bath)
    { position: [-4.5, 0.5, 12], name: 'House Key', type: 'key' }, // Inside Vent (Hallway Left)
    // Screwdriver removed from floor (now in Toolbox)
    // Gate Key removed from Shed (now in Library Safe)
    
    // New Items
    { position: [13, 1.1, 2], name: 'Study Key', type: 'key' }, // On Guest Room Nightstand
    { position: [-20, 0.85, 5], name: 'Safe Code', type: 'paper' }, // On Study Desk
    { position: [25, 0.85, 7.5], name: 'Battery', type: 'item' }, // On Dining Table
    { position: [-13, 1.3, 13], name: 'Energy Drink', type: 'consumable' }, // On Bathroom Sink
    { position: [-20, 0.85, 5.5], name: 'Shed Key', type: 'key' }, // Moved to Study Desk
    { position: [-24, 0.85, 18], name: 'Secret Note', type: 'paper' }, // Inside Study Room
    
    // 2nd Floor Items
    { position: [-10, 21, 5], name: 'Cabinet Key', type: 'key' }, // Moved to Kid Room (On ToyBox)
    { position: [-15, 21, 18], name: 'Toy Car', type: 'item' }, // Kid Room Table
    { position: [23, 21, -5], name: 'Arcade Coin', type: 'item' }, // Upper Bath Toilet
    { position: [30, 2, 40], name: 'Crowbar', type: 'tool' }, // In Shed (Replaces Gate Key)
];
