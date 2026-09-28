import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RobloxPart } from '../types';
import { Play, Pause, RotateCcw, Box, Eye, Layers } from 'lucide-react';

interface Roblox3DViewportProps {
  parts?: RobloxPart[];
  assetName?: string;
  onPartSelect?: (part: RobloxPart) => void;
}

export const Roblox3DViewport: React.FC<Roblox3DViewportProps> = ({
  parts = [],
  assetName = 'Roblox Asset',
  onPartSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedPartName, setSelectedPartName] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const partsGroupRef = useRef<THREE.Group | null>(null);
  const isPlayingRef = useRef<boolean>(true);
  const isWireframeRef = useRef<boolean>(false);

  isPlayingRef.current = isPlaying;
  isWireframeRef.current = isWireframe;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Studio dark sky
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(16, 12, 20);
    camera.lookAt(0, 3, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(20, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    blueRimLight.position.set(-20, 15, -20);
    scene.add(blueRimLight);

    // 5. Classic Roblox Baseplate (512x512 studs feel)
    const baseplateGeo = new THREE.BoxGeometry(60, 2, 60);
    const baseplateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2
    });
    const baseplate = new THREE.Mesh(baseplateGeo, baseplateMat);
    baseplate.position.y = -1;
    baseplate.receiveShadow = true;
    scene.add(baseplate);

    // Stud grid lines
    const gridHelper = new THREE.GridHelper(60, 60, 0x38bdf8, 0x334155);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Roblox Spawn Location decal plate
    const spawnGeo = new THREE.BoxGeometry(8, 0.2, 8);
    const spawnMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4
    });
    const spawnMesh = new THREE.Mesh(spawnGeo, spawnMat);
    spawnMesh.position.set(0, 0.1, 0);
    spawnMesh.receiveShadow = true;
    scene.add(spawnMesh);

    // Spawn symbol ring
    const spawnRingGeo = new THREE.RingGeometry(1.5, 2.5, 32);
    const spawnRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide
    });
    const spawnRing = new THREE.Mesh(spawnRingGeo, spawnRingMat);
    spawnRing.rotation.x = -Math.PI / 2;
    spawnRing.position.set(0, 0.22, 0);
    scene.add(spawnRing);

    // Scale reference: Roblox R6 Character Dummy
    const dummyGroup = new THREE.Group();
    dummyGroup.position.set(-6, 0, -4);
    // Torso (2x2x1 studs)
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), torsoMat);
    torso.position.y = 3;
    dummyGroup.add(torso);
    // Head (1.25 radius sphere/block)
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16), headMat);
    head.position.y = 4.6;
    dummyGroup.add(head);
    // Limbs
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), limbMat);
    leftArm.position.set(-1.6, 3, 0);
    dummyGroup.add(leftArm);
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), limbMat);
    rightArm.position.set(1.6, 3, 0);
    dummyGroup.add(rightArm);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), legMat);
    leftLeg.position.set(-0.55, 1, 0);
    dummyGroup.add(leftLeg);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), legMat);
    rightLeg.position.set(0.55, 1, 0);
    dummyGroup.add(rightLeg);
    scene.add(dummyGroup);

    // 6. Group for dynamic parts
    const partsGroup = new THREE.Group();
    partsGroupRef.current = partsGroup;
    scene.add(partsGroup);

    // Simple Orbit Controls using mouse events
    let isDragging = false;
    let isRightDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = {
      radius: 28,
      theta: Math.PI / 4,
      phi: Math.PI / 3.5
    };
    let target = new THREE.Vector3(0, 3, 0);

    const updateCameraPos = () => {
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));
      spherical.radius = Math.max(5, Math.min(100, spherical.radius));
      camera.position.x = target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(target);
    };
    updateCameraPos();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging = true;
      if (e.button === 2) isRightDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (isDragging) {
        spherical.theta -= deltaX * 0.008;
        spherical.phi -= deltaY * 0.008;
        updateCameraPos();
      } else if (isRightDragging) {
        // Pan
        const right = new THREE.Vector3();
        camera.getWorldDirection(right);
        right.cross(camera.up).normalize();
        target.addScaledVector(right, -deltaX * 0.04);
        target.y += deltaY * 0.04;
        updateCameraPos();
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      isRightDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.03;
      updateCameraPos();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Resize handler
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
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // If playing, simulate floating/pulsing effects on parts
      if (isPlayingRef.current && partsGroupRef.current) {
        partsGroupRef.current.children.forEach((child, index) => {
          if (child.name.toLowerCase().includes('crystal') || child.name.toLowerCase().includes('core')) {
            child.position.y += Math.sin(elapsedTime * 2 + index) * 0.006;
            child.rotation.y += 0.015;
          } else if (child.name.toLowerCase().includes('ring') || child.name.toLowerCase().includes('orbit')) {
            child.rotation.y += 0.02;
            child.rotation.z += 0.008;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  // Update dynamic parts whenever `parts` prop changes
  useEffect(() => {
    if (!partsGroupRef.current || !sceneRef.current) return;
    const group = partsGroupRef.current;

    // Clear old parts
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    if (!parts || parts.length === 0) return;

    parts.forEach((p, idx) => {
      const sizeX = p.size?.x || 2;
      const sizeY = p.size?.y || 2;
      const sizeZ = p.size?.z || 2;

      let geom: THREE.BufferGeometry;
      if (p.shape === 'Cylinder') {
        geom = new THREE.CylinderGeometry(sizeX / 2, sizeX / 2, sizeY, 32);
      } else if (p.shape === 'Ball') {
        geom = new THREE.SphereGeometry(sizeX / 2, 32, 16);
      } else if (p.shape === 'Wedge') {
        // Simple triangular wedge
        geom = new THREE.ConeGeometry(sizeX / 2, sizeY, 4);
      } else {
        geom = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
      }

      // Material mapping
      let colorVal = 0x38bdf8;
      if (p.color) {
        colorVal = parseInt(p.color.replace('#', '0x'), 16) || 0x38bdf8;
      }

      let mat: THREE.Material;
      const isNeon = p.material === 'Neon' || p.material === 'ForceField';
      if (isNeon) {
        mat = new THREE.MeshStandardMaterial({
          color: colorVal,
          emissive: colorVal,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          wireframe: isWireframeRef.current
        });
      } else if (p.material === 'Glass') {
        mat = new THREE.MeshStandardMaterial({
          color: colorVal,
          roughness: 0.1,
          metalness: 0.1,
          transparent: true,
          opacity: 0.45,
          wireframe: isWireframeRef.current
        });
      } else if (p.material === 'Metal') {
        mat = new THREE.MeshStandardMaterial({
          color: colorVal,
          roughness: 0.3,
          metalness: 0.85,
          wireframe: isWireframeRef.current
        });
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: colorVal,
          roughness: 0.5,
          metalness: 0.1,
          wireframe: isWireframeRef.current
        });
      }

      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = p.name || `Part_${idx}`;
      mesh.position.set(p.position?.x || 0, p.position?.y || 1, p.position?.z || 0);
      if (p.rotation) {
        mesh.rotation.set(
          THREE.MathUtils.degToRad(p.rotation.x || 0),
          THREE.MathUtils.degToRad(p.rotation.y || 0),
          THREE.MathUtils.degToRad(p.rotation.z || 0)
        );
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Add a subtle point light if Neon
      if (isNeon) {
        const pointLight = new THREE.PointLight(colorVal, 1.5, 12);
        mesh.add(pointLight);
      }

      group.add(mesh);
    });
  }, [parts]);

  // Update wireframe when toggled
  useEffect(() => {
    if (!partsGroupRef.current) return;
    partsGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material as any;
        if (mat) mat.wireframe = isWireframe;
      }
    });
  }, [isWireframe]);

  const handleResetCamera = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(16, 12, 20);
    cameraRef.current.lookAt(0, 3, 0);
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D Viewport Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Roblox Studio Viewport</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-mono">{assetName}</span>
          <span className="text-slate-400">({parts.length} parts)</span>
        </div>

        {/* Viewport Control Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Physics' : 'Run Physics Simulation'}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              isPlaying ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-mono">{isPlaying ? 'Running' : 'Paused'}</span>
          </button>

          <button
            onClick={handleResetCamera}
            title="Reset Camera View"
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsWireframe(!isWireframe)}
            title="Toggle Wireframe Mesh"
            className={`p-1.5 rounded text-xs transition-colors ${
              isWireframe ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The 3D Canvas Mount Point */}
      <div ref={containerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Viewport Bottom Info Bar */}
      <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none flex items-center justify-between text-[11px] text-slate-400">
        <div className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-800 font-mono">
          Left Drag: Orbit | Right Drag: Pan | Scroll: Zoom
        </div>
        <div className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-800 font-mono text-emerald-400">
          Scale: 1 Stud = 0.28m | Grid: 4x4 Studs
        </div>
      </div>
    </div>
  );
};
