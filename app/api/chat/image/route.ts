import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Image generation is temporarily unavailable." },
    { status: 503 }
  );
}
