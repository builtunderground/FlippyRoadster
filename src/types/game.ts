export type GameState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type GamePhase = 'WACO' | 'ORBITAL' | 'SPACE';

export interface Skin {
  id: string;
  name: string;
  description: string;
  unlockScore: number;
  bodyColor: string;
  accentColor: string;
  canopyColor: string;
  wheelColor: string;
  hasAstronaut?: boolean;
  metallic?: boolean;
}

export interface ThrusterColor {
  id: string;
  name: string;
  coreColor: string;
  outerColor: string;
  sparkColor: string;
  unlockScore: number;
}

export interface Obstacle {
  x: number;
  width: number;
  topHeight: number;
  bottomHeight: number;
  gapY: number;
  gapSize: number;
  passed: boolean;
  phase: GamePhase;
  topType: 'booster' | 'mechazilla' | 'rigging' | 'satellite' | 'debris' | 'conduit' | 'gantry' | 'crane';
  bottomType: 'cybertruck' | 'model3_stack' | 'cybercab' | 'semi' | 'fleet_platform' | 'generator' | 'battery_pack';
  hazardType?: 'faa_gate' | 'cryo_vent' | 'jetpack_optimus';
  hazardActive?: boolean;
  hazardTimer?: number;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  type: 'token' | 'cryo_boost';
  collected: boolean;
  pulseTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
  type?: 'thrust' | 'spark' | 'smoke' | 'debris' | 'star';
}

export interface GameStats {
  highScore: number;
  totalRuns: number;
  totalFeetCleared: number;
  maxSpeed: number;
  barrelRolls: number;
  unlockedSkins: string[];
  unlockedThrusters: string[];
}

export interface LeaderboardEntry {
  id: string;
  initials: string;
  score: number;
  maxSpeed: number;
  skinName: string;
  date: string;
  userId?: string;
  isPlayer?: boolean;
}
