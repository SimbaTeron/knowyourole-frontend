import { db } from "./db";
import { jobRoles, type JobRole } from "@shared/schema";

interface UserScores {
  mbti: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  disc: {
    D: number; I: number; S: number; C: number;
  };
  bigFive: {
    O: number; C: number; E: number; A: number; N: number;
  };
}

interface JobMatch {
  role: JobRole;
  matchScore: number;
  explanation: string;
  traitHighlights: string[];
}

function normalizeToFiveScale(percentage: number): number {
  if (percentage <= 20) return 1;
  if (percentage <= 40) return 2;
  if (percentage <= 60) return 3;
  if (percentage <= 80) return 4;
  return 5;
}

function getMBTIPreference(scores: UserScores['mbti']): {
  ei: number; sn: number; tf: number; jp: number;
} {
  const totalEI = scores.E + scores.I || 1;
  const totalSN = scores.S + scores.N || 1;
  const totalTF = scores.T + scores.F || 1;
  const totalJP = scores.J + scores.P || 1;
  
  return {
    ei: normalizeToFiveScale((scores.E / totalEI) * 100),
    sn: normalizeToFiveScale((scores.S / totalSN) * 100),
    tf: normalizeToFiveScale((scores.T / totalTF) * 100),
    jp: normalizeToFiveScale((scores.J / totalJP) * 100),
  };
}

function getDISCProfile(scores: UserScores['disc']): {
  d: number; i: number; s: number; c: number;
} {
  const total = scores.D + scores.I + scores.S + scores.C || 1;
  return {
    d: normalizeToFiveScale((scores.D / total) * 400),
    i: normalizeToFiveScale((scores.I / total) * 400),
    s: normalizeToFiveScale((scores.S / total) * 400),
    c: normalizeToFiveScale((scores.C / total) * 400),
  };
}

function getBigFiveProfile(scores: UserScores['bigFive']): {
  o: number; c: number; e: number; a: number; n: number;
} {
  return {
    o: normalizeToFiveScale(scores.O),
    c: normalizeToFiveScale(scores.C),
    e: normalizeToFiveScale(scores.E),
    a: normalizeToFiveScale(scores.A),
    n: normalizeToFiveScale(100 - scores.N),
  };
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

function calculateJobMatch(userScores: UserScores, job: JobRole): number {
  const userMBTI = getMBTIPreference(userScores.mbti);
  const userDISC = getDISCProfile(userScores.disc);
  const userBig5 = getBigFiveProfile(userScores.bigFive);
  
  const userMBTIVec = [userMBTI.ei, userMBTI.sn, userMBTI.tf, userMBTI.jp];
  const jobMBTIVec = [job.mbtiEI, job.mbtiSN, job.mbtiTF, job.mbtiJP];
  const mbtiSimilarity = cosineSimilarity(userMBTIVec, jobMBTIVec);
  
  const userDISCVec = [userDISC.d, userDISC.i, userDISC.s, userDISC.c];
  const jobDISCVec = [job.discD, job.discI, job.discS, job.discC];
  const discSimilarity = cosineSimilarity(userDISCVec, jobDISCVec);
  
  const userBig5Vec = [userBig5.o, userBig5.c, userBig5.e, userBig5.a, userBig5.n];
  const jobBig5Vec = [job.big5O, job.big5C, job.big5E, job.big5A, job.big5N];
  const big5Similarity = cosineSimilarity(userBig5Vec, jobBig5Vec);
  
  const weightedScore = (big5Similarity * 0.40) + (mbtiSimilarity * 0.30) + (discSimilarity * 0.30);
  
  return Math.round(weightedScore * 100);
}

function getTopTraits(userScores: UserScores): string[] {
  const traits: { name: string; score: number }[] = [];
  
  const totalEI = userScores.mbti.E + userScores.mbti.I || 1;
  if (userScores.mbti.E / totalEI > 0.6) traits.push({ name: "Extraversion", score: userScores.mbti.E / totalEI * 100 });
  if (userScores.mbti.I / totalEI > 0.6) traits.push({ name: "Introversion", score: userScores.mbti.I / totalEI * 100 });
  
  if (userScores.bigFive.O > 65) traits.push({ name: "Openness", score: userScores.bigFive.O });
  if (userScores.bigFive.C > 65) traits.push({ name: "Conscientiousness", score: userScores.bigFive.C });
  if (userScores.bigFive.A > 65) traits.push({ name: "Agreeableness", score: userScores.bigFive.A });
  if (userScores.bigFive.N < 35) traits.push({ name: "Emotional Stability", score: 100 - userScores.bigFive.N });
  
  const discTotal = userScores.disc.D + userScores.disc.I + userScores.disc.S + userScores.disc.C || 1;
  if (userScores.disc.D / discTotal > 0.3) traits.push({ name: "Dominance", score: userScores.disc.D / discTotal * 100 });
  if (userScores.disc.I / discTotal > 0.3) traits.push({ name: "Influence", score: userScores.disc.I / discTotal * 100 });
  if (userScores.disc.S / discTotal > 0.3) traits.push({ name: "Steadiness", score: userScores.disc.S / discTotal * 100 });
  if (userScores.disc.C / discTotal > 0.3) traits.push({ name: "Conscientiousness", score: userScores.disc.C / discTotal * 100 });
  
  return traits
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(t => t.name);
}

function generateExplanation(userScores: UserScores, job: JobRole, topTraits: string[]): string {
  const jobName = job.roleName;
  const traitList = topTraits.slice(0, 2).join(" and ");
  
  const sentences: string[] = [];
  
  sentences.push(`Your ${traitList} traits align well with the demands of a ${jobName}.`);
  
  if (job.big5C >= 4 && userScores.bigFive.C > 60) {
    sentences.push("Your detail-oriented nature matches this role's need for precision.");
  } else if (job.discI >= 4 && userScores.disc.I > 30) {
    sentences.push("Your communication skills would help you excel in this people-focused role.");
  } else if (job.big5O >= 4 && userScores.bigFive.O > 60) {
    sentences.push("Your creative thinking aligns with this role's innovative requirements.");
  } else if (job.discD >= 4 && userScores.disc.D > 30) {
    sentences.push("Your leadership qualities match this role's need for decision-making.");
  } else {
    sentences.push("Your personality profile suggests natural aptitude for this work.");
  }
  
  const collarDescriptions: Record<string, string> = {
    white: "office-based professional work",
    blue: "hands-on technical work",
    healthcare: "caring for others' well-being",
    service: "helping and serving people",
    arts: "creative and expressive work",
  };
  
  sentences.push(`This career offers ${collarDescriptions[job.jobCollar] || "meaningful work"} that could be fulfilling for you.`);
  
  return sentences.join(" ");
}

export async function getJobMatches(
  userScores: UserScores,
  limit: number = 3,
  diversityBoost: boolean = true
): Promise<JobMatch[]> {
  const allJobs = await db.select().from(jobRoles);
  const topTraits = getTopTraits(userScores);
  
  const jobsWithScores = allJobs.map(job => ({
    role: job,
    matchScore: calculateJobMatch(userScores, job),
    explanation: generateExplanation(userScores, job, topTraits),
    traitHighlights: topTraits,
  }));
  
  jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
  
  const usedNames = new Set<string>();
  const deduped = jobsWithScores.filter(job => {
    const name = job.role.roleName.toLowerCase().trim();
    if (usedNames.has(name)) return false;
    usedNames.add(name);
    return true;
  });

  if (diversityBoost && limit > 1) {
    const result: JobMatch[] = [];
    const usedCollars = new Set<string>();
    
    for (const job of deduped) {
      if (result.length >= limit) break;
      
      if (!usedCollars.has(job.role.jobCollar) || result.length >= limit - 1) {
        result.push(job);
        usedCollars.add(job.role.jobCollar);
      }
    }
    
    while (result.length < limit && deduped.length > result.length) {
      const next = deduped.find(j => !result.includes(j));
      if (next) result.push(next);
    }
    
    return result;
  }
  
  return deduped.slice(0, limit);
}

export async function getTopJobMatch(userScores: UserScores): Promise<JobMatch | null> {
  const matches = await getJobMatches(userScores, 1, false);
  return matches[0] || null;
}
