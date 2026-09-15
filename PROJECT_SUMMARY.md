# N33RD MCP Server - Project Summary

## What We Built

An **MCP (Model Context Protocol) server** that exposes the entire N33RD platform API to AI agents, enabling programmatic management of services, consumers, and API keys.

## Why This Matters

### Traditional Approach
- Partners manually manage services via web dashboard
- Consumers manually check usage and rotate keys
- Admins manually investigate issues and manage tiers
- No automation, lots of repetitive tasks

### With MCP Server
- **AI agents act as partners**: Create services, manage consumers, rotate keys automatically
- **AI agents act as consumers**: Self-service key rotation, usage optimization, cost analysis
- **AI agents act as admins**: Platform monitoring, health checks, automated tier management
- **AI-to-AI workflows**: One AI agent creates consumer accounts for other AI agents

## Architecture

```
┌─────────────────┐
│   AI Agent      │  (Claude, GPT, etc.)
│  via MCP Client │
└────────┬────────┘
         │ MCP Protocol (stdio)
         ↓
┌──────────────────────────┐
│  N33RD MCP Server      │
│  (@n33rd/n33rd-mcp-    │
│   server package)        │
└────────┬─────────────────┘
         │ HTTPS REST
         ↓
┌──────────────────────────┐
│  N33RD Platform API    │
│  (https://api.n33rd.com) │
└──────────────────────────┘
```

## Key Features

### 🔑 Role-Based Access (3 Roles)

**Partner Role** (20 tools):
- Manage services (create, update, configure auth)
- Manage consumers (create, revoke, rotate keys)
- Manage plans (create, update pricing)
- View analytics and dashboard

**Consumer Role** (4 tools):
- View usage and analytics
- Rotate own API key
- Check plan limits
- Monitor costs

### 🛠️ Available Operations

**Service Management:**
- `list_services`, `create_service`, `update_service`
- `configure_service_auth` (Bearer, Basic, API Key, OAuth2)

**Consumer Management:**
- `list_consumers`, `create_consumer`, `get_consumer`
- `rotate_consumer_key`, `revoke_consumer_key`, `reactivate_consumer_key`
- `toggle_consumer_key` (enable/disable)

**Plan Management:**
- `list_plans`, `create_plan`

**Analytics:**
- `get_dashboard` (partner/consumer specific)
- `get_analytics` (detailed usage)

## Real-World Use Cases

### 1. AI Agent as Consumer
**Scenario**: ChatGPT needs access to a Books API

1. Partner creates landing page with auto-approval
2. ChatGPT uses MCP to call `create_consumer`
3. Receives API key automatically
4. Makes requests through N33RD proxy: `https://api.n33rd.com/p/partner/books/search`
5. All requests metered and billed to ChatGPT's account

**Impact**: AI agents can programmatically access APIs without human intervention

### 2. AI Agent as Partner Manager
**Scenario**: Partner has 1,000 consumers to manage

**Before**: Manual key rotation, manual usage monitoring, manual tier upgrades
**After**: AI agent monitors usage 24/7, rotates keys automatically, sends alerts, handles upgrades

**Impact**: Zero-touch consumer management at scale

### 3. AI-to-AI Marketplace
**Scenario**: Multiple AI agents need coordinated API access

- Agent A (data provider) exposes API via N33RD
- Agent B (consumer) requests access via MCP
- Agent A approves and creates key automatically
- Agent B makes requests, Agent A monitors usage
- Agent A rotates keys periodically for security
- Both agents coordinate billing without human intervention

**Impact**: Fully automated AI-to-AI API marketplace

### 4. Platform Admin Automation
**Scenario**: Admin managing 50+ partners

**Automated tasks**:
- Monitor platform health every hour
- Upgrade partners automatically when they hit tier limits
- Investigate abuse patterns and revoke bad actors
- Generate weekly executive reports
- Alert on system issues (cron failures, service outages)

**Impact**: Platform runs itself, admin only handles exceptions

## Technical Implementation

### Built With
- **TypeScript** - Type-safe implementation
- **@modelcontextprotocol/sdk** - Official MCP SDK
- **Node.js** - Runtime environment
- **stdio transport** - Communication protocol

### Security
- Environment variable-based authentication
- No API keys stored in code
- Role-based access control
- Same auth as platform (SHA-256 hashed keys, encrypted Stripe credentials)

### Installation
```bash
npm install -g @tonkabits/n33rd-mcp-server
```

### Configuration (Claude Desktop)
```json
{
  "mcpServers": {
    "n33rd": {
      "command": "npx",
      "args": ["-y", "@tonkabits/n33rd-mcp-server"],
      "env": {
        "N33RD_API_KEY": "your_key_here",
        "N33RD_ROLE": "partner"
      }
    }
  }
}
```

## Project Structure

```
n33rd-mcp-server/
├── src/
│   └── index.ts              # Main MCP server implementation
├── examples/
│   ├── claude-desktop-config.json
│   └── EXAMPLE_CONVERSATIONS.md
├── package.json
├── tsconfig.json
├── README.md                 # Full documentation
├── QUICKSTART.md            # 5-minute setup guide
└── PROJECT_SUMMARY.md       # This file
```

## Getting Started

1. **Read**: [QUICKSTART.md](QUICKSTART.md) - 5-minute setup
2. **Install**: `npm install -g @tonkabits/n33rd-mcp-server`
3. **Configure**: Add to Claude Desktop config
4. **Try**: "List all my API services"

## Links

- **GitHub**: (to be created)
- **npm**: (to be published)
- **N33RD**: https://n33rd.com
- **API Docs**: https://api.n33rd.com/docs
- **MCP Spec**: https://modelcontextprotocol.io

## Questions?

Open an issue on GitHub or contact us at [email].

---

**Built with ❤️ for the AI-native API economy**
