"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Model } from "./FloaterModel";
import ThreeJSErrorBoundary from "./ThreeJSErrorBoundary";

// Enhanced FloaterModel with animations
function AnimatedFloaterModel(props) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      // Add subtle bobbing rotation
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      <Model
        scale={[0.35, 0.35, 0.35]}
        position={[0, -0.7, 0]}
        rotation={[0.1, 0, 0]}
        {...props}
      />
    </group>
  );
}

// Error boundary for GLTF loading
class GLTFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("GLTF Model Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackFloater {...this.props} />;
    }
    return this.props.children;
  }
}

// Wrapper component with error boundary
function SafeFloaterModel(props) {
  return (
    <React.Suspense fallback={<FallbackFloater {...props} />}>
      <GLTFErrorBoundary {...props}>
        <AnimatedFloaterModel {...props} />
      </GLTFErrorBoundary>
    </React.Suspense>
  );
}

// Fallback component if model fails to load
const FallbackFloater = React.forwardRef((props, ref) => {
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={ref} {...props}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Sensors */}
      <mesh position={[0.4, 0.3, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh position={[0.4, 0, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh position={[0.4, -0.3, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
});

// Ocean waves component
function OceanWaves() {
  const wavesRef = useRef();

  useFrame((state) => {
    if (wavesRef.current) {
      wavesRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      wavesRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.05 - 0.8;
    }
  });

  return (
    <group ref={wavesRef}>
      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[3, 3, 32, 32]} />
        <meshStandardMaterial
          color="#0ea5e9"
          opacity={0.6}
          transparent
          wireframe={false}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

// Status indicator lights
function StatusLights({ status = "active" }) {
  const lightsRef = useRef();

  useFrame((state) => {
    if (lightsRef.current) {
      lightsRef.current.children.forEach((light, index) => {
        const intensity =
          Math.sin(state.clock.elapsedTime * 2 + index) * 0.5 + 0.5;
        light.intensity = intensity * 2;
      });
    }
  });

  const lightColors = {
    active: ["#22c55e", "#3b82f6", "#ef4444"],
    warning: ["#f59e0b", "#f59e0b", "#ef4444"],
    offline: ["#64748b", "#64748b", "#64748b"],
  };

  const colors = lightColors[status] || lightColors.active;

  return (
    <group ref={lightsRef} position={[0.6, 0.3, 0]}>
      {colors.map((color, index) => (
        <pointLight
          key={index}
          position={[0, index * 0.2 - 0.2, 0]}
          color={color}
          intensity={1}
          distance={2}
        />
      ))}
    </group>
  );
}

// Main 3D Floater Scene Component
export default function FloaterModel3D({ status = "active", className = "" }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <ThreeJSErrorBoundary>
        <Canvas
          camera={{ position: [4.5, 3.5, 4.5], fov: 45 }}
          style={{ width: "100%", height: "100%" }}
          shadows
          gl={{
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            antialias: true,
            alpha: false,
          }}
          onCreated={(state) => {
            state.gl.toneMapping = 1; // THREE.ACESFilmicToneMapping
          }}
        >
          {/* Enhanced Lighting setup for better model visibility */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-3, 4, 3]} intensity={0.4} color="#00d4ff" />
          <pointLight position={[3, 2, -3]} intensity={0.3} color="#ffffff" />
          {/* Environment for better reflections */}
          <Environment preset="sunset" background={false} /> {/* 3D Models */}
          <SafeFloaterModel status={status} />
          <StatusLights status={status} />
          {/* Controls for interaction */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={0.6}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.15}
            maxDistance={9}
            minDistance={3.5}
            dampingFactor={0.05}
            enableDamping={true}
          />
        </Canvas>
      </ThreeJSErrorBoundary>
    </div>
  );
}
