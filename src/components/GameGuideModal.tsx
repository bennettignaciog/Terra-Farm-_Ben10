import React, { useState, useMemo } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  Search, 
  Sprout, 
  Droplets, 
  Layers, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Users, 
  Sun, 
  Flame, 
  Bug, 
  Wrench, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ChevronRight,
  Filter,
  GraduationCap,
  Globe,
  DollarSign,
  AlertTriangle,
  Compass
} from 'lucide-react';

interface GuideTopic {
  id: string;
  category: 'core' | 'soil' | 'water' | 'crops' | 'pests' | 'upgrades' | 'economy' | 'social';
  title: string;
  icon: string;
  badge: string;
  summary: string;
  details: string[];
  mechanics: { label: string; value: string }[];
  proTip: string;
}

const GUIDE_TOPICS: GuideTopic[] = [
  // --- CORE GAMEPLAY & LOOP ---
  {
    id: 'scenery_and_backgrounds',
    category: 'core',
    title: 'Farm Scenery & Background Image Options',
    icon: '🖼️',
    badge: 'Visuals',
    summary: 'Personalize your farming world with curated agroforestry landscape backdrops, ambient wallpaper, seasonal auto-matching, or your own uploaded images.',
    details: [
      'Click the "Scenery" button in the top navigation bar or the "Scenery: [Preset] ▾" pill on the canvas to open visual customization.',
      'Curated Presets: Choose between Agroforestry Terraces (misty polyculture hills), Golden Prairie Hour (sunlit meadow), Alpine Permaculture (snow peaks & pine borders), Twilight Firefly Homestead, Living Rhizosphere Matrix, and Dawn Forest Edge.',
      'Seasonal Sync: Enable "Auto Season Sync" so the landscape dynamically shifts with Spring, Summer, Autumn, and Winter in your simulation.',
      'Custom Images: Upload your own high-resolution farm photo, drone landscape survey, or paste an image URL.',
      'Fine-Tuning: Adjust canvas landscape opacity (10–100%), ambient app wallpaper opacity, blur depth (Crisp, Soft, Atmospheric, Dreamy), and edge vignette to maintain pristine readability of your soil readouts.'
    ],
    mechanics: [
      { label: 'Access Button', value: 'Top bar "Scenery" & Canvas Quick Toggle' },
      { label: 'Curated Presets', value: '6 High-Res Agroecological Panoramas' },
      { label: 'Custom Uploads', value: 'JPG, PNG, WebP local file or URL' },
      { label: 'Dynamic Sync', value: 'Automatic seasonal landscape matching' }
    ],
    proTip: 'Use the quick-cycle button (sparkle icon) on the canvas header to instantly cycle through scenic backdrops without leaving your field!'
  },
  {
    id: 'agricultural_quizzes_and_grants',
    category: 'core',
    title: 'Agro-Science Quizzes & Research Grants',
    icon: '🌾',
    badge: 'Education',
    summary: 'Earn immediate cash research grants and EcoPoints by answering science-backed questions on soil biology, hydrology, IPM, polyculture, and UN SDGs.',
    details: [
      'Accessible anytime via the "Agro-Quiz" button located in the topmost right corner of the dashboard header.',
      'Topic Disciplines: Living Soil Biology, Hydrology & Water Stewardship, Polyculture & Crop Rotation, Organic IPM & Pollinators, Climate Resilience, Heirloom Seeds, and UN SDGs.',
      'Immediate Financial Grants: Each correct answer awards real cash (e.g. +$180 to +$350) and EcoPoints directly credited to your farm ledger.',
      'Consecutive Streak Multipliers: Answering 3, 5, 8, and 12 questions correctly in a row triggers massive academic streak bonuses—up to +$2,500 cash grants and prestige badges.',
      'Scientific Explanations: Every question includes an in-depth "Agronomy Insight" explaining real-world physical and biochemical mechanisms (such as AMF hyphae networks, C4 photosynthesis, and allelopathy).'
    ],
    mechanics: [
      { label: 'Location', value: 'Topmost Right Corner ("Agro-Quiz")' },
      { label: 'Cash Rewards', value: '+$150 to +$350 per answer' },
      { label: 'EcoPoint Rewards', value: '+40 to +75 pts per answer' },
      { label: 'Streak Bonuses', value: 'Up to +$2,500 cash & +600 pts' }
    ],
    proTip: 'Stuck on early farm funds? Take the quiz in the top-right corner to earn several hundred dollars in research grants to afford drip irrigation and heirloom seeds without going into debt!'
  },
  {
    id: 'core_loop',
    category: 'core',
    title: 'Core Game Objective & The 6×6 Grid',
    icon: '🌱',
    badge: 'Foundation',
    summary: 'Manage a 36-sector farm to transition from degraded monoculture to a regenerative, climate-resilient, profitable agroecosystem.',
    details: [
      'Your farm consists of 36 tiles (6×6 grid). Each tile has its own living soil biology: Soil Organic Matter (SOM), Soil Nitrogen (N), Moisture, Compaction, Salinity, Pests, and Beneficial Insects.',
      'Time progresses automatically in days (90 days = 1 Season, taking ~3 minutes at 1x speed). 4 seasons make 1 Year (Spring, Summer, Autumn, Winter).',
      'At the end of each season, crops are harvested, income and input bills are settled, and a Season Audit Report compares your farm against a conventional monoculture neighbor.'
    ],
    mechanics: [
      { label: 'Farm Grid', value: '36 sectors (6x6)' },
      { label: 'Season Length', value: '90 Days (~3 mins at 1x)' },
      { label: 'Year Cycle', value: 'Spring → Summer → Autumn → Winter' },
      { label: 'Fast Forward', value: 'Advance season anytime via top bar' }
    ],
    proTip: 'Use the "Apply to All" button in the action bar to execute actions across all 36 sectors at once, saving time when planting or mulching!'
  },
  {
    id: 'time_controls',
    category: 'core',
    title: 'Simulation Speed & Season Advances',
    icon: '⏱️',
    badge: 'Controls',
    summary: 'Control the pace of living ecological time with Play, Pause, 1x, 2x, 5x, and Instant Season Advance.',
    details: [
      'Pause anytime to inspect individual tiles, plan crop rotations, or apply tools without losing seasonal days.',
      'Speed buttons (1x, 2x, 5x) allow you to observe biological processes unfold in real time or accelerate through vegetative growth.',
      'The "Next Season" fast-forward button takes you directly to the harvest transition, triggering the comprehensive financial and environmental Season Report.'
    ],
    mechanics: [
      { label: '1x Speed', value: '1 day per 2.0s (Normal)' },
      { label: '2x Speed', value: '1 day per 1.0s (Fast)' },
      { label: '5x Speed', value: '1 day per 0.4s (Ultra)' }
    ],
    proTip: 'Pause the game when an unseasonal weather alert (like a Heatwave or Pest Swarm) occurs to deploy protective mulch or biological predators before crops take damage.'
  },

  // --- SOIL HEALTH & BIOLOGY ---
  {
    id: 'soil_organic_matter',
    category: 'soil',
    title: 'Soil Organic Matter (SOM) & The Soil Sponge',
    icon: '🧽',
    badge: 'Soil Core',
    summary: 'SOM is the cornerstone of agroecology. Every 1% increase in SOM allows soil to absorb and hold 20,000+ gallons of water per acre.',
    details: [
      'Degraded soil has low SOM (<15%), leading to rapid evaporation, crusting, and poor water infiltration during rainstorms.',
      'Healthy soil with 40–80% SOM acts as a living sponge: it absorbs monsoon rains, feeds beneficial soil microbes, and steadily releases moisture during dry spells.',
      'You can build SOM by mulching crop residue, planting high-biomass cover crops, applying compost, and avoiding destructive tillage.'
    ],
    mechanics: [
      { label: 'Degraded Soil', value: '< 15% SOM (Dust/Cracked)' },
      { label: 'Healthy Loam', value: '25% - 40% SOM' },
      { label: 'Living Sponge', value: '45%+ SOM (Rich Black Humus)' },
      { label: 'Water Holding', value: '+1% SOM = +20,000 gal/acre' }
    ],
    proTip: 'Never leave the ground bare. Applying mulch or growing living cover crops keeps SOM from oxidizing into atmospheric carbon dioxide.'
  },
  {
    id: 'earthworms_microbes',
    category: 'soil',
    title: 'Earthworm Colonies & Beneficial Microbes',
    icon: '🪱',
    badge: 'Biology',
    summary: 'Earthworms are nature’s subterranean tillage crew. They bore channels for deep root penetration and produce nutrient-rich vermicast.',
    details: [
      'Earthworms thrive in soils with abundant organic residue, adequate moisture, and undisturbed microbial mycorrhizal fungi.',
      'High worm populations naturally reduce soil compaction without mechanical plows, and boost natural nitrogen cycling.',
      'Warning: Stubble burning and synthetic chemical sprays drastically kill earthworm populations, setting back biological recovery by multiple seasons.'
    ],
    mechanics: [
      { label: 'Low Colony', value: '0 - 15 worms/tile' },
      { label: 'Thriving Colony', value: '30+ worms/tile' },
      { label: 'Killed By', value: 'Stubble burning & synthetic pesticides' },
      { label: 'Boosted By', value: 'Mulch, compost & continuous roots' }
    ],
    proTip: 'Reach 30+ earthworms per tile to unlock the "Earthworm Colony" watershed milestone and reduce compaction passively every week.'
  },
  {
    id: 'soil_residue',
    category: 'soil',
    title: 'Residue Management: Mulch vs. Till vs. Burn',
    icon: '🛡️',
    badge: 'Residue Tools',
    summary: 'What you do after harvest defines your soil destiny: protect with mulch, degrade with tillage, or destroy with fire.',
    details: [
      'Mulch (Soil Armor): Protects topsoil from blistering sun (reducing surface temp up to 15°C), prevents weed germination, stops moisture evaporation, and decomposes into humus.',
      'Till (Mechanical Tillage): Mechanically loosens weeds and topsoil, but shatters fungal networks, oxidizes SOM into greenhouse gas, and forms a dense subsoil hardpan.',
      'Burn (Crop Stubble Burning): An illegal, catastrophic practice in modern farming. Destroys all organic carbon, kills worms, emits toxic smoke, and leaves sterile ash.'
    ],
    mechanics: [
      { label: 'Mulch Cost', value: '$1.50 / tile (Saves water & builds SOM)' },
      { label: 'Till Cost', value: '$3.00 / tile (Increases compaction & oxidation)' },
      { label: 'Burn Cost', value: '$0 (Kills biology & incurs eco penalty)' }
    ],
    proTip: 'Always choose Mulch! It pays for itself within 1 season by cutting irrigation pumping costs in half.'
  },
  {
    id: 'compaction_salinity',
    category: 'soil',
    title: 'Compaction (Hardpan) & Salinity',
    icon: '🧱',
    badge: 'Soil Stress',
    summary: 'Learn how to detect and reverse underground physical hardpans and toxic salt crusts.',
    details: [
      'Compaction occurs from repeated heavy machinery passes or frequent tillage, forming an impermeable subsurface barrier (hardpan) that halts root penetration and causes water to puddle.',
      'Salinity builds up when flood irrigation evaporates rapidly under hot sun, leaving dissolved mineral salts on the surface that dehydrate plant roots.',
      'Remedy compaction with deep-taproot cover crops (like Daikon Radish or Mustard) and earthworms. Remedy salinity with drip irrigation and high organic matter buffers.'
    ],
    mechanics: [
      { label: 'Compaction Risk', value: '> 40% causes crop stunting' },
      { label: 'Salinity Risk', value: '> 35% reduces yields by 30%' },
      { label: 'Cure for Hardpan', value: 'Earthworms, No-Till & Cover Crops' },
      { label: 'Cure for Salinity', value: 'Drip lines & Organic Compost' }
    ],
    proTip: 'Click on any tile to open the Tile Inspector and check its exact compaction and salinity levels.'
  },

  // --- WATER & HYDROLOGY ---
  {
    id: 'aquifer_water_table',
    category: 'water',
    title: 'The Subsurface Aquifer & Groundwater Table',
    icon: '💧',
    badge: 'Hydrology',
    summary: 'Track the geological cross-section below your farm: monitor water table depth, seasonal recharge, and depletion risks.',
    details: [
      'Beneath your 6×6 farm lies the regional groundwater aquifer, rendered in real time in the cross-section panel at the bottom of the screen.',
      'Pumping groundwater for irrigation lowers the water table. If it drops below 25 meters, pumps run dry and deep emergency drilling costs skyrocket!',
      'Recharge the aquifer through rainwater infiltration (enabled by high SOM), building a Farm Rainwater Pond, and switching from flood to drip irrigation.'
    ],
    mechanics: [
      { label: 'Baseline Depth', value: '14.0m below surface' },
      { label: 'Critical Drought', value: '> 25.0m (Wells run dry)' },
      { label: 'Healthy Aquifer', value: '< 10.0m (Lush perennial flow)' },
      { label: 'Recharge Methods', value: 'Farm Pond, Mulch, High SOM' }
    ],
    proTip: 'In Arid and Semi-Arid climate zones, flood irrigation will drain the aquifer twice as fast. Install drip lines immediately!'
  },
  {
    id: 'irrigation_methods',
    category: 'water',
    title: 'Irrigation Methods: Flood vs. Micro-Drip',
    icon: '🚿',
    badge: 'Water Efficiency',
    summary: 'Compare water consumption, pumping expenses, and soil health impacts between traditional flood and precision drip irrigation.',
    details: [
      'Flood Irrigation: Cheap to initiate ($0.50/tile) but loses up to 60% of pumped water to evaporation, increases surface crusting, and causes secondary salinization.',
      'Drip Irrigation: Precision micro-tubing delivers water straight to plant root zones. Reduces water demand by up to 60%, prevents fungal leaf diseases, and conserves the aquifer.',
      'Unlocked via the Farm Infrastructure upgrade menu once you invest in drip line technology.'
    ],
    mechanics: [
      { label: 'Flood Consumption', value: 'High draw (100% baseline)' },
      { label: 'Drip Consumption', value: 'Low draw (40% of baseline)' },
      { label: 'Aquifer Impact', value: 'Drip reduces pumping draw by 60%' }
    ],
    proTip: 'Pairing Drip Irrigation with Mulch almost eliminates irrigation water loss, protecting profits during severe heatwaves.'
  },

  // --- CROPS & ROTATION ---
  {
    id: 'crop_types_seasons',
    category: 'crops',
    title: 'Crop Portfolio, Seasons & Growth Stages',
    icon: '🌾',
    badge: 'Planting',
    summary: 'Grow a diverse portfolio of Cereals, Legumes, Cash Crops, Cover Crops, and Trap Crops adapted to distinct seasons.',
    details: [
      'Cereals (Wheat, Millet): High biomass and reliable cash grain, but consume soil nitrogen.',
      'Legumes (Chickpea, Cowpea, Clover): Symbiotic rhizobia bacteria in root nodules fix atmospheric nitrogen directly into the soil, replenishing fertility for free!',
      'Cover Crops (Mustard, Daikon): Planted between seasons to cover soil, break compaction, and build immense organic matter without being sold.',
      'Growth Stages: Seeded (Stage 0) → Sprout (Stage 1) → Vegetative (Stage 2) → Mature Ready to Harvest (Stage 3).'
    ],
    mechanics: [
      { label: 'Nitrogen Fixers', value: 'Chickpea (+15 N), Cowpea (+18 N)' },
      { label: 'Drought Champions', value: 'Pearl Millet, Sorghum' },
      { label: 'High Biomass', value: 'Mustard, Sunn Hemp' },
      { label: 'Harvest Ready', value: 'Golden wheat icon at Stage 3' }
    ],
    proTip: 'Rotate a cereal with a legume every other season to never pay for synthetic nitrogen fertilizer again!'
  },
  {
    id: 'polyculture_rotation',
    category: 'crops',
    title: 'Polyculture, Intercropping & Crop Rotation',
    icon: '🌽',
    badge: 'Agroecology',
    summary: 'Mimic natural ecosystems by planting companion species and avoiding monoculture exhaustion.',
    details: [
      'Monoculture Penalty: Planting the same crop on the same tile repeatedly builds up species-specific pests, depletes specific nutrient horizons, and triggers soil exhaustion penalties.',
      'Polyculture Maestro: Growing 4 or more distinct crop species across the farm at the same time creates biological niches, confuses pests, and earns huge Eco-Points.',
      'The Three Sisters guild (Corn, Beans, Squash) is the world’s oldest agroecological polyculture: corn provides a trellis, beans fix nitrogen, and squash mulches the ground with broad leaves.'
    ],
    mechanics: [
      { label: 'Monoculture Risk', value: '3+ seasons of same crop = pest spike' },
      { label: 'Polyculture Bonus', value: '+200 Eco-Points & pest reduction' },
      { label: 'Crop History', value: 'Tracked on every tile in Inspector' }
    ],
    proTip: 'Mix border rows of flowering cover crops next to your main cash crops to attract beneficial pollinators and pest predators.'
  },

  // --- PEST CONTROL & BIODIVERSITY ---
  {
    id: 'pest_vs_beneficial',
    category: 'pests',
    title: 'Pest Pressure vs. Beneficial Predators',
    icon: '🐞',
    badge: 'Biological Balance',
    summary: 'Nature already has an army of pest controllers: ladybugs, lacewings, parasitic wasps, and spiders. Keep them alive!',
    details: [
      'Pest pressure rises during warm weather, monoculture planting, and when beneficial insect habitats are destroyed.',
      'Beneficial insects naturally prey upon aphids, caterpillar larvae, and stem borers, keeping pest populations below economic injury thresholds.',
      'Chemical pesticides kill 99% of pests immediately, but also eradicate 100% of beneficial predators, causing subsequent pest swarms to explode unopposed.'
    ],
    mechanics: [
      { label: 'Beneficial Insects', value: 'Parasitic wasps, ladybugs, spiders' },
      { label: 'Resilience Threshold', value: 'Beneficials > 40 = natural pest suppression' },
      { label: 'Trap Crops', value: 'Mustard/Marigold borders divert pests' }
    ],
    proTip: 'Plant flowering borders and install Agroforestry windbreaks to maintain a permanent year-round sanctuary for predatory insects.'
  },
  {
    id: 'biocontrol_vs_chemical',
    category: 'pests',
    title: 'Chemical Spray vs. Biocontrol & Trap Borders',
    icon: '🛡️',
    badge: 'Pest Defense',
    summary: 'Understand the long-term economic and ecological trade-offs of synthetic pesticides versus biological controls.',
    details: [
      'Chemical Spray: Immediate quick fix ($16/tile). Eradicates pests today, but sterilizes earthworms, creates chemical runoff into the groundwater, and resets your Organic Certification counter to 0!',
      'Biocontrol: Releases beneficial ladybugs and predatory mites ($7/tile). Non-toxic, establishes persistent predator populations, and preserves your organic status.',
      'Trap Borders: Planting sacrificial pest-attracting plants along farm perimeters to intercept migratory insect swarms before they reach cash crops.'
    ],
    mechanics: [
      { label: 'Chemical Spray', value: '$16/tile, resets Organic streak' },
      { label: 'Biocontrol Release', value: '$7/tile, preserves certification' },
      { label: 'Chemical Residue', value: 'Taints farm for 3 full seasons' }
    ],
    proTip: 'Staying chemical-free for 3 consecutive seasons unlocks Certified Organic status, granting a permanent +50% price bonus on all crop sales!'
  },

  // --- INFRASTRUCTURE & UPGRADES ---
  {
    id: 'farm_upgrades',
    category: 'upgrades',
    title: 'Farm Infrastructure Upgrades',
    icon: '🏗️',
    badge: 'Investments',
    summary: 'Reinvest farm profits into regenerative infrastructure that permanently transforms your ecosystem.',
    details: [
      'Drip System ($350): Unlocks precision drip irrigation, saving 60% of water and ending evaporative salinity.',
      'Agroforestry Windbreak ($450): Deep-rooted fruit and timber trees along farm borders buffer harsh winds, lower summer heat, and shelter wild pollinators.',
      'Compost Bay ($280): Recycles organic crop waste to produce free high-grade microbial compost each season.',
      'Farm Rainwater Pond ($600): Collects monsoon runoff, stops erosion gullies, and acts as an aquifer percolation tank.',
      'Livestock Integration ($500): Integrates rotational grazing animals (cattle/sheep) that deposit natural manure and stimulate root exudates.'
    ],
    mechanics: [
      { label: 'Drip Irrigation', value: '-60% Water Pumping Draw' },
      { label: 'Agroforestry', value: '-3°C Heat Stress, +Wind Protection' },
      { label: 'Farm Pond', value: '+0.8m Aquifer Recharge / season' },
      { label: 'Livestock', value: '+10 Natural Nitrogen & +SOM' }
    ],
    proTip: 'Prioritize the Compost Bay and Agroforestry borders early—they generate compounding passive fertility every season.'
  },

  // --- ECONOMY, CONTRACTS & CERTIFICATION ---
  {
    id: 'organic_certification',
    category: 'economy',
    title: 'Certified Organic Status (+50% Market Premium)',
    icon: '🏅',
    badge: 'Certification',
    summary: 'The holy grail of agroecological economics: transition your farm to chemical-free farming to earn certified organic premiums.',
    details: [
      'To earn Certified Organic status, you must maintain 3 consecutive seasons without using synthetic NPK fertilizers or chemical pesticide sprays.',
      'Once certified, every crop harvested sells for a 50% premium above standard market prices, permanently supercharging farm cash flow.',
      'Warning: Using even a single synthetic chemical or burning stubble immediately revokes your certification and restarts the 3-season transition clock!'
    ],
    mechanics: [
      { label: 'Required Streak', value: '3 consecutive chem-free seasons' },
      { label: 'Market Bonus', value: '+50% cash on all harvests' },
      { label: 'Status Tracker', value: 'Visible on top-right status bar' }
    ],
    proTip: 'If pests surge while working toward organic certification, use Biocontrol or plant Trap Borders instead of spraying chemicals.'
  },
  {
    id: 'fair_trade_contracts',
    category: 'economy',
    title: 'Fair Trade & Artisanal Buyer Contracts',
    icon: '📜',
    badge: 'Markets',
    summary: 'Fulfill forward buyer contracts with artisan bakeries, organic co-ops, and premium millers.',
    details: [
      'Open the "Contracts" modal to view active commercial opportunities from discerning regional buyers.',
      'Premium contracts offer guaranteed payouts for delivering specific crops (e.g. 500kg of organic durum wheat or non-GMO chickpeas).',
      'Meeting contract quotas guarantees cash reserves even during dry seasons with volatile commodity spot markets.'
    ],
    mechanics: [
      { label: 'Open Contracts', value: 'Check Contracts modal in top menu' },
      { label: 'Contract Perks', value: 'Up to 2x spot market price payouts' },
      { label: 'Fulfillment', value: 'Auto-credited upon harvest transition' }
    ],
    proTip: 'Plan your seasonal crop planting around the active contract requirements to maximize dollar yield per acre.'
  },

  // --- COMMUNITY, WATERSHED & SCORING ---
  {
    id: 'watershed_neighbors',
    category: 'social',
    title: 'The Watershed Neighbor Network',
    icon: '🤝',
    badge: 'Community',
    summary: 'Your farm does not exist in isolation: work with neighboring farms in the regional watershed.',
    details: [
      'The aquifer below your farm is shared by neighboring conventional and organic farmers alike. If everyone pumps excessively, the entire valley suffers groundwater depletion.',
      'Participate in the Neighbor Cooperative: share expensive machinery (like no-till seed drills), establish continuous biodiversity wildlife corridors, and negotiate water pumping covenants.',
      'Support neighbors transitioning away from chemical dependency to earn community stewardship bonuses.'
    ],
    mechanics: [
      { label: 'Access', value: 'Click "Neighbors" in top menu' },
      { label: 'Co-op Benefits', value: 'Shared machinery discounts & water security' },
      { label: 'Wildlife Corridors', value: '+Beneficial insect migration' }
    ],
    proTip: 'Establishing shared biodiversity corridors with neighbors boosts your beneficial insect baseline across all 36 sectors.'
  },
  {
    id: 'eco_points_leaderboard',
    category: 'social',
    title: 'Eco-Points, 13 Badges & Watershed League',
    icon: '🏆',
    badge: 'Gamification',
    summary: 'Climb the Watershed Standings from Novice Tiller to Agroecology Master while unlocking 13 prestigious badges.',
    details: [
      'Eco-Points are awarded for regenerative actions: building SOM, mulching sectors, harvesting polycultures, recharging the aquifer, and avoiding chemicals.',
      'Level Up: Advance through 5 farmer levels: Novice Tiller → Soil Apprentice → Conservation Grower → Master Agroecologist → Living Earth Steward.',
      'Unlock 13 Badges across Soil Health, Water Stewardship, Biodiversity, and Economic Resilience to cement your legacy in the Watershed Hall of Fame.'
    ],
    mechanics: [
      { label: 'Total Badges', value: '13 unlockable achievements' },
      { label: 'Levels', value: '5 progressive mastery tiers' },
      { label: 'Leaderboard', value: 'Compare your farm with regional peers' }
    ],
    proTip: 'Check the Leaderboard modal (Trophy icon on top bar) to see the exact requirements for each remaining locked badge.'
  },
  {
    id: 'sdg_educational_impact',
    category: 'social',
    title: 'UN Sustainable Development Goals (SDGs) & Carbon Storage',
    icon: '🌍',
    badge: 'Global Science',
    summary: 'Discover how your in-game farming choices connect to real-world UN SDGs and atmospheric carbon sequestration.',
    details: [
      'The Ecological Impact Dashboard calculates your real-time carbon sequestration: converting soil organic matter percentage into tons of atmospheric CO₂ sequestered.',
      'Your farm directly advances 7 United Nations SDGs: SDG 2 (Zero Hunger), SDG 6 (Clean Water & Sanitation), SDG 8 (Decent Work), SDG 12 (Responsible Consumption), SDG 13 (Climate Action), and SDG 15 (Life on Land).',
      'The Agro Academy features scientific explanations and research references on regenerative agriculture worldwide.'
    ],
    mechanics: [
      { label: 'SDGs Tracked', value: '7 UN Sustainable Development Goals' },
      { label: 'Carbon Storage', value: 'Calculated in tons CO₂ sequestered' },
      { label: 'Agro Academy', value: 'In-depth science lessons & field manuals' }
    ],
    proTip: 'Explore the "Agro Academy" modal in the top menu whenever you want to read real agronomic science behind any in-game mechanic!'
  }
];

export const GameGuideModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const openModal = useGameStore((state) => state.openModal);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>('core_loop');

  const categories = [
    { id: 'all', label: 'All Topics', icon: '📚' },
    { id: 'core', label: 'Core Loop & Controls', icon: '🌱' },
    { id: 'soil', label: 'Soil Health & SOM', icon: '🧽' },
    { id: 'water', label: 'Water & Aquifer', icon: '💧' },
    { id: 'crops', label: 'Crops & Rotation', icon: '🌾' },
    { id: 'pests', label: 'Pests & Biodiversity', icon: '🐞' },
    { id: 'upgrades', label: 'Infrastructure', icon: '🏗️' },
    { id: 'economy', label: 'Organic & Contracts', icon: '🏅' },
    { id: 'social', label: 'Community & Badges', icon: '🏆' },
  ];

  const filteredTopics = useMemo(() => {
    return GUIDE_TOPICS.filter((topic) => {
      if (selectedCategory !== 'all' && topic.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = topic.title.toLowerCase().includes(q);
        const matchesSummary = topic.summary.toLowerCase().includes(q);
        const matchesBadge = topic.badge.toLowerCase().includes(q);
        const matchesDetails = topic.details.some(d => d.toLowerCase().includes(q));
        const matchesProTip = topic.proTip.toLowerCase().includes(q);
        return matchesTitle || matchesSummary || matchesBadge || matchesDetails || matchesProTip;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  if (activeModal !== 'guide') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden text-stone-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/90 via-stone-900 to-amber-950/80 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="guide-modal-title" className="text-base sm:text-lg font-black tracking-tight text-stone-100">
                  TerraFarm Field Guide & Almanac
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold tracking-wider">
                  Complete Codex
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Comprehensive explanation of every feature, agronomic mechanic, tool, and ecosystem dynamic in the game.
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            title="Close Field Guide (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 sm:p-4 bg-stone-950/60 border-b border-stone-800 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any feature (e.g. SOM, mulch, groundwater, earthworms, organic, drip)..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-8 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-stone-400 font-mono self-end sm:self-center shrink-0">
              Showing <span className="text-emerald-400 font-bold">{filteredTopics.length}</span> of {GUIDE_TOPICS.length} guides
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-700">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md font-bold'
                    : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin scrollbar-thumb-stone-700">
          {filteredTopics.length === 0 ? (
            <div className="p-8 text-center bg-stone-950/40 rounded-xl border border-stone-800">
              <Compass className="w-10 h-10 text-stone-600 mx-auto mb-2 animate-bounce" />
              <div className="text-sm font-bold text-stone-300">No matching game features found</div>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Try searching for broader keywords like "soil", "water", "irrigate", "pest", "crop", or clear the filter.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-3 px-3 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Reset Search & Categories
              </button>
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isExpanded = expandedTopicId === topic.id;
              return (
                <div
                  key={topic.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'bg-stone-900/95 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/20' 
                      : 'bg-stone-950/50 border-stone-800/90 hover:border-stone-700 hover:bg-stone-900/60'
                  }`}
                >
                  {/* Topic Card Header */}
                  <div
                    onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                    className="p-3 sm:p-4 cursor-pointer flex items-center justify-between gap-3 select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-800/90 border border-stone-700/80 flex items-center justify-center text-xl shrink-0">
                        {topic.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-stone-100">
                            {topic.title}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-emerald-300 border border-emerald-500/30 font-semibold">
                            {topic.badge}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                          {topic.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`p-1 rounded-lg text-stone-400 hover:text-white transition-transform duration-200 ${isExpanded ? 'rotate-90 text-emerald-400' : ''}`}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detailed Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-1 border-t border-stone-800/80 space-y-4 bg-stone-950/40 animate-in fade-in duration-150">
                      {/* Detailed Explanations */}
                      <div className="space-y-2">
                        <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>How This Mechanic Works in TerraFarm</span>
                        </div>
                        <div className="space-y-1.5">
                          {topic.details.map((detail, idx) => (
                            <div key={idx} className="text-xs text-stone-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Simulation Specifications */}
                      {topic.mechanics.length > 0 && (
                        <div>
                          <div className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-2">
                            Key Metrics & Telemetry Values
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {topic.mechanics.map((m, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 flex flex-col">
                                <span className="text-[10px] text-stone-400 uppercase font-mono">{m.label}</span>
                                <span className="text-xs font-bold text-stone-200 mt-0.5">{m.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strategic Pro-Tip */}
                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs shrink-0 mt-0.5">
                          💡
                        </div>
                        <div>
                          <div className="text-xs font-bold text-amber-300">
                            Agronomist Pro-Tip
                          </div>
                          <div className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
                            {topic.proTip}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick Modal Launcher Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs text-stone-400">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-stone-300">Jump directly to related feature:</span>
            <button
              onClick={() => openModal('climate')}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-sky-500 transition-colors"
            >
              🌍 Biomes
            </button>
            <button
              onClick={() => openModal('upgrades')}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-blue-500 transition-colors"
            >
              🏗️ Upgrades
            </button>
            <button
              onClick={() => openModal('contracts')}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-amber-500 transition-colors"
            >
              📜 Contracts
            </button>
            <button
              onClick={() => openModal('academy')}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-emerald-500 transition-colors"
            >
              🎓 Academy & SDGs
            </button>
            <button
              onClick={() => openModal('leaderboard')}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-amber-400 transition-colors"
            >
              🏆 Badges & Standings
            </button>
          </div>

          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-colors shrink-0"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
