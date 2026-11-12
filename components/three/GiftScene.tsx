'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const RIBBON = '#D8B98D';

function SatinMaterial() {
  return <meshPhysicalMaterial color={RIBBON} metalness={0.42} roughness={0.27} clearcoat={1} clearcoatRoughness={0.16} sheen={1} sheenColor="#FFF0D8" sheenRoughness={0.22} />;
}

function SatinBand({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return <RoundedBox args={size} radius={0.012} smoothness={4} position={position} castShadow receiveShadow><SatinMaterial /></RoundedBox>;
}

function SatinPetal({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation: [number, number, number]; scale?: number }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(-0.12, 0.28, -0.42, 0.58, -0.68, 0.42);
    s.bezierCurveTo(-0.98, 0.22, -0.78, -0.18, -0.42, -0.22);
    s.bezierCurveTo(-0.18, -0.24, -0.06, -0.1, 0, 0);
    return s;
  }, []);
  return <mesh position={position} rotation={rotation} scale={scale} castShadow>
    <extrudeGeometry args={[shape, { depth: 0.045, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.018, bevelThickness: 0.012, curveSegments: 28 }]} />
    <SatinMaterial />
  </mesh>;
}

function SatinTail({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.15, 0.34);
    s.bezierCurveTo(-0.2, 0.05, -0.19, -0.38, -0.16, -0.68);
    s.lineTo(0.12, -0.79);
    s.bezierCurveTo(0.1, -0.46, 0.2, -0.04, 0.15, 0.34);
    s.closePath();
    return s;
  }, []);
  return <mesh position={position} rotation={rotation} castShadow>
    <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.012, bevelThickness: 0.01, curveSegments: 20 }]} />
    <SatinMaterial />
  </mesh>;
}

function GiftSculpture({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const intro = useRef<THREE.Group>(null);

  useEffect(() => {
    if (reducedMotion || !intro.current) return;
    gsap.fromTo(intro.current.scale, { x: 0.88, y: 0.88, z: 0.88 }, { x: 1, y: 1, z: 1, duration: 1.8, ease: 'power3.out' });
  }, [reducedMotion]);

  useFrame((state) => {
    if (!group.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = -0.12 + Math.sin(t * 0.62) * 0.045;
    group.current.rotation.y = -0.22 + Math.sin(t * 0.28) * 0.045;
    group.current.rotation.z = Math.sin(t * 0.34) * 0.01;
  });

  return <group ref={group} position={[0, -0.12, 0]}>
    <group ref={intro} scale={0.9}>
      <RoundedBox args={[2.3, 1.48, 1.72]} radius={0.045} smoothness={6} position={[0, -0.12, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#421A28" roughness={0.29} metalness={0.035} clearcoat={0.9} clearcoatRoughness={0.2} sheen={0.48} sheenColor="#9D5365" sheenRoughness={0.32} />
      </RoundedBox>
      <RoundedBox args={[2.46, 0.2, 1.88]} radius={0.04} smoothness={6} position={[0, 0.81, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#4A202E" roughness={0.27} metalness={0.035} clearcoat={0.95} clearcoatRoughness={0.18} sheen={0.48} sheenColor="#A65B6C" />
      </RoundedBox>
      <RoundedBox args={[2.34, 0.022, 1.76]} radius={0.012} smoothness={4} position={[0, 0.697, 0]} receiveShadow>
        <meshStandardMaterial color="#241018" roughness={0.56} />
      </RoundedBox>

      {/* Two continuous satin wraps cross on the lid and continue over all four sides. */}
      <SatinBand position={[0, 0.923, 0]} size={[0.34, 0.034, 1.88]} />
      <SatinBand position={[0, 0.944, 0]} size={[2.46, 0.034, 0.34]} />
      <SatinBand position={[0, -0.12, 0.875]} size={[0.34, 1.48, 0.034]} />
      <SatinBand position={[0, 0.81, 0.965]} size={[0.34, 0.2, 0.034]} />
      <SatinBand position={[0, -0.12, -0.875]} size={[0.34, 1.48, 0.034]} />
      <SatinBand position={[0, 0.81, -0.965]} size={[0.34, 0.2, 0.034]} />
      <SatinBand position={[1.165, -0.12, 0]} size={[0.034, 1.48, 0.34]} />
      <SatinBand position={[1.235, 0.81, 0]} size={[0.034, 0.2, 0.34]} />
      <SatinBand position={[-1.165, -0.12, 0]} size={[0.034, 1.48, 0.34]} />
      <SatinBand position={[-1.235, 0.81, 0]} size={[0.034, 0.2, 0.34]} />

      {/* Six broad, varied satin petals in three balanced pairs. */}
      <group position={[0, 1.085, 0.12]}>
        <SatinPetal position={[-0.2, 0.02, 0]} rotation={[0.02, 0, -0.32]} scale={0.83} />
        <SatinPetal position={[0.2, 0.02, 0]} rotation={[-0.02, 0, Math.PI + 0.32]} scale={0.83} />
        <SatinPetal position={[-0.34, 0.02, -0.12]} rotation={[0.18, -0.2, -0.82]} scale={0.7} />
        <SatinPetal position={[0.34, 0.02, -0.12]} rotation={[-0.18, 0.2, Math.PI + 0.82]} scale={0.7} />
        <SatinPetal position={[-0.17, 0.08, -0.2]} rotation={[0.28, 0.12, -1.35]} scale={0.58} />
        <SatinPetal position={[0.17, 0.08, -0.2]} rotation={[-0.28, -0.12, Math.PI + 1.35]} scale={0.58} />
        <mesh position={[0, 0.045, 0.12]} castShadow>
          <sphereGeometry args={[0.145, 32, 24]} />
          <meshPhysicalMaterial color="#E4C79D" metalness={0.38} roughness={0.22} clearcoat={1} clearcoatRoughness={0.14} sheen={1} sheenColor="#FFF1D8" />
        </mesh>
      </group>
      <SatinTail position={[-0.36, 0.55, 0.89]} rotation={[0, 0, -0.08]} />
      <SatinTail position={[0.36, 0.55, 0.89]} rotation={[0, 0, 0.08]} />
    </group>
  </group>;
}

function StudioEnvironment() {
  return <Environment resolution={256}>
    <group>
      <Lightformer form="rect" intensity={4.2} color="#FFF0D9" scale={[7, 4, 1]} position={[-1, 5, 1]} />
      <Lightformer form="rect" intensity={3.1} color="#E8BD8C" scale={[3, 5, 1]} position={[-4, 1, 2]} rotation={[0, Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={2.5} color="#C9D1DE" scale={[3, 5, 1]} position={[4, 1, -2]} rotation={[0, -Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={2.1} color="#D9B98F" scale={[5, 3, 1]} position={[0, 3, -5]} rotation={[0, Math.PI, 0]} />
      <Lightformer form="rect" intensity={1.1} color="#FFFFFF" scale={[2, 2, 1]} position={[0, -2, 3]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  </Environment>;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <color attach="background" args={['#110E0D']} />
    <fog attach="fog" args={['#110E0D', 8, 18]} />
    <StudioEnvironment />
    <ambientLight intensity={0.2} color="#E8D4B8" />
    <spotLight position={[-4.5, 6, 5]} angle={0.48} penumbra={1} intensity={34} color="#FFE8CC" castShadow shadow-mapSize={[1024, 1024]} />
    <spotLight position={[0.5, 3.5, -4.5]} angle={0.62} penumbra={1} intensity={15} color="#D9B98F" />
    <GiftSculpture reducedMotion={reducedMotion} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.285, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshPhysicalMaterial color="#100D0D" roughness={0.24} metalness={0.28} clearcoat={0.34} clearcoatRoughness={0.3} />
    </mesh>
    <ContactShadows position={[0, -1.27, 0]} opacity={0.58} scale={5.8} blur={3.2} far={3.2} resolution={512} color="#080607" />
    {!reducedMotion && <EffectComposer multisampling={4}>
      <Bloom intensity={0.075} luminanceThreshold={0.96} luminanceSmoothing={0.16} />
      <Vignette eskil={false} offset={0.24} darkness={0.4} />
    </EffectComposer>}
  </>;
}

export default function GiftScene({ active }: { active: boolean }) {
  const [quality, setQuality] = useState({ dpr: 1.5, reducedMotion: false, compact: false });
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 700px)');
    const update = () => setQuality({
      dpr: Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5)),
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

  return <Canvas shadows frameloop={active ? 'always' : 'never'} dpr={quality.dpr} camera={{ position: quality.compact ? [0, 0.15, 7.6] : [0, 0.25, 6.5], fov: quality.compact ? 31 : 34 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => {
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }}>
    <Suspense fallback={null}><Scene reducedMotion={quality.reducedMotion} /></Suspense>
  </Canvas>;
}
