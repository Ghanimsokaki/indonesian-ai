import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ArtifactItem, UserProfile, ConnectorState } from '../types';
import { 
  Send, 
  Sparkles, 
  Gamepad2, 
  Globe, 
  FileCode, 
  Cpu, 
  Github, 
  User, 
  Radio, 
  Terminal, 
  RefreshCw, 
  ArrowRight,
  Layers,
  ChevronDown,
  CheckCircle2,
  Sliders,
  PanelRight,
  PlusCircle,
  Copy,
  Key
} from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenConnectors: () => void;
  onOpenSecrets: () => void;
  connectors: ConnectorState;
  onSelectArtifact: (artifact: ArtifactItem) => void;
  isWorkspaceOpen: boolean;
  onToggleWorkspace: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedModel,
  onSelectModel,
  currentUser,
  onOpenAuth,
  onOpenConnectors,
  onOpenSecrets,
  connectors,
  onSelectArtifact,
  isWorkspaceOpen,
  onToggleWorkspace
}) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const PROMPT_SUGGESTIONS = [
    { label: '🎮 3D Plasma Sentry Turret', text: 'Create a 3D Cyberpunk Plasma Sentry Turret with dual barrels, rotating pivot, and Roblox Lua raycasting target logic. Deploy it to Roblox Studio.' },
    { label: '🌐 Dynamic Game Studio Portal', text: 'Generate an interactive website in the in-app browser showcasing our Roblox game studio with 3D cards, live player counts, and join group modal.' },
    { label: '📄 200-Line DataStore2 Module', text: 'Write a comprehensive 200+ line production Roblox DataStore2 session locking and player inventory module in Luau with retry loops and auto-save.' },
    { label: '⚔️ Holographic Obby Hazard', text: 'Build a floating 3D neon laser hazard obby checkpoint with sound effects and player touch respawn logic.' }
  ];

  const AVAILABLE_MODELS = [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Built-in High Speed)' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Reasoning / Math)' },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B' },
    { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B (Lua / Code)' },
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o' }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative">
      
      {/* Top Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Brand & Model Selector */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-sky-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-amber-400 via-rose-300 to-sky-300 bg-clip-text text-transparent">
                OmniForge AI Agent
              </span>
              <button
                onClick={onOpenSecrets}
                title="Personal API Key Management (BYOK - Bring Your Own Key)"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono border transition-colors bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              >
                <Key className="w-2.5 h-2.5 text-amber-400" />
                <span>Use Your Own Key</span>
              </button>
            </div>

            {/* Model Dropdown */}
            <div className="relative mt-0.5">
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="bg-transparent text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer focus:outline-none font-mono pr-4 appearance-none"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                    Model: {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Center / Right Connector Badges & Controls */}
        <div className="flex items-center gap-2">
          {/* Roblox Studio Bridge Badge */}
          <button
            onClick={onOpenConnectors}
            title="Roblox Studio Bridge Status"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-[11px] text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline text-slate-400">Roblox:</span>
            <span className="text-emerald-400 font-semibold">Live Bridge</span>
          </button>

          {/* MCP Protocol Badge */}
          <button
            onClick={onOpenConnectors}
            title="MCP Protocol Status"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-purple-500/30 text-[11px] text-slate-300 hover:bg-slate-800 transition-colors hidden sm:flex"
          >
            <Cpu className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300 font-mono">
              MCP ({connectors.mcp.activeServers.length})
            </span>
          </button>

          {/* All Connectors Modal Trigger */}
          <button
            onClick={onOpenConnectors}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span className="hidden lg:inline">Connectors</span>
          </button>

          {/* Secrets & Vercel Config Modal Trigger */}
          <button
            onClick={onOpenSecrets}
            title="Manage API Keys & Launch on Vercel"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-[11px] text-amber-300 hover:bg-slate-800 transition-colors shadow-sm"
          >
            <span className="font-bold text-[10px]">▲</span>
            <span className="hidden lg:inline font-semibold">Launch on Vercel</span>
          </button>

          {/* User Profile / Login */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt="avatar"
                className="w-4 h-4 rounded-full object-cover border border-emerald-500"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {currentUser ? currentUser.displayName : 'Sign In'}
            </span>
          </button>

          {/* Split Workspace Toggle */}
          <button
            onClick={onToggleWorkspace}
            title={isWorkspaceOpen ? 'Collapse 3D / Browser Workspace' : 'Open 3D / Browser Workspace'}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isWorkspaceOpen
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Message History Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-sky-500 mx-auto p-0.5 shadow-2xl shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-100">
                OmniForge Autonomous Agent
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                Your AI co-developer with native connectors to <strong className="text-slate-200">Roblox Studio</strong>, <strong className="text-slate-200">In-App Browser</strong>, <strong className="text-slate-200">GitHub</strong>, and <strong className="text-slate-200">MCP</strong>. Generates 3D Part hierarchies, complete websites, and production-grade long files.
              </p>
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {PROMPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.text)}
                  className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 transition-all text-xs text-slate-300 group hover:-translate-y-0.5 shadow-sm"
                >
                  <div className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors mb-1">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">
                    {item.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Rendered Message List */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed max-w-3xl ${
                msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {/* Avatar */}
              {msg.role !== 'user' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-slate-100 max-w-xl'
                    : 'bg-slate-900 border border-slate-800/90 text-slate-200 shadow-md w-full'
                }`}
              >
                {/* User or Agent Tag */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/60 pb-1.5 font-mono">
                  <span>{msg.role === 'user' ? (currentUser?.displayName || 'You') : 'OmniForge Agent'}</span>
                  {msg.modelUsed && <span className="text-amber-400">{msg.modelUsed}</span>}
                </div>

                {/* Tool calls execution pills if present */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    {msg.toolCalls.map((call) => (
                      <div
                        key={call.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono"
                      >
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tool: {call.name}</span>
                        </div>
                        <span className="text-slate-400">{call.result}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Main message text */}
                <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                  {/* Clean out raw artifact JSON blocks so user sees pristine cards */}
                  {msg.content.replace(/```artifact[\s\S]*?```/g, '').trim()}
                </div>

                {/* Rendered Artifact Cards */}
                {msg.artifacts && msg.artifacts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
                      Generated Artifacts & Connectors:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.artifacts.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => onSelectArtifact(art)}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-slate-900 group"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {art.type === '3d-asset' || art.type === 'roblox-script' ? (
                                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                              ) : art.type === 'website' ? (
                                <Globe className="w-4 h-4 text-sky-400" />
                              ) : (
                                <FileCode className="w-4 h-4 text-amber-400" />
                              )}
                              <span className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                                {art.title}
                              </span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            {art.type === '3d-asset' ? 'Open in 3D Roblox Viewport →' :
                             art.type === 'website' ? 'Open in Live In-App Browser →' :
                             'Open in Long File Synthesizer →'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && currentUser && (
                <img
                  src={currentUser.avatar}
                  alt="user"
                  className="w-7 h-7 rounded-lg object-cover border border-amber-500/50 shrink-0 mt-0.5"
                />
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-slate-400 mr-auto max-w-xl bg-slate-900 p-3 rounded-2xl border border-slate-800 animate-pulse">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Agent reasoning, synthesizing files, and deploying to Roblox bridge...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Prompt Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800/80 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          
          {/* Quick Action Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-slate-400">
            <button
              onClick={() => setInputText('Generate a 3D procedural Roblox asset: ')}
              className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Gamepad2 className="w-3 h-3 text-emerald-400" />
              <span>+ 3D Roblox Asset</span>
            </button>
            <button
              onClick={() => setInputText('Create a dynamic responsive website in browser: ')}
              className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:text-sky-300 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Globe className="w-3 h-3 text-sky-400" />
              <span>+ Website in Browser</span>
            </button>
            <button
              onClick={() => setInputText('Write an extensive multi-hundred line code file for: ')}
              className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <FileCode className="w-3 h-3 text-amber-400" />
              <span>+ Long Code File</span>
            </button>
          </div>

          {/* Textarea & Send Button */}
          <div className="relative flex items-end bg-slate-950 border border-slate-800 rounded-2xl p-2 focus-within:border-amber-500/80 transition-all shadow-inner">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Ask OmniForge Agent to create 3D assets, write long files, build websites, or sync to Roblox Studio..."
              className="flex-1 bg-transparent border-0 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none p-1.5 resize-none leading-relaxed"
            />

            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className={`p-2 rounded-xl transition-all ${
                isLoading || !inputText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:opacity-90 shadow-md shadow-amber-500/20 active:scale-95'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Shift + Enter for new line • Enter to send</span>
            <span>Roblox Bridge: <strong className="text-emerald-400">Active</strong> • MCP: <strong className="text-purple-400">Connected</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
};
