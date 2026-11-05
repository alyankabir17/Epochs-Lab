import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { 
  RotateCcw, Download, UploadCloud, 
  Terminal, FileText, Database, GitMerge 
} from 'lucide-react';

// --- DATA PIPELINE ---
const pipelineData = [
  { stage: 'Stage 1', title: 'Prompt Analysis', status: 'Done', pos: [-6, 1, -2] },
  { stage: 'Stage 2', title: 'Dataset Search', status: 'Done', pos: [-4, 0, 0] },
  { stage: 'Stage 3', title: 'Data Profiling', status: 'Done', pos: [-2, -1, 1.5] },
  { stage: 'Stage 4', title: 'Preprocessing', status: 'Done', pos: [0, 0, 2] },
  { stage: 'Stage 5', title: 'Model Training', status: 'Done', pos: [2, 1, 1.5] },
  { stage: 'Stage 6', title: 'Evaluation', status: 'Running', pos: [4, 0, 0] },
  { stage: 'Stage 7', title: 'Report', status: 'Pending', pos: [6, -1, -2] },
];

// --- 3D CANVAS PIPELINE COMPONENT (Raw Three.js to avoid R3F crashes) ---
function HolographicPipeline() {
  const mountRef = useRef(null);
  const labelsRef = useRef([]);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const pointLight = new THREE.PointLight(0x00E5D9, 1.5);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // 3. Build Nodes & Lines
    const group = new THREE.Group();
    scene.add(group);
    
    const nodes = [];
    const linePoints = [];

    pipelineData.forEach((data) => {
      const isRunning = data.status === 'Running';
      const isDone = data.status === 'Done';
      const isPending = data.status === 'Pending';

      const color = isRunning ? 0x00E5D9 : isDone ? 0x10B981 : 0x475569;
      const emissiveIntensity = isRunning ? 2 : isDone ? 0.8 : 0;

      // Inner Node Geometry (Icosahedron)
      const geo = new THREE.IcosahedronGeometry(isRunning ? 0.6 : 0.4, 0);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity,
        wireframe: isPending || isRunning,
        transparent: true,
        opacity: isPending ? 0.3 : 0.8
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);

      // Outer Glow Shell for Active Node
      if (isRunning) {
        const outerGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const outerMat = new THREE.MeshBasicMaterial({ color: 0x00E5D9, transparent: true, opacity: 0.15, wireframe: true });
        const outerMesh = new THREE.Mesh(outerGeo, outerMat);
        mesh.add(outerMesh);
      }

      group.add(mesh);
      nodes.push({ mesh, isRunning, pos: mesh.position });
      linePoints.push(new THREE.Vector3(data.pos[0], data.pos[1], data.pos[2]));
    });

    // Connecting Laser Beam
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4E8CD8, transparent: true, opacity: 0.3, linewidth: 2 });
    group.add(new THREE.Line(lineGeo, lineMat));

    // 4. Mouse Drag to Rotate Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRot = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    
    const onPointerMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouse.x;
        const deltaY = e.clientY - prevMouse.y;
        targetRot.y += deltaX * 0.005;
        targetRot.x += deltaY * 0.005;
        // Clamp vertical rotation
        targetRot.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, targetRot.x));
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };
    
    const onPointerUp = () => { isDragging = false; };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 5. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth group rotation
      group.rotation.y += (targetRot.y - group.rotation.y) * 0.1;
      group.rotation.x += (targetRot.x - group.rotation.x) * 0.1;

      nodes.forEach((node, i) => {
        // Pulse & Spin Active Node
        if (node.isRunning) {
          node.mesh.rotation.y = t * 1.5;
          node.mesh.rotation.x = t * 0.8;
          const scale = 1 + Math.sin(t * 4) * 0.15;
          node.mesh.scale.set(scale, scale, scale);
        } else {
          node.mesh.rotation.y = t * 0.5;
          node.mesh.rotation.x = t * 0.2;
        }

        // Map 3D Coordinates to 2D Screen Space for HTML Labels
        if (labelsRef.current[i]) {
          const vector = node.pos.clone();
          vector.applyMatrix4(group.matrixWorld); // Apply group rotation
          vector.project(camera);
          
          const x = (vector.x * 0.5 + 0.5) * mountRef.current.clientWidth;
          const y = (vector.y * -0.5 + 0.5) * mountRef.current.clientHeight;
          
          // Render only if strictly in front of camera
          if (vector.z < 1) {
            labelsRef.current[i].style.transform = `translate3d(${x}px, ${y + 55}px, 0) translate(-50%, -50%)`;
            labelsRef.current[i].style.display = 'flex';
            labelsRef.current[i].style.zIndex = Math.round((1 - vector.z) * 100);
          } else {
            labelsRef.current[i].style.display = 'none';
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden">
      {/* HTML Labels overlay synced with 3D nodes */}
      {pipelineData.map((data, i) => {
        const isRunning = data.status === 'Running';
        const isDone = data.status === 'Done';
        return (
          <div
            key={i}
            ref={el => labelsRef.current[i] = el}
            className="absolute top-0 left-0 flex flex-col items-center justify-center w-32 text-center backdrop-blur-md bg-slate-950/60 p-2 rounded-lg border border-slate-700/50 shadow-2xl pointer-events-none select-none"
            style={{ willChange: 'transform' }}
          >
            <span className={`text-[10px] uppercase font-bold tracking-wider ${
              isRunning ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {data.stage}
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5">{data.title}</span>
            <span className="text-[10px] text-slate-400 mt-1">{data.status}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- MAIN APP LAYOUT ---
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <header className="px-8 py-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">House prices</h1>
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Running
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Estimate the sale price of a house from its size, location and age. 
            Classification task currently in Evaluation phase.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <UploadCloud className="w-4 h-4 text-slate-400" /> Upload CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Download className="w-4 h-4 text-slate-400" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        </div>
      </header>

      {/* WORKSPACE SPLIT */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-100px)]">
        
        {/* LEFT: 3D Holographic Pipeline (60%) */}
        <div className="w-full lg:w-3/5 h-[50vh] lg:h-full relative bg-[#030712] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
          <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-90 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              Execution Hologram
            </h2>
            <p className="text-xs text-slate-500 mt-1">Drag to rotate pipeline view</p>
          </div>
          
          {/* Three.js Canvas Container */}
          <div className="flex-1 relative w-full h-full">
             <HolographicPipeline />
             {/* Vignette Overlay for Sci-Fi depth */}
             <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]" />
          </div>
        </div>

        {/* RIGHT: Agent Context / Notebook Terminal (40%) */}
        <div className="w-full lg:w-2/5 flex flex-col bg-slate-950 h-full">
          
          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 border-b border-slate-800 pt-4 bg-slate-950">
            <button className="pb-3 border-b-2 border-cyan-400 text-cyan-400 text-sm font-semibold flex items-center gap-2 cursor-pointer">
              <Terminal className="w-4 h-4" /> Notebook
            </button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer">
              <FileText className="w-4 h-4" /> Artifacts
            </button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer">
              <Database className="w-4 h-4" /> Dataset
            </button>
          </div>

          {/* Terminal Content Area */}
          <div className="flex-1 p-6 overflow-y-auto font-mono text-sm bg-slate-950">
            <div className="space-y-5 text-slate-400">
              <div className="flex gap-4">
                <span className="text-emerald-500 shrink-0">[Stage 1]</span>
                <span className="text-slate-300">Prompt Analysis complete. Inferred target column: `SalePrice`.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-emerald-500 shrink-0">[Stage 2]</span>
                <span className="text-slate-300">Dataset Search: Downloaded `house-prices-advanced.csv` (3 candidates reviewed).</span>
              </div>
              <div className="flex gap-4">
                <span className="text-amber-500 shrink-0">[Gate A]</span>
                <span className="text-slate-500 opacity-80">Human approval bypassed via auto-policy.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-emerald-500 shrink-0">[Stage 3]</span>
                <span className="text-slate-300">Data Profiling: 10,000 rows evaluated. Missing values detected in `LotFrontage`.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-emerald-500 shrink-0">[Stage 4]</span>
                <span className="text-slate-300">Preprocessing: Applied SimpleImputer(strategy='mean'). Categorical encoded (13 columns).</span>
              </div>
              <div className="flex gap-4">
                <span className="text-emerald-500 shrink-0">[Stage 5]</span>
                <span className="text-slate-300">Model Training: XGBoost Classifier. Achieved 86.5% baseline accuracy.</span>
              </div>
              
              {/* Active Logging Area */}
              <div className="flex gap-4 border border-cyan-500/30 bg-cyan-500/10 p-4 rounded-lg relative overflow-hidden mt-8 shadow-lg shadow-cyan-900/20">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#00E5D9]" />
                <span className="text-cyan-400 shrink-0 animate-pulse font-bold">[Stage 6]</span>
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-cyan-50 font-semibold">Evaluation running...</span>
                  <span className="text-cyan-400/80 text-xs mt-1">Executing cross-validation splits (3/5 folds complete)</span>
                  <div className="w-full h-1.5 bg-slate-900/50 rounded-full mt-3 overflow-hidden border border-cyan-900/50">
                    <div className="h-full bg-cyan-400 w-3/5 rounded-full shadow-[0_0_8px_#00E5D9]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}