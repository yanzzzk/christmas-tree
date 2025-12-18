import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ParticleSystem, OrnamentBalls, GemOrnaments, TetrahedronSpiral } from './ParticleSystem';
import { PhotoCards } from './PhotoCards';
import { TreeStar } from './TreeStar';
import { TreeState } from '@/types/christmas';

interface SceneContentProps {
  state: TreeState;
  photos: string[];
  focusedPhotoIndex: number | null;
  orbitRotation: { x: number; y: number };
  handPosition: { x: number; y: number } | null;
}

function CameraController({ 
  state, 
  orbitRotation,
  handPosition,
}: { 
  state: TreeState;
  orbitRotation: { x: number; y: number };
  handPosition: { x: number; y: number } | null;
}) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const positionRef = useRef(new THREE.Vector3(0, 2, 12));
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    // Base camera distance
    const baseDistance = state === 'tree' ? 12 : 18;
    
    // Calculate target position based on hand or orbit
    let targetX = 0;
    let targetY = 2;
    
    if (handPosition && state === 'galaxy') {
      targetX = (handPosition.x - 0.5) * 20;
      targetY = (0.5 - handPosition.y) * 10 + 2;
    } else {
      targetX = Math.sin(orbitRotation.y) * baseDistance;
      targetY = Math.sin(orbitRotation.x) * 5 + 2;
    }
    
    const targetZ = Math.cos(orbitRotation.y) * baseDistance;
    
    // Frame-rate independent smooth camera movement using exponential decay
    const smoothFactor = 1 - Math.exp(-4 * delta); // ~4 is the speed factor
    
    positionRef.current.x += (targetX - positionRef.current.x) * smoothFactor;
    positionRef.current.y += (targetY - positionRef.current.y) * smoothFactor;
    positionRef.current.z += (targetZ - positionRef.current.z) * smoothFactor;
    
    camera.position.copy(positionRef.current);
    camera.lookAt(targetRef.current);
  });

  return null;
}

function SceneContent({ 
  state, 
  photos, 
  focusedPhotoIndex,
  orbitRotation,
  handPosition,
}: SceneContentProps) {
  return (
    <>
      <CameraController 
        state={state} 
        orbitRotation={orbitRotation}
        handPosition={handPosition}
      />
      
      {/* 
        Remove Environment component entirely - it loads HDR from raw.githack.com which is blocked in China.
        Use enhanced lighting instead for reflections.
      */}
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.25} />
      
      {/* Main spotlight - no shadows for performance */}
      <spotLight 
        position={[0, 12, 5]} 
        angle={0.5}
        penumbra={0.8}
        intensity={2}
        color="#fff8e8"
      />
      
      {/* Single secondary light */}
      <pointLight position={[0, -2, 0]} intensity={1.2} color="#ff6633" distance={12} />
      
      {/* Background stars - reduced count */}
      <Stars 
        radius={100} 
        depth={50} 
        count={1500} 
        factor={4} 
        saturation={0.5} 
        fade 
        speed={0.3}
      />
      
      {/* Main particle system - reduced count */}
      <ParticleSystem state={state} particleCount={2500} />
      
      {/* Colorful ornament balls */}
      <OrnamentBalls state={state} />
      
      {/* Gem ornaments */}
      <GemOrnaments state={state} />
      
      {/* Tetrahedron spiral ribbon */}
      <TetrahedronSpiral state={state} />
      
      {/* Photo cards */}
      <PhotoCards 
        state={state} 
        photos={photos}
        focusedIndex={focusedPhotoIndex}
      />
      
      {/* Tree star topper */}
      <TreeStar state={state} />
      
      {/* Post-processing - lighter bloom */}
      <EffectComposer multisampling={0}>
        <Bloom 
          luminanceThreshold={0.9}
          luminanceSmoothing={0.3}
          intensity={1.0}
        />
      </EffectComposer>
    </>
  );
}

interface ChristmasSceneProps {
  state: TreeState;
  photos: string[];
  focusedPhotoIndex: number | null;
  orbitRotation: { x: number; y: number };
  handPosition: { x: number; y: number } | null;
  onReady?: () => void;
}

export function ChristmasScene({ 
  state, 
  photos, 
  focusedPhotoIndex,
  orbitRotation,
  handPosition,
  onReady,
}: ChristmasSceneProps) {
  // Call onReady after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      onReady?.();
    }, 500);
    return () => clearTimeout(timer);
  }, [onReady]);
  return (
    <Canvas
      camera={{ position: [0, 2, 12], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ 
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #1a0a28 50%, #0a1628 100%)' }}
    >
      <color attach="background" args={['#0a1628']} />
      <fog attach="fog" args={['#0a1628', 15, 35]} />
      
      <SceneContent 
        state={state}
        photos={photos}
        focusedPhotoIndex={focusedPhotoIndex}
        orbitRotation={orbitRotation}
        handPosition={handPosition}
      />
    </Canvas>
  );
}
