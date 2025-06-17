#!/usr/bin/env node

import { spawn } from "child_process";
import { setTimeout } from "timers/promises";

console.log("Testing Wolfram Alpha MCP Server...\n");

// Set a dummy App ID for testing basic functionality
process.env.WOLFRAM_ALPHA_APP_ID = "TEST_APP_ID";

// Start the server
const server = spawn("node", ["build/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
});

let serverOutput = "";
let serverError = "";

server.stdout.on("data", (data) => {
  serverOutput += data.toString();
});

server.stderr.on("data", (data) => {
  serverError += data.toString();
});

// Send initialization request
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0",
    },
  },
};

// Send list tools request
const listToolsRequest = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/list",
};

// Send requests to server
server.stdin.write(JSON.stringify(initRequest) + "\n");
await setTimeout(100);
server.stdin.write(JSON.stringify(listToolsRequest) + "\n");
await setTimeout(100);

// Close server
server.kill("SIGTERM");

// Wait for server to close
await setTimeout(500);

console.log("Server stderr output:");
console.log(serverError || "No stderr output");

console.log("\nServer stdout output:");
console.log(serverOutput || "No stdout output");

if (serverError.includes("Wolfram Alpha MCP server running on stdio")) {
  console.log("\n✅ Test passed: Server started successfully");
} else {
  console.log("\n❌ Test failed: Server did not start properly");
}

console.log("\n📝 Server is ready for deployment to Smithery!");
console.log(
  "🔧 Remember to set your WOLFRAM_ALPHA_APP_ID environment variable"
);
