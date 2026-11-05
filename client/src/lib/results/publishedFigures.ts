/**
 * Every user-visible pay figure lives here.
 * A yearly refresh is a one-file change: copy the May median annual wage from
 * the BLS Occupational Outlook Handbook (https://www.bls.gov/ooh/) and bump
 * dataYear, period, and lastUpdated. Do not estimate a number.
 *
 * Figures below are the handbook's published May 2025 median annual wages
 * (handbook reference year 2025, XML last updated 2026-10-29). When a page
 * splits wages, the row uses the published median for the closer occupation,
 * not the combined quick-facts number.
 */
export const PAY_SOURCE = {
  name: "BLS Occupational Outlook Handbook",
  url: "https://www.bls.gov/ooh/",
  dataYear: 2025,
  period: "May 2025",
  lastUpdated: "2026-11-05",
  line: "US median pay, BLS 2025 data",
} as const;

export type OccupationPay = {
  /** Career title as the results page shows it. */
  career: string;
  /** Handbook occupation the median belongs to. */
  oohTitle: string;
  oohUrl: string;
  /** US median annual pay, in dollars. */
  medianAnnual: number;
};

export const OCCUPATION_PAY: readonly OccupationPay[] = [
  { career: "Electrician", oohTitle: "Electricians", oohUrl: "https://www.bls.gov/ooh/construction-and-extraction/electricians.htm", medianAnnual: 63190 },
  { career: "Carpenter", oohTitle: "Carpenters", oohUrl: "https://www.bls.gov/ooh/construction-and-extraction/carpenters.htm", medianAnnual: 60580 },
  { career: "Plumber", oohTitle: "Plumbers, Pipefitters, and Steamfitters", oohUrl: "https://www.bls.gov/ooh/construction-and-extraction/plumbers-pipefitters-and-steamfitters.htm", medianAnnual: 63800 },
  { career: "Welder", oohTitle: "Welders, Cutters, Solderers, and Brazers", oohUrl: "https://www.bls.gov/ooh/production/welders-cutters-solderers-and-brazers.htm", medianAnnual: 53750 },
  { career: "Welding technician", oohTitle: "Welders, Cutters, Solderers, and Brazers", oohUrl: "https://www.bls.gov/ooh/production/welders-cutters-solderers-and-brazers.htm", medianAnnual: 53750 },
  { career: "Auto mechanic", oohTitle: "Automotive Service Technicians and Mechanics", oohUrl: "https://www.bls.gov/ooh/installation-maintenance-and-repair/automotive-service-technicians-and-mechanics.htm", medianAnnual: 50620 },
  { career: "Automotive technician", oohTitle: "Automotive Service Technicians and Mechanics", oohUrl: "https://www.bls.gov/ooh/installation-maintenance-and-repair/automotive-service-technicians-and-mechanics.htm", medianAnnual: 50620 },
  { career: "HVAC technician", oohTitle: "Heating, Air Conditioning, and Refrigeration Mechanics and Installers", oohUrl: "https://www.bls.gov/ooh/installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm", medianAnnual: 61010 },
  { career: "Electrical lineworker", oohTitle: "Electrical Power-Line Installers and Repairers", oohUrl: "https://www.bls.gov/ooh/installation-maintenance-and-repair/line-installers-and-repairers.htm", medianAnnual: 95320 },
  { career: "Graphic designer", oohTitle: "Graphic Designers", oohUrl: "https://www.bls.gov/ooh/arts-and-design/graphic-designers.htm", medianAnnual: 62960 },
  { career: "Brand designer", oohTitle: "Graphic Designers", oohUrl: "https://www.bls.gov/ooh/arts-and-design/graphic-designers.htm", medianAnnual: 62960 },
  { career: "Freelance designer", oohTitle: "Graphic Designers", oohUrl: "https://www.bls.gov/ooh/arts-and-design/graphic-designers.htm", medianAnnual: 62960 },
  { career: "Illustrator", oohTitle: "Fine artists, including painters, sculptors, and illustrators", oohUrl: "https://www.bls.gov/ooh/arts-and-design/craft-and-fine-artists.htm", medianAnnual: 55490 },
  { career: "Animator", oohTitle: "Special Effects Artists and Animators", oohUrl: "https://www.bls.gov/ooh/arts-and-design/multimedia-artists-and-animators.htm", medianAnnual: 102030 },
  { career: "Photographer", oohTitle: "Photographers", oohUrl: "https://www.bls.gov/ooh/media-and-communication/photographers.htm", medianAnnual: 44660 },
  { career: "UX designer", oohTitle: "Web and digital interface designers", oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm", medianAnnual: 104000 },
  { career: "Video editor", oohTitle: "Film and video editors", oohUrl: "https://www.bls.gov/ooh/media-and-communication/film-and-video-editors-and-camera-operators.htm", medianAnnual: 75420 },
  { career: "Software developer", oohTitle: "Software developers", oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm", medianAnnual: 135980 },
  { career: "Game developer", oohTitle: "Software developers", oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm", medianAnnual: 135980 },
  { career: "IT support specialist", oohTitle: "Computer user support specialists", oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/computer-support-specialists.htm", medianAnnual: 61860 },
  { career: "IT technician", oohTitle: "Computer user support specialists", oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/computer-support-specialists.htm", medianAnnual: 61860 },
  { career: "Help desk technician", oohTitle: "Computer user support specialists", oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/computer-support-specialists.htm", medianAnnual: 61860 },
  { career: "Cybersecurity analyst", oohTitle: "Information security analysts", oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm", medianAnnual: 129180 },
  { career: "Robotics technician", oohTitle: "Electro-mechanical and mechatronics technologists and technicians", oohUrl: "https://www.bls.gov/ooh/architecture-and-engineering/electro-mechanical-technicians.htm", medianAnnual: 73900 },
  { career: "Registered nurse", oohTitle: "Registered nurses", oohUrl: "https://www.bls.gov/ooh/healthcare/registered-nurses.htm", medianAnnual: 97550 },
  { career: "Charge nurse", oohTitle: "Registered nurses", oohUrl: "https://www.bls.gov/ooh/healthcare/registered-nurses.htm", medianAnnual: 97550 },
  { career: "Veterinary technician", oohTitle: "Veterinary technologists and technicians", oohUrl: "https://www.bls.gov/ooh/healthcare/veterinary-technologists-and-technicians.htm", medianAnnual: 47380 },
  { career: "Physical therapist", oohTitle: "Physical therapists", oohUrl: "https://www.bls.gov/ooh/healthcare/physical-therapists.htm", medianAnnual: 102760 },
  { career: "Medical assistant", oohTitle: "Medical assistants", oohUrl: "https://www.bls.gov/ooh/healthcare/medical-assistants.htm", medianAnnual: 45690 },
  { career: "Medical lab scientist", oohTitle: "Clinical laboratory technologists and technicians", oohUrl: "https://www.bls.gov/ooh/healthcare/clinical-laboratory-technologists-and-technicians.htm", medianAnnual: 62930 },
  { career: "Environmental scientist", oohTitle: "Environmental scientists and specialists", oohUrl: "https://www.bls.gov/ooh/life-physical-and-social-science/environmental-scientists-and-specialists.htm", medianAnnual: 82220 },
  { career: "Pharmacist", oohTitle: "Pharmacists", oohUrl: "https://www.bls.gov/ooh/healthcare/pharmacists.htm", medianAnnual: 140910 },
  { career: "Doctor", oohTitle: "Physicians and surgeons", oohUrl: "https://www.bls.gov/ooh/healthcare/physicians-and-surgeons.htm", medianAnnual: 275930 },
  { career: "Emergency physician", oohTitle: "Emergency medicine physicians", oohUrl: "https://www.bls.gov/ooh/healthcare/physicians-and-surgeons.htm", medianAnnual: 335550 },
  { career: "Paramedic", oohTitle: "Paramedics", oohUrl: "https://www.bls.gov/ooh/healthcare/emts-and-paramedics.htm", medianAnnual: 60600 },
  { career: "Lawyer", oohTitle: "Lawyers", oohUrl: "https://www.bls.gov/ooh/legal/lawyers.htm", medianAnnual: 159670 },
  { career: "Real estate agent", oohTitle: "Real estate sales agents", oohUrl: "https://www.bls.gov/ooh/sales/real-estate-brokers-and-sales-agents.htm", medianAnnual: 52830 },
  { career: "Coach", oohTitle: "Coaches and scouts", oohUrl: "https://www.bls.gov/ooh/entertainment-and-sports/coaches-and-scouts.htm", medianAnnual: 47320 },
  { career: "Corporate trainer", oohTitle: "Training and development specialists", oohUrl: "https://www.bls.gov/ooh/business-and-financial/training-and-development-specialists.htm", medianAnnual: 69280 },
  { career: "Camp counselor", oohTitle: "Recreation workers", oohUrl: "https://www.bls.gov/ooh/personal-care-and-service/recreation-workers.htm", medianAnnual: 36560 },
  { career: "Shop teacher", oohTitle: "Career and technical education teachers", oohUrl: "https://www.bls.gov/ooh/education-training-and-library/career-and-technical-education-teachers.htm", medianAnnual: 65150 },
  { career: "School principal", oohTitle: "Elementary, middle, and high school principals", oohUrl: "https://www.bls.gov/ooh/management/elementary-middle-and-high-school-principals.htm", medianAnnual: 105870 },
  { career: "Construction manager", oohTitle: "Construction managers", oohUrl: "https://www.bls.gov/ooh/management/construction-managers.htm", medianAnnual: 114990 },
  { career: "Project manager", oohTitle: "Project management specialists", oohUrl: "https://www.bls.gov/ooh/business-and-financial/project-management-specialists.htm", medianAnnual: 102320 },
  { career: "Sales manager", oohTitle: "Sales managers", oohUrl: "https://www.bls.gov/ooh/management/sales-managers.htm", medianAnnual: 148270 },
  { career: "Event planner", oohTitle: "Meeting, convention, and event planners", oohUrl: "https://www.bls.gov/ooh/business-and-financial/meeting-convention-and-event-planners.htm", medianAnnual: 61160 },
  { career: "Event organizer", oohTitle: "Meeting, convention, and event planners", oohUrl: "https://www.bls.gov/ooh/business-and-financial/meeting-convention-and-event-planners.htm", medianAnnual: 61160 },
  { career: "Logistics planner", oohTitle: "Logisticians", oohUrl: "https://www.bls.gov/ooh/business-and-financial/logisticians.htm", medianAnnual: 82320 },
  { career: "Quality inspector", oohTitle: "Quality control inspectors", oohUrl: "https://www.bls.gov/ooh/production/quality-control-inspectors.htm", medianAnnual: 48570 },
  { career: "IT manager", oohTitle: "Computer and information systems managers", oohUrl: "https://www.bls.gov/ooh/management/computer-and-information-systems-managers.htm", medianAnnual: 175140 },
  { career: "Systems administrator", oohTitle: "Network and computer systems administrators", oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/network-and-computer-systems-administrators.htm", medianAnnual: 99130 },
  { career: "Engineering manager", oohTitle: "Architectural and engineering managers", oohUrl: "https://www.bls.gov/ooh/management/architectural-and-engineering-managers.htm", medianAnnual: 171270 },
  { career: "Office manager", oohTitle: "Administrative services managers", oohUrl: "https://www.bls.gov/ooh/management/administrative-services-managers.htm", medianAnnual: 114130 },
  { career: "Accountant", oohTitle: "Accountants and auditors", oohUrl: "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm", medianAnnual: 83680 },
  { career: "Interior designer", oohTitle: "Interior designers", oohUrl: "https://www.bls.gov/ooh/arts-and-design/interior-designers.htm", medianAnnual: 67190 },
  { career: "Psychologist", oohTitle: "Psychologists", oohUrl: "https://www.bls.gov/ooh/life-physical-and-social-science/psychologists.htm", medianAnnual: 99110 },
  { career: "Health educator", oohTitle: "Health education specialists", oohUrl: "https://www.bls.gov/ooh/community-and-social-service/health-educators.htm", medianAnnual: 64070 },
  { career: "Teaching assistant", oohTitle: "Teacher assistants", oohUrl: "https://www.bls.gov/ooh/education-training-and-library/teacher-assistants.htm", medianAnnual: 36780 },
  { career: "HR Director", oohTitle: "Human resources managers", oohUrl: "https://www.bls.gov/ooh/management/human-resources-managers.htm", medianAnnual: 149280 },
];

export type CareerPayLine = {
  title: string;
  display: string;
  medianAnnual: number;
  occupation: string;
  url: string;
};

export function formatMedianAnnual(amount: number): string {
  const digits = String(amount);
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${withCommas} a year`;
}

function careerKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

const PAY_BY_CAREER = new Map(OCCUPATION_PAY.map((row) => [careerKey(row.career), row]));

export function payForCareer(title: string): OccupationPay | null {
  return PAY_BY_CAREER.get(careerKey(title)) ?? null;
}

/** Pay lines for careers that have a handbook match. Unmatched titles are omitted. */
export function careerPayLines(titles: readonly string[]): CareerPayLine[] {
  const seen = new Set<string>();
  const lines: CareerPayLine[] = [];
  for (const title of titles) {
    const row = payForCareer(title);
    const id = careerKey(title);
    if (!row || seen.has(id)) continue;
    seen.add(id);
    lines.push({
      title,
      display: formatMedianAnnual(row.medianAnnual),
      medianAnnual: row.medianAnnual,
      occupation: row.oohTitle,
      url: row.oohUrl,
    });
  }
  return lines;
}
