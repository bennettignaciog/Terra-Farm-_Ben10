import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  Database, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Trophy, 
  Share2, 
  Heart, 
  PlusCircle, 
  Server, 
  ShieldCheck, 
  User as UserIcon, 
  Sparkles,
  Leaf,
  Calendar,
  Layers,
  DollarSign
} from 'lucide-react';
import { 
  auth, 
  db, 
  ensureAuthUser, 
  googleSignIn, 
  saveFarmToCloud, 
  fetchUserFarmSaves, 
  loadFarmFromCloud, 
  deleteFarmFromCloud, 
  publishToLeaderboard, 
  fetchCloudCommunityNotes, 
  shareCloudFieldNote, 
  upvoteCloudFieldNote, 
  CloudFarmSaveMetadata, 
  CloudCommunityNote 
} from '../services/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { User } from 'firebase/auth';

export const CloudDatabaseModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const activeClimateZone = useGameStore((state) => state.activeClimateZone);
  const loadCloudFarmState = useGameStore((state) => state.loadCloudFarmState);
  const showNotification = useGameStore((state) => state.showNotification);

  const [activeTab, setActiveTab] = useState<'saves' | 'sync' | 'community'>('saves');
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [saves, setSaves] = useState<CloudFarmSaveMetadata[]>([]);
  const [isLoadingSaves, setIsLoadingSaves] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [customSaveName, setCustomSaveName] = useState('');
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Community field notes state
  const [communityNotes, setCommunityNotes] = useState<CloudCommunityNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [noteCategory, setNoteCategory] = useState('Companion Planting');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Load auth state and initial cloud data when modal opens
  useEffect(() => {
    if (activeModal !== 'database') return;

    let isMounted = true;
    const init = async () => {
      setDbStatus('connecting');
      setErrorMessage(null);
      try {
        const user = await ensureAuthUser();
        if (isMounted) {
          setCurrentUser(user);
          setDbStatus('connected');
          loadSaves();
          loadNotes();
        }
      } catch (err: any) {
        console.error('Firebase init failed:', err);
        if (isMounted) {
          setDbStatus('error');
          setErrorMessage(err?.message || 'Failed to connect to Firebase Firestore');
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [activeModal]);

  const loadSaves = async () => {
    setIsLoadingSaves(true);
    try {
      const list = await fetchUserFarmSaves();
      setSaves(list);
    } catch (err: any) {
      console.error('Error fetching farm saves:', err);
      showNotification('Error loading saves: ' + (err.message || 'Check connection'), 'warning');
    } finally {
      setIsLoadingSaves(false);
    }
  };

  const loadNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const notes = await fetchCloudCommunityNotes();
      setCommunityNotes(notes);
    } catch (err: any) {
      console.warn('Error fetching community notes:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSaveToCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const saveName = customSaveName.trim() || `${farm.farmName || 'TerraFarm'} (Year ${farm.year}, S${farm.season + 1})`;
    try {
      await saveFarmToCloud(saveName, farm, activeClimateZone);
      setCustomSaveName('');
      showNotification(`Saved "${saveName}" to Firestore Database!`, 'success');
      await loadSaves();
    } catch (err: any) {
      console.error('Save failed:', err);
      showNotification('Failed to save: ' + (err.message || 'Firestore error'), 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSave = async (save: CloudFarmSaveMetadata) => {
    if (!window.confirm(`Load "${save.farmName}"? Any unsaved progress on your current active farm will be replaced.`)) {
      return;
    }
    try {
      const result = await loadFarmFromCloud(save.id);
      if (result) {
        loadCloudFarmState(result.farm, result.climateZone);
        closeModal();
      } else {
        showNotification('Save not found in database', 'warning');
      }
    } catch (err: any) {
      console.error('Failed to load save:', err);
      showNotification('Failed to load save: ' + err.message, 'warning');
    }
  };

  const handleDeleteSave = async (saveId: string, name: string) => {
    if (!window.confirm(`Permanently delete cloud save "${name}"?`)) return;
    try {
      await deleteFarmFromCloud(saveId);
      setSaves((prev) => prev.filter((s) => s.id !== saveId));
      showNotification(`Deleted "${name}" from Cloud Database`, 'info');
    } catch (err: any) {
      console.error('Failed to delete save:', err);
      showNotification('Failed to delete save: ' + err.message, 'warning');
    }
  };

  const handlePublishToLeaderboard = async () => {
    setIsPublishing(true);
    try {
      await publishToLeaderboard(farm, activeClimateZone);
      showNotification('Farm score published to global Firestore Leaderboard!', 'success');
    } catch (err: any) {
      console.error('Leaderboard publish error:', err);
      showNotification('Failed to publish score: ' + err.message, 'warning');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        showNotification(`Signed in as ${res.user.displayName || res.user.email}!`, 'success');
        loadSaves();
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      showNotification('Google sign-in failed: ' + err.message, 'warning');
    }
  };

  const handleShareNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      await shareCloudFieldNote(noteCategory, noteTitle.trim(), noteContent.trim());
      setNoteTitle('');
      setNoteContent('');
      showNotification('Agroecological insight shared to Cloud Knowledge Base!', 'success');
      loadNotes();
    } catch (err: any) {
      console.error('Failed to share note:', err);
      showNotification('Failed to share: ' + err.message, 'warning');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleLikeNote = async (noteId: string) => {
    try {
      await upvoteCloudFieldNote(noteId);
      setCommunityNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, likes: n.likes + 1 } : n))
      );
    } catch (err: any) {
      console.error('Like failed:', err);
    }
  };

  if (activeModal !== 'database') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-cyan-950 p-4 sm:p-5 border-b border-stone-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-wide">Cloud Database & Storage</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Server className="w-3 h-3" /> Firestore Active
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Persistent multi-device farm saves, live watershed syncing, and community knowledge base
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Database & Connection Health Bar */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : dbStatus === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-rose-400'}`} />
              <span className="text-stone-400">Database:</span>
              <span className="font-mono text-[11px] text-stone-200 truncate" title={firebaseConfig.firestoreDatabaseId}>
                {firebaseConfig.firestoreDatabaseId.slice(0, 18)}...
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-stone-400">Rules:</span>
              <span className="text-cyan-300 font-medium">ABAC Zero-Trust</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center gap-1.5 text-stone-300 truncate">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">
                  {currentUser?.displayName || (currentUser?.isAnonymous ? 'Anonymous Pioneer' : 'Connected')}
                </span>
              </div>
              {currentUser?.isAnonymous && (
                <button
                  onClick={handleGoogleAuth}
                  className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-[10px] text-emerald-200 border border-emerald-500/40 transition-colors whitespace-nowrap"
                >
                  Link Google
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('saves')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'saves'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" /> Cloud Saves ({saves.length})
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'sync'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" /> Leaderboard Sync
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'community'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" /> Community Knowledge ({communityNotes.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CLOUD SAVES */}
          {activeTab === 'saves' && (
            <div className="space-y-6">
              {/* Save Creation Card */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                  <CloudUpload className="w-4 h-4 text-emerald-400" />
                  Save Active Farm Snapshot to Firestore
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  Saves your full 36-tile soil geology, earthworm populations, biodiversity, active crop stages, finances, and heirloom seeds.
                </p>

                <form onSubmit={handleSaveToCloud} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={customSaveName}
                    onChange={(e) => setCustomSaveName(e.target.value)}
                    placeholder={`Save name (e.g., "${farm.farmName || 'TerraFarm'} Year ${farm.year}")`}
                    maxLength={60}
                    className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-colors"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                    {isSaving ? 'Uploading...' : 'Save to Cloud'}
                  </button>
                </form>
              </div>

              {/* Saved Farms List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Cloud Save Slots ({saves.length})
                  </h3>
                  <button
                    onClick={loadSaves}
                    disabled={isLoadingSaves}
                    className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSaves ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {isLoadingSaves && saves.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                    Loading your cloud saves from Firestore...
                  </div>
                ) : saves.length === 0 ? (
                  <div className="p-8 text-center bg-stone-950/40 border border-stone-800/80 rounded-xl text-stone-400 text-xs">
                    <Cloud className="w-8 h-8 text-stone-600 mx-auto mb-2 opacity-60" />
                    No cloud saves created yet. Click <span className="text-emerald-400">"Save to Cloud"</span> above to preserve your farm in Firestore!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {saves.map((save) => (
                      <div
                        key={save.id}
                        className="bg-stone-950/70 border border-stone-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all flex flex-col justify-between gap-3 shadow-md"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-white truncate" title={save.farmName}>
                              {save.farmName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 text-stone-300 capitalize">
                              {save.climateZone}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-stone-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>Year {save.year}, Season {save.season + 1} (Day {save.day})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300 font-medium">{save.ecoPoints.toLocaleString()} EcoPts</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                              <span>${save.cash.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Leaf className="w-3.5 h-3.5 text-lime-400" />
                              <span>{save.biodiversityScore}% Biodiversity</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-stone-500 mt-2 font-mono">
                            Updated: {new Date(save.updatedAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 gap-2">
                          <button
                            onClick={() => handleDeleteSave(save.id, save.farmName)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Save"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLoadSave(save)}
                            className="px-3 py-1.5 bg-stone-800 hover:bg-emerald-600 text-stone-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <CloudDownload className="w-3.5 h-3.5" />
                            Restore Farm
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LEADERBOARD SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Global Firestore Community Ranking</h3>
                    <p className="text-xs text-stone-400">
                      Publish your farm's regenerative milestones to the global cloud leaderboard.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-900/80 p-3.5 rounded-xl border border-stone-800 mb-4 text-center">
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Eco-Points</div>
                    <div className="text-lg font-bold text-emerald-400">{(farm.ecoPoints || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Biodiversity</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {Math.min(100, Math.round(new Set(farm.tiles.filter(t => t.crop).map(t => t.crop!.typeId)).size * 12 + (farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / farm.tiles.length) * 0.5 + (farm.unlockedUpgrades?.agroforestryBorders ? 15 : 0)))}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Farm Age</div>
                    <div className="text-lg font-bold text-amber-400">Year {farm.year}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Climate</div>
                    <div className="text-lg font-bold text-stone-200 capitalize">{activeClimateZone}</div>
                  </div>
                </div>

                <button
                  onClick={handlePublishToLeaderboard}
                  disabled={isPublishing}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
                >
                  {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  {isPublishing ? 'Publishing to Leaderboard...' : 'Publish Farm Score to Global Leaderboard'}
                </button>
              </div>

              <div className="bg-stone-950/40 border border-stone-800 rounded-xl p-4 text-xs text-stone-400 space-y-2">
                <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Zero-Trust Validation Enforced
                </div>
                <p>
                  Every leaderboard entry is cryptographically bound to your authenticated player account and checked by server security rules to verify valid point boundaries and schema integrity.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: COMMUNITY KNOWLEDGE */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              {/* Share Note Form */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  Contribute Agroecological Observation
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  Share real-world regenerative farming tips, cover crop experiments, or water table management techniques.
                </p>

                <form onSubmit={handleShareNote} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Category</label>
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Companion Planting">Companion Planting</option>
                        <option value="Soil Organic Matter">Soil Organic Matter & Mulch</option>
                        <option value="Water Conservation">Water Table & Drip Irrigation</option>
                        <option value="Biological Pest Control">Biological Pest Control</option>
                        <option value="Agroforestry">Agroforestry & Windbreaks</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Observation Title</label>
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="e.g. Marigolds completely deterred aphids"
                        maxLength={100}
                        required
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Observation Details</label>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Explain your agronomic technique, rotation results, or findings..."
                      rows={3}
                      maxLength={1000}
                      required
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    {isSubmittingNote ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                    Publish Note to Cloud
                  </button>
                </form>
              </div>

              {/* Community Notes Feed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-300 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    Global Farmer Knowledge Feed
                  </h3>
                  <button
                    onClick={loadNotes}
                    disabled={isLoadingNotes}
                    className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNotes ? 'animate-spin' : ''}`} />
                    Refresh Feed
                  </button>
                </div>

                {communityNotes.length === 0 ? (
                  <div className="p-8 text-center bg-stone-950/40 border border-stone-800 rounded-xl text-stone-500 text-xs">
                    Be the first regenerative farmer to contribute an observation!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {communityNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 shadow-sm hover:border-stone-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                              {note.category}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1.5">{note.title}</h4>
                            <p className="text-xs text-stone-300 mt-1 leading-relaxed">{note.content}</p>
                          </div>
                          <button
                            onClick={() => handleLikeNote(note.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-rose-950/40 text-stone-400 hover:text-rose-400 border border-stone-800 transition-colors text-xs font-semibold"
                          >
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            {note.likes}
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-800/60 text-[10px] text-stone-500">
                          <span>By {note.authorName}</span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
