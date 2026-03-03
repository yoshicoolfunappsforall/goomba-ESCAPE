import * as THREE from 'three';
import { Grid } from '@react-three/drei';
import { WALLS, FURNITURE, ITEMS } from '../../data/level';
import { useGameStore } from '../../store/gameStore';

export function House() {
  const safeOpen = useGameStore((state) => state.safeOpen);
  const ventOpen = useGameStore((state) => state.ventOpen);
  const storageOpen = useGameStore((state) => state.storageOpen);
  const inventory = useGameStore((state) => state.inventory);
  
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <Grid position={[0, 0.01, 0]} args={[100, 100]} cellSize={1} cellThickness={1} cellColor="#333" sectionSize={5} sectionThickness={1.5} sectionColor="#444" fadeDistance={30} infiniteGrid />

      {/* Outside Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 60]} receiveShadow>
        <planeGeometry args={[120, 50]} />
        <meshStandardMaterial color="#2E7D32" roughness={1} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Walls */}
      {WALLS.map((wall, index) => (
        <mesh
          key={`wall-${index}`}
          position={new THREE.Vector3(...wall.position)}
          rotation={new THREE.Euler(...(wall.rotation || [0, 0, 0]))}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[wall.size[0], wall.size[1], wall.size[2]]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
      ))}

      {/* Furniture */}
      {FURNITURE.map((item, index) => {
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
                        <mesh position={[0, 0.2, item.size[2]/2]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.3]} rotation={[0, 0, Math.PI/2]} />
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
                <mesh key={`furn-${index}`} position={new THREE.Vector3(...item.position)} castShadow>
                    <cylinderGeometry args={[0.1, 0.1, 0.15]} rotation={[0, 0, Math.PI/2]} />
                    <meshStandardMaterial color="white" />
                </mesh>
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
                    <mesh position={[0.11, 0, 0]}>
                        <planeGeometry args={[item.size[1] * 0.9, item.size[2] * 0.9]} rotation={[0, Math.PI/2, 0]} />
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
              // Only show if toolbox is open
              const toolboxOpen = useGameStore.getState().toolboxOpen;
              if (!toolboxOpen) return null;

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

          return null;
      })}
      
      {/* Vent Grate */}
      {!ventOpen && (
        <group position={[4.95, 0.5, 10]} rotation={[0, -Math.PI/2, 0]}>
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
      <group position={[-5, 2, 9]} rotation={[0, useGameStore((state) => state.bathroomDoorOpen) ? -2 : 0, 0]}>
           {/* Door Mesh (Width 2, Height 4) - Rotated 90 deg relative to group if needed, or group rotated */}
           {/* The wall is along Z axis. So door should be along Z. */}
           {/* Group is at corner. Door extends along Z. */}
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

      {/* Master Bedroom Door */}
      {/* Gap at x=-25, z=10 to 15. Width 5. */}
      {/* Pivot at z=10. */}
      <group position={[-25, 2, 10]} rotation={[0, useGameStore((state) => state.masterBedroomDoorOpen) ? 2 : 0, 0]}>
           {/* Door Mesh (Width 5, Height 4) */}
           <mesh position={[0, 0, 2.5]} castShadow receiveShadow>
               <boxGeometry args={[0.2, 4, 5]} />
               <meshStandardMaterial color="#3E2723" />
           </mesh>
           {/* Handle */}
           <mesh position={[0.2, 0, 4.5]}>
               <sphereGeometry args={[0.1]} />
               <meshStandardMaterial color="gold" />
           </mesh>
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
