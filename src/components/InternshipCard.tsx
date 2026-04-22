"use client";

import type { Internship, LeverageResult } from "@/types";
import { SOURCE_COLORS, COMPANY_SIZE_COLORS, COMPANY_SIZE_LABELS } from "@/types";
import LeverageBadge from "./LeverageBadge";

interface Props {
  internship: Internship;
  leverage: LeverageResult;
  rank: number;
  onTrack: (internship: Internship, leverage: LeverageResult) => void;
  isTracked: boolean;
}

export default function InternshipCard({
  internship,
  leverage,
  rank,
  onTrack,
  isTracked,
}: Props) {
  const srcColor = SOURCE_COLORS[internship.source];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 hover:shadow-md transition-shadow">
      {/* Rank */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-500">#{rank}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {internship.title}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">{internship.company} · {internship.location}</p>
          </div>
          <LeverageBadge leverage={leverage} showScore />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {internship.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize"
            >
              {tag}
            </span>
          ))}
          {internship.salary && (
            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
              {internship.salary}
            </span>
          )}
          <span
            className={`px-2 py-0.5 text-xs rounded-full border font-medium ${COMPANY_SIZE_COLORS[internship.companySize]}`}
          >
            {COMPANY_SIZE_LABELS[internship.companySize]}
          </span>
        </div>

        {/* Requirements */}
        {internship.requirements.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Looking for
            </p>
            <div className="flex flex-wrap gap-1.5">
              {internship.requirements.map((req) => {
                const matched = leverage.matchedRequirements.includes(req);
                return (
                  <span
                    key={req}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      matched
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    {matched ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-300">○</span>
                    )}
                    {req}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {leverage.referralBoost && (
          <p className="mt-2 text-xs text-amber-600 font-medium">
            💡 {leverage.referralBoost}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={internship.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md hover:bg-gray-700 transition-colors"
          >
            Apply Now
          </a>
          <button
            onClick={() => onTrack(internship, leverage)}
            disabled={isTracked}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
              isTracked
                ? "border-green-200 bg-green-50 text-green-700 cursor-default"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isTracked ? "✓ Tracking" : "Track"}
          </button>
          {/* Source badge */}
          <span
            className={`ml-auto px-2 py-0.5 text-white text-xs rounded font-medium capitalize ${srcColor}`}
          >
            {internship.source}
          </span>
        </div>
      </div>
    </div>
  );
}
