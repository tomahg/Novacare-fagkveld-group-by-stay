"use client";

import { useEffect, useState, useCallback } from "react";
import { AppState } from "@/lib/types";

export default function AdminPage() {
  const [groupCount, setGroupCount] = useState(4);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      const data = await res.json();
      setState(data);
      setGroupCount(data.config.groupCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleSave = async () => {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupCount }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    fetchState();
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Er du sikker? Dette sletter alle påmeldinger og nullstiller gruppene."
      )
    ) {
      return;
    }
    await fetch("/api/config", { method: "DELETE" });
    setGroupCount(4);
    fetchState();
  };

  const handleRemoveParticipant = async (id: string, name: string) => {
    if (!confirm(`Fjerne ${name} fra påmeldingen?`)) return;
    await fetch("/api/participants", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchState();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Laster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-500 mt-1">
          Konfigurer grupper for arrangementet
        </p>
      </div>

      {/* Config panel */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 max-w-md">
        <div className="flex items-center gap-6 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Antall grupper
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGroupCount((c) => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-bold text-teal w-10 text-center">
              {groupCount}
            </span>
            <button
              onClick={() => setGroupCount((c) => Math.min(20, c + 1))}
              className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-teal text-white font-semibold hover:bg-teal-dark active:scale-[0.98] transition-all"
          >
            {saved ? "Lagret!" : "Lagre"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Påmeldte:{" "}
            <span className="font-semibold text-gray-800">
              {state?.totalParticipants ?? 0}
            </span>
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-1.5 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Nullstill alt
          </button>
        </div>
      </div>

      {/* Groups grid */}
      {state && state.groups.length > 0 && (
        <div
          className="grid gap-4 lg:gap-6"
          style={{
            gridTemplateColumns: `repeat(${Math.min(state.groups.length, 6)}, minmax(180px, 1fr))`,
          }}
        >
          {state.groups.map((group) => (
            <div
              key={group.name}
              className="bg-gray-50 rounded-2xl p-5 border border-gray-100"
            >
              <h2 className="text-lg font-bold text-teal mb-4 pb-2 border-b border-gray-200">
                {group.name}
              </h2>
              {group.members.length === 0 ? (
                <p className="text-gray-300 text-sm italic">Ingen ennå</p>
              ) : (
                <ul className="space-y-2">
                  {group.members.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="font-medium text-gray-800">
                          {member.name}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                          til {member.stayUntilFormatted}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveParticipant(member.id, member.name)
                        }
                        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title={`Fjern ${member.name}`}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
