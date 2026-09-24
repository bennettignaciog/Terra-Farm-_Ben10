import React, { useState, useMemo } from 'react';
import { useGameStore } from '../state/gameStore';
import { FieldNoteCategory, FieldNoteEntry } from '../simulation/types';
import { CLIMATE_ZONES } from '../config/climates';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Award, 
  Droplets, 
  CloudRain, 
  Flame, 
  Bug, 
  Compass, 
  Copy, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Edit3,
  Layers,
  Leaf,
  Globe
} from 'lucide-react';

const REFLECTION_PROMPTS = [
  {
    title: 'Soil Armor & Evaporation Strategy',
    category: 'soil_health' as FieldNoteCategory,
    content: 'Observed that mulched sectors maintained moisture even during hot afternoons, whereas bare soil desiccated rapidly. Planning to convert remaining tilled plots to organic residue cover.'
  },
  {
    title: 'Cover Crop Multispecies Trial',
    category: 'soil_health' as FieldNoteCategory,
    content: 'Planted cover crops between cash rotations to maintain continuous living root exudates. Rhizosphere tests indicate nitrogen fixation and noticeably reduced surface crusting.'
  },
  {
    title: 'Heatwave & Water Conservation Review',
    category: 'weather' as FieldNoteCategory,
    content: 'Severe heatwave tested our aquifer draw. Micro-drip irrigation and shade canopy buffers prevented leaf scorch while saving pumped groundwater.'
  },
  {
    title: 'Biological Pest Management Reflection',
    category: 'biodiversity' as FieldNoteCategory,
    content: 'Resisted spraying synthetic chemicals during the pest wave. Flowering borders attracted parasitoid wasps and hoverflies, balancing the aphid population naturally within two weeks.'
  }
];

export const FieldNotesModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const activeClimateZone = useGameStore((state) => state.activeClimateZone);
  const addFieldNote = useGameStore((state) => state.addFieldNote);
  const deleteFieldNote = useGameStore((state) => state.deleteFieldNote);
  const showNotification = useGameStore((state) => state.showNotification);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | FieldNoteCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<'all' | string>('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  // Reflection form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<FieldNoteCategory>('reflection');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');

  const currentZone = CLIMATE_ZONES[activeClimateZone] || CLIMATE_ZONES.arid;
  const notes = farm?.fieldNotes || [];

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (activeCategoryFilter !== 'all' && note.category !== activeCategoryFilter) {
        return false;
      }
      if (selectedSeasonFilter !== 'all') {
        const seasonKey = `Y${note.year}-${note.season}`;
        if (seasonKey !== selectedSeasonFilter) return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesContent = note.content.toLowerCase().includes(q);
        const matchesTags = note.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesTags) return false;
      }
      return true;
    });
  }, [notes, activeCategoryFilter, selectedSeasonFilter, searchQuery]);

  // Unique seasons list for filter dropdown
  const seasonOptions = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => set.add(`Y${n.year}-${n.season}`));
    return Array.from(set);
  }, [notes]);

  if (activeModal !== 'field_notes') return null;

  // Milestones Progress Calculation
  const totalTiles = farm.tiles.length;
  const avgSOM = totalTiles > 0 ? farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / totalTiles : 0;
  const avgWorms = totalTiles > 0 ? farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0) / totalTiles : 0;
  const mulchedCount = farm.tiles.filter(t => t.residue === 'mulch').length;
  const unlockedMilestones = new Set(farm.unlockedMilestones || []);

  const milestonesList = [
    { id: 'som_35', label: 'Living Sponge (35% SOM)', current: avgSOM, target: 35, unit: '%', isDone: unlockedMilestones.has('som_35') || avgSOM >= 35 },
    { id: 'som_40', label: 'Humus Reservoir (40% SOM)', current: avgSOM, target: 40, unit: '%', isDone: unlockedMilestones.has('som_40') || avgSOM >= 40 },
    { id: 'worms_30', label: 'Earthworm Colony (30+)', current: avgWorms, target: 30, unit: ' count', isDone: unlockedMilestones.has('worms_30') || avgWorms >= 30 },
    { id: 'soil_armor_12', label: 'Landscape Armor (12 Sectors)', current: mulchedCount, target: 12, unit: ' plots', isDone: unlockedMilestones.has('soil_armor_12') || mulchedCount >= 12 },
    { id: 'aquifer_recovery_1m', label: 'Aquifer Recharged (+1m)', current: Math.max(0, currentZone.baselineGroundwaterDepth - farm.groundwaterDepth), target: 1.0, unit: 'm', isDone: unlockedMilestones.has('aquifer_recovery_1m') },
  ];

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) {
      showNotification('Please enter reflection notes before saving.', 'warning');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addFieldNote({
      category: formCategory,
      title: formTitle.trim() || 'Agronomic Strategy Reflection',
      content: formContent.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['Reflection', `Year${farm.year}`],
      metricBadge: {
        label: 'Field Audit',
        value: `Y${farm.year} ${farm.season}`,
        trend: 'neutral'
      }
    });

    setFormTitle('');
    setFormContent('');
    setFormTags('');
    setIsComposerOpen(false);
  };

  const handleApplyPrompt = (prompt: typeof REFLECTION_PROMPTS[0]) => {
    setFormTitle(prompt.title);
    setFormCategory(prompt.category);
    setFormContent(prompt.content);
    setFormTags(`Strategy, ${prompt.category}, AgroEcology`);
  };

  const handleExportJournal = () => {
    const markdown = [
      `# TerraFarm Field Notes & Agronomic Journal`,
      `**Climate Biome:** ${currentZone.name} (${currentZone.regionCategory})`,
      `**Current Season:** Year ${farm.year}, ${farm.season} (Day ${farm.dayOfSeason}/90)`,
      `**Total Entries Logged:** ${notes.length}`,
      `\n---\n`,
      ...notes.map(n => {
        return `### ${n.icon} ${n.title} (Year ${n.year} ${n.season} • Day ${n.dayOfSeason})\n` +
          `*Category:* ${n.category.toUpperCase()} | *Importance:* ${n.importance.toUpperCase()}\n` +
          (n.metricBadge ? `*Metric:* ${n.metricBadge.label}: ${n.metricBadge.value}\n` : '') +
          `\n${n.content}\n` +
          (n.tags ? `*Tags:* ${n.tags.map(t => `#${t}`).join(' ')}\n` : '') +
          `\n---\n`;
      })
    ].join('\n');

    navigator.clipboard.writeText(markdown);
    setCopiedExport(true);
    showNotification('Field Journal copied to clipboard in Markdown format!', 'success');
    setTimeout(() => setCopiedExport(false), 3000);
  };

  const getCategoryColor = (category: FieldNoteCategory) => {
    switch (category) {
      case 'soil_health':
        return 'text-amber-300 border-amber-500/40 bg-amber-950/30';
      case 'weather':
        return 'text-sky-300 border-sky-500/40 bg-sky-950/30';
      case 'biodiversity':
        return 'text-purple-300 border-purple-500/40 bg-purple-950/30';
      case 'milestone':
        return 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40';
      case 'reflection':
        return 'text-rose-300 border-rose-500/40 bg-rose-950/30';
      case 'management':
        return 'text-indigo-300 border-indigo-500/40 bg-indigo-950/30';
      default:
        return 'text-stone-300 border-stone-700 bg-stone-900';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Leatherbound Agronomic Journal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2 font-display">
                  Field Notes & Agro-Journal
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-600/40">
                  {currentZone.icon} {currentZone.name.split(' ')[0]}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Automated soil health milestones, weather observations & strategy reflections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Markdown Button */}
            <button
              onClick={handleExportJournal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700/80 text-xs font-semibold transition-all shadow-sm"
              title="Export complete journal as Markdown"
            >
              {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedExport ? 'Copied!' : 'Export Journal'}</span>
            </button>

            {/* Compose Reflection Toggle */}
            <button
              onClick={() => setIsComposerOpen(!isComposerOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-all shadow-md shadow-amber-950/50"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isComposerOpen ? 'Close Note' : '+ Add Reflection'}</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Milestone Tracker Ribbon */}
        <div className="bg-stone-950/80 border-b border-stone-800 px-4 py-2.5 flex items-center gap-3 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 shrink-0">
            <Award className="w-4 h-4" />
            <span>Milestones:</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {milestonesList.map((m) => (
              <div
                key={m.id}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 shrink-0 transition-all ${
                  m.isDone
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400'
                }`}
                title={`${m.label}: ${m.current.toFixed(1)} / ${m.target}${m.unit}`}
              >
                <span>{m.isDone ? '✓' : '○'}</span>
                <span>{m.label}</span>
                <span className="text-[10px] opacity-75">
                  ({m.current.toFixed(0)}/{m.target})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Reflection Composer Drawer */}
        {isComposerOpen && (
          <div className="bg-stone-950 border-b border-stone-800 p-4 sm:p-5 space-y-3 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Record Agronomic Reflection or Strategy Hypothesis
              </h3>
              <span className="text-[11px] text-stone-400 font-mono">
                Auto-stamped: Year {farm.year} {farm.season} (Day {farm.dayOfSeason})
              </span>
            </div>

            {/* Quick Inspiration Prompts */}
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {REFLECTION_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPrompt(p)}
                    className="text-[11px] px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 text-stone-300 transition-colors"
                  >
                    "{p.title}"
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveReflection} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Note Title (e.g. 'Evaluating drought response after mulching plot 4')"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as FieldNoteCategory)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="reflection">📝 Strategy Reflection</option>
                    <option value="soil_health">🌱 Soil Health Hypothesis</option>
                    <option value="weather">🌦️ Weather Observation</option>
                    <option value="biodiversity">🐞 Biodiversity Balance</option>
                    <option value="management">🛡️ Farm Management</option>
                  </select>
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="What agronomic choices did you test? How did soil moisture, earthworms, or pests respond? What are your next steps?"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 resize-none font-sans"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Tags (comma-separated, e.g. Mulch, Drought, Nitrogen)"
                  className="w-full sm:w-80 bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
                />

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-all shadow-md"
                  >
                    Record to Journal
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="bg-stone-900/90 border-b border-stone-800/80 p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategoryFilter === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              All ({notes.length})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('soil_health')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeCategoryFilter === 'soil_health'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>🌱</span>
              <span>Soil Health</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('weather')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeCategoryFilter === 'weather'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>🌦️</span>
              <span>Weather</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('milestone')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeCategoryFilter === 'milestone'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>🏆</span>
              <span>Milestones</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('reflection')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeCategoryFilter === 'reflection'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>📝</span>
              <span>Reflections</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('management')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeCategoryFilter === 'management'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>🛡️</span>
              <span>Audits</span>
            </button>
          </div>

          {/* Search & Season Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {seasonOptions.length > 1 && (
              <select
                value={selectedSeasonFilter}
                onChange={(e) => setSelectedSeasonFilter(e.target.value)}
                className="bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500/60"
              >
                <option value="all">All Seasons</option>
                {seasonOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>
        </div>

        {/* Journal Entries Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800/80 border border-stone-700/80 mx-auto flex items-center justify-center text-stone-500">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-stone-300">No Field Notes Matching Filters</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Advance the simulation to trigger automatic soil health milestones, weather observations, or click "+ Add Reflection" above to record your own strategy hypotheses.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const categoryClasses = getCategoryColor(note.category);

              return (
                <div
                  key={note.id}
                  className={`rounded-2xl border p-4 transition-all shadow-sm ${
                    note.importance === 'milestone'
                      ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-emerald-500/40 shadow-emerald-950/20'
                      : note.importance === 'alert'
                      ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-sky-500/40 shadow-sky-950/20'
                      : 'bg-stone-950/80 border-stone-800 hover:border-stone-700/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Note Icon */}
                      <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-lg shrink-0 shadow-inner">
                        {note.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-stone-100 font-display">
                            {note.title}
                          </h4>

                          {/* Category Badge */}
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${categoryClasses}`}>
                            {note.category.replace('_', ' ').toUpperCase()}
                          </span>

                          {/* Importance Badge */}
                          {note.importance === 'milestone' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                              🏆 Milestone
                            </span>
                          )}
                          {note.importance === 'alert' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/50">
                              ⚠️ Weather Alert
                            </span>
                          )}
                          {note.isUserReflection && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50">
                              📝 Reflection
                            </span>
                          )}
                        </div>

                        {/* Content text */}
                        <p className="text-xs text-stone-300 leading-relaxed font-sans">
                          {note.content}
                        </p>

                        {/* Metric Badge & Tags */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                          {note.metricBadge && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-900 border border-stone-800 font-mono text-[10px]">
                              <span className="text-stone-400">{note.metricBadge.label}:</span>
                              <span className={`font-bold ${
                                note.metricBadge.trend === 'up'
                                  ? 'text-emerald-400'
                                  : note.metricBadge.trend === 'down'
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}>
                                {note.metricBadge.value}
                              </span>
                            </div>
                          )}

                          {note.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] text-stone-500 hover:text-stone-300 transition-colors font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right timestamp & delete if user note */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-500" />
                        <span>Y{note.year} {note.season} • D{note.dayOfSeason}</span>
                      </div>

                      {note.isUserReflection && (
                        <button
                          onClick={() => deleteFieldNote(note.id)}
                          className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-stone-900 transition-colors"
                          title="Delete this reflection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-3 sm:px-5 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-stone-300 font-semibold">{filteredNotes.length}</span>
            <span>notes displayed ({notes.length} total in field log)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJournal}
              className="text-xs text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Full Log (Markdown)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
