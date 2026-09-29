import { useRef, useMemo, Suspense, Component, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Sky, Cloud } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import Player from './Player';
import Sentry from './Sentry';
import VanguardColumn from './VanguardColumn';
import RockTrap from './RockTrap';
import AmbushZone from './AmbushZone';
import CinematicCamera from './CinematicCamera';
import StoneSupply from './StoneSupply';
import ThrowPoint from './ThrowPoint';
import NavigationArrow from './NavigationArrow';
import ImpactPreview from './ImpactPreview';
import AmbushGuideVisuals from './AmbushGuideVisuals';
import { useGameStore } from '../store/gameStore';

// Preload 3D Models
useGLTF.preload('/models/cliff.glb');
useGLTF.preload('/models/fort.glb');
useGLTF.preload('/models/land.glb');
useGLTF.preload('/models/tree.glb');
useGLTF.preload('/models/scout.glb');
useGLTF.preload('/models/rock.glb');
useGLTF.preload('/models/warrior.glb');
useGLTF.preload('/models/fortwall.glb');
useGLTF.preload('/models/mountain.glb');
useGLTF.preload('/models/redfort.glb');

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

function RedFort() {
  const redFortGltf = useGLTF('/models/redfort.glb');
  const fortGltf = useGLTF('/models/fort.glb');

  const fortModel = useMemo(() => {
    // 1. Extract fort's primary stone MeshStandardMaterial
    let fortMaterial: THREE.MeshStandardMaterial | null = null;
    fortGltf.scene.traverse((child) => {
      if (!fortMaterial && (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (mat) {
            fortMaterial = mat as THREE.MeshStandardMaterial;
          }
        }
      }
    });

    // 2. Transfer to redfort meshes
    const clone = redFortGltf.scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (fortMaterial) {
          const newMat = fortMaterial.clone();
          if (!fortMaterial.map) {
            newMat.color.set('#a3927c');
            newMat.roughness = 0.85;
            newMat.metalness = 0.05;
          }
          mesh.material = newMat;
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#a3927c',
            roughness: 0.85,
            metalness: 0.05,
          });
        }
      }
    });

    // Auto-scale to max dimension of 22 units
    const bbox = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      clone.scale.setScalar(22 / maxDim);
    }

    return clone;
  }, [redFortGltf.scene, fortGltf.scene]);

  return (
    <primitive
      object={fortModel}
      position={[5, 1.8, -23]}
      rotation={[0, Math.PI, 0]}
      scale={[55, 80, 90]}
    />
  );
}

function BackFortWall() {
  const fortwallGltf = useGLTF('/models/fortwall.glb');
  const fortGltf = useGLTF('/models/fort.glb');

  const wallModel = useMemo(() => {
    // 1. Extract fort's primary stone MeshStandardMaterial
    let fortMaterial: THREE.MeshStandardMaterial | null = null;
    fortGltf.scene.traverse((child) => {
      if (!fortMaterial && (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (mat) {
            fortMaterial = mat as THREE.MeshStandardMaterial;
          }
        }
      }
    });

    // 2. Overwrite fortwall material with cloned fort material
    const clone = fortwallGltf.scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (fortMaterial) {
          const newMat = fortMaterial.clone();
          newMat.roughness = 0.88;
          mesh.material = newMat;
        }
      }
    });
    return clone;
  }, [fortwallGltf.scene, fortGltf.scene]);

  return (
    <primitive
      object={wallModel}
      position={[13, -1, -33]}
      rotation={[0, -5, 0]}
      scale={[2.8, 9, 4]}
    />
  );
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('3D Scene Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/**
 * Camera Controller for Screen Shake & Dynamic Target Following
 */
function CameraController() {
  const screenShake = useGameStore((state) => state.screenShake);
  const screenShakeIntensity = useGameStore((state) => state.screenShakeIntensity);

  useFrame(({ camera }) => {
    if (screenShake) {
      camera.position.x += (Math.random() - 0.5) * screenShakeIntensity;
      camera.position.y += (Math.random() - 0.5) * screenShakeIntensity;
      camera.position.z += (Math.random() - 0.5) * screenShakeIntensity;
    }
  });

  return null;
}

interface TerrainProps {
  showWireframe?: boolean;
}

/**
 * Helper to generate a 512x512 procedural ground texture with dark soil grain,
 * rock flecks (#241c14), and wild moss/grass patches (#2d3d23, #3d522e).
 */
function createProceduralGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base earthy soil background
    ctx.fillStyle = '#263423';
    ctx.fillRect(0, 0, 512, 512);

    // Wild moss/grass patches (#2d3d23, #3d522e)
    const patchColors = ['#2d3d23', '#3d522e', '#354829', '#24321d'];
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 10 + Math.random() * 40;
      const color = patchColors[Math.floor(Math.random() * patchColors.length)];
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.4 + Math.random() * 0.4;
      ctx.fill();
    }

    // High-frequency dark soil grain & rock flecks (#241c14)
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() > 0.8 ? 2 : 1;
      ctx.fillStyle = Math.random() > 0.3 ? '#241c14' : '#18120c';
      ctx.fillRect(x, y, size, size);
    }

    // Light moss/sand flecks for ground depth
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = '#4a5b3a';
      ctx.fillRect(x, y, 1, 1);
    }

    ctx.globalAlpha = 1.0;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(40, 40);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Sahyadri Mountains (/models/mountain.glb)
 * - Elevated flanking and background mountain ranges
 */
function SahyadriMountains() {
  const mountainGltf = useGLTF('/models/mountain.glb');

  const mossTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base dark basalt rock
    ctx.fillStyle = '#2b3327';
    ctx.fillRect(0, 0, 512, 512);

    // Large verdant Sahyadri moss & vegetation patches
    ctx.fillStyle = '#3e5c2b';
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 512,
        Math.random() * 512,
        Math.random() * 90 + 30,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Accent grass patches (fresh monsoon green)
    ctx.fillStyle = '#527838';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 512,
        Math.random() * 512,
        Math.random() * 40 + 15,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const mountainInstances = useMemo(() => {
    const configs = [
      { pos: [-60, -8, 0], scale: [50, 80, 70], rotY: 0.4 },
      { pos: [80, -9, 10], scale: [50, 80, 70], rotY: -0.6 },
      { pos: [-20, -10, -200], scale: [100, 150, 120], rotY: 0.2 },
      { pos: [18, 1.2, -22], scale: [6.5, 5.5, 6.5], rotY: -0.3 },
    ];

    return configs.map((config) => {
      const clone = mountainGltf.scene.clone();
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Replace snowy material with mossy rock
          mesh.material = new THREE.MeshStandardMaterial({
            map: mossTexture,
            color: new THREE.Color('#789462'), // Blends green tones across the geometry
            roughness: 0.95,
            metalness: 0.05,
          });
        }
      });
      return { ...config, scene: clone };
    });
  }, [mountainGltf.scene, mossTexture]);

  return (
    <group>
      {mountainInstances.map((m, idx) => (
        <primitive
          key={`sahyadri-mountain-${idx}`}
          object={m.scene}
          position={m.pos as [number, number, number]}
          rotation={[0, m.rotY, 0]}
          scale={m.scale as [number, number, number]}
        />
      ))}
    </group>
  );
}

/**
 * Sahyadri Mountain Trees (/models/tree.glb)
 * - Elevated tree roots at Y = 0.25 along valley floor and cliff base
 */
function SahyadriTrees() {
  const treeGltf = useGLTF('/models/tree.glb');

  const treeInstances = useMemo(() => {
    const configs = [
      // Cliff Base Line (recessed into cliff foot Z <= 4.8 to clear march trail Z = 5.8 to 7.8)
      { pos: [-8.5, 0.2, 4.5], scale: [.4, .7, .45], rotY: 0.4 },
      { pos: [-12.0, 0.2, 4.6], scale: [.4, .7, .45], rotY: 1.2 },
      { pos: [-16.0, 0.2, 4.2], scale: [.4, .7, .45], rotY: 2.5 },
      { pos: [8.0, 0.2, 4.5], scale: [.4, .7, .45], rotY: 0.8 },
      { pos: [11.5, 0.2, 4.8], scale: [.4, .7, .45], rotY: 3.1 },
      { pos: [15.0, 0.2, 4.7], scale: [.4, .7, .45], rotY: 1.8 },

      // Outer Valley Verge (in front of the road toward camera)
      { pos: [-10.0, 0.2, 19.5], scale: [.4, .7, .45], rotY: 2.1 },
      { pos: [-5.5, 0.2, 16.2], scale: [.4, .7, .45], rotY: 0.5 },
      { pos: [6.5, 0.2, 18.0], scale: [.4, .7, .45], rotY: 1.6 },
      { pos: [12.0, 0.2, 17.5], scale: [.4, .7, .45], rotY: 2.9 },
      { pos: [17.5, 0.2, 22.8], scale: [.4, .7, .45], rotY: 0.9 },

      // Fort/Cliff Ledges (untouched)
      { pos: [-12.0, 8.8, -4.0], scale: [.4, .4, .45], rotY: 2.1 },
      { pos: [12.0, 8.8, -3.5], scale: [.4, .4, .45], rotY: 0.5 },
    ];

    return configs.map((config) => {
      const clone = treeGltf.scene.clone();
      clone.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      return { ...config, scene: clone };
    });
  }, [treeGltf.scene]);

  return (
    <group>
      {treeInstances.map((t, idx) => (
        <primitive
          key={`sahyadri-tree-${idx}`}
          object={t.scene}
          position={t.pos as [number, number, number]}
          rotation={[0, t.rotY, 0]}
          scale={t.scale as [number, number, number]}
        />
      ))}
    </group>
  );
}

/**
 * Sahyadri Atmospheric Background Clouds
 */
function SahyadriClouds() {
  const cloudConfigs = useMemo(
    () => [
      { pos: [-40, 25, -60] as [number, number, number], opacity: 0.5, speed: 0.25, width: 18, depth: 3, segments: 10 },
      { pos: [30, 28, -70] as [number, number, number], opacity: 0.6, speed: 0.2, width: 22, depth: 4, segments: 12 },
      { pos: [-15, 32, -85] as [number, number, number], opacity: 0.55, speed: 0.15, width: 25, depth: 5, segments: 14 },
      { pos: [55, 22, -45] as [number, number, number], opacity: 0.45, speed: 0.3, width: 16, depth: 3, segments: 8 },
      { pos: [-65, 20, -35] as [number, number, number], opacity: 0.4, speed: 0.22, width: 14, depth: 2, segments: 8 },
    ],
    []
  );

  return (
    <group>
      {cloudConfigs.map((c, i) => (
        <Cloud
          key={`sahyadri-cloud-${i}`}
          position={c.pos}
          opacity={c.opacity}
          speed={c.speed}
          bounds={[c.width, 2, c.depth]}
          segments={c.segments}
          color="#f8fafc"
        />
      ))}
    </group>
  );
}

/**
 * Clean Mountain Cliff, Fort Architecture & Valley Floor
 */
function Terrain(_props: TerrainProps) {
  // Load 3D Mountain Cliff Model with Sahyadri Basalt & Moss Tint
  const cliffGltf = useGLTF('/models/cliff.glb');
  const cliffScene = useMemo(() => {
    const clone = cliffGltf.scene.clone();
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if ('color' in mat && mat.color) {
              (mat as THREE.MeshStandardMaterial).color.set('#435438');
            }
            if ('roughness' in mat) {
              (mat as THREE.MeshStandardMaterial).roughness = 0.92;
            }
            if ('metalness' in mat) {
              (mat as THREE.MeshStandardMaterial).metalness = 0.05;
            }
          });
        }
      }
    });
    return clone;
  }, [cliffGltf.scene]);

  // Load Fort GLTF Architecture Model
  const fortGltf = useGLTF('/models/fort.glb');
  const fortScene = useMemo(() => {
    const clone = fortGltf.scene.clone();
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return clone;
  }, [fortGltf.scene]);

  // Load 3D Valley Floor Land Model (/models/land.glb)
  const landGltf = useGLTF('/models/land.glb');
  const landTexture = useMemo(() => createProceduralGroundTexture(), []);

  const landScene = useMemo(() => {
    const clone = landGltf.scene.clone();
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        mesh.material = new THREE.MeshStandardMaterial({
          map: landTexture,
          roughness: 0.95,
          metalness: 0.05,
        });
      }
    });
    return clone;
  }, [landGltf.scene, landTexture]);

  return (
    <group>
      {/* 1. WIDE CLEAN VALLEY FLOOR PLANE AT y = 0 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[250, 250]} />
        <meshStandardMaterial color="#2d261e" roughness={0.92} />
      </mesh>

      {/* 3D VALLEY FLOOR LAND MODEL (/models/land.glb) AT position={[0, -0.2, 4.0]} */}
      <primitive
        object={landScene}
        position={[0, -0.2, 4.0]}
        scale={[15.0, 2.0, 15.0]}
        rotation={[0, 0, 0]}
      />

      {/* Distributed Mountain Ranges */}
      <SahyadriMountains />

      {/* 2. 3D SAHYADRI MOUNTAIN CLIFF MODEL (/models/cliff.glb) anchored at [0, 0, 0] */}
      <primitive
        object={cliffScene}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[1.05, 1.05, 1.05]}
      />

      {/* 3. 3D FORT MODEL ADJUSTED BY -0.4u IN -Y DIRECTION TO y = 9.5 */}
      <primitive
        object={fortScene}
        position={[0, 9, -1]}
        scale={[0.45, 0.45, 0.45]}
        rotation={[0, 0, 0]}
      />

      {/* Static RigidBody collider for Rampart Walkway */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[0, 9.7, 0]}
      >
        <mesh visible={false}>
          <boxGeometry args={[18, 1.0, 1.0]} />
        </mesh>
      </RigidBody>

      {/* Organic Mountain Trees */}
      <SahyadriTrees />

      {/* Atmospheric Background Clouds */}
      <SahyadriClouds />
    </group>
  );
}

export interface GameCanvasProps {
  showWireframe?: boolean;
  onStanceChange?: (isCrouched: boolean) => void;
}

/**
 * GameCanvas Main 3D Scene Container
 * - Grounded mountain cliff at [0,0,0], fort model at [0,10.2,0]
 * - Horizon fog args=['#1a1f26', 35, 120]
 * - Wrapped in <ErrorBoundary> & <Suspense fallback={null}>
 */
export default function GameCanvas({ showWireframe = false, onStanceChange }: GameCanvasProps) {
  const controlsRef = useRef<any>(null);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        shadows
        camera={{
          position: [0, 17, 27],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Atmospheric 3D Sky & Mountain Depth Fog */}
        <color attach="background" args={['#87ceeb']} />
        <fog attach="fog" args={['#a8cce8', 45, 130]} />
        <Sky
          distance={450000}
          sunPosition={[25, 12, 30]}
          turbidity={8}
          rayleigh={1.4}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />

        {/* Camera Shake & Vector Controller */}
        <CameraController />

        {/* Cinematic Intro Camera Lerp Controller */}
        <CinematicCamera />

        {/* Elevated Tactical Camera Controls looking at [0, 5, 9] */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[0, 5, 9]}
          enableZoom={true}
          minDistance={8}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={0.2}
          enableDamping
          dampingFactor={0.05}
        />

        {/* STANDARD SCENE LIGHTING */}
        <ambientLight intensity={0.8} />
        <hemisphereLight args={['#dce8cc', '#23331e', 1.1]} />
        <directionalLight
          position={[15, 25, 15]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-camera-near={1}
          shadow-camera-far={80}
          shadow-bias={-0.0003}
        />

        {/* Asynchronous 3D Scene Loading Wrapper with Error Boundary */}
        <ErrorBoundary>
          <Suspense fallback={null}>
            {/* Rapier Physics Engine Container */}
            <Physics gravity={[0, -9.81, 0]}>
              {/* Terrain, Cliff & Fort Environment */}
              <Terrain showWireframe={showWireframe} />

              {/* Red Fortress on Upper Plateau */}
              <RedFort />

              {/* Back Fort Wall covering horizon gap */}
              <BackFortWall />

              {/* Player Scout Controller */}
              <Player controlsRef={controlsRef} onStanceChange={onStanceChange} />

              {/* Visual Stone Supply Pile & Auto-Collection Zone */}
              <StoneSupply position={[-6.0, 9.1, 1.2]} />

              {/* Tactical Throw Point Marker */}
              <ThrowPoint position={[0, 9.1, 1.2]} />

              {/* Dynamic World-Space Guidance Arrow */}
              <NavigationArrow />

              {/* Tactical 3D Impact Prediction & Trajectory Preview */}
              <ImpactPreview />

              {/* In-World Guides (Floating Badges, Parabolic Trajectory Line, Glowing Red Impact Circle) */}
              <AmbushGuideVisuals />

              {/* Sentry Bridge */}
              <Sentry />

              {/* Ambush Strike Zone Collider Box */}
              <AmbushZone position={[0, 3, 6.8]} size={[8.5, 5, 7]} debug={false} />

              {/* Imperial Vanguard Convoy */}
              <VanguardColumn />

              {/* Maratha Cliff Rockslide Trap */}
              <RockTrap />
            </Physics>
          </Suspense>
        </ErrorBoundary>
      </Canvas>
    </div>
  );
}
