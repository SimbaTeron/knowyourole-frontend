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
  "Life Coach": { low: 35000, high: 100000, growth: "high" }
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

const techRoles = ["Software Developer", "UX Designer", "Data Analyst", "Product Manager", "Engineer"];
const healthcareRoles = ["Nurse", "Doctor", "Physical Therapist", "Pharmacist", "Dental Hygienist", "Veterinarian"];
const tradeRoles = ["Electrician", "Plumber", "HVAC Technician", "Carpenter", "Mechanic", "Welder"];

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
  const normalizedCity = city?.toLowerCase().trim();
  
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
  
  if (roleLower.includes("tech") || roleLower.includes("software") || roleLower.includes("data") || roleLower.includes("ai")) {
    return "Strong growth outlook in tech sector";
  }
  if (roleLower.includes("health") || roleLower.includes("nurse") || roleLower.includes("medical") || roleLower.includes("therapy")) {
    return "Healthcare roles in high demand";
  }
  if (roleLower.includes("trade") || roleLower.includes("electric") || roleLower.includes("plumb") || roleLower.includes("hvac")) {
    return "Skilled trades increasingly valued";
  }
  if (roleLower.includes("creative") || roleLower.includes("design") || roleLower.includes("art") || roleLower.includes("music")) {
    return "Creative roles reward unique perspectives";
  }
  if (roleLower.includes("business") || roleLower.includes("manage") || roleLower.includes("consult")) {
    return "Leadership skills always in demand";
  }
  if (roleLower.includes("teach") || roleLower.includes("education") || roleLower.includes("coach")) {
    return "Education and mentorship roles growing";
  }
  
  return "Opportunities vary by location and experience";
}

export function shouldShowSalary(city?: string): boolean {
  if (!city) return false;
  const normalizedCity = city.toLowerCase().trim();
  return normalizedCity in metroMultipliers;
}
