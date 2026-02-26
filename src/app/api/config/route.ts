import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const config = await store.getConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const body = await request.json();
  const groupCount = Math.max(1, Math.min(20, Math.round(body.groupCount)));
  await store.setConfig({ groupCount });
  return NextResponse.json({ groupCount });
}

export async function DELETE() {
  await store.resetAll();
  return NextResponse.json({ ok: true });
}
