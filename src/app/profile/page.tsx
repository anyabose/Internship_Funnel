"use client";

import { useState, useEffect } from "react";
import { loadProfile, saveProfile, DEFAULT_PROFILE } from "@/lib/profile-store";
import type { UserProfile, ConnectionStrength, Connection } from "@/types";
import {
  CONNECTION_STRENGTH_LABELS,
  CONNECTION_STRENGTH_COLORS,
  CONNECTION_STRENGTH_POINTS,
} from "@/types";

const STRENGTHS: ConnectionStrength[] = ["acquaintance", "colleague", "close"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [skillInput, setSkillInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [connCompany, setConnCompany] = useState("");
  const [connStrength, setConnStrength] = useState<ConnectionStrength>("colleague");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function addTag(
    field: keyof Pick<UserProfile, "skills" | "targetRoles">,
    value: string,
    setValue: (v: string) => void
  ) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (profile[field].map((x) => x.toLowerCase()).includes(trimmed.toLowerCase())) {
      setValue("");
      return;
    }
    setProfile((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }));
    setValue("");
  }

  function removeTag(field: keyof Pick<UserProfile, "skills" | "targetRoles">, value: string) {
    setProfile((prev) => ({
      ...prev,
      [field]: prev[field].filter((x) => x !== value),
    }));
  }

  function addConnection() {
    const trimmed = connCompany.trim();
    if (!trimmed) return;
    const exists = profile.connections.some(
      (c) => c.company.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) { setConnCompany(""); return; }
    setProfile((prev) => ({
      ...prev,
      connections: [...prev.connections, { company: trimmed, strength: connStrength }],
    }));
    setConnCompany("");
  }

  function updateConnectionStrength(company: string, strength: ConnectionStrength) {
    setProfile((prev) => ({
      ...prev,
      connections: prev.connections.map((c) =>
        c.company === company ? { ...c, strength } : c
      ),
    }));
  }

  function removeConnection(company: string) {
    setProfile((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.company !== company),
    }));
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          This powers your Leverage Score. The more you fill in, the better your ranking.
        </p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <Section title="Name">
          <input
            type="text"
            placeholder="Your name"
            value={profile.name}
            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Section>

        {/* Skills */}
        <Section title="Skills" hint="e.g. Python, React, SQL, Canva, Excel">
          <TagInput
            tags={profile.skills}
            inputValue={skillInput}
            onInputChange={setSkillInput}
            onAdd={() => addTag("skills", skillInput, setSkillInput)}
            onRemove={(v) => removeTag("skills", v)}
            placeholder="Add a skill and press Enter"
          />
        </Section>

        {/* Target roles */}
        <Section title="Target Roles" hint="e.g. Software Engineer, Marketing, Data Science">
          <TagInput
            tags={profile.targetRoles}
            inputValue={roleInput}
            onInputChange={setRoleInput}
            onAdd={() => addTag("targetRoles", roleInput, setRoleInput)}
            onRemove={(v) => removeTag("targetRoles", v)}
            placeholder="Add a role and press Enter"
          />
        </Section>

        {/* Connections */}
        <Section
          title="Connections"
          hint="Companies where you know someone — this is the single biggest boost to your Leverage Score. Adding a connection at a company automatically bumps that internship from Cold or Warm to Hot, and unlocks the referral boost tip on the card. Even a casual LinkedIn connection or alumni contact counts."
        >
          <ConnectionsInput
            connections={profile.connections}
            companyValue={connCompany}
            onCompanyChange={setConnCompany}
            strength={connStrength}
            onStrengthChange={setConnStrength}
            onAdd={addConnection}
            onRemove={removeConnection}
            onStrengthUpdate={updateConnectionStrength}
          />
        </Section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
          >
            Save Profile
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Saved! Head to your{" "}
              <a href="/feed" className="underline">feed</a>{" "}
              to see updated scores.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 text-sm mb-0.5">{title}</h2>
      {hint && <p className="text-xs text-gray-400 mb-3">{hint}</p>}
      {children}
    </div>
  );
}

function TagInput({
  tags,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
          >
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:opacity-60 transition-opacity">×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function ConnectionsInput({
  connections,
  companyValue,
  onCompanyChange,
  strength,
  onStrengthChange,
  onAdd,
  onRemove,
  onStrengthUpdate,
}: {
  connections: Connection[];
  companyValue: string;
  onCompanyChange: (v: string) => void;
  strength: ConnectionStrength;
  onStrengthChange: (s: ConnectionStrength) => void;
  onAdd: () => void;
  onRemove: (company: string) => void;
  onStrengthUpdate: (company: string, strength: ConnectionStrength) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Existing connections */}
      {connections.length > 0 && (
        <div className="space-y-2">
          {connections.map((conn) => (
            <div
              key={conn.company}
              className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="text-sm font-medium text-gray-800 flex-1">{conn.company}</span>

              {/* Strength selector on existing item */}
              <div className="flex items-center gap-1">
                {STRENGTHS.map((s) => {
                  const isActive = conn.strength === s;
                  const pts = CONNECTION_STRENGTH_POINTS[s];
                  return (
                    <button
                      key={s}
                      onClick={() => onStrengthUpdate(conn.company, s)}
                      title={`${CONNECTION_STRENGTH_LABELS[s]} (+${pts} pts)`}
                      className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                        isActive
                          ? CONNECTION_STRENGTH_COLORS[s] + " ring-1 ring-inset ring-current"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {CONNECTION_STRENGTH_LABELS[s]}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onRemove(conn.company)}
                className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new connection */}
      <div className="space-y-2">
        {/* Strength legend */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">How well do you know them?</span>
          <div className="flex gap-1.5">
            {STRENGTHS.map((s) => {
              const pts = CONNECTION_STRENGTH_POINTS[s];
              return (
                <button
                  key={s}
                  onClick={() => onStrengthChange(s)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                    strength === s
                      ? CONNECTION_STRENGTH_COLORS[s] + " border-current"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {CONNECTION_STRENGTH_LABELS[s]}
                  <span className="ml-1 opacity-60">+{pts}</span>
                </button>
              );
            })}
          </div>
        </div>
        <input
          type="text"
          placeholder="Company name and press Enter"
          value={companyValue}
          onChange={(e) => onCompanyChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
