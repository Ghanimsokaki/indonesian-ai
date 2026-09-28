import React, { useState, useEffect } from 'react';
import { ArtifactItem, RobloxPart, ArtifactVersion } from '../types';
import { ThreeVisualizer } from './ThreeVisualizer';
import { VersionHistorySidebar } from './VersionHistorySidebar';
import { 
  Gamepad2, 
  Globe, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Layers, 
  Send, 
  Terminal, 
  Sparkles,
  Maximize2,
  FolderTree,
  ChevronRight,
  Code2,
  Box,
  Sliders,
  CheckCircle2,
  RotateCcw,
  History
} from 'lucide-react';

interface ArtifactWorkspaceProps {
  artifacts: ArtifactItem[];
  activeArtifact: ArtifactItem | null;
  onSelectArtifact: (artifact: ArtifactItem) => void;
  appUrl: string;
}

export const ArtifactWorkspace: React.FC<ArtifactWorkspaceProps> = ({
  artifacts,
  activeArtifact,
  onSelectArtifact,
  appUrl
}) => {
  const [activeTab, setActiveTab] = useState<'3d-asset' | 'browser' | 'long-file'>('3d-asset');
  const [subTab3D, setSubTab3D] = useState<'viewport' | 'json-editor' | 'lua-script'>('viewport');
  
  // Real-time JSON data state for 3D asset
  const [realtimeJsonText, setRealtimeJsonText] = useState<string>('');
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [selectedPartName, setSelectedPartName] = useState<string | null>(null);

  // Version history state
  const [versionHistory, setVersionHistory] = useState<ArtifactVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [editedLuaScript, setEditedLuaScript] = useState<string>('');
  const [hasUnsavedLuaEdits, setHasUnsavedLuaEdits] = useState<boolean>(false);

  // In-app browser state
  const [browserUrl, setBrowserUrl] = useState<string>('https://cyberblox.preview/app');
  const [browserViewport, setBrowserViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [browserReloadKey, setBrowserReloadKey] = useState<number>(0);

  // Long file state
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [activeFileContent, setActiveFileContent] = useState<string>('');

  // Roblox Studio deployment state
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployedSuccess, setDeployedSuccess] = useState<boolean>(false);

  // Default fallback parts data
  const default3DData = {
    parts: [
      {
        name: 'TurretBase',
        shape: 'Cylinder',
        size: { x: 6, y: 1.5, z: 6 },
        position: { x: 0, y: 0.75, z: 0 },
        rotation: { x: 0, y: 0, z: 90 },
        color: '#1e293b',
        material: 'Metal',
        anchored: true,
        canCollide: true
      },
      {
        name: 'PivotMount',
        shape: 'Block',
        size: { x: 3, y: 3, z: 3 },
        position: { x: 0, y: 3, z: 0 },
        color: '#0284c7',
        material: 'SmoothPlastic',
        anchored: true,
        canCollide: true
      },
      {
        name: 'PlasmaCore',
        shape: 'Ball',
        size: { x: 2.2, y: 2.2, z: 2.2 },
        position: { x: 0, y: 3.5, z: 0 },
        color: '#38bdf8',
        material: 'Neon',
        anchored: true,
        canCollide: false
      },
      {
        name: 'LeftBarrel',
        shape: 'Cylinder',
        size: { x: 1, y: 5, z: 1 },
        position: { x: -1.2, y: 3.5, z: 3 },
        rotation: { x: 90, y: 0, z: 0 },
        color: '#f59e0b',
        material: 'Neon',
        anchored: true,
        canCollide: true
      },
      {
        name: 'RightBarrel',
        shape: 'Cylinder',
        size: { x: 1, y: 5, z: 1 },
        position: { x: 1.2, y: 3.5, z: 3 },
        rotation: { x: 90, y: 0, z: 0 },
        color: '#f59e0b',
        material: 'Neon',
        anchored: true,
        canCollide: true
      }
    ]
  };

  // Generate Luau code from parts with complete material properties
  const generateRobloxLuaFromParts = (title: string, parts: RobloxPart[]) => {
    let lua = `-- [OmniForge AI] Production Roblox Model & Material Rig: ${title}\n`;
    lua += `local Workspace = game:GetService("Workspace")\n`;
    lua += `local TweenService = game:GetService("TweenService")\n\n`;
    lua += `local rootModel = Instance.new("Model")\n`;
    lua += `rootModel.Name = "${(title || 'Model').replace(/[^a-zA-Z0-9_ ]/g, '')}"\n\n`;

    parts.forEach((p, idx) => {
      const shape = p.shape === 'Ball' ? 'Enum.PartType.Ball' : p.shape === 'Cylinder' ? 'Enum.PartType.Cylinder' : 'Enum.PartType.Block';
      const mat = p.material ? `Enum.Material.${p.material}` : 'Enum.Material.SmoothPlastic';
      const trans = typeof p.transparency === 'number' ? p.transparency.toFixed(2) : '0.00';
      const refl = typeof p.reflectance === 'number' 
        ? p.reflectance.toFixed(2) 
        : (typeof p.metallic === 'number' ? (p.metallic * 0.85).toFixed(2) : '0.00');

      lua += `do\n`;
      lua += `    local p = Instance.new("Part")\n`;
      lua += `    p.Name = "${p.name || 'Part_' + (idx + 1)}"\n`;
      lua += `    p.Shape = ${shape}\n`;
      lua += `    p.Size = Vector3.new(${p.size.x}, ${p.size.y}, ${p.size.z})\n`;
      lua += `    p.Position = Vector3.new(${p.position.x}, ${p.position.y}, ${p.position.z})\n`;
      if (p.rotation) {
        lua += `    p.Orientation = Vector3.new(${p.rotation.x || 0}, ${p.rotation.y || 0}, ${p.rotation.z || 0})\n`;
      }
      lua += `    p.Color = Color3.fromHex("${p.color || '#38bdf8'}")\n`;
      lua += `    p.Material = ${mat}\n`;
      lua += `    p.Transparency = ${trans}\n`;
      lua += `    p.Reflectance = ${refl}\n`;
      lua += `    p.Anchored = ${p.anchored !== false}\n`;
      lua += `    p.CanCollide = ${p.canCollide !== false}\n`;
      lua += `    p.Parent = rootModel\n`;
      lua += `end\n\n`;
    });

    lua += `rootModel.Parent = Workspace\n`;
    lua += `print("✅ [OmniForge] ${title} spawned in Workspace with customized materials!")\n`;
    lua += `return rootModel\n`;
    return lua;
  };

  // Sync state whenever activeArtifact changes
  useEffect(() => {
    if (!activeArtifact) return;

    if (activeArtifact.type === '3d-asset') {
      setActiveTab('3d-asset');
    } else if (activeArtifact.type === 'website') {
      setActiveTab('browser');
    } else {
      setActiveTab('long-file');
    }

    const initialContent = activeArtifact.content || '';
    setActiveFileContent(initialContent);
    setEditedLuaScript(initialContent);
    setHasUnsavedLuaEdits(false);

    // Initialize real-time JSON text
    const dataToFormat = activeArtifact.data || default3DData;
    setRealtimeJsonText(JSON.stringify(dataToFormat, null, 2));
    setJsonParseError(null);

    // Initialize or load version history for the active artifact
    if (activeArtifact.history && activeArtifact.history.length > 0) {
      setVersionHistory(activeArtifact.history);
      setCurrentVersionId(activeArtifact.history[activeArtifact.history.length - 1].id);
    } else {
      const initialVer: ArtifactVersion = {
        id: `v-init-${activeArtifact.id}`,
        versionNumber: 1,
        timestamp: Date.now(),
        label: 'Initial Generation',
        changeType: 'initial',
        description: 'Base model and mechanics generated by agent',
        content: initialContent,
        data: dataToFormat,
        partsCount: dataToFormat?.parts?.length || (Array.isArray(dataToFormat) ? dataToFormat.length : 0)
      };
      activeArtifact.history = [initialVer];
      setVersionHistory([initialVer]);
      setCurrentVersionId(initialVer.id);
    }
  }, [activeArtifact]);

  // Handle live JSON edits in the editor
  const handleJsonChange = (newText: string) => {
    setRealtimeJsonText(newText);
    try {
      const parsed = JSON.parse(newText);
      setJsonParseError(null);
      if (activeArtifact && activeArtifact.type === '3d-asset') {
        activeArtifact.data = parsed;
        const partsList = Array.isArray(parsed) ? parsed : parsed.parts;
        if (Array.isArray(partsList)) {
          const updatedLua = generateRobloxLuaFromParts(activeArtifact.title, partsList);
          activeArtifact.content = updatedLua;
          setActiveFileContent(updatedLua);
          setEditedLuaScript(updatedLua);
        }
      }
    } catch (err: any) {
      setJsonParseError(err.message);
    }
  };

  // Handle live property updates from MaterialPropertyPanel
  const handleUpdateParts = (updatedParts: RobloxPart[], customLabel?: string) => {
    let currentData = active3DJsonData;
    let nextData: any = {};
    if (Array.isArray(currentData)) {
      nextData = updatedParts;
    } else {
      nextData = { ...currentData, parts: updatedParts };
    }
    const formatted = JSON.stringify(nextData, null, 2);
    setRealtimeJsonText(formatted);
    setJsonParseError(null);

    const updatedLua = generateRobloxLuaFromParts(activeArtifact?.title || 'Model', updatedParts);
    setActiveFileContent(updatedLua);
    setEditedLuaScript(updatedLua);
    setHasUnsavedLuaEdits(false);

    if (activeArtifact && activeArtifact.type === '3d-asset') {
      activeArtifact.data = nextData;
      activeArtifact.content = updatedLua;

      // Add version snapshot to history
      const newVersion: ArtifactVersion = {
        id: `v-${Date.now()}`,
        versionNumber: (versionHistory.length > 0 ? versionHistory[versionHistory.length - 1].versionNumber : 0) + 1,
        timestamp: Date.now(),
        label: customLabel || 'Material & Shading Update',
        changeType: 'material-edit',
        description: `Updated properties for ${updatedParts.length} parts (color, transparency, metallic)`,
        content: updatedLua,
        data: nextData,
        partsCount: updatedParts.length
      };

      setVersionHistory(prev => {
        const nextHist = [...prev, newVersion];
        if (activeArtifact) activeArtifact.history = nextHist;
        return nextHist;
      });
      setCurrentVersionId(newVersion.id);
    }
  };

  // Revert to any previous version
  const handleRevertToVersion = (v: ArtifactVersion) => {
    const formatted = JSON.stringify(v.data, null, 2);
    setRealtimeJsonText(formatted);
    setJsonParseError(null);
    setActiveFileContent(v.content);
    setEditedLuaScript(v.content);
    setHasUnsavedLuaEdits(false);

    if (activeArtifact) {
      activeArtifact.data = v.data;
      activeArtifact.content = v.content;

      // Add a rollback record so user can undo a revert or traverse history
      const revertVer: ArtifactVersion = {
        id: `v-rev-${Date.now()}`,
        versionNumber: (versionHistory.length > 0 ? versionHistory[versionHistory.length - 1].versionNumber : 0) + 1,
        timestamp: Date.now(),
        label: `Rollback to v${v.versionNumber}`,
        changeType: 'revert',
        description: `Restored exact state from version v${v.versionNumber} (${v.label})`,
        content: v.content,
        data: v.data,
        partsCount: v.partsCount
      };

      setVersionHistory(prev => {
        const updated = [...prev, revertVer];
        if (activeArtifact) activeArtifact.history = updated;
        return updated;
      });
      setCurrentVersionId(revertVer.id);
    }
  };

  // Save manual checkpoint snapshot
  const handleSaveManualSnapshot = (customLabel: string) => {
    if (!activeArtifact) return;
    const partsCount = active3DJsonData?.parts?.length || (Array.isArray(active3DJsonData) ? active3DJsonData.length : 0);
    const snapVer: ArtifactVersion = {
      id: `v-snap-${Date.now()}`,
      versionNumber: (versionHistory.length > 0 ? versionHistory[versionHistory.length - 1].versionNumber : 0) + 1,
      timestamp: Date.now(),
      label: customLabel || `Snapshot #${versionHistory.length + 1}`,
      changeType: 'snapshot',
      description: `User checkpoint (${partsCount} parts, ${(editedLuaScript || activeFileContent).split('\n').length} lines)`,
      content: editedLuaScript || activeFileContent || activeArtifact.content,
      data: active3DJsonData,
      partsCount
    };

    setVersionHistory(prev => {
      const updated = [...prev, snapVer];
      if (activeArtifact) activeArtifact.history = updated;
      return updated;
    });
    setCurrentVersionId(snapVer.id);
  };

  // Commit direct Lua script edits
  const handleSaveLuaEdits = () => {
    if (!activeArtifact) return;
    setActiveFileContent(editedLuaScript);
    activeArtifact.content = editedLuaScript;
    setHasUnsavedLuaEdits(false);

    const partsCount = active3DJsonData?.parts?.length || (Array.isArray(active3DJsonData) ? active3DJsonData.length : 0);
    const luaVer: ArtifactVersion = {
      id: `v-lua-${Date.now()}`,
      versionNumber: (versionHistory.length > 0 ? versionHistory[versionHistory.length - 1].versionNumber : 0) + 1,
      timestamp: Date.now(),
      label: 'Roblox Luau Script Edit',
      changeType: 'lua-edit',
      description: `Direct script changes saved (${editedLuaScript.split('\n').length} lines)`,
      content: editedLuaScript,
      data: active3DJsonData,
      partsCount
    };

    setVersionHistory(prev => {
      const updated = [...prev, luaVer];
      if (activeArtifact) activeArtifact.history = updated;
      return updated;
    });
    setCurrentVersionId(luaVer.id);
  };

  // Parsed JSON object safely passed to ThreeVisualizer
  const active3DJsonData = React.useMemo(() => {
    try {
      return JSON.parse(realtimeJsonText);
    } catch {
      return activeArtifact?.data || default3DData;
    }
  }, [realtimeJsonText, activeArtifact]);

  // In-app browser default HTML
  const defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-8 flex flex-col justify-between">
  <div class="space-y-6 max-w-xl mx-auto text-center pt-8">
    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-sky-500 mx-auto flex items-center justify-center font-black text-slate-950 text-xl shadow-xl shadow-sky-500/20">
      ⚡
    </div>
    <h1 class="text-3xl font-black bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
      OmniForge Live Web Canvas
    </h1>
    <p class="text-xs text-slate-400 leading-relaxed">
      Ask the chatbot: <span class="text-amber-300">"Build a full Roblox game portfolio with 3D cards"</span> or <span class="text-sky-300">"Create a dark cyber gaming dashboard"</span> to see it live here!
    </p>
    <div class="grid grid-cols-2 gap-3 text-left">
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-amber-400 font-bold text-xs">🎮 Roblox Bridge</div>
        <div class="text-[11px] text-slate-500 mt-1">Live HttpService sync active</div>
      </div>
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-sky-400 font-bold text-xs">🌐 Responsive Engine</div>
        <div class="text-[11px] text-slate-500 mt-1">Tailwind CDN sandbox</div>
      </div>
    </div>
  </div>
  <div class="text-center text-[10px] text-slate-600 font-mono">
    OmniForge In-App Web Browser Sandbox
  </div>
</body>
</html>`;

  const websiteHtml = activeArtifact?.type === 'website' && activeArtifact.content
    ? activeArtifact.content
    : defaultHtml;

  const commandBarSnippet = `loadstring(game:GetService("HttpService"):GetAsync("${appUrl}/api/roblox/bridge?action=run"))()`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(commandBarSnippet);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDeployToStudio = async () => {
    setIsDeploying(true);
    try {
      const partsToDeploy = active3DJsonData?.parts || (Array.isArray(active3DJsonData) ? active3DJsonData : []);
      const res = await fetch('/api/roblox/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assetId: activeArtifact?.id,
          name: activeArtifact?.title,
          parts: partsToDeploy,
          luaCode: activeArtifact?.content
        })
      });
      const data = await res.json();
      if (data.success) {
        setDeployedSuccess(true);
        setTimeout(() => setDeployedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Deploy error:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyFile = () => {
    navigator.clipboard.writeText(activeFileContent);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadFile = () => {
    const filename = activeArtifact?.title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'OmniForge_File';
    const ext = activeArtifact?.language === 'lua' ? '.lua' : activeArtifact?.type === 'website' ? '.html' : activeArtifact?.language === 'typescript' ? '.ts' : '.txt';
    const blob = new Blob([activeFileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = activeFileContent ? activeFileContent.split('\n').length : 1;

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800/80 overflow-hidden">
      
      {/* Workspace Header & Main Mode Tabs */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
        
        {/* Workspace Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('3d-asset')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === '3d-asset'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>3D Visualizer (Three.js)</span>
          </button>

          <button
            onClick={() => setActiveTab('browser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'browser'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>In-App Browser</span>
          </button>

          <button
            onClick={() => setActiveTab('long-file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'long-file'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Long File Synthesizer</span>
          </button>
        </div>

        {/* Artifacts Quick Switcher Pill */}
        {artifacts.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {artifacts.length} artifacts
            </span>
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* ===================== TAB 1: 3D ASSET VISUALIZER ===================== */}
        {activeTab === '3d-asset' && (
          <div className="h-full flex flex-col p-4 space-y-3 overflow-hidden">
            
            {/* Top Sub-Bar: 3D Sub-tabs & Roblox Studio Bridge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm shrink-0">
              
              {/* Sub-modes: 3D Viewport vs Real-Time JSON Editor vs Lua Script */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setSubTab3D('viewport')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    subTab3D === 'viewport' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Viewport</span>
                </button>
                <button
                  onClick={() => setSubTab3D('json-editor')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    subTab3D === 'json-editor' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Live JSON Data</span>
                </button>
                <button
                  onClick={() => setSubTab3D('lua-script')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    subTab3D === 'lua-script' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Roblox Lua</span>
                </button>
              </div>

              {/* Studio Bridge Deployment & Version History Actions */}
              <div className="flex items-center gap-2">
                
                {/* Version History Toggle Button */}
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  title="Open Version History & Rollback Timeline"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    isHistoryOpen
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md shadow-sky-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">History</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-sky-400 font-mono">
                    {versionHistory.length}
                  </span>
                </button>

                <button
                  onClick={handleCopyCmd}
                  title="Copy 1-Click Roblox Studio Command Bar script"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5 text-amber-400" />}
                  <span className="hidden sm:inline">{copiedCmd ? 'Command Copied!' : 'Copy Studio Script'}</span>
                </button>

                <button
                  onClick={handleDeployToStudio}
                  disabled={isDeploying}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDeploying ? 'Deploying...' : deployedSuccess ? 'Ready in Studio!' : 'Deploy to Studio'}</span>
                </button>
              </div>
            </div>

            {/* Sub-view: 3D Viewport with ThreeVisualizer */}
            {subTab3D === 'viewport' && (
              <div className="flex-1 min-h-[340px] rounded-xl overflow-hidden shadow-2xl relative">
                <ThreeVisualizer
                  jsonData={active3DJsonData}
                  assetName={activeArtifact?.title || '3D Asset Viewport'}
                  onSelectPart={(part) => setSelectedPartName(part?.name || null)}
                  selectedPartName={selectedPartName}
                  onUpdateParts={handleUpdateParts}
                  onDeployToStudio={handleDeployToStudio}
                  isDeploying={isDeploying}
                />
              </div>
            )}

            {/* Sub-view: Real-Time JSON Data Editor with Live 3D Viewport Split */}
            {subTab3D === 'json-editor' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[340px] overflow-hidden">
                {/* Left: Interactive JSON Code Editor */}
                <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                  <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      artifact.data (JSON)
                    </span>
                    <button
                      onClick={() => {
                        try {
                          const formatted = JSON.stringify(JSON.parse(realtimeJsonText), null, 2);
                          setRealtimeJsonText(formatted);
                          setJsonParseError(null);
                        } catch {}
                      }}
                      className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                    >
                      Format JSON
                    </button>
                  </div>

                  <textarea
                    value={realtimeJsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="flex-1 w-full bg-slate-950 p-3 font-mono text-xs text-amber-300 focus:outline-none leading-relaxed resize-none selection:bg-amber-500 selection:text-black"
                    spellCheck={false}
                  />

                  {jsonParseError && (
                    <div className="p-2 bg-rose-500/10 border-t border-rose-500/30 text-rose-300 font-mono text-[11px]">
                      JSON Syntax Error: {jsonParseError}
                    </div>
                  )}
                </div>

                {/* Right: Live Real-Time Three.js Renderer reacting to JSON changes */}
                <div className="h-full rounded-xl overflow-hidden border border-slate-800 shadow-md relative">
                  <ThreeVisualizer
                    jsonData={active3DJsonData}
                    assetName="Live Preview (Real-Time JSON)"
                    selectedPartName={selectedPartName}
                    onUpdateParts={handleUpdateParts}
                    onDeployToStudio={handleDeployToStudio}
                    isDeploying={isDeploying}
                  />
                </div>
              </div>
            )}

            {/* Sub-view: Roblox Lua Script attached to 3D model */}
            {subTab3D === 'lua-script' && (
              <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col space-y-3 overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span>Attached Script: <code className="text-emerald-400">{activeArtifact?.title || 'Model'}_Logic.luau</code></span>
                    {hasUnsavedLuaEdits && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                        Unsaved Edits
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasUnsavedLuaEdits && (
                      <button
                        onClick={handleSaveLuaEdits}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Version</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(editedLuaScript || activeArtifact?.content || '');
                        setCopiedFile(true);
                        setTimeout(() => setCopiedFile(false), 2000);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile ? 'Copied' : 'Copy Script'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={editedLuaScript}
                  onChange={(e) => {
                    setEditedLuaScript(e.target.value);
                    setHasUnsavedLuaEdits(true);
                  }}
                  placeholder="-- Enter Roblox Luau script logic..."
                  className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:border-sky-500 leading-relaxed resize-none selection:bg-emerald-500 selection:text-black"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Bottom Status Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
                <span className="text-slate-500">Live Engine:</span>
                <span className="text-emerald-400">Three.js WebGL 2.0</span>
                <span className="text-slate-600">|</span>
                <span>Roblox HttpService Sync:</span>
                <span className="text-emerald-400">Online</span>
              </div>
              <span className="text-amber-400 text-[11px] shrink-0 ml-2 hidden sm:block">
                Real-Time JSON Reactivity Active
              </span>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: IN-APP BROWSER ===================== */}
        {activeTab === 'browser' && (
          <div className="h-full flex flex-col p-4 space-y-3 overflow-hidden">
            {/* Browser Address & Control Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-md shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex gap-1.5 px-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>

                <button
                  onClick={() => setBrowserReloadKey(k => k + 1)}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-300 font-mono">
                  <Globe className="w-3 h-3 text-sky-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={browserUrl}
                    onChange={(e) => setBrowserUrl(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-slate-200"
                  />
                </div>
              </div>

              {/* Viewport Toggles (Desktop, Tablet, Mobile) */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setBrowserViewport('desktop')}
                  className={`p-1 rounded text-xs ${browserViewport === 'desktop' ? 'bg-slate-800 text-sky-400' : 'text-slate-500'}`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBrowserViewport('tablet')}
                  className={`p-1 rounded text-xs ${browserViewport === 'tablet' ? 'bg-slate-800 text-sky-400' : 'text-slate-500'}`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBrowserViewport('mobile')}
                  className={`p-1 rounded text-xs ${browserViewport === 'mobile' ? 'bg-slate-800 text-sky-400' : 'text-slate-500'}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sandboxed Live Web Preview Iframe */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex justify-center items-center">
              <div
                style={{
                  width: browserViewport === 'mobile' ? '375px' : browserViewport === 'tablet' ? '768px' : '100%',
                  height: '100%',
                  transition: 'width 0.3s ease'
                }}
                className="bg-slate-950 h-full border-x border-slate-800/80 shadow-2xl"
              >
                <iframe
                  key={browserReloadKey}
                  title="In-App Web Sandbox"
                  srcDoc={websiteHtml}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-0 bg-slate-950"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: LONG FILE SYNTHESIZER ===================== */}
        {activeTab === 'long-file' && (
          <div className="h-full flex flex-col p-4 space-y-3 overflow-hidden">
            {/* File Header Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-100">
                  {activeArtifact?.title || 'Production Long File'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                  {lineCount} lines • {activeFileContent.length} chars
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Editor Area with Line Numbers */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex font-mono text-xs shadow-inner">
              <div className="w-12 bg-slate-900/60 border-r border-slate-800/80 py-3 text-right pr-2.5 text-slate-600 select-none overflow-hidden">
                {Array.from({ length: Math.min(lineCount, 500) }, (_, i) => (
                  <div key={i} className="leading-relaxed text-[11px]">
                    {i + 1}
                  </div>
                ))}
              </div>

              <textarea
                value={activeFileContent}
                onChange={(e) => setActiveFileContent(e.target.value)}
                className="flex-1 bg-transparent p-3 text-emerald-300 focus:outline-none leading-relaxed resize-none text-[11px] overflow-auto selection:bg-amber-500 selection:text-black"
                spellCheck={false}
              />
            </div>
          </div>
        )}

      </div>

      {/* Version History Sidebar */}
      {isHistoryOpen && (
        <VersionHistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          versions={versionHistory}
          currentVersionId={currentVersionId}
          onRevertToVersion={handleRevertToVersion}
          onSaveManualSnapshot={handleSaveManualSnapshot}
          onClearHistory={() => {
            if (versionHistory.length > 0) {
              const latestOnly = [versionHistory[versionHistory.length - 1]];
              setVersionHistory(latestOnly);
              if (activeArtifact) activeArtifact.history = latestOnly;
            }
          }}
        />
      )}
    </div>
  );
};
