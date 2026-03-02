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
  { position: [5 + T/2, H/2, 10], size: [10, H, T], rotation: [0, Math.PI / 2, 0] }, 
  { position: [-5 - T/2, H/2, 7], size: [4, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [-5 - T/2, 5, 10], size: [2, 2, T], rotation: [0, Math.PI / 2, 0] },
  { position: [-5 - T/2, H/2, 13], size: [4, H, T], rotation: [0, Math.PI / 2, 0] },

  // --- BATHROOM ---
  { position: [-10, H/2, 5 - T/2], size: [10 + T, H, T] },
  { position: [-15 - T/2, H/2, 10], size: [10, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [-10, H/2, 15 + T/2], size: [10 + T, H, T] },

  // --- LIVING ROOM / KITCHEN ---
  { position: [-15, H/2, 15 - T/2], size: [20, H, T] },
  { position: [15, H/2, 15 - T/2], size: [20, H, T] },
  { position: [-25 - T/2, H/2, 25], size: [20, H, T], rotation: [0, Math.PI / 2, 0] },
  
  // Right Wall (Split for Storage Room)
  { position: [25 + T/2, H/2, 19], size: [8, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [25 + T/2, H/2, 31], size: [8, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [25 + T/2, 5, 25], size: [4, 2, T], rotation: [0, Math.PI / 2, 0] },

  // Front Wall (Exit)
  { position: [-16, H/2, 35 + T/2], size: [28, H, T] },
  { position: [13.5, H/2, 35 + T/2], size: [23, H, T] },
  { position: [0, 5, 35 + T/2], size: [4, 2, T] }, 

  // Kitchen Divider
  { position: [10, H/2, 25], size: [10, H, T], rotation: [0, Math.PI / 2, 0] },

  // --- STORAGE ROOM ---
  { position: [35 + T/2, H/2, 25], size: [10, H, T], rotation: [0, Math.PI / 2, 0] },
  { position: [30, H/2, 20 - T/2], size: [10 + T, H, T] },
  { position: [30, H/2, 30 + T/2], size: [10 + T, H, T] },
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
  // TVStand removed
  { position: [-24.8, 2, 25], size: [0.2, 1.5, 3], color: '#000', name: 'TV' }, // Moved closer to wall
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
  { position: [20, 1.1, 22], size: [1.5, 0.1, 1.5], color: '#212121', name: 'Stove' },

  // Storage Room
  { position: [34, 1.5, 25], size: [1, 3, 6], color: '#607D8B', name: 'MetalShelf' },
  { position: [34, 3.1, 25], size: [0.8, 0.4, 0.4], color: '#D32F2F', name: 'Toolbox' }, // On Shelf

  // Safe (Hidden in Bathroom?)
  { position: [-14, 1, 6], size: [1.5, 1.5, 1.5], color: '#333', name: 'Safe' },
];

export const ITEMS = [
    { position: [-14, 1, 6], name: 'Storage Key', type: 'key' }, // Inside Safe
    { position: [3, 0.85, -3], name: 'Flashlight', type: 'tool' }, // On Desk
    { position: [4.5, 0.5, 10], name: 'House Key', type: 'key' }, // Inside Vent
    { position: [34, 3.2, 25], name: 'Screwdriver', type: 'tool' }, // Inside Toolbox (y adjusted)
];
