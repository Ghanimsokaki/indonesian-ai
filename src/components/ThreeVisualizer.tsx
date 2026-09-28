import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RobloxPart } from '../types';
import { MaterialPropertyPanel } from './MaterialPropertyPanel';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Eye, 
  Grid, 
  User, 
  Box, 
  Compass, 
  Maximize2,
  Info,
  Sparkles,
  Sliders
} from 'lucide-react';

interface ThreeVisualizerProps {
  jsonData: any; // Raw JSON or parsed object representing the 3d-asset
  assetName?: string;
  onSelectPart?: (part: RobloxPart | null) => void;
  selectedPartName?: string | null;
  onUpdateParts?: (updatedParts: RobloxPart[]) => void;
  onDeployToStudio?: () => void;
  isDeploying?: boolean;
}

export const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({
  jsonData,
  assetName = '3D Asset Visualization',
  onSelectPart,
  selectedPartName,
  onUpdateParts,
  onDeployToStudio,
  isDeploying
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Viewport Settings
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDummy, setShowDummy] = useState<boolean>(true);
  const [showMaterialPanel, setShowMaterialPanel] = useState<boolean>(true);
  const [activeCameraAngle, setActiveCameraAngle] = useState<'iso' | 'front' | 'top' | 'side'>('iso');
  const [selectedPart, setSelectedPart] = useState<RobloxPart | null>(null);

  // References for Three.js instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const partsGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const dummyGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Ref tracking for requestAnimationFrame
  const isPlayingRef = useRef<boolean>(true);
  const isWireframeRef = useRef<boolean>(false);
  isPlayingRef.current = isPlaying;
  isWireframeRef.current = isWireframe;

  // Real-time parsing of the JSON 'data' field
  const parsedParts: RobloxPart[] = useMemo(() => {
    if (!jsonData) return [];

    let dataObj = jsonData;
    if (typeof jsonData === 'string') {
      try {
        dataObj = JSON.parse(jsonData);
      } catch {
        return [];
      }
    }

    // Extract parts array from standard schemas
    let rawParts: any[] = [];
    if (Array.isArray(dataObj)) {
      rawParts = dataObj;
    } else if (Array.isArray(dataObj.parts)) {
      rawParts = dataObj.parts;
    } else if (dataObj.data && Array.isArray(dataObj.data.parts)) {
      rawParts = dataObj.data.parts;
    } else if (dataObj.model && Array.isArray(dataObj.model.parts)) {
      rawParts = dataObj.model.parts;
    } else {
      if (dataObj.shape || dataObj.size || dataObj.position) {
        rawParts = [dataObj];
      }
    }

    // Normalize each part to clean RobloxPart format with material properties
    return rawParts.map((p, idx) => {
      // Parse size
      let sx = 2, sy = 2, sz = 2;
      if (Array.isArray(p.size)) {
        sx = Number(p.size[0]) || 2;
        sy = Number(p.size[1]) || 2;
        sz = Number(p.size[2]) || 2;
      } else if (p.size && typeof p.size === 'object') {
        sx = Number(p.size.x) || 2;
        sy = Number(p.size.y) || 2;
        sz = Number(p.size.z) || 2;
      }

      // Parse position
      let px = 0, py = 1, pz = 0;
      if (Array.isArray(p.position)) {
        px = Number(p.position[0]) || 0;
        py = Number(p.position[1]) || 1;
        pz = Number(p.position[2]) || 0;
      } else if (p.position && typeof p.position === 'object') {
        px = Number(p.position.x) || 0;
        py = Number(p.position.y) || 1;
        pz = Number(p.position.z) || 0;
      }

      // Parse rotation
      let rx = 0, ry = 0, rz = 0;
      if (Array.isArray(p.rotation)) {
        rx = Number(p.rotation[0]) || 0;
        ry = Number(p.rotation[1]) || 0;
        rz = Number(p.rotation[2]) || 0;
      } else if (p.rotation && typeof p.rotation === 'object') {
        rx = Number(p.rotation.x) || 0;
        ry = Number(p.rotation.y) || 0;
        rz = Number(p.rotation.z) || 0;
      }

      const mat = p.material || 'SmoothPlastic';
      const defaultTrans = mat === 'Glass' ? 0.45 : mat === 'ForceField' ? 0.35 : 0;
      const defaultMetal = mat === 'Metal' || mat === 'DiamondPlate' || mat === 'CorrodedMetal' || mat === 'Foil' ? 0.9 : 0.05;
      const defaultRough = mat === 'Metal' ? 0.2 : mat === 'Glass' ? 0.05 : mat === 'WoodPlanks' ? 0.8 : 0.45;

      return {
        name: p.name || `Part_${idx + 1}`,
        shape: p.shape || 'Block',
        size: { x: sx, y: sy, z: sz },
        position: { x: px, y: py, z: pz },
        rotation: { x: rx, y: ry, z: rz },
        color: p.color || p.brickColor || '#38bdf8',
        material: mat,
        anchored: p.anchored !== false,
        canCollide: p.canCollide !== false,
        transparency: typeof p.transparency === 'number' ? p.transparency : defaultTrans,
        metallic: typeof p.metallic === 'number' ? p.metallic : defaultMetal,
        roughness: typeof p.roughness === 'number' ? p.roughness : defaultRough,
        reflectance: typeof p.reflectance === 'number' ? p.reflectance : (typeof p.metallic === 'number' ? p.metallic * 0.85 : 0),
        emissiveIntensity: typeof p.emissiveIntensity === 'number' ? p.emissiveIntensity : (mat === 'Neon' ? 1.4 : 0)
      };
    });
  }, [jsonData]);

  // Handle live updating of part properties
  const handleUpdatePart = (partName: string, updatedProps: Partial<RobloxPart>) => {
    const nextParts = parsedParts.map(p => {
      if (p.name === partName) {
        return { ...p, ...updatedProps };
      }
      return p;
    });
    if (onUpdateParts) {
      onUpdateParts(nextParts);
    }
  };

  const handleBulkUpdate = (updatedProps: Partial<RobloxPart>) => {
    const nextParts = parsedParts.map(p => ({ ...p, ...updatedProps }));
    if (onUpdateParts) {
      onUpdateParts(nextParts);
    }
  };

  // Compute bounding box dimensions and stats
  const stats = useMemo(() => {
    let polyCount = 0;
    let minX = 0, maxX = 0, minY = 0, maxY = 0, minZ = 0, maxZ = 0;

    parsedParts.forEach((p) => {
      const sx = p.size.x;
      const sy = p.size.y;
      const sz = p.size.z;
      const px = p.position.x;
      const py = p.position.y;
      const pz = p.position.z;

      minX = Math.min(minX, px - sx / 2);
      maxX = Math.max(maxX, px + sx / 2);
      minY = Math.min(minY, py - sy / 2);
      maxY = Math.max(maxY, py + sy / 2);
      minZ = Math.min(minZ, pz - sz / 2);
      maxZ = Math.max(maxZ, pz + sz / 2);

      const shapeLower = p.shape?.toLowerCase() || 'block';
      if (shapeLower.includes('ball') || shapeLower.includes('sphere')) {
        polyCount += 768;
      } else if (shapeLower.includes('cylinder')) {
        polyCount += 128;
      } else {
        polyCount += 12;
      }
    });

    return {
      partCount: parsedParts.length,
      estimatedPolys: polyCount,
      bounds: {
        width: Math.max(1, Math.round(maxX - minX)),
        height: Math.max(1, Math.round(maxY - minY)),
        depth: Math.max(1, Math.round(maxZ - minZ))
      }
    };
  }, [parsedParts]);

  // Main Three.js Lifecycle
  useEffect(() => {
    if (!containerRef.current) return;
    const dom = containerRef.current;
    const width = dom.clientWidth || 600;
    const height = dom.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep cyber dark
    scene.fog = new THREE.FogExp2(0x060913, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 14, 22);
    cameraRef.current = camera;

    // 3. Renderer with physically correct lighting & shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Append canvas to container
    while (dom.firstChild) dom.removeChild(dom.firstChild);
    dom.appendChild(renderer.domElement);

    // 4. Lighting System
    const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-15, 10, -15);
    scene.add(fillLight);

    // 5. Classic Roblox Baseplate
    const baseplateGeom = new THREE.BoxGeometry(64, 1, 64);
    const baseplateMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
      metalness: 0.1
    });
    const baseplate = new THREE.Mesh(baseplateGeom, baseplateMat);
    baseplate.position.y = -0.5;
    baseplate.receiveShadow = true;
    scene.add(baseplate);

    // 6. Stud Grid Helper (Dark slate Roblox Stud Grid)
    const gridHelper = new THREE.GridHelper(64, 64, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // 7. Dummy R15 Scale Reference
    const dummyGroup = new THREE.Group();
    dummyGroup.position.set(-8, 0, -8);

    const dummyMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.1,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), dummyMat);
    torso.position.y = 3;
    dummyGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), dummyMat);
    head.position.y = 4.6;
    dummyGroup.add(head);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2, 0.9), dummyMat);
    leftLeg.position.set(-0.55, 1, 0);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2, 0.9), dummyMat);
    rightLeg.position.set(0.55, 1, 0);
    dummyGroup.add(leftLeg, rightLeg);

    scene.add(dummyGroup);
    dummyGroupRef.current = dummyGroup;

    // 8. Parts Container Group
    const partsGroup = new THREE.Group();
    scene.add(partsGroup);
    partsGroupRef.current = partsGroup;

    // 9. Interactive Orbit & Pan Controls
    let isLeftDown = false;
    let isRightDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const target = new THREE.Vector3(0, 3, 0);
    const spherical = new THREE.Spherical(32, Math.PI / 3.5, Math.PI / 4);

    const updateCamera = () => {
      spherical.radius = Math.max(4, Math.min(spherical.radius, 120));
      spherical.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, spherical.phi));
      camera.position.setFromSpherical(spherical).add(target);
      camera.lookAt(target);
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isLeftDown = true;
      if (e.button === 2) isRightDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (isLeftDown) {
        spherical.theta -= deltaX * 0.007;
        spherical.phi -= deltaY * 0.007;
        updateCamera();
      } else if (isRightDown) {
        target.x -= deltaX * 0.03;
        target.y += deltaY * 0.03;
        updateCamera();
      }
    };

    const onMouseUp = () => {
      isLeftDown = false;
      isRightDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.035;
      updateCamera();
    };

    // Raycast click to select parts
    const onClick = (e: MouseEvent) => {
      if (!partsGroupRef.current || !cameraRef.current) return;
      const rect = dom.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(partsGroupRef.current.children, true);

      if (intersects.length > 0) {
        // Find top-level mesh
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.part && hitObj.parent && hitObj.parent !== partsGroupRef.current) {
          hitObj = hitObj.parent;
        }

        const partData = hitObj?.userData?.part as RobloxPart;
        if (partData) {
          setSelectedPart(partData);
          if (onSelectPart) onSelectPart(partData);
        }
      }
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Real-time animation physics if playing
      if (isPlayingRef.current && partsGroupRef.current) {
        partsGroupRef.current.children.forEach((child, idx) => {
          const nameLower = child.name.toLowerCase();
          if (nameLower.includes('core') || nameLower.includes('crystal') || nameLower.includes('plasma')) {
            child.position.y += Math.sin(time * 2.5 + idx) * 0.007;
            child.rotation.y += 0.015;
          } else if (nameLower.includes('ring') || nameLower.includes('orbit')) {
            child.rotation.y += 0.02;
            child.rotation.x += 0.008;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, []);

  // Update camera on panel toggle or container resize
  useEffect(() => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    cameraRef.current.aspect = w / h;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(w, h);
  }, [showMaterialPanel]);

  // Real-time geometry and material sync whenever parsedParts changes
  useEffect(() => {
    if (!partsGroupRef.current) return;
    const group = partsGroupRef.current;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    if (!parsedParts || parsedParts.length === 0) return;

    parsedParts.forEach((p, idx) => {
      const sx = Math.max(0.1, p.size.x);
      const sy = Math.max(0.1, p.size.y);
      const sz = Math.max(0.1, p.size.z);

      let geom: THREE.BufferGeometry;
      const shapeLower = p.shape?.toLowerCase() || 'block';

      if (shapeLower.includes('cylinder')) {
        geom = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 32);
      } else if (shapeLower.includes('ball') || shapeLower.includes('sphere')) {
        geom = new THREE.SphereGeometry(sx / 2, 32, 24);
      } else if (shapeLower.includes('wedge')) {
        geom = new THREE.ConeGeometry(sx / 2, sy, 4);
      } else if (shapeLower.includes('cone')) {
        geom = new THREE.ConeGeometry(sx / 2, sy, 32);
      } else if (shapeLower.includes('torus') || shapeLower.includes('ring')) {
        geom = new THREE.TorusGeometry(sx / 2, sy / 4, 16, 32);
      } else {
        geom = new THREE.BoxGeometry(sx, sy, sz);
      }

      // Color mapping
      let colorHex = 0x38bdf8;
      if (p.color) {
        if (p.color.startsWith('#')) {
          colorHex = parseInt(p.color.replace('#', '0x'), 16) || 0x38bdf8;
        } else if (p.color.toLowerCase() === 'bright red') colorHex = 0xef4444;
        else if (p.color.toLowerCase() === 'bright green') colorHex = 0x10b981;
        else if (p.color.toLowerCase() === 'cyan') colorHex = 0x06b6d4;
        else if (p.color.toLowerCase() === 'yellow') colorHex = 0xfacc15;
      }

      const isNeon = p.material === 'Neon' || p.material === 'ForceField';
      const isSelected = (selectedPartName && selectedPartName === p.name) || (selectedPart && selectedPart.name === p.name);

      // Transparency
      const userTransparency = typeof p.transparency === 'number' ? Math.max(0, Math.min(1, p.transparency)) : (p.material === 'Glass' ? 0.45 : 0);
      const isTransparent = userTransparency > 0 || p.material === 'Glass' || p.material === 'ForceField';
      const opacity = isTransparent ? Math.max(0.05, 1 - userTransparency) : 1;

      // PBR Metallic & Roughness
      let defaultMetalness = 0.05;
      let defaultRoughness = 0.45;
      if (p.material === 'Metal' || p.material === 'DiamondPlate' || p.material === 'CorrodedMetal') {
        defaultMetalness = 0.95;
        defaultRoughness = 0.2;
      } else if (p.material === 'Foil') {
        defaultMetalness = 0.9;
        defaultRoughness = 0.15;
      } else if (p.material === 'Glass') {
        defaultMetalness = 0.1;
        defaultRoughness = 0.05;
      } else if (p.material === 'Neon') {
        defaultMetalness = 0.0;
        defaultRoughness = 0.1;
      }

      const metalness = typeof p.metallic === 'number' ? p.metallic : defaultMetalness;
      const roughness = typeof p.roughness === 'number' ? p.roughness : defaultRoughness;
      const emissiveIntensity = typeof p.emissiveIntensity === 'number' ? p.emissiveIntensity : (isSelected ? 1.5 : 1.0);

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: isNeon ? colorHex : 0x000000,
        emissiveIntensity: isNeon ? emissiveIntensity : 0,
        metalness: metalness,
        roughness: roughness,
        transparent: isTransparent,
        opacity: opacity,
        wireframe: isWireframe,
        depthWrite: opacity > 0.8
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = p.name || `Part_${idx + 1}`;
      mesh.position.set(p.position.x, p.position.y, p.position.z);

      if (p.rotation) {
        mesh.rotation.set(
          THREE.MathUtils.degToRad(p.rotation.x || 0),
          THREE.MathUtils.degToRad(p.rotation.y || 0),
          THREE.MathUtils.degToRad(p.rotation.z || 0)
        );
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Attach original part data for click raycasting
      mesh.userData = { part: p };

      // Add a dynamic point light if Neon
      if (isNeon) {
        const pointLight = new THREE.PointLight(colorHex, 1.8, 16);
        mesh.add(pointLight);
      }

      // If selected, add an outline bounding box
      if (isSelected) {
        const boxHelper = new THREE.BoxHelper(mesh, 0xfacc15);
        mesh.add(boxHelper);
      }

      group.add(mesh);
    });
  }, [parsedParts, isWireframe, selectedPartName, selectedPart]);

  // Toggle Grid
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Toggle Dummy
  useEffect(() => {
    if (dummyGroupRef.current) {
      dummyGroupRef.current.visible = showDummy;
    }
  }, [showDummy]);

  // Camera Presets
  const setCameraPreset = (angle: 'iso' | 'front' | 'top' | 'side') => {
    if (!cameraRef.current) return;
    setActiveCameraAngle(angle);

    if (angle === 'iso') {
      cameraRef.current.position.set(18, 14, 22);
      cameraRef.current.lookAt(0, 3, 0);
    } else if (angle === 'front') {
      cameraRef.current.position.set(0, 6, 26);
      cameraRef.current.lookAt(0, 3, 0);
    } else if (angle === 'top') {
      cameraRef.current.position.set(0, 32, 0.01);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (angle === 'side') {
      cameraRef.current.position.set(26, 6, 0);
      cameraRef.current.lookAt(0, 3, 0);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col md:flex-row">
      
      {/* 3D Canvas Viewport Column */}
      <div className="relative flex-1 h-full min-h-[360px] overflow-hidden flex flex-col">
        
        {/* 3D Viewport Header Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          
          {/* Left Status & Title Pill */}
          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 shadow-lg text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-100">{assetName}</span>
            <span className="text-slate-500 font-mono">|</span>
            <span className="text-amber-400 font-mono font-semibold">{stats.partCount} Parts</span>
            <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
              (~{stats.estimatedPolys} polys)
            </span>
          </div>

          {/* Right Viewport Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/70 shadow-lg">
            
            {/* Material Studio Toggle */}
            <button
              onClick={() => setShowMaterialPanel(!showMaterialPanel)}
              title={showMaterialPanel ? 'Hide Material Property Studio' : 'Open Material Property Studio'}
              className={`px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 font-semibold ${
                showMaterialPanel 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-750'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Materials</span>
            </button>

            {/* Play/Pause Physics */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause Simulation' : 'Run Real-Time Simulation'}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                isPlaying ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden md:inline font-mono text-[11px]">{isPlaying ? 'Active' : 'Paused'}</span>
            </button>

            {/* Wireframe Toggle */}
            <button
              onClick={() => setIsWireframe(!isWireframe)}
              title="Toggle Wireframe"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isWireframe ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Stud Grid"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                showGrid ? 'bg-slate-800 text-sky-400' : 'text-slate-500 hover:bg-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            {/* Dummy Scale Toggle */}
            <button
              onClick={() => setShowDummy(!showDummy)}
              title="Toggle Character Scale Reference"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                showDummy ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
            </button>

            {/* Camera Reset */}
            <button
              onClick={() => setCameraPreset('iso')}
              title="Reset Camera View"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Camera Angle Presets Floating Widget */}
        <div className="absolute top-14 left-3 z-10 flex flex-col gap-1 pointer-events-auto bg-slate-900/80 backdrop-blur-sm p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => setCameraPreset('iso')}
            className={`px-2 py-0.5 rounded text-left transition-colors ${activeCameraAngle === 'iso' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Iso
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className={`px-2 py-0.5 rounded text-left transition-colors ${activeCameraAngle === 'front' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Front
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className={`px-2 py-0.5 rounded text-left transition-colors ${activeCameraAngle === 'top' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Top
          </button>
          <button
            onClick={() => setCameraPreset('side')}
            className={`px-2 py-0.5 rounded text-left transition-colors ${activeCameraAngle === 'side' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Side
          </button>
        </div>

        {/* Three.js Canvas DOM Container */}
        <div ref={containerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Viewport Bottom Info Bar */}
        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none flex items-center justify-between text-[11px] text-slate-400">
          <div className="bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
            Orbit: Drag | Pan: Right Click | Zoom: Scroll | Click: Select Part
          </div>
          <div className="bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-emerald-400 hidden sm:block">
            Size: {stats.bounds.width}×{stats.bounds.height}×{stats.bounds.depth} studs
          </div>
        </div>
      </div>

      {/* Right Column: Material Property Panel Studio */}
      {showMaterialPanel && (
        <div className="w-full md:w-80 lg:w-88 h-80 md:h-full shrink-0 border-t md:border-t-0 md:border-l border-slate-800 animate-in slide-in-from-right duration-200">
          <MaterialPropertyPanel
            parts={parsedParts}
            selectedPartName={selectedPartName || selectedPart?.name || null}
            onSelectPart={(part) => {
              setSelectedPart(part);
              if (onSelectPart) onSelectPart(part);
            }}
            onUpdatePart={handleUpdatePart}
            onBulkUpdate={handleBulkUpdate}
            onDeployToStudio={onDeployToStudio}
            isDeploying={isDeploying}
          />
        </div>
      )}

    </div>
  );
};
