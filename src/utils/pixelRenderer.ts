// High-Fidelity Pixel-Art Renderer for Flippy Roadster
// Implements 16/32-bit pixel-art rendering for vehicles, obstacles, hazards, and parallax layers

import { Skin, ThrusterColor, Obstacle, Collectible, Particle, GamePhase } from '../types/game';

export const SKINS: Skin[] = [
  {
    id: 'ano_white',
    name: 'Ano White',
    description: 'Default matte white bodywork with titanium highlights and gold-tinted canopy glass.',
    unlockScore: 0,
    bodyColor: '#F0F2F5',
    accentColor: '#1A1C20',
    canopyColor: '#E6A817', // Gold-tinted canopy
    wheelColor: '#111215'
  },
  {
    id: 'ultra_red',
    name: 'Ultra Red',
    description: 'Multicoat deep metallic red celebrating the original 2017 unveiling prototype.',
    unlockScore: 25,
    bodyColor: '#D01018',
    accentColor: '#1E1E1E',
    canopyColor: '#2B3A4A',
    wheelColor: '#18181A'
  },
  {
    id: 'stainless',
    name: 'SpaceX Stainless',
    description: 'Cold-rolled 301 stainless steel mirror skin matched to Starship flight vehicles.',
    unlockScore: 50,
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
    unlockScore: 75,
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

    // Cold-Gas Thruster Nozzle at the rear
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(ox - 3, oy + 12, 4, 4);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(ox - 4, oy + 13, 2, 2);

    // Animated Thruster Exhaust Plume (When thrusting or idle puff)
    if (isThrusting) {
      const flicker = (frameTick % 4);
      const exhaustLen = 28 + flicker * 4;

      // Outer plasma flame
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

      // Shock diamonds in supersonic exhaust
      ctx.fillStyle = '#FFFFFF';
      for (let i = 1; i <= 3; i++) {
        const sx = ox - 4 - (i * 7);
        ctx.fillRect(sx, oy + 13, 3, 2);
      }
    } else {
      // Small idle cold-gas pilot pulse
      if (frameTick % 8 < 4) {
        ctx.fillStyle = 'rgba(0, 216, 255, 0.4)';
        ctx.fillRect(ox - 7, oy + 13, 3, 2);
      }
    }

    ctx.restore();
  }

  // Draw Bottom Obstacle (Fleet stacks: Cybertruck, Model 3 stack, Cybercab, Semi, Platform)
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

    // Base industrial staging platform beneath all fleet obstacles
    ctx.fillStyle = '#111827';
    ctx.fillRect(x - 4, y, w + 8, h);

    // Steel truss structure
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 10, w, h - 10);

    // Warning hazard stripes at platform base edge
    const stripeWidth = 12;
    for (let sx = x; sx < x + w; sx += stripeWidth * 2) {
      ctx.fillStyle = '#EAB308'; // Warning yellow
      ctx.fillRect(sx, y, stripeWidth, 5);
      ctx.fillStyle = '#18181B'; // Black stripe
      ctx.fillRect(sx + stripeWidth, y, stripeWidth, 5);
    }

    // Red warning beacons flashing on top corners
    const beaconBlink = Math.sin(frameTick * 0.15) > 0;
    ctx.fillStyle = beaconBlink ? '#EF4444' : '#7F1D1D';
    ctx.fillRect(x + 2, y - 6, 6, 6);
    ctx.fillRect(x + w - 8, y - 6, 6, 6);
    if (beaconBlink) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.arc(x + 5, y - 3, 10, 0, Math.PI * 2);
      ctx.arc(x + w - 5, y - 3, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Specific Fleet stack graphic
    switch (obs.bottomType) {
      case 'cybertruck': {
        // Angular Cybertruck parked on top of platform
        const cy = y - 28;
        const cx = x + (w - 74) / 2;

        // Stainless triangular body
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 24); // rear bottom
        ctx.lineTo(cx + 4, cy + 12); // rear tailgate
        ctx.lineTo(cx + 34, cy + 2); // apex roof roofline
        ctx.lineTo(cx + 70, cy + 16); // front hood tip
        ctx.lineTo(cx + 72, cy + 24); // front bumper
        ctx.closePath();
        ctx.fill();

        // Dark window glass
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(cx + 20, cy + 13);
        ctx.lineTo(cx + 34, cy + 5);
        ctx.lineTo(cx + 52, cy + 14);
        ctx.closePath();
        ctx.fill();

        // Signature horizontal lightbar
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(cx + 66, cy + 16, 6, 2);

        // Chunky angular wheels
        ctx.fillStyle = '#090A0C';
        ctx.fillRect(cx + 10, cy + 20, 14, 10);
        ctx.fillRect(cx + 50, cy + 20, 14, 10);
        break;
      }

      case 'semi': {
        // Tesla Semi
        const sy = y - 48;
        const sx = x + (w - 80) / 2;

        // Tall aero cab
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(sx + 10, sy + 6, 60, 42);
        ctx.fillStyle = '#0F172A'; // Panoramic wrap windshield
        ctx.fillRect(sx + 35, sy + 10, 32, 18);

        // Roof wind fairing
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(sx + 10, sy, 55, 6);

        // Rear chassis
        ctx.fillStyle = '#334155';
        ctx.fillRect(sx, sy + 28, 20, 20);

        // Wheels
        ctx.fillStyle = '#020617';
        ctx.fillRect(sx + 4, sy + 38, 12, 12);
        ctx.fillRect(sx + 48, sy + 38, 14, 12);
        break;
      }

      case 'cybercab': {
        // Futuristic Cybercab robotaxi (gold body, no steering wheel, camera fins)
        const ccy = y - 24;
        const ccx = x + (w - 68) / 2;

        // Gold-bronze body
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.roundRect(ccx, ccy + 6, 64, 16, 6);
        ctx.fill();

        // Dark flush glass canopy
        ctx.fillStyle = '#111827';
        ctx.fillRect(ccx + 18, ccy, 30, 8);

        // Continuous full-width LED strip
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(ccx + 58, ccy + 9, 6, 2);

        // Solid aero wheels
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.arc(ccx + 16, ccy + 22, 6, 0, Math.PI * 2);
        ctx.arc(ccx + 48, ccy + 22, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'generator': {
        // Industrial Cryogenic Power Substation / Generator (from pixel tileset)
        const gy = y - 38;
        const gx = x + (w - 68) / 2;

        // Main chassis
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(gx, gy + 8, 68, 30);

        // Top cooling radiator block
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(gx + 6, gy, 56, 8);

        // Glowing cyan energy core vent
        const coreGlow = Math.sin(frameTick * 0.1) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(6, 182, 212, ${coreGlow})`;
        ctx.fillRect(gx + 12, gy + 14, 20, 16);

        // Warning chevrons on front panel
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(gx + 40, gy + 14, 22, 6);
        ctx.fillStyle = '#18181B';
        ctx.fillRect(gx + 46, gy + 14, 6, 6);

        // Status indicator LEDs
        ctx.fillStyle = '#10B981';
        ctx.fillRect(gx + 40, gy + 24, 4, 4);
        ctx.fillStyle = Math.sin(frameTick * 0.2) > 0 ? '#EF4444' : '#7F1D1D';
        ctx.fillRect(gx + 48, gy + 24, 4, 4);
        break;
      }

      case 'battery_pack': {
        // Megapack Energy Storage Unit (from pixel tileset)
        const by = y - 34;
        const bx = x + (w - 70) / 2;

        // Clean white/gray industrial enclosure
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(bx, by + 6, 70, 28);

        // Recessed cooling vents
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx + 8, by + 12, 16, 16);
        ctx.fillRect(bx + 28, by + 12, 16, 16);
        ctx.fillRect(bx + 48, by + 12, 16, 16);

        // Green LED charge level meter bars
        ctx.fillStyle = '#22C55E';
        for (let seg = 0; seg < 4; seg++) {
          ctx.fillRect(bx + 10 + seg * 14, by + 8, 10, 2);
        }

        // Base mounting brackets
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(bx - 2, by + 30, 74, 4);
        break;
      }

      case 'model3_stack':
      default: {
        // Multi-tiered Model 3 transporter rack
        const stackY = y - 42;
        const stackX = x + (w - 64) / 2;

        // Tier 1 sedan
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(stackX + 6, stackY + 24, 52, 12);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(stackX + 18, stackY + 18, 26, 6);

        // Tier 2 sedan on top rack
        ctx.fillStyle = '#DC2626'; // Red Model 3
        ctx.fillRect(stackX + 8, stackY + 4, 48, 10);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(stackX + 18, stackY, 24, 5);

        // Carrier steel frame
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 2;
        ctx.strokeRect(stackX, stackY - 2, 62, 42);
        break;
      }
    }

    ctx.restore();
  }

  // Draw Top Obstacle (Starship booster, Mechazilla arm, Rigging, Satellite, Space Debris)
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

    switch (obs.topType) {
      case 'booster': {
        // Starship Super Heavy Booster hanging downward
        ctx.fillStyle = '#CBD5E1'; // Stainless steel cylinder
        ctx.fillRect(x + 6, y, w - 12, h - 24);

        // Welded ring seams
        ctx.fillStyle = '#64748B';
        for (let ry = 20; ry < h - 30; ry += 35) {
          ctx.fillRect(x + 6, ry, w - 12, 2);
        }

        // Aerodynamic grid fins
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x - 6, h - 50, 12, 18);
        ctx.fillRect(x + w - 6, h - 50, 12, 18);

        // Interstage bell & Raptor engine nozzles extending down
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 10, h - 24, w - 20, 14);

        // 3 Raptor engine bells
        const nozzleW = 12;
        const nozzleSpacing = (w - 20 - (3 * nozzleW)) / 2;
        for (let i = 0; i < 3; i++) {
          const nx = x + 10 + (i * (nozzleW + nozzleSpacing));
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.moveTo(nx + 2, h - 10);
          ctx.lineTo(nx + nozzleW - 2, h - 10);
          ctx.lineTo(nx + nozzleW, h);
          ctx.lineTo(nx, h);
          ctx.closePath();
          ctx.fill();

          // Hot inner glow
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(nx + 3, h - 2, nozzleW - 6, 2);
        }
        break;
      }

      case 'mechazilla': {
        // Mechazilla Catching Arm (Tower + black & yellow hazard stripes + hydraulic ram)
        ctx.fillStyle = '#18181B';
        ctx.fillRect(x + 8, y, w - 16, h - 30);

        // Warning diagonal hazard stripes
        const stripeH = 14;
        for (let sy = 0; sy < h - 35; sy += stripeH * 2) {
          ctx.fillStyle = '#FBBF24';
          ctx.fillRect(x + 8, sy, w - 16, stripeH);
        }

        // Horizontal articulated chopstick arm
        ctx.fillStyle = '#09090B';
        ctx.fillRect(x, h - 30, w + 16, 26);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x + 4, h - 26, w + 8, 4);

        // Hydraulic piston cylinder
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(x + 16, h - 14, 18, 14);
        break;
      }

      case 'conduit': {
        // High-voltage cyberpunk transit conduit & fuel gantry
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 10, y, w - 20, h - 22);

        // Glowing neon power conduit lines (cyan / violet)
        ctx.fillStyle = '#06B6D4';
        ctx.fillRect(x + 14, 0, 4, h - 26);
        ctx.fillStyle = '#A855F7';
        ctx.fillRect(x + w - 18, 0, 4, h - 26);

        // Industrial cross-frame brackets
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        for (let gy = 15; gy < h - 30; gy += 30) {
          ctx.strokeRect(x + 8, gy, w - 16, 6);
        }

        // Warning hazard stripes at terminal header
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x + 4, h - 22, w - 8, 14);
        ctx.fillStyle = '#18181B';
        ctx.fillRect(x + 12, h - 22, 10, 14);
        ctx.fillRect(x + w - 22, h - 22, 10, 14);

        // Blinking amber strobe on bottom
        const strobe = Math.sin(frameTick * 0.25) > 0;
        ctx.fillStyle = strobe ? '#FBBF24' : '#78350F';
        ctx.fillRect(x + w / 2 - 5, h - 8, 10, 8);
        break;
      }

      case 'satellite': {
        // High-tech overhead gantry & telemetry sensor array
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 12, y, w - 24, h - 20);

        // Gold foil sensor bay
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x + 16, h - 32, w - 32, 12);

        // Blue photovoltaic arrays / telemetry wings extending left & right
        ctx.fillStyle = '#2563EB';
        ctx.fillRect(x - 18, h - 36, 26, 20);
        ctx.fillRect(x + w - 8, h - 36, 26, 20);

        // Solar cell grid lines
        ctx.strokeStyle = '#93C5FD';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 18, h - 36, 26, 20);
        ctx.strokeRect(x + w - 8, h - 36, 26, 20);

        // Downward targeting laser / communications beacon
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.arc(x + w / 2, h - 6, 10, Math.PI, 0, true);
        ctx.fill();

        // Pulsing sensor light
        const sensBlink = Math.sin(frameTick * 0.2) > 0;
        ctx.fillStyle = sensBlink ? '#00F0FF' : '#0369A1';
        ctx.fillRect(x + w / 2 - 3, h - 4, 6, 4);
        break;
      }

      case 'debris': {
        // Heavy industrial gantry crane hook & counterweight
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 8, y, w - 16, h - 22);

        // Warning chevrons
        ctx.fillStyle = '#EAB308';
        ctx.fillRect(x + 12, h - 36, w - 24, 6);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x + 18, h - 36, 8, 6);

        // Heavy steel forged hook hanging down
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + w / 2, h - 10, 10, 0, Math.PI);
        ctx.stroke();
        break;
      }

      case 'gantry': {
        // Heavy Industrial Overhead Truss Gantry (from pixel asset sheet)
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 6, y, w - 12, h - 20);

        // Warning diagonal hazard stripes across header
        const gStripe = 10;
        for (let sx = x + 6; sx < x + w - 6; sx += gStripe * 2) {
          ctx.fillStyle = '#EAB308';
          ctx.fillRect(sx, h - 30, gStripe, 10);
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(sx + gStripe, h - 30, gStripe, 10);
        }

        // Riveted steel border plate
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 4, h - 20, w - 8, 8);

        // Flashing amber caution beacon
        const gBeacon = Math.sin(frameTick * 0.2) > 0;
        ctx.fillStyle = gBeacon ? '#FBBF24' : '#78350F';
        ctx.fillRect(x + w / 2 - 4, h - 12, 8, 8);
        break;
      }

      case 'crane': {
        // Overhead Launchpad Crane Arm with Suspension Cable & Hook (from pixel asset sheet)
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 10, y, w - 20, h - 36);

        // Hydraulic arm articulation joint
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.arc(x + w / 2, h - 36, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(x + w / 2, h - 36, 6, 0, Math.PI * 2);
        ctx.fill();

        // Twin steel suspension cables
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 6, h - 24);
        ctx.lineTo(x + w / 2 - 6, h - 10);
        ctx.moveTo(x + w / 2 + 6, h - 24);
        ctx.lineTo(x + w / 2 + 6, h - 10);
        ctx.stroke();

        // Heavy steel claw/hook
        ctx.fillStyle = '#EAB308';
        ctx.fillRect(x + w / 2 - 10, h - 10, 20, 6);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + w / 2, h - 4, 8, 0, Math.PI);
        ctx.stroke();
        break;
      }

      case 'rigging':
      default: {
        // Steel launch complex rigging & gantries
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 10, y, w - 20, h - 12);

        // Cross-bracing steel beams
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        for (let gy = 10; gy < h - 20; gy += 30) {
          ctx.beginPath();
          ctx.moveTo(x + 10, gy);
          ctx.lineTo(x + w - 10, gy + 30);
          ctx.moveTo(x + w - 10, gy);
          ctx.lineTo(x + 10, gy + 30);
          ctx.stroke();
        }

        // Bottom spotlight / beacon
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(x + w / 2 - 8, h - 12, 16, 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 8, h);
        ctx.lineTo(x - 20, h + 50);
        ctx.lineTo(x + w + 20, h + 50);
        ctx.lineTo(x + w / 2 + 8, h);
        ctx.closePath();
        ctx.fill();
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
      // FAA Regulatory Warning Sign in the center gap
      const gx = obs.x - 10;
      const gy = obs.gapY + obs.gapSize / 2 - 24;
      const gw = 100;
      const gh = 48;

      ctx.save();
      // Flashing warning border
      const blink = Math.sin(frameTick * 0.2) > 0;
      ctx.fillStyle = '#000000';
      ctx.fillRect(gx, gy, gw, gh);

      ctx.strokeStyle = blink ? '#EF4444' : '#F59E0B';
      ctx.lineWidth = 3;
      ctx.strokeRect(gx, gy, gw, gh);

      // Warning text
      ctx.fillStyle = blink ? '#FCA5A5' : '#FEF08A';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NOT APPROVED', gx + gw / 2, gy + 14);
      ctx.fillText('FOR PUBLIC', gx + gw / 2, gy + 24);
      ctx.fillText('ROAD USE', gx + gw / 2, gy + 34);

      // Small FAA badge
      ctx.fillStyle = '#EF4444';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('⊛ FAA', gx + gw / 2, gy + 44);

      ctx.restore();
    } else if (obs.hazardType === 'cryo_vent') {
      // High-pressure cryo vent erupting from bottom platform
      const vx = obs.x + obs.width / 2;
      const vy = canvasHeight - obs.bottomHeight;
      const plumeHeight = 110 + Math.sin(frameTick * 0.4) * 20;

      ctx.save();
      // Cold gas plume
      const grad = ctx.createLinearGradient(vx, vy, vx, vy - plumeHeight);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.4, 'rgba(186, 230, 253, 0.6)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(vx - 14, vy);
      ctx.lineTo(vx - 22, vy - plumeHeight);
      ctx.lineTo(vx + 22, vy - plumeHeight);
      ctx.lineTo(vx + 14, vy);
      ctx.closePath();
      ctx.fill();

      // Vent nozzle
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(vx - 10, vy - 6, 20, 8);
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

      // Industrial steam vent tower releasing vapor
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(cyberSignX + 190, height - 210, 22, 140);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let s = 0; s < 4; s++) {
        const puffY = height - 210 - (s * 15) - ((frameTick * 1.5 + s * 10) % 25);
        const puffSize = 8 + s * 4;
        ctx.beginPath();
        ctx.arc(cyberSignX + 201 + Math.sin(frameTick * 0.1 + s) * 6, puffY, puffSize, 0, Math.PI * 2);
        ctx.fill();
      }

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

      // Huge Illuminated Marquee Sign: "HOP TO 2028"
      ctx.fillStyle = '#020617';
      ctx.fillRect(vabX + 70, height - 280, 155, 60);
      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 13px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HOP TO', vabX + 148, height - 254);
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 17px "Chakra Petch", sans-serif';
      ctx.fillText('2 0 2 8', vabX + 148, height - 232);

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
    }

    ctx.restore();
  }

  // Draw Particles (exhaust, sparks, smoke, explosion)
  public static drawParticles(
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ) {
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Pixel block for arcade look
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();
  }
}
