import React, { useState, useRef } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  BACKGROUND_PRESETS, 
  BackgroundPreset, 
  DEFAULT_BACKGROUND_SETTINGS 
} from '../config/backgroundPresets';
import { 
  Image as ImageIcon, 
  X, 
  Check, 
  Sliders, 
  Sparkles, 
  Upload, 
  Link as LinkIcon, 
  RotateCcw, 
  Eye, 
  Sun, 
  Layers, 
  Monitor, 
  Grid3X3,
  Calendar
} from 'lucide-react';

export const BackgroundOptionsModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const backgroundSettings = useGameStore((state) => state.backgroundSettings);
  const updateBackgroundSettings = useGameStore((state) => state.updateBackgroundSettings);
  const farmSeason = useGameStore((state) => state.farm.season);
  const showNotification = useGameStore((state) => state.showNotification);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'adjust'>('presets');

  if (activeModal !== 'background') return null;

  const handleSelectPreset = (preset: BackgroundPreset) => {
    updateBackgroundSettings({
      enabled: true,
      selectedPresetId: preset.id
    });
    showNotification(`Backdrop set to "${preset.name}"`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please upload an image file (JPG, PNG, WebP).', 'warning');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showNotification('Image size is too large (max 8MB).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateBackgroundSettings({
          enabled: true,
          selectedPresetId: 'custom',
          customImageUrl: dataUrl
        });
        showNotification('Custom background image uploaded!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      updateBackgroundSettings({
        enabled: true,
        selectedPresetId: 'custom',
        customImageUrl: trimmed
      });
      setUrlInput('');
      showNotification('Custom background URL applied!', 'success');
    } catch {
      showNotification('Please enter a valid image URL starting with http:// or https://', 'warning');
    }
  };

  const handleResetToDefault = () => {
    updateBackgroundSettings(DEFAULT_BACKGROUND_SETTINGS);
    showNotification('Background settings reset to defaults.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-stone-900 border border-stone-700/80 shadow-2xl overflow-hidden ring-1 ring-emerald-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Farm Scenery & Background Options
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/60 font-semibold">
                  Visual Theme
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Enhance your agroecology experience with scenic landscapes, seasonal shifts, or custom imagery
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Toggles Toolbar */}
        <div className="px-5 py-3 bg-stone-950/70 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Master Enable Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={backgroundSettings.enabled}
                onChange={(e) => updateBackgroundSettings({ enabled: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-8 h-4 rounded-full transition-colors relative ${backgroundSettings.enabled ? 'bg-emerald-600' : 'bg-stone-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${backgroundSettings.enabled ? 'left-4.5 translate-x-0.5' : 'left-0.5'}`} />
              </div>
              <span className={`font-semibold ${backgroundSettings.enabled ? 'text-emerald-300' : 'text-stone-400'}`}>
                Backgrounds {backgroundSettings.enabled ? 'Enabled' : 'Off'}
              </span>
            </label>

            {/* Target Placements */}
            <div className="h-4 w-px bg-stone-800 hidden sm:block" />

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-white">
              <input
                type="checkbox"
                disabled={!backgroundSettings.enabled}
                checked={backgroundSettings.applyToCanvas}
                onChange={(e) => updateBackgroundSettings({ applyToCanvas: e.target.checked })}
                className="rounded border-stone-700 text-emerald-500 focus:ring-emerald-500"
              />
              <Grid3X3 className="w-3.5 h-3.5 text-stone-400" />
              <span>Canvas Field Scenery</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-white">
              <input
                type="checkbox"
                disabled={!backgroundSettings.enabled}
                checked={backgroundSettings.applyToApp}
                onChange={(e) => updateBackgroundSettings({ applyToApp: e.target.checked })}
                className="rounded border-stone-700 text-emerald-500 focus:ring-emerald-500"
              />
              <Monitor className="w-3.5 h-3.5 text-stone-400" />
              <span>Global App Wallpaper</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-white">
              <input
                type="checkbox"
                disabled={!backgroundSettings.enabled}
                checked={backgroundSettings.autoSeasonMatch}
                onChange={(e) => updateBackgroundSettings({ autoSeasonMatch: e.target.checked })}
                className="rounded border-stone-700 text-emerald-500 focus:ring-emerald-500"
              />
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto Season Sync ({farmSeason})</span>
            </label>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition-colors py-1 px-2 rounded hover:bg-stone-800"
            title="Reset background options to original settings"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-stone-800 flex items-center gap-2 bg-stone-900">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-stone-800 text-white border-t-2 border-emerald-500'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Curated Scenery ({BACKGROUND_PRESETS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-stone-800 text-white border-t-2 border-emerald-500'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Custom Image / Upload</span>
            {backgroundSettings.selectedPresetId === 'custom' && (
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('adjust')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'adjust'
                ? 'bg-stone-800 text-white border-t-2 border-emerald-500'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Atmosphere & Contrast</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Curated Scenery Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                <span>Select a high-resolution agroecological environment for your field:</span>
                {backgroundSettings.autoSeasonMatch && (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" />
                    Auto-season enabled (Current: {farmSeason})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {BACKGROUND_PRESETS.map((preset) => {
                  const isSelected = backgroundSettings.enabled && backgroundSettings.selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all border text-left flex flex-col ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-950/60 scale-[1.01]'
                          : 'border-stone-800 hover:border-stone-600 bg-stone-850 hover:bg-stone-800 shadow-md'
                      }`}
                    >
                      {/* Image Thumbnail with Overlay */}
                      <div className="relative aspect-video w-full overflow-hidden bg-stone-950">
                        <img
                          src={preset.image}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md text-stone-200 border border-stone-700/80">
                            {preset.badge}
                          </span>
                        </div>

                        {/* Selection Checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center shadow-lg font-bold">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Card Info */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                            {preset.name}
                          </div>
                          <div className="text-[11px] text-stone-400 font-medium">
                            {preset.subtitle}
                          </div>
                          <p className="text-[10px] text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                            {preset.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px]">
                          <span className="text-stone-400 uppercase font-mono tracking-wider">
                            {preset.recommendedSeason ? `Optimal: ${preset.recommendedSeason}` : 'Universal'}
                          </span>
                          <span className={`font-semibold ${isSelected ? 'text-emerald-400' : 'text-stone-400 group-hover:text-white'}`}>
                            {isSelected ? '● Active' : 'Click to Apply'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Image Upload / URL */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>Upload Image from Your Device</span>
                </div>
                <p className="text-xs text-stone-400">
                  Select your own farm photo, drone landscape survey, or agricultural drawing from your device. Supported formats: JPG, PNG, WebP (up to 8MB).
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Local File</span>
                  </button>

                  {backgroundSettings.customImageUrl && (
                    <span className="text-xs text-stone-400 font-mono">
                      Custom image is currently loaded
                    </span>
                  )}
                </div>
              </div>

              {/* Paste URL */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <LinkIcon className="w-4 h-4 text-emerald-400" />
                  <span>Or Enter Image Web URL</span>
                </div>
                <p className="text-xs text-stone-400">
                  Paste a direct link to any high-res landscape photograph on Unsplash, Wikimedia Commons, or your web server:
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                    placeholder="https://example.com/my-farm-scenery.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Current Custom Image Preview */}
              {backgroundSettings.customImageUrl && (
                <div className="p-4 rounded-xl bg-stone-950/90 border border-sky-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-300 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      Current Custom Backdrop Preview
                    </span>
                    <button
                      onClick={() => {
                        updateBackgroundSettings({
                          selectedPresetId: 'agroforestry',
                          customImageUrl: null
                        });
                        showNotification('Custom image cleared. Restored preset backdrop.', 'info');
                      }}
                      className="text-rose-400 hover:text-rose-300 text-[11px] underline"
                    >
                      Remove Custom Image
                    </button>
                  </div>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-stone-700 relative max-h-48 bg-black">
                    <img
                      src={backgroundSettings.customImageUrl}
                      alt="Custom Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-stone-300">
                      Active Custom Backdrop
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Atmosphere, Blur & Contrast Controls */}
          {activeTab === 'adjust' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-4">
                <div className="text-xs text-stone-400 leading-relaxed">
                  Fine-tune the balance between immersive atmospheric scenery and the clarity of your soil plots, crop genetics, and environmental metrics.
                </div>

                {/* Canvas Opacity Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200">Field Canvas Landscape Opacity</span>
                    <span className="font-mono text-emerald-400">{Math.round(backgroundSettings.canvasOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={backgroundSettings.canvasOpacity}
                    onChange={(e) => updateBackgroundSettings({ canvasOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>10% (Subtle hint)</span>
                    <span>50% (Balanced)</span>
                    <span>100% (Vivid scenic)</span>
                  </div>
                </div>

                {/* App Ambient Wallpaper Opacity Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200">App-Wide Ambient Wallpaper Opacity</span>
                    <span className="font-mono text-sky-400">{Math.round(backgroundSettings.appOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.02"
                    value={backgroundSettings.appOpacity}
                    onChange={(e) => updateBackgroundSettings({ appOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>5% (Very dim)</span>
                    <span>20% (Subtle aura)</span>
                    <span>50% (Atmospheric)</span>
                  </div>
                </div>

                {/* Grid Overlay Darkness */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200">Plot Backdrop Darkening & Contrast</span>
                    <span className="font-mono text-amber-400">{Math.round(backgroundSettings.overlayDarkness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={backgroundSettings.overlayDarkness}
                    onChange={(e) => updateBackgroundSettings({ overlayDarkness: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>Low (Brighter landscape)</span>
                    <span>Medium (Recommended)</span>
                    <span>High (Maximum grid focus)</span>
                  </div>
                </div>

                {/* Blur Selection */}
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <div className="text-xs font-semibold text-stone-200">Background Blur Depth:</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Crisp (0px)', val: 0 },
                      { label: 'Soft (2px)', val: 2 },
                      { label: 'Atmospheric (6px)', val: 6 },
                      { label: 'Dreamy (12px)', val: 12 }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => updateBackgroundSettings({ blur: item.val })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all border ${
                          backgroundSettings.blur === item.val
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-stone-900 border-stone-700/80 text-stone-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vignette Toggle */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <div className="text-xs">
                    <div className="font-semibold text-stone-200">Radial Edge Vignette</div>
                    <div className="text-[11px] text-stone-400">Soft dark shadows along the perimeter to focus attention inward</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backgroundSettings.vignette}
                      onChange={(e) => updateBackgroundSettings({ vignette: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
          <div className="text-stone-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preferences saved automatically to browser storage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
            >
              Done & Return to Farm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
