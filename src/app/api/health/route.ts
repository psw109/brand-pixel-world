import { NextResponse } from "next/server";
import { getPublicEnvStatus } from "@/lib/env";

export async function GET() {
  const env = getPublicEnvStatus();

  return NextResponse.json({
    ok: true,
    service: "brand-pixel-world",
    env,
  });
}
