'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const RIBBON = '#D9BF8C';
const TAU = Math.PI * 2;

function SatinMaterial() {
  return <meshPhysicalMaterial
    color={RIBBON}
    metalness={0.85}
    roughness={0.3}
    clearcoat={0.28}
    clearcoatRoughness={0.24}
    sheen={1}
    sheenColor="#EEDDB8"
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
      const surface = center.addScaledVector(normal, 0.003);
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

function SatinLoop({ angle, size, depth = 0.12 }: { angle: number; size: number; depth?: number }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * Math.PI * 2;
      const x = size * (0.48 + 0.48 * Math.cos(t));
      const y = size * 0.34 * Math.sin(t);
      const z = depth * Math.sin(t * 2) + 0.025 * Math.cos(t);
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.18);
    const frames = curve.computeFrenetFrames(segments, false);
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const ribbonWidth = 0.115;
    for (let i = 0; i <= segments; i += 1) {
      const p = curve.getPointAt(i / segments);
      const n = frames.normals[i];
      const left = p.clone().addScaledVector(n, -ribbonWidth / 2);
      const right = p.clone().addScaledVector(n, ribbonWidth / 2);
      positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, i / segments, 1, i / segments);
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [size, depth]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} rotation={[0.18 * Math.sin(angle), 0.35 * Math.cos(angle), angle]} castShadow receiveShadow>
    <SatinMaterial />
  </mesh>;
}

function SatinTail({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.28, 0),
      new THREE.Vector3(-0.025, 0.08, 0.025),
      new THREE.Vector3(0.035, -0.2, 0.08),
      new THREE.Vector3(0.09, -0.48, 0.12),
      new THREE.Vector3(0.035, -0.72, 0.1),
    ], false, 'centripetal', 0.2);
    const segments = 72;
    const frames = curve.computeFrenetFrames(segments, false);
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const p = curve.getPointAt(i / segments);
      const side = frames.normals[i];
      const width = 0.25 * (0.9 + 0.1 * Math.sin(Math.PI * i / segments));
      const left = p.clone().addScaledVector(side, -width / 2);
      const right = p.clone().addScaledVector(side, width / 2);
      positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, i / segments, 1, i / segments);
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
    <SatinMaterial />
  </mesh>;
}

function GlossFloor() {
  const texture = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = (x + 0.5 - size / 2) / (size / 2);
        const dy = (y + 0.5 - size / 2) / (size / 2);
        const radius = Math.min(1, Math.sqrt(dx * dx + dy * dy));
        const glow = Math.pow(Math.max(0, 1 - radius), 1.7);
        const i = (y * size + x) * 4;
        data[i] = Math.round(7 + glow * 4);
        data[i + 1] = Math.round(18 + glow * 12);
        data[i + 2] = Math.round(13 + glow * 8);
        data[i + 3] = 255;
      }
    }
    const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.285, 0]} receiveShadow>
    <planeGeometry args={[30, 30]} />
    <meshPhysicalMaterial map={texture} color="#0E1F17" roughness={0.19} metalness={0.28} clearcoat={0.78} clearcoatRoughness={0.18} />
  </mesh>;
}


function PaperMaterial({ color }: { color: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    let seed = 37;
    for (let i = 0; i < 18000; i += 1) {
      seed = (seed * 16807) % 2147483647;
      const value = 112 + (seed % 32);
      ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 0.16)`;
      const x = seed % 256;
      seed = (seed * 16807) % 2147483647;
      ctx.fillRect(x, seed % 256, 1, 1);
    }
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#b8b8b8';
    ctx.lineWidth = 0.55;
    for (let y = 0; y < 256; y += 5) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y + 1); ctx.stroke();
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(2.4, 2.4);
    return map;
  }, []);
  useEffect(() => () => texture?.dispose(), [texture]);
  return <meshPhysicalMaterial color={color} map={texture ?? undefined} bumpMap={texture ?? undefined}
    bumpScale={0.012} roughness={0.62} metalness={0.015} clearcoat={0.12}
    clearcoatRoughness={0.48} sheen={0.22} sheenColor="#8E1F3A" sheenRoughness={0.7} />;
}

function GiftTag() {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const gradient = ctx.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, '#EEDDB8');
    gradient.addColorStop(0.52, '#D9BF8C');
    gradient.addColorStop(1, '#A88B57');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = 'rgba(74,13,26,.42)'; ctx.lineWidth = 5; ctx.strokeRect(13, 13, 486, 230);
    ctx.fillStyle = '#4A0D1A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'italic 42px Georgia'; ctx.fillText('Treasured Genius', 256, 132);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  const cord = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.16, 0), new THREE.Vector3(0.06, 0.03, 0.02),
    new THREE.Vector3(0.18, -0.12, 0.02), new THREE.Vector3(0.23, -0.22, 0.02),
  ]), 32, 0.008, 8, false), []);
  useEffect(() => () => { map?.dispose(); cord.dispose(); }, [map, cord]);
  return <group position={[0.49, 0.52, 0.88]} rotation={[0.08, 0.04, -0.18]}>
    <mesh geometry={cord}><meshStandardMaterial color="#D9BF8C" metalness={0.55} roughness={0.42} /></mesh>
    <mesh position={[0.23, -0.35, 0.03]} rotation={[0, 0, -0.13]} castShadow>
      <planeGeometry args={[0.64, 0.31]} />
      <meshPhysicalMaterial map={map ?? undefined} color="#FFFFFF" roughness={0.48} metalness={0.18} clearcoat={0.16} side={THREE.DoubleSide} />
    </mesh>
  </group>;
}

function GiftSculpture({ reducedMotion }: { reducedMotion: boolean }) {
  const { gl } = useThree();
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
    gl.domElement.setPointerCapture(event.pointerId);
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
    if (gl.domElement.hasPointerCapture(event.pointerId)) gl.domElement.releasePointerCapture(event.pointerId);
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
        <PaperMaterial color="#6B1226" />
      </RoundedBox>

      {/* One clean, slightly overhanging lid; no separate seam strip. */}
      <RoundedBox args={[2.46, 0.2, 1.88]} radius={0.04} smoothness={6} position={[0, 0.73, 0]} castShadow receiveShadow>
        <PaperMaterial color="#8E1F3A" />
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

      <group position={[0, 1.0, 0.12]}>
        <SatinLoop angle={-0.22} size={1.02} depth={0.12} />
        <SatinLoop angle={0.55} size={1.08} depth={0.16} />
        <SatinLoop angle={1.25} size={0.98} depth={0.13} />
        <SatinLoop angle={2.0} size={1.1} depth={0.17} />
        <SatinLoop angle={2.72} size={1.04} depth={0.12} />
        <SatinLoop angle={3.42} size={1.07} depth={0.16} />
        <SatinLoop angle={4.15} size={0.96} depth={0.13} />
        <SatinLoop angle={4.88} size={1.05} depth={0.15} />
        <mesh position={[0, 0.02, 0.13]} castShadow>
          <sphereGeometry args={[0.14, 32, 24]} />
          <meshPhysicalMaterial color="#EEDDB8" metalness={0.85} roughness={0.28} clearcoat={0.7} clearcoatRoughness={0.18} />
        </mesh>
      </group>
      <SatinTail position={[-0.36, 0.47, 0.89]} rotation={[0, 0, -0.08]} />
      <SatinTail position={[0.36, 0.47, 0.89]} rotation={[0, 0, 0.08]} />
      <GiftTag />
    </group>
  </group>;
}

function StudioEnvironment() {
  return <Environment resolution={256}>
    <group>
      <Lightformer form="rect" intensity={3.1} color="#EEDDB8" scale={[7, 4, 1]} position={[-1, 5, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#D9BF8C" scale={[3, 5, 1]} position={[-4, 1, 2]} rotation={[0, Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={1.4} color="#A9B8C9" scale={[3, 5, 1]} position={[4, 1, -2]} rotation={[0, -Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={1.8} color="#D9BF8C" scale={[5, 3, 1]} position={[0, 3, -5]} rotation={[0, Math.PI, 0]} />
      <Lightformer form="rect" intensity={0.8} color="#F6F0E6" scale={[2, 2, 1]} position={[0, -2, 3]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  </Environment>;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <color attach="background" args={['#07120D']} />
    <fog attach="fog" args={['#07120D', 8, 18]} />
    <StudioEnvironment />
    <ambientLight intensity={0.22} color="#BDB3A6" />
    <spotLight position={[-4.5, 6, 5]} angle={0.48} penumbra={1} intensity={22} color="#EEDDB8" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} />
    <spotLight position={[0.5, 3.5, -4.5]} angle={0.62} penumbra={1} intensity={5} color="#F6F1E4" />
    <GiftSculpture reducedMotion={reducedMotion} />
    <GlossFloor />
    <ContactShadows position={[0, -1.27, 0]} opacity={0.52} scale={5.8} blur={3.2} far={3.2} resolution={512} color="#020805" />
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
