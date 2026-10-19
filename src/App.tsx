/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GamePhase, Skin, ThrusterColor, GameStats } from './types/game';
import { SKINS, THRUSTER_COLORS } from './utils/pixelRenderer';
import { soundEngine } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GarageModal } from './components/GarageModal';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { GameLogo } from './components/ui/GameLogo';
import { OptimusBot } from './components/ui/OptimusBot';

const STATS_KEY = 'flippy_roadster_stats_v1';
const SKIN_KEY = 'flippy_roadster_skin_v1';
const THRUSTER_KEY = 'flippy_roadster_thruster_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundEngine.getIsMuted());
  const [isMusicMuted, setIsMusicMuted] = useState(() => soundEngine.getIsMusicMuted());
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);

  // Active in-run telemetry
  const [currentScore, setCurrentScore] = useState(0);
  const [airPsi, setAirPsi] = useState(10000);
  const [speedMph, setSpeedMph] = useState(250);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('WACO');
  const [triggerRollSignal, setTriggerRollSignal] = useState(0);
  const [triggerThrustSignal, setTriggerThrustSignal] = useState(0);
  const [isThrustActive, setIsThrustActive] = useState(false);

  // Modals
  const [showGarage, setShowGarage] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  // Last Run Results
  const [lastRunStats, setLastRunStats] = useState({
    score: 0,
    maxSpeed: 250,
    rolls: 0,
    isNewHigh: false,
    quote: 'Success is not guaranteed, but it will probably work.'
  });

  // Career stats state
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      highScore: 0,
      totalRuns: 0,
      totalFeetCleared: 0,
      maxSpeed: 250,
      barrelRolls: 0,
      unlockedSkins: ['ano_white'],
      unlockedThrusters: ['cryo_cyan']
    };
  });

  // Current selected Skin & Thruster
  const [currentSkin, setCurrentSkin] = useState<Skin>(() => {
    try {
      const saved = localStorage.getItem(SKIN_KEY);
      if (saved) {
        const found = SKINS.find((s) => s.id === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return SKINS[0];
  });

  const [currentThruster, setCurrentThruster] = useState<ThrusterColor>(() => {
    try {
      const saved = localStorage.getItem(THRUSTER_KEY);
      if (saved) {
        const found = THRUSTER_COLORS.find((t) => t.id === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return THRUSTER_COLORS[0];
  });

  // Save stats to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  // Handle Start Run (with launch pad countdown)
  const handleStartRun = () => {
    setShowGameOver(false);
    setShowGarage(false);
    setShowLeaderboard(false);
    setShowSettings(false);
    setIsPaused(false);
    setCurrentScore(0);
    setAirPsi(10000);
    setSpeedMph(250);
    setCurrentPhase('WACO');
    setGameState('COUNTDOWN');

    if (!isMusicMuted && !isMuted) {
      soundEngine.startMusic();
    }
  };

  const handleCountdownComplete = () => {
    setGameState('PLAYING');
  };

  // Handle Score & Telemetry update from GameCanvas
  const handleScoreUpdate = useCallback(
    (score: number, psi: number, speed: number, phase: GamePhase) => {
      setCurrentScore(score);
      setAirPsi(psi);
      setSpeedMph(speed);
      setCurrentPhase(phase);
    },
    []
  );

  // Handle Game Over
  const handleGameOver = useCallback(
    (finalScore: number, maxRunSpeed: number, rollCount: number) => {
      setGameState('GAME_OVER');
      setIsPaused(false);

      const quotes = [
        "Success is not guaranteed, but it will probably work.",
        "Prototypes are easy, production is hard.",
        "Physics is the law, everything else is a recommendation.",
        "Hop to 2028.",
        "If something is important enough, you do it anyway.",
        "Next year for sure."
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      soundEngine.speakGameOverQuote(randomQuote);

      setStats((prev) => {
        const isNewHigh = finalScore > prev.highScore;
        const newHighScore = Math.max(prev.highScore, finalScore);
        const newMaxSpeed = Math.max(prev.maxSpeed, maxRunSpeed);

        // Check new unlocks
        const newUnlockedSkins = SKINS.filter(
          (s) => newHighScore >= s.unlockScore
        ).map((s) => s.id);
        const newUnlockedThrusters = THRUSTER_COLORS.filter(
          (t) => newHighScore >= t.unlockScore
        ).map((t) => t.id);

        setLastRunStats({
          score: finalScore,
          maxSpeed: maxRunSpeed,
          rolls: rollCount,
          isNewHigh,
          quote: randomQuote
        });

        return {
          highScore: newHighScore,
          totalRuns: prev.totalRuns + 1,
          totalFeetCleared: prev.totalFeetCleared + finalScore,
          maxSpeed: newMaxSpeed,
          barrelRolls: prev.barrelRolls + rollCount,
          unlockedSkins: Array.from(new Set([...prev.unlockedSkins, ...newUnlockedSkins])),
          unlockedThrusters: Array.from(new Set([...prev.unlockedThrusters, ...newUnlockedThrusters]))
        };
      });

      setShowGameOver(true);
    },
    []
  );

  // Skin and Thruster selections
  const handleSelectSkin = (skin: Skin) => {
    setCurrentSkin(skin);
    try {
      localStorage.setItem(SKIN_KEY, skin.id);
    } catch {}
  };

  const handleSelectThruster = (thruster: ThrusterColor) => {
    setCurrentThruster(thruster);
    try {
      localStorage.setItem(THRUSTER_KEY, thruster.id);
    } catch {}
  };

  // Sound FX and Music Toggles
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleMusic = () => {
    const next = !isMusicMuted;
    setIsMusicMuted(next);
    soundEngine.setMusicMuted(next);
  };

  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      setIsPaused((p) => !p);
    }
  };

  // Trigger Barrel Roll from HUD button
  const handleTriggerRoll = () => {
    setTriggerRollSignal((c) => c + 1);
  };

  // Reset career progress
  const handleResetProgress = () => {
    const initialStats: GameStats = {
      highScore: 0,
      totalRuns: 0,
      totalFeetCleared: 0,
      maxSpeed: 250,
      barrelRolls: 0,
      unlockedSkins: ['ano_white'],
      unlockedThrusters: ['cryo_cyan']
    };
    setStats(initialStats);
    setCurrentSkin(SKINS[0]);
    setCurrentThruster(THRUSTER_COLORS[0]);
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(SKIN_KEY);
    localStorage.removeItem(THRUSTER_KEY);
  };

  // Allow user to upload or drop custom soundtrack if they wish
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      soundEngine.setCustomAudio(url);
      setIsMusicMuted(false);
    }
  };

  const handleTriggerThrustStart = useCallback(() => {
    setIsThrustActive(true);
    setTriggerThrustSignal((s) => s + 1);
  }, []);

  const handleTriggerThrustEnd = useCallback(() => {
    setIsThrustActive(false);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full min-h-[100dvh] max-h-[100dvh] bg-black overflow-hidden flex flex-col items-center justify-center font-hud text-white select-none touch-none">
      {/* Retro CRT Scanlines Overlay */}
      {scanlinesEnabled && (
        <div className="absolute inset-0 scanlines pointer-events-none z-20" />
      )}

      {/* Main Game Canvas */}
      <GameCanvas
        gameState={gameState}
        currentSkin={currentSkin}
        currentThruster={currentThruster}
        onCountdownComplete={handleCountdownComplete}
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
        isPaused={isPaused}
        triggerRollSignal={triggerRollSignal}
        triggerThrustSignal={triggerThrustSignal}
        isThrustActive={isThrustActive}
      />

      {/* Top HUD (during play and game over) */}
      {gameState !== 'MENU' && (
        <HUD
          score={currentScore}
          airPsi={airPsi}
          maxPsi={10000}
          speedMph={speedMph}
          phase={currentPhase}
          isPaused={isPaused}
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          isRolling={false}
          rollCharge={1}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          onTriggerRoll={handleTriggerRoll}
          onTriggerThrustStart={handleTriggerThrustStart}
          onTriggerThrustEnd={handleTriggerThrustEnd}
        />
      )}

      {/* Title / Start Screen */}
      {gameState === 'MENU' && (
        <StartScreen
          onStartGame={handleStartRun}
          highScore={stats.highScore}
          currentSkin={currentSkin}
          onSelectSkin={handleSelectSkin}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 select-none">
          <div className="bg-[#050505] border border-neutral-800 p-5 sm:p-6 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative">
            {/* Game Logo prominently visible in pause menu */}
            <div className="mb-3">
              <GameLogo size="sm" showSubtitle={false} />
            </div>

            <div className="font-oxanium font-bold text-xl sm:text-2xl text-white mb-0.5 tracking-wider uppercase">
              SYSTEM PAUSED
            </div>
            <div className="font-kanji text-[10px] text-neutral-400 mb-1">
              一時停止 · テレメトリ保持
            </div>
            <div className="text-[9px] font-mono text-neutral-500 mb-3">
              [SPACEX TELEMETRY HOLD ACTIVE]
            </div>

            {/* Optimus robot standing by during pause */}
            <div className="w-full mb-4">
              <OptimusBot
                mood="idle"
                statusMessage="FLIGHT TELEMETRY FROZEN. STANDING BY FOR PILOT INPUT."
                subMessage="OPTIMUS GEN-2 // HOLD PROTOCOL"
                size="sm"
                compact={true}
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 font-oxanium font-bold text-xs text-white border border-red-400 transition-colors cursor-pointer tracking-wider shadow-[0_0_15px_rgba(232,33,39,0.3)]"
              >
                RESUME FLIGHT &middot; 再開 (P)
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  setGameState('MENU');
                }}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 font-oxanium font-bold text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer tracking-wider"
              >
                ABORT TO MENU &middot; メニューへ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showGarage && (
        <GarageModal
          currentSkin={currentSkin}
          currentThruster={currentThruster}
          highScore={stats.highScore}
          onSelectSkin={handleSelectSkin}
          onSelectThruster={handleSelectThruster}
          onClose={() => setShowGarage(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          stats={stats}
          currentRunScore={lastRunStats.score}
          currentRunSpeed={lastRunStats.maxSpeed}
          currentSkinName={currentSkin.name}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          scanlinesEnabled={scanlinesEnabled}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          onToggleScanlines={() => setScanlinesEnabled((s) => !s)}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showGameOver && (
        <GameOverModal
          score={lastRunStats.score}
          highScore={stats.highScore}
          isNewHigh={lastRunStats.isNewHigh}
          maxSpeed={lastRunStats.maxSpeed}
          barrelRolls={lastRunStats.rolls}
          currentSkin={currentSkin}
          quote={lastRunStats.quote}
          onRestart={handleStartRun}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onMainMenu={() => {
            setShowGameOver(false);
            setGameState('MENU');
          }}
        />
      )}

      {/* Hidden Audio file input for custom tracks */}
      <input
        type="file"
        id="custom-audio-input"
        accept="audio/*"
        onChange={handleCustomAudioUpload}
        className="hidden"
      />
    </div>
  );
}
