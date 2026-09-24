import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from '../services/firebase';
import { 
  getGmailProfile, 
  listGmailMessages, 
  sendGmailMessage, 
  buildFarmReportEmail,
  GmailProfile, 
  GmailMessageSummary 
} from '../services/gmail';
import { User } from 'firebase/auth';
import { 
  Mail, 
  X, 
  Send, 
  Inbox, 
  FileText, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  Search, 
  LogOut, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  Droplet, 
  Sprout, 
  Layers 
} from 'lucide-react';

export const GmailDeskModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const latestReport = useGameStore((state) => state.latestReport);
  const showNotification = useGameStore((state) => state.showNotification);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [profile, setProfile] = useState<GmailProfile | null>(null);

  // Navigation Tab inside Modal
  const [tab, setTab] = useState<'inbox' | 'report' | 'compose'>('report');

  // Inbox State
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageSummary | null>(null);

  // Compose State
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // MANDATORY Destructive/Mutating Operation Confirmation Dialog State
  const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState<{
    to: string;
    subject: string;
    bodyText: string;
    bodyHtml?: string;
    type: 'audit' | 'compose';
  } | null>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        if (currentUser.email) {
          setRecipient(currentUser.email);
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setProfile(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Profile and Messages when signed in
  useEffect(() => {
    if (user && token && activeModal === 'gmail') {
      loadProfileAndMessages();
    }
  }, [user, token, activeModal]);

  const loadProfileAndMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const prof = await getGmailProfile();
      setProfile(prof);

      const msgs = await listGmailMessages(searchQuery, 12);
      setMessages(msgs);
    } catch (err: any) {
      console.error('Error loading Gmail data:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setIsLoadingMessages(true);
      const msgs = await listGmailMessages(searchQuery, 15);
      setMessages(msgs);
    } catch (err: any) {
      showNotification(err.message || 'Failed to search messages', 'warning');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        if (result.user.email) {
          setRecipient(result.user.email);
        }
        showNotification('Connected to Google Gmail successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      showNotification(err.message || 'Could not sign in with Google.', 'warning');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setProfile(null);
    setMessages([]);
    showNotification('Disconnected from Google Account.', 'info');
  };

  // Prepare dispatch for Season Ecological Audit
  const handleInitiateSendAudit = () => {
    if (!user?.email && !recipient) {
      showNotification('Please enter a recipient email address', 'warning');
      return;
    }
    const targetRecipient = recipient.trim() || user?.email || '';
    const reportData = buildFarmReportEmail(farm, latestReport);

    // Open MANDATORY explicit confirmation dialog
    setPendingEmailConfirmation({
      to: targetRecipient,
      subject: reportData.subject,
      bodyText: reportData.bodyText,
      bodyHtml: reportData.bodyHtml,
      type: 'audit'
    });
  };

  // Prepare custom compose email
  const handleInitiateComposeSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) {
      showNotification('Recipient email is required', 'warning');
      return;
    }
    if (!subject.trim()) {
      showNotification('Email subject is required', 'warning');
      return;
    }
    if (!bodyText.trim()) {
      showNotification('Email content cannot be empty', 'warning');
      return;
    }

    // Open MANDATORY explicit confirmation dialog
    setPendingEmailConfirmation({
      to: recipient.trim(),
      subject: subject.trim(),
      bodyText: bodyText.trim(),
      type: 'compose'
    });
  };

  // Execute sending after explicit user confirmation
  const handleConfirmSend = async () => {
    if (!pendingEmailConfirmation) return;

    try {
      setIsSending(true);
      await sendGmailMessage({
        to: pendingEmailConfirmation.to,
        subject: pendingEmailConfirmation.subject,
        bodyText: pendingEmailConfirmation.bodyText,
        bodyHtml: pendingEmailConfirmation.bodyHtml
      });

      showNotification(`Email successfully sent to ${pendingEmailConfirmation.to}!`, 'success');
      setPendingEmailConfirmation(null);

      // If compose, reset form
      if (pendingEmailConfirmation.type === 'compose') {
        setSubject('');
        setBodyText('');
      }

      // Refresh inbox list
      loadProfileAndMessages();
    } catch (err: any) {
      console.error('Send email error:', err);
      showNotification(err.message || 'Failed to send email via Gmail.', 'warning');
    } finally {
      setIsSending(false);
    }
  };

  // Agronomic Quick Templates for Compose Tab
  const applyTemplate = (type: string) => {
    const avgSom = (farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / farm.tiles.length).toFixed(1);
    const avgN = (farm.tiles.reduce((acc, t) => acc + t.nitrogen, 0) / farm.tiles.length).toFixed(1);

    if (type === 'lab') {
      setSubject(`Soil Chemistry Lab Sample - Plot Block A1-F6 (TerraFarm Year ${farm.year})`);
      setBodyText(
`Dear Agricultural Extension Testing Laboratory,

I am submitting composite soil samples taken from my 6x6 agricultural parcel (TerraFarm). 
Current in-situ sensor telemetry estimates:
- Mean Soil Organic Matter (SOM): ${avgSom}%
- Extractable Nitrogen (N): ${avgN} kg/ha
- Current Groundwater Depth: ${farm.groundwaterDepth.toFixed(1)} meters
- Compaction Level: Subsoil hardpan present, shifting to non-inversion minimum till.

Please perform comprehensive macro/micro-nutrient panel (N-P-K, Ca, Mg, pH, cation-exchange capacity, active fungal-to-bacterial biomass ratio).

Best regards,
Farm Manager
TerraFarm Agro-Ecology Simulation`
      );
    } else if (type === 'coop') {
      setSubject(`Organic Harvest Delivery Notification - Season ${farm.season} Year ${farm.year}`);
      setBodyText(
`To the Farmers Co-operative Marketing Board,

This notice serves to confirm upcoming crop harvest allocations from TerraFarm:
- Active Status: ${farm.hasOrganicCertification ? 'Certified Organic Standard' : `Transitional Clean (${farm.consecutiveChemicalFreeSeasons}/3 seasons chem-free)`}
- Pest Control Method: Strictly integrated biological predators & botanical neem (zero broad-spectrum organophosphates used).
- Residue Strategy: 100% surface mulched and soil-armored.

We anticipate high test-weight yield ready for delivery upon harvest completion. Please confirm dock receipt windows and prevailing organic spot premiums.

In regenerative solidarity,
TerraFarm Management`
      );
    } else if (type === 'water') {
      setSubject(`Aquifer Recharge & Groundwater Sustainability Query - Regional Well #${farm.year}`);
      setBodyText(
`Attention: Regional Water Conservation & Aquifer Management District,

I am writing regarding regional groundwater table management in our farming sector:
- Current static borehole depth: ${farm.groundwaterDepth.toFixed(1)} meters below ground level.
- Farm Water Conservation: We have integrated precision drip delivery systems and farm pond surface catchment to relieve extraction pressure on the deep alluvial aquifer.
- Infiltration Status: Cover crops and organic matter mulch blankets are actively minimizing surface runoff.

We request updated seasonal recharge forecasts and water replenishment allocations for the coming cycle.

Regards,
TerraFarm Water Operations`
      );
    }
  };

  if (activeModal !== 'gmail') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-950/60">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-1.5 font-display">
                  Gmail Agro-Extension Dispatch
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800/60 text-rose-300">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Send ecological audit reports & manage agricultural advisory communications via Gmail.
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Bar / Account Status */}
        <div className="px-4 sm:px-5 py-3 bg-stone-950/70 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Google User'} 
                  className="w-8 h-8 rounded-full border border-emerald-500/50 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.email ? user.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <div>
                <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <span>{user.displayName || 'Google User'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Connected" />
                </div>
                <div className="text-[11px] text-stone-400 font-mono">
                  {user.email} {profile && `• ${profile.messagesTotal.toLocaleString()} emails in mailbox`}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-stone-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Sign in with Google to enable Gmail dispatch and extension mail sync.</span>
            </div>
          )}

          <div>
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              /* Official Google Sign-In Material Button per Skill Instructions */
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        {user && (
          <div className="px-4 sm:px-5 border-b border-stone-800 bg-stone-900/60 flex items-center gap-2 pt-2">
            <button
              onClick={() => setTab('report')}
              className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-semibold text-xs transition-all ${
                tab === 'report'
                  ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>1-Click Season Audit Report</span>
            </button>

            <button
              onClick={() => setTab('inbox')}
              className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-semibold text-xs transition-all ${
                tab === 'inbox'
                  ? 'border-rose-500 text-rose-300 bg-rose-950/20'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Inbox className="w-4 h-4 text-rose-400" />
              <span>Extension Inbox</span>
            </button>

            <button
              onClick={() => setTab('compose')}
              className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-semibold text-xs transition-all ${
                tab === 'compose'
                  ? 'border-sky-500 text-sky-300 bg-sky-950/20'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Send className="w-4 h-4 text-sky-400" />
              <span>Compose Advisory Dispatch</span>
            </button>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {!user ? (
            /* Unauthenticated View: Explains benefits and invites login */
            <div className="max-w-lg mx-auto py-8 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-900 to-amber-900/40 border border-rose-500/30 flex items-center justify-center text-rose-300 shadow-xl">
                <Mail className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-100 font-display">
                  Connect Your Gmail to TerraFarm
                </h3>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                  Seamlessly bridge the simulation with real-world agricultural workflow. Send audited season soil health metrics, aquifer depth trends, and ecological compliance certificates directly from your Gmail account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-2 text-left">
                <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl">
                  <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <Sprout className="w-4 h-4" />
                    <span>Season Audits</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Export full SOM, nitrogen & biodiversity telemetry as formatted HTML reports to your inbox.
                  </p>
                </div>

                <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl">
                  <div className="text-sky-400 font-bold text-xs flex items-center gap-1.5">
                    <Droplet className="w-4 h-4" />
                    <span>Aquifer Reports</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Send water district queries and groundwater conservation documentation.
                  </p>
                </div>

                <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl">
                  <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Co-op Invoices</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Draft harvest delivery manifests and organic certification updates.
                  </p>
                </div>
              </div>

              {/* Official Google Sign-In Material Button */}
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button mt-2"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>

              <p className="text-[10px] text-stone-500 max-w-sm">
                Access tokens are stored strictly in-memory during active sessions. All emails require your explicit confirmation before dispatch.
              </p>
            </div>
          ) : tab === 'report' ? (
            /* TAB 1: 1-Click Season Ecological Audit */
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5 font-display">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Season Ecological Audit Report</span>
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Compiles current farm telemetry (SOM, Nitrogen, Groundwater depth, Earthworms, Revenue) into an official agricultural dispatch.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Recipient email..."
                    className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 flex-1 sm:w-60"
                  />
                  <button
                    onClick={handleInitiateSendAudit}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950 flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Email Report</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-xs">
                  <span className="font-semibold text-stone-300">Live Report Preview:</span>
                  <span className="font-mono text-emerald-400">Y{farm.year} {farm.season} (Day {farm.dayOfSeason}/90)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-stone-900/90 border border-stone-800/80 p-2.5 rounded-lg">
                    <div className="text-[10px] text-stone-400 uppercase">Soil Organic Matter</div>
                    <div className="text-base font-bold font-mono text-amber-300">
                      {(farm.tiles.reduce((a, t) => a + t.soilOrganicMatter, 0) / farm.tiles.length).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-stone-900/90 border border-stone-800/80 p-2.5 rounded-lg">
                    <div className="text-[10px] text-stone-400 uppercase">Groundwater Depth</div>
                    <div className="text-base font-bold font-mono text-sky-300">
                      {farm.groundwaterDepth.toFixed(1)} m
                    </div>
                  </div>

                  <div className="bg-stone-900/90 border border-stone-800/80 p-2.5 rounded-lg">
                    <div className="text-[10px] text-stone-400 uppercase">Cash Reserve</div>
                    <div className="text-base font-bold font-mono text-emerald-300">
                      ${farm.cashBalance.toFixed(0)}
                    </div>
                  </div>

                  <div className="bg-stone-900/90 border border-stone-800/80 p-2.5 rounded-lg">
                    <div className="text-[10px] text-stone-400 uppercase">Organic Status</div>
                    <div className="text-base font-bold font-mono text-purple-300">
                      {farm.hasOrganicCertification ? 'Certified Organic' : `${farm.consecutiveChemicalFreeSeasons}/3 Clean`}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-900 rounded-lg text-xs font-mono text-stone-300 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto border border-stone-800/60">
                  {buildFarmReportEmail(farm, latestReport).bodyText}
                </div>
              </div>
            </div>
          ) : tab === 'inbox' ? (
            /* TAB 2: Extension Inbox */
            <div className="space-y-3">
              {/* Search Bar & Refresh */}
              <div className="flex items-center justify-between gap-2">
                <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search messages (e.g. soil, extension, farm)..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-semibold rounded-lg text-stone-200 transition-colors border border-stone-700"
                  >
                    Filter
                  </button>
                </form>

                <button
                  onClick={loadProfileAndMessages}
                  disabled={isLoadingMessages}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-semibold rounded-lg text-stone-200 transition-colors border border-stone-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Message List */}
              {isLoadingMessages ? (
                <div className="py-12 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
                  <span>Syncing Gmail messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500 bg-stone-950/50 rounded-xl border border-stone-800/80">
                  <Inbox className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  <span>No messages found matching your search.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedMessage?.id === msg.id
                          ? 'bg-stone-800/90 border-rose-500/60 shadow-md'
                          : 'bg-stone-950/80 border-stone-800/80 hover:bg-stone-900 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-stone-200 truncate flex-1">
                          {msg.from}
                        </div>
                        <div className="text-[10px] font-mono text-stone-400 flex-shrink-0">
                          {msg.date}
                        </div>
                      </div>

                      <div className="text-xs font-medium text-rose-300 mt-1 truncate">
                        {msg.subject}
                      </div>

                      <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                        {msg.snippet}
                      </div>

                      {/* Expanded View */}
                      {selectedMessage?.id === msg.id && (
                        <div className="mt-3 pt-3 border-t border-stone-700 text-xs text-stone-300 bg-stone-900/60 p-3 rounded-lg font-mono whitespace-pre-wrap">
                          <div className="text-[10px] text-stone-400 mb-2">Message ID: {msg.id}</div>
                          {msg.snippet}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: Compose Advisory Dispatch */
            <form onSubmit={handleInitiateComposeSend} className="space-y-3">
              {/* Quick Template Picker */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-stone-400 font-semibold">Agronomic Templates:</span>
                <button
                  type="button"
                  onClick={() => applyTemplate('lab')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[11px] font-medium text-emerald-300 border border-emerald-500/30 transition-colors"
                >
                  🧪 Soil Testing Lab
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('coop')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[11px] font-medium text-amber-300 border border-amber-500/30 transition-colors"
                >
                  🌾 Co-op Organic Harvest
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('water')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[11px] font-medium text-sky-300 border border-sky-500/30 transition-colors"
                >
                  💧 Water District Query
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">To (Recipient)</label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. extension-officer@state.edu, lab@agri.org, or your email..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject of agricultural dispatch..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Dispatch Message</label>
                <textarea
                  rows={6}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Compose message or select an agronomic template above..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-rose-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs shadow-lg shadow-rose-950 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Dispatch via Gmail</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* MANDATORY EXPLICIT USER CONFIRMATION DIALOG BEFORE ANY DESTRUCTIVE / MUTATING OPERATION (EMAIL SENDING) */}
      {pendingEmailConfirmation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-amber-500/50 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-100 font-display">
                  Confirm Sending Email via Gmail
                </h3>
                <p className="text-[11px] text-stone-400">
                  This action will send an email from your personal Gmail account ({user?.email}).
                </p>
              </div>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-[11px]">Recipient:</span>
                <span className="font-mono text-emerald-300 font-semibold">{pendingEmailConfirmation.to}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-stone-400 text-[11px] flex-shrink-0">Subject:</span>
                <span className="text-stone-200 text-right truncate">{pendingEmailConfirmation.subject}</span>
              </div>
              <div className="pt-2 border-t border-stone-800">
                <span className="text-[10px] text-stone-500 block mb-1">Message Preview:</span>
                <div className="text-[11px] text-stone-300 font-mono line-clamp-3 bg-stone-900 p-2 rounded border border-stone-850">
                  {pendingEmailConfirmation.bodyText}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPendingEmailConfirmation(null)}
                disabled={isSending}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md shadow-rose-950"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
