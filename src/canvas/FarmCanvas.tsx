import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../state/gameStore';
import { TileState, CropDefinition } from '../simulation/types';
import { CROPS } from '../config/crops';
import { WeatherOverlaySystem } from './WeatherOverlaySystem';
import { getActiveBackgroundImage, BACKGROUND_PRESETS } from '../config/backgroundPresets';
import { Image as ImageIcon, Sparkles, Eye, Layers, Compass, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';
import { sound } from '../audio/sound';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  type: 'bee' | 'butterfly' | 'ladybug' | 'bird' | 'hare' | 'pollen' | 'spore';
  species?: 'monarch' | 'swallowtail' | 'blue_morpho';
  frame: number;
  tileIndex?: number;
  perchTimer?: number;
}

interface LootParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  scale: number;
  cropName: string;
  revenue: number;
  points: number;
  cropTypeId: string;
  age: number;
  maxAge: number;
}

export const FarmCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const farm = useGameStore((state) => state.farm);
  const activeTool = useGameStore((state) => state.activeTool);
  const selectedTileId = useGameStore((state) => state.selectedTileId);
  const setSelectedTileId = useGameStore((state) => state.setSelectedTileId);
  const applyCurrentTool = useGameStore((state) => state.applyCurrentTool);
  const backgroundSettings = useGameStore((state) => state.backgroundSettings);
  const openModal = useGameStore((state) => state.openModal);
  const cycleNextBackground = useGameStore((state) => state.cycleNextBackground);
  const soilXRayMode = useGameStore((state) => state.soilXRayMode);
  const toggleSoilXRayMode = useGameStore((state) => state.toggleSoilXRayMode);
  const harvestLootEvents = useGameStore((state) => state.harvestLootEvents);
  const clearLootEvent = useGameStore((state) => state.clearLootEvent);

  const backgroundSettingsRef = useRef(backgroundSettings);
  backgroundSettingsRef.current = backgroundSettings;

  const soilXRayModeRef = useRef(soilXRayMode);
  soilXRayModeRef.current = soilXRayMode;

  const [hoveredTileIndex, setHoveredTileIndex] = useState<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const draggedTilesRef = useRef<Set<string>>(new Set());

  // Ambient particles & loot particles
  const particlesRef = useRef<Particle[]>([]);
  const lootParticlesRef = useRef<LootParticle[]>([]);
  const weatherOverlayRef = useRef<WeatherOverlaySystem>(new WeatherOverlaySystem());

  // Fullscreen tracking and keyboard shortcut 'F'
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard shortcut: Press 'X' to toggle Soil X-Ray view, 'F' for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'x' || e.key === 'X') {
        toggleSoilXRayMode();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSoilXRayMode, toggleFullscreen]);

  // Convert incoming store harvest loot events to active animated canvas loot
  useEffect(() => {
    if (harvestLootEvents.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const padding = 28;
      const availableSize = Math.min(rect.width - padding * 2, rect.height - padding * 2);
      const tileSize = Math.floor(availableSize / farm.gridSize);
      const gridWidth = tileSize * farm.gridSize;
      const gridHeight = tileSize * farm.gridSize;
      const startX = Math.floor((rect.width - gridWidth) / 2);
      const startY = Math.floor((rect.height - gridHeight) / 2);

      harvestLootEvents.forEach((evt) => {
        const tileX = evt.tileIndex % farm.gridSize;
        const tileY = Math.floor(evt.tileIndex / farm.gridSize);
        const originX = startX + tileX * tileSize + tileSize / 2;
        const originY = startY + tileY * tileSize + tileSize / 2;

        lootParticlesRef.current.push({
          id: evt.id,
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 2.2,
          vy: -3.5 - Math.random() * 2.0, // pop upwards
          alpha: 1.0,
          scale: 0.6,
          cropName: evt.cropName,
          revenue: evt.revenue,
          points: evt.points,
          cropTypeId: evt.cropTypeId,
          age: 0,
          maxAge: 70
        });

        clearLootEvent(evt.id);
      });
    }
  }, [harvestLootEvents, clearLootEvent, farm.gridSize]);

  // Initialize vibrant wildlife and pollinator particles
  useEffect(() => {
    const particles: Particle[] = [];
    // 7 Bees
    for (let i = 0; i < 7; i++) {
      particles.push({
        x: Math.random() * 500,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
        size: 3.5 + Math.random() * 1.5,
        alpha: 1,
        type: 'bee',
        frame: Math.random() * 100,
        perchTimer: 0
      });
    }
    // 5 Diverse Butterflies (Monarch, Blue Morpho, Swallowtail)
    const butterflyTypes: ('monarch' | 'blue_morpho' | 'swallowtail')[] = [
      'monarch',
      'blue_morpho',
      'swallowtail',
      'monarch',
      'blue_morpho'
    ];
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: Math.random() * 500,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: 4.5 + Math.random() * 2,
        alpha: 1,
        type: 'butterfly',
        species: butterflyTypes[i % butterflyTypes.length],
        frame: Math.random() * 100,
        perchTimer: 0
      });
    }
    // 4 Ladybugs crawling on plots
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: Math.random() * 500,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2.8,
        alpha: 1,
        type: 'ladybug',
        frame: 0
      });
    }
    // 3 Birds
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: Math.random() * 500,
        y: Math.random() * 500,
        vx: 1.8 + Math.random() * 1.6,
        vy: (Math.random() - 0.5) * 0.8,
        size: 7,
        alpha: 1,
        type: 'bird',
        frame: Math.random() * 50
      });
    }
    // 1 Field Hare near headland
    particles.push({
      x: 30,
      y: 30,
      vx: 0,
      vy: 0,
      size: 9,
      alpha: 1,
      type: 'hare',
      frame: 0
    });
    particlesRef.current = particles;
  }, []);

  // Compute tile surface soil color from SOM, moisture, and residue
  const getSoilColor = useCallback((som: number, moisture: number, residue: string): string => {
    const factor = Math.min(1, Math.max(0, som / 100));
    const rStart = 205, gStart = 184, bStart = 152;
    const rEnd = 36, gEnd = 20, bEnd = 8;

    let r = Math.round(rStart + (rEnd - rStart) * factor);
    let g = Math.round(gStart + (gEnd - gStart) * factor);
    let b = Math.round(bStart + (bEnd - bStart) * factor);

    const moistFactor = moisture / 100;
    r = Math.round(r * (1 - moistFactor * 0.28));
    g = Math.round(g * (1 - moistFactor * 0.28));
    b = Math.round(b * (1 - moistFactor * 0.28));

    if (residue === 'burnt_ash') {
      return `rgb(${Math.round(r * 0.5)}, ${Math.round(g * 0.5)}, ${Math.round(b * 0.5)})`;
    }

    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  // Main canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let tickCount = 0;

    const render = () => {
      tickCount++;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const isXRay = soilXRayModeRef.current;
      const bgSettings = backgroundSettingsRef.current;

      // -------------------------------------------------------------
      // BACKGROUND CLEAR / DRAWING
      // -------------------------------------------------------------
      if (isXRay) {
        // Deep subterranean geological inspection backdrop
        const subGrad = ctx.createLinearGradient(0, 0, 0, height);
        subGrad.addColorStop(0, '#1c1510'); // upper subsoil
        subGrad.addColorStop(0.4, '#120d09'); // mineral B-horizon
        subGrad.addColorStop(0.85, '#0b0908'); // bedrock
        subGrad.addColorStop(1, '#06131e'); // groundwater table
        ctx.fillStyle = subGrad;
        ctx.fillRect(0, 0, width, height);

        // Subterranean geological depth grid lines
        ctx.strokeStyle = 'rgba(74, 55, 40, 0.25)';
        ctx.lineWidth = 1;
        for (let gy = 40; gy < height; gy += 45) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(width, gy);
          ctx.stroke();
        }
      } else if (bgSettings.enabled && bgSettings.applyToCanvas) {
        // Transparent clear so scenic backdrop shines through
        ctx.clearRect(0, 0, width, height);
      } else {
        // Rich earthen field floor
        ctx.fillStyle = '#141210';
        ctx.fillRect(0, 0, width, height);
      }

      // Calculate grid placement
      const padding = 28;
      const availableSize = Math.min(width - padding * 2, height - padding * 2);
      const tileSize = Math.floor(availableSize / farm.gridSize);
      const gridWidth = tileSize * farm.gridSize;
      const gridHeight = tileSize * farm.gridSize;
      const startX = Math.floor((width - gridWidth) / 2);
      const startY = Math.floor((height - gridHeight) / 2);

      // -------------------------------------------------------------
      // 0. FIELD PERIMETER, HEADLAND & UPGRADES (SURFACE VIEW ONLY)
      // -------------------------------------------------------------
      if (!isXRay) {
        // Turf headland border
        ctx.fillStyle = '#1b281d';
        ctx.fillRect(startX - 22, startY - 22, gridWidth + 44, gridHeight + 44);

        // Access dirt perimeter
        ctx.fillStyle = '#2c221a';
        ctx.fillRect(startX - 12, startY - 12, gridWidth + 24, gridHeight + 24);

        // Rut grooves
        ctx.strokeStyle = 'rgba(28, 20, 14, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX - 8, startY - 8, gridWidth + 16, gridHeight + 16);

        // Corner posts
        const corners = [
          { x: startX - 18, y: startY - 18 },
          { x: startX + gridWidth + 14, y: startY - 18 },
          { x: startX - 18, y: startY + gridHeight + 14 },
          { x: startX + gridWidth + 14, y: startY + gridHeight + 14 }
        ];
        corners.forEach((c) => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(c.x + 3, c.y + 3, 5, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#785438';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#452b18';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Farm Pond Upgrade
        if (farm.unlockedUpgrades.farmPond) {
          const pondX = startX + gridWidth + 12;
          const pondY = startY + 12;
          const pondRadius = 24;
          if (pondX + pondRadius < width) {
            ctx.save();
            ctx.fillStyle = '#263b2a';
            ctx.beginPath();
            ctx.ellipse(pondX, pondY, pondRadius + 4, pondRadius * 0.7 + 3, -0.2, 0, Math.PI * 2);
            ctx.fill();

            const pondGrad = ctx.createRadialGradient(pondX - 4, pondY - 4, 3, pondX, pondY, pondRadius);
            pondGrad.addColorStop(0, '#38bdf8');
            pondGrad.addColorStop(1, '#0284c7');
            ctx.fillStyle = pondGrad;
            ctx.beginPath();
            ctx.ellipse(pondX, pondY, pondRadius, pondRadius * 0.65, -0.2, 0, Math.PI * 2);
            ctx.fill();

            const ripplePhase = (tickCount * 0.05) % (Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(pondX, pondY, 8 + Math.sin(ripplePhase) * 4, 5 + Math.sin(ripplePhase) * 2.5, -0.2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        }

        // Agroforestry Borders Upgrade
        if (farm.unlockedUpgrades.agroforestryBorders) {
          for (let i = 0; i < farm.gridSize; i++) {
            const sway = Math.sin(tickCount * 0.04 + i) * 2;
            const tx = startX + i * tileSize + tileSize / 2;
            const ty = startY - 14;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.ellipse(tx + 4, ty + 6, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#5c3a21';
            ctx.fillRect(tx - 2, ty + 2, 4, 6);

            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.arc(tx + sway, ty - 2, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.arc(tx + sway * 1.2 - 2, ty - 4, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // X-RAY MODE PERIMETER / DEPTH GAUGE
        ctx.fillStyle = 'rgba(10, 8, 7, 0.85)';
        ctx.fillRect(startX - 24, startY - 24, gridWidth + 48, gridHeight + 48);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)'; // violet X-ray scope border
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX - 14, startY - 14, gridWidth + 28, gridHeight + 28);
      }

      // Column & Row coordinate labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = isXRay ? 'rgba(167, 139, 250, 0.7)' : 'rgba(214, 211, 209, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const colLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (let c = 0; c < farm.gridSize; c++) {
        const cx = startX + c * tileSize + tileSize / 2;
        ctx.fillText(colLetters[c] || `${c + 1}`, cx, startY - 16);
      }
      for (let r = 0; r < farm.gridSize; r++) {
        const ry = startY + r * tileSize + tileSize / 2;
        ctx.fillText(`${r + 1}`, startX - 16, ry);
      }

      // -------------------------------------------------------------
      // 1. DRAW GRID TILES (SURFACE VS SUBTERRANEAN X-RAY)
      // -------------------------------------------------------------
      farm.tiles.forEach((tile, index) => {
        const tx = startX + tile.x * tileSize;
        const ty = startY + tile.y * tileSize;

        // -------------------------------------------------------
        // MODE A: SOIL X-RAY (UNDERGROUND ROOTS & MYCELIAL FUNGI)
        // -------------------------------------------------------
        if (isXRay) {
          // 1. Subterranean Stratification Layers
          // Topsoil O/A Horizon (depth proportional to SOM)
          const somRatio = Math.min(1, Math.max(0.1, tile.soilOrganicMatter / 100));
          const topsoilHeight = Math.floor(tileSize * (0.28 + somRatio * 0.35));

          // Topsoil Dark Loam
          const topsoilGrad = ctx.createLinearGradient(tx, ty, tx, ty + topsoilHeight);
          topsoilGrad.addColorStop(0, `rgba(${Math.round(40 * (1 - somRatio * 0.5))}, ${Math.round(25 * (1 - somRatio * 0.5))}, 15, 0.95)`);
          topsoilGrad.addColorStop(1, '#2c1e14');
          ctx.fillStyle = topsoilGrad;
          ctx.fillRect(tx, ty, tileSize, topsoilHeight);

          // Subsoil B-Horizon
          ctx.fillStyle = '#1e140d';
          ctx.fillRect(tx, ty + topsoilHeight, tileSize, tileSize - topsoilHeight);

          // Subsoil Hardpan Compaction Stratum (if compaction > 25)
          if (tile.compaction > 25) {
            const hardpanThickness = Math.min(14, Math.floor((tile.compaction / 100) * 16));
            const hardpanY = ty + topsoilHeight + 2;
            ctx.fillStyle = `rgba(185, 28, 28, ${Math.min(0.75, (tile.compaction - 20) / 75)})`;
            ctx.fillRect(tx + 1, hardpanY, tileSize - 2, hardpanThickness);

            // Dense hardpan hatch lines
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.lineWidth = 1;
            for (let h = tx + 3; h < tx + tileSize - 3; h += 6) {
              ctx.beginPath();
              ctx.moveTo(h, hardpanY);
              ctx.lineTo(h + 4, hardpanY + hardpanThickness);
              ctx.stroke();
            }
          }

          // Groundwater Capillary Moisture Gradient at base
          const moistGrad = ctx.createLinearGradient(tx, ty + tileSize - 8, tx, ty + tileSize);
          moistGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          moistGrad.addColorStop(1, `rgba(56, 189, 248, ${Math.min(0.65, tile.moisture / 120)})`);
          ctx.fillStyle = moistGrad;
          ctx.fillRect(tx, ty + tileSize - 8, tileSize, 8);

          // 2. Mycorrhizal Fungal Hyphae Network
          if (tile.soilOrganicMatter > 25) {
            const fungalStrength = Math.min(1, tile.soilOrganicMatter / 85);
            ctx.strokeStyle = `rgba(167, 243, 208, ${fungalStrength * 0.8})`; // soft glowing mint
            ctx.lineWidth = 1.1;

            const seed = (tile.x * 11 + tile.y * 17);
            const hyphaPulse = (tickCount * 0.04) % 1;

            // Generate branching mycelial web threads
            for (let h = 0; h < 4; h++) {
              const hx = tx + 6 + ((seed + h * 13) % (tileSize - 12));
              const hy = ty + 8 + ((seed + h * 19) % (tileSize - 16));

              ctx.beginPath();
              ctx.moveTo(hx, hy);
              ctx.quadraticCurveTo(
                hx + Math.sin(tickCount * 0.03 + h) * 4,
                hy + 8,
                hx + ((h % 2 === 0 ? 12 : -12)),
                hy + 15
              );
              ctx.stroke();

              // Glowing nutrient point moving through hyphae
              if (tile.soilOrganicMatter > 45) {
                const pulseX = hx + Math.sin(tickCount * 0.03 + h) * 2;
                const pulseY = hy + hyphaPulse * 14;
                ctx.fillStyle = '#6ee7b7';
                ctx.beginPath();
                ctx.arc(pulseX, pulseY, 1.3, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // 3. Underground Active Earthworms & Tunnels
          if (tile.soilOrganicMatter > 30 && tile.earthwormPopulation > 15) {
            const wormX = tx + tileSize * 0.35 + Math.sin(tickCount * 0.05 + index) * 6;
            const wormY = ty + tileSize * 0.55 + Math.cos(tickCount * 0.04 + index) * 4;

            // Earthworm tunnel path (aeration macropore)
            ctx.strokeStyle = 'rgba(12, 8, 5, 0.85)';
            ctx.lineWidth = 4.2;
            ctx.beginPath();
            ctx.moveTo(wormX - 10, wormY + 3);
            ctx.quadraticCurveTo(wormX, wormY, wormX + 12, wormY - 4);
            ctx.stroke();

            // Segmented wriggling pink earthworm
            ctx.strokeStyle = '#f472b6'; // worm pink
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(wormX - 8, wormY + 2);
            ctx.quadraticCurveTo(wormX, wormY - 1, wormX + 10, wormY - 3);
            ctx.stroke();

            // Clitellum saddle band
            ctx.fillStyle = '#fda4af';
            ctx.beginPath();
            ctx.arc(wormX + 1, wormY - 1, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }

          // 4. Crop Root Architecture & Nitrogen Nodules
          if (tile.crop) {
            const cropDef = CROPS[tile.crop.typeId];
            const stage = tile.crop.growthStage;
            const cx = tx + tileSize / 2;
            const surfaceY = ty + 4;
            const maxRootDepth = tileSize * (0.35 + stage * 0.2);

            ctx.save();
            ctx.strokeStyle = '#fef08a'; // root creamy yellow
            ctx.lineWidth = 2.0;

            // Taproot crops (sunflower, Hopi blue corn, amaranth, legumes)
            const isTaproot = 
              tile.crop.typeId === 'sunflower' || 
              tile.crop.typeId === 'heirloom_blue_corn' || 
              tile.crop.typeId === 'heirloom_amaranth' || 
              cropDef?.category === 'legume';

            if (isTaproot) {
              // Deep primary taproot
              ctx.beginPath();
              ctx.moveTo(cx, surfaceY);
              // If high compaction and not deep taproot, root bends
              const compImpact = tile.compaction > 50 && tile.crop.typeId !== 'heirloom_blue_corn' && tile.crop.typeId !== 'sunflower';
              if (compImpact) {
                ctx.quadraticCurveTo(cx - 8, surfaceY + maxRootDepth * 0.5, cx - 14, surfaceY + maxRootDepth * 0.6);
              } else {
                ctx.quadraticCurveTo(cx + 2, surfaceY + maxRootDepth * 0.5, cx, surfaceY + maxRootDepth);
              }
              ctx.stroke();

              // Lateral branch rootlets
              ctx.lineWidth = 1.2;
              for (let l = 1; l <= stage + 1; l++) {
                const ly = surfaceY + (l * (maxRootDepth / (stage + 2)));
                ctx.beginPath();
                ctx.moveTo(cx, ly);
                ctx.lineTo(cx - 8 - l * 2, ly + 6);
                ctx.moveTo(cx, ly + 2);
                ctx.lineTo(cx + 8 + l * 2, ly + 6);
                ctx.stroke();

                // Symbiotic Rhizobia Pink Root Nodules for Legumes!
                if (cropDef?.category === 'legume' || tile.crop.typeId === 'heirloom_cowpea') {
                  ctx.fillStyle = '#f43f5e'; // glowing nitrogen nodule pink
                  ctx.beginPath();
                  ctx.arc(cx - 7 - l * 2, ly + 5, 2.2, 0, Math.PI * 2);
                  ctx.arc(cx + 7 + l * 2, ly + 5, 2.2, 0, Math.PI * 2);
                  ctx.fill();

                  // Subtle nitrogen glow aura
                  ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
                  ctx.beginPath();
                  ctx.arc(cx - 7 - l * 2, ly + 5, 4.5, 0, Math.PI * 2);
                  ctx.arc(cx + 7 + l * 2, ly + 5, 4.5, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            } else {
              // Fibrous root network (wheat, corn, millet, cover crop)
              for (let f = -2; f <= 2; f++) {
                ctx.beginPath();
                ctx.moveTo(cx, surfaceY);
                ctx.quadraticCurveTo(cx + f * 5, surfaceY + maxRootDepth * 0.5, cx + f * 11, surfaceY + maxRootDepth * 0.85);
                ctx.stroke();
              }
            }

            // Small stem above ground
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx, surfaceY);
            ctx.lineTo(cx, surfaceY - 6);
            ctx.stroke();

            ctx.restore();
          }

        } else {
          // -------------------------------------------------------
          // MODE B: REGULAR FIELD SURFACE VIEW
          // -------------------------------------------------------
          // 1. Soil Base Color
          const soilColor = getSoilColor(tile.soilOrganicMatter, tile.moisture, tile.residue);
          ctx.fillStyle = soilColor;
          ctx.fillRect(tx, ty, tileSize, tileSize);

          // 1B. Soil 3D Furrows & Texture
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(tx, ty, tileSize, 1.5);
          ctx.fillRect(tx, ty, 1.5, tileSize);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.fillRect(tx, ty + tileSize - 1.5, tileSize, 1.5);
          ctx.fillRect(tx + tileSize - 1.5, ty, 1.5, tileSize);

          // Furrow grooves
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tx + 4, ty + tileSize * 0.33);
          ctx.lineTo(tx + tileSize - 4, ty + tileSize * 0.33);
          ctx.moveTo(tx + 4, ty + tileSize * 0.66);
          ctx.lineTo(tx + tileSize - 4, ty + tileSize * 0.66);
          ctx.stroke();

          // Granular humus texture
          if (tile.soilOrganicMatter > 35) {
            ctx.fillStyle = 'rgba(20, 12, 6, 0.35)';
            const seed = (tile.x * 7 + tile.y * 13);
            for (let g = 0; g < 5; g++) {
              const gx = tx + 6 + ((seed + g * 17) % (tileSize - 12));
              const gy = ty + 6 + ((seed + g * 23) % (tileSize - 12));
              ctx.fillRect(gx, gy, 1.5, 1.5);
            }
          }

          // Dry Cracks (moisture < 28)
          if (tile.moisture < 28) {
            ctx.strokeStyle = 'rgba(40, 25, 15, 0.5)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(tx + tileSize * 0.2, ty + tileSize * 0.2);
            ctx.lineTo(tx + tileSize * 0.35, ty + tileSize * 0.45);
            ctx.lineTo(tx + tileSize * 0.3, ty + tileSize * 0.7);
            ctx.moveTo(tx + tileSize * 0.7, ty + tileSize * 0.3);
            ctx.lineTo(tx + tileSize * 0.55, ty + tileSize * 0.5);
            ctx.lineTo(tx + tileSize * 0.65, ty + tileSize * 0.8);
            ctx.stroke();
          }

          // Mulch Straw Residue
          if (tile.residue === 'mulch') {
            ctx.strokeStyle = 'rgba(245, 208, 120, 0.85)';
            ctx.lineWidth = 1.4;
            for (let s = 0; s < 7; s++) {
              const rx = tx + 6 + (s * 9) % (tileSize - 12);
              const ry = ty + 6 + ((s * 13) % (tileSize - 12));
              ctx.beginPath();
              ctx.moveTo(rx, ry);
              ctx.lineTo(rx + 8, ry + 4);
              ctx.stroke();
            }
          } else if (tile.residue === 'stubble') {
            ctx.strokeStyle = 'rgba(163, 137, 85, 0.75)';
            ctx.lineWidth = 2.0;
            for (let s = 0; s < 5; s++) {
              const rx = tx + 8 + (s * 10);
              const ry = ty + tileSize - 8;
              ctx.beginPath();
              ctx.moveTo(rx, ry);
              ctx.lineTo(rx, ry - 7);
              ctx.stroke();
            }
          } else if (tile.residue === 'burnt_ash') {
            ctx.fillStyle = 'rgba(24, 24, 27, 0.65)';
            for (let a = 0; a < 7; a++) {
              const ax = tx + 6 + (a * 11) % (tileSize - 12);
              const ay = ty + 6 + (a * 9) % (tileSize - 12);
              ctx.fillRect(ax, ay, 3, 3);
            }
          }

          // Drip irrigation line
          if (tile.irrigation === 'drip') {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.lineWidth = 1.6;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(tx, ty + tileSize / 2);
            ctx.lineTo(tx + tileSize, ty + tileSize / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(tx + tileSize / 2, ty + tileSize / 2, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Earthworm surface activity
          if (tile.soilOrganicMatter > 38 && tile.earthwormPopulation > 25 && tile.residue !== 'burnt_ash') {
            const wormVisible = Math.sin(tickCount * 0.04 + index) > 0.2;
            if (wormVisible) {
              const wx = tx + tileSize * 0.7;
              const wy = ty + tileSize * 0.75;
              ctx.strokeStyle = '#f472b6';
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.arc(wx, wy, 4, 0, Math.PI);
              ctx.stroke();
            }
          }

          // -------------------------------------------------------
          // CROPS RENDERING (WITH MULTI-JOINT PLANT SWAY & HEIRLOOMS)
          // -------------------------------------------------------
          if (tile.crop) {
            const cropDef = CROPS[tile.crop.typeId];
            const stage = tile.crop.growthStage;
            const isStressed = tile.crop.health < 45;

            // Multi-joint organic wind sway responding to weather
            const windIntensity = farm.currentWeather === 'wind' ? 3.5 : farm.currentWeather === 'drought' ? 0.6 : 1.6;
            const windSway = Math.sin(tickCount * 0.07 + tile.x * 0.8) * windIntensity;
            const windSwayTop = Math.sin(tickCount * 0.07 + tile.x * 0.8 + 0.5) * windIntensity * 1.5;

            const cx = tx + tileSize / 2;
            const cy = ty + tileSize / 2;

            // Cast plant shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctx.beginPath();
            ctx.ellipse(cx, ty + tileSize - 8, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            if (isStressed) {
              ctx.filter = 'sepia(0.55) brightness(0.82)';
            }

            if (stage === 0) {
              // Seedling
              ctx.fillStyle = '#84cc16';
              ctx.beginPath();
              ctx.arc(cx - 6, cy, 2.2, 0, Math.PI * 2);
              ctx.arc(cx + 6, cy, 2.2, 0, Math.PI * 2);
              ctx.fill();
            } else if (stage === 1) {
              // Sprout
              ctx.strokeStyle = '#65a30d';
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.moveTo(cx, cy + 8);
              ctx.quadraticCurveTo(cx + windSway * 0.5, cy + 2, cx + windSway, cy - 4);
              ctx.stroke();

              ctx.fillStyle = '#84cc16';
              ctx.beginPath();
              ctx.ellipse(cx - 4 + windSway, cy - 4, 5, 2.5, -Math.PI / 4, 0, Math.PI * 2);
              ctx.ellipse(cx + 4 + windSway, cy - 4, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
              ctx.fill();
            } else if (stage === 2) {
              // Vegetative bush
              const leafColor = 
                tile.crop.typeId === 'heirloom_amaranth' ? '#a21caf' :
                cropDef?.category === 'legume' ? '#15803d' : '#22c55e';

              ctx.fillStyle = leafColor;
              ctx.strokeStyle = '#14532d';
              ctx.lineWidth = 2.8;

              // Stalk with multi-joint curve
              ctx.beginPath();
              ctx.moveTo(cx, cy + 12);
              ctx.quadraticCurveTo(cx + windSway, cy, cx + windSwayTop, cy - 10);
              ctx.stroke();

              // Foliage
              ctx.fillStyle = '#166534';
              ctx.beginPath();
              ctx.arc(cx - 8 + windSway, cy - 2, 6, 0, Math.PI * 2);
              ctx.arc(cx + 8 + windSway, cy - 2, 6, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = leafColor;
              ctx.beginPath();
              ctx.arc(cx + windSwayTop, cy - 12, 7.5, 0, Math.PI * 2);
              ctx.fill();
            } else if (stage === 3) {
              // Mature Stage (Ready to Harvest!)
              const tid = tile.crop.typeId;

              if (tid === 'heirloom_amaranth') {
                // Majestic Purple Highland Amaranth plume
                ctx.strokeStyle = '#86198f';
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                ctx.moveTo(cx, cy + 14);
                ctx.quadraticCurveTo(cx + windSway, cy, cx + windSwayTop, cy - 14);
                ctx.stroke();

                // Velvet magenta plumes
                ctx.fillStyle = '#c026d3';
                ctx.beginPath();
                ctx.ellipse(cx + windSwayTop, cy - 15, 6, 12, 0.1, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#e879f9'; // sparkling amaranth blossom highlight
                ctx.beginPath();
                ctx.ellipse(cx + windSwayTop - 2, cy - 17, 3.5, 7, -0.15, 0, Math.PI * 2);
                ctx.fill();
              } else if (tid === 'heirloom_blue_corn') {
                // Hopi Blue Heritage Maize
                ctx.strokeStyle = '#312e81'; // dark indigo stalk
                ctx.lineWidth = 3.8;
                ctx.beginPath();
                ctx.moveTo(cx, cy + 16);
                ctx.lineTo(cx + windSwayTop, cy - 16);
                ctx.stroke();

                // Sapphire blue corn ear
                ctx.fillStyle = '#2563eb';
                ctx.beginPath();
                ctx.ellipse(cx + 6 + windSwayTop, cy - 4, 4.5, 10, 0.35, 0, Math.PI * 2);
                ctx.fill();

                // Blue kernels
                ctx.fillStyle = '#1e3a8a';
                ctx.beginPath();
                ctx.arc(cx + 5 + windSwayTop, cy - 4, 2, 0, Math.PI * 2);
                ctx.fill();
              } else if (tid === 'heirloom_cowpea') {
                // Crimson Velvet Cowpea with dangling red pods
                ctx.strokeStyle = '#15803d';
                ctx.lineWidth = 2.8;
                ctx.beginPath();
                ctx.arc(cx + windSway, cy, 12, 0, Math.PI * 2);
                ctx.stroke();

                // Lavender flower
                ctx.fillStyle = '#c084fc';
                ctx.beginPath();
                ctx.arc(cx + windSway, cy - 8, 4, 0, Math.PI * 2);
                ctx.fill();

                // Crimson pods
                ctx.fillStyle = '#be123c';
                ctx.beginPath();
                ctx.ellipse(cx - 5 + windSway, cy + 4, 2.5, 7, 0.4, 0, Math.PI * 2);
                ctx.ellipse(cx + 5 + windSway, cy + 4, 2.5, 7, -0.4, 0, Math.PI * 2);
                ctx.fill();
              } else if (tid === 'heirloom_borage') {
                // Starflower Borage: Celestial blue star blossoms
                ctx.strokeStyle = '#065f46';
                ctx.lineWidth = 2.6;
                ctx.beginPath();
                ctx.moveTo(cx, cy + 12);
                ctx.lineTo(cx + windSwayTop, cy - 8);
                ctx.stroke();

                // Star petals
                ctx.fillStyle = '#38bdf8';
                for (let p = 0; p < 5; p++) {
                  const angle = (p / 5) * Math.PI * 2 - Math.PI / 2;
                  const px = cx + windSwayTop + Math.cos(angle) * 8;
                  const py = cy - 8 + Math.sin(angle) * 8;
                  ctx.beginPath();
                  ctx.arc(px, py, 3.2, 0, Math.PI * 2);
                  ctx.fill();
                }
                // Black central cone
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(cx + windSwayTop, cy - 8, 2.5, 0, Math.PI * 2);
                ctx.fill();
              } else if (tid === 'wheat') {
                // Golden wheat ears
                ctx.strokeStyle = '#b45309';
                ctx.lineWidth = 2.4;
                for (let w = -1; w <= 1; w++) {
                  const wx = cx + w * 9;
                  ctx.beginPath();
                  ctx.moveTo(wx, cy + 14);
                  ctx.lineTo(wx + windSwayTop, cy - 10);
                  ctx.stroke();

                  ctx.fillStyle = '#facc15';
                  ctx.beginPath();
                  ctx.ellipse(wx + windSwayTop, cy - 12, 4.5, 9, 0.1 * w, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (tid === 'corn') {
                // Standard maize
                ctx.strokeStyle = '#15803d';
                ctx.lineWidth = 3.8;
                ctx.beginPath();
                ctx.moveTo(cx, cy + 16);
                ctx.lineTo(cx + windSwayTop, cy - 16);
                ctx.stroke();

                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.ellipse(cx + 5 + windSwayTop, cy - 4, 4.5, 10, 0.35, 0, Math.PI * 2);
                ctx.fill();
              } else if (tid === 'sunflower') {
                // Sunflower
                ctx.strokeStyle = '#166534';
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                ctx.moveTo(cx, cy + 16);
                ctx.lineTo(cx + windSwayTop, cy - 10);
                ctx.stroke();

                ctx.fillStyle = '#451a03';
                ctx.beginPath();
                ctx.arc(cx + windSwayTop, cy - 12, 6.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#f59e0b';
                for (let p = 0; p < 8; p++) {
                  const angle = (p / 8) * Math.PI * 2;
                  const px = cx + windSwayTop + Math.cos(angle) * 10;
                  const py = cy - 12 + Math.sin(angle) * 10;
                  ctx.beginPath();
                  ctx.arc(px, py, 3.8, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else {
                // Trap crop / cover crop
                ctx.fillStyle = '#ea580c';
                for (let f = 0; f < 3; f++) {
                  const fx = cx + (f - 1) * 10 + windSway;
                  const fy = cy - 6 + (f % 2) * 6;
                  ctx.beginPath();
                  ctx.arc(fx, fy, 5.5, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            }

            ctx.restore();

            // Harvest beacon halo
            if (stage === 3) {
              ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(cx, cy - 6, 17 + Math.sin(tickCount * 0.1) * 2, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Wilting alert dot
            if (isStressed) {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(tx + tileSize - 8, ty + 8, 4.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Tile border
        ctx.strokeStyle = isXRay ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, tileSize, tileSize);

        // Tactical Selector & Hover
        if (tile.id === selectedTileId) {
          ctx.strokeStyle = isXRay ? '#a78bfa' : '#10b981';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(tx + 1, ty + 1, tileSize - 2, tileSize - 2);

          const reticleLen = 7;
          ctx.strokeStyle = isXRay ? '#c4b5fd' : '#34d399';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx + 1, ty + 1 + reticleLen);
          ctx.lineTo(tx + 1, ty + 1);
          ctx.lineTo(tx + 1 + reticleLen, ty + 1);
          ctx.moveTo(tx + tileSize - 1 - reticleLen, ty + 1);
          ctx.lineTo(tx + tileSize - 1, ty + 1);
          ctx.lineTo(tx + tileSize - 1, ty + 1 + reticleLen);
          ctx.moveTo(tx + 1, ty + tileSize - 1 - reticleLen);
          ctx.lineTo(tx + 1, ty + tileSize - 1);
          ctx.lineTo(tx + 1 + reticleLen, ty + tileSize - 1);
          ctx.moveTo(tx + tileSize - 1 - reticleLen, ty + tileSize - 1);
          ctx.lineTo(tx + tileSize - 1, ty + tileSize - 1);
          ctx.lineTo(tx + tileSize - 1, ty + tileSize - 1 - reticleLen);
          ctx.stroke();

          ctx.fillStyle = isXRay ? 'rgba(76, 29, 149, 0.9)' : 'rgba(6, 78, 59, 0.9)';
          ctx.fillRect(tx + 3, ty + 3, 20, 12);
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = isXRay ? '#ddd6fe' : '#6ee7b7';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${colLetters[tile.x]}${tile.y + 1}`, tx + 13, ty + 9);
        } else if (index === hoveredTileIndex) {
          ctx.fillStyle = isXRay ? 'rgba(167, 139, 250, 0.15)' : 'rgba(255, 255, 255, 0.12)';
          ctx.fillRect(tx, ty, tileSize, tileSize);
          ctx.strokeStyle = isXRay ? 'rgba(167, 139, 250, 0.6)' : 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(tx, ty, tileSize, tileSize);
        }
      });

      // -------------------------------------------------------------
      // 2. AMBIENT WILDLIFE & POLLINATORS (SURFACE VIEW ONLY)
      // -------------------------------------------------------------
      if (!isXRay) {
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < startX) p.x = startX + gridWidth;
          if (p.x > startX + gridWidth) p.x = startX;
          if (p.y < startY) p.y = startY + gridHeight;
          if (p.y > startY + gridHeight) p.y = startY;

          p.frame += 0.2;

          if (p.type === 'bee') {
            // Bee with yellow-black stripes and fluttering translucent wings
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size, p.size * 0.75, 0, 0, Math.PI * 2);
            ctx.fill();

            // Black stripes
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(p.x - 1, p.y - p.size * 0.7, 1.8, p.size * 1.4);

            // Fluttering wings
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y - 2, 3, 2, Math.sin(p.frame) * 0.6, 0, Math.PI * 2);
            ctx.stroke();

            // Golden pollen sparkle trailing behind
            if (tickCount % 4 === 0) {
              ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
              ctx.beginPath();
              ctx.arc(p.x - p.vx * 3, p.y - p.vy * 3, 1.2, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (p.type === 'butterfly') {
            const wingAngle = Math.sin(p.frame) * 0.5;

            if (p.species === 'monarch') {
              // Monarch Orange & Black Wings
              ctx.fillStyle = '#f97316';
              ctx.beginPath();
              ctx.ellipse(p.x - 3, p.y, p.size, p.size * 0.8, wingAngle, 0, Math.PI * 2);
              ctx.ellipse(p.x + 3, p.y, p.size, p.size * 0.8, -wingAngle, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 1;
              ctx.stroke();
            } else if (p.species === 'swallowtail') {
              // Lemon Yellow & Black Swallowtail
              ctx.fillStyle = '#facc15';
              ctx.beginPath();
              ctx.ellipse(p.x - 3, p.y, p.size, p.size * 0.8, wingAngle, 0, Math.PI * 2);
              ctx.ellipse(p.x + 3, p.y, p.size, p.size * 0.8, -wingAngle, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Blue Morpho
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.ellipse(p.x - 3, p.y, p.size, p.size * 0.8, wingAngle, 0, Math.PI * 2);
              ctx.ellipse(p.x + 3, p.y, p.size, p.size * 0.8, -wingAngle, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (p.type === 'ladybug') {
            // Spotted red ladybug crawling
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#18181b';
            ctx.beginPath();
            ctx.arc(p.x - 1, p.y - 1, 0.8, 0, Math.PI * 2);
            ctx.arc(p.x + 1, p.y + 1, 0.8, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'bird') {
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const wingY = Math.sin(p.frame) * 4;
            ctx.moveTo(p.x - 6, p.y + wingY);
            ctx.quadraticCurveTo(p.x - 3, p.y - 2, p.x, p.y);
            ctx.quadraticCurveTo(p.x + 3, p.y - 2, p.x + 6, p.y + wingY);
            ctx.stroke();
          }
        });
      }

      // -------------------------------------------------------------
      // 3. TACTILE HARVEST LOOT PARTICLES & BOUNCING COINS
      // -------------------------------------------------------------
      for (let i = lootParticlesRef.current.length - 1; i >= 0; i--) {
        const lp = lootParticlesRef.current[i];
        lp.age++;
        lp.x += lp.vx;
        lp.y += lp.vy;
        lp.vy += 0.08; // subtle gravity

        const progress = lp.age / lp.maxAge;
        lp.alpha = Math.max(0, 1 - progress);
        lp.scale = Math.min(1.2, 0.6 + progress * 0.8);

        ctx.save();
        ctx.globalAlpha = lp.alpha;

        // Floating Gold Cash Badge
        ctx.fillStyle = 'rgba(234, 179, 8, 0.95)';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        const badgeW = 60;
        const badgeH = 20;
        ctx.beginPath();
        ctx.roundRect(lp.x - badgeW / 2, lp.y - 10, badgeW, badgeH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#1c1917';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+$${lp.revenue}`, lp.x, lp.y);

        // Floating EcoPoints Green Sparkle Star above
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`+${lp.points} Eco ✨`, lp.x, lp.y - 18);

        ctx.restore();

        if (lp.age >= lp.maxAge) {
          lootParticlesRef.current.splice(i, 1);
        }
      }

      // Weather Overlay System
      weatherOverlayRef.current.setDimensions(width, height);
      weatherOverlayRef.current.update(
        farm.currentWeather,
        Boolean(farm.unlockedUpgrades.agroforestryBorders)
      );
      weatherOverlayRef.current.render(
        ctx,
        farm.currentWeather,
        Boolean(farm.unlockedUpgrades.agroforestryBorders)
      );

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [farm, selectedTileId, hoveredTileIndex, getSoilColor]);

  // Coordinate mapping helper
  const getTileAtPosition = (clientX: number, clientY: number): { index: number; tile: TileState } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const padding = 28;
    const availableSize = Math.min(rect.width - padding * 2, rect.height - padding * 2);
    const tileSize = Math.floor(availableSize / farm.gridSize);
    const gridWidth = tileSize * farm.gridSize;
    const gridHeight = tileSize * farm.gridSize;
    const startX = Math.floor((rect.width - gridWidth) / 2);
    const startY = Math.floor((rect.height - gridHeight) / 2);

    if (x < startX || x >= startX + gridWidth || y < startY || y >= startY + gridHeight) {
      return null;
    }

    const tileX = Math.floor((x - startX) / tileSize);
    const tileY = Math.floor((y - startY) / tileSize);
    const index = tileY * farm.gridSize + tileX;

    if (index >= 0 && index < farm.tiles.length) {
      return { index, tile: farm.tiles[index] };
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    draggedTilesRef.current.clear();
    const target = getTileAtPosition(e.clientX, e.clientY);
    if (!target) return;

    if (activeTool.type === 'inspect') {
      setSelectedTileId(target.tile.id);
    } else {
      draggedTilesRef.current.add(target.tile.id);
      applyCurrentTool(target.tile.id);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const target = getTileAtPosition(e.clientX, e.clientY);
    setHoveredTileIndex(target ? target.index : null);

    if (isDraggingRef.current && target && activeTool.type !== 'inspect') {
      if (!draggedTilesRef.current.has(target.tile.id)) {
        draggedTilesRef.current.add(target.tile.id);
        applyCurrentTool(target.tile.id);
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    draggedTilesRef.current.clear();
  };

  const activeBgImg = getActiveBackgroundImage(backgroundSettings, farm.season);
  const currentPreset = BACKGROUND_PRESETS.find(p => p.id === backgroundSettings.selectedPresetId);

  // Quick metric values for guaranteed fullscreen HUD display
  const totalTiles = farm.tiles.length || 1;
  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / totalTiles;
  const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / totalTiles;
  const avgPests = farm.tiles.reduce((acc, t) => acc + t.pestPressure, 0) / totalTiles;
  const avgCompaction = farm.tiles.reduce((acc, t) => acc + t.compaction, 0) / totalTiles;
  const avgSalinity = farm.tiles.reduce((acc, t) => acc + t.salinity, 0) / totalTiles;
  const avgMoisture = farm.tiles.reduce((acc, t) => acc + t.moisture, 0) / totalTiles;

  const currentSoilHealth = Math.min(100, Math.max(0, Math.round(
    (avgSOM * 0.45) + ((100 - avgCompaction) * 0.25) + ((100 - avgSalinity) * 0.15) + (avgBeneficials * 0.15)
  )));

  const currentWaterIndex = Math.min(100, Math.max(0, Math.round(
    ((30 - farm.groundwaterDepth) / 25 * 50) + (avgMoisture * 0.5)
  )));

  const currentBioIndex = Math.min(100, Math.max(0, Math.round(
    (avgBeneficials * 0.5) + ((100 - avgPests) * 0.3) + 
    ((farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0) / totalTiles) * 0.2)
  )));

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full flex items-center justify-center overflow-hidden touch-none select-none rounded-xl bg-stone-950 border border-stone-800/90 shadow-2xl transition-all ${
        isFullscreen ? 'h-[60vh] min-h-[500px]' : 'h-full min-h-[380px] md:min-h-[480px]'
      }`}
    >
      {/* Scenic Agroecological Field Backdrop Image (only in surface view) */}
      {!soilXRayMode && backgroundSettings.enabled && backgroundSettings.applyToCanvas && activeBgImg && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src={activeBgImg}
            alt="Farm Landscape Backdrop"
            className="w-full h-full object-cover transition-all duration-700 select-none pointer-events-none scale-105"
            style={{
              opacity: backgroundSettings.canvasOpacity,
              filter: backgroundSettings.blur > 0 ? `blur(${backgroundSettings.blur}px)` : undefined,
            }}
          />
          <div 
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundColor: `rgba(16, 14, 12, ${backgroundSettings.overlayDarkness})`,
            }}
          />
          {backgroundSettings.vignette && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, transparent 35%, rgba(8, 7, 6, 0.75) 100%)',
              }}
            />
          )}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block relative z-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          handlePointerUp();
          setHoveredTileIndex(null);
        }}
      />

      {/* Fullscreen Floating KPI HUD: Cash, Soil Health, Water Index, Biodiversity */}
      {isFullscreen && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-stone-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-800 shadow-2xl">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 pr-2 border-r border-stone-800" title="Cash Balance">
            <span className="text-emerald-400">💵</span>
            <span>${farm.cashBalance.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 pr-2 border-r border-stone-800" title="Soil Health Index">
            <span className="text-amber-400">🌱</span>
            <span>{currentSoilHealth}<span className="text-[10px] text-stone-500 font-normal">/100</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-300 pr-2 border-r border-stone-800" title={`Water Table Index (${farm.groundwaterDepth.toFixed(1)}m aquifer depth)`}>
            <span className="text-sky-400">💧</span>
            <span>{currentWaterIndex}<span className="text-[10px] text-stone-500 font-normal">/100</span></span>
          </div>
          <div 
            onClick={() => openModal('eco_impact')}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300 hover:text-purple-200 cursor-pointer transition-colors" 
            title="Biodiversity Index (Click to open Ecological Impact)"
          >
            <span className="text-purple-400">🦋</span>
            <span>{currentBioIndex}<span className="text-[10px] text-stone-500 font-normal">/100</span></span>
          </div>
        </div>
      )}

      {/* Floating active weather banner */}
      {farm.activeWeatherEvent && !soilXRayMode && (
        <div className={`absolute ${isFullscreen ? 'top-12' : 'top-3'} left-1/2 -translate-x-1/2 z-20 bg-amber-500/90 text-stone-950 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 backdrop-blur-md pointer-events-none ring-1 ring-amber-400/50 animate-pulse`}>
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>⚠️ {farm.activeWeatherEvent.description}</span>
          <span className="bg-stone-950/20 px-1.5 py-0.5 rounded font-mono text-[10px]">
            {farm.activeWeatherEvent.daysRemaining}d left
          </span>
        </div>
      )}

      {/* Top Left Toolbar: Soil X-Ray Toggle & Scenery Settings Stacked & Aligned */}
      <div className="absolute top-2.5 left-3 z-20 flex flex-col items-stretch gap-1.5 min-w-[190px]">
        {/* SOIL X-RAY / SUBTERRANEAN VIEW TOGGLE BUTTON */}
        <button
          onClick={toggleSoilXRayMode}
          className={`h-8 w-full flex items-center justify-between px-3 rounded-lg text-xs font-bold transition-all shadow-lg backdrop-blur-md active:scale-95 border ${
            soilXRayMode
              ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 ring-2 ring-purple-500/50'
              : 'bg-stone-950/85 hover:bg-stone-900 text-purple-300 hover:text-purple-200 border-purple-500/40 hover:border-purple-400'
          }`}
          title="Toggle Soil X-Ray Mode: View subterranean roots, mycorrhizal fungi & earthworms (Hotkey: X)"
        >
          <div className="flex items-center gap-2">
            <Layers className={`w-3.5 h-3.5 ${soilXRayMode ? 'animate-pulse text-white' : 'text-purple-400'}`} />
            <span>{soilXRayMode ? 'Soil X-Ray: On' : 'Soil X-Ray View'}</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-200 border border-purple-700/50">
            X
          </span>
        </button>

        {/* Scenery Options Button - Stacked directly under Soil X-Ray & Symmetrically Aligned */}
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={() => openModal('background')}
            className="flex-1 h-8 flex items-center justify-between px-3 rounded-lg text-xs font-medium bg-stone-950/85 hover:bg-stone-900 text-stone-200 hover:text-white border border-stone-800 hover:border-emerald-500/50 shadow-md backdrop-blur-md transition-all active:scale-95 group"
            title="Customize farm scenery and background images"
          >
            <div className="flex items-center gap-2 truncate">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-semibold text-stone-300">Scenery:</span>
              <span className="text-emerald-300 font-bold truncate max-w-[95px]">
                {backgroundSettings.enabled
                  ? (currentPreset?.name || (backgroundSettings.selectedPresetId === 'custom' ? 'Custom' : 'Active'))
                  : 'Off'}
              </span>
            </div>
          </button>

          {backgroundSettings.enabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                cycleNextBackground();
              }}
              className="h-8 w-8 shrink-0 rounded-lg bg-stone-950/85 hover:bg-stone-900 text-stone-400 hover:text-emerald-300 border border-stone-800 hover:border-emerald-500/50 shadow-md backdrop-blur-md inline-flex items-center justify-center transition-all active:scale-95"
              title="Cycle to next landscape background"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Top Right Canvas HUD: Sector Indicator & Fullscreen Button */}
      <div className="absolute top-2.5 right-3 z-20 flex items-center gap-1.5">
        <div className="h-8 text-[10px] text-stone-300 font-mono pointer-events-none bg-stone-950/85 backdrop-blur-md px-2.5 rounded-lg border border-stone-800/90 shadow-md flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${soilXRayMode ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'}`} />
          <span>{soilXRayMode ? 'SUBTERRANEAN BIOME 6×6' : 'FIELD SECTOR 6×6'}</span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="h-8 px-2.5 rounded-lg bg-stone-950/85 hover:bg-stone-900 text-stone-300 hover:text-white border border-stone-800 hover:border-stone-750 shadow-md backdrop-blur-md inline-flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95 group"
          title={isFullscreen ? 'Exit Fullscreen (Hotkey: F)' : 'Fullscreen View (Hotkey: F)'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Exit Full</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Fullscreen</span>
            </>
          )}
          <kbd className="hidden md:inline-block text-[9px] font-mono px-1 py-0.2 bg-stone-900 rounded text-stone-400 border border-stone-700">F</kbd>
        </button>
      </div>

      {/* SUBTERRANEAN X-RAY BIOLOGICAL HUD LEGEND */}
      {soilXRayMode ? (
        <div className="absolute bottom-2.5 left-3 right-3 z-20 text-[10px] sm:text-[11px] text-stone-300 pointer-events-none bg-stone-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/40 shadow-xl flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-4 flex-nowrap whitespace-nowrap">
            <span className="font-bold text-purple-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Subterranean Cross-Section:</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
              <span>🌸 Rhizobia Nodules (N-Fixation)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
              <span>🕸️ Mycorrhizal Fungi (P & Water)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm" />
              <span>🧱 Subsoil Hardpan Barrier</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-sm" />
              <span>🪱 Earthworm Macropores</span>
            </span>
          </div>

          <div className="text-[10px] font-mono text-purple-400 hidden lg:inline">
            Press X to return
          </div>
        </div>
      ) : (
        /* Regular Field Interactive Hint */
        <div className="absolute bottom-2.5 left-3 z-20 text-[11px] text-stone-300 font-medium pointer-events-none bg-stone-900/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-stone-800/90 flex items-center gap-2 shadow-sm">
          <span className="text-emerald-400">●</span>
          <span>{activeTool.type === 'inspect' ? 'Click tile to inspect soil & crop genetics' : 'Click or drag across plots to apply tool'}</span>
        </div>
      )}
    </div>
  );
};
