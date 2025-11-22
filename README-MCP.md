# Project 89 Terminus - MCP Interface

This directory contains a **Model Context Protocol (MCP)** server that allows external AI agents (like Claude Desktop, IDE assistants, or other LLMs) to play the Project 89 text adventure directly.

## Prerequisites

1.  **Run the Game Server:**
    The Terminus API must be running locally for the MCP server to connect to it.
    ```bash
    npm run dev
    # Runs on http://localhost:8889 by default
    ```

2.  **Install Dependencies:**
    Ensure you have installed the project dependencies:
    ```bash
    pnpm install
    ```

## How to Use (Claude Desktop)

To let Claude play the game, add this configuration to your Claude Desktop config file:

**MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the following entry under `mcpServers`:

```json
{
  "mcpServers": {
    "project89": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/ABSOLUTE/PATH/TO/YOUR/project89/terminus/scripts/mcp-server.ts"
      ],
      "env": {
        "P89_API_URL": "http://localhost:8889",
        "P89_HANDLE": "operator_7"
      }
    }
  }
}
```

*Replace `/ABSOLUTE/PATH/TO/YOUR/...` with the actual full path to this repository.*

## Tools Provided

Once connected, the AI will have access to these tools:

*   `p89_start_game`: Initializes the session and resets the terminal.
*   `p89_action(command)`: Types a command into the terminal (e.g., "look", "go north", "!mission") and returns the narrative response.
*   `p89_status`: Checks current session metadata.

## Example Prompt for the AI

Once configured, you can tell Claude:

> "Connect to Project 89. Start a new game and play through the intro. Tell me what you see."

## Architecture

`AI Client` <-> `MCP Server (scripts/mcp-server.ts)` <-> `Next.js API (localhost:8889)`
