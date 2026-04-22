"use client";

import { useState, useRef } from "react";
import { saveResume, clearResume, type ResumeData } from "@/lib/resume-store";

interface Props {
  current: ResumeData | null;
  onUploaded: (data: ResumeData) => void;
  onCleared: () => void;
}

export default function ResumeUpload({ current, onUploaded, onCleared }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to parse resume.");
        return;
      }

      const data: ResumeData = {
        text: json.text,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      };
      saveResume(data);
      onUploaded(data);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    clearResume();
    onCleared();
  }

  if (current) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-green-600">📄</span>
          <div>
            <p className="text-sm font-medium text-green-800">{current.fileName}</p>
            <p className="text-xs text-green-600">
              Uploaded {new Date(current.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <p className="text-2xl mb-2">📄</p>
        {loading ? (
          <p className="text-sm text-gray-500">Parsing your resume...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              Drop your resume here or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF only</p>
          </>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
