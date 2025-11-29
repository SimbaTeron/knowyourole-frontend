export interface RegionalSalary {
  role: string;
  salaryRange: string;
  median: number;
  growthOutlook: "high" | "moderate" | "stable" | "declining";
  demandLevel: "hot" | "growing" | "steady" | "limited";
}

export interface MetroSalaries {
  metro: string;
  costMultiplier: number;
  roles: Record<string, RegionalSalary>;
}

const nationalBaseSalaries: Record<string, { low: number; high: number; growth: "high" | "moderate" | "stable" | "declining" }> = {
  "Software Developer": { low: 70000, high: 150000, growth: "high" },
  "UX Designer": { low: 55000, high: 120000, growth: "high" },
  "Data Analyst": { low: 55000, high: 95000, growth: "high" },
  "Product Manager": { low: 80000, high: 160000, growth: "high" },
  "Marketing Manager": { low: 60000, high: 130000, growth: "moderate" },
  "Financial Analyst": { low: 55000, high: 100000, growth: "moderate" },
  "Nurse": { low: 55000, high: 95000, growth: "high" },
  "Teacher": { low: 40000, high: 75000, growth: "stable" },
  "Electrician": { low: 45000, high: 90000, growth: "moderate" },
  "Plumber": { low: 40000, high: 85000, growth: "moderate" },
  "HVAC Technician": { low: 42000, high: 80000, growth: "moderate" },
  "Carpenter": { low: 38000, high: 75000, growth: "stable" },
  "Project Manager": { low: 65000, high: 130000, growth: "moderate" },
  "Graphic Designer": { low: 40000, high: 85000, growth: "stable" },
  "Accountant": { low: 50000, high: 90000, growth: "stable" },
  "Sales Representative": { low: 40000, high: 100000, growth: "moderate" },
  "Human Resources Manager": { low: 60000, high: 120000, growth: "moderate" },
  "Physical Therapist": { low: 65000, high: 100000, growth: "high" },
  "Counselor": { low: 40000, high: 75000, growth: "high" },
  "Social Worker": { low: 40000, high: 70000, growth: "high" },
  "Chef": { low: 35000, high: 75000, growth: "stable" },
  "Real Estate Agent": { low: 30000, high: 120000, growth: "moderate" },
  "Photographer": { low: 30000, high: 80000, growth: "stable" },
  "Writer": { low: 35000, high: 85000, growth: "stable" },
  "Entrepreneur": { low: 0, high: 500000, growth: "high" },
  "Consultant": { low: 60000, high: 200000, growth: "moderate" },
  "Researcher": { low: 50000, high: 100000, growth: "moderate" },
  "Engineer": { low: 65000, high: 140000, growth: "high" },
  "Architect": { low: 55000, high: 120000, growth: "moderate" },
  "Lawyer": { low: 70000, high: 200000, growth: "stable" },
  "Doctor": { low: 150000, high: 350000, growth: "high" },
  "Scientist": { low: 55000, high: 120000, growth: "moderate" },
  "Athlete": { low: 20000, high: 500000, growth: "stable" },
  "Actor": { low: 20000, high: 200000, growth: "stable" },
  "Musician": { low: 20000, high: 100000, growth: "stable" },
  "Veterinarian": { low: 70000, high: 140000, growth: "moderate" },
  "Pharmacist": { low: 100000, high: 150000, growth: "stable" },
  "Dental Hygienist": { low: 60000, high: 90000, growth: "moderate" },
  "Police Officer": { low: 45000, high: 90000, growth: "stable" },
  "Firefighter": { low: 40000, high: 85000, growth: "stable" },
  "Mechanic": { low: 35000, high: 70000, growth: "stable" },
  "Welder": { low: 38000, high: 75000, growth: "moderate" },
  "Flight Attendant": { low: 35000, high: 80000, growth: "moderate" },
  "Pilot": { low: 80000, high: 200000, growth: "high" },
  "Wedding Planner": { low: 35000, high: 85000, growth: "moderate" },
  "Event Coordinator": { low: 40000, high: 75000, growth: "moderate" },
  "Interior Designer": { low: 40000, high: 90000, growth: "moderate" },
  "Personal Trainer": { low: 30000, high: 75000, growth: "high" },
  "Life Coach": { low: 35000, high: 100000, growth: "high" },
  "Master Carpenter": { low: 50000, high: 90000, growth: "moderate" },
  "Cabinet Maker": { low: 45000, high: 75000, growth: "stable" },
  "Finish Carpenter": { low: 45000, high: 80000, growth: "stable" },
  "Roofing Contractor": { low: 55000, high: 120000, growth: "moderate" },
  "Commercial Roofer": { low: 45000, high: 85000, growth: "moderate" },
  "Residential Roofer": { low: 40000, high: 70000, growth: "stable" },
  "CNC Machinist": { low: 45000, high: 80000, growth: "high" },
  "Tool and Die Maker": { low: 50000, high: 85000, growth: "moderate" },
  "Machine Shop Supervisor": { low: 55000, high: 95000, growth: "moderate" },
  "Power Lineman": { low: 60000, high: 100000, growth: "high" },
  "Line Crew Supervisor": { low: 70000, high: 110000, growth: "high" },
  "Telecommunications Lineman": { low: 45000, high: 80000, growth: "moderate" },
  "Structural Ironworker": { low: 55000, high: 95000, growth: "moderate" },
  "Reinforcing Ironworker": { low: 50000, high: 85000, growth: "moderate" },
  "Ornamental Ironworker": { low: 45000, high: 80000, growth: "stable" },
  "Metal Fabricator": { low: 40000, high: 70000, growth: "stable" },
  "Tower Crane Operator": { low: 60000, high: 100000, growth: "moderate" },
  "Mobile Crane Operator": { low: 55000, high: 90000, growth: "moderate" },
  "Overhead Crane Operator": { low: 45000, high: 75000, growth: "stable" },
  "Rigging Specialist": { low: 50000, high: 80000, growth: "moderate" },
  "Master Mason": { low: 50000, high: 90000, growth: "stable" },
  "Stone Mason": { low: 45000, high: 85000, growth: "stable" },
  "Brick Mason": { low: 45000, high: 80000, growth: "stable" },
  "Concrete Finisher": { low: 40000, high: 70000, growth: "stable" },
  "Paramedic": { low: 45000, high: 75000, growth: "high" },
  "Flight Paramedic": { low: 55000, high: 90000, growth: "high" },
  "EMT": { low: 35000, high: 55000, growth: "high" },
  "Emergency Room Technician": { low: 38000, high: 58000, growth: "high" },
  "911 Dispatcher": { low: 40000, high: 65000, growth: "moderate" },
  "Police Dispatcher": { low: 42000, high: 68000, growth: "moderate" },
  "Fire Dispatcher": { low: 40000, high: 62000, growth: "moderate" },
  "Medical Dispatcher": { low: 38000, high: 60000, growth: "moderate" },
  "Corrections Officer": { low: 40000, high: 70000, growth: "stable" },
  "Probation Officer": { low: 45000, high: 75000, growth: "moderate" },
  "Juvenile Corrections Officer": { low: 38000, high: 62000, growth: "stable" },
  "Detention Officer": { low: 35000, high: 58000, growth: "stable" },
  "Park Ranger": { low: 40000, high: 70000, growth: "stable" },
  "Wildlife Officer": { low: 45000, high: 75000, growth: "stable" },
  "Forest Ranger": { low: 38000, high: 65000, growth: "stable" },
  "Conservation Officer": { low: 42000, high: 70000, growth: "moderate" },
  "Master Barber": { low: 35000, high: 80000, growth: "moderate" },
  "Barbershop Owner": { low: 50000, high: 150000, growth: "moderate" },
  "Barber": { low: 30000, high: 60000, growth: "stable" },
  "Salon Owner": { low: 50000, high: 150000, growth: "moderate" },
  "Master Stylist": { low: 45000, high: 100000, growth: "moderate" },
  "Cosmetologist": { low: 30000, high: 65000, growth: "stable" },
  "Hair Stylist": { low: 28000, high: 60000, growth: "stable" },
  "Medical Esthetician": { low: 45000, high: 85000, growth: "high" },
  "Esthetician": { low: 32000, high: 60000, growth: "moderate" },
  "Spa Therapist": { low: 30000, high: 55000, growth: "moderate" },
  "Massage Therapist": { low: 40000, high: 80000, growth: "high" },
  "Sports Massage Therapist": { low: 45000, high: 90000, growth: "high" },
  "Spa Manager": { low: 45000, high: 85000, growth: "moderate" },
  "Factory Supervisor": { low: 50000, high: 85000, growth: "stable" },
  "Shift Manager": { low: 45000, high: 75000, growth: "stable" },
  "Production Lead": { low: 42000, high: 70000, growth: "stable" },
  "Line Supervisor": { low: 40000, high: 65000, growth: "stable" },
  "Quality Control Inspector": { low: 40000, high: 70000, growth: "moderate" },
  "Quality Assurance Analyst": { low: 50000, high: 85000, growth: "moderate" },
  "Quality Manager": { low: 65000, high: 110000, growth: "moderate" },
  "Six Sigma Black Belt": { low: 80000, high: 130000, growth: "moderate" },
  "CNC Programmer": { low: 50000, high: 85000, growth: "high" },
  "CNC Setup Technician": { low: 42000, high: 70000, growth: "moderate" },
  "Plant Manager": { low: 80000, high: 150000, growth: "stable" },
  "Assembly Technician": { low: 35000, high: 55000, growth: "stable" },
  "Electronics Assembler": { low: 32000, high: 52000, growth: "stable" },
  "Military Officer": { low: 50000, high: 150000, growth: "stable" },
  "Combat Arms Officer": { low: 55000, high: 120000, growth: "stable" },
  "Intelligence Officer": { low: 60000, high: 140000, growth: "high" },
  "Cyber Operations Officer": { low: 70000, high: 150000, growth: "high" },
  "Infantry Sergeant": { low: 40000, high: 80000, growth: "stable" },
  "Special Operations": { low: 55000, high: 100000, growth: "stable" },
  "Combat Medic": { low: 35000, high: 65000, growth: "stable" },
  "Military Logistics Specialist": { low: 38000, high: 70000, growth: "stable" },
  "Military Intelligence Analyst": { low: 50000, high: 100000, growth: "high" },
  "Defense Contractor": { low: 80000, high: 180000, growth: "high" },
  "Military Consultant": { low: 90000, high: 200000, growth: "high" },
  "Farm Owner": { low: 40000, high: 200000, growth: "stable" },
  "Farm Manager": { low: 50000, high: 100000, growth: "stable" },
  "Family Farmer": { low: 35000, high: 120000, growth: "stable" },
  "Organic Farmer": { low: 40000, high: 100000, growth: "moderate" },
  "Cattle Rancher": { low: 45000, high: 200000, growth: "stable" },
  "Ranch Manager": { low: 50000, high: 100000, growth: "stable" },
  "Horse Rancher": { low: 40000, high: 150000, growth: "stable" },
  "Livestock Manager": { low: 45000, high: 85000, growth: "stable" },
  "Agricultural Technician": { low: 40000, high: 70000, growth: "moderate" },
  "Precision Agriculture Specialist": { low: 50000, high: 90000, growth: "high" },
  "Agronomist": { low: 55000, high: 95000, growth: "moderate" },
  "Soil Scientist": { low: 50000, high: 85000, growth: "moderate" },
  "Agricultural Equipment Operator": { low: 35000, high: 65000, growth: "stable" },
  "Farm Equipment Technician": { low: 40000, high: 70000, growth: "moderate" },
  "Store Manager": { low: 45000, high: 90000, growth: "stable" },
  "District Manager": { low: 65000, high: 120000, growth: "stable" },
  "Assistant Store Manager": { low: 35000, high: 60000, growth: "stable" },
  "Department Manager": { low: 38000, high: 65000, growth: "stable" },
  "Shift Supervisor": { low: 32000, high: 50000, growth: "stable" },
  "Customer Service Lead": { low: 30000, high: 48000, growth: "stable" }
};

const metroMultipliers: Record<string, { multiplier: number; techBonus: number; healthcareBonus: number; tradeBonus: number }> = {
  "new york": { multiplier: 1.35, techBonus: 1.2, healthcareBonus: 1.15, tradeBonus: 1.25 },
  "san francisco": { multiplier: 1.45, techBonus: 1.4, healthcareBonus: 1.1, tradeBonus: 1.2 },
  "los angeles": { multiplier: 1.25, techBonus: 1.15, healthcareBonus: 1.1, tradeBonus: 1.15 },
  "seattle": { multiplier: 1.3, techBonus: 1.35, healthcareBonus: 1.1, tradeBonus: 1.15 },
  "boston": { multiplier: 1.25, techBonus: 1.2, healthcareBonus: 1.25, tradeBonus: 1.1 },
  "chicago": { multiplier: 1.1, techBonus: 1.1, healthcareBonus: 1.05, tradeBonus: 1.1 },
  "austin": { multiplier: 1.15, techBonus: 1.25, healthcareBonus: 1.0, tradeBonus: 1.05 },
  "denver": { multiplier: 1.1, techBonus: 1.15, healthcareBonus: 1.0, tradeBonus: 1.05 },
  "miami": { multiplier: 1.1, techBonus: 1.05, healthcareBonus: 1.1, tradeBonus: 1.1 },
  "atlanta": { multiplier: 1.05, techBonus: 1.1, healthcareBonus: 1.05, tradeBonus: 1.0 },
  "dallas": { multiplier: 1.05, techBonus: 1.1, healthcareBonus: 1.05, tradeBonus: 1.0 },
  "houston": { multiplier: 1.05, techBonus: 1.0, healthcareBonus: 1.15, tradeBonus: 1.1 },
  "phoenix": { multiplier: 0.95, techBonus: 1.0, healthcareBonus: 1.0, tradeBonus: 1.0 },
  "philadelphia": { multiplier: 1.1, techBonus: 1.05, healthcareBonus: 1.15, tradeBonus: 1.05 },
  "san diego": { multiplier: 1.15, techBonus: 1.1, healthcareBonus: 1.1, tradeBonus: 1.05 },
  "minneapolis": { multiplier: 1.05, techBonus: 1.05, healthcareBonus: 1.1, tradeBonus: 1.0 },
  "portland": { multiplier: 1.1, techBonus: 1.15, healthcareBonus: 1.0, tradeBonus: 1.05 },
  "detroit": { multiplier: 0.95, techBonus: 1.0, healthcareBonus: 1.0, tradeBonus: 1.1 },
  "cleveland": { multiplier: 0.9, techBonus: 0.95, healthcareBonus: 1.05, tradeBonus: 1.0 },
  "pittsburgh": { multiplier: 0.95, techBonus: 1.05, healthcareBonus: 1.1, tradeBonus: 1.0 }
};

const techRoles = ["Software Developer", "UX Designer", "Data Analyst", "Product Manager", "Engineer", "CNC Programmer", "Cyber Operations Officer", "Intelligence Officer", "Military Intelligence Analyst", "Precision Agriculture Specialist"];
const healthcareRoles = ["Nurse", "Doctor", "Physical Therapist", "Pharmacist", "Dental Hygienist", "Veterinarian", "Paramedic", "Flight Paramedic", "EMT", "Emergency Room Technician", "Combat Medic", "Medical Esthetician", "Massage Therapist", "Sports Massage Therapist"];
const tradeRoles = ["Electrician", "Plumber", "HVAC Technician", "Carpenter", "Mechanic", "Welder", "Master Carpenter", "Cabinet Maker", "Finish Carpenter", "Roofing Contractor", "Commercial Roofer", "Residential Roofer", "CNC Machinist", "Tool and Die Maker", "Machine Shop Supervisor", "Power Lineman", "Line Crew Supervisor", "Telecommunications Lineman", "Structural Ironworker", "Reinforcing Ironworker", "Ornamental Ironworker", "Metal Fabricator", "Tower Crane Operator", "Mobile Crane Operator", "Overhead Crane Operator", "Rigging Specialist", "Master Mason", "Stone Mason", "Brick Mason", "Concrete Finisher", "Factory Supervisor", "Production Lead", "Quality Control Inspector", "CNC Setup Technician", "Assembly Technician", "Farm Equipment Technician", "Agricultural Equipment Operator"];
const firstResponderRoles = ["Police Officer", "Firefighter", "Paramedic", "Flight Paramedic", "EMT", "911 Dispatcher", "Police Dispatcher", "Fire Dispatcher", "Medical Dispatcher", "Corrections Officer", "Probation Officer", "Park Ranger", "Wildlife Officer", "Forest Ranger", "Conservation Officer"];
const personalCareRoles = ["Master Barber", "Barbershop Owner", "Barber", "Salon Owner", "Master Stylist", "Cosmetologist", "Hair Stylist", "Medical Esthetician", "Esthetician", "Spa Therapist", "Massage Therapist", "Sports Massage Therapist", "Spa Manager"];
const agricultureRoles = ["Farm Owner", "Farm Manager", "Family Farmer", "Organic Farmer", "Cattle Rancher", "Ranch Manager", "Horse Rancher", "Livestock Manager", "Agricultural Technician", "Precision Agriculture Specialist", "Agronomist", "Soil Scientist"];

const cityAliases: Record<string, string> = {
  "new york city": "new york",
  "nyc": "new york",
  "manhattan": "new york",
  "brooklyn": "new york",
  "queens": "new york",
  "bronx": "new york",
  "staten island": "new york",
  "beverly hills": "los angeles",
  "santa monica": "los angeles",
  "hollywood": "los angeles",
  "pasadena": "los angeles",
  "long beach": "los angeles",
  "san jose": "san francisco",
  "oakland": "san francisco",
  "palo alto": "san francisco",
  "mountain view": "san francisco",
  "cupertino": "san francisco",
  "fremont": "san francisco",
  "sunnyvale": "san francisco",
  "redwood city": "san francisco",
  "bellevue": "seattle",
  "redmond": "seattle",
  "tacoma": "seattle",
  "cambridge": "boston",
  "somerville": "boston",
  "brookline": "boston",
  "round rock": "austin",
  "boulder": "denver",
  "lakewood": "denver",
  "marietta": "atlanta",
  "decatur": "atlanta",
  "sandy springs": "atlanta",
  "fort worth": "dallas",
  "arlington": "dallas",
  "plano": "dallas",
  "the woodlands": "houston",
  "sugar land": "houston",
  "scottsdale": "phoenix",
  "tempe": "phoenix",
  "mesa": "phoenix"
};

export function getRegionalSalary(role: string, city?: string, state?: string): { salary: string; hasRegionalData: boolean; growthOutlook: string } {
  const baseRole = Object.keys(nationalBaseSalaries).find(r => 
    role.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(role.toLowerCase())
  );
  
  if (!baseRole || !nationalBaseSalaries[baseRole]) {
    return {
      salary: "",
      hasRegionalData: false,
      growthOutlook: getGenericGrowthOutlook(role)
    };
  }
  
  const baseSalary = nationalBaseSalaries[baseRole];
  let normalizedCity = city?.toLowerCase().trim();
  
  if (normalizedCity && cityAliases[normalizedCity]) {
    normalizedCity = cityAliases[normalizedCity];
  }
  
  if (!normalizedCity || !metroMultipliers[normalizedCity]) {
    const lowK = Math.round(baseSalary.low / 1000);
    const highK = Math.round(baseSalary.high / 1000);
    return {
      salary: `$${lowK}K-${highK}K`,
      hasRegionalData: false,
      growthOutlook: getGrowthOutlookText(baseSalary.growth)
    };
  }
  
  const metro = metroMultipliers[normalizedCity];
  let multiplier = metro.multiplier;
  
  if (techRoles.includes(baseRole)) {
    multiplier *= metro.techBonus;
  } else if (healthcareRoles.includes(baseRole)) {
    multiplier *= metro.healthcareBonus;
  } else if (tradeRoles.includes(baseRole)) {
    multiplier *= metro.tradeBonus;
  }
  
  const adjustedLow = Math.round((baseSalary.low * multiplier) / 1000) * 1000;
  const adjustedHigh = Math.round((baseSalary.high * multiplier) / 1000) * 1000;
  
  const lowK = Math.round(adjustedLow / 1000);
  const highK = Math.round(adjustedHigh / 1000);
  
  return {
    salary: `$${lowK}K-${highK}K`,
    hasRegionalData: true,
    growthOutlook: getGrowthOutlookText(baseSalary.growth)
  };
}

function getGrowthOutlookText(growth: "high" | "moderate" | "stable" | "declining"): string {
  switch (growth) {
    case "high": return "Strong growth outlook with high demand";
    case "moderate": return "Steady growth with good opportunities";
    case "stable": return "Stable field with consistent demand";
    case "declining": return "Evolving field—consider upskilling";
    default: return "Opportunities vary by specialization";
  }
}

function getGenericGrowthOutlook(role: string): string {
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes("tech") || roleLower.includes("software") || roleLower.includes("data") || roleLower.includes("ai") || roleLower.includes("cyber")) {
    return "Strong growth outlook in tech sector";
  }
  if (roleLower.includes("health") || roleLower.includes("nurse") || roleLower.includes("medical") || roleLower.includes("therapy") || roleLower.includes("paramedic") || roleLower.includes("emt")) {
    return "Healthcare roles in high demand";
  }
  if (roleLower.includes("trade") || roleLower.includes("electric") || roleLower.includes("plumb") || roleLower.includes("hvac") || roleLower.includes("carpenter") || roleLower.includes("roofer") || roleLower.includes("lineman") || roleLower.includes("ironworker") || roleLower.includes("crane") || roleLower.includes("mason") || roleLower.includes("machinist") || roleLower.includes("welder")) {
    return "Skilled trades increasingly valued";
  }
  if (roleLower.includes("creative") || roleLower.includes("design") || roleLower.includes("art") || roleLower.includes("music") || roleLower.includes("actor") || roleLower.includes("performer")) {
    return "Creative roles reward unique perspectives";
  }
  if (roleLower.includes("business") || roleLower.includes("manage") || roleLower.includes("consult") || roleLower.includes("supervisor") || roleLower.includes("director")) {
    return "Leadership skills always in demand";
  }
  if (roleLower.includes("teach") || roleLower.includes("education") || roleLower.includes("coach")) {
    return "Education and mentorship roles growing";
  }
  if (roleLower.includes("police") || roleLower.includes("fire") || roleLower.includes("dispatch") || roleLower.includes("ranger") || roleLower.includes("correction") || roleLower.includes("officer")) {
    return "First responder roles vital to communities";
  }
  if (roleLower.includes("barber") || roleLower.includes("stylist") || roleLower.includes("cosmetolog") || roleLower.includes("esthetician") || roleLower.includes("massage") || roleLower.includes("spa")) {
    return "Personal care services steadily growing";
  }
  if (roleLower.includes("farm") || roleLower.includes("ranch") || roleLower.includes("agricult") || roleLower.includes("livestock") || roleLower.includes("agronomist")) {
    return "Agriculture essential with tech innovation rising";
  }
  if (roleLower.includes("military") || roleLower.includes("defense") || roleLower.includes("combat") || roleLower.includes("intelligence")) {
    return "Defense sector offers stable career paths";
  }
  if (roleLower.includes("factory") || roleLower.includes("manufactur") || roleLower.includes("assembly") || roleLower.includes("quality") || roleLower.includes("plant")) {
    return "Manufacturing evolving with automation";
  }
  
  return "Opportunities vary by location and experience";
}

export function shouldShowSalary(city?: string): boolean {
  if (!city) return false;
  const normalizedCity = city.toLowerCase().trim();
  return normalizedCity in metroMultipliers;
}
