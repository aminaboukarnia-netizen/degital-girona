import { NextResponse } from "next/server";
import { PROJECT } from "@/lib/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// This endpoint tests the app, not external providers or Turso.
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "nashrclip-ai",
    version: PROJECT.version,
    phase: "phase-1-starter",
    mcp_endpoint: "/mcp",
    mcp_tools: ["project_status", "workflow_preview"],
    integration_status: {
      turso: "not_configured",
      kie: "not_configured",
      video_merger: "not_configured",
      social_publishing: "disabled",
    },
    note: "A healthy response means the starter web app is alive. It does not mean video generation or publishing works."
  }, { headers: { "Cache-Control": "no-store" } });
}
