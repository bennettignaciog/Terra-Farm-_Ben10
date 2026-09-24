export type Language = 'en' | 'hi' | 'es' | 'ta' | 'fr' | 'de';

export interface TranslationStrings {
  gameTitle: string;
  gameSubtitle: string;
  year: string;
  season: string;
  day: string;
  cash: string;
  debt: string;
  soilHealth: string;
  waterTable: string;
  biodiversity: string;
  organicMatter: string;
  nitrogen: string;
  moisture: string;
  salinity: string;
  compaction: string;
  pests: string;
  beneficials: string;
  earthworms: string;
  
  // Actions
  plant: string;
  irrigate: string;
  fertilize: string;
  pestControl: string;
  residue: string;
  harvest: string;
  inspect: string;
  upgrades: string;
  neighbors: string;
  
  // Methods
  floodIrrigation: string;
  dripIrrigation: string;
  syntheticNPK: string;
  organicCompost: string;
  chemicalSpray: string;
  biocontrol: string;
  mulchResidue: string;
  burnResidue: string;
  tillResidue: string;
  
  // Reports
  endOfSeasonReport: string;
  financialSummary: string;
  ecologicalBalance: string;
  whatIfShadow: string;
  nextSeason: string;
  
  // Status
  healthy: string;
  degraded: string;
  stressed: string;
  certifiedOrganic: string;
  transitioning: string;
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    gameTitle: 'TerraFarm',
    gameSubtitle: 'Agro-Ecological Simulator',
    year: 'Year',
    season: 'Season',
    day: 'Day',
    cash: 'Cash',
    debt: 'Debt',
    soilHealth: 'Soil Health',
    waterTable: 'Water Table Depth',
    biodiversity: 'Biodiversity',
    organicMatter: 'Organic Matter (SOM)',
    nitrogen: 'Available Nitrogen (N)',
    moisture: 'Soil Moisture',
    salinity: 'Salinity',
    compaction: 'Compaction (Hardpan)',
    pests: 'Pest Pressure',
    beneficials: 'Beneficial Insects',
    earthworms: 'Earthworm Activity',
    
    plant: 'Plant Crop',
    irrigate: 'Irrigation',
    fertilize: 'Nutrients',
    pestControl: 'Pest Control',
    residue: 'Residue',
    harvest: 'Harvest',
    inspect: 'Inspect',
    upgrades: 'Agro-Tech',
    neighbors: 'Neighbors',
    
    floodIrrigation: 'Flood Irrigation (Free/High Water)',
    dripIrrigation: 'Drip Irrigation (Efficient/Roots)',
    syntheticNPK: 'Synthetic NPK (Fast Yield/Acidifies)',
    organicCompost: 'Compost / Manure (Builds SOM)',
    chemicalSpray: 'Broad-Spectrum Spray (Kills All)',
    biocontrol: 'Neem & Biocontrol (Preserves Predators)',
    mulchResidue: 'Mulch on Surface (Protects Soil)',
    burnResidue: 'Burn Stubble (Fast/Destroys SOM)',
    tillResidue: 'Till Under (Loosens/Oxidizes)',
    
    endOfSeasonReport: 'End of Season Report',
    financialSummary: 'Financial Balance Sheet',
    ecologicalBalance: 'Ecological Capital Balance',
    whatIfShadow: 'Shadow Simulation: What If?',
    nextSeason: 'Begin Next Season',
    
    healthy: 'Resilient Living Soil',
    degraded: 'Compacted / Degraded',
    stressed: 'Environmental Stress',
    certifiedOrganic: 'Certified Organic Premium Active',
    transitioning: 'In Organic Transition'
  },
  hi: {
    gameTitle: 'टेराफार्म (TerraFarm)',
    gameSubtitle: 'प्राकृतिक एवं टिकाऊ कृषि सिमुलेटर',
    year: 'वर्ष',
    season: 'मौसम',
    day: 'दिन',
    cash: 'रोकड़ (रुपये)',
    debt: 'कर्ज',
    soilHealth: 'मिट्टी स्वास्थ्य',
    waterTable: 'भूजल गहराई',
    biodiversity: 'जैव विविधता',
    organicMatter: 'जीवांश कार्बन (SOM)',
    nitrogen: 'नाइट्रोजन',
    moisture: 'नमी',
    salinity: 'खारापन',
    compaction: 'कड़ापन (हार्डपैन)',
    pests: 'हानिकारक कीट',
    beneficials: 'मित्र कीट (शिकारी)',
    earthworms: 'केंचुए',
    
    plant: 'बुवाई करें',
    irrigate: 'सिंचाई',
    fertilize: 'खाद/पोषण',
    pestControl: 'कीट प्रबंधन',
    residue: 'पराली प्रबंधन',
    harvest: 'कटाई',
    inspect: 'जांचें',
    upgrades: 'तकनीक व फार्म',
    neighbors: 'पड़ोसी खेत',
    
    floodIrrigation: 'बाढ़ सिंचाई (अधिक पानी)',
    dripIrrigation: 'ड्रिप सिंचाई (सटीक)',
    syntheticNPK: 'यूरिया/डीएपी (तुरंत असर, मिट्टी कमजोर)',
    organicCompost: 'गोबर खाद/कम्पोस्ट (जीवांश वृद्धि)',
    chemicalSpray: 'रासायनिक कीटनाशक (सब नष्ट)',
    biocontrol: 'नीम अर्क व मित्र कीट (संतुलित)',
    mulchResidue: 'मल्चिंग (नमी संरक्षण)',
    burnResidue: 'पराली जलाना (जीवांश नष्ट)',
    tillResidue: 'जुताई करना',
    
    endOfSeasonReport: 'ऋतु समीक्षा रिपोर्ट कार्ड',
    financialSummary: 'आय-व्यय ब्योरा',
    ecologicalBalance: 'मिट्टी व जल संतुलन',
    whatIfShadow: 'यदि आप दूसरा विकल्प चुनते (काउंटरफैक्चुअल)',
    nextSeason: 'अगला मौसम शुरू करें',
    
    healthy: 'जीवंत उपजाऊ मिट्टी',
    degraded: 'क्षतिग्रस्त मिट्टी',
    stressed: 'तनाव में फसल',
    certifiedOrganic: 'जैविक प्रमाणित (प्रीमियम दर)',
    transitioning: 'जैविक संक्रमण जारी'
  },
  es: {
    gameTitle: 'TerraFarm',
    gameSubtitle: 'Simulador Agroecológico',
    year: 'Año',
    season: 'Estación',
    day: 'Día',
    cash: 'Fondos',
    debt: 'Deuda',
    soilHealth: 'Salud del Suelo',
    waterTable: 'Profundidad Freática',
    biodiversity: 'Biodiversidad',
    organicMatter: 'Materia Orgánica (MOS)',
    nitrogen: 'Nitrógeno Disponible (N)',
    moisture: 'Humedad',
    salinity: 'Salinidad',
    compaction: 'Compactación',
    pests: 'Presión de Plagas',
    beneficials: 'Insectos Benéficos',
    earthworms: 'Lombrices',
    
    plant: 'Sembrar',
    irrigate: 'Riego',
    fertilize: 'Nutrición',
    pestControl: 'Control de Plagas',
    residue: 'Rastrojo',
    harvest: 'Cosechar',
    inspect: 'Inspeccionar',
    upgrades: 'Agrotecnología',
    neighbors: 'Vecinos',
    
    floodIrrigation: 'Riego por Inundación',
    dripIrrigation: 'Riego por Goteo',
    syntheticNPK: 'Fertilizante Químico NPK',
    organicCompost: 'Compost Orgánico / Estiércol',
    chemicalSpray: 'Pesticida Químico',
    biocontrol: 'Biocontrol / Extracto de Neem',
    mulchResidue: 'Acolchado / Mulch',
    burnResidue: 'Quema de Rastrojo',
    tillResidue: 'Labranza Convencional',
    
    endOfSeasonReport: 'Informe de Fin de Temporada',
    financialSummary: 'Balance Financiero',
    ecologicalBalance: 'Capital Ecológico',
    whatIfShadow: 'Simulación Contrafáctica: ¿Y si...?',
    nextSeason: 'Iniciar Siguiente Temporada',
    
    healthy: 'Suelo Vivo y Resistente',
    degraded: 'Suelo Degradado',
    stressed: 'Estrés Ambiental',
    certifiedOrganic: 'Certificación Orgánica Activa',
    transitioning: 'En Transición Orgánica'
  },
  ta: {
    gameTitle: 'டெர்ராபார்ம் (TerraFarm)',
    gameSubtitle: 'இயற்கை சூழலியல் வேளாண்மை சிமுலேட்டர்',
    year: 'ஆண்டு',
    season: 'பருவம்',
    day: 'நாள்',
    cash: 'பணம் (இருப்பு)',
    debt: 'கடன்',
    soilHealth: 'மண் வளம்',
    waterTable: 'நிலத்தடி நீர் மட்டம்',
    biodiversity: 'பல்லுயிர் வளம்',
    organicMatter: 'மண் கரிமப் பொருள் (SOM)',
    nitrogen: 'தழைச்சத்து (நைட்ரஜன்)',
    moisture: 'மண் ஈரப்பதம்',
    salinity: 'உவர்ப்புத்தன்மை',
    compaction: 'மண் இறுக்கம் (ஹார்ட்பேன்)',
    pests: 'பூச்சித் தாக்குதல்',
    beneficials: 'நன்மை செய்யும் பூச்சிகள்',
    earthworms: 'மண்புழுக்கள்',
    
    plant: 'பயிர் விதைப்பு',
    irrigate: 'பாசனம்',
    fertilize: 'இயற்கை உரம்',
    pestControl: 'பூச்சி மேலாண்மை',
    residue: 'பயிர் கழிவு மேலாண்மை',
    harvest: 'அறுவடை',
    inspect: 'ஆராய்',
    upgrades: 'பண்ணை மேம்பாடுகள்',
    neighbors: 'பக்கத்து பண்ணைகள்',
    
    floodIrrigation: 'வாய்க்கால் பாசனம் (அதிக நீர் இழப்பு)',
    dripIrrigation: 'சொட்டுநீர்ப் பாசனம் (துல்லிய நீர் சேமிப்பு)',
    syntheticNPK: 'வேதியியல் உரம் (மண் வளம் குன்றும்)',
    organicCompost: 'மண்புழு உரம் / மக்கிய தொழுவுரம்',
    chemicalSpray: 'பூச்சிக்கொல்லி தெளிப்பு (அனைத்தும் அழியும்)',
    biocontrol: 'வேப்பெண்ணெய் & உயிரியல் கட்டுப்பாடு',
    mulchResidue: 'மூடாக்கு போடுதல் (மண் காக்கும்)',
    burnResidue: 'பயிர்க்கழிவு எரிப்பு (மண் வளம் அழியும்)',
    tillResidue: 'உழவு செய்தல்',
    
    endOfSeasonReport: 'பருவ நிறைவு ஆய்வறிக்கை',
    financialSummary: 'வரவு-செலவு நிதி அறிக்கை',
    ecologicalBalance: 'சுற்றுச்சூழல் மூலதன சமநிலை',
    whatIfShadow: 'மாற்று முடிவுகள் ஒப்பீடு',
    nextSeason: 'அடுத்த பருவத்தைத் தொடங்கு',
    
    healthy: 'வளமான உயிர்ப்புள்ள மண்',
    degraded: 'பாதிக்கப்பட்ட மண்',
    stressed: 'வறட்சி / அழுத்த நிலை',
    certifiedOrganic: 'இயற்கை சான்றிதழ் (+50% கூடுதல் விலை)',
    transitioning: 'இயற்கை மாற்றத்தில் உள்ளது'
  },
  fr: {
    gameTitle: 'TerraFarm',
    gameSubtitle: 'Simulateur d’Agroécologie',
    year: 'Année',
    season: 'Saison',
    day: 'Jour',
    cash: 'Trésorerie',
    debt: 'Dette',
    soilHealth: 'Santé du Sol',
    waterTable: 'Nappe Phréatique',
    biodiversity: 'Biodiversité',
    organicMatter: 'Matière Organique (MOS)',
    nitrogen: 'Azote Disponible (N)',
    moisture: 'Humidité du Sol',
    salinity: 'Salinité',
    compaction: 'Compactage (Semelle)',
    pests: 'Pression des Ravageurs',
    beneficials: 'Insectes Auxiliaires',
    earthworms: 'Vers de Terre',
    
    plant: 'Semer',
    irrigate: 'Irrigation',
    fertilize: 'Fertilisation',
    pestControl: 'Protection Bio',
    residue: 'Gestion Résidus',
    harvest: 'Récolter',
    inspect: 'Inspecter',
    upgrades: 'Agro-Équipements',
    neighbors: 'Réseau Voisins',
    
    floodIrrigation: 'Submersion (Forte Évaporation)',
    dripIrrigation: 'Goutte-à-Goutte de Précision',
    syntheticNPK: 'Engrais Chimique NPK',
    organicCompost: 'Compost & Fumier Vivant',
    chemicalSpray: 'Pesticide Chimique de Synthèse',
    biocontrol: 'Biocontrôle & Auxiliaires',
    mulchResidue: 'Paillage Végétal (Mulch)',
    burnResidue: 'Brûlage des Chaumes (Destructeur)',
    tillResidue: 'Labour Mécanique',
    
    endOfSeasonReport: 'Bilan de Fin de Saison',
    financialSummary: 'Compte de Résultat Financier',
    ecologicalBalance: 'Bilan du Capital Écologique',
    whatIfShadow: 'Simulation Parallèle : Et Si... ?',
    nextSeason: 'Lancer la Saison Suivante',
    
    healthy: 'Sol Vivant & Résilient',
    degraded: 'Sol Dégradé et Compacté',
    stressed: 'Stress Environnemental',
    certifiedOrganic: 'Certification Bio Active (+50%)',
    transitioning: 'En Transition Biologique'
  },
  de: {
    gameTitle: 'TerraFarm',
    gameSubtitle: 'Agroökologie-Simulator',
    year: 'Jahr',
    season: 'Jahreszeit',
    day: 'Tag',
    cash: 'Guthaben',
    debt: 'Schulden',
    soilHealth: 'Bodengesundheit',
    waterTable: 'Grundwasserspiegel',
    biodiversity: 'Biodiversität',
    organicMatter: 'Organische Substanz (Humus)',
    nitrogen: 'Verfügbarer Stickstoff (N)',
    moisture: 'Bodenfeuchte',
    salinity: 'Versalzung',
    compaction: 'Bodenverdichtung (Pflugsohle)',
    pests: 'Schädlingsdruck',
    beneficials: 'Nützlinge',
    earthworms: 'Regenwürmer',
    
    plant: 'Aussäen',
    irrigate: 'Bewässerung',
    fertilize: 'Nährstoffe / Düngung',
    pestControl: 'Pflanzenschutz',
    residue: 'Ernterückstände',
    harvest: 'Ernten',
    inspect: 'Untersuchen',
    upgrades: 'Hof-Upgrades',
    neighbors: 'Nachbarhöfe',
    
    floodIrrigation: 'Flutbewässerung (Hoher Wasserverbrauch)',
    dripIrrigation: 'Tröpfchenbewässerung (Präzise)',
    syntheticNPK: 'Synthetischer NPK-Dünger',
    organicCompost: 'Kompost / Naturdünger',
    chemicalSpray: 'Chemisches Breitband-Pestizid',
    biocontrol: 'Biologische Schädlingsbekämpfung',
    mulchResidue: 'Mulchschicht (Bodenbedeckung)',
    burnResidue: 'Stoppelverbrennung (Zerstörerisch)',
    tillResidue: 'Konventionelles Pflügen',
    
    endOfSeasonReport: 'Saisonabschlussbericht',
    financialSummary: 'Finanzbilanz',
    ecologicalBalance: 'Ökologische Kapitalbilanz',
    whatIfShadow: 'Alternativ-Simulation: Was wäre wenn?',
    nextSeason: 'Nächste Saison starten',
    
    healthy: 'Lebendiger, resilienter Boden',
    degraded: 'Verdichtet / Degradiert',
    stressed: 'Klimatischer Stress',
    certifiedOrganic: 'Bio-Zertifizierung Aktiv (+50%)',
    transitioning: 'In Bio-Umstellung'
  }
};
