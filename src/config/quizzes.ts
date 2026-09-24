export type QuizTopic = 'soil' | 'water' | 'rotation' | 'ipm' | 'climate' | 'heritage' | 'sdg';

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  topicLabel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reward: {
    ecoPoints: number;
    cash: number;
    specialBonus?: string;
  };
  sdgTag: string;
  agronomicPrinciple: string;
}

export interface QuizTopicMeta {
  id: QuizTopic;
  label: string;
  icon: string;
  description: string;
  accentColor: string;
}

export const QUIZ_TOPICS: QuizTopicMeta[] = [
  {
    id: 'soil',
    label: 'Living Soil Biology',
    icon: '🪱',
    description: 'Mycorrhizae, humic soil organic matter, earthworms & rhizosphere carbon',
    accentColor: 'amber'
  },
  {
    id: 'water',
    label: 'Hydrology & Water Stewardship',
    icon: '💧',
    description: 'Aquifer recharge, drip efficiency, swales & subsoil moisture',
    accentColor: 'sky'
  },
  {
    id: 'rotation',
    label: 'Polyculture & Crop Rotation',
    icon: '🌽',
    description: 'Symbiotic companion planting, nitrogen-fixing guilds & pest cycle disruption',
    accentColor: 'emerald'
  },
  {
    id: 'ipm',
    label: 'Organic IPM & Pollinators',
    icon: '🐝',
    description: 'Predatory insects, push-pull pest ecology & flowering hedgerows',
    accentColor: 'rose'
  },
  {
    id: 'climate',
    label: 'Climate Resilience & Drought',
    icon: '☀️',
    description: 'Evaporation physics, heat-tolerant C4 crops & microclimate moderation',
    accentColor: 'orange'
  },
  {
    id: 'heritage',
    label: 'Heirloom Seeds & Sovereignty',
    icon: '🌾',
    description: 'Open-pollinated genetics, landraces & seed preservation traditions',
    accentColor: 'purple'
  },
  {
    id: 'sdg',
    label: 'UN SDGs & Agro-Economics',
    icon: '🌍',
    description: 'Global food security, carbon sequestration & certified organic transition',
    accentColor: 'teal'
  }
];

export const AGRICULTURAL_QUIZZES: QuizQuestion[] = [
  // --- Category: Living Soil Biology ---
  {
    id: 'soil_01',
    topic: 'soil',
    topicLabel: 'Living Soil Biology',
    difficulty: 'Beginner',
    question: 'How do mycorrhizal fungi directly benefit crop root systems?',
    options: [
      'They produce chemical pesticides that sterilize the surrounding dirt',
      'Their fungal hyphae network extends the root absorption area by up to 1000%, scavenging phosphorus and water',
      'They feed exclusively on crop roots until the plant undergoes senescence',
      'They convert solid rocks into heavy synthetic nitrogen fertilizer crystals'
    ],
    correctIndex: 1,
    explanation: 'Arbuscular mycorrhizal fungi (AMF) form a mutualistic symbiosis with plant roots. In exchange for plant-synthesized sugars, their vast microscopic hyphae network extends deep into soil pores, acquiring immobile phosphorus, zinc, and water that roots alone cannot reach.',
    reward: { ecoPoints: 45, cash: 180 },
    sdgTag: 'SDG 15: Life on Land',
    agronomicPrinciple: 'Symbiotic Mycorrhizal Hyphae Network'
  },
  {
    id: 'soil_02',
    topic: 'soil',
    topicLabel: 'Living Soil Biology',
    difficulty: 'Intermediate',
    question: 'Why are earthworms considered "nature\'s plow" in regenerative agriculture?',
    options: [
      'They eat plant foliage to keep crop canopies short',
      'Their burrowing aerates compacted subsoil, increases infiltration 4-10×, and their casts are 5× richer in nitrogen than surrounding soil',
      'They eliminate all soil bacteria to create a sterile planting environment',
      'They warm the subsoil by generating geothermal heat waves'
    ],
    correctIndex: 1,
    explanation: 'Earthworms create macropores that dramatically accelerate water infiltration during heavy rain. Furthermore, vermicast (earthworm castings) contains concentrated microbial life, humic substances, and bio-available nitrogen, phosphorus, and potassium.',
    reward: { ecoPoints: 50, cash: 200 },
    sdgTag: 'SDG 15: Life on Land',
    agronomicPrinciple: 'Biological Soil Infiltration & Nutrient Cycling'
  },
  {
    id: 'soil_03',
    topic: 'soil',
    topicLabel: 'Living Soil Biology',
    difficulty: 'Master',
    question: 'Roughly how much additional water can 1 acre of soil hold for every 1% increase in Soil Organic Matter (SOM)?',
    options: [
      'About 100 to 200 gallons',
      'About 1,000 to 2,000 gallons',
      'About 20,000 to 27,000 gallons (approx. 75,000 to 100,000 liters)',
      'SOM does not affect water holding capacity'
    ],
    correctIndex: 2,
    explanation: 'According to USDA-NRCS research, each 1% increase in soil organic matter enables an acre of topsoil to store an extra 20,000 to 27,000 gallons of plant-available water. This acts as a subterranean sponge, dramatically buffering farms against severe droughts.',
    reward: { ecoPoints: 65, cash: 280, specialBonus: 'Soil Sponge Specialist' },
    sdgTag: 'SDG 6: Clean Water & SDG 13: Climate Action',
    agronomicPrinciple: 'Organic Matter Sponge Capacity'
  },
  {
    id: 'soil_04',
    topic: 'soil',
    topicLabel: 'Living Soil Biology',
    difficulty: 'Beginner',
    question: 'What primary organism lives in legume root nodules to perform biological nitrogen fixation?',
    options: [
      'Rhizobium bacteria',
      'Myxomycetes slime molds',
      'Root-knot nematodes',
      'Aphid colonies'
    ],
    correctIndex: 0,
    explanation: 'Rhizobium bacteria enter the root hairs of legumes (peas, beans, cowpeas, clover) forming specialized nodules. Using the enzyme nitrogenase, they crack the triple chemical bond of atmospheric N2 and convert it into ammonium (NH4+) accessible to crops.',
    reward: { ecoPoints: 40, cash: 160 },
    sdgTag: 'SDG 2: Zero Hunger',
    agronomicPrinciple: 'Biological Nitrogen Fixation'
  },
  {
    id: 'soil_05',
    topic: 'soil',
    topicLabel: 'Living Soil Biology',
    difficulty: 'Intermediate',
    question: 'What causes a dense "hardpan" layer to form beneath arable fields?',
    options: [
      'Frequent earthworm activity leaving sticky slime',
      'Excessive planting of deep-rooted daikon radishes',
      'Repeated heavy tractor traffic and continuous rotary tilling at the same soil depth',
      'Natural condensation of winter morning dew'
    ],
    correctIndex: 2,
    explanation: 'Subsoil compaction or hardpan occurs when heavy farm machinery presses downward and tillage blades smear the soil at a uniform depth year after year. This impenetrable layer stops taproots from reaching deep moisture and creates perched water tables.',
    reward: { ecoPoints: 50, cash: 210 },
    sdgTag: 'SDG 15: Life on Land',
    agronomicPrinciple: 'Subsoil Compaction Mitigation'
  },
  {
    id: 'soil_06',
    topic: 'soil',
    topicLabel: 'Living Soil Biology',
    difficulty: 'Master',
    question: 'Why is Biochar uniquely effective at long-term soil enhancement and carbon sequestration?',
    options: [
      'It instantly melts into liquid nitrogen upon contact with rainfall',
      'Its highly porous, pyrolyzed carbon skeleton persists for hundreds of years, providing immense surface area for beneficial microbes and nutrients',
      'It kills all fungi to prevent root rot diseases',
      'It dissolves subsoil rocks using synthetic hydrochloric acid'
    ],
    correctIndex: 1,
    explanation: 'Biochar is biomass baked at high temperatures without oxygen (pyrolysis). Its recalcitrant carbon ring structure resists microbial decay for centuries, boasting huge cation-exchange capacity (CEC) that locks in moisture and prevents nutrient leaching.',
    reward: { ecoPoints: 60, cash: 260 },
    sdgTag: 'SDG 13: Climate Action',
    agronomicPrinciple: 'Pyrogenic Carbon Recalcitrance'
  },

  // --- Category: Hydrology & Water Stewardship ---
  {
    id: 'water_01',
    topic: 'water',
    topicLabel: 'Hydrology & Water Stewardship',
    difficulty: 'Beginner',
    question: 'Why is drip irrigation significantly more water-efficient than overhead flood or sprinkler systems?',
    options: [
      'Drip irrigation uses chemical water that does not evaporate',
      'Drip delivers slow, targeted moisture directly to crop root zones, eliminating 40-60% loss from wind drift and surface evaporation',
      'Drip systems generate artificial rainclouds over the farm',
      'Drip water absorbs nitrogen directly from the sunlight'
    ],
    correctIndex: 1,
    explanation: 'Drip systems achieve 90-95% water-use efficiency because water is metered right at the soil surface near root zones. Overhead sprinklers lose substantial volume to airborne evaporation and wind drift before droplets ever hit the ground.',
    reward: { ecoPoints: 45, cash: 190 },
    sdgTag: 'SDG 6: Clean Water and Sanitation',
    agronomicPrinciple: 'Precision Root-Zone Water Delivery'
  },
  {
    id: 'water_02',
    topic: 'water',
    topicLabel: 'Hydrology & Water Stewardship',
    difficulty: 'Intermediate',
    question: 'In permaculture and regenerative earthworks, what is the core purpose of a "swale"?',
    options: [
      'To drain all surface water off the farm as rapidly as possible into municipal sewers',
      'To create deep swimming channels for farm livestock',
      'A water-harvesting ditch on contour designed to slow, spread, and sink runoff into the soil to recharge the aquifer',
      'To store chemical fertilizers in open pits during monsoon season'
    ],
    correctIndex: 2,
    explanation: 'Swales are shallow ditches dug along topographical contour lines. By stopping fast-moving stormwater runoff, swales give water time to infiltrate deep into the soil profile ("slow it, spread it, sink it"), creating a subterranean water lens and replenishing aquifers.',
    reward: { ecoPoints: 55, cash: 240 },
    sdgTag: 'SDG 6: Clean Water and Sanitation',
    agronomicPrinciple: 'Keyline Water Harvesting & Infiltration'
  },
  {
    id: 'water_03',
    topic: 'water',
    topicLabel: 'Hydrology & Water Stewardship',
    difficulty: 'Master',
    question: 'What dangerous soil condition occurs when arid farmland is heavily irrigated with saline groundwater without proper drainage?',
    options: [
      'Soil liquefied into pure silt',
      'Secondary Salinization: capillary action pulls dissolved salts to the surface as water evaporates, leaving toxic crusts',
      'Instant volcanic soil acidification',
      'Uncontrolled growth of oceanic corals in farm soil'
    ],
    correctIndex: 1,
    explanation: 'In dry climates with high evaporative demand, over-irrigating with mineralized groundwater causes capillary rise. As pure water evaporates into the hot air, dissolved sodium and calcium salts crystallize in the topsoil, eventually sterilizing the field.',
    reward: { ecoPoints: 65, cash: 290 },
    sdgTag: 'SDG 15: Life on Land',
    agronomicPrinciple: 'Capillary Action & Salinity Management'
  },
  {
    id: 'water_04',
    topic: 'water',
    topicLabel: 'Hydrology & Water Stewardship',
    difficulty: 'Beginner',
    question: 'How does maintaining organic mulch or crop residue on the soil surface protect water resources?',
    options: [
      'Mulch attracts underground geysers',
      'It acts as an insulating blanket, cooling the soil surface by 10-15°C and reducing evaporative moisture loss by up to 50%',
      'It prevents raindrops from ever touching the soil',
      'It turns groundwater into synthetic sugar'
    ],
    correctIndex: 1,
    explanation: 'Bare soil in full sun can heat up past 55°C, vaporizing moisture instantly and killing beneficial microbes. An organic mulch layer shields the soil from UV radiation, cushions raindrop impact to prevent crusting, and dramatically slows evaporation.',
    reward: { ecoPoints: 45, cash: 180 },
    sdgTag: 'SDG 12: Responsible Consumption',
    agronomicPrinciple: 'Surface Thermal Insulation & Mulch Shield'
  },

  // --- Category: Polyculture & Crop Rotation ---
  {
    id: 'rotation_01',
    topic: 'rotation',
    topicLabel: 'Polyculture & Crop Rotation',
    difficulty: 'Beginner',
    question: 'In the traditional Indigenous "Three Sisters" companion planting guild, what role does Winter Squash play?',
    options: [
      'It climbs up the bean stalks to reach the sun',
      'Its broad, prickly leaves spread across the soil as a living mulch, suppressing weeds and conserving moisture',
      'It injects potassium directly into the corn ears',
      'It attracts locusts away from the farm'
    ],
    correctIndex: 1,
    explanation: 'In the Three Sisters polyculture: Corn provides a vertical trellis; Climbing Beans fix nitrogen and anchor the corn stalks; Winter Squash acts as living armor, shading the soil to block weed growth and reduce moisture loss.',
    reward: { ecoPoints: 50, cash: 210 },
    sdgTag: 'SDG 2: Zero Hunger',
    agronomicPrinciple: 'Indigenous Polyculture Guild Dynamics'
  },
  {
    id: 'rotation_02',
    topic: 'rotation',
    topicLabel: 'Polyculture & Crop Rotation',
    difficulty: 'Intermediate',
    question: 'Why does rotating crops between botanical families disrupt persistent insect and pathogen outbreaks?',
    options: [
      'Pests get bored and migrate away to find television',
      'Most crop pests and soil-borne pathogens are host-specific; alternating families deprives them of their preferred host and breaks their reproduction cycle',
      'Rotating crops changes the Earth\'s magnetic field on the tile',
      'Crop rotation causes the field to turn acidic overnight'
    ],
    correctIndex: 1,
    explanation: 'Many pests (like corn rootworm or tomato blight) overwinter in soil waiting for their specific host plant. If a non-host botanical family (like brassicas or legumes) is planted next season, emerging pests starve before completing their lifecycle.',
    reward: { ecoPoints: 55, cash: 230 },
    sdgTag: 'SDG 12: Responsible Consumption',
    agronomicPrinciple: 'Pathogen Life-Cycle Disruption'
  },
  {
    id: 'rotation_03',
    topic: 'rotation',
    topicLabel: 'Polyculture & Crop Rotation',
    difficulty: 'Intermediate',
    question: 'What is "allelopathy" in agricultural cover cropping?',
    options: [
      'The ability of plants to hear pollinator wings',
      'The release of natural biochemical compounds by certain plants (like cereal rye or marigolds) that suppress weed seed germination and parasitic nematodes',
      'A disease caused by planting too many seeds in one hole',
      'A method of harvesting grain with laser beams'
    ],
    correctIndex: 1,
    explanation: 'Allelopathy is biological warfare between plants. Cereal rye exuded benzoxazinoids and French marigolds secrete alpha-terthienyl, which naturally inhibit weed germination and destroy parasitic root nematodes without synthetic chemical herbicides.',
    reward: { ecoPoints: 60, cash: 250 },
    sdgTag: 'SDG 15: Life on Land',
    agronomicPrinciple: 'Natural Biochemical Allelopathy'
  },
  {
    id: 'rotation_04',
    topic: 'rotation',
    topicLabel: 'Polyculture & Crop Rotation',
    difficulty: 'Master',
    question: 'Why is alternating "Heavy Feeders" (corn), "Heavy Givers" (legumes), and "Light Feeders" (root crops) optimal for soil stamina?',
    options: [
      'Because heavy feeders turn all soil rocks into sand',
      'It balances soil nutrient drawdown: legumes replenish bio-nitrogen after nitrogen-hungry cereals, while taprooted crops scavenge subsoil minerals without exhausting topsoil N-P-K',
      'It forces farm machinery to run at half fuel consumption',
      'Heavy feeders only grow during full moons'
    ],
    correctIndex: 1,
    explanation: 'A balanced 4-stage agro-ecological rotation cycles high-nitrogen consumers (maize/cotton) with nitrogen contributors (alfalfa/cowpea) and deep root foragers (carrots/daikon), preventing chronic nutrient depletion and maintaining biological equilibrium.',
    reward: { ecoPoints: 65, cash: 280, specialBonus: 'Master Agronomist Insight' },
    sdgTag: 'SDG 2: Zero Hunger & SDG 12: Responsible Consumption',
    agronomicPrinciple: 'Multi-Trophic Nutrient Stratification'
  },

  // --- Category: Organic IPM & Pollinators ---
  {
    id: 'ipm_01',
    topic: 'ipm',
    topicLabel: 'Organic IPM & Pollinators',
    difficulty: 'Beginner',
    question: 'How do Ladybug larvae and adult beetles act as biological pest controllers?',
    options: [
      'They chew through corn stalks to harvest sugar',
      'A single ladybug can consume 50-100 soft-bodied sap-sucking aphids, mites, and scale insects per day',
      'They inject plant leaves with chemical fungicides',
      'They build underground silk nests that trap field mice'
    ],
    correctIndex: 1,
    explanation: 'Coccinellidae (ladybugs) are voracious predatory insects. Both their spiky larvae and adult beetles hunt agricultural pests like aphids, spider mites, and whiteflies, delivering continuous pest suppression without synthetic neurotoxins.',
    reward: { ecoPoints: 45, cash: 180 },
    sdgTag: 'SDG 15: Life on Land',
    agronomicPrinciple: 'Predatory Biological Pest Control'
  },
  {
    id: 'ipm_02',
    topic: 'ipm',
    topicLabel: 'Organic IPM & Pollinators',
    difficulty: 'Intermediate',
    question: 'How does the "Push-Pull" pest management strategy protect cereal crops like maize from stemborer moths?',
    options: [
      'Pushing crops into the ground with tractors and pulling them back up',
      'Intercropping maize with a repellent "push" plant (Desmodium) while planting an attractive "pull" trap grass (Napier grass) along field perimeters',
      'Pushing pesticide spray into irrigation pipes and pulling river water',
      'Using high-voltage magnetic coils to repel winged insects'
    ],
    correctIndex: 1,
    explanation: 'Developed by ICIPE in Kenya, Push-Pull intercrops silverleaf desmodium (which emits volatile chemicals that repel stemborers while suppressing the parasitic weed Striga) and rings the field with Napier grass, which lures the moths to lay eggs on sticky, unsuitable trap foliage.',
    reward: { ecoPoints: 60, cash: 260 },
    sdgTag: 'SDG 2: Zero Hunger',
    agronomicPrinciple: 'Push-Pull Chemical Ecology Intercropping'
  },
  {
    id: 'ipm_03',
    topic: 'ipm',
    topicLabel: 'Organic IPM & Pollinators',
    difficulty: 'Master',
    question: 'Why do flowering hedgerows and beetle banks on field borders boost overall farm productivity?',
    options: [
      'They generate electricity through flower petals',
      'They provide continuous nectar, pollen, and overwintering shelter for wild bees, syrphid flies, and parasitoid wasps throughout seasons',
      'They prevent sunlight from striking weed seeds',
      'They emit scents that scare away farm inspectors'
    ],
    correctIndex: 1,
    explanation: 'Monoculture deserts offer pollinators zero food outside brief crop bloom windows. Permanent perennial flowering corridors and native hedgerows sustain stable populations of wild pollinators and beneficial predatory wasps year-round, boosting fruit set and natural biocontrol.',
    reward: { ecoPoints: 65, cash: 290 },
    sdgTag: 'SDG 15: Life on Land',
    agronomicPrinciple: 'Habitat Corridors & Beneficial Insect Banks'
  },
  {
    id: 'ipm_04',
    topic: 'ipm',
    topicLabel: 'Organic IPM & Pollinators',
    difficulty: 'Intermediate',
    question: 'Why have neonicotinoid systemic pesticides raised severe ecological concerns worldwide?',
    options: [
      'They turn river water into salt crystals',
      'They translocate into pollen and nectar, disrupting honeybee navigation, foraging memory, and immune function at sublethal doses',
      'They cause crops to grow too rapidly for farmers to harvest',
      'They make soil too soft for tractor wheels'
    ],
    correctIndex: 1,
    explanation: 'Neonicotinoids are water-soluble neurotoxins absorbed by plant vascular systems. When pollinators visit blooms, trace residues impair their central nervous systems, preventing bees from navigating back to their hives and accelerating pollinator colony collapse.',
    reward: { ecoPoints: 50, cash: 220 },
    sdgTag: 'SDG 12: Responsible Consumption',
    agronomicPrinciple: 'Systemic Ecotoxicology & Pollinator Navigation'
  },

  // --- Category: Climate Resilience & Drought ---
  {
    id: 'climate_01',
    topic: 'climate',
    topicLabel: 'Climate Resilience & Drought',
    difficulty: 'Intermediate',
    question: 'Why are C4 crops (like Pearl Millet, Sorghum, and Amaranth) exceptionally drought and heat resilient?',
    options: [
      'They absorb water directly from dry air during the day',
      'Their C4 photosynthetic pathway concentrates CO2 around the RuBisCO enzyme, enabling stomata to remain tighter and conserving water at high temperatures',
      'They do not require sunlight to produce carbohydrates',
      'Their leaves are covered in plastic resin'
    ],
    correctIndex: 1,
    explanation: 'C4 plants possess specialized bundle sheath anatomy that virtually eliminates wasteful photorespiration in hot, dry conditions. They achieve up to 2× the water-use efficiency of C3 crops (like wheat or soybeans), producing substantial grain yields with minimal irrigation.',
    reward: { ecoPoints: 60, cash: 260 },
    sdgTag: 'SDG 13: Climate Action',
    agronomicPrinciple: 'C4 Photosynthetic Water-Use Efficiency'
  },
  {
    id: 'climate_02',
    topic: 'climate',
    topicLabel: 'Climate Resilience & Drought',
    difficulty: 'Beginner',
    question: 'How do deep-rooted agroforestry border trees protect field crops during summer heatwaves?',
    options: [
      'They blow cold wind across fields using moving branches',
      'They create shade microclimates, reduce wind speeds (slowing crop desiccation), and perform hydraulic lift of water from deep subsoil layers',
      'They consume all groundwater so crops learn to survive without water',
      'They turn hot sunlight into infrared radio signals'
    ],
    correctIndex: 1,
    explanation: 'Agroforestry windbreaks reduce laminar wind velocity across adjacent crops, lowering transpiration stress by 20-30%. Furthermore, deep tree roots tap into deep groundwater reserves, sometimes releasing moisture into drier upper soil layers at night (hydraulic redistribution).',
    reward: { ecoPoints: 50, cash: 210 },
    sdgTag: 'SDG 13: Climate Action',
    agronomicPrinciple: 'Agroforestry Microclimate Buffering'
  },
  {
    id: 'climate_03',
    topic: 'climate',
    topicLabel: 'Climate Resilience & Drought',
    difficulty: 'Master',
    question: 'What is the "vapor pressure deficit" (VPD) and why does it drive excessive crop water consumption during hot winds?',
    options: [
      'VPD is the pressure of tractor tires on wet clay',
      'It is the difference between moisture in the leaf interior and ambient air; hot, dry winds widen this deficit, pulling moisture out of open stomata at extreme rates',
      'It is the boiling point of groundwater deep inside volcanic vents',
      'It represents the weight of clouds over mountain ranges'
    ],
    correctIndex: 1,
    explanation: 'High Vapor Pressure Deficit (VPD) occurs when the atmosphere is hot and dry, creating steep osmotic suction that literally pulls moisture out of leaf stomata. If plants close their stomata to prevent dehydration, photosynthesis halts and leaves risk heat scorch.',
    reward: { ecoPoints: 70, cash: 310, specialBonus: 'Atmospheric Physics Award' },
    sdgTag: 'SDG 13: Climate Action',
    agronomicPrinciple: 'Vapor Pressure Deficit & Transpiration Stress'
  },

  // --- Category: Heirloom Seeds & Sovereignty ---
  {
    id: 'heritage_01',
    topic: 'heritage',
    topicLabel: 'Heirloom Seeds & Sovereignty',
    difficulty: 'Beginner',
    question: 'What defines an "open-pollinated heirloom crop variety"?',
    options: [
      'A seed modified in a sterile laboratory with fish genes',
      'A traditional variety bred and passed down through generations, which breeds true-to-type from seed saved by the farmer year after year',
      'A seed that can only be purchased from a multinational chemical corporation',
      'A crop that can only be pollinated by robotic drones'
    ],
    correctIndex: 1,
    explanation: 'Open-pollinated heirlooms are genetically diverse varieties selected over generations by indigenous and traditional agrarian communities. Unlike F1 commercial hybrids whose offspring produce erratic yields, heirlooms breed true, allowing farmers true seed sovereignty.',
    reward: { ecoPoints: 45, cash: 190 },
    sdgTag: 'SDG 2: Zero Hunger',
    agronomicPrinciple: 'Open-Pollinated Seed Sovereignty'
  },
  {
    id: 'heritage_02',
    topic: 'heritage',
    topicLabel: 'Heirloom Seeds & Sovereignty',
    difficulty: 'Intermediate',
    question: 'Why does genetic diversity in traditional "landraces" make agroecosystems more resilient than industrial F1 monocultures?',
    options: [
      'Landraces produce identical clones that all look identical in supermarkets',
      'Genetic heterogeneity means that when an unusual drought, frost, or new pest strain strikes, a subset of the population possesses natural resistance genes to survive',
      'Landraces require twice as much synthetic fertilizer to survive',
      'Landraces can only grow in green plastic greenhouses'
    ],
    correctIndex: 1,
    explanation: 'Industrial monocultures are genetic clones: if a disease infects one plant, it can wipe out the entire harvest. Landrace populations have internal genetic variability; varying root depths, flowering times, and immune defenses ensure that weather anomalies never cause catastrophic total crop failure.',
    reward: { ecoPoints: 55, cash: 240 },
    sdgTag: 'SDG 2: Zero Hunger & SDG 15: Life on Land',
    agronomicPrinciple: 'Landrace Genetic Heterogeneity'
  },
  {
    id: 'heritage_03',
    topic: 'heritage',
    topicLabel: 'Heirloom Seeds & Sovereignty',
    difficulty: 'Master',
    question: 'Why was Borage (Starflower) traditionally intercropped alongside brassicas, strawberries, and tomatoes?',
    options: [
      'It kills weeds by blocking all underground air',
      'It produces profuse blue flowers loaded with high-sugar nectar that attracts pollinators, accumulates potassium, and repels tomato hornworms',
      'It turns tomatoes into blue colored fruit',
      'It prevents farm soil from freezing even in arctic blizzards'
    ],
    correctIndex: 1,
    explanation: 'Borage (Borago officinalis) is a superstar dynamic accumulator. Its deep taproots pull subsoil trace minerals (especially potassium) into its leaves. Furthermore, its continuous nectar-rich blue blossoms draw honeybees, native bumblebees, and predatory wasps that hunt hornworms.',
    reward: { ecoPoints: 65, cash: 275 },
    sdgTag: 'SDG 15: Life on Land',
    agronomicPrinciple: 'Dynamic Accumulator Companion Ecology'
  },

  // --- Category: UN SDGs & Agro-Economics ---
  {
    id: 'sdg_01',
    topic: 'sdg',
    topicLabel: 'UN SDGs & Agro-Economics',
    difficulty: 'Intermediate',
    question: 'Under international organic certification standards (such as USDA Organic or IFOAM), what is required before a field can sell certified organic harvests?',
    options: [
      'A payment of one million dollars to international inspectors',
      'A mandatory 36-month (3-year) transition period with zero prohibited synthetic fertilizers or pesticides, verified by annual soil audits',
      'Planting only crops with certified red plastic tags',
      'Plowing the field 10 times per season'
    ],
    correctIndex: 1,
    explanation: 'To earn organic certification and the associated market premium, land must undergo a strict 3-year transition window without synthetic agrochemicals. This allows synthetic residues to degrade and tests the farmer\'s commitment to biological soil management.',
    reward: { ecoPoints: 50, cash: 220 },
    sdgTag: 'SDG 12: Responsible Consumption and Production',
    agronomicPrinciple: '3-Year Agrochemical Detoxification & Certification'
  },
  {
    id: 'sdg_02',
    topic: 'sdg',
    topicLabel: 'UN SDGs & Agro-Economics',
    difficulty: 'Master',
    question: 'How do regenerative agriculture and continuous living cover crops contribute to UN SDG 13 (Climate Action)?',
    options: [
      'By painting farm roofs with silver paint to reflect starlight',
      'Through photosynthesis, crops pump carbon-rich root exudates into the soil, where fungi synthesize glomalin and stable humus, turning farmland into a net global carbon sink',
      'By running diesel generators during winter nights',
      'By replacing soil with crushed synthetic glass'
    ],
    correctIndex: 1,
    explanation: 'Plants pull CO2 out of the atmosphere via photosynthesis. Rather than keeping it only in above-ground biomass, living roots exude liquid carbon sugars into the rhizosphere to feed microbes. Mycorrhizae convert this into glomalin, stably sequestering gigatons of carbon for decades.',
    reward: { ecoPoints: 75, cash: 350, specialBonus: 'Global Carbon Champion' },
    sdgTag: 'SDG 13: Climate Action & SDG 15: Life on Land',
    agronomicPrinciple: 'Rhizodeposition & Glomalin Carbon Sequestration'
  }
];

export interface QuizStreakReward {
  streak: number;
  title: string;
  cashBonus: number;
  ecoPointsBonus: number;
  badge: string;
  description: string;
}

export const QUIZ_STREAK_REWARDS: QuizStreakReward[] = [
  {
    streak: 3,
    title: 'Agronomy Scholar',
    cashBonus: 350,
    ecoPointsBonus: 75,
    badge: '📜',
    description: 'Answered 3 questions correctly in a row! Research grant awarded.'
  },
  {
    streak: 5,
    title: 'Permaculture Fellow',
    cashBonus: 650,
    ecoPointsBonus: 150,
    badge: '🌿',
    description: '5 consecutive agricultural triumphs! Unlocks heirloom insights bonus.'
  },
  {
    streak: 8,
    title: 'Living Soil Master',
    cashBonus: 1200,
    ecoPointsBonus: 300,
    badge: '🏅',
    description: '8 question streak! Renowned authority in agroecological science.'
  },
  {
    streak: 12,
    title: 'Grand Agroecologist Laureate',
    cashBonus: 2500,
    ecoPointsBonus: 600,
    badge: '👑',
    description: '12 consecutive flawless answers! Maximum academic endowment & public prestige.'
  }
];
