
export type SystemStatus = 'STANDBY' | 'ONLINE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR' | 'SECURITY_ALERT' | 'UNVERIFIED' | 'VERIFYING' | 'RECONNECTING' | 'SEARCHING';

export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: 'STRANGER_DETECTED' | 'BOSS_RETURNED' | 'BOSS_LEFT' | 'MANUAL_LOCKDOWN' | 'RELATIVE_IDENTIFIED' | 'ENVIRONMENT' | 'OBSERVATION' | 'SECURITY' | 'INTERACTION';
  description: string;
  capturedImage?: string; // base64
  relation?: string;
  voiceNoteTranscript?: string;
  isHidden?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'turbo' | 'system' | 'neural_command';
  text: string;
  timestamp: number;
  isInterim?: boolean;
  sources?: { title: string; uri: string }[];
}

export interface SystemData {
  battery?: number;
  charging?: boolean;
  lat?: number;
  lng?: number;
  locationName?: string;
  weather?: string;
}

export interface BossProfile {
  preferences: string[];
  interests: string[];
  communicationStyle: string;
  affinityLevel: number;
  isVerified: boolean;
  isHideMode: boolean; 
  isBossPresent: boolean;
  securityLog: SecurityEvent[];
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
