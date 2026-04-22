const KEY = "internship_funnel_resume";

export interface ResumeData {
  text: string;       // raw extracted text
  fileName: string;
  uploadedAt: string;
}

export function loadResume(): ResumeData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ResumeData) : null;
  } catch {
    return null;
  }
}

export function saveResume(data: ResumeData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearResume(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
