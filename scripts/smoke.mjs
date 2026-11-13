// Usage: npm run smoke -- https://your-deployment.example
const base = process.argv[2]?.replace(/\/$/, "");
if (!base || !/^https?:\/\//.test(base)) {
  console.error("Usage: npm run smoke -- https://your-deployed-domain");
  process.exit(2);
}
const response = await fetch(`${base}/api/health`, { cache: "no-store" });
const body = await response.json().catch(() => null);
console.log("Health HTTP:", response.status);
console.log(JSON.stringify(body, null, 2));
if (!response.ok || !body?.ok || body?.phase !== "phase-1-starter") process.exit(1);
console.log("Health smoke test PASSED. MCP protocol and provider APIs are NOT tested by this script.");
