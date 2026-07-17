"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function FloatingLogo() {
  const group = useRef<THREE.Group>(null);
  const target = new THREE.Vector3();

  useFrame((state) => {
    if (group.current) {
      // state.pointer contains the normalized mouse coordinates (-1 to +1)
      // We map these to 3D space coordinates
      target.set(state.pointer.x * 4, state.pointer.y * 4, 0);
      
      // Smoothly interpolate current position to target position
      group.current.position.lerp(target, 0.05);
      
      // Add a slight tilt based on cursor position, plus a constant slow rotation
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * 0.5, 0.1);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.5 + state.clock.elapsedTime * 0.5, 0.1);
    }
  });

  return (
    <group ref={group}>
      {/* Base of the building/house */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1.2, 1]} />
        <meshStandardMaterial color="#E25822" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[0.9, 0.8, 4]} />
        <meshStandardMaterial color="#0A3D2A" roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function CursorFollowing3D() {
  const [domBody, setDomBody] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setDomBody(document.body);
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScale(0.5);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10 }}>
      {domBody && (
        <Canvas 
          eventSource={domBody} 
          eventPrefix="client"
          camera={{ position: [0, 0, 8], fov: 40 }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group scale={[scale, scale, scale]}>
              <FloatingLogo />
            </group>
          </Float>
          <Environment preset="city" />
        </Canvas>
      )}
    </div>
  );
}
