import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { assignGroups, formatTime } from "@/lib/algorithm";
import { AppState } from "@/lib/types";

export async function GET() {
  const [config, participantsMap] = await Promise.all([
    store.getConfig(),
    store.getParticipants(),
  ]);

  const participants = Object.values(participantsMap);
  const grouped = assignGroups(participants, config.groupCount);

  const state: AppState = {
    config,
    totalParticipants: participants.length,
    groups: grouped.map((members, i) => ({
      name: `Gruppe ${i + 1}`,
      members: members
        .map((p) => ({
          id: p.id,
          name: p.name,
          stayUntil: p.stayUntil,
          stayUntilFormatted: formatTime(p.stayUntil),
        }))
        .sort((a, b) => b.stayUntil - a.stayUntil),
    })),
  };

  return NextResponse.json(state);
}
