'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox, Sparkles } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const CHAMPAGNE = '#E5C991';
const CHAMPAGNE_LIGHT = '#F8E7C1';
const WINE = '#54283D';
const WINE_DARK = '#321827';

function BowLoops() {
  const geometry = useMemo(() => new THREE.TorusGeometry(0.34, 0.052, 18, 96), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={[0, 0.19, 0.02]}>
      <mesh geometry={geometry} position={[-0.29, 0.02, 0.03]} rotation={[0.12, 0.2, -0.48]} scale={[1.18, 0.58, 0.72]} castShadow>
        <meshPhysicalMaterial color={CHAMPAGNE} metalness={0.72} roughness={0.24} clearcoat={0.8} clearcoatRoughness={0.16} sheen={0.8} sheenColor={CHAMPAGNE_LIGHT} />
      </mesh>
      <mesh geometry={geometry} position={[0.29, 0.02, 0.03]} rotation={[-0.12, -0.2, 0.48]} scale={[1.18, 0.58, 0.72]} castShadow>
        <meshPhysicalMaterial color={CHAMPAGNE} metalness={0.72} roughness={0.24} clearcoat={0.8} clearcoatRoughness={0.16} sheen={0.8} sheenColor={CHAMPAGNE_LIGHT} />
      </mesh>
      <mesh position={[0, 0.02, 0.16]} castShadow>
        <sphereGeometry args={[0.13, 32, 24]} />
        <meshPhysicalMaterial color={CHAMPAGNE_LIGHT} metalness={0.7} roughness={0.2} clearcoat={1} />
      </mesh>
      <RoundedBox args={[0.19, 0.43, 0.035]} radius={0.035} smoothness={5} position={[-0.15, -0.22, 0.13]} rotation={[0.02, 0.08, 0.25]} castShadow>
        <meshPhysicalMaterial color={CHAMPAGNE} metalness={0.7} roughness={0.26} clearcoat={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.19, 0.43, 0.035]} radius={0.035} smoothness={5} position={[0.15, -0.22, 0.13]} rotation={[-0.02, -0.08, -0.25]} castShadow>
        <meshPhysicalMaterial color={CHAMPAGNE} metalness={0.7} roughness={0.26} clearcoat={0.7} />
      </RoundedBox>
    </group>
  );
}

function GiftSculpture({ reducedMotion }: { reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const intro = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const innerLight = useRef<THREE.Mesh>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const dragRotation = useRef(0);
  const dragTarget = useRef(0);

  useEffect(() => {
    if (reducedMotion || !intro.current) return;
    gsap.fromTo(
      intro.current.scale,
      { x: 0.72, y: 0.72, z: 0.72 },
      { x: 1, y: 1, z: 1, duration: 1.9, ease: 'back.out(1.15)' },
    );
  }, [reducedMotion]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (!root.current) return;
    if (!dragging.current) {
      dragRotation.current = THREE.MathUtils.damp(dragRotation.current, dragTarget.current, 4, delta);
    }
    if (!reducedMotion) {
      root.current.position.y = -0.08 + Math.sin(time * 0.62) * 0.055;
      root.current.rotation.y = Math.sin(time * 0.22) * 0.16 + dragRotation.current;
      root.current.rotation.z = Math.sin(time * 0.31) * 0.012;
      if (lid.current) {
        lid.current.position.y = 0.94 + Math.sin(time * 0.8) * 0.035;
        lid.current.rotation.z = -0.105 + Math.sin(time * 0.55) * 0.018;
        lid.current.rotation.x = 0.08 + Math.sin(time * 0.42) * 0.018;
      }
      if (innerLight.current) {
        const pulse = 0.94 + Math.sin(time * 1.8) * 0.08;
        innerLight.current.scale.setScalar(pulse);
      }
    }
  });

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    dragging.current = true;
    lastX.current = event.clientX;
  };
  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || reducedMotion) return;
    event.stopPropagation();
    dragTarget.current += (event.clientX - lastX.current) * 0.006;
    lastX.current = event.clientX;
  };
  const onPointerUp = () => {
    dragging.current = false;
    dragTarget.current = 0;
  };

  return (
    <group ref={root} position={[0, -0.08, 0]} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <group ref={intro}>
        {/* A lacquered keepsake box with softened edges and a warm inner lining. */}
        <RoundedBox args={[2.55, 1.48, 1.9]} radius={0.075} smoothness={8} position={[0, -0.22, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={WINE} metalness={0.16} roughness={0.27} clearcoat={0.9} clearcoatRoughness={0.19} sheen={0.42} sheenColor="#A96F7E" sheenRoughness={0.55} />
        </RoundedBox>

        {/* Fine champagne edge at the foot of the box. */}
        <RoundedBox args={[2.58, 0.055, 1.93]} radius={0.035} smoothness={6} position={[0, -0.91, 0]} castShadow>
          <meshPhysicalMaterial color="#A98252" metalness={0.82} roughness={0.24} clearcoat={0.9} />
        </RoundedBox>

        {/* A softly illuminated interior visible through the floating lid. */}
        <RoundedBox args={[2.18, 0.035, 1.54]} radius={0.045} smoothness={6} position={[0, 0.525, 0]} receiveShadow>
          <meshPhysicalMaterial color="#8B5A54" emissive="#6C352E" emissiveIntensity={0.42} roughness={0.48} />
        </RoundedBox>
        <mesh ref={innerLight} position={[0, 0.72, 0.08]}>
          <sphereGeometry args={[0.24, 32, 24]} />
          <meshBasicMaterial color="#F4D7A4" transparent opacity={0.74} />
        </mesh>
        <pointLight position={[0, 0.82, 0.2]} intensity={8.5} distance={4.5} decay={2} color="#F1D19A" />

        {/* Champagne ribbon wraps the front face, then continues over the lid. */}
        <RoundedBox args={[0.28, 1.38, 0.035]} radius={0.018} smoothness={5} position={[0, -0.19, 0.963]} castShadow>
          <meshPhysicalMaterial color={CHAMPAGNE} metalness={0.78} roughness={0.23} clearcoat={1} sheen={0.8} sheenColor={CHAMPAGNE_LIGHT} />
        </RoundedBox>
        <RoundedBox args={[0.28, 0.035, 1.9]} radius={0.018} smoothness={5} position={[0, 0.535, 0]} castShadow>
          <meshPhysicalMaterial color={CHAMPAGNE} metalness={0.78} roughness={0.23} clearcoat={1} sheen={0.8} sheenColor={CHAMPAGNE_LIGHT} />
        </RoundedBox>

        {/* The raised, angled lid creates the signature unboxing silhouette. */}
        <group ref={lid} position={[0, 0.94, -0.12]} rotation={[0.08, 0, -0.105]}>
          <RoundedBox args={[2.7, 0.24, 2.03]} radius={0.065} smoothness={8} castShadow receiveShadow>
            <meshPhysicalMaterial color="#6B364C" metalness={0.22} roughness={0.23} clearcoat={0.95} clearcoatRoughness={0.16} sheen={0.5} sheenColor="#C28E86" />
          </RoundedBox>
          <RoundedBox args={[2.73, 0.035, 2.06]} radius={0.03} smoothness={6} position={[0, -0.11, 0]} castShadow>
            <meshPhysicalMaterial color="#B28A58" metalness={0.88} roughness={0.2} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[0.29, 0.025, 2.02]} radius={0.012} smoothness={5} position={[0, 0.135, 0]} castShadow>
            <meshPhysicalMaterial color={CHAMPAGNE} metalness={0.82} roughness={0.21} clearcoat={1} sheen={0.8} sheenColor={CHAMPAGNE_LIGHT} />
          </RoundedBox>
          <RoundedBox args={[0.29, 0.18, 0.035]} radius={0.015} smoothness={5} position={[0, 0, 1.02]} castShadow>
            <meshPhysicalMaterial color={CHAMPAGNE} metalness={0.82} roughness={0.21} clearcoat={1} />
          </RoundedBox>
          <BowLoops />
        </group>
      </group>
    </group>
  );
}

function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <group>
        <Lightformer form="rect" intensity={3.8} color="#F4E1C0" scale={[7, 4, 1]} position={[-1, 5, 2]} />
        <Lightformer form="rect" intensity={2.5} color="#D7B58B" scale={[3, 5, 1]} position={[-4, 1, 2]} rotation={[0, Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={2.1} color="#A96F7E" scale={[3, 5, 1]} position={[4, 1, -2]} rotation={[0, -Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={1.4} color="#F1D9A8" scale={[5, 3, 1]} position={[0, 3, -5]} rotation={[0, Math.PI, 0]} />
      </group>
    </Environment>
  );
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <color attach="background" args={['#160E19']} />
      <fog attach="fog" args={['#160E19', 8, 18]} />
      <StudioEnvironment />
      <ambientLight intensity={0.38} color="#EAD7C0" />
      <spotLight position={[-4.5, 6, 5]} angle={0.48} penumbra={1} intensity={24} color="#F1D9A8" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} />
      <spotLight position={[4, 3.5, -3.5]} angle={0.6} penumbra={1} intensity={8} color="#A96F7E" />
      <pointLight position={[0, 0.4, 3]} intensity={3.5} distance={7} color="#D8B77B" />
      <mesh position={[0, -0.02, -1.18]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.82, 0.012, 10, 140]} />
        <meshBasicMaterial color="#D8B77B" transparent opacity={0.48} />
      </mesh>
      <GiftSculpture reducedMotion={reducedMotion} />
      <Sparkles count={48} scale={[4.5, 3.6, 3]} size={2.1} speed={0.28} opacity={0.72} color="#EED8AB" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.24, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial color="#21121F" roughness={0.22} metalness={0.22} clearcoat={0.78} clearcoatRoughness={0.17} />
      </mesh>
      <ContactShadows position={[0, -1.22, 0]} opacity={0.58} scale={5.8} blur={3.2} far={3.2} resolution={512} color="#100912" />
      {!reducedMotion && (
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.62} luminanceThreshold={0.65} luminanceSmoothing={0.18} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.52} />
        </EffectComposer>
      )}
    </>
  );
}

export default function GiftScene({ active }: { active: boolean }) {
  const [quality, setQuality] = useState({ dpr: 1.5, reducedMotion: false, compact: false });
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 700px)');
    const update = () => setQuality({
      dpr: Math.min(2, Math.max(1.25, window.devicePixelRatio || 1.5)),
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

  return (
    <Canvas
      shadows
      frameloop={active ? 'always' : 'never'}
      dpr={quality.dpr}
      camera={{ position: quality.compact ? [0, 0.22, 7.6] : [0, 0.28, 6.3], fov: quality.compact ? 34 : 36 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.18;
      }}
    >
      <Suspense fallback={null}>
        <Scene reducedMotion={quality.reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
