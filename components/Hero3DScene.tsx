"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Abstract building component
function Building({ position, scale, color }: { position: [number, number, number], scale: [number, number, number], color: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
    </mesh>
  );
}

function CityBlock() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      // Gentle rotation
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.5 + state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Base platform */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.5, 32]} />
        <meshStandardMaterial color="#F9FAFB" roughness={0.8} />
      </mesh>
      
      {/* Buildings */}
      <Building position={[-1, 1, -1]} scale={[1, 2.5, 1]} color="#0A3D2A" />
      <Building position={[1, 0.5, -1.5]} scale={[1.2, 1.5, 1.2]} color="#0A3D2A" />
      <Building position={[1.5, 1.5, 0.5]} scale={[0.8, 3.5, 0.8]} color="#166A48" />
      <Building position={[-0.5, 0.25, 1.5]} scale={[1.5, 1, 1.5]} color="#E25822" />
      <Building position={[0.2, 2, 0.2]} scale={[1, 4.5, 1]} color="#0A3D2A" />
      
      {/* Abstract floating elements */}
      <Float speed={2} rotationIntensity={2} floatIntensity={2} position={[-2, 3, 1]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#E25822" wireframe />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2} position={[2, 2.5, -0.5]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#E25822" />
        </mesh>
      </Float>
    </group>
  );
}

export default function Hero3DScene() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <Canvas shadows camera={{ position: [5, 4, 6], fov: 45 }}>
        <color attach="background" args={['transparent']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <CityBlock />
        </Float>

        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        
        <Environment preset="city" />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
}
