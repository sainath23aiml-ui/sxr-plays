import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';

const LiquidShape = ({ position, color, speed, distort, radius }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.004;
      meshRef.current.rotation.y += 0.004;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        distort={distort}
        speed={speed}
        roughness={0}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const MusicVisualizer3D = () => {
  return (
    <div className="w-full h-full bg-[#0a0a0a]">
      <Canvas 
        camera={{ position: [0, 0, 25], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <pointLight position={[20, 20, 20]} intensity={3} color="#1DB954" />
          <pointLight position={[-20, -20, -20]} intensity={2} color="#3b82f6" />
          
          <LiquidShape 
            position={[0, 0, 0]} 
            color="#1ed760" 
            speed={2} 
            distort={0.4} 
            radius={8} 
          />
          
          <LiquidShape 
            position={[15, 8, -10]} 
            color="#1DB954" 
            speed={3} 
            distort={0.5} 
            radius={4} 
          />
          
          <LiquidShape 
            position={[-12, -8, -5]} 
            color="#3b82f6" 
            speed={4} 
            distort={0.6} 
            radius={3} 
          />

          <fog attach="fog" args={['#0a0a0a', 15, 60]} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default MusicVisualizer3D;
