"use client";

import { useEffect, useState, useCallback } from "react";

const MIN_TIME = 990; // 16:30
const MAX_TIME = 1260; // 21:00
const STEP = 30;
const COOKIE_NAME = "groupbystay_pid";

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export default function JoinPage() {
  const [name, setName] = useState("");
  const [stayUntil, setStayUntil] = useState(1140); // 19:00 default
  const [existingId, setExistingId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "left" | "error"
  >("loading");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const checkExisting = useCallback(async () => {
    const pid = getCookie(COOKIE_NAME);
    if (!pid) {
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch(`/api/participants?id=${pid}`);
      if (res.ok) {
        const data = await res.json();
        setExistingId(data.id);
        setName(data.name);
        setStayUntil(data.stayUntil);
      }
    } catch {
      // Cookie exists but participant not found, ignore
    }
    setStatus("idle");
  }, []);

  useEffect(() => {
    checkExisting();
  }, [checkExisting]);

  const handleJoin = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existingId || undefined,
          name: name.trim(),
          stayUntil,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "Noe gikk galt");
        setStatus("error");
        return;
      }

      const data = await res.json();
      setCookie(COOKIE_NAME, data.id, 1);
      setExistingId(data.id);
      setStatus("success");
    } catch {
      setErrorMessage("Kunne ikke koble til serveren");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (!existingId) return;
    setSubmitting(true);

    try {
      await fetch("/api/participants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: existingId }),
      });
      deleteCookie(COOKIE_NAME);
      setExistingId(null);
      setName("");
      setStayUntil(1140);
      setStatus("left");
    } catch {
      setErrorMessage("Kunne ikke koble til serveren");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Laster...</div>
      </div>
    );
  }

  if (status === "left") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Du er avmeldt
          </h1>
          <p className="text-gray-500 mb-6">Synd du ikke kan bli med!</p>
          <button
            onClick={() => setStatus("idle")}
            className="text-teal font-medium hover:underline"
          >
            Meld deg på igjen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {existingId ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Hei, {name}!
              </h1>
              <p className="text-gray-500 mt-1">Oppdater påmeldingen din</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Bli med!</h1>
              <p className="text-gray-500 mt-1">
                Meld deg på arrangementet
              </p>
            </>
          )}
        </div>

        {status === "success" && (
          <div className="mb-6 p-4 bg-teal-light rounded-xl text-teal-dark font-medium">
            {existingId ? "Påmeldingen er oppdatert!" : "Du er påmeldt!"}
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-600 font-medium">
            {errorMessage}
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
          {/* Name input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ditt navn
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Skriv inn navnet ditt"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              maxLength={50}
            />
          </div>

          {/* Time slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hvor lenge blir du?
            </label>
            <div className="px-1">
              <input
                type="range"
                min={MIN_TIME}
                max={MAX_TIME}
                step={STEP}
                value={stayUntil}
                onChange={(e) => setStayUntil(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>16:30</span>
                <span>18:00</span>
                <span>19:30</span>
                <span>21:00</span>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-3xl font-bold text-teal">
                {formatTime(stayUntil)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleJoin}
            disabled={!name.trim() || submitting}
            className="w-full py-3.5 rounded-xl bg-teal text-white font-semibold text-lg hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {existingId ? "Oppdater" : "Bli med!"}
          </button>

          {existingId && (
            <button
              onClick={handleLeave}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Meld deg av
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
