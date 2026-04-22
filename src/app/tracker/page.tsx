"use client";

import { useState, useEffect } from "react";
import {
  loadApplications,
  updateApplicationStatus,
  updateApplicationNotes,
  removeApplication,
} from "@/lib/application-store";
import { loadResume } from "@/lib/resume-store";
import { generatePackageLocally } from "@/lib/generate-package-local";
import LeverageBadge from "@/components/LeverageBadge";
import ApplicationPackageModal from "@/components/ApplicationPackageModal";
import type { Application, ApplicationStatus, ApplicationPackage } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";

const STATUSES: ApplicationStatus[] = [
  "not_started", "applied", "interview", "offer", "rejected",
];

export default function TrackerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [packages, setPackages] = useState<ApplicationPackage[] | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus | "">("");

  useEffect(() => {
    setApps(loadApplications());
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === apps.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(apps.map((a) => a.id)));
    }
  }

  function handleStatusChange(id: string, status: ApplicationStatus) {
    setApps(updateApplicationStatus(id, status));
  }

  function handleNotesSave(id: string) {
    setApps(updateApplicationNotes(id, notesDraft));
    setEditingNotes(null);
  }

  function handleRemove(id: string) {
    setApps(removeApplication(id));
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  function handleBulkStatus() {
    if (!bulkStatus) return;
    let updated = apps;
    selected.forEach((id) => {
      updated = updateApplicationStatus(id, bulkStatus as ApplicationStatus);
    });
    setApps(updated);
    setSelected(new Set());
    setBulkStatus("");
  }

  function handleGeneratePackages() {
    const resume = loadResume();
    if (!resume) {
      setGenError("Upload your resume on the Profile page first.");
      return;
    }

    const selectedApps = apps.filter((a) => selected.has(a.id));
    if (!selectedApps.length) return;

    setGenerating(true);
    setGenError(null);

    try {
      const generated = selectedApps.map((a) =>
        generatePackageLocally(
          {
            id: a.id,
            title: a.internship.title,
            company: a.internship.company,
            requirements: a.internship.requirements,
            description: a.internship.description,
            tags: a.internship.tags,
          },
          resume
        )
      );
      setPackages(generated);
    } catch {
      setGenError("Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  function handleMarkApplied(internshipId: string) {
    const app = apps.find((a) => a.internship.id === internshipId || a.id === internshipId);
    if (app) {
      setApps(updateApplicationStatus(app.id, "applied"));
    }
  }

  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: apps.filter((a) => a.status === s).length }),
    {} as Record<ApplicationStatus, number>
  );

  const anySelected = selected.size > 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
        <p className="text-gray-500 text-sm mt-1">
          {apps.length} saved · {counts.applied} applied · {counts.interview} interviews · {counts.offer} offers
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {STATUSES.map((s) => (
          <div key={s} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
            <p className="text-xs text-gray-500 mt-0.5">{STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>

      {/* Bulk action toolbar */}
      {apps.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-white border border-gray-200 rounded-xl">
          <button
            onClick={toggleSelectAll}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            {selected.size === apps.length ? "Deselect All" : "Select All"}
          </button>

          {anySelected && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500 font-medium">{selected.size} selected</span>

              {/* Bulk status */}
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as ApplicationStatus | "")}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Update status...</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              {bulkStatus && (
                <button
                  onClick={handleBulkStatus}
                  className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Apply
                </button>
              )}

              <span className="text-gray-300">|</span>

              {/* Generate packages */}
              <button
                onClick={handleGeneratePackages}
                disabled={generating}
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {generating ? (
                  <>⏳ Generating...</>
                ) : (
                  <>✨ Generate Application Package{selected.size > 1 ? "s" : ""}</>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {genError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {genError}{" "}
          {genError.includes("resume") && (
            <a href="/profile" className="underline font-semibold">Go to Profile →</a>
          )}
        </div>
      )}

      {/* Empty state */}
      {apps.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-700">No applications yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Go to the{" "}
            <a href="/feed" className="text-blue-600 underline">Feed</a>{" "}
            and click <strong>Track</strong> on any internship.
          </p>
        </div>
      )}

      {/* Application list */}
      <div className="space-y-3">
        {apps.map((app) => (
          <div
            key={app.id}
            className={`bg-white border rounded-xl p-5 transition-colors ${
              selected.has(app.id) ? "border-blue-300 ring-1 ring-blue-300" : "border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(app.id)}
                onChange={() => toggleSelect(app.id)}
                className="mt-1 w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {app.internship.title}
                      </h3>
                      <LeverageBadge leverage={app.leverage} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {app.internship.company} · {app.internship.location}
                    </p>
                  </div>

                  {/* Status dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[app.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="mt-3">
                  {editingNotes === app.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleNotesSave(app.id)}
                        placeholder="Add a note..."
                        className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={() => handleNotesSave(app.id)} className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg">Save</button>
                      <button onClick={() => setEditingNotes(null)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingNotes(app.id); setNotesDraft(app.notes); }}
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {app.notes ? `📝 ${app.notes}` : "+ Add note"}
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Saved {new Date(app.savedAt).toLocaleDateString()}
                    {app.appliedAt && ` · Applied ${new Date(app.appliedAt).toLocaleDateString()}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <a href={app.internship.applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      Apply →
                    </a>
                    <button onClick={() => handleRemove(app.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application package modal */}
      {packages && (
        <ApplicationPackageModal
          packages={packages}
          onClose={() => { setPackages(null); setSelected(new Set()); }}
          onMarkApplied={handleMarkApplied}
        />
      )}
    </div>
  );
}
