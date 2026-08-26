"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { createPlanetLayout, type BuildingLayout, type DistrictLayout } from "@/lib/planet-layout";
import type {
  PlanetCommit,
  PlanetContributor,
  PlanetFile,
  RepoPlanetData,
} from "@/types/repository";

interface PlanetCanvasProps {
  data: RepoPlanetData;
  activeCommit: PlanetCommit | null;
  playing: boolean;
  focusVersion: number;
}

interface HoveredBuilding {
  file: PlanetFile;
  x: number;
  y: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CameraControls({ playing, focusVersion }: { playing: boolean; focusVersion: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(8.7, 6.9, 10.6);
    controls.current?.target.set(0, -0.25, 0);
    controls.current?.update();
  }, [camera, focusVersion]);

  return (
    <OrbitControls
      ref={controls}
      autoRotate={playing}
      autoRotateSpeed={0.28}
      enableDamping
      dampingFactor={0.055}
      enablePan={false}
      minDistance={8.5}
      maxDistance={17}
      minPolarAngle={0.42}
      maxPolarAngle={1.42}
    />
  );
}

function PlanetBase() {
  return (
    <group>
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <cylinderGeometry args={[4.75, 4.58, 0.65, 64]} />
        <meshStandardMaterial color="#17241f" roughness={0.86} metalness={0.12} />
      </mesh>
      <mesh position={[0, -1.12, 0]} receiveShadow>
        <cylinderGeometry args={[4.58, 3.35, 1.18, 64]} />
        <meshStandardMaterial color="#101925" roughness={0.91} metalness={0.2} />
      </mesh>
      <mesh position={[0, -2.05, 0]} rotation={[0, Math.PI / 7, 0]}>
        <coneGeometry args={[3.36, 1.65, 24]} />
        <meshStandardMaterial color="#090f19" roughness={0.96} metalness={0.18} />
      </mesh>
      <mesh position={[0, -1.52, 0]} scale={[1, 0.43, 1]}>
        <icosahedronGeometry args={[3.75, 2]} />
        <meshStandardMaterial color="#0b1520" emissive="#07111c" emissiveIntensity={0.5} roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.15, 0.025, 8, 128]} />
        <meshBasicMaterial color="#43ccff" transparent opacity={0.34} toneMapped={false} />
      </mesh>
      {[1.45, 3.05, 4.25].map((radius, index) => (
        <mesh key={radius} position={[0, 0.12 + index * 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, index === 2 ? 0.035 : 0.055, 8, 96]} />
          <meshBasicMaterial color={index === 1 ? "#60748d" : "#90a2b8"} transparent opacity={0.48} />
        </mesh>
      ))}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.56, 0.7, 0.22, 32]} />
        <meshStandardMaterial color="#142332" metalness={0.72} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.33, 0.43, 0.18, 24]} />
        <meshStandardMaterial color="#d8ff3e" emissive="#7ca500" emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.24, 0.36, 0.82, 12]} />
        <meshStandardMaterial color="#7ba5c7" emissive="#203d58" emissiveIntensity={0.8} metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshBasicMaterial color="#d8ff3e" toneMapped={false} />
      </mesh>
    </group>
  );
}

function DistrictPads({ districts }: { districts: DistrictLayout[] }) {
  return (
    <group>
      {districts.map((district) => (
        <group key={district.name} position={[district.x, 0.12, district.z]}>
          <mesh>
            <cylinderGeometry args={[district.radius, district.radius * 1.05, 0.13, 32]} />
            <meshStandardMaterial
              color={district.color}
              emissive={district.color}
              emissiveIntensity={0.08}
              roughness={0.79}
              metalness={0.22}
            />
          </mesh>
          <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[district.radius * 0.82, 0.018, 6, 64]} />
            <meshBasicMaterial color={district.color} transparent opacity={0.54} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface BuildingInstancesProps {
  buildings: BuildingLayout[];
  activePaths: Set<string>;
  repositoryUrl: string;
  defaultBranch: string;
  onHover: (building: HoveredBuilding | null) => void;
}

function BuildingInstances({
  buildings,
  activePaths,
  repositoryUrl,
  defaultBranch,
  onHover,
}: BuildingInstancesProps) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);
  const bandRef = useRef<THREE.InstancedMesh>(null);
  const secondBandRef = useRef<THREE.InstancedMesh>(null);
  const wireRef = useRef<THREE.InstancedMesh>(null);
  const transform = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const cap = capRef.current;
    const band = bandRef.current;
    const secondBand = secondBandRef.current;
    const wire = wireRef.current;
    if (!body || !cap || !band || !secondBand || !wire) return;

    buildings.forEach((building, index) => {
      const isActive = activePaths.has(building.file.path);
      transform.position.set(building.x, 0.18 + building.height / 2, building.z);
      transform.rotation.set(0, building.rotation, 0);
      transform.scale.set(building.width, building.height, building.depth);
      transform.updateMatrix();
      body.setMatrixAt(index, transform.matrix);

      color
        .set(isActive ? "#efff88" : building.color)
        .lerp(new THREE.Color(isActive ? "#ffffff" : "#9db7cf"), isActive ? 0.08 : 0.48);
      body.setColorAt(index, color);

      transform.position.set(building.x, 0.23 + building.height, building.z);
      transform.scale.set(building.width * 1.3, 0.06, building.depth * 1.3);
      transform.updateMatrix();
      cap.setMatrixAt(index, transform.matrix);
      cap.setColorAt(index, color.clone().offsetHSL(0, 0.08, 0.17));

      transform.position.set(building.x, 0.2 + building.height * 0.67, building.z);
      transform.scale.set(building.width * 1.12, 0.022, building.depth * 1.12);
      transform.updateMatrix();
      band.setMatrixAt(index, transform.matrix);
      band.setColorAt(
        index,
        color.clone().lerp(new THREE.Color(index % 5 === 0 ? "#ffd98a" : "#a9e6ff"), 0.68),
      );

      transform.position.set(building.x, 0.2 + building.height * 0.42, building.z);
      transform.scale.set(building.width * 1.1, 0.018, building.depth * 1.1);
      transform.updateMatrix();
      secondBand.setMatrixAt(index, transform.matrix);

      transform.position.set(building.x, 0.18 + building.height / 2, building.z);
      transform.scale.set(building.width * 1.015, building.height * 1.006, building.depth * 1.015);
      transform.updateMatrix();
      wire.setMatrixAt(index, transform.matrix);
    });

    body.instanceMatrix.needsUpdate = true;
    cap.instanceMatrix.needsUpdate = true;
    band.instanceMatrix.needsUpdate = true;
    secondBand.instanceMatrix.needsUpdate = true;
    wire.instanceMatrix.needsUpdate = true;
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (cap.instanceColor) cap.instanceColor.needsUpdate = true;
    if (band.instanceColor) band.instanceColor.needsUpdate = true;
  }, [activePaths, buildings, color, transform]);

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (event.instanceId === undefined) return;
    const building = buildings[event.instanceId];
    const target = event.nativeEvent.target;
    if (!(target instanceof HTMLElement) || !building) return;
    const bounds = target.getBoundingClientRect();
    onHover({
      file: building.file,
      x: event.nativeEvent.clientX - bounds.left,
      y: event.nativeEvent.clientY - bounds.top,
    });
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.instanceId === undefined) return;
    const building = buildings[event.instanceId];
    if (!building) return;
    const fileUrl = `${repositoryUrl}/blob/${encodeURIComponent(defaultBranch)}/${building.file.path
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, buildings.length]}
        castShadow
        onPointerMove={handlePointerMove}
        onPointerOut={() => onHover(null)}
        onClick={handleClick}
      >
        <boxGeometry />
        <meshStandardMaterial
          vertexColors
          color="#ffffff"
          emissive="#426687"
          emissiveIntensity={0.58}
          roughness={0.34}
          metalness={0.66}
        />
      </instancedMesh>
      <instancedMesh ref={capRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#74cfff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={bandRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#d9f4ff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={secondBandRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#b7e9ff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={wireRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#d8ecff" wireframe transparent opacity={0.28} />
      </instancedMesh>
    </group>
  );
}

function DistrictLabels({ districts }: { districts: DistrictLayout[] }) {
  return (
    <group>
      {districts.slice(0, 4).map((district, index) => (
        <Html
          key={district.name}
          center
          distanceFactor={11}
          position={[district.x, 0.52 + index * 0.04, district.z + district.radius * 0.52]}
        >
          <span className="district-label" style={{ borderColor: district.color, color: district.color }}>
            {district.name}/
          </span>
        </Html>
      ))}
    </group>
  );
}

function RoadLights() {
  const positions = useMemo(() => {
    const values: number[] = [];
    [1.45, 3.05, 4.18].forEach((radius, ringIndex) => {
      const count = 16 + ringIndex * 8;
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2 + ringIndex * 0.13;
        values.push(Math.cos(angle) * radius, 0.22, Math.sin(angle) * radius);
      }
    });
    return new Float32Array(values);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#dff5ff" size={0.045} sizeAttenuation toneMapped={false} />
    </points>
  );
}

function RoadSpokes({ districts }: { districts: DistrictLayout[] }) {
  return (
    <group>
      {districts.map((district) => {
        const length = Math.hypot(district.x, district.z);
        const angle = -Math.atan2(district.z, district.x);
        return (
          <mesh
            key={district.name}
            position={[district.x / 2, 0.14, district.z / 2]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[length, 0.025, 0.09]} />
            <meshStandardMaterial color="#526579" emissive="#1b2b3b" emissiveIntensity={0.65} metalness={0.5} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function TreeInstances() {
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const transform = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => {
        const radius = 0.9 + (index % 3) * 1.18 + ((index * 17) % 9) * 0.025;
        const angle = index * 2.399963;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
      }),
    [],
  );

  useLayoutEffect(() => {
    if (!foliageRef.current || !trunkRef.current) return;
    positions.forEach(([x, z], index) => {
      const scale = 0.72 + (index % 5) * 0.07;
      transform.position.set(x, 0.31, z);
      transform.scale.set(0.055, 0.22, 0.055);
      transform.updateMatrix();
      trunkRef.current?.setMatrixAt(index, transform.matrix);

      transform.position.set(x, 0.54, z);
      transform.scale.set(0.16 * scale, 0.32 * scale, 0.16 * scale);
      transform.updateMatrix();
      foliageRef.current?.setMatrixAt(index, transform.matrix);
    });
    foliageRef.current.instanceMatrix.needsUpdate = true;
    trunkRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, transform]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, positions.length]}>
        <cylinderGeometry args={[1, 1.25, 1, 6]} />
        <meshStandardMaterial color="#6d563e" roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={foliageRef} args={[undefined, undefined, positions.length]}>
        <coneGeometry args={[1, 1.8, 7]} />
        <meshStandardMaterial color="#284f3c" emissive="#10291f" emissiveIntensity={0.5} roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

function Crane({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.035, 1.3, 0.035]} />
        <meshBasicMaterial color="#d8ff3e" toneMapped={false} />
      </mesh>
      <mesh position={[0.27, 1.28, 0]}>
        <boxGeometry args={[0.58, 0.035, 0.035]} />
        <meshBasicMaterial color="#d8ff3e" toneMapped={false} />
      </mesh>
      <mesh position={[0.55, 1.02, 0]}>
        <boxGeometry args={[0.012, 0.52, 0.012]} />
        <meshBasicMaterial color="#d8ff3e" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function CityDetails({ districts }: { districts: DistrictLayout[] }) {
  const first = districts[1] ?? { x: -2, z: 0 };
  const second = districts[4] ?? { x: 2, z: 1 };
  return (
    <group>
      <RoadLights />
      <RoadSpokes districts={districts} />
      <TreeInstances />
      <Crane position={[first.x - 0.35, 0.18, first.z + 0.2]} rotation={0.5} />
      <Crane position={[second.x + 0.3, 0.18, second.z - 0.2]} rotation={-0.8} />
    </group>
  );
}

function ActivityPulse({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * 0.75 + delay) % 1;
    const scale = 0.5 + phase * 2.2;
    if (ring.current) ring.current.scale.setScalar(scale);
    if (material.current) material.current.opacity = (1 - phase) * 0.72;
  });

  return (
    <mesh ref={ring} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.1, 0.135, 32]} />
      <meshBasicMaterial ref={material} color="#d8ff3e" transparent depthWrite={false} />
    </mesh>
  );
}

function ContributorMarkers({
  contributors,
  districts,
}: {
  contributors: PlanetContributor[];
  districts: DistrictLayout[];
}) {
  return (
    <group>
      {contributors.slice(0, 5).map((contributor, index) => {
        const district = districts[(index + 1) % Math.max(1, districts.length)] ?? {
          x: 0,
          z: 0,
          radius: 1,
        };
        const angle = index * 1.72;
        return (
          <group
            key={contributor.login}
            position={[
              district.x + Math.cos(angle) * district.radius * 0.58,
              0.62,
              district.z + Math.sin(angle) * district.radius * 0.58,
            ]}
          >
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.055, 0.14, 4, 8]} />
              <meshStandardMaterial color="#c9d7e7" metalness={0.36} roughness={0.42} />
            </mesh>
            <Html center distanceFactor={8.5} position={[0, 0.08, 0]}>
              <a
                className="contributor-marker"
                href={contributor.url}
                target="_blank"
                rel="noreferrer"
                title={`${contributor.login} · ${contributor.contributions} contributions`}
              >
                {/* GitHub avatars are already optimized and served with CORS-safe URLs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={contributor.avatarUrl} alt={contributor.login} />
              </a>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function IssueBeacons({ count, districts }: { count: number; districts: DistrictLayout[] }) {
  const visible = Math.min(4, Math.max(0, count));
  return (
    <group>
      {Array.from({ length: visible }, (_, index) => {
        const district = districts[(index * 2 + 1) % Math.max(1, districts.length)] ?? {
          x: 0,
          z: 0,
          radius: 1,
        };
        return (
          <group key={index} position={[district.x, 0.7 + index * 0.08, district.z]}>
            <mesh>
              <octahedronGeometry args={[0.09, 0]} />
              <meshBasicMaterial color="#ffc857" toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.26, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.42, 6]} />
              <meshBasicMaterial color="#ffc857" transparent opacity={0.68} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ReleaseCelebration({ visible, tag }: { visible: boolean; tag: string | null }) {
  if (!visible) return null;
  return (
    <group position={[1.55, 2.85, -1.35]}>
      <Sparkles count={24} scale={[1.25, 1.7, 1.25]} size={3.4} speed={0.28} color="#ffd166" />
      <Sparkles count={13} scale={[0.9, 1.1, 0.9]} size={2.6} speed={0.34} color="#9f73ff" />
      <pointLight color="#ffc857" intensity={5} distance={4} decay={2} />
      {tag ? (
        <Html center distanceFactor={12} position={[0.3, 0.55, 0]}>
          <span className="release-label">{tag}</span>
        </Html>
      ) : null}
    </group>
  );
}

function RepositoryWorld({
  data,
  activeCommit,
  onHover,
}: {
  data: RepoPlanetData;
  activeCommit: PlanetCommit | null;
  onHover: (building: HoveredBuilding | null) => void;
}) {
  const layout = useMemo(() => createPlanetLayout(data.files), [data.files]);
  const activePaths = useMemo(() => new Set(activeCommit?.files ?? []), [activeCommit]);
  const pulsingBuildings = layout.buildings
    .filter((building) => activePaths.has(building.file.path) || building.file.recent)
    .slice(0, 10);

  return (
    <Float speed={0.75} rotationIntensity={0.04} floatIntensity={0.22} floatingRange={[-0.08, 0.1]}>
      <group rotation={[0, -0.26, 0]}>
        <PlanetBase />
        <DistrictPads districts={layout.districts} />
        <CityDetails districts={layout.districts} />
        <BuildingInstances
          buildings={layout.buildings}
          activePaths={activePaths}
          repositoryUrl={data.repository.url}
          defaultBranch={data.repository.defaultBranch}
          onHover={onHover}
        />
        {pulsingBuildings.map((building, index) => (
          <ActivityPulse
            key={`${building.file.path}-${activeCommit?.sha ?? "recent"}`}
            position={[building.x, 0.22 + building.height, building.z]}
            delay={index / Math.max(1, pulsingBuildings.length)}
          />
        ))}
        <ContributorMarkers contributors={data.contributors} districts={layout.districts} />
        <DistrictLabels districts={layout.districts} />
        <IssueBeacons count={data.issues.length} districts={layout.districts} />
        <ReleaseCelebration visible={Boolean(data.latestRelease)} tag={data.latestRelease?.tagName ?? null} />
      </group>
    </Float>
  );
}

export function PlanetCanvas({ data, activeCommit, playing, focusVersion }: PlanetCanvasProps) {
  const [hovered, setHovered] = useState<HoveredBuilding | null>(null);

  return (
    <div className="planet-canvas" aria-label={`Interactive 3D planet for ${data.repository.owner}/${data.repository.name}`}>
      <Canvas
        dpr={[1, 1.65]}
        camera={{ position: [8.7, 6.9, 10.6], fov: 37, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerMissed={() => setHovered(null)}
      >
        <fog attach="fog" args={["#020711", 17, 36]} />
        <ambientLight intensity={1.32} color="#9eb9d8" />
        <hemisphereLight color="#cceaff" groundColor="#142016" intensity={1.05} />
        <directionalLight
          position={[-5, 10, 7]}
          color="#dff1ff"
          intensity={5.2}
        />
        <pointLight position={[4, 4, 2]} color="#43ccff" intensity={18} distance={12} decay={2} />
        <pointLight position={[-4, 2, -3]} color="#9f73ff" intensity={10} distance={10} decay={2} />
        <Stars radius={34} depth={22} count={1100} factor={2.4} saturation={0.2} fade speed={0.22} />
        <Sparkles count={28} scale={[11, 6, 11]} size={1.2} speed={0.12} color="#8cb8ff" />
        <RepositoryWorld data={data} activeCommit={activeCommit} onHover={setHovered} />
        <CameraControls playing={playing} focusVersion={focusVersion} />
      </Canvas>

      {hovered ? (
        <div
          className="building-tooltip"
          style={{ left: hovered.x, top: hovered.y }}
          role="status"
        >
          <strong>{hovered.file.path.split("/").at(-1)}</strong>
          <span>{hovered.file.path}</span>
          <small>
            {hovered.file.language} · {formatBytes(hovered.file.size)} · Click to open
          </small>
        </div>
      ) : null}
    </div>
  );
}
