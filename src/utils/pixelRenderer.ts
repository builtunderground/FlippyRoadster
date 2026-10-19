// High-Fidelity Pixel-Art Renderer for Flippy Roadster
// Implements 16/32-bit pixel-art rendering for vehicles, obstacles, hazards, and parallax layers

import { Skin, ThrusterColor, Obstacle, Collectible, Particle, GamePhase } from '../types/game';

export const SKINS: Skin[] = [
  {
    id: 'ano_white',
    name: 'Ano White',
    description: 'Crisp white bodywork with titanium grey trim and smoked grey aerodynamic glass.',
    unlockScore: 0,
    bodyColor: '#FFFFFF',
    accentColor: '#94A3B8', // Titanium grey
    canopyColor: '#475569', // Smoked cool grey glass (no yellow)
    wheelColor: '#1E293B'  // Dark slate grey
  },
  {
    id: 'ultra_red',
    name: 'Ultra Red',
    description: 'Multicoat deep metallic red celebrating the original 2017 unveiling prototype.',
    unlockScore: 0,
    bodyColor: '#D01018',
    accentColor: '#1E1E1E',
    canopyColor: '#2B3A4A',
    wheelColor: '#18181A'
  },
  {
    id: 'stainless',
    name: 'SpaceX Stainless',
    description: 'Cold-rolled 301 stainless steel mirror skin matched to Starship flight vehicles.',
    unlockScore: 0,
    bodyColor: '#C4CED8',
    accentColor: '#50565F',
    canopyColor: '#1F2937',
    wheelColor: '#0F1216',
    metallic: true
  },
  {
    id: 'starman',
    name: 'Starman Edition',
    description: 'Midnight Cherry Red with spacesuit pilot in the cockpit, en route to Mars.',
    unlockScore: 0,
    bodyColor: '#8B0000',
    accentColor: '#E2E8F0',
    canopyColor: '#38BDF8',
    wheelColor: '#1A1A1A',
    hasAstronaut: true
  }
];

export const THRUSTER_COLORS: ThrusterColor[] = [
  {
    id: 'cryo_cyan',
    name: 'Cryo Cyan',
    coreColor: '#E0F7FF',
    outerColor: '#00D8FF',
    sparkColor: '#70E8FF',
    unlockScore: 0
  },
  {
    id: 'super_draco',
    name: 'SuperDraco Red',
    coreColor: '#FFF4E0',
    outerColor: '#FF3B30',
    sparkColor: '#FF9500',
    unlockScore: 35
  },
  {
    id: 'plasma_violet',
    name: 'Plasma Violet',
    coreColor: '#F3E8FF',
    outerColor: '#A855F7',
    sparkColor: '#D8B4FE',
    unlockScore: 60
  },
  {
    id: 'solar_gold',
    name: 'Solar Gold',
    coreColor: '#FEF9C3',
    outerColor: '#EAB308',
    sparkColor: '#FDE047',
    unlockScore: 85
  }
];

export class PixelRenderer {
  // Draws the Roadster in pixel art style
  public static drawRoadster(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number, // pitch angle in radians
    skin: Skin,
    thrusterColor: ThrusterColor,
    isThrusting: boolean,
    isRolling: boolean,
    rollProgress: number, // 0 to 1
    hasShield: boolean,
    frameTick: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Apply rotation: either pitch or full 360 degree roll
    const currentAngle = isRolling ? rollProgress * Math.PI * 2 : angle;
    ctx.rotate(currentAngle);

    // If rolling, apply invincibility shield aura
    if (hasShield || isRolling) {
      ctx.save();
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 36 + Math.sin(frameTick * 0.3) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Translucent cyan shield core
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Car dimensions: ~64x24 px
    const w = 64;
    const h = 22;
    const ox = -w / 2;
    const oy = -h / 2;

    // Underbody shadow / suction distortion
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(ox + 8, oy + h + 2, w - 16, 4);

    // Main Body Silhouette (Pixel cluster)
    ctx.fillStyle = skin.bodyColor;

    // Lower chassis
    ctx.fillRect(ox + 4, oy + 10, w - 8, 8);
    ctx.fillRect(ox + 8, oy + 8, w - 16, 2);

    // Front nose taper (aerodynamic wedge)
    ctx.fillRect(ox + w - 8, oy + 12, 6, 6);
    ctx.fillRect(ox + w - 4, oy + 14, 4, 4);

    // Rear diffuser & spoiler lip
    ctx.fillRect(ox + 2, oy + 9, 4, 7);
    ctx.fillRect(ox, oy + 9, 3, 3); // rear wing edge

    // Canopy / Windshield
    ctx.fillStyle = skin.canopyColor;
    ctx.fillRect(ox + 18, oy + 4, 22, 6);
    ctx.fillRect(ox + 22, oy + 2, 14, 2);

    // Canopy glass highlight reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(ox + 24, oy + 3, 8, 1);
    ctx.fillRect(ox + 21, oy + 5, 4, 1);

    // Starman Astronaut Pilot in canopy!
    if (skin.hasAstronaut) {
      ctx.fillStyle = '#FFFFFF'; // White helmet
      ctx.fillRect(ox + 25, oy + 4, 6, 5);
      ctx.fillStyle = '#0F172A'; // Dark visor
      ctx.fillRect(ox + 27, oy + 5, 4, 2);
    }

    // Body highlights & metallic reflection lines
    if (skin.metallic) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 10, oy + 9, w - 24, 1);
      ctx.fillStyle = '#8E9BA8';
      ctx.fillRect(ox + 6, oy + 15, w - 14, 1);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(ox + 10, oy + 9, w - 22, 1);
    }

    // Signature Rear Red Lightbar
    ctx.fillStyle = '#FF1A23';
    ctx.fillRect(ox + 1, oy + 10, 3, 3);
    // Lightbar glow
    ctx.fillStyle = 'rgba(255, 26, 35, 0.6)';
    ctx.fillRect(ox - 2, oy + 10, 3, 3);

    // Front Headlight (High lumen slim horizontal LED)
    ctx.fillStyle = '#A5F3FC';
    ctx.fillRect(ox + w - 5, oy + 13, 3, 2);
    ctx.fillStyle = 'rgba(165, 243, 252, 0.4)';
    ctx.fillRect(ox + w - 2, oy + 12, 3, 4);

    // Wheels (Aero Turbine Wheels)
    const drawWheel = (wx: number, wy: number) => {
      // Outer tire
      ctx.fillStyle = skin.wheelColor;
      ctx.fillRect(wx - 6, wy - 3, 12, 10);
      ctx.fillRect(wx - 5, wy - 5, 10, 14);

      // Inner rim (Turbine silver)
      ctx.fillStyle = skin.id === 'stainless' ? '#94A3B8' : '#475569';
      ctx.fillRect(wx - 3, wy - 2, 6, 7);
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(wx - 1, wy, 2, 3);
    };

    drawWheel(ox + 14, oy + 17); // Rear wheel
    drawWheel(ox + w - 16, oy + 17); // Front wheel

    // Bottom Cold-Gas Reaction Jet Nozzles under the chassis
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(ox + 21, oy + 17, 5, 2); // Rear-belly downward nozzle
    ctx.fillRect(ox + 37, oy + 17, 5, 2); // Mid-belly downward nozzle
    ctx.fillStyle = '#64748B';
    ctx.fillRect(ox + 22, oy + 17, 3, 1);
    ctx.fillRect(ox + 38, oy + 17, 3, 1);

    // Rear Cold-Gas Thruster Nozzle
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(ox - 3, oy + 12, 4, 4);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(ox - 4, oy + 13, 2, 2);

    // Animated Thruster Exhaust Plume (When thrusting or idle puff)
    if (isThrusting) {
      const flicker = (frameTick % 4);
      const exhaustLen = 28 + flicker * 4;

      // 1. Rear Main Plasma Flame
      ctx.fillStyle = thrusterColor.outerColor;
      ctx.beginPath();
      ctx.moveTo(ox - 4, oy + 12);
      ctx.lineTo(ox - 4 - exhaustLen, oy + 14);
      ctx.lineTo(ox - 4, oy + 16);
      ctx.closePath();
      ctx.fill();

      // Core hot flame
      ctx.fillStyle = thrusterColor.coreColor;
      ctx.beginPath();
      ctx.moveTo(ox - 4, oy + 13);
      ctx.lineTo(ox - 4 - (exhaustLen * 0.65), oy + 14);
      ctx.lineTo(ox - 4, oy + 15);
      ctx.closePath();
      ctx.fill();

      // Shock diamonds in supersonic rear exhaust
      ctx.fillStyle = '#FFFFFF';
      for (let i = 1; i <= 3; i++) {
        const sx = ox - 4 - (i * 7);
        ctx.fillRect(sx, oy + 13, 3, 2);
      }

      // 2. Dual Bottom Air Jets (Downward VTOL / Altitude Thrusters)
      const bottomJets = [ox + 23, ox + 39];
      const bottomJetLen = 14 + (frameTick % 3) * 3;

      for (const bjX of bottomJets) {
        // Outer downward expansion plume
        ctx.fillStyle = thrusterColor.outerColor;
        ctx.beginPath();
        ctx.moveTo(bjX - 2, oy + 19);
        ctx.lineTo(bjX - 4, oy + 19 + bottomJetLen);
        ctx.lineTo(bjX + 4, oy + 19 + bottomJetLen);
        ctx.lineTo(bjX + 2, oy + 19);
        ctx.closePath();
        ctx.fill();

        // Inner white-hot supersonic core
        ctx.fillStyle = thrusterColor.coreColor;
        ctx.beginPath();
        ctx.moveTo(bjX - 1, oy + 19);
        ctx.lineTo(bjX - 2, oy + 19 + Math.round(bottomJetLen * 0.65));
        ctx.lineTo(bjX + 2, oy + 19 + Math.round(bottomJetLen * 0.65));
        ctx.lineTo(bjX + 1, oy + 19);
        ctx.closePath();
        ctx.fill();

        // Supersonic shock diamond rings along downward column
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(bjX - 2, oy + 22, 4, 1);
        ctx.fillRect(bjX - 2, oy + 26, 4, 1);
      }
    } else {
      // Small idle cold-gas pilot pulse at rear
      if (frameTick % 8 < 4) {
        ctx.fillStyle = 'rgba(0, 216, 255, 0.4)';
        ctx.fillRect(ox - 7, oy + 13, 3, 2);
      }
      // Periodic micro-pulse on bottom air jets (attitude stabilization)
      if (frameTick % 12 < 4) {
        ctx.fillStyle = 'rgba(0, 216, 255, 0.35)';
        ctx.fillRect(ox + 22, oy + 19, 3, 3);
        ctx.fillRect(ox + 38, oy + 19, 3, 3);
      }
    }

    ctx.restore();
  }

  // Draw Bottom Obstacle: Modular industrial stage scaffolding, red LED-edged structures & vehicle display racks
  public static drawBottomObstacle(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    canvasHeight: number,
    frameTick: number
  ) {
    const x = obs.x;
    const y = canvasHeight - obs.bottomHeight;
    const w = obs.width;
    const h = obs.bottomHeight;

    ctx.save();

    // 1. Modular Industrial Stage Riser / Scaffolding Plinth
    // Dark matte structural charcoal finish
    ctx.fillStyle = '#090D16';
    ctx.fillRect(x - 2, y, w + 4, h);

    // Inner structural deck panel
    ctx.fillStyle = '#101624';
    ctx.fillRect(x, y + 4, w, h - 4);

    // Tubular steel cross-bracing truss on vertical face
    ctx.strokeStyle = '#222E42';
    ctx.lineWidth = 2;
    const braceStep = 32;
    for (let by = y + 8; by < canvasHeight - 12; by += braceStep) {
      const bh = Math.min(braceStep, canvasHeight - by);
      ctx.strokeRect(x + 2, by, w - 4, bh);
      ctx.beginPath();
      ctx.moveTo(x + 2, by);
      ctx.lineTo(x + w - 2, by + bh);
      ctx.moveTo(x + w - 2, by);
      ctx.lineTo(x + 2, by + bh);
      ctx.stroke();
    }

    // Vertical structural corner pillars
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x, y + 2, 4, h - 2);
    ctx.fillRect(x + w - 4, y + 2, 4, h - 2);

    // Continuous Tesla-Red LED Edge Runner along top platform lip
    ctx.fillStyle = '#E82127';
    ctx.fillRect(x - 2, y, w + 4, 3);
    // Subtle red LED glow line
    ctx.fillStyle = 'rgba(232, 33, 39, 0.4)';
    ctx.fillRect(x - 2, y - 1, w + 4, 1);

    // Red vertical corner beacon bars
    const cornerStrobe = Math.sin(frameTick * 0.18) > 0;
    ctx.fillStyle = cornerStrobe ? '#EF4444' : '#7F1D1D';
    ctx.fillRect(x, y - 4, 3, 4);
    ctx.fillRect(x + w - 3, y - 4, 3, 4);

    // 2. Specific Staged Vehicle / Equipment Presentation on top of plinth
    switch (obs.bottomType) {
      case 'cybertruck': {
        // Cybertruck on Illuminated Presentation Plinth
        const cy = y - 30;
        const cx = x + (w - 74) / 2;

        // Harsh white stage uplighting pool beneath vehicle
        ctx.fillStyle = 'rgba(248, 250, 252, 0.18)';
        ctx.fillRect(cx - 2, y - 4, 78, 4);

        // Stainless triangular exoskeleton
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 24); // rear bottom
        ctx.lineTo(cx + 4, cy + 12); // rear tailgate
        ctx.lineTo(cx + 34, cy + 2); // apex roofline
        ctx.lineTo(cx + 70, cy + 16); // front hood tip
        ctx.lineTo(cx + 72, cy + 24); // front bumper
        ctx.closePath();
        ctx.fill();

        // Faceted metallic body shading
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.moveTo(cx + 4, cy + 12);
        ctx.lineTo(cx + 34, cy + 2);
        ctx.lineTo(cx + 70, cy + 16);
        ctx.lineTo(cx + 66, cy + 18);
        ctx.lineTo(cx + 34, cy + 6);
        ctx.lineTo(cx + 6, cy + 15);
        ctx.closePath();
        ctx.fill();

        // Dark smoked glass canopy
        ctx.fillStyle = '#0A0E17';
        ctx.beginPath();
        ctx.moveTo(cx + 20, cy + 13);
        ctx.lineTo(cx + 34, cy + 5);
        ctx.lineTo(cx + 52, cy + 14);
        ctx.closePath();
        ctx.fill();

        // Signature full-width stark white LED lightbar
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx + 66, cy + 16, 6, 2);

        // Rear red lightblade accent
        ctx.fillStyle = '#E82127';
        ctx.fillRect(cx + 3, cy + 12, 2, 3);

        // Dark angular aero wheels
        ctx.fillStyle = '#06080D';
        ctx.fillRect(cx + 10, cy + 20, 14, 10);
        ctx.fillRect(cx + 50, cy + 20, 14, 10);
        break;
      }

      case 'semi': {
        // Tesla Semi Heavy Freight Presentation
        const sy = y - 48;
        const sx = x + (w - 78) / 2;

        // Aerodynamic high-roof cab
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(sx + 10, sy + 6, 58, 42);

        // Deep panoramic wrap windshield
        ctx.fillStyle = '#0A0E1A';
        ctx.fillRect(sx + 34, sy + 10, 32, 18);

        // Roof wind-deflector fairing
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(sx + 10, sy, 54, 6);

        // Rear chassis & trailer fifth wheel
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(sx, sy + 28, 20, 20);

        // White front LED bar & red marker lights
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(sx + 64, sy + 28, 4, 3);
        ctx.fillStyle = '#E82127';
        ctx.fillRect(sx + 12, sy + 2, 3, 2);
        ctx.fillRect(sx + 24, sy + 2, 3, 2);

        // Wheels
        ctx.fillStyle = '#05070C';
        ctx.fillRect(sx + 4, sy + 38, 12, 12);
        ctx.fillRect(sx + 48, sy + 38, 14, 12);
        break;
      }

      case 'cybercab': {
        // Autonomous Cybercab Display Dais
        const ccy = y - 24;
        const ccx = x + (w - 68) / 2;

        // Circular illuminated display dais
        ctx.fillStyle = '#111827';
        ctx.fillRect(ccx - 2, y - 3, 72, 3);
        ctx.fillStyle = '#E82127';
        ctx.fillRect(ccx - 2, y - 1, 72, 1);

        // Gold-bronze aerodynamic body
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.roundRect(ccx, ccy + 6, 64, 16, 5);
        ctx.fill();

        // Dark smoked glass canopy
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(ccx + 18, ccy, 30, 8);

        // Full-width horizontal LED lightbar
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ccx + 58, ccy + 9, 6, 2);

        // Solid aero wheels
        ctx.fillStyle = '#0B0F19';
        ctx.fillRect(ccx + 12, ccy + 18, 10, 8);
        ctx.fillRect(ccx + 44, ccy + 18, 10, 8);
        break;
      }

      case 'generator': {
        // High-Voltage Hydraulic Power Substation / Cryo Manifold
        const gy = y - 38;
        const gx = x + (w - 68) / 2;

        // Heavy steel chassis
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(gx, gy + 8, 68, 30);

        // Brushed steel cooling manifold
        ctx.fillStyle = '#334155';
        ctx.fillRect(gx + 6, gy, 56, 8);

        // High-pressure pipe runs
        ctx.fillStyle = '#64748B';
        ctx.fillRect(gx + 8, gy + 12, 52, 3);

        // Red emergency status indicator panel
        const genBlink = Math.sin(frameTick * 0.15) > 0;
        ctx.fillStyle = genBlink ? '#E82127' : '#5B1116';
        ctx.fillRect(gx + 12, gy + 18, 20, 8);

        // Analog telemetry dial
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(gx + 40, gy + 18, 18, 8);
        ctx.fillStyle = '#E82127';
        ctx.fillRect(gx + 48, gy + 20, 2, 4);
        break;
      }

      case 'battery_pack': {
        // Megapack Industrial Energy Storage Plinth
        const by = y - 36;
        const bx = x + (w - 72) / 2;

        // Architectural matte white modular enclosure
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(bx, by + 4, 72, 32);

        // Recessed dark horizontal cooling louvers
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(bx + 8, by + 10, 16, 18);
        ctx.fillRect(bx + 28, by + 10, 16, 18);
        ctx.fillRect(bx + 48, by + 10, 16, 18);

        // Clean status indicator LEDs (Green active, Red telemetry)
        ctx.fillStyle = '#10B981';
        ctx.fillRect(bx + 10, by + 6, 8, 2);
        ctx.fillRect(bx + 30, by + 6, 8, 2);
        ctx.fillStyle = '#E82127';
        ctx.fillRect(bx + 50, by + 6, 8, 2);

        // Base industrial mounting brackets
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(bx - 2, by + 32, 76, 4);
        break;
      }

      case 'model3_stack':
      default: {
        // Multi-Tier Hydraulic Vehicle Presentation Rack
        const stackY = y - 44;
        const stackX = x + (w - 68) / 2;

        // Structural steel presentation frame
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(stackX + 2, stackY, 64, 44);

        // Lower level: Dark Titanium Sedan
        ctx.fillStyle = '#475569';
        ctx.fillRect(stackX + 8, stackY + 26, 52, 11);
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(stackX + 20, stackY + 20, 24, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(stackX + 54, stackY + 28, 4, 2);

        // Upper level: Deep Multicoat Red Tesla
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(stackX + 10, stackY + 6, 48, 10);
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(stackX + 20, stackY + 2, 22, 5);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(stackX + 52, stackY + 8, 4, 2);
        ctx.fillStyle = '#E82127';
        ctx.fillRect(stackX + 10, stackY + 8, 2, 2);

        // Hydraulic lift cylinder
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(stackX + 32, stackY + 16, 4, 6);
        break;
      }
    }

    ctx.restore();
  }

  // Draw Top Obstacle: Modular industrial stage scaffolding, suspended lighting trusses & launch infrastructure
  public static drawTopObstacle(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    frameTick: number
  ) {
    const x = obs.x;
    const y = 0;
    const w = obs.width;
    const h = obs.topHeight;

    ctx.save();

    // 1. Base Suspended Modular Scaffolding Column (Dark carbon steel lattice)
    ctx.fillStyle = '#080C14';
    ctx.fillRect(x - 2, y, w + 4, h);

    // Inner structural shadow
    ctx.fillStyle = '#0F1624';
    ctx.fillRect(x, y, w, h - 3);

    // Structural steel diagonal cross-braces
    ctx.strokeStyle = '#253246';
    ctx.lineWidth = 2;
    const braceStep = 32;
    for (let by = 0; by < h - 16; by += braceStep) {
      const bh = Math.min(braceStep, h - by - 4);
      ctx.strokeRect(x + 2, by, w - 4, bh);
      ctx.beginPath();
      ctx.moveTo(x + 2, by);
      ctx.lineTo(x + w - 2, by + bh);
      ctx.moveTo(x + w - 2, by);
      ctx.lineTo(x + 2, by + bh);
      ctx.stroke();
    }

    // Vertical structural corner tubes
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x, y, 4, h - 3);
    ctx.fillRect(x + w - 4, y, 4, h - 3);

    // Continuous Tesla-Red LED Edge Runner along bottom horizontal lip
    ctx.fillStyle = '#E82127';
    ctx.fillRect(x - 2, h - 3, w + 4, 3);
    // Subtle red LED glow
    ctx.fillStyle = 'rgba(232, 33, 39, 0.4)';
    ctx.fillRect(x - 2, h, w + 4, 1);

    // Flashing red corner beacons
    const beaconStrobe = Math.sin(frameTick * 0.18) > 0;
    ctx.fillStyle = beaconStrobe ? '#EF4444' : '#7F1D1D';
    ctx.fillRect(x, h - 7, 3, 4);
    ctx.fillRect(x + w - 3, h - 7, 3, 4);

    // 2. Specific Suspended Staging / Lighting Fixture
    switch (obs.topType) {
      case 'gantry':
      case 'rigging': {
        // Suspended Heavy Stage Lighting Truss with Stage Par-Cans
        const trussY = h - 26;
        ctx.fillStyle = '#111827';
        ctx.fillRect(x + 4, trussY, w - 8, 22);

        // Truss horizontal chord rails
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 2, trussY, w - 4, 3);
        ctx.fillRect(x + 2, trussY + 18, w - 4, 3);

        // Bank of 3 downward-pointing harsh white stage floodlights
        const spotCount = 3;
        const spotW = 12;
        const spotSpacing = (w - 20 - (spotCount * spotW)) / (spotCount - 1);
        for (let i = 0; i < spotCount; i++) {
          const sx = x + 10 + i * (spotW + spotSpacing);

          // Dark lamp housing
          ctx.fillStyle = '#090D16';
          ctx.fillRect(sx, trussY + 6, spotW, 10);

          // Intense harsh white stage light lens
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(sx + 2, trussY + 14, spotW - 4, 2);

          // Subtle directional white light beam cone into the gap
          ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
          ctx.beginPath();
          ctx.moveTo(sx + 2, trussY + 16);
          ctx.lineTo(sx + spotW - 2, trussY + 16);
          ctx.lineTo(sx + spotW + 8, h + 36);
          ctx.lineTo(sx - 8, h + 36);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'conduit':
      case 'satellite': {
        // High-Voltage Industrial Power Trunk & Telemetry Rig
        const condY = h - 30;
        ctx.fillStyle = '#0D131F';
        ctx.fillRect(x + 8, condY, w - 16, 26);

        // Heavy industrial electrical wire conduits
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 14, 0, 4, h - 6);
        ctx.fillRect(x + 24, 0, 4, h - 6);
        ctx.fillRect(x + w - 18, 0, 4, h - 6);

        // Red LED operational status strip
        ctx.fillStyle = '#E82127';
        ctx.fillRect(x + 10, condY + 8, w - 20, 2);

        // Terminal junction box
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + w / 2 - 12, condY + 4, 24, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w / 2 - 3, condY + 16, 6, 2); // White LED status
        break;
      }

      case 'crane':
      case 'debris': {
        // Heavy Launchpad Overhead Crane & Winch Assembly
        const craneY = h - 38;
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 8, craneY, w - 16, 24);

        // Winch cable drum
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + w / 2 - 14, craneY + 4, 28, 12);

        // Twin braided steel suspension cables
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 8, craneY + 16);
        ctx.lineTo(x + w / 2 - 8, h - 6);
        ctx.moveTo(x + w / 2 + 8, craneY + 16);
        ctx.lineTo(x + w / 2 + 8, h - 6);
        ctx.stroke();

        // Forged steel hoist block & hook
        ctx.fillStyle = '#090D16';
        ctx.fillRect(x + w / 2 - 12, h - 10, 24, 7);
        ctx.fillStyle = '#E82127';
        ctx.fillRect(x + w / 2 - 12, h - 4, 24, 2); // Red hazard edge
        break;
      }

      case 'booster':
      case 'mechazilla':
      default: {
        // Starship Launch Infrastructure / Mechazilla Catch Arm
        const boosterY = h - 36;

        // Stainless steel cylinder shell
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(x + 6, y, w - 12, boosterY);

        // Weld seams
        ctx.fillStyle = '#64748B';
        for (let sy = 16; sy < boosterY - 10; sy += 28) {
          ctx.fillRect(x + 6, sy, w - 12, 2);
        }

        // Heavy dark interstage section
        ctx.fillStyle = '#111827';
        ctx.fillRect(x + 8, boosterY, w - 16, 22);

        // Aerodynamic grid fin / hydraulic hinge
        ctx.fillStyle = '#090D16';
        ctx.fillRect(x - 4, boosterY - 14, 10, 16);
        ctx.fillRect(x + w - 6, boosterY - 14, 10, 16);

        // 3 Raptor engine bells with glowing throat
        const bellCount = 3;
        const bellW = 12;
        const bellSpacing = (w - 20 - (bellCount * bellW)) / (bellCount - 1);
        for (let i = 0; i < bellCount; i++) {
          const bx = x + 10 + i * (bellW + bellSpacing);
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.moveTo(bx + 2, boosterY + 12);
          ctx.lineTo(bx + bellW - 2, boosterY + 12);
          ctx.lineTo(bx + bellW, h - 2);
          ctx.lineTo(bx, h - 2);
          ctx.closePath();
          ctx.fill();

          // Hot red ceramic inner glow
          ctx.fillStyle = '#E82127';
          ctx.fillRect(bx + 3, h - 4, bellW - 6, 2);
        }
        break;
      }
    }

    ctx.restore();
  }

  // Draw Dynamic Hazards: FAA Regulatory Gate or Cryo-Vapor Vent
  public static drawHazard(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    canvasHeight: number,
    frameTick: number
  ) {
    if (!obs.hazardType) return;

    if (obs.hazardType === 'faa_gate') {
      // FAA Regulatory Drone Gate in the center gap (compact, easily navigated above or below)
      const gx = obs.x + 8;
      const gy = obs.gapY + obs.gapSize / 2 - 12;
      const gw = 54;
      const gh = 24;

      ctx.save();
      // Flashing technical border
      const blink = Math.sin(frameTick * 0.25) > 0;
      ctx.fillStyle = '#05070E';
      ctx.fillRect(gx, gy, gw, gh);

      ctx.strokeStyle = blink ? '#EF4444' : '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(gx, gy, gw, gh);

      // Drone rotor arms
      ctx.fillStyle = '#475569';
      ctx.fillRect(gx - 4, gy + 10, 4, 4);
      ctx.fillRect(gx + gw, gy + 10, 4, 4);

      // Warning text
      ctx.fillStyle = blink ? '#FCA5A5' : '#FEF08A';
      ctx.font = 'bold 8px "Oxanium", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FAA RESTRICTED', gx + gw / 2, gy + 11);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '6px "Silkscreen", monospace';
      ctx.fillText('[SLIP OVER/UNDER]', gx + gw / 2, gy + 20);

      ctx.restore();
    } else if (obs.hazardType === 'cryo_vent') {
      // High-pressure cryo vent erupting from bottom platform
      const vx = obs.x + obs.width / 2;
      const vy = canvasHeight - obs.bottomHeight;
      const plumeHeight = Math.min(obs.gapSize * 0.55, 110 + Math.sin(frameTick * 0.4) * 15);

      ctx.save();
      // Cold gas plume (updraft)
      const grad = ctx.createLinearGradient(vx, vy, vx, vy - plumeHeight);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(0.35, 'rgba(186, 230, 253, 0.45)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(vx - 12, vy);
      ctx.lineTo(vx - 18, vy - plumeHeight);
      ctx.lineTo(vx + 18, vy - plumeHeight);
      ctx.lineTo(vx + 12, vy);
      ctx.closePath();
      ctx.fill();

      // Vent nozzle
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(vx - 8, vy - 5, 16, 6);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(vx - 6, vy - 4, 12, 2);
      ctx.restore();
    } else if (obs.hazardType === 'jetpack_optimus') {
      // Randomised Jetpack Optimus Patrol Obstacle hovering inside the gap!
      const ox = obs.x + obs.width / 2;
      const hoverBob = Math.sin(frameTick * 0.08 + obs.x * 0.05) * 22;
      const oy = obs.gapY + obs.gapSize / 2 + hoverBob;

      ctx.save();
      ctx.translate(Math.round(ox), Math.round(oy));

      if (obs.hazardActive) {
        ctx.rotate(frameTick * 0.18);
        ctx.globalAlpha = 0.6;
      }

      // 1. Dual Rocket Jetpack Exhaust Plumes (Downward thrust)
      const jetLen = 14 + (frameTick % 4) * 3;
      const jetPipes = [-9, 9];

      for (const jx of jetPipes) {
        // Outer cyan flame
        ctx.fillStyle = '#00D8FF';
        ctx.beginPath();
        ctx.moveTo(jx - 3, 14);
        ctx.lineTo(jx, 14 + jetLen);
        ctx.lineTo(jx + 3, 14);
        ctx.closePath();
        ctx.fill();

        // Inner white-hot plasma core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(jx - 1.5, 14);
        ctx.lineTo(jx, 14 + Math.round(jetLen * 0.6));
        ctx.lineTo(jx + 1.5, 14);
        ctx.closePath();
        ctx.fill();

        // Nozzle ring
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(jx - 3, 11, 6, 4);
        ctx.fillStyle = '#64748B';
        ctx.fillRect(jx - 2, 12, 4, 2);
      }

      // Jetpack main backpack unit
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-11, -8, 22, 18);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-9, -6, 18, 14);
      // Twin high-pressure fuel tanks on pack
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(-10, -5, 5, 12);
      ctx.fillRect(5, -5, 5, 12);

      // 2. Optimus Gen-2 Robot Body in Flight Hover Pose
      // Pelvis & Legs
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-5, 6, 10, 3);
      // Left leg angled back
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-6, 8, 4, 7);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-6, 15, 5, 3);
      // Right leg angled back
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(2, 8, 4, 7);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(1, 15, 5, 3);

      // Torso & Matte White Tesla Chest
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-6, -6, 12, 12);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-5, -5, 10, 9);
      // Glowing core badge
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(-1, -3, 2, 2);

      // Arms: gripping jetpack steering handles
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-9, -4, 3, 8);
      ctx.fillRect(6, -4, 3, 8);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-9, 4, 3, 3);
      ctx.fillRect(6, 4, 3, 3);

      // Head: Matte White Helmet with Black Visor & Scanning Red/Cyan LED
      ctx.fillStyle = '#334155';
      ctx.fillRect(-2, -9, 4, 3); // neck
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(-5, -17, 10, 8);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-4, -18, 8, 2);
      // Black visor
      ctx.fillStyle = '#050505';
      ctx.fillRect(-4, -15, 8, 5);
      // Scanning optical laser line
      const scanX = Math.floor((frameTick * 0.9) % 6);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(-3 + scanX, -13, 2, 1);

      // 3. Technical Hologram Radar Tag Floating Above
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(-28, -27, 56, 9);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1;
      ctx.strokeRect(-28, -27, 56, 9);

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 7px "Oxanium", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obs.hazardActive ? 'DEFLECTED' : 'OPTIMUS JETPACK', 0, -20);

      ctx.restore();
    }
  }

  // Draw Collectibles: Tesla "T" Token (+100) or Cryo Boost Tank (+2,500 PSI)
  public static drawCollectible(
    ctx: CanvasRenderingContext2D,
    col: Collectible,
    frameTick: number
  ) {
    if (col.collected) return;
    const floatOffset = Math.sin((frameTick + col.pulseTimer) * 0.1) * 4;
    const cx = col.x;
    const cy = col.y + floatOffset;

    ctx.save();
    if (col.type === 'token') {
      // Golden Tesla T token
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tesla 'T' logo
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cx - 7, cy - 6, 14, 3);
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 3);
      ctx.lineTo(cx + 2, cy - 3);
      ctx.lineTo(cx, cy + 6);
      ctx.closePath();
      ctx.fill();
    } else {
      // Cryo PSI Canister
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.roundRect(cx - 8, cy - 12, 16, 24, 4);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cx - 5, cy - 8, 10, 4);

      // High pressure gauge indicator
      ctx.fillStyle = '#22D3EE';
      ctx.fillRect(cx - 4, cy, 8, 8);
    }
    ctx.restore();
  }

  // Draw Parallax Backgrounds: Unified Cyberpunk Night Staging Environment with Varied Background Structures
  // Draw Parallax Backgrounds: Faithful implementation of the user's "Neon Sci-Fi Pixel Art Tileset"
  public static drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    phase: GamePhase,
    scrollX: number,
    frameTick: number
  ) {
    ctx.save();

    if (phase === 'WACO') {
      // =========================================================================
      // LEVEL 1: WACO STAGING GROUND (NIGHT)
      // =========================================================================

      // FAR BG (LAYER 1): Night Sky, Distant Mountains, Amber Horizon Glow & Spotlights
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#040612');
      skyGrad.addColorStop(0.55, '#0B1028');
      skyGrad.addColorStop(0.82, '#1E1432');
      skyGrad.addColorStop(1, '#B45309'); // Warm amber horizon glow from event
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant Stars (Sky & Space Elements)
      for (let i = 0; i < 45; i++) {
        const sx = ((i * 43) - (scrollX * 0.03)) % width;
        const sy = (i * 27) % (height * 0.42);
        const twinkle = Math.sin(frameTick * 0.05 + i) > 0.3;
        ctx.fillStyle = twinkle ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect((sx + width) % width, sy, i % 6 === 0 ? 2.5 : 1.5, i % 6 === 0 ? 2.5 : 1.5);
      }

      // Distant Mountain Ridges (Backlit by amber glow)
      ctx.fillStyle = '#0F0B1A';
      ctx.beginPath();
      ctx.moveTo(0, height - 70);
      for (let mx = 0; mx <= width + 50; mx += 60) {
        const my = height - 120 - Math.sin((mx + scrollX * 0.06) * 0.008) * 35 - ((mx * 7) % 25);
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(width, height - 70);
      ctx.lineTo(0, height - 70);
      ctx.closePath();
      ctx.fill();

      // Theatrical Sweeping Spotlights fanning into the night sky
      ctx.save();
      const beamAngle1 = Math.sin(frameTick * 0.02) * 0.35 - 0.2;
      const beamAngle2 = Math.cos(frameTick * 0.025) * 0.4 + 0.28;
      const beamAngle3 = Math.sin(frameTick * 0.018 + 1.5) * 0.32 - 0.05;

      const drawSpotlight = (baseX: number, angle: number, color: string = 'rgba(255, 255, 255, 0.07)') => {
        const spotX = ((baseX - (scrollX * 0.15)) % (width + 300) + (width + 300)) % (width + 300) - 100;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(spotX, height - 75);
        ctx.lineTo(spotX + Math.tan(angle) * height - 80, 0);
        ctx.lineTo(spotX + Math.tan(angle) * height + 80, 0);
        ctx.closePath();
        ctx.fill();
      };

      drawSpotlight(160, beamAngle1, 'rgba(255, 255, 255, 0.07)');
      drawSpotlight(520, beamAngle2, 'rgba(224, 247, 255, 0.08)');
      drawSpotlight(880, beamAngle3, 'rgba(232, 33, 39, 0.05)');
      ctx.restore();

      // MID BG (LAYER 2, scroll * 0.2): Launch Ramp, TESLA Marquee, Pylons & Floodlights
      // 1. Steep Red Steel Launch Ramp on the left
      const rampX = ((120 - (scrollX * 0.2)) % (width + 1200) + (width + 1200)) % (width + 1200) - 150;
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.moveTo(rampX, height - 70);
      ctx.lineTo(rampX + 180, height - 210); // steep incline
      ctx.lineTo(rampX + 210, height - 210); // launch lip
      ctx.lineTo(rampX + 210, height - 70);
      ctx.closePath();
      ctx.fill();

      // Ramp steel truss support beams
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let rx = rampX + 30; rx < rampX + 190; rx += 35) {
        const topY = height - 70 - ((rx - rampX) / 180) * 140;
        ctx.moveTo(rx, height - 70);
        ctx.lineTo(rx, topY);
        ctx.lineTo(rx + 35, height - 70);
      }
      ctx.stroke();

      // 2. Giant Illuminated "TESLA" Marquee Sign with Crowd Viewing Bleachers
      const teslaSignX = ((460 - (scrollX * 0.2)) % (width + 1200) + (width + 1200)) % (width + 1200) - 150;
      ctx.fillStyle = '#111827';
      ctx.fillRect(teslaSignX, height - 170, 240, 100);

      // Glowing red TESLA marquee sign
      ctx.fillStyle = '#E82127';
      ctx.font = 'bold 24px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('T E S L A', teslaSignX + 120, height - 125);
      ctx.fillStyle = 'rgba(232, 33, 39, 0.25)';
      ctx.fillRect(teslaSignX + 20, height - 150, 200, 45);

      // 3. Tall Industrial Lattice Pylons & Stadium Floodlights (L1 Tiles)
      for (let i = 0; i < 4; i++) {
        const px = ((teslaSignX + 320 + i * 220) % (width + 1200) + (width + 1200)) % (width + 1200) - 100;
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(px, height - 240, 18, 170);

        // Blinking Red Warning Beacons on pylons
        const pBeacon = Math.sin(frameTick * 0.15 + i) > 0;
        ctx.fillStyle = pBeacon ? '#EF4444' : '#450A0A';
        ctx.fillRect(px + 6, height - 246, 6, 6);

        // Floodlight bank
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(px - 10, height - 235, 38, 8);
      }

      // NEAR BG (LAYER 3, scroll * 0.4): Parked Tesla Fleet Line & Spectator Bleachers
      ctx.fillStyle = '#080A12';
      ctx.fillRect(0, height - 70, width, 70);

      // Concrete vehicle staging platform / rail line
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, height - 70, width, 14);

      // Hazard warning stripes
      for (let sx = 0; sx < width; sx += 24) {
        ctx.fillStyle = '#EAB308';
        ctx.fillRect(sx, height - 70, 12, 4);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(sx + 12, height - 70, 12, 4);
      }

      // Cheering spectator crowd silhouettes along the bottom
      ctx.fillStyle = '#030509';
      for (let cx = 0; cx < width; cx += 7) {
        const bob = Math.sin((cx + frameTick * 2.2) * 0.12) > 0 ? 3 : 0;
        ctx.beginPath();
        ctx.arc(cx, height - 68 - bob, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (phase === 'ORBITAL') {
      // =========================================================================
      // LEVEL 2: CYBER COMPLEX (GIGA TEXAS / CYBERPUNK MEGACITY)
      // =========================================================================

      // FAR BG (LAYER 1): Unified Cyberpunk Twilight Night Sky with Warm Amber Horizon Glow (matching beginning environment)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#040612');
      skyGrad.addColorStop(0.55, '#0B1028');
      skyGrad.addColorStop(0.82, '#1E1432');
      skyGrad.addColorStop(1, '#B45309'); // Warm amber launch staging horizon glow
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant Stars twinkling in the night sky
      for (let i = 0; i < 45; i++) {
        const sx = ((i * 47) - (scrollX * 0.03)) % width;
        const sy = (i * 29) % (height * 0.42);
        const twinkle = Math.sin(frameTick * 0.06 + i) > 0.25;
        ctx.fillStyle = twinkle ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect((sx + width) % width, sy, i % 6 === 0 ? 2.5 : 1.5, i % 6 === 0 ? 2.5 : 1.5);
      }

      // Distant Cyberpunk Skyline Silhouette (Jagged futuristic high-rises backlit by glow)
      ctx.fillStyle = '#0D0818';
      ctx.beginPath();
      ctx.moveTo(0, height - 70);
      for (let bx = 0; bx <= width + 60; bx += 50) {
        const bHeight = 110 + ((bx * 13) % 45) + Math.sin(bx * 0.015) * 20;
        ctx.lineTo(bx, height - bHeight);
        ctx.lineTo(bx + 40, height - bHeight);
      }
      ctx.lineTo(width, height - 70);
      ctx.lineTo(0, height - 70);
      ctx.closePath();
      ctx.fill();

      // Theatrical Sweeping Spotlights crisscrossing into the night
      ctx.save();
      const beamAngle1 = Math.sin(frameTick * 0.022) * 0.38 - 0.15;
      const beamAngle2 = Math.cos(frameTick * 0.026) * 0.42 + 0.22;
      const beamAngle3 = Math.sin(frameTick * 0.019 + 2.0) * 0.35;

      const drawSpotlight = (baseX: number, angle: number, color: string) => {
        const spotX = ((baseX - (scrollX * 0.15)) % (width + 300) + (width + 300)) % (width + 300) - 100;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(spotX, height - 75);
        ctx.lineTo(spotX + Math.tan(angle) * height - 85, 0);
        ctx.lineTo(spotX + Math.tan(angle) * height + 85, 0);
        ctx.closePath();
        ctx.fill();
      };

      drawSpotlight(180, beamAngle1, 'rgba(0, 240, 255, 0.08)'); // Neon Cyan
      drawSpotlight(540, beamAngle2, 'rgba(217, 70, 239, 0.08)'); // Neon Magenta
      drawSpotlight(900, beamAngle3, 'rgba(255, 255, 255, 0.07)'); // Pure High-Lumen White
      ctx.restore();

      // MID BG (LAYER 2, scroll * 0.2): Cyberpunk Mega-Structures, Neon Signage, Monorail & Towers
      const midScroll = scrollX * 0.2;
      const complexSpan = width + 1400;

      // 1. Futuristic Gigafactory Tower with Illuminated Window Grids & Neon Sign
      const gigaX = ((160 - midScroll) % complexSpan + complexSpan) % complexSpan - 200;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(gigaX, height - 260, 220, 190);

      // Neon roof trim
      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(gigaX, height - 262, 220, 3);

      // Glowing window matrix (cyan and amber illuminated micro-windows)
      for (let wy = height - 250; wy < height - 160; wy += 14) {
        for (let wx = gigaX + 16; wx < gigaX + 204; wx += 18) {
          const isLit = (Math.sin(wx * 2.3 + wy * 1.7) > -0.2);
          if (isLit) {
            ctx.fillStyle = (wx + wy) % 5 === 0 ? '#FBBF24' : '#38BDF8';
            ctx.fillRect(wx, wy, 8, 7);
          }
        }
      }

      // Giant Glowing "G I G A  T E X A S" Neon Marquee
      ctx.fillStyle = '#111827';
      ctx.fillRect(gigaX + 15, height - 150, 190, 48);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.fillRect(gigaX + 15, height - 150, 190, 48);
      ctx.fillStyle = '#22D3EE';
      ctx.font = 'bold 16px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('G I G A  T E X A S', gigaX + 110, height - 120);

      // 2. Elevated Cyber Transit Skyway / Monorail
      const railY = height - 195;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, railY, width, 8); // Rail beam
      // Glowing cyan power line
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(0, railY + 2, width, 2);

      // Transit support pylons
      for (let px = 0; px < width + 300; px += 260) {
        const pylonX = ((px - midScroll) % (width + 300) + (width + 300)) % (width + 300) - 50;
        ctx.fillStyle = '#090D16';
        ctx.fillRect(pylonX, railY, 20, height - 70 - railY);
      }

      // High-Speed Automated Transit Pod gliding on the rail
      const podX = ((gigaX + 380 + (frameTick * 3.5)) % (width + 600) + (width + 600)) % (width + 600) - 100;
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(podX, railY - 14, 55, 12);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(podX + 35, railY - 12, 16, 4); // Cyan light strip
      ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.fillRect(podX - 25, railY - 12, 25, 8); // Light trail

      // 3. Cyberpunk Billboards & Mechazilla Towers
      const towerX = ((gigaX + 560) % complexSpan + complexSpan) % complexSpan - 150;

      // Mechazilla Catching Tower with yellow hazard arm
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(towerX, height - 290, 32, 220);
      // Hazard chopstick arm
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(towerX - 25, height - 230, 85, 10);
      ctx.fillStyle = '#18181B';
      ctx.fillRect(towerX - 10, height - 230, 12, 10);
      ctx.fillRect(towerX + 25, height - 230, 12, 10);

      // Warning aviation beacons
      const mBeacon = Math.sin(frameTick * 0.15) > 0;
      ctx.fillStyle = mBeacon ? '#EF4444' : '#450A0A';
      ctx.fillRect(towerX + 13, height - 296, 6, 6);

      // Second structure: Angled "CYBER" Holographic Sign
      const cyberSignX = towerX + 120;
      ctx.fillStyle = '#030712';
      ctx.fillRect(cyberSignX, height - 180, 160, 65);
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 20px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('C Y B E R', cyberSignX + 80, height - 138);
      ctx.fillStyle = '#06B6D4';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillText('SPACEX', cyberSignX + 80, height - 122);

      // Industrial vent tower with warning beacon
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(cyberSignX + 190, height - 210, 22, 140);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(cyberSignX + 188, height - 214, 26, 4);
      // Warning beacon light on top of vent
      const ventBlink = Math.sin(frameTick * 0.15) > 0;
      ctx.fillStyle = ventBlink ? '#EF4444' : '#581C87';
      ctx.fillRect(cyberSignX + 199, height - 218, 4, 4);

      // NEAR BG (LAYER 3, scroll * 0.4): Staging Runway, Hazard Stripes & Cheering Crowds
      ctx.fillStyle = '#080A12';
      ctx.fillRect(0, height - 70, width, 70);

      // Concrete vehicle staging platform
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, height - 70, width, 14);

      // Yellow/Black Hazard warning stripes
      for (let sx = 0; sx < width; sx += 24) {
        ctx.fillStyle = '#EAB308';
        ctx.fillRect(sx, height - 70, 12, 4);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(sx + 12, height - 70, 12, 4);
      }

      // Cheering spectator crowd silhouettes along the bottom
      ctx.fillStyle = '#030509';
      for (let cx = 0; cx < width; cx += 7) {
        const bob = Math.sin((cx + frameTick * 2.2) * 0.12) > 0 ? 3 : 0;
        ctx.beginPath();
        ctx.arc(cx, height - 68 - bob, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

    } else {
      // =========================================================================
      // LEVEL 3: STARBASE CITY (MEGA LAUNCH COMPLEX & HIGHBAY)
      // =========================================================================

      // FAR BG (LAYER 1): Unified Cyberpunk Twilight Night Sky with Warm Amber Horizon Glow (matching beginning environment)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#040612');
      skyGrad.addColorStop(0.55, '#0B1028');
      skyGrad.addColorStop(0.82, '#1E1432');
      skyGrad.addColorStop(1, '#B45309'); // Warm amber launch staging horizon glow
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Dense Diamond Starfield & Faint Cosmic Nebulae in Upper Night Sky
      const nebGrad = ctx.createRadialGradient(width * 0.72, height * 0.25, 10, width * 0.72, height * 0.25, 240);
      nebGrad.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
      nebGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.1)');
      nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 55; i++) {
        const sx = ((i * 47) - (scrollX * 0.03)) % width;
        const sy = (i * 27) % (height * 0.45);
        const twinkle = Math.sin(frameTick * 0.05 + i) > 0.25;
        ctx.fillStyle = twinkle ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect((sx + width) % width, sy, i % 5 === 0 ? 2.5 : 1.5, i % 5 === 0 ? 2.5 : 1.5);
      }

      // Distant Coastal Launch Horizon Silhouette
      ctx.fillStyle = '#0C0614';
      ctx.beginPath();
      ctx.moveTo(0, height - 70);
      for (let mx = 0; mx <= width + 60; mx += 60) {
        const my = height - 110 - Math.sin((mx + scrollX * 0.06) * 0.007) * 25;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(width, height - 70);
      ctx.lineTo(0, height - 70);
      ctx.closePath();
      ctx.fill();

      // Theatrical High-Lumen Launch Spotlights fanning through the sky
      ctx.save();
      const beamAngle1 = Math.sin(frameTick * 0.02) * 0.36 - 0.22;
      const beamAngle2 = Math.cos(frameTick * 0.024) * 0.38 + 0.18;
      const beamAngle3 = Math.sin(frameTick * 0.017 + 1.2) * 0.3;

      const drawSpotlight = (baseX: number, angle: number, color: string) => {
        const spotX = ((baseX - (scrollX * 0.15)) % (width + 300) + (width + 300)) % (width + 300) - 100;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(spotX, height - 75);
        ctx.lineTo(spotX + Math.tan(angle) * height - 85, 0);
        ctx.lineTo(spotX + Math.tan(angle) * height + 85, 0);
        ctx.closePath();
        ctx.fill();
      };

      drawSpotlight(150, beamAngle1, 'rgba(34, 211, 238, 0.09)'); // Cyan flame
      drawSpotlight(520, beamAngle2, 'rgba(251, 191, 36, 0.08)'); // Solar gold
      drawSpotlight(890, beamAngle3, 'rgba(239, 68, 68, 0.08)'); // Launch ruby
      ctx.restore();

      // MID BG (LAYER 2, scroll * 0.2): Starbase Mega-VAB, Cryogenic Tank Farm & Launch Mounts
      const midScroll = scrollX * 0.2;
      const starbaseSpan = width + 1400;

      // 1. Towering Starbase Highbay / Mega-VAB
      const vabX = ((140 - midScroll) % starbaseSpan + starbaseSpan) % starbaseSpan - 180;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(vabX, height - 310, 240, 240);

      // SpaceX vertical red racing stripes on VAB facade
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(vabX + 30, height - 310, 14, 240);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(vabX + 48, height - 310, 6, 240);

      // Illuminated Architectural Sign: "STARBASE"
      ctx.fillStyle = '#020617';
      ctx.fillRect(vabX + 70, height - 280, 155, 60);
      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STARBASE', vabX + 148, height - 245);

      // High-bay floodlight array
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(vabX + 10, height - 300, 220, 6);

      // 2. Cryogenic Propellant Storage Farm (Liquid Methane & LOX Spheres & Cylinders)
      const tankX = vabX + 310;

      // Massive insulated propellant cylinder
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.roundRect(tankX, height - 210, 75, 140, 10);
      ctx.fill();
      ctx.fillStyle = '#64748B';
      ctx.fillRect(tankX + 10, height - 190, 55, 4);
      ctx.fillRect(tankX + 10, height - 130, 55, 4);

      // Vertical Glowing LED Fuel Level Indicator Bar
      ctx.fillStyle = '#10B981'; // Fluorescent cryo-fuel green
      ctx.fillRect(tankX + 33, height - 180, 8, 80);

      // Spherical Cryo LOX Tank
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(tankX + 130, height - 140, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(tankX + 130, height - 140, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06B6D4'; // Glowing cold core
      ctx.fillRect(tankX + 124, height - 150, 12, 20);

      // 3. Orbital Launch Mount (OLM) & Heavy Gantry Crane
      const olmX = tankX + 220;
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(olmX, height - 320, 38, 250);

      // Yellow gantry crane arm extending over launchpad
      ctx.fillStyle = '#EAB308';
      ctx.fillRect(olmX - 30, height - 315, 120, 12);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(olmX + 20, height - 303, 10, 65); // Cable hoist

      // Blinking red beacon lights
      const sBeacon = Math.sin(frameTick * 0.16) > 0;
      ctx.fillStyle = sBeacon ? '#EF4444' : '#450A0A';
      ctx.fillRect(olmX + 16, height - 326, 6, 6);

      // Starman Easter Egg drifting peacefully high under the stars
      const starmanX = ((starbaseSpan * 0.7 - midScroll * 0.5) % (width + 400) + (width + 400)) % (width + 400) - 100;
      const starmanY = 65 + Math.sin(frameTick * 0.04) * 8;

      ctx.save();
      ctx.translate(starmanX, starmanY);
      ctx.rotate(-0.12);
      // Mini Cherry Red Roadster
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(-16, -3, 32, 8);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-6, -8, 14, 5);
      // Starman helmet
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, -11, 5, 5);
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(2, -10, 3, 2);
      // Small thruster puff
      if (frameTick % 6 < 3) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.fillRect(-22, -1, 6, 4);
      }
      ctx.restore();

      // NEAR BG (LAYER 3, scroll * 0.4): Staging Runway, Hazard Stripes & Cheering Crowds
      ctx.fillStyle = '#080A12';
      ctx.fillRect(0, height - 70, width, 70);

      // Concrete vehicle staging platform
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, height - 70, width, 14);

      // Yellow/Black Hazard warning stripes
      for (let sx = 0; sx < width; sx += 24) {
        ctx.fillStyle = '#EAB308';
        ctx.fillRect(sx, height - 70, 12, 4);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(sx + 12, height - 70, 12, 4);
      }

      // Cheering spectator crowd silhouettes along the bottom
      ctx.fillStyle = '#030509';
      for (let cx = 0; cx < width; cx += 7) {
        const bob = Math.sin((cx + frameTick * 2.2) * 0.12) > 0 ? 3 : 0;
        ctx.beginPath();
        ctx.arc(cx, height - 68 - bob, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Optimus Gen-2 Humanoid Robot standing by on the Starbase staging pad
      const optimusSpacing = 420;
      const optOffset = ((scrollX * 0.4) % optimusSpacing);
      const optX = (width * 0.35 - optOffset + optimusSpacing) % optimusSpacing;
      PixelRenderer.drawOptimus(ctx, optX, height - 82, frameTick, 'cheer', 0.85);
    }

    ctx.restore();
  }

  // Draw Tesla Optimus Gen-2 Humanoid Robot
  public static drawOptimus(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    frameTick: number = 0,
    mood: 'idle' | 'cheer' | 'wrench' | 'alert' = 'idle',
    scale: number = 1
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    const bob = Math.sin(frameTick * 0.08) * 1.5;
    const wave = Math.sin(frameTick * 0.16);

    // Shadow on the ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 24, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (Bipedal robotic limbs with white thigh guards and titanium knee actuators)
    // Left leg
    ctx.fillStyle = '#1E293B'; // Dark titanium skeleton
    ctx.fillRect(-6, 8, 4, 14);
    ctx.fillStyle = '#F8FAFC'; // White thigh armor
    ctx.fillRect(-7, 8, 5, 7);
    ctx.fillStyle = '#64748B'; // Knee joint
    ctx.fillRect(-6, 14, 4, 2);
    ctx.fillStyle = '#0F172A'; // Foot
    ctx.fillRect(-8, 22, 6, 2);

    // Right leg
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(2, 8, 4, 14);
    ctx.fillStyle = '#F8FAFC'; // White thigh armor
    ctx.fillRect(2, 8, 5, 7);
    ctx.fillStyle = '#64748B'; // Knee joint
    ctx.fillRect(2, 14, 4, 2);
    ctx.fillStyle = '#0F172A'; // Foot
    ctx.fillRect(2, 22, 6, 2);

    // Pelvis & Lower Torso
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-6, 5 + bob * 0.4, 12, 4);

    // Upper Torso & Chest Armor (Iconic sleek matte white Tesla Optimus chest)
    ctx.fillStyle = '#1E293B'; // Dark internal structure
    ctx.fillRect(-7, -8 + bob, 14, 14);
    ctx.fillStyle = '#F8FAFC'; // White chest plate
    ctx.fillRect(-6, -7 + bob, 12, 10);
    ctx.fillStyle = '#CBD5E1'; // Chest bevel
    ctx.fillRect(-4, -6 + bob, 8, 2);

    // Glowing chest power badge (Tesla badge / pulse node)
    ctx.fillStyle = mood === 'alert' ? '#E82127' : '#00F0FF';
    ctx.fillRect(-1, -4 + bob, 2, 2);

    // Neck & Collar
    ctx.fillStyle = '#334155';
    ctx.fillRect(-2, -11 + bob, 4, 3);

    // Head: Iconic Tesla Optimus Helmet (Matte white shell with seamless black glass face visor)
    ctx.fillStyle = '#E2E8F0'; // White helmet rear shell
    ctx.fillRect(-5, -20 + bob, 10, 9);
    ctx.fillStyle = '#F8FAFC'; // Top crown
    ctx.fillRect(-4, -21 + bob, 8, 2);

    // Black faceplate glass visor
    ctx.fillStyle = '#050505';
    ctx.fillRect(-4, -18 + bob, 8, 6);

    // Animated Optical Scan Visor (Cyan or Red laser line sweeping across visor)
    const scanPos = Math.floor(((frameTick * 0.8) % 6));
    ctx.fillStyle = mood === 'alert' ? '#FF2222' : '#00F0FF';
    ctx.fillRect(-3 + scanPos, -16 + bob, 2, 1);
    ctx.fillStyle = mood === 'alert' ? 'rgba(255, 34, 34, 0.4)' : 'rgba(0, 240, 255, 0.4)';
    ctx.fillRect(-4, -16 + bob, 8, 1);

    // Arms
    if (mood === 'cheer') {
      // Right arm raised high waving!
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(6, -8 + bob, 4, 4); // Shoulder
      ctx.fillStyle = '#F8FAFC'; // White shoulder cap
      ctx.fillRect(6, -9 + bob, 4, 3);
      // Forearm raised waving
      const armAngle = wave * 0.35;
      ctx.save();
      ctx.translate(8, -6 + bob);
      ctx.rotate(-2.2 + armAngle);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, 3, 12);
      ctx.fillStyle = '#00F0FF'; // Cyber palm glow
      ctx.fillRect(0, 10, 3, 2);
      ctx.restore();

      // Left arm resting
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-10, -7 + bob, 3, 11);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-10, 4 + bob, 3, 3);
    } else if (mood === 'wrench') {
      // Holding telemetry datapad / wrench in front
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-10, -7 + bob, 3, 9);
      ctx.fillRect(7, -7 + bob, 3, 9);
      // Datapad / Wrench in hands
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-4, 0 + bob, 8, 6);
      ctx.fillStyle = '#00F0FF'; // Glowing datapad screen
      ctx.fillRect(-3, 1 + bob, 6, 4);
    } else {
      // Idle pose with slight robotic micro-adjustments
      // Left arm
      ctx.fillStyle = '#F8FAFC'; // White shoulder
      ctx.fillRect(-10, -8 + bob, 4, 4);
      ctx.fillStyle = '#334155'; // Elbow
      ctx.fillRect(-9, -4 + bob, 3, 7);
      ctx.fillStyle = '#F8FAFC'; // Forearm
      ctx.fillRect(-9, 0 + bob, 3, 6);
      ctx.fillStyle = '#0F172A'; // Robotic hand
      ctx.fillRect(-9, 6 + bob, 3, 3);

      // Right arm
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(6, -8 + bob, 4, 4);
      ctx.fillStyle = '#334155';
      ctx.fillRect(6, -4 + bob, 3, 7);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(6, 0 + bob, 3, 6);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(6, 6 + bob, 3, 3);
    }

    ctx.restore();
  }

  // Draw Particles (exhaust, sparks, debris, explosion) - all sharp arcade pixels
  public static drawParticles(
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ) {
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      // Pixel block for authentic crisp arcade look
      ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
    }
    ctx.restore();
  }
}
