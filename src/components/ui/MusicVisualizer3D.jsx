import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

const LiquidShape = ({ position, color, speed, distort, radius }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <MeshDistortMaterial
        color={color}
        distort={distort}
        speed={speed}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const MusicVisualizer3D = () => {
  return (
    <div className="w-full h-full" style={{ background: '#0a0a0a', position: 'relative', minHeight: '400px' }}>
      <Canvas 
        camera={{ position: [0, 0, 20], fov: 45 }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#00ff88" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
          
          <LiquidShape 
            position={[0, 0, 0]} 
            color="#00ff88" 
            speed={2} 
            distort={0.4} 
            radius={7} 
          />
          
          <LiquidShape 
            position={[12, 6, -5]} 
            color="#3b82f6" 
            speed={3} 
            distort={0.5} 
            radius={3} 
          />

          <fog attach="fog" args={['#0a0a0a', 10, 50]} />
        </Suspense>
      </Canvas>
      {/* Fallback to ensure something is visible if WebGL fails */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#00ff8811] to-black pointer-events-none -z-20" />
    </div>
  );
};

export default MusicVisualizer3D;
