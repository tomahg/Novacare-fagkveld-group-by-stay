import { Participant } from "./types";

/**
 * Assigns participants to groups using round-robin on sorted departure times.
 *
 * 1. Sort all participants by departure time (earliest first)
 * 2. Assign participant i to group (i % groupCount)
 *
 * This spreads people with the same departure time across different groups,
 * ensuring no single group empties out early.
 *
 * Example with 4 groups and 7 people:
 *   Sorted: A(16:30), B(16:30), C(19:30), D(20:30), E(21:00), F(21:00), G(21:00)
 *   G1←A(16:30), G2←B(16:30), G3←C(19:30), G4←D(20:30),
 *   G1←E(21:00), G2←F(21:00), G3←G(21:00)
 *
 *   Result: Each group with an early leaver also gets a late stayer.
 */
export function assignGroups(
  participants: Participant[],
  groupCount: number
): Participant[][] {
  if (groupCount <= 0) return [];

  const groups: Participant[][] = Array.from({ length: groupCount }, () => []);

  if (participants.length === 0) return groups;

  const sorted = [...participants].sort(
    (a, b) => b.stayUntil - a.stayUntil || a.joinedAt - b.joinedAt
  );

  for (let i = 0; i < sorted.length; i++) {
    groups[i % groupCount].push(sorted[i]);
  }

  return groups;
}

export function formatTime(minutesFromMidnight: number): string {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
