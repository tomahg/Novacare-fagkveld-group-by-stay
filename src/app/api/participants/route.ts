import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { Participant } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const participant = await store.getParticipant(id);
    if (!participant) {
      return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
    }
    return NextResponse.json(participant);
  }

  const participants = await store.getParticipants();
  return NextResponse.json(participants);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "Navn er påkrevd" },
      { status: 400 }
    );
  }

  const participant: Participant = {
    id: body.id || crypto.randomUUID(),
    name: body.name.trim(),
    stayUntil: body.stayUntil,
    joinedAt: Date.now(),
  };

  // If updating an existing participant
  if (body.id) {
    const existing = await store.getParticipant(body.id);
    if (existing) {
      participant.joinedAt = existing.joinedAt;
      await store.updateParticipant(participant);
      return NextResponse.json(participant);
    }
  }

  // New participant
  await store.addParticipant(participant);

  return NextResponse.json(participant, { status: 201 });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "ID er påkrevd" }, { status: 400 });
  }
  await store.removeParticipant(body.id);
  return NextResponse.json({ ok: true });
}
