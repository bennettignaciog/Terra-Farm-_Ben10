import { WeatherType } from '../simulation/types';

interface RainDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  alpha: number;
}

interface RainSplash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  vy: number;
  color: string;
}

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  wobbleSpeed: number;
  wobbleOffset: number;
}

interface WindStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  thickness: number;
  curviness: number;
}

interface WindDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  size: number;
  alpha: number;
  type: 'leaf' | 'straw' | 'fluff';
}

interface PestBug {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wingPhase: number;
  targetX: number;
  targetY: number;
  alpha: number;
}

export class WeatherOverlaySystem {
  private rainDrops: RainDrop[] = [];
  private rainSplashes: RainSplash[] = [];
  private dustMotes: DustMote[] = [];
  private windStreaks: WindStreak[] = [];
  private windDebris: WindDebris[] = [];
  private pestBugs: PestBug[] = [];

  private time: number = 0;
  private width: number = 800;
  private height: number = 600;

  constructor() {
    this.initPools();
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  private initPools() {
    // 1. Rain drops
    this.rainDrops = [];
    for (let i = 0; i < 90; i++) {
      this.rainDrops.push({
        x: Math.random() * 1000,
        y: Math.random() * 800,
        vx: 2 + Math.random() * 2,
        vy: 14 + Math.random() * 8,
        length: 12 + Math.random() * 14,
        thickness: 0.8 + Math.random() * 0.8,
        alpha: 0.35 + Math.random() * 0.4
      });
    }

    // 2. Dust & Heat motes
    this.dustMotes = [];
    for (let i = 0; i < 45; i++) {
      this.dustMotes.push({
        x: Math.random() * 1000,
        y: Math.random() * 800,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4 - Math.random() * 0.8,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.5,
        color: Math.random() > 0.4 ? 'rgba(251, 191, 36, ' : 'rgba(217, 119, 6, ',
        wobbleSpeed: 2 + Math.random() * 3,
        wobbleOffset: Math.random() * Math.PI * 2
      });
    }

    // 3. Wind Streaks
    this.windStreaks = [];
    for (let i = 0; i < 20; i++) {
      this.windStreaks.push({
        x: Math.random() * 1000,
        y: Math.random() * 800,
        length: 40 + Math.random() * 90,
        speed: 8 + Math.random() * 10,
        alpha: 0.15 + Math.random() * 0.35,
        thickness: 0.7 + Math.random() * 1.2,
        curviness: (Math.random() - 0.5) * 15
      });
    }

    // 4. Wind Debris (leaves, straw, seeds)
    this.windDebris = [];
    const debrisTypes: ('leaf' | 'straw' | 'fluff')[] = ['leaf', 'straw', 'fluff'];
    for (let i = 0; i < 35; i++) {
      this.windDebris.push({
        x: Math.random() * 1000,
        y: Math.random() * 800,
        vx: 4 + Math.random() * 7,
        vy: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        size: 3 + Math.random() * 4,
        alpha: 0.4 + Math.random() * 0.45,
        type: debrisTypes[Math.floor(Math.random() * debrisTypes.length)]
      });
    }

    // 5. Pest Bugs
    this.pestBugs = [];
    for (let i = 0; i < 50; i++) {
      this.pestBugs.push({
        x: Math.random() * 1000,
        y: Math.random() * 800,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        wingPhase: Math.random() * Math.PI * 2,
        targetX: Math.random() * 1000,
        targetY: Math.random() * 800,
        alpha: 0.5 + Math.random() * 0.4
      });
    }
  }

  public update(weather: WeatherType, hasAgroforestry: boolean) {
    this.time += 0.02;

    const isRain = weather === 'rain' || weather === 'unseasonal_rain';
    const isHeat = weather === 'heatwave' || weather === 'drought';
    const isWind = weather === 'wind';
    const isPest = weather === 'pest_swarm';

    // 1. Update Rain
    if (isRain) {
      const dropCount = weather === 'unseasonal_rain' ? 85 : 55;
      for (let i = 0; i < dropCount; i++) {
        const drop = this.rainDrops[i];
        drop.x += drop.vx;
        drop.y += drop.vy;

        // Ground hit trigger -> spawn splash
        if (drop.y > this.height * 0.88 && Math.random() < 0.2) {
          if (this.rainSplashes.length < 40) {
            this.rainSplashes.push({
              x: drop.x,
              y: drop.y,
              radius: 1,
              maxRadius: 3 + Math.random() * 4,
              alpha: 0.6,
              vy: -0.5 - Math.random() * 1,
              color: 'rgba(186, 230, 253, '
            });
          }
        }

        // Wrap around
        if (drop.y > this.height + 20 || drop.x > this.width + 20) {
          drop.y = -20 - Math.random() * 30;
          drop.x = Math.random() * (this.width + 200) - 100;
        }
      }

      // Update splashes
      for (let s = this.rainSplashes.length - 1; s >= 0; s--) {
        const splash = this.rainSplashes[s];
        splash.radius += 0.35;
        splash.y += splash.vy;
        splash.alpha -= 0.04;
        if (splash.alpha <= 0 || splash.radius >= splash.maxRadius) {
          this.rainSplashes.splice(s, 1);
        }
      }
    }

    // 2. Update Dust & Heat Shimmers
    if (isHeat || weather === 'sunny') {
      const activeMotes = isHeat ? 40 : 12; // gentle pollen if sunny
      for (let i = 0; i < activeMotes; i++) {
        const mote = this.dustMotes[i];
        const wobble = Math.sin(this.time * mote.wobbleSpeed + mote.wobbleOffset) * 0.5;
        mote.x += mote.vx + wobble;
        mote.y += mote.vy;

        if (mote.y < -10) {
          mote.y = this.height + 10;
          mote.x = Math.random() * this.width;
        }
        if (mote.x < -10) mote.x = this.width + 10;
        if (mote.x > this.width + 10) mote.x = -10;
      }
    }

    // 3. Update Wind
    if (isWind) {
      // If agroforestry trees are planted, wind speed is buffered by 40%
      const speedMultiplier = hasAgroforestry ? 0.6 : 1.0;

      for (let i = 0; i < this.windStreaks.length; i++) {
        const streak = this.windStreaks[i];
        streak.x += streak.speed * speedMultiplier;
        streak.y += Math.sin(this.time * 2 + streak.x * 0.01) * 0.4;

        if (streak.x > this.width + streak.length) {
          streak.x = -streak.length - Math.random() * 100;
          streak.y = Math.random() * this.height;
        }
      }

      for (let i = 0; i < this.windDebris.length; i++) {
        const debris = this.windDebris[i];
        debris.x += debris.vx * speedMultiplier;
        debris.y += debris.vy + Math.sin(this.time * 3 + debris.x * 0.02) * 1.2;
        debris.rotation += debris.vRot;

        if (debris.x > this.width + 20) {
          debris.x = -20;
          debris.y = Math.random() * this.height;
        }
      }
    }

    // 4. Update Pest Swarm
    if (isPest) {
      for (let i = 0; i < this.pestBugs.length; i++) {
        const bug = this.pestBugs[i];
        bug.wingPhase += 0.8;

        // Subtle steering towards target cluster
        if (Math.random() < 0.03) {
          bug.targetX = Math.random() * this.width;
          bug.targetY = Math.random() * this.height;
        }

        const dx = bug.targetX - bug.x;
        const dy = bug.targetY - bug.y;
        bug.vx += (dx * 0.001) + (Math.random() - 0.5) * 1.2;
        bug.vy += (dy * 0.001) + (Math.random() - 0.5) * 1.2;

        // Speed limit
        const speed = Math.hypot(bug.vx, bug.vy);
        if (speed > 4) {
          bug.vx = (bug.vx / speed) * 4;
          bug.vy = (bug.vy / speed) * 4;
        }

        bug.x += bug.vx;
        bug.y += bug.vy;

        if (bug.x < 0) bug.x = this.width;
        if (bug.x > this.width) bug.x = 0;
        if (bug.y < 0) bug.y = this.height;
        if (bug.y > this.height) bug.y = 0;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, weather: WeatherType, hasAgroforestry: boolean) {
    ctx.save();

    const isRain = weather === 'rain' || weather === 'unseasonal_rain';
    const isHeat = weather === 'heatwave' || weather === 'drought';
    const isWind = weather === 'wind';
    const isPest = weather === 'pest_swarm';

    // -----------------------------------------------------------------
    // 1. ATMOSPHERIC COLOR GRADES
    // -----------------------------------------------------------------
    if (isRain) {
      // Cool sky tint
      ctx.fillStyle = weather === 'unseasonal_rain' 
        ? 'rgba(14, 116, 144, 0.10)' 
        : 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (weather === 'heatwave') {
      // Radiant amber heat haze
      ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (weather === 'drought') {
      // Arid dust tint
      ctx.fillStyle = 'rgba(180, 83, 9, 0.07)';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // -----------------------------------------------------------------
    // 2. HEAT SHIMMERS & THERMAL WAVES
    // -----------------------------------------------------------------
    if (isHeat) {
      // Draw subtle undulating vertical thermal refraction shimmer lines
      ctx.save();
      const numShimmers = 6;
      for (let s = 0; s < numShimmers; s++) {
        const baseX = (this.width / (numShimmers + 1)) * (s + 1);
        ctx.beginPath();
        ctx.moveTo(baseX, this.height);

        const segments = 16;
        const segmentHeight = this.height / segments;

        for (let i = segments; i >= 0; i--) {
          const y = i * segmentHeight;
          const offset = Math.sin((y * 0.04) + (this.time * 4) + s) * (4 + (1 - i / segments) * 6);
          ctx.lineTo(baseX + offset, y);
        }

        ctx.strokeStyle = `rgba(251, 191, 36, ${0.08 + Math.sin(this.time * 2 + s) * 0.04})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // Floating dust motes
      const count = weather === 'drought' ? 40 : 25;
      for (let i = 0; i < count; i++) {
        const mote = this.dustMotes[i];
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fillStyle = `${mote.color}${mote.alpha})`;
        ctx.fill();
      }
    } else if (weather === 'sunny') {
      // Gentle sunbeam pollen in bright weather
      for (let i = 0; i < 10; i++) {
        const mote = this.dustMotes[i];
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 230, 138, ${mote.alpha * 0.4})`;
        ctx.fill();
      }
    }

    // -----------------------------------------------------------------
    // 3. WIND OVERLAY & FLYING VEGETATIVE DEBRIS
    // -----------------------------------------------------------------
    if (isWind) {
      // Fast horizontal breeze streaks
      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 0; i < this.windStreaks.length; i++) {
        const streak = this.windStreaks[i];
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.quadraticCurveTo(
          streak.x + streak.length * 0.5, 
          streak.y + streak.curviness, 
          streak.x + streak.length, 
          streak.y
        );
        ctx.strokeStyle = `rgba(226, 232, 240, ${streak.alpha * (hasAgroforestry ? 0.4 : 0.75)})`;
        ctx.lineWidth = streak.thickness;
        ctx.stroke();
      }
      ctx.restore();

      // Floating swirling debris (leaves, straw, seed fluff)
      for (let i = 0; i < this.windDebris.length; i++) {
        const debris = this.windDebris[i];
        ctx.save();
        ctx.translate(debris.x, debris.y);
        ctx.rotate(debris.rotation);

        if (debris.type === 'leaf') {
          // Curving leaf
          ctx.beginPath();
          ctx.ellipse(0, 0, debris.size * 1.4, debris.size * 0.7, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(132, 204, 22, ${debris.alpha})`;
          ctx.fill();
        } else if (debris.type === 'straw') {
          // Golden dried straw fragment
          ctx.beginPath();
          ctx.rect(-debris.size, -0.7, debris.size * 2, 1.4);
          ctx.fillStyle = `rgba(234, 179, 8, ${debris.alpha})`;
          ctx.fill();
        } else {
          // Fluff / seed
          ctx.beginPath();
          ctx.arc(0, 0, debris.size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(248, 250, 252, ${debris.alpha * 0.8})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // If Agroforestry windbreak is active, render a subtle shelter barrier indicator
      if (hasAgroforestry) {
        ctx.save();
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(16, 16, this.width - 32, this.height - 32);
        ctx.restore();
      }
    }

    // -----------------------------------------------------------------
    // 4. RAIN OVERLAY & SPLASH PARTICLES
    // -----------------------------------------------------------------
    if (isRain) {
      const dropCount = weather === 'unseasonal_rain' ? 85 : 55;
      ctx.save();
      ctx.strokeStyle = weather === 'unseasonal_rain' 
        ? 'rgba(186, 230, 253, 0.65)' 
        : 'rgba(186, 230, 253, 0.45)';
      ctx.lineCap = 'round';

      for (let i = 0; i < dropCount; i++) {
        const drop = this.rainDrops[i];
        ctx.lineWidth = drop.thickness;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.vx * 1.5, drop.y + drop.length);
        ctx.stroke();
      }
      ctx.restore();

      // Rain Splashes on ground
      for (let s = 0; s < this.rainSplashes.length; s++) {
        const splash = this.rainSplashes[s];
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(splash.x, splash.y, splash.radius * 1.8, splash.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `${splash.color}${splash.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
    }

    // -----------------------------------------------------------------
    // 5. PEST SWARM OVERLAY
    // -----------------------------------------------------------------
    if (isPest) {
      ctx.save();
      for (let i = 0; i < this.pestBugs.length; i++) {
        const bug = this.pestBugs[i];
        ctx.save();
        ctx.translate(bug.x, bug.y);

        // Body
        ctx.fillStyle = `rgba(127, 29, 29, ${bug.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 2.5, 1.2, Math.atan2(bug.vy, bug.vx), 0, Math.PI * 2);
        ctx.fill();

        // Fluttering micro-wings
        const wingSpan = Math.sin(bug.wingPhase) * 3;
        ctx.strokeStyle = `rgba(254, 202, 202, ${bug.alpha * 0.8})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-1, wingSpan);
        ctx.moveTo(0, 0);
        ctx.lineTo(-1, -wingSpan);
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();
    }

    ctx.restore();
  }
}
