import React, { useState } from 'react';
import { ArtifactVersion } from '../types';
import { 
  History, 
  RotateCcw, 
  Clock, 
  Check, 
  Sparkles, 
  Sliders, 
  FileCode, 
  Code2, 
  Bookmark, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Layers, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface VersionHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ArtifactVersion[];
  currentVersionId: string | null;
  onRevertToVersion: (version: ArtifactVersion) => void;
  onSaveManualSnapshot: (label: string) => void;
  onClearHistory?: () => void;
}

export const VersionHistorySidebar: React.FC<VersionHistorySidebarProps> = ({
  isOpen,
  onClose,
  versions,
  currentVersionId,
  onRevertToVersion,
  onSaveManualSnapshot,
  onClearHistory
}) => {
  const [snapshotLabel, setSnapshotLabel] = useState<string>('');
  const [isAddingSnapshot, setIsAddingSnapshot] = useState<boolean>(false);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [revertFeedback, setRevertFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateSnapshot = () => {
    const label = snapshotLabel.trim() || `Checkpoint #${versions.length + 1}`;
    onSaveManualSnapshot(label);
    setSnapshotLabel('');
    setIsAddingSnapshot(false);
  };

  const handleRevert = (v: ArtifactVersion) => {
    onRevertToVersion(v);
    setRevertFeedback(`Reverted to v${v.versionNumber}: ${v.label}`);
    setTimeout(() => setRevertFeedback(null), 2500);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 10000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getIconForChangeType = (type: ArtifactVersion['changeType']) => {
    switch (type) {
      case 'material-edit':
        return <Sliders className="w-3.5 h-3.5 text-amber-400" />;
      case 'lua-edit':
        return <FileCode className="w-3.5 h-3.5 text-sky-400" />;
      case 'json-edit':
        return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'snapshot':
        return <Bookmark className="w-3.5 h-3.5 text-purple-400" />;
      case 'revert':
        return <RotateCcw className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getBadgeForChangeType = (type: ArtifactVersion['changeType']) => {
    switch (type) {
      case 'material-edit':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">Materials</span>;
      case 'lua-edit':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">Lua Script</span>;
      case 'json-edit':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">JSON</span>;
      case 'snapshot':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">Checkpoint</span>;
      case 'revert':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">Rollback</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">Initial</span>;
    }
  };

  return (
    <div className="w-80 md:w-88 h-full bg-slate-900/98 backdrop-blur-md border-l border-slate-800 flex flex-col z-30 select-none shadow-2xl animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
              <span>Version History</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-400 font-mono border border-slate-700">
                {versions.length}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Track & revert 3D material & Lua edits
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Snapshot Action Bar */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 space-y-2 shrink-0">
        {!isAddingSnapshot ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingSnapshot(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Snapshot</span>
            </button>
            {onClearHistory && versions.length > 1 && (
              <button
                onClick={onClearHistory}
                title="Clear past history"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <input
              type="text"
              autoFocus
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSnapshot();
                if (e.key === 'Escape') setIsAddingSnapshot(false);
              }}
              placeholder="e.g. Neon Arena Variant..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-400"
            />
            <div className="flex items-center gap-1.5 justify-end">
              <button
                onClick={() => setIsAddingSnapshot(false)}
                className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[11px]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSnapshot}
                className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revert Feedback Notification */}
      {revertFeedback && (
        <div className="mx-3 mt-2 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{revertFeedback}</span>
        </div>
      )}

      {/* Versions Timeline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
        {versions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 space-y-2">
            <Clock className="w-6 h-6 mx-auto opacity-50" />
            <p className="text-xs">No version history yet.</p>
          </div>
        ) : (
          versions.slice().reverse().map((v, revIdx) => {
            const isCurrent = v.id === currentVersionId || revIdx === 0;
            const isPreviewing = previewVersionId === v.id;
            const lineCount = v.content ? v.content.split('\n').length : 0;
            const partsCount = v.partsCount ?? (v.data?.parts?.length || (Array.isArray(v.data) ? v.data.length : 0));

            return (
              <div
                key={v.id}
                className={`p-3 rounded-xl border transition-all space-y-2 ${
                  isCurrent 
                    ? 'bg-slate-950 border-sky-500/50 shadow-md ring-1 ring-sky-500/20' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Version Number, Badge & Timestamp */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {getIconForChangeType(v.changeType)}
                    <span className="font-bold text-slate-200 font-mono">v{v.versionNumber}</span>
                    {getBadgeForChangeType(v.changeType)}
                  </div>
                  
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatTime(v.timestamp)}
                  </span>
                </div>

                {/* Label / Description */}
                <div>
                  <div className="font-semibold text-slate-300 text-[11px] leading-tight">
                    {v.label}
                  </div>
                  {v.description && (
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {v.description}
                    </div>
                  )}
                </div>

                {/* Meta details: Parts & Code lines */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-0.5">
                  {partsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-amber-400">
                      {partsCount} parts
                    </span>
                  )}
                  {lineCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-sky-400">
                      {lineCount} lines Lua
                    </span>
                  )}
                </div>

                {/* Preview / Inspection Toggle */}
                {isPreviewing && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5 animate-in fade-in duration-150">
                    <div className="text-[10px] font-mono text-slate-400">
                      Lua Script Preview:
                    </div>
                    <pre className="p-2 rounded bg-slate-900 font-mono text-[10px] text-emerald-300 max-h-28 overflow-y-auto leading-relaxed">
                      {v.content.slice(0, 300)}...
                    </pre>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => setPreviewVersionId(isPreviewing ? null : v.id)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5 font-mono"
                  >
                    <span>{isPreviewing ? 'Hide Preview' : 'Inspect Code'}</span>
                    {isPreviewing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isCurrent ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3" />
                      <span>Current Active</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRevert(v)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 font-bold text-[10px] transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revert to this</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-500 text-center font-mono">
        All versions cached locally in session memory
      </div>

    </div>
  );
};
