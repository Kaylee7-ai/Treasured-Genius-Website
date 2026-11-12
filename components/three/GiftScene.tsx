'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const RIBBON = '#D8B98D';
const TAU = Math.PI * 2;

function SatinMaterial() {
  return <meshPhysicalMaterial
    color={RIBBON}
    metalness={0.28}
    roughness={0.31}
    clearcoat={0.85}
    clearcoatRoughness={0.2}
    sheen={1}
    sheenColor="#FFF0D8"
    sheenRoughness={0.24}
    polygonOffset
    polygonOffsetFactor={-1}
    polygonOffsetUnits={-1}
    side={THREE.DoubleSide}
  />;
}

/** A single continuous, flat ribbon strip following a rounded rectangular path. */
function RibbonWrap({
  points,
  widthAxis,
  width,
}: {
  points: [number, number, number][];
  widthAxis: [number, number, number];
  width: number;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(...point)),
      true,
      'centripetal',
      0.12,
    );
    const segments = 192;
    const axis = new THREE.Vector3(...widthAxis).normalize();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const center = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const normal = tangent.clone().cross(axis).normalize();
      const surface = center.addScaledVector(normal, 0.004);
      const left = surface.clone().addScaledVector(axis, -width / 2);
      const right = surface.clone().addScaledVector(axis, width / 2);
      vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, t * 8, 1, t * 8);

      if (i < segments) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, c, b, b, c, d);
      }
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    result.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, [points, widthAxis, width]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <mesh geometry={geometry} castShadow receiveShadow>
    <SatinMaterial />
  </mesh>;
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
  const dragging = useRef(false);
  const lastPointerX = useRef(0);
  const dragTarget = useRef(0);
  const dragOffset = useRef(0);
  const autoAngle = useRef(0);

  useEffect(() => {
    if (reducedMotion || !intro.current) return;
    gsap.fromTo(intro.current.scale, { x: 0.88, y: 0.88, z: 0.88 }, { x: 1, y: 1, z: 1, duration: 1.8, ease: 'power3.out' });
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    autoAngle.current = (autoAngle.current + delta * TAU / 20) % TAU;
    if (!dragging.current) {
      dragOffset.current = THREE.MathUtils.damp(dragOffset.current, dragTarget.current, 5, delta);
    }
    group.current.position.y = -0.12 + Math.sin(state.clock.elapsedTime * 0.62) * 0.035;
    group.current.rotation.y = autoAngle.current + dragOffset.current;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.34) * 0.008;
  });

  const beginDrag = (event: ThreeEvent<PointerEvent>) => {
    if (reducedMotion) return;
    event.stopPropagation();
    dragging.current = true;
    lastPointerX.current = event.clientX;
    const pointerTarget = event.target;
    if (pointerTarget instanceof HTMLElement) pointerTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || reducedMotion) return;
    event.stopPropagation();
    const deltaX = event.clientX - lastPointerX.current;
    lastPointerX.current = event.clientX;
    dragTarget.current += deltaX * 0.008;
    dragOffset.current = dragTarget.current;
  };

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    event.stopPropagation();
    dragging.current = false;
    dragTarget.current = 0;
    const pointerTarget = event.target;
    if (pointerTarget instanceof HTMLElement) pointerTarget.releasePointerCapture(event.pointerId);
  };

  return <group
    ref={group}
    position={[0, -0.12, 0]}
    onPointerDown={beginDrag}
    onPointerMove={moveDrag}
    onPointerUp={endDrag}
    onPointerCancel={endDrag}
    onLostPointerCapture={endDrag}
  >
    <group ref={intro} scale={0.9}>
      <RoundedBox args={[2.3, 1.48, 1.72]} radius={0.045} smoothness={6} position={[0, -0.12, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#421A28" roughness={0.3} metalness={0.025} clearcoat={0.88} clearcoatRoughness={0.22} sheen={0.42} sheenColor="#8E485A" sheenRoughness={0.34} />
      </RoundedBox>

      {/* One clean, slightly overhanging lid; no separate seam strip. */}
      <RoundedBox args={[2.46, 0.2, 1.88]} radius={0.04} smoothness={6} position={[0, 0.73, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#4A202E" roughness={0.29} metalness={0.025} clearcoat={0.92} clearcoatRoughness={0.2} sheen={0.42} sheenColor="#985064" />
      </RoundedBox>

      {/* Each wrap is one continuous surface-following loop, including the underside. */}
      <RibbonWrap
        width={0.34}
        widthAxis={[1, 0, 0]}
        points={[
          [0, 0.835, 0],
          [0, 0.835, 0.94],
          [0, 0.77, 0.875],
          [0, -0.86, 0.875],
          [0, -0.885, 0],
          [0, -0.86, -0.875],
          [0, 0.77, -0.875],
          [0, 0.835, -0.94],
        ]}
      />
      <RibbonWrap
        width={0.34}
        widthAxis={[0, 0, -1]}
        points={[
          [0, 0.835, 0],
          [1.23, 0.835, 0],
          [1.17, 0.65, 0],
          [1.17, -0.86, 0],
          [0, -0.885, 0],
          [-1.17, -0.86, 0],
          [-1.17, 0.65, 0],
          [-1.23, 0.835, 0],
        ]}
      />

      <group position={[0, 0.99, 0.12]}>
        <SatinPetal position={[-0.2, 0.02, 0]} rotation={[0.02, 0, -0.32]} scale={0.83} />
        <SatinPetal position={[0.2, 0.02, 0]} rotation={[-0.02, 0, Math.PI + 0.32]} scale={0.83} />
        <SatinPetal position={[-0.34, 0.02, -0.12]} rotation={[0.18, -0.2, -0.82]} scale={0.7} />
        <SatinPetal position={[0.34, 0.02, -0.12]} rotation={[-0.18, 0.2, Math.PI + 0.82]} scale={0.7} />
        <SatinPetal position={[-0.17, 0.08, -0.2]} rotation={[0.28, 0.12, -1.35]} scale={0.58} />
        <SatinPetal position={[0.17, 0.08, -0.2]} rotation={[-0.28, -0.12, Math.PI + 1.35]} scale={0.58} />
        <mesh position={[0, 0.045, 0.12]} castShadow>
          <sphereGeometry args={[0.145, 32, 24]} />
          <meshPhysicalMaterial color="#E4C79D" metalness={0.62} roughness={0.19} clearcoat={1} clearcoatRoughness={0.12} />
        </mesh>
      </group>
      <SatinTail position={[-0.36, 0.47, 0.89]} rotation={[0, 0, -0.08]} />
      <SatinTail position={[0.36, 0.47, 0.89]} rotation={[0, 0, 0.08]} />
    </group>
  </group>;
}

function StudioEnvironment() {
  return <Environment resolution={256}>
    <group>
      <Lightformer form="rect" intensity={3.1} color="#FFF0D9" scale={[7, 4, 1]} position={[-1, 5, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#E8BD8C" scale={[3, 5, 1]} position={[-4, 1, 2]} rotation={[0, Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={1.4} color="#D7DCE5" scale={[3, 5, 1]} position={[4, 1, -2]} rotation={[0, -Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={1.8} color="#D9B98F" scale={[5, 3, 1]} position={[0, 3, -5]} rotation={[0, Math.PI, 0]} />
      <Lightformer form="rect" intensity={0.8} color="#FFFFFF" scale={[2, 2, 1]} position={[0, -2, 3]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  </Environment>;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <color attach="background" args={['#110E0D']} />
    <fog attach="fog" args={['#110E0D', 8, 18]} />
    <StudioEnvironment />
    <ambientLight intensity={0.16} color="#E8D4B8" />
    <spotLight position={[-4.5, 6, 5]} angle={0.48} penumbra={1} intensity={22} color="#FFE8CC" castShadow shadow-mapSize={[1024, 1024]} />
    <spotLight position={[0.5, 3.5, -4.5]} angle={0.62} penumbra={1} intensity={8} color="#D9B98F" />
    <GiftSculpture reducedMotion={reducedMotion} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.285, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshPhysicalMaterial color="#100D0D" roughness={0.3} metalness={0.2} clearcoat={0.25} clearcoatRoughness={0.34} />
    </mesh>
    <ContactShadows position={[0, -1.27, 0]} opacity={0.52} scale={5.8} blur={3.2} far={3.2} resolution={512} color="#080607" />
    {!reducedMotion && <EffectComposer multisampling={4}>
      <Bloom intensity={0.045} luminanceThreshold={1.12} luminanceSmoothing={0.08} />
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
