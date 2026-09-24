export interface NeighborProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  accentColor: string;
  farmType: string;
  bio: string;
  philosophy: string;
  heirloomOffered: string[]; // crop IDs
  dialogues: NeighborDialogueTopic[];
}

export interface NeighborDialogueTopic {
  id: string;
  title: string;
  icon: string;
  playerPrompt: string;
  response: string;
  agronomicInsight: string;
  trustBonus: number;
}

export const NEIGHBORS: NeighborProfile[] = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Regenerative Agriculture Mentor',
    avatar: '👩🏽‍🌾',
    accentColor: '#10b981',
    farmType: 'Biological Polyculture & Agroforestry',
    bio: 'Priya transformed 15 hectares of eroded, parched scrubland into a lush, thriving oasis over the past 8 years using living mulch, multi-species cover crops, and native windbreaks.',
    philosophy: '“Soil is not dirt to be injected with chemicals; it is a living, breathing digestive system. Feed the subterranean microbes, and they will feed the world.”',
    heirloomOffered: ['heirloom_cowpea', 'heirloom_borage'],
    dialogues: [
      {
        id: 'priya_drought',
        title: 'How does your soil absorb droughts so effortlessly?',
        icon: '💧',
        playerPrompt: 'Priya, during the last heatwave, neighboring wells ran dry, but your crops stayed green. How do you manage water so effectively?',
        response: 'Every 1% increase in Soil Organic Matter allows the soil to retain an extra 20,000 gallons of water per acre! My living mulch armor acts as a solar shield, cutting soil evaporation by 70%. When rain finally comes, the spongy humus acts like a vast reservoir instead of letting water wash away as muddy runoff.',
        agronomicInsight: 'High SOM turns fields into sponge aquifers. In bare soil, midday surface temperatures often exceed 50°C, sterilizing microbes and baking moisture out.',
        trustBonus: 10
      },
      {
        id: 'priya_mycelium',
        title: 'The Underground "Wood Wide Web" (Mycelial Networks)',
        icon: '🍄',
        playerPrompt: 'I’ve been inspecting the soil underground. What are those glowing white threads connecting crop roots?',
        response: 'Those are mycorrhizal fungal hyphae! They form symbiotic partnerships with 90% of land plants. The plants trade excess solar sugars for hard-to-reach minerals like phosphorus and zinc. When you till deeply or spray synthetic fungicides and salt fertilizers, you shatter these microscopic highways.',
        agronomicInsight: 'Mycorrhizal fungi extend the root surface area by up to 1,000%, dissolving tightly bound phosphorus that plant roots alone could never touch.',
        trustBonus: 12
      },
      {
        id: 'priya_legumes',
        title: 'Heirloom Cowpeas & Biological Nitrogen',
        icon: '🫘',
        playerPrompt: 'Can you tell me about the Crimson Velvet Cowpea seeds you keep in your seed bank?',
        response: 'They are an ancestral dryland legume adapted to parched soils. Their roots form massive clusters of pink nodules filled with symbiotic Rhizobia bacteria that suck inert nitrogen straight out of the atmosphere and fix it into plant-available fertility. Plant them, and your fertilizer bill drops to zero!',
        agronomicInsight: 'Biological nitrogen fixation via legumes generates plant-available ammonium without causing salinity spikes or greenhouse gas emissions associated with synthetic Haber-Bosch urea.',
        trustBonus: 15
      }
    ]
  },
  {
    id: 'abena',
    name: 'Abena Mensah',
    role: 'Ancestral Heirloom Seed Sanctuary Keeper',
    avatar: '👵🏿',
    accentColor: '#8b5cf6',
    farmType: 'Biodiversity Heritage & Landrace Conservation',
    bio: 'Abena curates a regional open-source seed library preserving hundreds of drought-resilient landraces bred by indigenous farming communities over hundreds of generations.',
    philosophy: '“A seed that cannot reproduce without corporate chemical inputs is a cage. Heirloom seeds carry the memory of ancient droughts, pest plagues, and climatic shifts in their DNA.”',
    heirloomOffered: ['heirloom_amaranth', 'heirloom_blue_corn'],
    dialogues: [
      {
        id: 'abena_landraces',
        title: 'Why do heirloom landraces outlast commercial hybrids?',
        icon: '🌾',
        playerPrompt: 'Commercial seed catalogs promise record yields from single-cross hybrids. Why should a farmer preserve heirloom landraces?',
        response: 'Commercial hybrids are bred for ideal conditions—heavy chemical cocktails, constant diesel irrigation, and uniform weather. When climate chaos hits, they collapse. Heirloom landraces carry massive genetic diversity within a single field. Some plants withstand sudden frost, others thrive in scorching heat, ensuring the community always harvests food.',
        agronomicInsight: 'Genetic diversity within open-pollinated landraces provides collective resilience against unexpected climatic extremes and emerging plant diseases.',
        trustBonus: 15
      },
      {
        id: 'abena_amaranth',
        title: 'The Sacred Highland Purple Amaranth',
        icon: '💜',
        playerPrompt: 'Tell me about the magnificent purple plumes of Highland Amaranth in your nursery.',
        response: 'Amaranth was cultivated for over 8,000 years in the Americas. It uses C4 photosynthetic machinery, meaning it photosynthesizes with supreme efficiency in blazing midday heat using a fraction of the water of wheat. It yields gluten-free super-protein grains, tender mineral-rich leaves, and leaves deep carbon biomass in the soil.',
        agronomicInsight: 'C4 plants have specialized Kranz leaf anatomy that minimizes photorespiration in high temperatures, making them unmatched climate-change resilient crops.',
        trustBonus: 15
      },
      {
        id: 'abena_blue_corn',
        title: 'Hopi Blue Heritage Maize & Deep Taproots',
        icon: '🌽',
        playerPrompt: 'How can Hopi Blue Corn grow in dry sand without irrigation?',
        response: 'Hopi farmers developed this variety over a thousand years on arid desert mesas. Instead of the shallow fibrous roots of modern corn, a single Hopi seed sends down an elongated subsoil taproot reaching deep water tables several meters below ground! It is a living masterclass in desert adaptation.',
        agronomicInsight: 'Deep taproot genetics allow desert landraces to access deep capillary groundwater, breaking subsoil compaction hardpans where machinery fails.',
        trustBonus: 15
      }
    ]
  },
  {
    id: 'mateo',
    name: 'Mateo Morales',
    role: 'Permaculture & Pollinator Haven Specialist',
    avatar: '🧑🏽‍🌾',
    accentColor: '#f59e0b',
    farmType: 'Insectary Corridors & Native Bee Sanctuaries',
    bio: 'Mateo designs biological insectary borders, flowering hedgerows, and beneficial insect sanctuaries that turn pest control into an automated natural service.',
    philosophy: '“Don’t fight pests with poison; invite their predators with nectar and shelter. Every pest outbreak is simply nature shouting that an ecological predator is missing.”',
    heirloomOffered: ['heirloom_marigold', 'heirloom_borage'],
    dialogues: [
      {
        id: 'mateo_pollinators',
        title: 'How do wild pollinators boost farm yields?',
        icon: '🐝',
        playerPrompt: 'Mateo, does having bees and butterflies flying across the field actually improve harvest profits?',
        response: 'Astonishingly so! Multi-visit cross pollination improves seed set, kernel weight, and fruit symmetry by 25% to 40%. Furthermore, hoverflies and ladybugs that feed on nectar as adults lay thousands of eggs whose larvae consume over 50 aphids and mites every single day!',
        agronomicInsight: 'Diverse wild pollinator communities provide pollination insurance even on cold or windy mornings when domesticated European honeybees stay inside hives.',
        trustBonus: 12
      },
      {
        id: 'mateo_borage',
        title: 'Starflower Borage: The 2-Minute Nectar Miracle',
        icon: '🌸',
        playerPrompt: 'Why is Borage called the ultimate companion plant?',
        response: 'Borage produces azure star-shaped flowers whose nectar cups replenish completely every two minutes! Native bumblebees, sweat bees, and honeybees swarm to it. Even better, its deep roots pull potassium and trace silica from the subsoil, enriching the mulch you lay down.',
        agronomicInsight: 'Continuous nectar-producing flowers anchor beneficial parasitic wasp populations permanently inside farm borders, preventing pest swarms before they begin.',
        trustBonus: 15
      },
      {
        id: 'mateo_nematodes',
        title: 'French Marigold: Biological Nematode Shield',
        icon: '🌼',
        playerPrompt: 'How does planting marigolds protect neighboring crops?',
        response: 'Marigold roots exude a biochemical compound called alpha-terthienyl. Parasitic root-knot nematodes absorb it and become sterile. Instead of buying expensive toxic chemical fumigants, a border of heritage marigolds purges root pests cleanly and naturally!',
        agronomicInsight: 'Botanical bio-fumigation using tagetes/marigold root exudates eliminates pathogenic nematodes while stimulating beneficial saprophytic soil fungi.',
        trustBonus: 15
      }
    ]
  },
  {
    id: 'suresh',
    name: 'Suresh Patel',
    role: 'Conventional Farmer in Transition',
    avatar: '👨🏽‍🌾',
    accentColor: '#f43f5e',
    farmType: 'Intensive Monoculture (Struggling with Hardpan & Debt)',
    bio: 'Suresh had record financial profits in Year 1 with heavy chemical fertilizer and flood pumping. By Year 3, subsoil compaction created an impenetrable hardpan, chemical costs tripled, and pesticide-resistant armyworms struck.',
    philosophy: '“I did everything the chemical agronomists told me to do... so why is my diesel pump straining and my soil hard as concrete? I need to find another way.”',
    heirloomOffered: [], // Suresh is learning and looking for help!
    dialogues: [
      {
        id: 'suresh_struggle',
        title: 'Suresh, how are your input costs and groundwater holding up?',
        icon: '⚠️',
        playerPrompt: 'Suresh, I noticed your tractor was struggling with the plow yesterday. What’s happening with the soil?',
        response: 'Brother, I don’t know what to do. The plow hit an impenetrable hardpan 15 centimeters down—it’s like bedrock. Last week’s rain just sat on top and drowned the seedlings because the water can’t penetrate. And my borewell is down to 26 meters. The chemical company told me to spray stronger acid, but it just made it worse!',
        agronomicInsight: 'Heavy synthetic NPK oxidizes soil carbon into CO2 gas, causing clay platelets to collapse together without humus cushions. This creates an impenetrable subsoil hardpan.',
        trustBonus: 10
      },
      {
        id: 'suresh_advice',
        title: 'Player Advice: Offer Cover Crop & Mulch Strategies',
        icon: '💡',
        playerPrompt: 'Suresh, try planting deep-taproot sunflowers or winter rye cover crops instead of deep plowing. Mulch the stubble instead of burning it!',
        response: 'You know... Priya told me the same thing. I thought mulching was lazy farming. But looking at your lush plots and dark spongy earth, I see the truth. Next season, I’m leaving the stubble on the field and trying a cover crop mix. Can you teach me how you manage pests without chemical poisons?',
        agronomicInsight: 'Farmer-to-farmer peer demonstration is the #1 catalyst for the global transition to agro-ecological farming worldwide.',
        trustBonus: 20
      }
    ]
  }
];
