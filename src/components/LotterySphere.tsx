"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { User } from "@/types";

interface LotterySphereProps {
  users: User[];
  isSpinning: boolean;
  isStopping: boolean;
  winner: User | null;
  onSpinComplete?: () => void;
}

// Maximum names to display
const MAX_VISIBLE_NAMES = 400;

// Sphere radius - EXTRA LARGE perfect circle
const SPHERE_RADIUS = 145;

// Fibonacci sphere algorithm for even distribution on sphere surface
function fibonacciSphere(samples: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  
  if (samples === 1) {
    return [[0, 0, radius]];
  }
  
  const phi = Math.PI * (Math.sqrt(5) - 1);

  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY * radius;
    const z = Math.sin(theta) * radiusAtY * radius;
    const yPos = y * radius;

    points.push([x, yPos, z]);
  }

  return points;
}

// HTML-based name tag for reliable Chinese support
function NameTag({ 
  user, 
  position, 
  isWinner, 
  showWinner,
}: { 
  user: User; 
  position: [number, number, number]; 
  isWinner: boolean; 
  showWinner: boolean;
}) {
  const isHidden = showWinner && !isWinner;
  
  return (
    <Html
      position={position}
      center
      distanceFactor={8}
      style={{
        transition: "all 0.3s ease",
        opacity: isHidden ? 0.1 : 1,
        pointerEvents: "none",
        userSelect: "none",
      }}
      zIndexRange={[0, 0]}
    >
      <div
        style={{
          padding: isWinner && showWinner ? "32px 64px" : "18px 42px",
          borderRadius: "48px",
          whiteSpace: "nowrap",
          fontWeight: "900",
          fontSize: isWinner && showWinner ? "120px" : "56px",
          letterSpacing: "4px",
          background: isWinner && showWinner 
            ? "linear-gradient(135deg, #f0ff00 0%, #ff2d95 100%)"
            : "rgba(255, 255, 255, 0.15)",
          color: isWinner && showWinner ? "#000" : "#fff",
          border: isWinner && showWinner 
            ? "3px solid #f0ff00"
            : "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: isWinner && showWinner 
            ? "0 0 50px rgba(240, 255, 0, 0.9)"
            : "0 2px 8px rgba(0,0,0,0.3)",
          transform: isWinner && showWinner ? "scale(2.2)" : "scale(1)",
          transition: "all 0.3s ease",
          textShadow: isWinner && showWinner ? "none" : "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {user.name}
      </div>
    </Html>
  );
}

// Particle dots for users beyond MAX_VISIBLE_NAMES
function ParticleDots({ positions, color }: { positions: [number, number, number][]; color: string }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const posArray = new Float32Array(positions.length * 3);
    positions.forEach((pos, i) => {
      posArray[i * 3] = pos[0];
      posArray[i * 3 + 1] = pos[1];
      posArray[i * 3 + 2] = pos[2];
    });
    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    return geo;
  }, [positions]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.3}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// The rotating sphere group
function SphereGroup({
  users,
  isSpinning,
  isStopping,
  winner,
  onSpinComplete,
}: LotterySphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const hasCompletedRef = useRef(false);

  // Select which users to display as text vs dots
  const { visibleUsers, dotPositions, allPositions } = useMemo(() => {
    const all = fibonacciSphere(users.length, SPHERE_RADIUS);
    
    let visible: { user: User; position: [number, number, number] }[] = [];
    let dots: [number, number, number][] = [];
    
    if (users.length <= MAX_VISIBLE_NAMES) {
      visible = users.map((u, i) => ({ user: u, position: all[i] }));
      dots = [];
    } else {
      const step = users.length / MAX_VISIBLE_NAMES;
      const selectedIndices = new Set<number>();
      
      for (let i = 0; i < MAX_VISIBLE_NAMES; i++) {
        selectedIndices.add(Math.floor(i * step));
      }
      
      if (winner) {
        const winnerIdx = users.findIndex(u => u.id === winner.id);
        if (winnerIdx !== -1) {
          selectedIndices.add(winnerIdx);
        }
      }
      
      users.forEach((user, idx) => {
        if (selectedIndices.has(idx)) {
          visible.push({ user, position: all[idx] });
        } else {
          dots.push(all[idx]);
        }
      });
    }
    
    return { 
      visibleUsers: visible,
      dotPositions: dots,
      allPositions: all
    };
  }, [users, winner]);

  // Calculate target rotation to bring winner to front
  useEffect(() => {
    if (isStopping && winner && groupRef.current) {
      const winnerIndex = users.findIndex((u) => u.id === winner.id);
      if (winnerIndex !== -1) {
        const [x, y, z] = allPositions[winnerIndex];
        const targetY = Math.atan2(x, z);
        const targetX = -Math.asin(y / SPHERE_RADIUS) * 0.5;
        targetRotationRef.current = { x: targetX, y: targetY };
        hasCompletedRef.current = false;
      }
    }
  }, [isStopping, winner, users, allPositions]);

  // Reset when starting new spin
  useEffect(() => {
    if (isSpinning) {
      targetRotationRef.current = null;
      hasCompletedRef.current = false;
      velocityRef.current = { x: 0.01, y: 0.08 };
    }
  }, [isSpinning]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const dt = Math.min(delta, 0.05);

    if (isSpinning && !isStopping) {
      velocityRef.current.x = Math.min(velocityRef.current.x + dt * 0.04, 0.025);
      velocityRef.current.y = Math.min(velocityRef.current.y + dt * 0.12, 0.2);
      
      groupRef.current.rotation.x += velocityRef.current.x;
      groupRef.current.rotation.y += velocityRef.current.y;
    } else if (isStopping && targetRotationRef.current) {
      const target = targetRotationRef.current;
      const current = groupRef.current.rotation;
      
      const dampingFactor = 0.15;
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const normalizedDy = ((dy + Math.PI) % (2 * Math.PI)) - Math.PI;
      
      current.x += dx * dampingFactor;
      current.y += normalizedDy * dampingFactor;
      
      if (Math.abs(dx) < 0.02 && Math.abs(normalizedDy) < 0.02 && !hasCompletedRef.current) {
        current.x = target.x;
        current.y = target.y;
        hasCompletedRef.current = true;
        onSpinComplete?.();
      }
    } else if (!isSpinning && !isStopping && !winner) {
      groupRef.current.rotation.y += dt * 0.08;
    }
  });

  const showWinner = !isSpinning && !isStopping && winner !== null;

  return (
    <group ref={groupRef}>
      {/* Render visible names */}
      {visibleUsers.map(({ user, position }) => (
        <NameTag
          key={user.id}
          user={user}
          position={position}
          isWinner={winner?.id === user.id}
          showWinner={showWinner}
        />
      ))}
      
      {/* Render remaining users as particle dots */}
      {dotPositions.length > 0 && (
        <ParticleDots positions={dotPositions} color="#4fc3f7" />
      )}
      
      {/* Central glow sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial
          color={isSpinning ? "#ff2d95" : "#00f0ff"}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[SPHERE_RADIUS * 0.92, 32, 32]} />
        <meshBasicMaterial
          color="#4fc3f7"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

// Main exported component
export default function LotterySphere(props: LotterySphereProps) {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/50">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 80], fov: 75 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop="always"
      >
        <ambientLight intensity={0.8} />
        
        <SphereGroup {...props} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={!props.isSpinning && !props.isStopping && !props.winner}
          autoRotate={false}
          enableDamping
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  );
}
