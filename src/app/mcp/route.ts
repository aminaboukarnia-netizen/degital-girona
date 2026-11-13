import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { PROJECT } from "@/lib/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Phase 1 intentionally offers read-only tools. No external calls or secrets.
// Do not add generation, payment or publishing tools until proper OAuth
// authorization and an explicit approval gate are implemented and tested.
const handler = createMcpHandler((server) => {
  server.registerTool(
    "project_status",
    {
      title: "Project status",
      description: "Read-only: show which NashrClip AI features are ready or pending.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify({ name: PROJECT.name, version: PROJECT.version, phase: PROJECT.phase, features: PROJECT.checks }, null, 2) }],
    }),
  );
  server.registerTool(
    "workflow_preview",
    {
      title: "Workflow preview",
      description: "Read-only: describe the intended steps from video idea to user-approved publication. Does not execute any actions.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: "text", text: "المخطط المستقبلي فقط — دون أي توليد أو نشر فعلي:\n" + PROJECT.process.map((step, index) => `${index + 1}. ${step}`).join("\n") }],
    }),
  );
}, { serverInfo: { name: "nashrclip-ai-starter", version: "0.1.0" } });

export { handler as GET, handler as POST };
