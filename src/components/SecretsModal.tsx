import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Server
} from 'lucide-react';

interface SecretsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const SecretsModal: React.FC<SecretsModalProps> = ({
  isOpen,
  onClose,
  appUrl
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'vercel' | 'cli'>('manage');
  
  // Secret states stored in local storage
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [openRouterKey, setOpenRouterKey] = useState<string>(() => localStorage.getItem('OPENROUTER_API_KEY') || '');
  const [hfToken, setHfToken] = useState<string>(() => localStorage.getItem('HF_TOKEN') || '');
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('GITHUB_TOKEN') || '');
  const [customAppUrl, setCustomAppUrl] = useState<string>(() => localStorage.getItem('APP_URL') || appUrl);

  const [showGemini, setShowGemini] = useState<boolean>(false);
  const [showOr, setShowOr] = useState<boolean>(false);
  const [showHf, setShowHf] = useState<boolean>(false);
  const [showGh, setShowGh] = useState<boolean>(false);

  const [copiedEnv, setCopiedEnv] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSecrets = () => {
    localStorage.setItem('GEMINI_API_KEY', geminiKey.trim());
    localStorage.setItem('OPENROUTER_API_KEY', openRouterKey.trim());
    localStorage.setItem('HF_TOKEN', hfToken.trim());
    localStorage.setItem('GITHUB_TOKEN', githubToken.trim());
    localStorage.setItem('APP_URL', customAppUrl.trim());

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleTestSecrets = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Ping test connection',
          model: openRouterKey ? 'meta-llama/llama-3.3-70b-instruct' : 'gemini-3.8-flash',
          userKeys: {
            geminiApiKey: geminiKey.trim(),
            openRouterKey: openRouterKey.trim()
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult(`✅ Personal API Key verified! Agent responded via ${data.modelUsed || 'AI'}. Your keys are saved locally and ready!`);
      } else {
        setTestResult(`⚠️ Server notice: ${data.error || 'Check key validity'}`);
      }
    } catch {
      setTestResult('⚠️ Could not connect to API server. Please check your backend.');
    } finally {
      setIsTesting(false);
    }
  };

  const envFileContent = `# OmniForge AI - Vercel & Production Environment Secrets
GEMINI_API_KEY="${geminiKey || 'your_gemini_api_key_here'}"
OPENROUTER_API_KEY="${openRouterKey || 'your_openrouter_api_key_here'}"
HF_TOKEN="${hfToken || 'your_huggingface_token_here'}"
GITHUB_TOKEN="${githubToken || 'your_github_token_here'}"
APP_URL="${customAppUrl || 'https://your-project.vercel.app'}"
`;

  const vercelCliCommands = `# Vercel CLI Secrets Commands
vercel env add GEMINI_API_KEY production
vercel env add OPENROUTER_API_KEY production
vercel env add HF_TOKEN production
vercel env add GITHUB_TOKEN production
vercel env add APP_URL production
vercel --prod`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envFileContent);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(vercelCliCommands);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Secrets & Vercel Configuration</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  Vercel Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage API keys, environment variables, and 1-click Vercel secrets deployment
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

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-0 flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-2.5 font-semibold px-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Manage Secrets</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 font-semibold px-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Vercel Deployment (.env.local)</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`pb-2.5 font-semibold px-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'cli'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Vercel CLI Script</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: MANAGE SECRETS */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              
              {/* Bring Your Own Key (BYOK) Multi-User Notice */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-amber-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Multi-User Privacy: Bring Your Own API Key (BYOK)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  When deployed on Vercel or shared with other people, each user can enter their own API keys below.
                  Your keys are saved securely in your browser's private <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">localStorage</code> and are never shared with or accessible by other visitors.
                </p>
              </div>

              {/* Gemini API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>GEMINI_API_KEY</span>
                    <span className="text-[10px] text-amber-400 font-normal">(Primary Model Key)</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-0.5 text-[11px]"
                  >
                    Get Gemini Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showGemini ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGemini(!showGemini)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenRouter API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-sky-400" />
                    <span>OPENROUTER_API_KEY</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Claude, DeepSeek, Llama, GPT-4o)</span>
                  </label>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-0.5 text-[11px]"
                  >
                    Get OpenRouter Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showOr ? 'text' : 'password'}
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOr(!showOr)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showOr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Hugging Face Token */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span>🤗</span>
                    <span>HF_TOKEN</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Private models & higher limits)</span>
                  </label>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-0.5 text-[11px]"
                  >
                    Get HF Token <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showHf ? 'text' : 'password'}
                    value={hfToken}
                    onChange={(e) => setHfToken(e.target.value)}
                    placeholder="hf_..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHf(!showHf)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showHf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* GitHub Token */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span>🐙</span>
                    <span>GITHUB_TOKEN</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Repo sync & file commits)</span>
                  </label>
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-0.5 text-[11px]"
                  >
                    Get GitHub Token <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showGh ? 'text' : 'password'}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGh(!showGh)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showGh ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Target APP_URL */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  APP_URL (Your Vercel Domain)
                </label>
                <input
                  type="text"
                  value={customAppUrl}
                  onChange={(e) => setCustomAppUrl(e.target.value)}
                  placeholder="https://your-app.vercel.app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {testResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 text-xs">
                  {testResult}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VERCEL DASHBOARD & .ENV.LOCAL */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              
              {/* 1-Click Launch on Vercel Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-black border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">▲</span>
                    <span className="font-extrabold text-sm text-slate-100">Deploy OmniForge to Vercel</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Host your full-stack AI agent, 3D studio, and Roblox bridge on Vercel with zero server setup.
                  </p>
                </div>
                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-black font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all shrink-0"
                >
                  <span>▲ Import into Vercel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-slate-100 block flex items-center justify-between">
                  <span>Vercel Launch Checklist (Vite + Serverless API):</span>
                  <span className="text-[10px] text-emerald-400 font-mono">vercel.json Configured</span>
                </span>
                <ol className="list-decimal pl-4 space-y-2 text-slate-300 text-[11px]">
                  <li>
                    <strong className="text-white">Push to GitHub:</strong> Commit your repository to GitHub using the GitHub Connector or Git CLI.
                  </li>
                  <li>
                    <strong className="text-white">Import to Vercel:</strong> Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-sky-400 underline">vercel.com/new</a> and select your GitHub repository.
                  </li>
                  <li>
                    <strong className="text-white">Build Settings:</strong> Framework Preset: <span className="text-amber-300 font-mono">Vite</span>. Build Command: <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">npm run build</code>. Output Directory: <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">dist</code>.
                  </li>
                  <li>
                    <strong className="text-white">Add Environment Variables:</strong> Under <em>Settings → Environment Variables</em>, copy the formatted keys below.
                  </li>
                  <li>
                    <strong className="text-white">Multi-User Ready:</strong> Once deployed, any user who visits your Vercel URL can also enter their own API key via the <em>"Use Your Own Key"</em> button!
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 font-mono">
                    Formatted .env.local for Vercel
                  </span>
                  <button
                    onClick={handleCopyEnv}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEnv ? 'Copied!' : 'Copy .env.local'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {envFileContent}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: VERCEL CLI */}
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-xs">
                If deploying with the Vercel CLI, run these commands in your project terminal to link all environment variables automatically:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 font-mono">
                    Vercel CLI Setup Script
                  </span>
                  <button
                    onClick={handleCopyCli}
                    className="text-purple-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCli ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-purple-300 overflow-x-auto">
                  {vercelCliCommands}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <button
            onClick={handleTestSecrets}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSecrets}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savedSuccess ? 'Saved Secrets!' : 'Save Secrets'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
