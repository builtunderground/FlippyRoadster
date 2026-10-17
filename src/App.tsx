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

const STATS_KEY = 'flippy_roadster_stats_v1';
const SKIN_KEY = 'flippy_roadster_skin_v1';
const THRUSTER_KEY = 'flippy_roadster_thruster_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);

  // Active in-run telemetry
  const [currentScore, setCurrentScore] = useState(0);
  const [airPsi, setAirPsi] = useState(10000);
  const [speedMph, setSpeedMph] = useState(250);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('WACO');
  const [triggerRollSignal, setTriggerRollSignal] = useState(0);

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

    if (!isMusicMuted) {
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

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-hud text-white">
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
        />
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center select-none">
          <div className="font-pixel text-3xl text-cyan-400 mb-2 tracking-wider">
            SYSTEM PAUSED
          </div>
          <div className="text-xs font-mono text-slate-400 mb-6">
            SPACEX TELEMETRY HOLD ACTIVE
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 font-pixel text-xs text-white rounded transition-colors cursor-pointer"
            >
              RESUME (P)
            </button>
            <button
              onClick={() => {
                setIsPaused(false);
                setGameState('MENU');
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 font-pixel text-xs text-slate-300 rounded transition-colors cursor-pointer"
            >
              QUIT TO MENU
            </button>
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
