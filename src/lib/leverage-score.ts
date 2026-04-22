import type { Internship, LeverageResult, UserProfile } from "@/types";
import { CONNECTION_STRENGTH_POINTS, CONNECTION_STRENGTH_LABELS } from "@/types";

export function calculateLeverage(
  internship: Internship,
  profile: UserProfile
): LeverageResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Connection boost — varies by strength
  const connection = profile.connections.find(
    (c) => c.company.toLowerCase() === internship.company.toLowerCase()
  );

  const hasConnection = !!connection;

  if (connection) {
    const pts = CONNECTION_STRENGTH_POINTS[connection.strength];
    score += pts;
    const label = CONNECTION_STRENGTH_LABELS[connection.strength];
    reasons.push(`${label} connection at ${internship.company} (+${pts} pts)`);
  }

  // 2. Skills match (+up to 35 pts)
  const matchedRequirements: string[] = [];
  if (internship.requirements.length > 0) {
    const matched = internship.requirements.filter((req) =>
      profile.skills.some((skill) =>
        skill.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(skill.toLowerCase())
      )
    );
    matchedRequirements.push(...matched);
    const matchRatio = matched.length / internship.requirements.length;
    const skillPoints = Math.round(matchRatio * 35);
    score += skillPoints;

    if (matched.length > 0) {
      reasons.push(
        `Your skills match ${matched.length}/${internship.requirements.length} requirements`
      );
    }
  }

  // 3. Target role match (+15 pts)
  const titleLower = internship.title.toLowerCase();
  const roleMatch = profile.targetRoles.some((role) =>
    titleLower.includes(role.toLowerCase()) ||
    role.toLowerCase().includes(titleLower.split(" ")[0])
  );
  if (roleMatch) {
    score += 15;
    reasons.push("Matches one of your target roles");
  }

  // 4. Competitiveness modifier
  if (!internship.isCompetitive) {
    score += 10;
    reasons.push("Lower competition than average for this role");
  } else {
    score = Math.max(0, score - 5);
  }

  // Clamp 0–100
  score = Math.max(0, Math.min(100, score));

  // Referral boost message (shown when not yet connected)
  const referralBoost = !hasConnection
    ? `+${Math.min(40, Math.round((40 / Math.max(score, 1)) * 40))}% if you get a referral`
    : undefined;

  const level =
    score >= 65 ? "hot" : score >= 35 ? "warm" : "cold";

  return { level, score, reasons, referralBoost, matchedRequirements };
}

/** Rank internships: Hot > Warm > Cold, then by score desc, then recency */
export function rankInternships(
  internships: Internship[],
  profile: UserProfile
): Array<Internship & { leverage: LeverageResult; rank: number }> {
  const withLeverage = internships.map((i) => ({
    ...i,
    leverage: calculateLeverage(i, profile),
  }));

  const ORDER: Record<string, number> = { hot: 0, warm: 1, cold: 2 };

  withLeverage.sort((a, b) => {
    const levelDiff = ORDER[a.leverage.level] - ORDER[b.leverage.level];
    if (levelDiff !== 0) return levelDiff;
    const scoreDiff = b.leverage.score - a.leverage.score;
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  return withLeverage.map((i, idx) => ({ ...i, rank: idx + 1 }));
}
