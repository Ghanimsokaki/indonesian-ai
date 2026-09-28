import React, { useState } from 'react';
import { RobloxPart } from '../types';
import { 
  Sliders, 
  Palette, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RotateCcw, 
  Layers, 
  Shield, 
  Eye, 
  Sun,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Box,
  CheckCircle2
} from 'lucide-react';

interface MaterialPropertyPanelProps {
  parts: RobloxPart[];
  selectedPartName: string | null;
  onSelectPart: (part: RobloxPart | null) => void;
  onUpdatePart: (partName: string, updatedProps: Partial<RobloxPart>) => void;
  onBulkUpdate: (updatedProps: Partial<RobloxPart>) => void;
  onDeployToStudio?: () => void;
  isDeploying?: boolean;
}

const ROBLOX_MATERIALS: { id: RobloxPart['material']; label: string; desc: string; defaultMetal: number; defaultRough: number }[] = [
  { id: 'SmoothPlastic', label: 'Smooth Plastic', desc: 'Standard glossy finish', defaultMetal: 0.05, defaultRough: 0.4 },
  { id: 'Neon', label: 'Neon Glow', desc: 'Self-illuminating glow', defaultMetal: 0.0, defaultRough: 0.1 },
  { id: 'Metal', label: 'Metal / Chrome', desc: 'High reflective PBR surface', defaultMetal: 0.95, defaultRough: 0.2 },
  { id: 'Glass', label: 'Glass / Crystal', desc: 'Refractive semi-transparent', defaultMetal: 0.1, defaultRough: 0.05 },
  { id: 'ForceField', label: 'ForceField', desc: 'Energy barrier shimmer', defaultMetal: 0.2, defaultRough: 0.1 },
  { id: 'Foil', label: 'Foil', desc: 'Crinkled metallic sheen', defaultMetal: 0.9, defaultRough: 0.15 },
  { id: 'DiamondPlate', label: 'Diamond Plate', desc: 'Industrial steel tread', defaultMetal: 0.85, defaultRough: 0.35 },
  { id: 'CorrodedMetal', label: 'Corroded Metal', desc: 'Weathered rusty metal', defaultMetal: 0.7, defaultRough: 0.65 },
  { id: 'WoodPlanks', label: 'Wood Planks', desc: 'Organic matte grain', defaultMetal: 0.0, defaultRough: 0.8 },
  { id: 'Granite', label: 'Granite Stone', desc: 'Hard mineral matte', defaultMetal: 0.0, defaultRough: 0.9 }
];

const PRESET_COLORS = [
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Cyber Amber', hex: '#f59e0b' },
  { name: 'Neon Lime', hex: '#10b981' },
  { name: 'Void Purple', hex: '#8b5cf6' },
  { name: 'Hot Pink', hex: '#ec4899' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Obsidian Slate', hex: '#1e293b' },
  { name: 'Gold / Brass', hex: '#eab308' },
  { name: 'Steel Chrome', hex: '#94a3b8' }
];

export const MaterialPropertyPanel: React.FC<MaterialPropertyPanelProps> = ({
  parts,
  selectedPartName,
  onSelectPart,
  onUpdatePart,
  onBulkUpdate,
  onDeployToStudio,
  isDeploying = false
}) => {
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [copiedLua, setCopiedLua] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Identify active target part
  const activePart = parts.find(p => p.name === selectedPartName) || parts[0] || null;

  // Selected values
  const currentColor = activePart?.color || '#38bdf8';
  const currentMaterial = activePart?.material || 'SmoothPlastic';
  const currentTransparency = typeof activePart?.transparency === 'number' ? activePart.transparency : (currentMaterial === 'Glass' ? 0.45 : 0);
  const currentMetallic = typeof activePart?.metallic === 'number' 
    ? activePart.metallic 
    : (currentMaterial === 'Metal' || currentMaterial === 'Foil' || currentMaterial === 'DiamondPlate' ? 0.9 : 0.05);
  const currentRoughness = typeof activePart?.roughness === 'number' 
    ? activePart.roughness 
    : (currentMaterial === 'Metal' ? 0.2 : currentMaterial === 'Glass' ? 0.05 : 0.45);
  const currentEmissive = typeof activePart?.emissiveIntensity === 'number' ? activePart.emissiveIntensity : (currentMaterial === 'Neon' ? 1.4 : 0);
  const isAnchored = activePart?.anchored !== false;
  const canCollide = activePart?.canCollide !== false;

  const triggerFeedback = (msg: string) => {
    setAppliedNotification(msg);
    setTimeout(() => setAppliedNotification(null), 2000);
  };

  const handlePropertyChange = (props: Partial<RobloxPart>, feedbackMsg?: string) => {
    if (isBulkMode) {
      onBulkUpdate(props);
      triggerFeedback(feedbackMsg || 'Applied to ALL parts in model!');
    } else if (activePart) {
      onUpdatePart(activePart.name, props);
      triggerFeedback(feedbackMsg || `Updated ${activePart.name}`);
    }
  };

  const handleMaterialSelect = (matId: RobloxPart['material']) => {
    const matDef = ROBLOX_MATERIALS.find(m => m.id === matId);
    const updates: Partial<RobloxPart> = {
      material: matId,
      metallic: matDef?.defaultMetal ?? 0.1,
      roughness: matDef?.defaultRough ?? 0.4
    };

    if (matId === 'Glass') {
      updates.transparency = 0.45;
    } else if (matId === 'ForceField') {
      updates.transparency = 0.35;
    } else if (matId === 'Neon') {
      updates.emissiveIntensity = 1.4;
    }

    handlePropertyChange(updates, `Changed material to ${matId}`);
  };

  // Cycle through parts
  const activeIdx = parts.findIndex(p => p.name === activePart?.name);
  const handlePrevPart = () => {
    if (parts.length === 0) return;
    const prevIdx = (activeIdx - 1 + parts.length) % parts.length;
    onSelectPart(parts[prevIdx]);
  };
  const handleNextPart = () => {
    if (parts.length === 0) return;
    const nextIdx = (activeIdx + 1) % parts.length;
    onSelectPart(parts[nextIdx]);
  };

  // Generate Roblox Luau snippet for current material settings
  const luauSnippet = activePart ? `-- Roblox Luau Material Properties for ${activePart.name}
local part = script.Parent:WaitForChild("${activePart.name}")
part.Material = Enum.Material.${activePart.material}
part.Color = Color3.fromHex("${currentColor}")
part.Transparency = ${currentTransparency.toFixed(2)}
part.Reflectance = ${(currentMetallic * 0.85).toFixed(2)}
part.Anchored = ${isAnchored}
part.CanCollide = ${canCollide}` : '';

  const handleCopyLuau = () => {
    navigator.clipboard.writeText(luauSnippet);
    setCopiedLua(true);
    setTimeout(() => setCopiedLua(false), 2000);
  };

  if (!activePart && parts.length === 0) {
    return (
      <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
        No 3D parts detected to edit.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-md border-l border-slate-800 text-slate-200 overflow-y-auto w-full max-w-sm select-none">
      
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
              <span>Material Property Studio</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                Roblox PBR
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Customize real-time shading before Roblox Studio export
            </p>
          </div>
        </div>

        {/* Bulk Toggle Button */}
        <button
          onClick={() => setIsBulkMode(!isBulkMode)}
          title="Toggle Bulk Apply to All Parts"
          className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-colors ${
            isBulkMode 
              ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-sm shadow-amber-500/30' 
              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          {isBulkMode ? 'Bulk Edit: ON' : 'Bulk Edit: OFF'}
        </button>
      </div>

      {/* Part Navigation / Selector */}
      <div className="px-3.5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {isBulkMode ? (
            <span className="text-xs font-bold text-amber-300 font-mono">All {parts.length} Parts in Model</span>
          ) : (
            <select
              value={activePart?.name || ''}
              onChange={(e) => {
                const target = parts.find(p => p.name === e.target.value);
                if (target) onSelectPart(target);
              }}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-lg px-2 py-1 font-mono focus:outline-none focus:border-amber-400 truncate flex-1"
            >
              {parts.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.shape})
                </option>
              ))}
            </select>
          )}
        </div>

        {!isBulkMode && parts.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPart}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Previous Part"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">
              {activeIdx + 1}/{parts.length}
            </span>
            <button
              onClick={handleNextPart}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Next Part"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Notification Banner */}
      {appliedNotification && (
        <div className="mx-3.5 mt-2 p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{appliedNotification}</span>
        </div>
      )}

      {/* Body Properties */}
      <div className="p-3.5 space-y-4 text-xs flex-1">
        
        {/* 1. COLOR & PALETTE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              <span>Base Color (Roblox Color3)</span>
            </label>
            <span className="font-mono text-[11px] text-sky-300 uppercase">{currentColor}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 shrink-0 shadow-inner">
              <input
                type="color"
                value={currentColor.startsWith('#') ? currentColor : '#38bdf8'}
                onChange={(e) => handlePropertyChange({ color: e.target.value })}
                className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
              />
            </div>
            <input
              type="text"
              value={currentColor}
              onChange={(e) => handlePropertyChange({ color: e.target.value })}
              placeholder="#38bdf8"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400 uppercase"
            />
          </div>

          {/* Quick Swatches */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {PRESET_COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => handlePropertyChange({ color: c.hex }, `Color: ${c.name}`)}
                title={c.name}
                className={`h-5 rounded-md border transition-transform hover:scale-105 ${
                  currentColor.toLowerCase() === c.hex.toLowerCase() 
                    ? 'border-white scale-110 shadow-md ring-2 ring-white/30' 
                    : 'border-slate-700/60'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* 2. ROBLOX MATERIAL TYPE */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Roblox Material Preset</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {ROBLOX_MATERIALS.map(m => {
              const isSelected = currentMaterial === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMaterialSelect(m.id)}
                  className={`p-2 rounded-lg border text-left transition-all text-[11px] ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm font-semibold'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{m.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TRANSPARENCY SLIDER */}
        <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transparency (Roblox Opacity)</span>
            </label>
            <span className="font-mono text-emerald-300 font-bold">
              {currentTransparency.toFixed(2)} ({(currentTransparency * 100).toFixed(0)}%)
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={currentTransparency}
            onChange={(e) => handlePropertyChange({ transparency: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
            <button onClick={() => handlePropertyChange({ transparency: 0.0 })} className="hover:text-emerald-300">
              Opaque (0.0)
            </button>
            <button onClick={() => handlePropertyChange({ transparency: 0.25 })} className="hover:text-emerald-300">
              Tint (0.25)
            </button>
            <button onClick={() => handlePropertyChange({ transparency: 0.50 })} className="hover:text-emerald-300">
              Half (0.50)
            </button>
            <button onClick={() => handlePropertyChange({ transparency: 0.85 })} className="hover:text-emerald-300">
              Glass (0.85)
            </button>
          </div>
        </div>

        {/* 4. METALLIC (METALNESS) SLIDER */}
        <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Metallic / Reflectance</span>
            </label>
            <span className="font-mono text-sky-300 font-bold">
              {currentMetallic.toFixed(2)} (Reflectance {(currentMetallic * 0.85).toFixed(2)})
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={currentMetallic}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              handlePropertyChange({ metallic: val, reflectance: val * 0.85 });
            }}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
            <button onClick={() => handlePropertyChange({ metallic: 0.0, reflectance: 0.0 })} className="hover:text-sky-300">
              Plastic (0.0)
            </button>
            <button onClick={() => handlePropertyChange({ metallic: 0.5, reflectance: 0.42 })} className="hover:text-sky-300">
              Brushed (0.5)
            </button>
            <button onClick={() => handlePropertyChange({ metallic: 1.0, reflectance: 0.85 })} className="hover:text-sky-300">
              Chrome (1.0)
            </button>
          </div>
        </div>

        {/* 5. ROUGHNESS / GLOSS SLIDER */}
        <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Roughness / Surface Finish</span>
            </label>
            <span className="font-mono text-amber-300 font-bold">
              {currentRoughness.toFixed(2)} ({currentRoughness < 0.2 ? 'Mirror Gloss' : currentRoughness < 0.6 ? 'Satin' : 'Matte'})
            </span>
          </div>
          
          <input
            type="range"
            min="0.02"
            max="1"
            step="0.05"
            value={currentRoughness}
            onChange={(e) => handlePropertyChange({ roughness: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
            <button onClick={() => handlePropertyChange({ roughness: 0.05 })} className="hover:text-amber-300">
              Mirror (0.05)
            </button>
            <button onClick={() => handlePropertyChange({ roughness: 0.35 })} className="hover:text-amber-300">
              Satin (0.35)
            </button>
            <button onClick={() => handlePropertyChange({ roughness: 0.85 })} className="hover:text-amber-300">
              Matte (0.85)
            </button>
          </div>
        </div>

        {/* 6. NEON EMISSIVE GLOW (If Neon) */}
        {currentMaterial === 'Neon' && (
          <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-xl border border-amber-500/30">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Neon Emissive Intensity</span>
              </label>
              <span className="font-mono text-amber-300 font-bold">
                {currentEmissive.toFixed(1)}x
              </span>
            </div>
            
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.2"
              value={currentEmissive}
              onChange={(e) => handlePropertyChange({ emissiveIntensity: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* 7. ROBLOX PHYSICS FLAGS */}
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Roblox Physics Flags
          </span>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/80">
              <input
                type="checkbox"
                checked={isAnchored}
                onChange={(e) => handlePropertyChange({ anchored: e.target.checked })}
                className="rounded accent-emerald-400"
              />
              <span className="text-[11px] text-slate-200">Anchored</span>
            </label>

            <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/80">
              <input
                type="checkbox"
                checked={canCollide}
                onChange={(e) => handlePropertyChange({ canCollide: e.target.checked })}
                className="rounded accent-emerald-400"
              />
              <span className="text-[11px] text-slate-200">CanCollide</span>
            </label>
          </div>
        </div>

      </div>

      {/* Footer Roblox Studio Export Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono">Roblox Ready</span>
          <button
            onClick={handleCopyLuau}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono text-[10px]"
          >
            {copiedLua ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLua ? 'Copied Luau!' : 'Copy Part Lua'}</span>
          </button>
        </div>

        {onDeployToStudio && (
          <button
            onClick={onDeployToStudio}
            disabled={isDeploying}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isDeploying ? 'Deploying to Studio...' : 'Export Asset to Roblox Studio'}</span>
          </button>
        )}
      </div>

    </div>
  );
};
