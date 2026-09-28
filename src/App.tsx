/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChatMessage, ArtifactItem, UserProfile, ConnectorState } from './types';
import { ChatWindow } from './components/ChatWindow';
import { ArtifactWorkspace } from './components/ArtifactWorkspace';
import { AuthModal } from './components/AuthModal';
import { ConnectorsModal } from './components/ConnectorsModal';
import { SecretsModal } from './components/SecretsModal';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [activeArtifact, setActiveArtifact] = useState<ArtifactItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(true);
  const [appUrl, setAppUrl] = useState<string>(window.location.origin);
  const [isSecretsOpen, setIsSecretsOpen] = useState<boolean>(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('omniforge_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 'user-demo',
      username: 'roblox_dev',
      displayName: 'Nexus Creator',
      email: 'creator@omniforge.ai',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80',
      role: 'creator',
      createdAt: Date.now() - 86400000,
      keys: {
        githubRepo: 'nexus-studios/roblox-core-systems',
        mcpServers: [
          { id: 'mcp-fs', name: 'Filesystem MCP', url: 'stdio://filesystem', type: 'stdio', status: 'connected', toolsCount: 8 },
          { id: 'mcp-roblox', name: 'Roblox Engine MCP', url: 'http://localhost:8080/sse', type: 'sse', status: 'connected', toolsCount: 14 }
        ]
      }
    };
  });

  // Connectors State (Roblox, GitHub, MCP, OpenRouter, HF)
  const [connectors, setConnectors] = useState<ConnectorState>(() => {
    const saved = localStorage.getItem('omniforge_connectors');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      robloxStudio: {
        connected: true,
        bridgeUrl: '/api/roblox/bridge'
      },
      github: {
        connected: true,
        repo: 'nexus-studios/roblox-core-systems'
      },
      mcp: {
        connected: true,
        activeServers: [
          { id: 'mcp-fs', name: 'Filesystem MCP', url: 'stdio://filesystem', type: 'stdio', status: 'connected', toolsCount: 8 },
          { id: 'mcp-roblox', name: 'Roblox Engine MCP', url: 'http://localhost:8080/sse', type: 'sse', status: 'connected', toolsCount: 14 }
        ]
      },
      openRouter: {
        connected: false,
        selectedModel: 'gemini-3.8-flash'
      },
      huggingFace: {
        connected: false
      }
    };
  });

  // Modal dialog states
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState<boolean>(false);

  // Initialize status and initial demo artifact
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.appUrl) setAppUrl(data.appUrl);
      } catch (err) {
        console.error('Failed to get status:', err);
      }
    };
    checkStatus();

    // Default starter 3D artifact
    const defaultSentry: ArtifactItem = {
      id: 'default-turret',
      type: '3d-asset',
      title: 'Cyberpunk Plasma Sentry Turret',
      language: 'lua',
      content: `-- [OmniForge AI] Cyberpunk Plasma Sentry Turret
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local Debris = game:GetService("Debris")

local turret = script.Parent
local pivot = turret:WaitForChild("PivotMount")
local plasmaCore = turret:WaitForChild("PlasmaCore")
print("[OmniForge] Sentry Turret Initialized in Studio!")`,
      data: {
        parts: [
          { name: 'TurretBase', shape: 'Cylinder', size: { x: 6, y: 1.5, z: 6 }, position: { x: 0, y: 0.75, z: 0 }, rotation: { x: 0, y: 0, z: 90 }, color: '#1e293b', material: 'Metal', anchored: true, canCollide: true },
          { name: 'PivotMount', shape: 'Block', size: { x: 3, y: 3, z: 3 }, position: { x: 0, y: 3, z: 0 }, color: '#0284c7', material: 'SmoothPlastic', anchored: true, canCollide: true },
          { name: 'PlasmaCore', shape: 'Ball', size: { x: 2, y: 2, z: 2 }, position: { x: 0, y: 3.5, z: 0 }, color: '#38bdf8', material: 'Neon', anchored: true, canCollide: false },
          { name: 'LeftBarrel', shape: 'Cylinder', size: { x: 1, y: 5, z: 1 }, position: { x: -1.2, y: 3.5, z: 3 }, rotation: { x: 90, y: 0, z: 0 }, color: '#f59e0b', material: 'Neon', anchored: true, canCollide: true },
          { name: 'RightBarrel', shape: 'Cylinder', size: { x: 1, y: 5, z: 1 }, position: { x: 1.2, y: 3.5, z: 3 }, rotation: { x: 90, y: 0, z: 0 }, color: '#f59e0b', material: 'Neon', anchored: true, canCollide: true }
        ]
      }
    };

    setArtifacts([defaultSentry]);
    setActiveArtifact(defaultSentry);
  }, []);

  const handleUpdateConnectors = (updated: Partial<ConnectorState>) => {
    const merged = { ...connectors, ...updated };
    setConnectors(merged);
    localStorage.setItem('omniforge_connectors', JSON.stringify(merged));
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('omniforge_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('omniforge_user');
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const activeUserKeys = {
        ...currentUser?.keys,
        geminiApiKey: localStorage.getItem('GEMINI_API_KEY') || currentUser?.keys?.geminiApiKey,
        openRouterKey: localStorage.getItem('OPENROUTER_API_KEY') || currentUser?.keys?.openRouterKey,
        huggingFaceKey: localStorage.getItem('HF_TOKEN') || currentUser?.keys?.huggingFaceKey,
        githubToken: localStorage.getItem('GITHUB_TOKEN') || currentUser?.keys?.githubToken,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newHistory,
          model: selectedModel,
          userKeys: activeUserKeys,
          connectors
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to communicate with agent');
      }

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
        modelUsed: data.modelUsed,
        toolCalls: data.toolCalls,
        artifacts: data.artifacts
      };

      setMessages([...newHistory, agentMsg]);

      // If the agent returned artifacts, add them and open workspace!
      if (data.artifacts && data.artifacts.length > 0) {
        const latestArtifact = data.artifacts[0];
        setArtifacts(prev => [latestArtifact, ...prev]);
        setActiveArtifact(latestArtifact);
        setIsWorkspaceOpen(true);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Error executing request: ${err.message || 'Please check your connector settings.'}`,
        timestamp: Date.now()
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Left Chatbot Agent Pane */}
      <div className={`h-full flex flex-col transition-all duration-300 ${
        isWorkspaceOpen ? 'w-full lg:w-1/2 xl:w-[48%]' : 'w-full'
      }`}>
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenConnectors={() => setIsConnectorsOpen(true)}
          onOpenSecrets={() => setIsSecretsOpen(true)}
          connectors={connectors}
          onSelectArtifact={(art) => {
            setActiveArtifact(art);
            setIsWorkspaceOpen(true);
          }}
          isWorkspaceOpen={isWorkspaceOpen}
          onToggleWorkspace={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
        />
      </div>

      {/* Right Artifact Workspace Pane (3D Studio, In-App Browser, Long File Synthesizer) */}
      {isWorkspaceOpen && (
        <div className="hidden lg:flex flex-1 h-full overflow-hidden border-l border-slate-800 animate-in fade-in duration-200">
          <ArtifactWorkspace
            artifacts={artifacts}
            activeArtifact={activeArtifact}
            onSelectArtifact={setActiveArtifact}
            appUrl={appUrl}
          />
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Connectors & Multi-AI Modal */}
      <ConnectorsModal
        isOpen={isConnectorsOpen}
        onClose={() => setIsConnectorsOpen(false)}
        appUrl={appUrl}
        connectors={connectors}
        onUpdateConnectors={handleUpdateConnectors}
      />

      {/* Secrets & Vercel Configuration Modal */}
      <SecretsModal
        isOpen={isSecretsOpen}
        onClose={() => setIsSecretsOpen(false)}
        appUrl={appUrl}
      />

    </div>
  );
}
