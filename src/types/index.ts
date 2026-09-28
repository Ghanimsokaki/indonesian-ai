export type AppTab = 'chat' | 'hf-hub' | 'web-builder' | 'roblox-engine' | 'pipeline';

export interface HFModel {
  id: string;
  name: string;
  author: string;
  category: string;
  task: string;
  downloads: string;
  likes: string;
  description: string;
  defaultParams: Record<string, any>;
  samplePrompt: string;
}

export interface HFInferenceResult {
  source: 'huggingface_live_api' | 'omniforge_neural_engine';
  modelId?: string;
  simulatedModel?: string;
  output: any;
  raw: any;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  role: 'developer' | 'creator' | 'admin';
  createdAt: number;
  keys: {
    geminiApiKey?: string;
    openRouterKey?: string;
    huggingFaceKey?: string;
    githubToken?: string;
    githubRepo?: string;
    mcpServers?: McpServerConfig[];
    robloxGameId?: string;
  };
}

export interface McpServerConfig {
  id: string;
  name: string;
  url: string; // e.g. http://localhost:8080/sse or custom
  type: 'sse' | 'stdio' | 'websocket' | 'builtin';
  status: 'connected' | 'disconnected' | 'error';
  toolsCount?: number;
}

export interface ConnectorState {
  robloxStudio: {
    connected: boolean;
    bridgeUrl: string;
    activeAssetId?: string;
    lastSynced?: number;
  };
  github: {
    connected: boolean;
    repo: string;
    token?: string;
  };
  mcp: {
    connected: boolean;
    activeServers: McpServerConfig[];
  };
  openRouter: {
    connected: boolean;
    apiKey?: string;
    selectedModel: string;
  };
  huggingFace: {
    connected: boolean;
    token?: string;
  };
}

export interface ToolCallExecution {
  id: string;
  name: string;
  arguments: Record<string, any>;
  status: 'running' | 'completed' | 'failed';
  result?: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: string;
  toolCalls?: ToolCallExecution[];
  artifacts?: ArtifactItem[];
}

export interface ArtifactVersion {
  id: string;
  versionNumber: number;
  timestamp: number;
  label: string;
  changeType: 'initial' | 'material-edit' | 'lua-edit' | 'json-edit' | 'snapshot' | 'revert';
  description?: string;
  content: string; // code or JSON
  data?: any; // 3D parts array or metadata
  partsCount?: number;
}

export interface ArtifactItem {
  id: string;
  type: '3d-asset' | 'website' | 'long-file' | 'roblox-script';
  title: string;
  language?: string;
  content: string; // code or JSON
  data?: any; // e.g. 3D parts array, metadata
  version?: number;
  history?: ArtifactVersion[];
}

export interface RobloxPart {
  name: string;
  shape: 'Block' | 'Cylinder' | 'Ball' | 'Wedge' | 'Cone' | 'Torus';
  size: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  color: string;
  brickColor?: string;
  material: 'Neon' | 'SmoothPlastic' | 'Glass' | 'Metal' | 'WoodPlanks' | 'ForceField' | 'Foil' | 'CorrodedMetal' | 'Granite' | 'DiamondPlate';
  anchored?: boolean;
  canCollide?: boolean;
  transparency?: number;
  metallic?: number;
  roughness?: number;
  reflectance?: number;
  emissiveIntensity?: number;
}

export interface RobloxAsset {
  id: string;
  name: string;
  type: 'Model3D' | 'ServerScript' | 'LocalScript' | 'ModuleScript' | 'ScreenGui' | 'CompleteGameModule';
  category: string;
  description: string;
  targetLocation: 'Workspace' | 'ReplicatedStorage' | 'ServerScriptService' | 'StarterGui';
  parts?: RobloxPart[];
  luaCode: string;
  createdAt: number;
  deployedToStudio: boolean;
  status: 'ready' | 'synced' | 'pending';
}
