export type InternshipSource =
  | "linkedin"
  | "wellfound"
  | "indeed"
  | "handshake"
  | "themuse"
  | "ripplematch";

export type LeverageLevel = "hot" | "warm" | "cold";

export type ApplicationStatus =
  | "not_started"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export type CompanySize = "startup" | "mid-size" | "enterprise";

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  source: InternshipSource;
  applyUrl: string;
  isCompetitive: boolean;
  requirements: string[];
  salary?: string;
  postedAt: string; // ISO date string
  description: string;
  companySize: CompanySize;
}

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  startup: "Startup",
  "mid-size": "Mid-size",
  enterprise: "Enterprise",
};

export const COMPANY_SIZE_COLORS: Record<CompanySize, string> = {
  startup: "bg-violet-50 text-violet-700 border-violet-200",
  "mid-size": "bg-sky-50 text-sky-700 border-sky-200",
  enterprise: "bg-amber-50 text-amber-700 border-amber-200",
};

export interface LeverageResult {
  level: LeverageLevel;
  score: number; // 0–100
  reasons: string[];
  referralBoost?: string; // e.g. "+78% if you get a referral"
  matchedRequirements: string[]; // requirements the user's skills cover
}

export type ConnectionStrength = "acquaintance" | "colleague" | "close";

export const CONNECTION_STRENGTH_LABELS: Record<ConnectionStrength, string> = {
  acquaintance: "Acquaintance",
  colleague: "Colleague",
  close: "Close Contact",
};

// Points added to leverage score per strength level
export const CONNECTION_STRENGTH_POINTS: Record<ConnectionStrength, number> = {
  acquaintance: 20, // LinkedIn connection, met once at an event
  colleague:    32, // classmate, former coworker, alumni
  close:        45, // mentor, close friend, family
};

export const CONNECTION_STRENGTH_COLORS: Record<ConnectionStrength, string> = {
  acquaintance: "bg-gray-100 text-gray-700",
  colleague:    "bg-blue-100 text-blue-700",
  close:        "bg-green-100 text-green-800",
};

export interface Connection {
  company: string;
  strength: ConnectionStrength;
}

export interface UserProfile {
  id: string;
  name: string;
  skills: string[];
  targetRoles: string[];
  connections: Connection[];
}

export interface Application {
  id: string;
  internship: Internship;
  status: ApplicationStatus;
  leverage: LeverageResult;
  notes: string;
  savedAt: string; // ISO date string
  appliedAt?: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  not_started: "Not Started",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  not_started: "bg-gray-100 text-gray-700",
  applied: "bg-blue-100 text-blue-700",
  interview: "bg-yellow-100 text-yellow-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

export const SOURCE_COLORS: Record<InternshipSource, string> = {
  linkedin: "bg-blue-600",
  wellfound: "bg-black",
  indeed: "bg-purple-600",
  handshake: "bg-rose-500",
  themuse: "bg-teal-600",
  ripplematch: "bg-orange-500",
};
