#!/usr/bin/env node
// Stdio MCP server that forwards every JSON-RPC message to the Subclip desktop app's local MCP server
// (Streamable HTTP on 127.0.0.1). Use it from clients that only start local stdio servers, such as Claude Desktop.
//
//   SUBCLIP_MCP_TOKEN  required. Copy it from Subclip > Desktop settings > Local MCP.
//   SUBCLIP_MCP_URL    optional. Defaults to http://127.0.0.1:43119/mcp. Copy it from the same screen if the port changed.
//
// The Subclip app must be running. Nothing leaves your computer: the bridge only talks to 127.0.0.1.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const DEFAULT_URL = 'http://127.0.0.1:43119/mcp';
const url = new URL(process.env.SUBCLIP_MCP_URL || DEFAULT_URL);
const token = process.env.SUBCLIP_MCP_TOKEN || '';
const log = (message) => process.stderr.write(`[subclip-mcp] ${message}\n`);

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Usage: SUBCLIP_MCP_TOKEN=<token> [SUBCLIP_MCP_URL=<url>] npx -y @subclip/mcp');
  log('Copy the URL and token from Subclip > Desktop settings > Local MCP. The Subclip app must be running.');
  process.exit(0);
}
if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(url.hostname)) {
  log(`Refusing ${url.href}: the bridge only connects to the Subclip app on this computer.`);
  process.exit(2);
}
if (!token) log('SUBCLIP_MCP_TOKEN is not set. Copy the token from Subclip > Desktop settings > Local MCP.');

const upstream = new StreamableHTTPClientTransport(url, {
  requestInit: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
});
const local = new StdioServerTransport();

let closing = false;
const shutdown = async (code = 0) => {
  if (closing) return;
  closing = true;
  await Promise.allSettled([upstream.close(), local.close()]);
  process.exit(code);
};

local.onmessage = (message) => {
  upstream.send(message).catch((error) => {
    const reason = error instanceof Error ? error.message : String(error);
    log(`Could not reach Subclip at ${url.href}: ${reason}. Is the app open with Local MCP on?`);
    // Answer requests with a JSON-RPC error so the client does not hang.
    if (message && typeof message === 'object' && 'id' in message && 'method' in message) {
      void local.send({ jsonrpc: '2.0', id: message.id, error: { code: -32000, message: `Subclip is not reachable at ${url.href}. Open the Subclip app and check Desktop settings > Local MCP.` } });
    }
  });
};
upstream.onmessage = (message) => { void local.send(message); };
upstream.onerror = (error) => log(`upstream: ${error instanceof Error ? error.message : String(error)}`);
local.onerror = (error) => log(`stdio: ${error instanceof Error ? error.message : String(error)}`);
local.onclose = () => { void shutdown(0); };
upstream.onclose = () => { if (!closing) log('Subclip closed the connection.'); };

// Stdin closing means the client is gone; flush pending replies briefly, then exit.
process.stdin.on('end', () => setTimeout(() => void shutdown(0), 1500));
process.on('SIGINT', () => void shutdown(0));
process.on('SIGTERM', () => void shutdown(0));

await upstream.start();
await local.start();
