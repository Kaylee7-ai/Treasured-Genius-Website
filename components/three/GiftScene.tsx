'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

function SatinLoop({ position, rotation = [0, 0, 0], scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(.5, .48, .02), new THREE.Vector3(1.03, .22, .03),
    new THREE.Vector3(.72, -.18, .04), new THREE.Vector3(.08, -.08, .02), new THREE.Vector3(0, 0, 0),
  ]), []);
  return <mesh position={position} rotation={rotation} scale={scale} castShadow>
    <tubeGeometry args={[curve, 96, .075, 12, false]} />
    <meshPhysicalMaterial color="#D7B88A" roughness={.26} metalness={.16} clearcoat={.8} clearcoatRoughness={.2} sheen={.9} sheenColor="#FFF0D6" sheenRoughness={.3} />
  </mesh>;
}

function GiftSculpture({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const ribbon = useRef<THREE.Group>(null);

  useGSAP(() => {
    const gift = group.current;
    const giftLid = lid.current;
    const giftRibbon = ribbon.current;
    if (reducedMotion || !gift || !giftLid || !giftRibbon) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.to(gift.rotation, { y: .16, x: -.035, scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.4 } });
    gsap.to(gift.position, { y: -.42, z: -.25, scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 } });
    gsap.to(giftLid.rotation, { z: -.12, x: -.12, scrollTrigger: { trigger: '#about', start: 'top 85%', end: 'top 20%', scrub: 1.2 } });
    gsap.to(giftRibbon.rotation, { y: .12, scrollTrigger: { trigger: '#collections', start: 'top bottom', end: 'top 20%', scrub: 1.5 } });
  }, { dependencies: [reducedMotion], revertOnUpdate: true });

  useFrame((state, delta) => {
    if (group.current && !reducedMotion) group.current.rotation.y += Math.sin(state.clock.elapsedTime * .18) * delta * .008;
  });

  return <group ref={group} position={[.15, -.35, 0]} rotation={[-.08, -.28, 0]}>
    <mesh position={[0, -.08, 0]} castShadow receiveShadow><boxGeometry args={[2.35, 1.48, 1.75]} /><meshPhysicalMaterial color="#35151F" roughness={.72} metalness={.02} clearcoat={.16} clearcoatRoughness={.55} /></mesh>
    <mesh position={[0, -.08, .886]}><boxGeometry args={[2.22, 1.34, .012]} /><meshStandardMaterial color="#421C29" roughness={.85} /></mesh>
    <mesh position={[0, -.08, -.886]}><boxGeometry args={[2.22, 1.34, .012]} /><meshStandardMaterial color="#2B1018" roughness={.8} /></mesh>
    <mesh position={[0, .68, 0]} castShadow><boxGeometry args={[2.48, .18, 1.88]} /><meshPhysicalMaterial color="#4A202D" roughness={.56} clearcoat={.24} /></mesh>
    <group ref={lid} position={[0, .83, 0]}>
      <mesh castShadow><boxGeometry args={[2.52, .22, 1.92]} /><meshPhysicalMaterial color="#35151F" roughness={.62} clearcoat={.2} /></mesh>
      <mesh position={[0, -.115, 0]}><boxGeometry args={[2.38, .025, 1.78]} /><meshStandardMaterial color="#C4A477" metalness={.78} roughness={.3} /></mesh>
    </group>
    <group ref={ribbon}>
      <mesh position={[0, .06, .91]} castShadow><boxGeometry args={[.34, 1.42, .035]} /><meshPhysicalMaterial color="#D7B88A" roughness={.27} metalness={.13} sheen={.8} clearcoat={.8} /></mesh>
      <mesh position={[0, .68, 0]} castShadow><boxGeometry args={[2.48, .055, .28]} /><meshPhysicalMaterial color="#D7B88A" roughness={.26} metalness={.14} sheen={.9} /></mesh>
      <SatinLoop position={[-.18, 1.05, .05]} rotation={[.1, 0, -.22]} scale={.78} />
      <SatinLoop position={[.2, 1.05, -.02]} rotation={[.1, Math.PI, .28]} scale={.78} />
      <mesh position={[0, 1.02, .05]} castShadow><sphereGeometry args={[.15, 32, 24]} /><meshPhysicalMaterial color="#C4A477" metalness={.58} roughness={.24} /></mesh>
    </group>
    <mesh position={[.02, -.02, 0]}><boxGeometry args={[.17, 1.46, 1.9]} /><meshPhysicalMaterial color="#D7B88A" roughness={.29} metalness={.12} /></mesh>
  </group>;
}

function Scene({ reducedMotion, compact }: { reducedMotion: boolean; compact: boolean }) {
  return <>
    <color attach="background" args={['#110E0D']} />
    <fog attach="fog" args={['#110E0D', 6.5, 13]} />
    <ambientLight intensity={.38} color="#E8D4B8" />
    <spotLight position={[-4, 6, 5]} angle={.42} penumbra={.9} intensity={95} color="#FFE5C2" castShadow shadow-mapSize={[1024, 1024]} />
    <spotLight position={[4, 2, -3]} angle={.5} penumbra={.85} intensity={125} color="#C58C72" />
    <pointLight position={[0, -1, 3]} intensity={10} color="#9C5D4B" />
    <hemisphereLight args={['#f1dfc8', '#241319', 0.72]} />
    <GiftSculpture reducedMotion={reducedMotion} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#17100F" roughness={.88} metalness={.08} /></mesh>
    <ContactShadows position={[0, -1.2, 0]} opacity={.42} scale={6} blur={2.4} far={3} resolution={256} />
    {!reducedMotion && <EffectComposer multisampling={0}>
      {!compact && <DepthOfField focusDistance={.018} focalLength={.018} bokehScale={.65} />}
      <Bloom intensity={compact ? .12 : .22} luminanceThreshold={.86} luminanceSmoothing={.24} />
      <Vignette eskil={false} offset={.2} darkness={.48} />
    </EffectComposer>}
  </>;
}

export default function GiftScene() {
  const [quality, setQuality] = useState({ dpr: 1.5, reducedMotion: false, compact: false });
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 700px), (max-device-memory: 4gb)');
    const update = () => setQuality({ dpr: compact.matches ? 1 : 1.5, reducedMotion: motion.matches, compact: compact.matches });
    update();
    motion.addEventListener('change', update);
    compact.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      compact.removeEventListener('change', update);
    };
  }, []);

  return <Canvas shadows dpr={[1, quality.dpr]} camera={{ position: [0, 1.15, 5.8], fov: 34 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => {
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }}>
    <Suspense fallback={null}><Scene reducedMotion={quality.reducedMotion} compact={quality.compact} /></Suspense>
  </Canvas>;
}
