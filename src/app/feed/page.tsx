"use client";

import { useState, useEffect, useMemo } from "react";
import InternshipCard from "@/components/InternshipCard";
import { MOCK_INTERNSHIPS } from "@/lib/mock-data";
import { rankInternships } from "@/lib/leverage-score";
import { loadProfile, DEFAULT_PROFILE } from "@/lib/profile-store";
import { addApplication, loadApplications } from "@/lib/application-store";
import type { Internship, LeverageResult, CompanySize } from "@/types";
import { COMPANY_SIZE_LABELS } from "@/types";

const ALL_TAGS = [
  "engineering", "marketing", "finance", "design", "data",
  "operations", "business", "machine learning",
];

const COMPANY_SIZES: CompanySize[] = ["startup", "mid-size", "enterprise"];

export default function FeedPage() {
  // Initialize with DEFAULT_PROFILE so server and client render the same HTML,
  // then load from localStorage after mount to avoid hydration mismatch.
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeSize, setActiveSize] = useState<CompanySize | null>(null);
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const apps = loadApplications();
    setTrackedIds(new Set(apps.map((a) => a.internship.id)));
    setProfile(loadProfile());
  }, []);

  const ranked = useMemo(() => rankInternships(MOCK_INTERNSHIPS, profile), [profile]);

  const filtered = useMemo(() => {
    return ranked.filter((i) => {
      const matchesTag = !activeTag || i.tags.includes(activeTag);
      const matchesSize = !activeSize || i.companySize === activeSize;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        i.tags.some((t) => t.includes(q));
      return matchesTag && matchesSize && matchesSearch;
    });
  }, [ranked, activeTag, activeSize, search]);

  function handleTrack(internship: Internship, leverage: LeverageResult) {
    addApplication(internship, leverage);
    setTrackedIds((prev) => new Set([...prev, internship.id]));
    showToast(`Added ${internship.company} to your tracker!`);
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  const hotCount = ranked.filter((i) => i.leverage.level === "hot").length;
  const warmCount = ranked.filter((i) => i.leverage.level === "warm").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Ranked Feed</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sorted by your Leverage Score.{" "}
          <span className="text-red-600 font-medium">{hotCount} Hot</span>
          {" · "}
          <span className="text-amber-600 font-medium">{warmCount} Warm</span>
          {" · "}
          <span className="text-slate-500 font-medium">
            {ranked.length - hotCount - warmCount} Cold
          </span>
        </p>
      </div>

      {/* Profile notice if empty */}
      {profile.skills.length === 0 && profile.connections.length === 0 && (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <strong>Set up your profile</strong> to get a personalized Leverage
          Score.{" "}
          <a href="/profile" className="underline font-semibold">
            Add skills & connections →
          </a>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2 mb-5">
        {/* Search + company size */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search roles, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
            <span className="text-xs text-gray-400 font-medium pr-1">Size</span>
            <button
              onClick={() => setActiveSize(null)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                !activeSize
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            {COMPANY_SIZES.map((size) => {
              const colors = {
                startup: activeSize === size ? "bg-violet-600 text-white" : "text-violet-700 hover:bg-violet-50",
                "mid-size": activeSize === size ? "bg-sky-600 text-white" : "text-sky-700 hover:bg-sky-50",
                enterprise: activeSize === size ? "bg-amber-600 text-white" : "text-amber-700 hover:bg-amber-50",
              };
              return (
                <button
                  key={size}
                  onClick={() => setActiveSize(activeSize === size ? null : size)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${colors[size]}`}
                >
                  {COMPANY_SIZE_LABELS[size]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              !activeTag
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            All topics
          </button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                activeTag === tag
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No internships match your filters.
          </div>
        ) : (
          filtered.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              leverage={internship.leverage}
              rank={internship.rank}
              onTrack={handleTrack}
              isTracked={trackedIds.has(internship.id)}
            />
          ))
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
