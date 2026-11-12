'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

function SatinLoop({ position, rotation = [0, 0, 0], scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(-.12, .55, -.92, .72, -1.02, .2);
    s.bezierCurveTo(-1.12, -.28, -.48, -.5, 0, 0);
    s.bezierCurveTo(.48, .5, 1.12, .28, 1.02, -.2);
    s.bezierCurveTo(.92, -.72, .12, -.55, 0, 0);
    return s;
  }, []);
  return <mesh position={position} rotation={rotation} scale={scale} castShadow>
    <extrudeGeometry args={[shape, { depth: .035, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .018, bevelThickness: .018, curveSegments: 24 }]} />
    <meshPhysicalMaterial color="#D8B98D" metalness={.9} roughness={.3} clearcoat={1} clearcoatRoughness={.18} sheen={1} sheenColor="#FFF0D8" sheenRoughness={.24} />
  </mesh>;
}

function SatinTail({ position, rotation = [0, 0, 0], scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  return <mesh position={position} rotation={rotation} scale={scale} castShadow>
    <boxGeometry args={[.32, 1.22, .035, 1, 12, 1]} />
    <meshPhysicalMaterial color="#D8B98D" metalness={.9} roughness={.3} clearcoat={1} sheen={1} sheenColor="#FFF0D8" />
  </mesh>;
}

function GiftSculpture({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const intro = useRef<THREE.Group>(null);

  useEffect(() => {
    if (reducedMotion || !intro.current) return;
    gsap.fromTo(intro.current.scale, { x: .88, y: .88, z: .88 }, { x: 1, y: 1, z: 1, duration: 1.8, ease: 'power3.out' });
  }, [reducedMotion]);

  useFrame((state) => {
    if (!group.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = -.12 + Math.sin(t * .62) * .055;
    group.current.rotation.y = -.22 + Math.sin(t * .28) * .055;
    group.current.rotation.z = Math.sin(t * .34) * .012;
  });

  return <group ref={group} position={[0, -.12, 0]}>
    <group ref={intro} scale={.9}>
      <mesh position={[0, -.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 1.48, 1.72]} />
        <meshPhysicalMaterial color="#421A28" roughness={.25} metalness={.08} clearcoat={.85} clearcoatRoughness={.22} sheen={.42} sheenColor="#9D5365" sheenRoughness={.35} />
      </mesh>
      <mesh position={[0, -.12, .866]}>
        <boxGeometry args={[2.18, 1.34, .014]} />
        <meshPhysicalMaterial color="#4B202F" roughness={.28} clearcoat={.65} />
      </mesh>
      <mesh position={[0, .66, 0]} castShadow>
        <boxGeometry args={[2.44, .2, 1.86]} />
        <meshPhysicalMaterial color="#552332" roughness={.24} clearcoat={.9} clearcoatRoughness={.2} sheen={.5} />
      </mesh>
      <group position={[0, .81, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.48, .22, 1.9]} />
          <meshPhysicalMaterial color="#421A28" roughness={.25} clearcoat={.9} clearcoatRoughness={.2} sheen={.5} />
        </mesh>
        <mesh position={[0, -.115, 0]}>
          <boxGeometry args={[2.34, .022, 1.76]} />
          <meshStandardMaterial color="#C4A477" metalness={.92} roughness={.28} />
        </mesh>
      </group>
      <group position={[0, .08, .91]}>
        <mesh castShadow><boxGeometry args={[.34, 1.42, .04]} /><meshPhysicalMaterial color="#D8B98D" metalness={.9} roughness={.3} clearcoat={1} sheen={1} /></mesh>
      </group>
      <mesh position={[0, .72, 0]} castShadow>
        <boxGeometry args={[2.45, .055, .3]} />
        <meshPhysicalMaterial color="#D8B98D" metalness={.9} roughness={.3} clearcoat={1} sheen={1} />
      </mesh>
      <SatinTail position={[-.48, .02, .98]} rotation={[0, 0, -.18]} scale={.9} />
      <SatinTail position={[.48, .02, .98]} rotation={[0, 0, .18]} scale={.9} />
      <SatinLoop position={[-.24, 1.12, .12]} rotation={[0, 0, -.16]} scale={.55} />
      <SatinLoop position={[.24, 1.12, .08]} rotation={[0, 0, .16]} scale={.55} />
      <SatinLoop position={[-.18, 1.12, -.12]} rotation={[0, .35, -.48]} scale={.47} />
      <SatinLoop position={[.18, 1.12, -.12]} rotation={[0, -.35, .48]} scale={.47} />
      <mesh position={[0, 1.12, .2]} castShadow>
        <sphereGeometry args={[.16, 32, 24]} />
        <meshPhysicalMaterial color="#E1C397" metalness={.92} roughness={.24} clearcoat={1} />
      </mesh>
    </group>
  </group>;
}

function StudioEnvironment() {
  return <Environment resolution={256}>
    <group rotation={[0, 0, 0]}>
      <Lightformer form="rect" intensity={5} color="#FFF0D9" scale={[7, 4, 1]} position={[0, 5, 1]} />
      <Lightformer form="rect" intensity={3.5} color="#E8BD8C" scale={[3, 5, 1]} position={[-4, 1, 2]} rotation={[0, Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={4} color="#AFC4DC" scale={[3, 5, 1]} position={[4, 1, -2]} rotation={[0, -Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={1.5} color="#FFFFFF" scale={[2, 2, 1]} position={[0, -2, 3]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  </Environment>;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <color attach="background" args={['#110E0D']} />
    <fog attach="fog" args={['#110E0D', 8, 16]} />
    <StudioEnvironment />
    <ambientLight intensity={.22} color="#E8D4B8" />
    <spotLight position={[-4, 6, 5]} angle={.42} penumbra={.9} intensity={48} color="#FFE5C2" castShadow shadow-mapSize={[1024, 1024]} />
    <spotLight position={[4, 2, -3]} angle={.5} penumbra={.85} intensity={72} color="#C58C72" />
    <pointLight position={[0, 0, 3]} intensity={5} color="#D19B78" />
    <GiftSculpture reducedMotion={reducedMotion} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.28, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#17100F" roughness={.52} metalness={.22} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.265, 0]}>
      <planeGeometry args={[5, 5]} />
      <meshPhysicalMaterial color="#C4A477" transparent opacity={.07} metalness={.65} roughness={.28} />
    </mesh>
    <ContactShadows position={[0, -1.25, 0]} opacity={.52} scale={5.5} blur={2.8} far={3} resolution={512} />
    {!reducedMotion && <EffectComposer multisampling={4}>
      <Bloom intensity={.14} luminanceThreshold={.88} luminanceSmoothing={.22} />
      <Vignette eskil={false} offset={.24} darkness={.38} />
    </EffectComposer>}
  </>;
}

export default function GiftScene({ active }: { active: boolean }) {
  const [quality, setQuality] = useState({ dpr: 1.5, reducedMotion: false, compact: false });
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 700px)');
    const update = () => setQuality({
      dpr: compact.matches ? Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5)) : Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5)),
      reducedMotion: motion.matches,
      compact: compact.matches,
    });
    update();
    motion.addEventListener('change', update);
    compact.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      motion.removeEventListener('change', update);
      compact.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <Canvas shadows frameloop={active ? 'always' : 'never'} dpr={quality.dpr} camera={{ position: quality.compact ? [0, .15, 7.6] : [0, .25, 6.5], fov: quality.compact ? 31 : 34 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => {
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.12;
  }}>
    <Suspense fallback={null}><Scene reducedMotion={quality.reducedMotion} /></Suspense>
  </Canvas>;
}
