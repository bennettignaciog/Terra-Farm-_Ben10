import agroforestryImg from '../assets/images/agroforestry_hills_1790256539972.jpg';
import goldenPrairieImg from '../assets/images/golden_prairie_1790256553793.jpg';
import alpineValleyImg from '../assets/images/alpine_valley_1790256567656.jpg';
import twilightFarmImg from '../assets/images/twilight_farm_1790256584650.jpg';

export interface BackgroundPreset {
  id: string;
  name: string;
  subtitle: string;
  category: 'natural' | 'atmospheric' | 'minimal' | 'custom';
  image: string;
  description: string;
  recommendedSeason?: 'spring' | 'summer' | 'fall' | 'winter';
  vibeColor: string;
  badge: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'agroforestry',
    name: 'Agroforestry Terraces',
    subtitle: 'Misty Polyculture Hills',
    category: 'natural',
    image: agroforestryImg,
    description: 'Rolling green hills with fruit orchards, perennial tree windbreaks, and morning mist.',
    recommendedSeason: 'spring',
    vibeColor: 'emerald',
    badge: '🌿 Spring Fav'
  },
  {
    id: 'golden_prairie',
    name: 'Golden Prairie Hour',
    subtitle: 'Sunlit Polyculture Meadow',
    category: 'natural',
    image: goldenPrairieImg,
    description: 'Warm amber sunset casting rich golden light across biodiverse wildflower fields.',
    recommendedSeason: 'summer',
    vibeColor: 'amber',
    badge: '☀️ Summer Glow'
  },
  {
    id: 'alpine_valley',
    name: 'Alpine Permaculture',
    subtitle: 'Snow Peaks & Pine Windbreaks',
    category: 'natural',
    image: alpineValleyImg,
    description: 'Majestic mountain valley with crystal streams, pine tree borders, and fresh alpine air.',
    recommendedSeason: 'winter',
    vibeColor: 'sky',
    badge: '🏔️ Alpine Vista'
  },
  {
    id: 'twilight_farm',
    name: 'Twilight Firefly Homestead',
    subtitle: 'Dusk Stars & Warm Cabin',
    category: 'atmospheric',
    image: twilightFarmImg,
    description: 'Tranquil twilight sky with evening stars, firefly glimmers, and distant warm farmhouse lights.',
    recommendedSeason: 'fall',
    vibeColor: 'indigo',
    badge: '✨ Dusky Serenity'
  },
  {
    id: 'deep_loam',
    name: 'Living Rhizosphere Matrix',
    subtitle: 'Rich Organic Soil & Mycelium',
    category: 'atmospheric',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    description: 'Aerial panoramic of rich dark loamy regenerative soil with lush hedgerow contours.',
    vibeColor: 'stone',
    badge: '🌱 Earth Deep'
  },
  {
    id: 'misty_orchard',
    name: 'Dawn Forest Edge',
    subtitle: 'Canopy & Agro-Silvopasture',
    category: 'natural',
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1600&q=80',
    description: 'Soft sunlight filtering through mature canopy trees overlooking organic pastures.',
    vibeColor: 'teal',
    badge: '🌲 Silvopasture'
  }
];

export interface BackgroundSettings {
  enabled: boolean;
  applyToCanvas: boolean;
  applyToApp: boolean;
  selectedPresetId: string;
  customImageUrl: string | null;
  canvasOpacity: number; // 0.1 to 1.0 (e.g. 0.8)
  appOpacity: number; // 0.05 to 0.5 (e.g. 0.18)
  blur: number; // 0, 2, 4, 8, 12 px
  autoSeasonMatch: boolean;
  vignette: boolean;
  overlayDarkness: number; // 0.1 to 0.8
}

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  enabled: true,
  applyToCanvas: true,
  applyToApp: false,
  selectedPresetId: 'agroforestry',
  customImageUrl: null,
  canvasOpacity: 0.82,
  appOpacity: 0.18,
  blur: 0,
  autoSeasonMatch: false,
  vignette: true,
  overlayDarkness: 0.45
};

const STORAGE_KEY = 'terrafarm_background_settings_v1';

export function loadBackgroundSettings(): BackgroundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BACKGROUND_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load background settings', e);
  }
  return DEFAULT_BACKGROUND_SETTINGS;
}

export function saveBackgroundSettings(settings: BackgroundSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save background settings', e);
  }
}

export function getActiveBackgroundImage(settings: BackgroundSettings, currentSeason?: string): string {
  if (!settings.enabled) return '';

  if (settings.selectedPresetId === 'custom' && settings.customImageUrl) {
    return settings.customImageUrl;
  }

  if (settings.autoSeasonMatch && currentSeason) {
    const season = currentSeason.toLowerCase();
    const matched = BACKGROUND_PRESETS.find(p => p.recommendedSeason === season);
    if (matched) return matched.image;
  }

  const preset = BACKGROUND_PRESETS.find(p => p.id === settings.selectedPresetId);
  return preset ? preset.image : BACKGROUND_PRESETS[0].image;
}
