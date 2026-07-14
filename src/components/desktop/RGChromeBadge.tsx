import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox, Text, useTexture } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

/**
 * The RG lanyard badge on a real rapier physics rope. Full-screen overlay: the canvas ignores
 * pointer events so the page stays clickable, and the card is grabbed via manual raycasting, so
 * you can fling it in front of anything. Theme-aware (dark blackcard / inverted light card).
 */

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Record<string, unknown>;
    meshLineMaterial: Record<string, unknown>;
  }
}

type Palette = {
  card: string;
  name: string;
  sub: string;
  strapBg: string;
  strapText: string;
  emissive: string;
  emissiveInt: number;
};

const CARD_SCALE = 0.72;

function palette(dark: boolean): Palette {
  return dark
    ? { card: '#0b0c0e', name: '#f2f4f7', sub: '#9aa3ad', strapBg: '#0a0a0b', strapText: 'rgba(255,255,255,0.9)', emissive: '#cfdaf0', emissiveInt: 0.16 }
    : { card: '#e9eaee', name: '#1c1917', sub: '#57534e', strapBg: '#d9dade', strapText: 'rgba(20,20,24,0.82)', emissive: '#39414d', emissiveInt: 0.05 };
}

/** repeated name running down the strap; bigger + higher-contrast so it's legible on the band */
function makeStrapTexture(p: Palette) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = p.strapBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '800 62px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.fillStyle = p.strapText;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const label = 'RONNIEL GANDHE      ';
  const gap = ctx.measureText(label).width;
  for (let px = 0; px < canvas.width + gap; px += gap) {
    ctx.fillText(label, px, canvas.height / 2 + 3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Face({ logo, p }: { logo: THREE.Texture; p: Palette }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0.02]}>
        <planeGeometry args={[1.3, 1.3]} />
        <meshPhysicalMaterial
          map={logo}
          alphaTest={0.5}
          metalness={1}
          roughness={0.08}
          iridescence={1}
          iridescenceIOR={1.35}
          iridescenceThicknessRange={[130, 420]}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={2.3}
          emissive={p.emissive}
          emissiveMap={logo}
          emissiveIntensity={p.emissiveInt}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Text position={[0, -0.55, 0.02]} fontSize={0.19} color={p.name} anchorX="center" anchorY="middle" letterSpacing={-0.01}>
        Ronniel Gandhe
      </Text>
      <Text position={[0, -0.85, 0.02]} fontSize={0.1} color={p.sub} anchorX="center" anchorY="middle" letterSpacing={0.16}>
        SOFTWARE ENGINEER
      </Text>
    </group>
  );
}

function Band({ dark }: { dark: boolean }) {
  const band = useRef<THREE.Mesh>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);
  const cardVisual = useRef<THREE.Group>(null);

  const logo = useTexture('/icons/rglogo.png');
  logo.colorSpace = THREE.SRGBColorSpace;
  logo.anisotropy = 8;
  const p = useMemo(() => palette(dark), [dark]);
  const strap = useMemo(() => makeStrapTexture(p), [p]);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const camera = useThree((s) => s.camera);
  const raycaster = useThree((s) => s.raycaster);
  const gl = useThree((s) => s.gl);
  const { width, height } = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);
  // hang in the left third, responsive to aspect so it's always on-screen
  const anchorX = -Math.min(2.8, viewport.width * 0.3);

  const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
  const draggedRef = useRef<false | THREE.Vector3>(false);

  const segmentProps = { type: 'dynamic' as const, canSleep: true, colliders: false as const, angularDamping: 2, linearDamping: 2 };

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.16, 0]]);

  const curve = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = 'chordal';
    return c;
  }, []);

  // manual pointer handling on window, so the page underneath stays clickable
  useEffect(() => {
    const el = gl.domElement;
    const setNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const hitCard = () => {
      if (!cardVisual.current) return false;
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObject(cardVisual.current, true).length > 0;
    };
    const onMove = (e: PointerEvent) => {
      setNdc(e);
      if (!draggedRef.current) {
        const hover = hitCard();
        if (hover) document.body.style.cursor = 'grab';
        else if (document.body.style.cursor === 'grab') document.body.style.cursor = 'auto';
      }
    };
    const onDown = (e: PointerEvent) => {
      setNdc(e);
      if (!card.current || !hitCard()) return;
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(cardVisual.current!, true)[0];
      const off = new THREE.Vector3().copy(hit.point).sub(vec.copy(card.current.translation()));
      draggedRef.current = off;
      setDragged(off);
      document.body.style.cursor = 'grabbing';
    };
    const onUp = () => {
      if (draggedRef.current) {
        draggedRef.current = false;
        setDragged(false);
        document.body.style.cursor = 'auto';
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl, camera, raycaster, ndc, vec]);

  useFrame((_, delta) => {
    if (draggedRef.current && card.current) {
      vec.set(ndc.x, ndc.y, 0.5).unproject(camera);
      dir.copy(vec).sub(camera.position).normalize();
      vec.add(dir.multiplyScalar(camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
      const off = draggedRef.current as THREE.Vector3;
      card.current.setNextKinematicTranslation({ x: vec.x - off.x, y: vec.y - off.y, z: vec.z - off.z });
    }
    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
      [j1, j2].forEach((r) => {
        const rc = r.current as RapierRigidBody & { lerped?: THREE.Vector3 };
        if (!rc.lerped) rc.lerped = new THREE.Vector3().copy(rc.translation());
        const dist = Math.max(0.1, Math.min(1, rc.lerped.distanceTo(rc.translation())));
        rc.lerped.lerp(rc.translation(), delta * (10 + dist * 40));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy((j2.current as RapierRigidBody & { lerped: THREE.Vector3 }).lerped);
      curve.points[2].copy((j1.current as RapierRigidBody & { lerped: THREE.Vector3 }).lerped);
      curve.points[3].copy(fixed.current.translation());
      (band.current.geometry as unknown as { setPoints: (pts: THREE.Vector3[]) => void }).setPoints(curve.getPoints(48));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation() as unknown as THREE.Vector3);
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, false);
    }
  });

  return (
    <>
      {/* hang from the left third of the screen */}
      <group position={[anchorX, 4.7, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.78, 1.12, 0.04]} />
          <group ref={cardVisual} scale={CARD_SCALE}>
            {/* clip ring at the top attach, facing the camera so it reads as an O */}
            <mesh position={[0, 1.16 / CARD_SCALE, 0]} scale={1 / CARD_SCALE}>
              <torusGeometry args={[0.12, 0.042, 24, 48]} />
              <meshPhysicalMaterial color="#cfd4da" metalness={1} roughness={0.22} envMapIntensity={1.4} />
            </mesh>

            <RoundedBox args={[2.1, 3.0, 0.08]} radius={0.13} smoothness={8}>
              <meshPhysicalMaterial
                color={p.card}
                roughness={0.26}
                metalness={dark ? 0.35 : 0.2}
                clearcoat={1}
                clearcoatRoughness={0.18}
                envMapIntensity={dark ? 0.7 : 0.5}
              />
            </RoundedBox>

            <group position={[0, 0, 0.041]}>
              <Face logo={logo} p={p} />
            </group>
            <group position={[0, 0, -0.041]} rotation={[0, Math.PI, 0]}>
              <Face logo={logo} p={p} />
            </group>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="#ffffff" depthTest={false} resolution={[width, height]} useMap={1} map={strap} repeat={[-2, 1]} lineWidth={0.36} />
      </mesh>
    </>
  );
}

/** in-scene studio, colored softboxes give the chrome its highlights + iridescent sheen */
function Studio() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={4} color="#ffffff" position={[-2.5, 2, 3]} scale={[5, 5, 1]} />
      <Lightformer form="rect" intensity={2.4} color="#8ea6ff" position={[3, 1.5, 2]} scale={[3, 4, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#ff9ecb" position={[-1, -2.5, 2.5]} scale={[4, 3, 1]} />
      <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, 0.5, 4.5]} scale={[2.4, 2.4, 1]} />
      {/* bright diagonal key: its reflection sweeps a shimmer across the logo */}
      <Lightformer form="rect" intensity={7} color="#ffffff" position={[1.4, 2.2, 5]} scale={[1.6, 7, 1]} rotation={[0, -0.35, 0.5]} />
    </Environment>
  );
}

export default function RGChromeBadge({ dark = true }: { dark?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 13], fov: 25 }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.25} />
        <Suspense fallback={null}>
          <Studio />
          <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band dark={dark} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
