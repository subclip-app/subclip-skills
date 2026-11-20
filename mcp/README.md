# @subclip/mcp

A stdio MCP server for the [Subclip](https://www.subclip.app) desktop app. It connects any MCP client to the
Subclip screen recorder, AI video editor, export queue, publishing and screenshot tools running on your computer.

Subclip already serves MCP over Streamable HTTP on `127.0.0.1`. Use this package with clients that only start
local stdio servers (such as Claude Desktop), or whenever a command is easier to configure than a URL.

## Setup

1. Install and open [Subclip](https://www.subclip.app/download) (Mac, Windows or Linux).
2. Open **Desktop settings > Local MCP** and copy the token (and the URL if it is not the default).
3. Add the server to your client:

```json
{
  "mcpServers": {
    "subclip": {
      "command": "npx",
      "args": ["-y", "@subclip/mcp"],
      "env": { "SUBCLIP_MCP_TOKEN": "YOUR_TOKEN" }
    }
  }
}
```

| Variable | Required | Default |
| --- | --- | --- |
| `SUBCLIP_MCP_TOKEN` | yes | none, copy it from Desktop settings > Local MCP |
| `SUBCLIP_MCP_URL` | no | `http://127.0.0.1:43119/mcp` |

Keep Subclip open while your agent works. The bridge only connects to `127.0.0.1`, so nothing leaves your computer.
Editing, recording, screenshots and export work offline; AI generation, stock media search and publishing need a
connection.

Teach your agent the workflows with the agent skills: `npx @subclip/skills install`.
Setup guides per client: https://www.subclip.app/products/mcp-server
