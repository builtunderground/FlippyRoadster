import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, GamePhase, Skin, ThrusterColor, Obstacle, Collectible, Particle } from '../types/game';
import { PixelRenderer } from '../utils/pixelRenderer';
import { soundEngine } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  currentSkin: Skin;
  currentThruster: ThrusterColor;
  onCountdownComplete?: () => void;
  onGameOver: (score: number, maxSpeed: number, rolls: number) => void;
  onScoreUpdate: (score: number, airPsi: number, speedMph: number, phase: GamePhase) => void;
  isPaused: boolean;
  triggerRollSignal?: number; // external trigger from HUD button
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  currentSkin,
  currentThruster,
  onCountdownComplete,
  onGameOver,
  onScoreUpdate,
  isPaused,
  triggerRollSignal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core gameplay mutable refs (to run at 60fps without React state lag)
  const stateRef = useRef({
    // Roadster state
    x: 180,
    y: 280,
    vy: 0,
    angle: 0,
    airPsi: 10000,
    maxPsi: 10000,
    speedMph: 250,
    maxSpeedAchieved: 250,
    score: 0,
    phase: 'WACO' as GamePhase,

    // Countdown state (3, 2, 1, 0)
    countdownSeconds: 3,
    countdownFrame: 0,
    lastBeepSecond: -1,

    // Barrel roll mechanics
    isRolling: false,
    rollProgress: 0, // 0 to 1
    rollCount: 0,
    hasShield: false,
    shieldTimer: 0,

    // Input state
    isThrusting: false,
    holdDuration: 0,
    hasTriggeredHoldRoll: false,

    // World & Scroll
    scrollX: 0,
    frameTick: 0,
    screenShake: 0,

    // Entities
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    lastSpawnX: 0
  });

  // Execute a Barrel Roll
  const performBarrelRoll = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== 'PLAYING' && gameState !== 'COUNTDOWN') return;

    // Reduced cost: 1800 PSI (easier & more forgiving)
    if (s.airPsi >= 1800 && !s.isRolling) {
      s.isRolling = true;
      s.rollProgress = 0;
      s.airPsi -= 1800;
      s.hasShield = true;
      s.shieldTimer = 45; // ~0.75s of complete invincibility
      s.rollCount++;
      s.speedMph = Math.min(850, s.speedMph + 180);
      soundEngine.playBarrelRoll();

      // Emit burst of cyan shield particles
      for (let i = 0; i < 20; i++) {
        const ang = (Math.PI * 2 * i) / 20;
        s.particles.push({
          x: s.x,
          y: s.y,
          vx: Math.cos(ang) * 4.5,
          vy: Math.sin(ang) * 4.5,
          size: 3,
          life: 0,
          maxLife: 28,
          color: '#00F0FF',
          alpha: 1,
          type: 'spark'
        });
      }
    }
  }, [gameState]);

  // Listen for trigger signal from HUD ROLL button
  useEffect(() => {
    if (triggerRollSignal && triggerRollSignal > 0) {
      performBarrelRoll();
    }
  }, [triggerRollSignal, performBarrelRoll]);

  // Thrust action
  const handleThrustStart = useCallback(() => {
    const s = stateRef.current;
    if ((gameState !== 'PLAYING' && gameState !== 'COUNTDOWN') || isPaused) return;

    s.isThrusting = true;

    // During COUNTDOWN, just emit cosmetic thruster flame
    if (gameState === 'COUNTDOWN') {
      soundEngine.playThrust();
      return;
    }

    // Check if sufficient PSI (more forgiving: 80 PSI cost)
    if (s.airPsi > 50) {
      s.vy = -6.4; // Gentler, more controllable upward impulse
      s.airPsi = Math.max(0, s.airPsi - 80);
      s.speedMph = Math.min(720, s.speedMph + 20);
      soundEngine.playThrust();

      // Generate exhaust particles
      for (let i = 0; i < 4; i++) {
        s.particles.push({
          x: s.x - 30,
          y: s.y + 4 + (Math.random() * 4 - 2),
          vx: -(Math.random() * 4 + 4),
          vy: Math.random() * 3 - 1.5,
          size: Math.random() * 3 + 2,
          life: 0,
          maxLife: 18,
          color: currentThruster.sparkColor,
          alpha: 1,
          type: 'thrust'
        });
      }
    }
  }, [gameState, isPaused, currentThruster]);

  const handleThrustEnd = useCallback(() => {
    stateRef.current.isThrusting = false;
    stateRef.current.holdDuration = 0;
    stateRef.current.hasTriggeredHoldRoll = false;
  }, []);

  // Keyboard and Touch listeners (dedicated Barrel Roll keys: B, R, Shift, F, Down, S)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Barrel Roll Keys
      if (
        e.code === 'KeyB' ||
        e.code === 'KeyR' ||
        e.code === 'ShiftLeft' ||
        e.code === 'ShiftRight' ||
        e.code === 'KeyF' ||
        e.code === 'ArrowDown' ||
        e.code === 'KeyS'
      ) {
        e.preventDefault();
        performBarrelRoll();
        return;
      }

      // Thrust Keys
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (!stateRef.current.isThrusting) {
          handleThrustStart();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleThrustEnd();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleThrustStart, handleThrustEnd, performBarrelRoll]);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Reset game state when starting Countdown or Playing
    if (gameState === 'COUNTDOWN') {
      const s = stateRef.current;
      s.x = 180;
      s.y = canvas.height / 2;
      s.vy = 0;
      s.angle = 0;
      s.airPsi = 10000;
      s.speedMph = 250;
      s.maxSpeedAchieved = 250;
      s.score = 0;
      s.phase = 'WACO';
      s.countdownSeconds = 3;
      s.countdownFrame = 0;
      s.lastBeepSecond = -1;
      s.isRolling = false;
      s.rollProgress = 0;
      s.rollCount = 0;
      s.hasShield = false;
      s.shieldTimer = 0;
      s.scrollX = 0;
      s.obstacles = [];
      s.collectibles = [];
      s.particles = [];
      s.lastSpawnX = 550;
    }

    const spawnObstacle = (spawnX: number, phase: GamePhase) => {
      const canvasH = canvas.height;
      const minTop = 60;
      const minBottom = 60;

      // Easier & wider clearance gaps (185px - 215px)
      const gapSize = phase === 'SPACE' ? 185 : phase === 'ORBITAL' ? 198 : 215;
      const maxGapY = canvasH - minBottom - gapSize;
      const gapY = Math.floor(Math.random() * (maxGapY - minTop)) + minTop;

      const topHeight = gapY;
      const bottomHeight = canvasH - (gapY + gapSize);

      // Diverse top obstacle types inspired by cyberpunk launch stage tileset
      const topTypes: Obstacle['topType'][] = [
        'gantry',
        'crane',
        'conduit',
        'booster',
        'mechazilla',
        'rigging',
        'satellite'
      ];

      const topType = topTypes[Math.floor(Math.random() * topTypes.length)];

      // Diverse bottom obstacle types inspired by cyberpunk launch stage tileset
      const bottomTypes: Obstacle['bottomType'][] = [
        'cybertruck',
        'generator',
        'battery_pack',
        'semi',
        'cybercab',
        'model3_stack',
        'fleet_platform'
      ];
      const bottomType = bottomTypes[Math.floor(Math.random() * bottomTypes.length)];

      // Dynamic hazard chance (gentle rate)
      let hazardType: Obstacle['hazardType'] = undefined;
      if (phase === 'ORBITAL' || phase === 'SPACE') {
        const roll = Math.random();
        if (roll < 0.18) {
          hazardType = 'faa_gate';
        } else if (roll < 0.32) {
          hazardType = 'cryo_vent';
        }
      }

      stateRef.current.obstacles.push({
        x: spawnX,
        width: 70,
        topHeight,
        bottomHeight,
        gapY,
        gapSize,
        passed: false,
        phase,
        topType,
        bottomType,
        hazardType
      });

      // Spawn floating collectible in gap
      if (Math.random() < 0.5) {
        stateRef.current.collectibles.push({
          id: Math.random(),
          x: spawnX + 35,
          y: gapY + gapSize / 2,
          type: Math.random() < 0.65 ? 'token' : 'cryo_boost',
          collected: false,
          pulseTimer: Math.random() * 10
        });
      }
    };

    const loop = () => {
      const s = stateRef.current;
      const cw = canvas.width;
      const ch = canvas.height;

      // Handle COUNTDOWN state
      if (gameState === 'COUNTDOWN') {
        s.frameTick++;
        s.countdownFrame++;

        // Hover gently in place
        s.y = ch / 2 + Math.sin(s.frameTick * 0.08) * 3;
        s.angle = 0;

        // Calculate countdown second (3 -> 2 -> 1 -> 0)
        // Each count lasts ~45 frames (~0.75s)
        const currentSec = 3 - Math.floor(s.countdownFrame / 45);

        if (currentSec !== s.lastBeepSecond && currentSec >= 0) {
          s.lastBeepSecond = currentSec;
          s.countdownSeconds = currentSec;
          soundEngine.playCountdownBeep(currentSec === 0);
        }

        // Emit idle thruster vapor
        if (s.frameTick % 4 === 0) {
          s.particles.push({
            x: s.x - 28,
            y: s.y + 4,
            vx: -3,
            vy: (Math.random() - 0.5) * 1.5,
            size: 2.5,
            life: 0,
            maxLife: 15,
            color: '#70E8FF',
            alpha: 0.8,
            type: 'thrust'
          });
        }

        // Update countdown particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha = 1 - p.life / p.maxLife;
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Transition from COUNTDOWN to PLAYING when complete
        if (s.countdownFrame >= 180) {
          if (onCountdownComplete) {
            onCountdownComplete();
          }
        }
      }

      // Handle PLAYING state
      if (gameState === 'PLAYING' && !isPaused) {
        s.frameTick++;
        // Easier scroll speed: 2.4 (down from 3.2)
        s.scrollX += 2.4;

        // Hold to Barrel Roll mechanic (0.35s hold ~ 21 frames)
        if (s.isThrusting && !s.hasTriggeredHoldRoll) {
          s.holdDuration++;
          if (s.holdDuration >= 21) {
            performBarrelRoll();
            s.hasTriggeredHoldRoll = true;
          }
        }

        // Barrel Roll Animation
        if (s.isRolling) {
          s.rollProgress += 0.038;
          if (s.rollProgress >= 1) {
            s.isRolling = false;
            s.rollProgress = 0;
          }
        }

        // Shield countdown
        if (s.shieldTimer > 0) {
          s.shieldTimer--;
          if (s.shieldTimer <= 0) {
            s.hasShield = false;
          }
        }

        // Physics: Gentler Gravity & Velocity (0.28 instead of 0.38)
        const gravity = 0.28;
        s.vy += gravity;
        s.y += s.vy;

        // Pitch Angle Calculation
        if (!s.isRolling) {
          if (s.vy < 0) {
            // Tilting upward when ascending
            s.angle = Math.max(-0.4, s.vy * 0.045);
          } else {
            // Tilting downward smoothly as falling
            s.angle = Math.min(0.55, s.vy * 0.035);
          }
        }

        // Air pressure replenishment during coasting (faster: +36 PSI/frame)
        if (!s.isThrusting && s.airPsi < s.maxPsi) {
          s.airPsi = Math.min(s.maxPsi, s.airPsi + 36);
        }

        // Speedometer calculation
        const targetSpeed = s.isThrusting ? 620 : 250;
        s.speedMph += (targetSpeed - s.speedMph) * 0.04;
        if (s.speedMph > s.maxSpeedAchieved) {
          s.maxSpeedAchieved = s.speedMph;
        }

        // Determine Game Phase progression based on score
        if (s.score >= 76) {
          s.phase = 'SPACE';
        } else if (s.score >= 26) {
          s.phase = 'ORBITAL';
        } else {
          s.phase = 'WACO';
        }

        // Obstacle Spawning (relaxed spacing: 360px)
        if (s.obstacles.length === 0 || s.lastSpawnX - s.scrollX < cw + 200) {
          const spawnX = Math.max(cw + 100, s.lastSpawnX + 360);
          spawnObstacle(spawnX, s.phase);
          s.lastSpawnX = spawnX;
        }

        // Screen boundaries collision check
        if (s.y < 12) {
          s.y = 12;
          s.vy = 0;
        }
        if (s.y > ch - 16) {
          // Crashed into ground!
          triggerCrash();
        }

        // Move and update Obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          const obsScreenX = obs.x - s.scrollX;

          // Check if passed for score
          if (!obs.passed && obsScreenX + obs.width < s.x) {
            obs.passed = true;
            s.score += 1;
            soundEngine.playScore();
          }

          // Cryo Vent activation
          if (obs.hazardType === 'cryo_vent' && obsScreenX < s.x + 80 && obsScreenX > s.x - 40) {
            // Vent pushes car upward
            s.vy -= 0.5;
            if (s.frameTick % 6 === 0) {
              soundEngine.playCryoVent();
            }
          }

          // Collision Detection with Obstacles (forgiving hitboxes with 5px safety margin)
          if (!s.hasShield && !s.isRolling) {
            const rw = 38; // Forgiving compact body hitbox
            const rh = 12;
            const rx = s.x - rw / 2;
            const ry = s.y - rh / 2;

            const safetyMargin = 5;

            // Check Top Obstacle collision
            if (rx + rw > obsScreenX + safetyMargin && rx < obsScreenX + obs.width - safetyMargin) {
              if (ry < obs.topHeight - safetyMargin) {
                triggerCrash();
                return;
              }
              // Check Bottom Obstacle collision
              if (ry + rh > ch - obs.bottomHeight + safetyMargin) {
                triggerCrash();
                return;
              }
              // Check FAA Gate hazard collision
              if (obs.hazardType === 'faa_gate') {
                const gx = obsScreenX - 6;
                const gy = obs.gapY + obs.gapSize / 2 - 20;
                const gw = 92;
                const gh = 40;
                if (rx + rw > gx && rx < gx + gw && ry + rh > gy && ry < gy + gh) {
                  triggerCrash();
                  return;
                }
              }
            }
          }

          // Remove offscreen obstacles
          if (obsScreenX < -150) {
            s.obstacles.splice(i, 1);
          }
        }

        // Move and collect Collectibles
        for (let i = s.collectibles.length - 1; i >= 0; i--) {
          const col = s.collectibles[i];
          const colScreenX = col.x - s.scrollX;

          if (!col.collected) {
            const dist = Math.hypot(s.x - colScreenX, s.y - col.y);
            if (dist < 36) {
              col.collected = true;
              soundEngine.playPickup();

              if (col.type === 'token') {
                s.score += 5; // Bonus feet
              } else {
                s.airPsi = Math.min(s.maxPsi, s.airPsi + 2500); // Refill tank!
              }

              // Spark particles on pickup
              for (let p = 0; p < 8; p++) {
                s.particles.push({
                  x: colScreenX,
                  y: col.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  size: 3,
                  life: 0,
                  maxLife: 20,
                  color: col.type === 'token' ? '#F59E0B' : '#06B6D4',
                  alpha: 1,
                  type: 'spark'
                });
              }
            }
          }

          if (colScreenX < -50 || col.collected) {
            s.collectibles.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha = 1 - p.life / p.maxLife;

          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Notify HUD state
        onScoreUpdate(s.score, s.airPsi, s.speedMph, s.phase);
      }

      // Handle screen shake decay
      if (s.screenShake > 0) {
        s.screenShake *= 0.88;
        if (s.screenShake < 0.2) s.screenShake = 0;
      }

      // Clear & Render
      ctx.save();
      if (s.screenShake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * s.screenShake * 8,
          (Math.random() - 0.5) * s.screenShake * 8
        );
      }

      // 1. Parallax Background
      PixelRenderer.drawBackground(ctx, cw, ch, s.phase, s.scrollX, s.frameTick);

      // 2. Obstacles & Hazards (only during PLAYING or GAME_OVER)
      for (const obs of s.obstacles) {
        const obsScreenX = obs.x - s.scrollX;
        if (obsScreenX > -120 && obsScreenX < cw + 120) {
          const screenObs = { ...obs, x: obsScreenX };
          PixelRenderer.drawTopObstacle(ctx, screenObs, s.frameTick);
          PixelRenderer.drawBottomObstacle(ctx, screenObs, ch, s.frameTick);
          PixelRenderer.drawHazard(ctx, screenObs, ch, s.frameTick);
        }
      }

      // 3. Collectibles
      for (const col of s.collectibles) {
        const colScreenX = col.x - s.scrollX;
        if (colScreenX > -50 && colScreenX < cw + 50) {
          PixelRenderer.drawCollectible(ctx, { ...col, x: colScreenX }, s.frameTick);
        }
      }

      // 4. Particles
      PixelRenderer.drawParticles(ctx, s.particles);

      // 5. Roadster Vehicle
      PixelRenderer.drawRoadster(
        ctx,
        s.x,
        s.y,
        s.angle,
        currentSkin,
        currentThruster,
        s.isThrusting,
        s.isRolling,
        s.rollProgress,
        s.hasShield,
        s.frameTick
      );

      // 6. Draw Countdown Overlay if in COUNTDOWN state
      if (gameState === 'COUNTDOWN') {
        ctx.save();
        const sec = s.countdownSeconds;

        // Dim background slightly for focus
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, cw, ch);

        ctx.textAlign = 'center';

        // Stage Title
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('WACO UNVEILING LAUNCH PAD', cw / 2, ch / 2 - 90);

        ctx.font = '11px "Chakra Petch", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('COLD-GAS THRUSTERS ARMED · REVS NOMINAL', cw / 2, ch / 2 - 68);

        // Huge Countdown Number / Text
        if (sec > 0) {
          // Glow effect
          ctx.font = 'bold 72px "Press Start 2P", monospace';
          ctx.fillStyle = sec === 3 ? '#EF4444' : sec === 2 ? '#F59E0B' : '#10B981';
          ctx.fillText(`T-${sec}`, cw / 2, ch / 2 + 20);

          ctx.font = '12px "Press Start 2P", monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(
            sec === 3 ? 'PRESSURIZING TANK...' : sec === 2 ? 'CHECKING GIMBALS...' : 'ALL SYSTEMS GO!',
            cw / 2,
            ch / 2 + 60
          );
        } else {
          ctx.font = 'bold 54px "Press Start 2P", monospace';
          ctx.fillStyle = '#00F0FF';
          ctx.fillText('LIFTOFF!', cw / 2, ch / 2 + 15);

          ctx.font = '13px "Press Start 2P", monospace';
          ctx.fillStyle = '#FDE047';
          ctx.fillText('HOP TO 2028!', cw / 2, ch / 2 + 55);
        }

        // Keybinding helper pill on screen during countdown
        ctx.font = '11px "Chakra Petch", monospace';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText('[SPACE] THRUST   ·   [B] / [SHIFT] BARREL ROLL', cw / 2, ch / 2 + 105);

        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    const triggerCrash = () => {
      const s = stateRef.current;
      soundEngine.playCrash();
      s.screenShake = 1.2;

      // Spawn explosion debris particles
      for (let i = 0; i < 35; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 7 + 2;
        s.particles.push({
          x: s.x,
          y: s.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: Math.random() * 5 + 2,
          life: 0,
          maxLife: 40,
          color: ['#EF4444', '#F59E0B', '#F8FAFC', '#94A3B8'][i % 4],
          alpha: 1,
          type: 'debris'
        });
      }

      onGameOver(s.score, s.maxSpeedAchieved, s.rollCount);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [
    gameState,
    isPaused,
    currentSkin,
    currentThruster,
    onCountdownComplete,
    onGameOver,
    onScoreUpdate,
    performBarrelRoll
  ]);

  const lastTouchTimeRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();

    const now = Date.now();
    if (now - lastTouchTimeRef.current < 280) {
      // Double tap triggers 360 barrel roll!
      performBarrelRoll();
      lastTouchTimeRef.current = 0;
    } else {
      lastTouchTimeRef.current = now;
      handleThrustStart();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    handleThrustEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    handleThrustStart();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    handleThrustEnd();
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-full max-w-[1440px] aspect-[16/9] object-contain pixelated bg-black"
      />
    </div>
  );
};
