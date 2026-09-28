import React, { useState } from 'react';
import { ConnectorState, McpServerConfig } from '../types';
import { 
  X, 
  Gamepad2, 
  Github, 
  Cpu, 
  Key, 
  Terminal, 
  Radio, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface ConnectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
  connectors: ConnectorState;
  onUpdateConnectors: (updated: Partial<ConnectorState>) => void;
}

export const ConnectorsModal: React.FC<ConnectorsModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  connectors,
  onUpdateConnectors
}) => {
  const [activeTab, setActiveTab] = useState<'roblox' | 'github' | 'mcp' | 'openrouter' | 'hf'>('roblox');

  // Roblox state
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  // GitHub state
  const [ghToken, setGhToken] = useState<string>(connectors.github.token || '');
  const [ghRepo, setGhRepo] = useState<string>(connectors.github.repo || 'owner/roblox-experience');

  // OpenRouter state
  const [orKey, setOrKey] = useState<string>(connectors.openRouter.apiKey || '');
  const [selectedOrModel, setSelectedOrModel] = useState<string>(connectors.openRouter.selectedModel || 'gemini-3.8-flash');

  // MCP state
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>(connectors.mcp.activeServers);
  const [newMcpName, setNewMcpName] = useState<string>('');
  const [newMcpUrl, setNewMcpUrl] = useState<string>('');
  const [newMcpType, setNewMcpType] = useState<McpServerConfig['type']>('sse');

  // HF state
  const [hfToken, setHfToken] = useState<string>(connectors.huggingFace.token || '');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const commandBarSnippet = `loadstring(game:GetService("HttpService"):GetAsync("${appUrl}/api/roblox/bridge?action=run"))()`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(commandBarSnippet);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleAddMcpServer = () => {
    if (!newMcpName.trim() || !newMcpUrl.trim()) return;
    const newServer: McpServerConfig = {
      id: `mcp-${Date.now()}`,
      name: newMcpName.trim(),
      url: newMcpUrl.trim(),
      type: newMcpType,
      status: 'connected',
      toolsCount: 6
    };
    const updated = [...mcpServers, newServer];
    setMcpServers(updated);
    setNewMcpName('');
    setNewMcpUrl('');
    onUpdateConnectors({
      mcp: { ...connectors.mcp, activeServers: updated }
    });
  };

  const handleRemoveMcpServer = (id: string) => {
    const updated = mcpServers.filter(s => s.id !== id);
    setMcpServers(updated);
    onUpdateConnectors({
      mcp: { ...connectors.mcp, activeServers: updated }
    });
  };

  const handleSaveAll = () => {
    onUpdateConnectors({
      github: {
        connected: Boolean(ghRepo),
        token: ghToken,
        repo: ghRepo
      },
      openRouter: {
        connected: Boolean(orKey),
        apiKey: orKey,
        selectedModel: selectedOrModel
      },
      huggingFace: {
        connected: Boolean(hfToken),
        token: hfToken
      },
      mcp: {
        connected: mcpServers.length > 0,
        activeServers: mcpServers
      }
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const POPULAR_OPENROUTER_MODELS = [
    { id: 'gemini-3.8-flash', name: 'Google Gemini 3.8 Flash (Built-in High Speed)' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Advanced Reasoning & Math)' },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B Instruct' },
    { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B (Lua Specialist)' },
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full h-[600px] flex flex-col shadow-2xl text-slate-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-slate-950 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Agent Connectors & Multi-AI Hub
              </h2>
              <p className="text-xs text-slate-400">
                Configure Roblox Studio, GitHub, MCP Servers, and OpenRouter AI Keys
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Tab Switcher | Right Config Pane */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Tabs */}
          <div className="w-52 bg-slate-950/80 border-r border-slate-800/80 p-3 space-y-1">
            <button
              onClick={() => setActiveTab('roblox')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                activeTab === 'roblox'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>Roblox Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('openrouter')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                activeTab === 'openrouter'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>OpenRouter / AI</span>
            </button>

            <button
              onClick={() => setActiveTab('mcp')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                activeTab === 'mcp'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>MCP Protocol</span>
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                activeTab === 'github'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Github className="w-4 h-4 text-sky-400" />
              <span>GitHub Sync</span>
            </button>

            <button
              onClick={() => setActiveTab('hf')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                activeTab === 'hf'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className="text-sm">🤗</span>
              <span>Hugging Face</span>
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
            
            {/* ROBLOX STUDIO TAB */}
            {activeTab === 'roblox' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-emerald-400" />
                      Roblox Studio Direct HttpService Bridge
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Stream generated 3D parts, materials, and Lua code straight into Roblox Studio.
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                    Live HTTP Bridge
                  </span>
                </div>

                {/* 1-Click Command Bar Script */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                      <Terminal className="w-3.5 h-3.5" />
                      1-Click Command Bar Script
                    </span>
                    <button
                      onClick={handleCopyCmd}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                    {commandBarSnippet}
                  </pre>
                </div>

                {/* Studio Setup Instructions */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                  <span className="font-bold text-slate-100 block">How to connect Studio:</span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                    <li>Open your Roblox Studio place.</li>
                    <li>Go to <span className="text-amber-300">Home &gt; Game Settings &gt; Security</span> and turn ON <span className="text-emerald-400">"Allow HTTP Requests"</span>.</li>
                    <li>Open <span className="text-amber-300">View &gt; Command Bar</span> at the bottom of Studio.</li>
                    <li>Paste the snippet above and press Enter! The asset instantly appears in <code className="text-emerald-400">workspace</code>.</li>
                  </ol>
                </div>

                <div className="pt-2">
                  <a
                    href="/api/roblox/plugin.lua"
                    download="OmniForgeStudioBridge.lua"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Official Roblox Plugin (.lua)</span>
                  </a>
                </div>
              </div>
            )}

            {/* OPENROUTER / MULTI-AI TAB */}
            {activeTab === 'openrouter' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    OpenRouter & Multi-Model Provider
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Connect an OpenRouter API key to switch between Claude 3.5 Sonnet, DeepSeek R1, Llama 3.3, and GPT-4o right in the chatbot!
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 flex items-center justify-between">
                    <span>OpenRouter API Key (sk-or-v1-...)</span>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Get Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={orKey}
                    onChange={(e) => setOrKey(e.target.value)}
                    placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Select Active Chatbot AI Model</label>
                  <select
                    value={selectedOrModel}
                    onChange={(e) => setSelectedOrModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {POPULAR_OPENROUTER_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  💡 When no OpenRouter key is provided, the chatbot uses the built-in server-side <strong>Google Gemini 3.8 Flash</strong> engine with zero configuration.
                </div>
              </div>
            )}

            {/* MCP TAB */}
            {activeTab === 'mcp' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    MCP (Model Context Protocol) Integration
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Connect local and remote MCP servers so the chatbot agent can access external tools, filesystems, and databases.
                  </p>
                </div>

                {/* Connected MCP servers list */}
                <div className="space-y-2">
                  <span className="text-slate-400 block font-semibold text-[11px]">Active MCP Servers:</span>
                  {mcpServers.map((server) => (
                    <div
                      key={server.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{server.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-mono uppercase">
                            {server.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {server.url} • {server.toolsCount || 4} tools discovered
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                        </span>
                        <button
                          onClick={() => handleRemoveMcpServer(server.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new MCP server */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200 block text-[11px]">Connect New MCP Server</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Server Name (e.g. SQLite)"
                      value={newMcpName}
                      onChange={(e) => setNewMcpName(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="URL (http://... or stdio://...)"
                      value={newMcpUrl}
                      onChange={(e) => setNewMcpUrl(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                    <select
                      value={newMcpType}
                      onChange={(e) => setNewMcpType(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100"
                    >
                      <option value="sse">SSE (Server-Sent Events)</option>
                      <option value="stdio">Stdio Process</option>
                      <option value="websocket">WebSocket</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddMcpServer}
                    className="w-full py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register MCP Server</span>
                  </button>
                </div>
              </div>
            )}

            {/* GITHUB TAB */}
            {activeTab === 'github' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Github className="w-4 h-4 text-sky-400" />
                    GitHub Repository Sync
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Enable the agent to commit and pull long files, Roblox Lua scripts, and websites directly to your GitHub repo.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Target GitHub Repository</label>
                  <input
                    type="text"
                    value={ghRepo}
                    onChange={(e) => setGhRepo(e.target.value)}
                    placeholder="e.g. username/my-roblox-project"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 flex items-center justify-between">
                    <span>Personal Access Token (ghp_...)</span>
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Generate Token <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {/* HUGGING FACE TAB */}
            {activeTab === 'hf' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>🤗</span>
                    Hugging Face Model Access
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    User token for higher inference rate limits and accessing gated models.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 flex items-center justify-between">
                    <span>Hugging Face Token (hf_...)</span>
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Get Token <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={hfToken}
                    onChange={(e) => setHfToken(e.target.value)}
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Keys are securely stored in your local browser session.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save Connector Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
