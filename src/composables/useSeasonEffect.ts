import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonTheme {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  primaryDarkHover: string;
  bg: string;
  bgDark: string;
}

export interface SeasonMeta {
  label: string;
  icon: string;
  colors: string[];
  theme: SeasonTheme;
}

export const SEASON_META: Record<Season, SeasonMeta> = {
  spring: {
    label: '春',
    icon: 'mdi:flower-tulip-outline',
    colors: ['#f9a8d4', '#f472b6', '#ec4899', '#fda4af', '#fb7185', '#e879f9', '#d946ef', '#c084fc'],
    theme: {
      primary: '#db2777',
      primaryHover: '#ec4899',
      primaryLight: '#fce7f3',
      primaryDark: '#f9a8d4',
      primaryDarkHover: '#f472b6',
      bg: '#fdf2f8',
      bgDark: '#1e1b2e',
    },
  },
  summer: {
    label: '夏',
    icon: 'mdi:weather-rainy',
    colors: ['#93c5fd', '#60a5fa', '#3b82f6', '#a5b4fc', '#818cf8', '#7dd3fc', '#38bdf8', '#67e8f9'],
    theme: {
      primary: '#2563eb',
      primaryHover: '#3b82f6',
      primaryLight: '#dbeafe',
      primaryDark: '#93c5fd',
      primaryDarkHover: '#60a5fa',
      bg: '#eff6ff',
      bgDark: '#1e293b',
    },
  },
  autumn: {
    label: '秋',
    icon: 'mdi:leaf-maple',
    colors: ['#fdba74', '#fb923c', '#f97316', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#a3e635'],
    theme: {
      primary: '#c2410c',
      primaryHover: '#ea580c',
      primaryLight: '#fff7ed',
      primaryDark: '#fdba74',
      primaryDarkHover: '#fb923c',
      bg: '#fffbeb',
      bgDark: '#1c1917',
    },
  },
  winter: {
    label: '冬',
    icon: 'mdi:snowflake',
    colors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#dbeafe', '#bfdbfe', '#c7d2fe', '#e0e7ff', '#f0f9ff'],
    theme: {
      primary: '#0f766e',
      primaryHover: '#0d9488',
      primaryLight: '#f0fdfa',
      primaryDark: '#5eead4',
      primaryDarkHover: '#2dd4bf',
      bg: '#f8f9fa',
      bgDark: '#1e293b',
    },
  },
};

export function getAutoSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// ─── 粒子形状绘制器 ───

interface SeasonParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  colorIndex: number;
  phase: number;
  phaseSpeed: number;
  wobbleAmp: number;
  wobbleSpeed: number;
  wobblePhase: number;
  /** autumn leaf shape variant */
  variant: number;
}

function drawSnowflake(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, color: string, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(size * 0.12, 0.5);
  ctx.lineCap = 'round';

  const arms = 6;
  const len = size;
  for (let i = 0; i < arms; i++) {
    const angle = (Math.PI * 2 * i) / arms;
    const ex = Math.cos(angle) * len;
    const ey = Math.sin(angle) * len;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const branchLen = len * 0.35;
    for (const t of [0.45, 0.7]) {
      const bx = Math.cos(angle) * len * t;
      const by = Math.sin(angle) * len * t;
      for (const dir of [-1, 1]) {
        const ba = angle + dir * 0.55;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(ba) * branchLen, by + Math.sin(ba) * branchLen);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawRaindrop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = opacity;

  const len = size * 2.5;
  const w = size * 0.4;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -len / 2);
  ctx.lineTo(0, len / 2);
  ctx.stroke();

  ctx.restore();
}

function drawPetal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, color: string, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;

  const w = size * 0.6;
  const h = size;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.bezierCurveTo(w, -h * 0.6, w, h * 0.3, 0, h);
  ctx.bezierCurveTo(-w, h * 0.3, -w, -h * 0.6, 0, -h);
  ctx.fill();

  ctx.restore();
}

interface LeafOpts { x: number; y: number; size: number; rotation: number; color: string; opacity: number; variant: number }

function drawLeaf(ctx: CanvasRenderingContext2D, opts: LeafOpts) {
  const { x, y, size, rotation, color, opacity, variant } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;

  const s = size;
  if (variant % 3 === 0) {
    // maple-ish
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.8, -s * 0.6, s * 0.5, s * 0.4, 0, s);
    ctx.bezierCurveTo(-s * 0.5, s * 0.4, -s * 0.8, -s * 0.6, 0, -s);
    ctx.fill();
  } else if (variant % 3 === 1) {
    // oval
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.4, s, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // pointy
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.1);
    ctx.quadraticCurveTo(s * 0.6, 0, 0, s * 0.9);
    ctx.quadraticCurveTo(-s * 0.6, 0, 0, -s * 1.1);
    ctx.fill();
  }

  // vein line
  ctx.strokeStyle = `rgba(0,0,0,0.15)`;
  ctx.lineWidth = Math.max(0.4, size * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.8);
  ctx.lineTo(0, s * 0.7);
  ctx.stroke();

  ctx.restore();
}

// ─── Composable ───

export function useSeasonEffect(canvasRef: Ref<HTMLCanvasElement | null>) {
  const season = ref<Season>(getAutoSeason());

  let particles: SeasonParticle[] = [];
  let ctx: CanvasRenderingContext2D | null = null;
  let animId = 0;
  let mouseX = 0;
  let mouseY = 0;
  let w = 0;
  let h = 0;

  function seasonConfig(s: Season) {
    switch (s) {
      case 'winter':
        return { count: 120, minSize: 3, maxSize: 10, baseVy: 0.4, maxVy: 1.5, vxRange: 0.3 };
      case 'summer':
        return { count: 90, minSize: 2, maxSize: 5, baseVy: 6, maxVy: 14, vxRange: 0.15 };
      case 'spring':
        return { count: 70, minSize: 4, maxSize: 11, baseVy: 0.6, maxVy: 2, vxRange: 0.6 };
      case 'autumn':
        return { count: 60, minSize: 5, maxSize: 13, baseVy: 0.5, maxVy: 1.8, vxRange: 0.8 };
    }
  }

  function createParticles() {
    const cfg = seasonConfig(season.value);
    const colors = SEASON_META[season.value].colors;
    particles = [];
    for (let i = 0; i < cfg.count; i++) {
      particles.push({
        x: Math.random() * (w || window.innerWidth),
        y: Math.random() * (h || window.innerHeight),
        vx: (Math.random() - 0.5) * cfg.vxRange * 2,
        vy: cfg.baseVy + Math.random() * (cfg.maxVy - cfg.baseVy),
        size: cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.3 + Math.random() * 0.6,
        colorIndex: Math.floor(Math.random() * colors.length),
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.01 + Math.random() * 0.03,
        wobbleAmp: 0.3 + Math.random() * 1.2,
        wobbleSpeed: 0.02 + Math.random() * 0.04,
        wobblePhase: Math.random() * Math.PI * 2,
        variant: Math.floor(Math.random() * 3),
      });
    }
  }

  function resetParticle(p: SeasonParticle) {
    const cfg = seasonConfig(season.value);
    p.x = Math.random() * w;
    p.y = -p.size * 3;
    p.vx = (Math.random() - 0.5) * cfg.vxRange * 2;
    p.vy = cfg.baseVy + Math.random() * (cfg.maxVy - cfg.baseVy);
    p.rotation = Math.random() * Math.PI * 2;
  }

  function applyMouseInfluence(p: SeasonParticle) {
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.hypot(dx, dy);
    const radius = 120;
    if (dist < radius && dist > 0) {
      const force = (1 - dist / radius) * 1.5;
      p.x += (dx / dist) * force;
      p.y += (dy / dist) * force;
    }
  }

  function animate() {
    if (!ctx || !canvasRef.value) return;
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    const colors = SEASON_META[season.value].colors;
    const s = season.value;

    for (const p of particles) {
      p.wobblePhase += p.wobbleSpeed;
      p.phase += p.phaseSpeed;
      p.rotation += p.rotationSpeed;

      const wobble = Math.sin(p.wobblePhase) * p.wobbleAmp;
      p.x += p.vx + wobble;
      p.y += p.vy;

      applyMouseInfluence(p);

      if (p.y > h + p.size * 3 || p.x < -50 || p.x > w + 50) {
        resetParticle(p);
      }

      const color = colors[p.colorIndex % colors.length]!;
      const pulsedOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.phase));

      const c = ctx;
      switch (s) {
        case 'winter':
          drawSnowflake(c, p.x, p.y, p.size, p.rotation, color, pulsedOpacity);
          break;
        case 'summer':
          drawRaindrop(c, p.x, p.y, p.size, color, pulsedOpacity * 0.7);
          break;
        case 'spring':
          drawPetal(c, p.x, p.y, p.size, p.rotation, color, pulsedOpacity);
          break;
        case 'autumn':
          drawLeaf(c, { x: p.x, y: p.y, size: p.size, rotation: p.rotation, color, opacity: pulsedOpacity, variant: p.variant });
          break;
      }
    }

    animId = requestAnimationFrame(animate);
  }

  function handleResize() {
    if (!canvasRef.value) return;
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvasRef.value.width = w * dpr;
    canvasRef.value.height = h * dpr;
    canvasRef.value.style.width = w + 'px';
    canvasRef.value.style.height = h + 'px';
    ctx = canvasRef.value.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }

  function handleMouseMove(e: MouseEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  watch(season, () => {
    createParticles();
  });

  onMounted(() => {
    if (!canvasRef.value) return;
    handleResize();
    mouseX = w / 2;
    mouseY = h / 2;
    createParticles();

    globalThis.addEventListener('mousemove', handleMouseMove);
    globalThis.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(animate);
  });

  onUnmounted(() => {
    globalThis.removeEventListener('mousemove', handleMouseMove);
    globalThis.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animId);
  });

  return { season };
}
