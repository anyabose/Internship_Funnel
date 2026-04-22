"use client";

import { useState } from "react";
import type { ApplicationPackage } from "@/types";

interface Props {
  packages: ApplicationPackage[];
  onClose: () => void;
  onMarkApplied: (internshipId: string) => void;
}

export default function ApplicationPackageModal({ packages, onClose, onMarkApplied }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingCover, setEditingCover] = useState(false);
  const [editingSubject, setEditingSubject] = useState(false);
  // Local edits keyed by internshipId so each job keeps its own edits
  const [edits, setEdits] = useState<Record<string, { coverLetter?: string; subject?: string }>>({});

  function getField(field: "coverLetter" | "subject") {
    const pkg = packages[activeIdx];
    return edits[pkg.internshipId]?.[field] ?? pkg[field];
  }

  function setField(field: "coverLetter" | "subject", value: string) {
    const pkg = packages[activeIdx];
    setEdits((prev) => ({
      ...prev,
      [pkg.internshipId]: { ...prev[pkg.internshipId], [field]: value },
    }));
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  const pkg = packages[activeIdx];
  const coverLetter = getField("coverLetter");
  const subject = getField("subject");
  const isEdited =
    (edits[pkg.internshipId]?.coverLetter !== undefined &&
      edits[pkg.internshipId]?.coverLetter !== pkg.coverLetter) ||
    (edits[pkg.internshipId]?.subject !== undefined &&
      edits[pkg.internshipId]?.subject !== pkg.subject);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Application Packages</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Tailored to your resume · Edit anything before copying
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-light transition-colors"
          >
            ×
          </button>
        </div>

        {/* Job tabs */}
        {packages.length > 1 && (
          <div className="flex gap-1 px-6 pt-4 overflow-x-auto">
            {packages.map((p, i) => (
              <button
                key={p.internshipId}
                onClick={() => { setActiveIdx(i); setEditingCover(false); setEditingSubject(false); }}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  i === activeIdx
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p.company}
                {edits[p.internshipId] && <span className="ml-1 text-blue-400">✎</span>}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Job title */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Applying to</p>
            <p className="font-semibold text-gray-900 mt-0.5">{pkg.title} · {pkg.company}</p>
          </div>

          {/* Subject line */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Subject</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditingSubject((v) => !v); }}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {editingSubject ? "Done" : "✎ Edit"}
                </button>
                <button
                  onClick={() => copy(subject, "subject")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {copied === "subject" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            {editingSubject ? (
              <input
                autoFocus
                type="text"
                value={subject}
                onChange={(e) => setField("subject", e.target.value)}
                className="w-full text-sm px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            ) : (
              <p className="text-sm text-gray-800">{subject}</p>
            )}
          </div>

          {/* Skills to emphasize */}
          {pkg.skillsToEmphasize.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Emphasize These Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pkg.skillsToEmphasize.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium rounded-full"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cover letter */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Cover Letter
                </p>
                {isEdited && (
                  <span className="text-xs text-blue-500 font-medium">Edited</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {editingCover && isEdited && (
                  <button
                    onClick={() => {
                      setEdits((prev) => ({
                        ...prev,
                        [pkg.internshipId]: { ...prev[pkg.internshipId], coverLetter: pkg.coverLetter },
                      }));
                    }}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setEditingCover((v) => !v)}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {editingCover ? "Done" : "✎ Edit"}
                </button>
                <button
                  onClick={() => copy(coverLetter, "cover")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {copied === "cover" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            {editingCover ? (
              <textarea
                autoFocus
                value={coverLetter}
                onChange={(e) => setField("coverLetter", e.target.value)}
                rows={12}
                className="w-full text-sm px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed resize-y"
              />
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {coverLetter}
              </p>
            )}
          </div>

          {/* Tips */}
          {pkg.tips.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Application Tips
              </p>
              <ul className="space-y-1.5">
                {pkg.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 font-bold mt-0.5">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => {
              onMarkApplied(pkg.internshipId);
              if (activeIdx < packages.length - 1) {
                setActiveIdx(activeIdx + 1);
                setEditingCover(false);
                setEditingSubject(false);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            ✓ Mark as Applied{packages.length > 1 ? " & Next" : ""}
          </button>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
