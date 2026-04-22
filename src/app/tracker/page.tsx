"use client";

import { useState, useEffect } from "react";
import {
  loadApplications,
  updateApplicationStatus,
  updateApplicationNotes,
  removeApplication,
} from "@/lib/application-store";
import LeverageBadge from "@/components/LeverageBadge";
import type { Application, ApplicationStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";

const STATUSES: ApplicationStatus[] = [
  "not_started",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export default function TrackerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    setApps(loadApplications());
  }, []);

  function handleStatusChange(id: string, status: ApplicationStatus) {
    setApps(updateApplicationStatus(id, status));
  }

  function handleNotesEdit(app: Application) {
    setEditingNotes(app.id);
    setNotesDraft(app.notes);
  }

  function handleNotesSave(id: string) {
    setApps(updateApplicationNotes(id, notesDraft));
    setEditingNotes(null);
  }

  function handleRemove(id: string) {
    setApps(removeApplication(id));
  }

  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: apps.filter((a) => a.status === s).length }),
    {} as Record<ApplicationStatus, number>
  );

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
          <div
            key={s}
            className="bg-white border border-gray-200 rounded-xl p-3 text-center"
          >
            <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
            <p className="text-xs text-gray-500 mt-0.5">{STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {apps.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-700">No applications yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Go to the{" "}
            <a href="/feed" className="text-blue-600 underline">
              Feed
            </a>{" "}
            and click <strong>Track</strong> on any internship.
          </p>
        </div>
      )}

      {/* Application list */}
      <div className="space-y-3">
        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
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
                onChange={(e) =>
                  handleStatusChange(app.id, e.target.value as ApplicationStatus)
                }
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[app.status]}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
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
                  <button
                    onClick={() => handleNotesSave(app.id)}
                    className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNotes(null)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNotesEdit(app)}
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
                {app.appliedAt &&
                  ` · Applied ${new Date(app.appliedAt).toLocaleDateString()}`}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={app.internship.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Apply →
                </a>
                <button
                  onClick={() => handleRemove(app.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
