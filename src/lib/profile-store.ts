/**
 * Simple localStorage-backed profile store.
 * In production this syncs to Supabase once auth is connected.
 */
import type { UserProfile } from "@/types";

const KEY = "internship_funnel_profile";

export const DEFAULT_PROFILE: UserProfile = {
  id: "local",
  name: "",
  skills: [],
  targetRoles: [],
  connections: [],
};

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as UserProfile;
    // Migrate old string[] connections to Connection[] format
    const connections = (parsed.connections ?? []).map((c) =>
      typeof c === "string" ? { company: c, strength: "acquaintance" as const } : c
    );
    return { ...parsed, connections };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(profile));
}
