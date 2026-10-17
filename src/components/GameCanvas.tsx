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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastGapYRef = useRef<number | null>(null);

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

  // Responsive full-screen canvas resolution synchronization
  useEffect(() => {
    const updateDimensions = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const w = Math.max(300, rect.width || window.innerWidth);
      const h = Math.max(300, rect.height || window.innerHeight);

      let targetW: number;
      let targetH: number;

      if (w >= h) {
        // Landscape / Desktop: anchor logical height to 540, extend width
        const BASE_H = 540;
        targetH = BASE_H;
        targetW = Math.round(BASE_H * (w / h));
      } else {
        // Mobile Portrait: anchor logical width to 540, extend height
        const BASE_W = 540;
        targetW = BASE_W;
        targetH = Math.round(BASE_W * (h / w));
      }

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        stateRef.current.x = Math.max(90, Math.min(180, Math.round(targetW * 0.2)));
        if (stateRef.current.y > targetH - 30) {
          stateRef.current.y = targetH / 2;
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

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
      s.x = Math.max(90, Math.min(180, Math.round(canvas.width * 0.2)));
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
      s.lastSpawnX = Math.round(canvas.width * 0.65);
      lastGapYRef.current = Math.round(canvas.height * 0.5 - 105);
    }

    const spawnObstacle = (spawnX: number, phase: GamePhase) => {
      const canvasH = canvas.height;
      const centerY = canvasH * 0.5;

      // Clearance gap (195px - 225px)
      const gapSize = phase === 'SPACE' ? 195 : phase === 'ORBITAL' ? 208 : 225;

      // Center the focal area at the vertical center of the screen
      // Constrains gap center to a comfortable window around centerY
      const maxFocalSpan = Math.min(180, canvasH * 0.32);
      const minCenter = centerY - maxFocalSpan / 2;
      const maxCenter = centerY + maxFocalSpan / 2;

      let gapCenter: number;
      if (lastGapYRef.current !== null) {
        const lastCenter = lastGapYRef.current + gapSize / 2;
        const delta = (Math.random() * 2 - 1) * 55;
        gapCenter = Math.max(minCenter, Math.min(maxCenter, Math.round(lastCenter + delta)));
      } else {
        gapCenter = centerY;
      }

      const gapY = Math.round(gapCenter - gapSize / 2);
      lastGapYRef.current = gapY;

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

        // Screen boundaries collision check:
        // Focal area is centered vertically; crash if falling too far below the central flight zone
        const maxDown = Math.min(ch - 16, Math.round(ch * 0.5 + 240));
        const minUp = Math.max(12, Math.round(ch * 0.5 - 240));

        if (s.y < minUp) {
          s.y = minUp;
          s.vy = 0;
        }
        if (s.y > maxDown) {
          // Crashed into ground or bottom barrier!
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
        const isNarrow = cw < 600;
        ctx.font = isNarrow ? 'bold 12px "Chakra Petch", sans-serif' : 'bold 16px "Chakra Petch", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('WACO UNVEILING LAUNCH PAD', cw / 2, ch / 2 - 90);

        ctx.font = isNarrow ? '10px "Space Mono", monospace' : '11px "Space Mono", monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('COLD-GAS THRUSTERS ARMED · REVS NOMINAL', cw / 2, ch / 2 - 68);

        // Huge Countdown Number / Text
        if (sec > 0) {
          ctx.font = isNarrow ? 'bold 64px "Pixelify Sans", sans-serif' : 'bold 88px "Pixelify Sans", sans-serif';
          ctx.fillStyle = sec === 3 ? '#EF4444' : sec === 2 ? '#F59E0B' : '#10B981';
          ctx.fillText(`T-${sec}`, cw / 2, ch / 2 + 20);

          ctx.font = isNarrow ? '10px "Space Mono", monospace' : '11px "Space Mono", monospace';
          ctx.fillStyle = '#E2E8F0';
          ctx.fillText(
            sec === 3 ? 'PRESSURIZING TANK...' : sec === 2 ? 'CHECKING GIMBALS...' : 'ALL SYSTEMS GO',
            cw / 2,
            ch / 2 + 60
          );
        } else {
          ctx.font = isNarrow ? 'bold 52px "Pixelify Sans", sans-serif' : 'bold 72px "Pixelify Sans", sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText('LIFTOFF!', cw / 2, ch / 2 + 18);

          ctx.font = isNarrow ? 'bold 13px "Chakra Petch", sans-serif' : 'bold 16px "Chakra Petch", sans-serif';
          ctx.fillStyle = '#E82127';
          ctx.fillText('HOP TO 2028', cw / 2, ch / 2 + 58);
        }

        // Keybinding helper pill on screen during countdown
        ctx.font = isNarrow ? '10px "Space Mono", monospace' : '11px "Space Mono", monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(isNarrow ? 'TAP TO FLY · DOUBLE-TAP ROLL' : '[SPACE] THRUST   ·   [B] / [SHIFT] BARREL ROLL', cw / 2, ch / 2 + 105);

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
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full pixelated bg-black block"
      />
    </div>
  );
};
