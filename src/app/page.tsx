"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AppState } from "@/lib/types";
import NovacareLogoSvg from "./components/NovacareLogoSvg";

export default function MainDisplay() {
  const [state, setState] = useState<AppState | null>(null);
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join`);

    const fetchState = async () => {
      try {
        const res = await fetch("/api/state");
        const data = await res.json();
        setState(data);
      } catch {
        // Retry on next interval
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-xl">Laster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <NovacareLogoSvg className="h-[60px] lg:h-20" />
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-500">Skann for å bli med</p>
            <p className="text-lg font-semibold text-teal">
              {state.totalParticipants} påmeldt
            </p>
          </div>
          {joinUrl && (
            <a
              href={joinUrl}
              className="block bg-white p-3 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <QRCodeSVG
                value={joinUrl}
                size={200}
                fgColor="#1a1a1a"
                level="M"
              />
            </a>
          )}
        </div>
      </div>

      {/* Groups grid */}
      {state.groups.length === 0 ? (
        <div className="text-center text-gray-400 mt-20 text-xl">
          Gå til <span className="font-mono text-teal">/admin</span> for å
          sette opp grupper
        </div>
      ) : (
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
                      className="flex items-baseline justify-between gap-2"
                    >
                      <span className="font-medium text-gray-800">
                        {member.name}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                        til {member.stayUntilFormatted}
                      </span>
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
