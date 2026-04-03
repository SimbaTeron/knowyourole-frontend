export function calculateArcEvolution(results: any[]): any {
  if (results.length < 2) return null;
  
  const sorted = [...results].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  
  const traitNames = ['O', 'C', 'E', 'A', 'N'];
  const traitLabels: Record<string, string> = {
    O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', 
    A: 'Agreeableness', N: 'Neuroticism'
  };
  
  const changes: Array<{ trait: string; label: string; change: number; direction: string; insight: string }> = [];
  
  for (const trait of traitNames) {
    const firstVal = first[`bigFive${trait}`] || 50;
    const latestVal = latest[`bigFive${trait}`] || 50;
    const change = latestVal - firstVal;
    
    if (Math.abs(change) >= 5) {
      const direction = change > 0 ? 'up' : 'down';
      const insight = getTraitChangeInsight(trait, change);
      changes.push({
        trait,
        label: traitLabels[trait],
        change: Math.round(change),
        direction,
        insight
      });
    }
  }
  
  changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  
  return {
    totalQuizzes: results.length,
    firstQuizDate: first.createdAt,
    latestQuizDate: latest.createdAt,
    mbtiEvolution: {
      first: first.mbtiType,
      latest: latest.mbtiType,
      changed: first.mbtiType !== latest.mbtiType
    },
    significantChanges: changes.slice(0, 3),
    timeline: sorted.map((r, i) => ({
      index: i + 1,
      date: r.createdAt,
      mbtiType: r.mbtiType,
      bigFive: {
        O: r.bigFiveO,
        C: r.bigFiveC,
        E: r.bigFiveE,
        A: r.bigFiveA,
        N: r.bigFiveN
      }
    }))
  };
}

export function getTraitChangeInsight(trait: string, change: number): string {
  const insights: Record<string, { up: string; down: string }> = {
    O: { 
      up: "Creative roles expanding! You're more open to new experiences.", 
      down: "Becoming more focused and practical in your approach." 
    },
    C: { 
      up: "Your organizational skills are growing stronger!", 
      down: "Embracing more flexibility and spontaneity." 
    },
    E: { 
      up: "Social confidence rising! Leadership roles may suit you better now.", 
      down: "Finding value in deeper, more focused connections." 
    },
    A: { 
      up: "Your collaborative side is flourishing!", 
      down: "Developing stronger boundaries and assertiveness." 
    },
    N: { 
      up: "Increased emotional sensitivity - use it for empathy.", 
      down: "Growing emotional resilience - stress management improving!" 
    }
  };
  
  return change > 0 ? insights[trait]?.up : insights[trait]?.down;
}

export function analyzeRoleFitFromDB(roleData: any, bigFive: any, mbtiType: string, discStyle: string): any {
  const idealTraits: Record<string, { ideal: number; weight: number }> = {
    O: { ideal: roleData.big5O * 20, weight: 0.2 },
    C: { ideal: roleData.big5C * 20, weight: 0.2 },
    E: { ideal: roleData.big5E * 20, weight: 0.2 },
    A: { ideal: roleData.big5A * 20, weight: 0.2 },
    N: { ideal: roleData.big5N * 20, weight: 0.2 },
  };

  const pros: string[] = [];
  const cons: string[] = [];

  const traitLabels: Record<string, string> = {
    O: 'Creativity', C: 'Organization', E: 'Social Energy', A: 'Collaboration', N: 'Stress Handling'
  };

  for (const [trait, config] of Object.entries(idealTraits)) {
    const userVal = bigFive[trait] || 50;
    const diff = userVal - config.ideal;
    const label = traitLabels[trait];

    if (Math.abs(diff) <= 15) {
      pros.push(`${label}: Well-aligned (${userVal}% vs ${config.ideal}% ideal)`);
    } else if (diff > 15) {
      if (trait === 'N') {
        cons.push(`Sensitivity: May feel role stress more intensely`);
      } else {
        pros.push(`${label}: Strong natural fit (${userVal}%)`);
      }
    } else {
      if (trait === 'N') {
        pros.push(`Stress resilience: Natural calm under pressure`);
      } else {
        cons.push(`${label}: May need development (${userVal}% vs ${config.ideal}% ideal)`);
      }
    }
  }

  let matchScore = 0;
  let totalWeight = 0;
  for (const [trait, config] of Object.entries(idealTraits)) {
    const userVal = bigFive[trait] || 50;
    const diff = Math.abs(userVal - config.ideal);
    const traitScore = Math.max(0, 100 - diff * 1.5);
    matchScore += traitScore * config.weight;
    totalWeight += config.weight;
  }
  matchScore = Math.round(matchScore / totalWeight);

  const collarTips: Record<string, string[]> = {
    'white': ["Build cross-functional communication skills", "Develop strategic thinking habits", "Practice time management techniques"],
    'blue': ["Invest in safety and certification training", "Build physical endurance routines", "Develop problem-solving under pressure"],
    'healthcare': ["Build emotional boundaries", "Practice active listening", "Develop stress coping strategies"],
    'service': ["Strengthen customer interaction skills", "Build patience and adaptability", "Practice conflict de-escalation"],
    'arts': ["Develop business and self-promotion skills", "Build a support network", "Create sustainable creative routines"],
  };

  const tips = collarTips[roleData.jobCollar] || collarTips['white'];

  return {
    dreamRole: roleData.roleName,
    matchScore,
    pros: pros.slice(0, 4),
    cons: cons.slice(0, 3),
    tips: tips.slice(0, 3),
    verdict: matchScore >= 70 ? 'Strong Fit' : matchScore >= 50 ? 'Moderate Fit' : 'Growth Opportunity'
  };
}
