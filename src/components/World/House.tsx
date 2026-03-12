import * as THREE from 'three';
import { Grid, Text, Instances, Instance, Billboard, useTexture } from '@react-three/drei';
import { WALLS, FURNITURE, ITEMS, WALLS_2ND_FLOOR_FINAL, FURNITURE_2ND_FLOOR } from '../../data/level';
import { useGameStore } from '../../store/gameStore';
import { useShallow } from 'zustand/react/shallow';

function Cake({ position, size }: { position: number[], size: number[] }) {
  const texture = useTexture('https://i.ibb.co/Cd4v1Gp/il-fullxfull-4866776418-562x.avif');
  return (
    <group position={new THREE.Vector3(position[0], position[1], position[2])}>
        <Billboard>
            <mesh>
                <planeGeometry args={[size[0], size[0]]} />
                <meshBasicMaterial 
                    map={texture} 
                    transparent 
                    side={THREE.DoubleSide} 
                />
            </mesh>
        </Billboard>
    </group>
  );
}

useTexture.preload('https://i.ibb.co/Cd4v1Gp/il-fullxfull-4866776418-562x.avif');

export function House() {
  const { safeOpen, ventOpen, storageOpen, inventory, lowPerformance } = useGameStore(useShallow(state => ({
    safeOpen: state.safeOpen,
    ventOpen: state.ventOpen,
    storageOpen: state.storageOpen,
    inventory: state.inventory,
    lowPerformance: state.lowPerformance
  })));
  
  return (
    <group>
      {/* Base Ground (Grass) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2E7D32" roughness={1} />
      </mesh>

      {/* Interior Floors (Dark Grey) */}
      {/* Main Living Area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 17.5]} receiveShadow>
        <planeGeometry args={[50, 35]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      
      {/* Master Bedroom & Bath */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-40, 0.02, 10]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Garage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[45, 0.02, 15]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} /> {/* Slightly different floor for garage */}
      </mesh>

      {/* Storage Room */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, 0.02, 25]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* 2ND FLOOR FLOOR (Y=20) */}
      {/* Kid Room (-25 to -5, 0 to 20) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 20.02, 10]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#90CAF9" roughness={0.8} /> {/* Light Blue Floor */}
      </mesh>
      {/* Game Room (5 to 25, 0 to 20) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 20.02, 10]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#A5D6A7" roughness={0.8} /> {/* Light Green Floor */}
      </mesh>
      {/* Library (-25 to -5, -20 to 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 20.02, -10]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.8} /> {/* Brown Floor */}
      </mesh>
      {/* Upper Bath (5 to 25, -20 to 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 20.02, -10]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.5} /> {/* Tile Floor */}
      </mesh>
      {/* Hallway (-5 to 5, -20 to 30) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 20.02, 5]} receiveShadow>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial color="#EEEEEE" roughness={0.8} /> {/* White Floor */}
      </mesh>
      {/* Computer Room (-5 to 5, -30 to -20) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 20.02, -25]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#607D8B" roughness={0.8} /> {/* Blue-Grey Floor */}
      </mesh>

      {/* Basement Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -49.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#222" roughness={0.9} /> {/* Dark Floor */}
      </mesh>

      {/* Ceiling 1st Floor */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Ceiling 2nd Floor */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 24, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Walls 1st Floor */}
      <Instances limit={WALLS.length} castShadow={!lowPerformance} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        {WALLS.map((wall, index) => (
          <Instance
            key={`wall-${index}`}
            position={new THREE.Vector3(...wall.position)}
            rotation={new THREE.Euler(...(wall.rotation || [0, 0, 0]))}
            scale={new THREE.Vector3(...wall.size)}
          />
        ))}
      </Instances>

      {/* Walls 2nd Floor */}
      <Instances limit={WALLS_2ND_FLOOR_FINAL.length} castShadow={!lowPerformance} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#BBDEFB" roughness={0.9} /> {/* Slightly blue walls */}
        {WALLS_2ND_FLOOR_FINAL.map((wall, index) => (
          <Instance
            key={`wall2-${index}`}
            position={new THREE.Vector3(...wall.position)}
            rotation={new THREE.Euler(...(wall.rotation || [0, 0, 0]))}
            scale={new THREE.Vector3(...wall.size)}
          />
        ))}
      </Instances>

      {/* Teleport Pads */}
      {/* 1st Floor Pad */}
      <group position={[0, 0.1, 18]}>
          <mesh receiveShadow>
              <cylinderGeometry args={[1, 1, 0.1, 32]} />
              <meshStandardMaterial color="#00BCD4" emissive="#00BCD4" emissiveIntensity={0.5} />
          </mesh>
          <pointLight color="#00BCD4" distance={3} intensity={1} position={[0, 1, 0]} />
          <Text position={[0, 1.5, 0]} fontSize={0.3} color="#00BCD4" anchorX="center" anchorY="middle" rotation={[0, Math.PI, 0]}>
              To 2nd Floor
          </Text>
          <Text position={[0, 1.5, 0]} fontSize={0.3} color="#00BCD4" anchorX="center" anchorY="middle" rotation={[0, 0, 0]}>
              To 2nd Floor
          </Text>
      </group>

      {/* 2nd Floor Pad */}
      <group position={[0, 20.1, 0]}>
          <mesh receiveShadow>
              <cylinderGeometry args={[1, 1, 0.1, 32]} />
              <meshStandardMaterial color="#00BCD4" emissive="#00BCD4" emissiveIntensity={0.5} />
          </mesh>
          <pointLight color="#00BCD4" distance={3} intensity={1} position={[0, 1, 0]} />
          <Text position={[0, 1.5, 0]} fontSize={0.3} color="#00BCD4" anchorX="center" anchorY="middle" rotation={[0, Math.PI, 0]}>
              To 1st Floor
          </Text>
          <Text position={[0, 1.5, 0]} fontSize={0.3} color="#00BCD4" anchorX="center" anchorY="middle" rotation={[0, 0, 0]}>
              To 1st Floor
          </Text>
      </group>

      {/* Furniture */}
      {[...FURNITURE, ...FURNITURE_2ND_FLOOR].map((item, index) => {
        if (item.name === 'Desk') {
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    {/* Table Top */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[item.size[0], item.size[1], item.size[2]]} />
                        <meshStandardMaterial color={item.color} />
                    </mesh>
                    {/* Legs */}
                    <mesh position={[-1.2, -0.75/2 - 0.375, -0.5]} castShadow>
                        <boxGeometry args={[0.2, 0.75, 0.2]} />
                        <meshStandardMaterial color={item.color} />
                    </mesh>
                    <mesh position={[1.2, -0.75/2 - 0.375, -0.5]} castShadow>
                        <boxGeometry args={[0.2, 0.75, 0.2]} />
                        <meshStandardMaterial color={item.color} />
                    </mesh>
                    <mesh position={[-1.2, -0.75/2 - 0.375, 0.5]} castShadow>
                        <boxGeometry args={[0.2, 0.75, 0.2]} />
                        <meshStandardMaterial color={item.color} />
                    </mesh>
                    <mesh position={[1.2, -0.75/2 - 0.375, 0.5]} castShadow>
                        <boxGeometry args={[0.2, 0.75, 0.2]} />
                        <meshStandardMaterial color={item.color} />
                    </mesh>

                    {/* Laptop Model */}
                    <group position={[0, 0.1, 0]} rotation={[0, -0.2, 0]}>
                        {/* Base */}
                        <mesh position={[0, 0.02, 0.1]} castShadow>
                            <boxGeometry args={[0.8, 0.04, 0.5]} />
                            <meshStandardMaterial color="#333" roughness={0.5} />
                        </mesh>
                        {/* Screen */}
                        <mesh position={[0, 0.25, -0.15]} rotation={[-0.2, 0, 0]} castShadow>
                            <boxGeometry args={[0.8, 0.5, 0.04]} />
                            <meshStandardMaterial color="#333" roughness={0.5} />
                        </mesh>
                        {/* Screen Display */}
                        <mesh position={[0, 0.25, -0.13]} rotation={[-0.2, 0, 0]}>
                            <planeGeometry args={[0.7, 0.4]} />
                            <meshStandardMaterial color="#000" emissive="#222" />
                        </mesh>
                        {/* Keyboard Area */}
                        <mesh position={[0, 0.041, 0.15]} rotation={[-Math.PI/2, 0, 0]}>
                            <planeGeometry args={[0.7, 0.2]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>
                </group>
            );
        }

        if (item.name === 'Safe') {
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[item.size[0], item.size[1], item.size[2]]} />
                        <meshStandardMaterial color={item.color} metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Door */}
                    <mesh 
                        position={[0, 0, 0.76]} 
                        rotation={[0, safeOpen ? 2 : 0, 0]} 
                        castShadow
                    >
                        <boxGeometry args={[1.3, 1.3, 0.1]} />
                        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
                        {/* Handle */}
                        <mesh position={[0.4, 0, 0.1]}>
                             <cylinderGeometry args={[0.1, 0.1, 0.1]} />
                             <meshStandardMaterial color="silver" />
                        </mesh>
                    </mesh>
                </group>
            )
        }

        if (item.name === 'Toolbox') {
            const toolboxOpen = useGameStore.getState().toolboxOpen;
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    {/* Box */}
                    <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
                        <boxGeometry args={[item.size[0], 0.2, item.size[2]]} />
                        <meshStandardMaterial color={item.color} metalness={0.6} roughness={0.4} />
                    </mesh>
                    {/* Lid */}
                    <group position={[0, 0, -item.size[2]/2]} rotation={[toolboxOpen ? -2 : 0, 0, 0]}>
                        <mesh position={[0, 0.1, item.size[2]/2]} castShadow>
                            <boxGeometry args={[item.size[0], 0.2, item.size[2]]} />
                            <meshStandardMaterial color={item.color} metalness={0.6} roughness={0.4} />
                        </mesh>
                        {/* Handle */}
                        <mesh position={[0, 0.2, item.size[2]/2]} rotation={[0, 0, Math.PI/2]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.3]} />
                            <meshStandardMaterial color="#222" />
                        </mesh>
                    </group>
                </group>
            )
        }

        if (item.name === 'Plant') {
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    {/* Pot */}
                    <mesh castShadow position={[0, 0.4, 0]}>
                        <cylinderGeometry args={[0.4, 0.3, 0.8]} />
                        <meshStandardMaterial color="#8D6E63" />
                    </mesh>
                    {/* Plant */}
                    <mesh castShadow position={[0, 1, 0]}>
                        <dodecahedronGeometry args={[0.6]} />
                        <meshStandardMaterial color="#2E7D32" />
                    </mesh>
                </group>
            )
        }

        if (item.name === 'CeilingLight') {
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 0.1]} />
                        <meshStandardMaterial color="#eee" emissive="#fff" emissiveIntensity={0.5} />
                    </mesh>
                    <pointLight position={[0, -0.5, 0]} intensity={0.8} distance={15} color="#fff" decay={2} />
                </group>
            )
        }

        if (item.name === 'Lamp') {
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    {/* Base */}
                    <mesh castShadow position={[0, -0.4, 0]}>
                        <cylinderGeometry args={[0.1, 0.2, 0.2]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    {/* Pole */}
                    <mesh castShadow position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    {/* Shade */}
                    <mesh castShadow position={[0, 0.4, 0]}>
                        <coneGeometry args={[0.3, 0.4, 32, 1, true]} />
                        <meshStandardMaterial color="#FBC02D" side={THREE.DoubleSide} transparent opacity={0.9} />
                    </mesh>
                    <pointLight position={[0, 0.3, 0]} intensity={0.5} color="#FBC02D" distance={3} />
                </group>
            )
        }

        if (item.name === 'Poster') {
             return (
                <mesh key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    <boxGeometry args={[0.05, 1.5, 1]} />
                    <meshStandardMaterial color="#eee" />
                    {/* Art */}
                    <mesh position={[0.03, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                         <planeGeometry args={[0.9, 1.4]} />
                         <meshStandardMaterial color="#ff0000" />
                    </mesh>
                </mesh>
             )
        }

        if (item.name === 'Cake') {
            return <Cake key={`furn-${index}`} position={item.position} size={item.size} />
        }

        if (item.name === 'Book') {
             return (
                <mesh key={`furn-${index}`} position={new THREE.Vector3(...item.position)} castShadow>
                    <boxGeometry args={[item.size[0], item.size[1], item.size[2]]} />
                    <meshStandardMaterial color={item.color} />
                </mesh>
             )
        }

        if (item.name === 'Chair') {
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    {/* Seat */}
                    <mesh position={[0, 0.4, 0]} castShadow>
                        <boxGeometry args={[0.5, 0.1, 0.5]} />
                        <meshStandardMaterial color={item.color} />
                    </mesh>
                    {/* Back */}
                    <mesh position={[0, 0.9, -0.2]} castShadow>
                        <boxGeometry args={[0.5, 1, 0.1]} />
                        <meshStandardMaterial color={item.color} />
                    </mesh>
                    {/* Legs */}
                    <mesh position={[-0.2, 0.2, -0.2]} castShadow>
                        <boxGeometry args={[0.05, 0.4, 0.05]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[0.2, 0.2, -0.2]} castShadow>
                        <boxGeometry args={[0.05, 0.4, 0.05]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[-0.2, 0.2, 0.2]} castShadow>
                        <boxGeometry args={[0.05, 0.4, 0.05]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[0.2, 0.2, 0.2]} castShadow>
                        <boxGeometry args={[0.05, 0.4, 0.05]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            )
        }

        if (item.name === 'Radio') {
            const radioOn = useGameStore((state) => state.radioOn);
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    <mesh castShadow>
                        <boxGeometry args={[item.size[0], item.size[1], item.size[2]]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    {/* Speaker Mesh */}
                    <mesh position={[0.2, 0, 0.26]}>
                        <circleGeometry args={[0.15]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Light */}
                    <mesh position={[-0.3, 0.1, 0.26]}>
                        <circleGeometry args={[0.05]} />
                        <meshStandardMaterial color={radioOn ? "#0f0" : "#333"} emissive={radioOn ? "#0f0" : "#000"} />
                    </mesh>
                    {radioOn && <pointLight position={[0, 0, 0.5]} color="#0f0" distance={1} intensity={0.5} />}
                </group>
            )
        }

        if (item.name === 'Sink') {
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    <mesh castShadow>
                        <boxGeometry args={[item.size[0], item.size[1], item.size[2]]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    {/* Faucet */}
                    <mesh position={[0, 0.2, -0.3]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                        <meshStandardMaterial color="silver" />
                    </mesh>
                </group>
            )
        }

        if (item.name === 'ToiletPaper') {
             return (
                <mesh key={`furn-${index}`} position={new THREE.Vector3(...item.position)} rotation={[0, 0, Math.PI/2]} castShadow>
                    <cylinderGeometry args={[0.1, 0.1, 0.15]} />
                    <meshStandardMaterial color="white" />
                </mesh>
             )
        }

        if (item.name === 'LockedCabinet') {
            const cabinetOpen = useGameStore.getState().cabinetOpen;
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    {/* Cabinet Body (Back half solid) */}
                    <mesh position={[-0.5, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1, 2, 2]} />
                        <meshStandardMaterial color={item.color} />
                    </mesh>
                    {/* Door */}
                    <group position={[0.5, 0, 1]} rotation={[0, cabinetOpen ? 2 : 0, 0]}>
                        <mesh position={[0, 0, -1]} castShadow>
                            <boxGeometry args={[0.1, 2, 2]} />
                            <meshStandardMaterial color={item.color} />
                        </mesh>
                        {/* Handle */}
                        <mesh position={[0.1, 0, -1.8]}>
                            <sphereGeometry args={[0.1]} />
                            <meshStandardMaterial color="gold" />
                        </mesh>
                    </group>
                </group>
            )
        }

        if (item.name === 'Cabinet' || item.name === 'InsideFridge') {
             // Just a box for now, maybe openable later
             return (
                <mesh key={`furn-${index}`} position={new THREE.Vector3(...item.position)} castShadow receiveShadow>
                    <boxGeometry args={[item.size[0], item.size[1], item.size[2]]} />
                    <meshStandardMaterial color={item.color} />
                </mesh>
             )
        }

        if (item.name === 'UnderBed') {
            // Invisible trigger area or just dark space
            return null;
        }

        if (item.name === 'TV') {
            const tvOn = useGameStore((state) => state.tvOn);
            return (
                <group key={`furn-${index}`} position={new THREE.Vector3(...item.position)}>
                    <mesh castShadow>
                        <boxGeometry args={[item.size[0], item.size[1], item.size[2]]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                    {/* Screen */}
                    <mesh position={[0.11, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                        <planeGeometry args={[item.size[1] * 0.9, item.size[2] * 0.9]} />
                        <meshStandardMaterial color={tvOn ? "#fff" : "#111"} emissive={tvOn ? "#fff" : "#000"} emissiveIntensity={tvOn ? 0.5 : 0} />
                    </mesh>
                    {tvOn && <pointLight position={[0.5, 0, 0]} color="#fff" distance={5} intensity={1} />}
                </group>
            )
        }
        
        return (
            <mesh
            key={`furn-${index}`}
            position={new THREE.Vector3(...item.position)}
            castShadow
            receiveShadow
            >
            <boxGeometry args={[item.size[0], item.size[1], item.size[2]]} />
            <meshStandardMaterial color={item.color} />
            </mesh>
        );
      })}

      {/* Items */}
      {ITEMS.map((item, index) => {
          if (inventory.includes(item.name)) return null;
          
          if (item.name === 'House Key') {
              // Only show if vent is open (or maybe visible through grate?)
              // Let's make it visible but inside
              return (
                  <group key={`item-${index}`} position={new THREE.Vector3(...item.position)}>
                      <mesh castShadow position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
                          <meshStandardMaterial color="gold" metalness={0.8} roughness={0.1} />
                      </mesh>
                      <mesh castShadow position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
                          <torusGeometry args={[0.1, 0.02, 8, 16]} />
                          <meshStandardMaterial color="gold" metalness={0.8} roughness={0.1} />
                      </mesh>
                      <pointLight intensity={1} color="gold" distance={2} />
                  </group>
              )
          }

          if (item.name === 'Screwdriver') {
              // Only show if cabinet is open
              const cabinetOpen = useGameStore.getState().cabinetOpen;
              if (!cabinetOpen) return null;

              return (
                  <group key={`item-${index}`} position={new THREE.Vector3(...item.position)}>
                      {/* Handle */}
                      <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                          <cylinderGeometry args={[0.08, 0.08, 0.2]} />
                          <meshStandardMaterial color="orange" />
                      </mesh>
                      {/* Shaft */}
                      <mesh castShadow position={[0, 0, -0.2]} rotation={[Math.PI/2, 0, 0]}>
                          <cylinderGeometry args={[0.02, 0.02, 0.2]} />
                          <meshStandardMaterial color="silver" metalness={0.8} />
                      </mesh>
                  </group>
              )
          }

          if (item.name === 'Storage Key') {
              if (!safeOpen) return null;
              return (
                  <group key={`item-${index}`} position={new THREE.Vector3(...item.position)}>
                      <mesh castShadow position={[0, 0, 0.5]} rotation={[0, 0, Math.PI/2]}>
                          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
                          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.1} />
                      </mesh>
                      <mesh castShadow position={[0, 0.1, 0.5]} rotation={[0, 0, 0]}>
                          <torusGeometry args={[0.1, 0.02, 8, 16]} />
                          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.1} />
                      </mesh>
                      <pointLight intensity={1} color="silver" distance={2} />
                  </group>
              )
          }

          if (item.name === 'Flashlight') {
             return (
                <group key={`item-${index}`} position={new THREE.Vector3(...item.position)}>
                    <mesh castShadow rotation={[Math.PI/2, 0, 0]}>
                        <cylinderGeometry args={[0.05, 0.08, 0.3]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <pointLight intensity={0.5} color="white" distance={1} />
                </group>
             )
          }

          if (item.name === 'Study Key') {
              return (
                  <group key={`item-${index}`} position={new THREE.Vector3(...item.position)}>
                      <mesh castShadow position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
                          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.1} />
                      </mesh>
                      <mesh castShadow position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
                          <torusGeometry args={[0.1, 0.02, 8, 16]} />
                          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.1} />
                      </mesh>
                      <pointLight intensity={1} color="silver" distance={2} />
                  </group>
              )
          }

          if (item.name === 'Safe Code') {
              return (
                  <mesh key={`item-${index}`} position={new THREE.Vector3(...item.position)} rotation={[-Math.PI/2, 0, 0]} castShadow>
                      <planeGeometry args={[0.3, 0.4]} />
                      <meshStandardMaterial color="#fff" />
                      {/* Text simulation */}
                      <mesh position={[0, 0, 0.01]}>
                          <planeGeometry args={[0.2, 0.02]} />
                          <meshStandardMaterial color="#000" />
                      </mesh>
                      <mesh position={[0, 0.1, 0.01]}>
                          <planeGeometry args={[0.2, 0.02]} />
                          <meshStandardMaterial color="#000" />
                      </mesh>
                  </mesh>
              )
          }

          if (item.name === 'Battery') {
              return (
                  <group key={`item-${index}`} position={new THREE.Vector3(...item.position)}>
                      <mesh castShadow rotation={[Math.PI/2, 0, 0]}>
                          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                          <meshStandardMaterial color="#000" />
                      </mesh>
                      <mesh position={[0, 0, 0.11]} rotation={[Math.PI/2, 0, 0]}>
                          <cylinderGeometry args={[0.02, 0.02, 0.02]} />
                          <meshStandardMaterial color="#silver" />
                      </mesh>
                      <pointLight intensity={0.5} color="green" distance={1} />
                  </group>
              )
          }

          if (item.name === 'Energy Drink') {
              return (
                  <group key={`item-${index}`} position={new THREE.Vector3(...item.position)}>
                      <mesh castShadow position={[0, 0.1, 0]}>
                          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                          <meshStandardMaterial color="blue" emissive="cyan" emissiveIntensity={0.5} />
                      </mesh>
                      <pointLight intensity={0.5} color="cyan" distance={1} />
                  </group>
              )
          }

          return null;
      })}
      
      {/* Vent Grate */}
      {!ventOpen && (
        <group position={[-4.95, 0.5, 12]} rotation={[0, Math.PI/2, 0]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1, 1, 0.05]} />
                <meshStandardMaterial color="#555" metalness={0.5} roughness={0.7} />
            </mesh>
            {/* Slats */}
            <mesh position={[0, 0.2, 0.03]}>
                <boxGeometry args={[0.9, 0.1, 0.02]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
                <boxGeometry args={[0.9, 0.1, 0.02]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0, -0.2, 0.03]}>
                <boxGeometry args={[0.9, 0.1, 0.02]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
      )}

      {/* Storage Room Door */}
      <group position={[25, 2, 25]} rotation={[0, storageOpen ? -2 : 0, 0]}>
          {/* Door Frame/Mesh */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 4, 3.8]} />
              <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* Handle */}
          <mesh position={[-0.2, 0, 1.5]}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color="silver" />
          </mesh>
      </group>

      {/* Bedroom Door */}
      {/* Gap at x=1, z=5. Width 4. */}
      {/* Pivot should be at one side. Let's say left side (x=-1). */}
      <group position={[-1, 2, 5]} rotation={[0, useGameStore((state) => state.bedroomDoorOpen) ? -2 : 0, 0]}>
          {/* Door Mesh (Width 4, Height 4) */}
          {/* Offset center by width/2 = 2 */}
          <mesh position={[2, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[4, 4, 0.2]} />
              <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* Handle */}
          <mesh position={[3.5, 0, 0.2]}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color="silver" />
          </mesh>
      </group>

      {/* Bathroom Door */}
      {/* Gap at x=-5, z=10. Width 2. */}
      {/* Pivot at z=9? */}
      <group position={[-5, 2, 9]}>
           {/* Frame */}
           <mesh position={[0, 0, -0.1]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 4, 0.2]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[0, 0, 2.1]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 4, 0.2]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[0, 2.1, 1]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 0.2, 2.4]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           {/* Sign */}
           <Text
                position={[0.2, 2.5, 1]}
                rotation={[0, Math.PI/2, 0]}
                fontSize={0.4}
                color="black"
                anchorX="center"
                anchorY="middle"
           >
                BATHROOM
           </Text>

           {/* Door Group */}
           <group rotation={[0, useGameStore((state) => state.bathroomDoorOpen) ? -2 : 0, 0]}>
               {/* Door Mesh (Width 2, Height 4) */}
               <mesh position={[0, 0, 1]} castShadow receiveShadow>
                   <boxGeometry args={[0.2, 4, 2]} />
                   <meshStandardMaterial color="#5D4037" />
               </mesh>
               {/* Handle */}
               <mesh position={[0.2, 0, 1.8]}>
                   <sphereGeometry args={[0.1]} />
                   <meshStandardMaterial color="silver" />
               </mesh>
           </group>
      </group>

      {/* Master Bedroom Door */}
      {/* Gap at x=-25.5, z=16 to 19. Width 3. */}
      {/* Pivot at z=16. */}
      <group position={[-25.5, 2, 16]}>
           {/* Frame */}
           <mesh position={[0, 0, -0.1]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 4, 0.2]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[0, 0, 3.1]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 4, 0.2]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[0, 2.1, 1.5]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 0.2, 3.4]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           {/* Sign */}
           <Text
                position={[0.2, 2.5, 1.5]}
                rotation={[0, Math.PI/2, 0]}
                fontSize={0.4}
                color="black"
                anchorX="center"
                anchorY="middle"
           >
                MASTER BEDROOM
           </Text>

           {/* Door Group */}
           <group rotation={[0, useGameStore((state) => state.masterBedroomDoorOpen) ? 2 : 0, 0]}>
               {/* Door Mesh (Width 3, Height 4) */}
               <mesh position={[0, 0, 1.5]} castShadow receiveShadow>
                   <boxGeometry args={[0.2, 4, 3]} />
                   <meshStandardMaterial color="#3E2723" />
               </mesh>
               {/* Handle */}
               <mesh position={[0.2, 0, 2.5]}>
                   <sphereGeometry args={[0.1]} />
                   <meshStandardMaterial color="gold" />
               </mesh>
           </group>
      </group>

      {/* Guest Room Door */}
      {/* Gap at x=5, z=8 to 11. Width 3. */}
      {/* Pivot at z=8. */}
      <group position={[5, 2, 8]}>
           {/* Frame */}
           <mesh position={[0, 0, -0.1]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 4, 0.2]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[0, 0, 3.1]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 4, 0.2]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[0, 2.1, 1.5]} castShadow receiveShadow>
               <boxGeometry args={[0.3, 0.2, 3.4]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
            {/* Sign */}
           <Text
                position={[-0.2, 2.5, 1.5]}
                rotation={[0, -Math.PI/2, 0]}
                fontSize={0.4}
                color="black"
                anchorX="center"
                anchorY="middle"
           >
                GUEST ROOM
           </Text>

           {/* Door Group */}
           <group rotation={[0, useGameStore((state) => state.guestDoorOpen) ? 2 : 0, 0]}>
               {/* Door Mesh (Width 3, Height 4) */}
               <mesh position={[0, 0, 1.5]} castShadow receiveShadow>
                   <boxGeometry args={[0.2, 4, 3]} />
                   <meshStandardMaterial color="#5D4037" />
               </mesh>
               {/* Handle */}
               <mesh position={[-0.2, 0, 2.5]}>
                   <sphereGeometry args={[0.1]} />
                   <meshStandardMaterial color="silver" />
               </mesh>
           </group>
      </group>

      {/* Dining Room Door */}
      {/* Gap at x=18 to 22. Width 4. */}
      {/* Pivot at x=18. */}
      <group position={[18, 2, 15]}>
           {/* Frame */}
           <mesh position={[-0.1, 0, 0]} castShadow receiveShadow>
               <boxGeometry args={[0.2, 4, 0.3]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[4.1, 0, 0]} castShadow receiveShadow>
               <boxGeometry args={[0.2, 4, 0.3]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[2, 2.1, 0]} castShadow receiveShadow>
               <boxGeometry args={[4.4, 0.2, 0.3]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>

           {/* Door Group */}
           <group rotation={[0, useGameStore((state) => state.diningDoorOpen) ? -2 : 0, 0]}>
               {/* Door Mesh (Width 4, Height 4) */}
               <mesh position={[2, 0, 0]} castShadow receiveShadow>
                   <boxGeometry args={[4, 4, 0.2]} />
                   <meshStandardMaterial color="#5D4037" />
               </mesh>
               {/* Handle */}
               <mesh position={[3.5, 0, 0.2]}>
                   <sphereGeometry args={[0.1]} />
                   <meshStandardMaterial color="silver" />
               </mesh>
           </group>
      </group>

      {/* Study Door */}
      {/* Gap at x=-22 to -18. Width 4. */}
      {/* Pivot at x=-18. */}
      <group position={[-18, 2, 15]}>
           {/* Frame */}
           <mesh position={[0.1, 0, 0]} castShadow receiveShadow>
               <boxGeometry args={[0.2, 4, 0.3]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[-4.1, 0, 0]} castShadow receiveShadow>
               <boxGeometry args={[0.2, 4, 0.3]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           <mesh position={[-2, 2.1, 0]} castShadow receiveShadow>
               <boxGeometry args={[4.4, 0.2, 0.3]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
            {/* Sign */}
           <Text
                position={[-2, 2.5, 0.2]}
                rotation={[0, 0, 0]}
                fontSize={0.4}
                color="black"
                anchorX="center"
                anchorY="middle"
           >
                STUDY
           </Text>

           {/* Door Group */}
           <group rotation={[0, useGameStore((state) => state.studyDoorOpen) ? 2 : 0, 0]}>
               {/* Door Mesh (Width 4, Height 4) */}
               <mesh position={[-2, 0, 0]} castShadow receiveShadow>
                   <boxGeometry args={[4, 4, 0.2]} />
                   <meshStandardMaterial color="#3E2723" />
               </mesh>
               {/* Handle */}
               <mesh position={[-3.5, 0, 0.2]}>
                   <sphereGeometry args={[0.1]} />
                   <meshStandardMaterial color="gold" />
               </mesh>
           </group>
      </group>

      {/* Exit Door */}
      <group position={[0, 2, 35]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[4, 4, 0.2]} />
              <meshStandardMaterial color="#4a0404" />
          </mesh>
          <mesh position={[1.5, 0, 0.2]}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color="gold" />
          </mesh>
      </group>
    </group>
  );
}
