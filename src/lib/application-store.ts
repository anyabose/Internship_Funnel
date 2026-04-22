/**
 * localStorage-backed application tracker.
 * Swappable for Supabase once auth is wired up.
 */
import type { Application, ApplicationStatus, Internship, LeverageResult } from "@/types";

const KEY = "internship_funnel_applications";

export function loadApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

export function saveApplications(apps: Application[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(apps));
}

export function addApplication(
  internship: Internship,
  leverage: LeverageResult
): Application[] {
  const apps = loadApplications();
  const exists = apps.find((a) => a.internship.id === internship.id);
  if (exists) return apps;

  const newApp: Application = {
    id: `${internship.id}_${Date.now()}`,
    internship,
    status: "not_started",
    leverage,
    notes: "",
    savedAt: new Date().toISOString(),
  };

  const updated = [newApp, ...apps];
  saveApplications(updated);
  return updated;
}

export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Application[] {
  const apps = loadApplications();
  const updated = apps.map((a) =>
    a.id === id
      ? {
          ...a,
          status,
          appliedAt:
            status === "applied" && !a.appliedAt
              ? new Date().toISOString()
              : a.appliedAt,
        }
      : a
  );
  saveApplications(updated);
  return updated;
}

export function updateApplicationNotes(
  id: string,
  notes: string
): Application[] {
  const apps = loadApplications();
  const updated = apps.map((a) => (a.id === id ? { ...a, notes } : a));
  saveApplications(updated);
  return updated;
}

export function removeApplication(id: string): Application[] {
  const apps = loadApplications().filter((a) => a.id !== id);
  saveApplications(apps);
  return apps;
}
