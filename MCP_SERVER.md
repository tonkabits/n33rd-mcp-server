# N33RD MCP Server - Complete Guide

## Table of Contents

1. [What is This?](#what-is-this)
2. [Quick Start](#quick-start)
3. [Available Tools](#available-tools)
4. [Audit & Compliance](#audit--compliance)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)
7. [Use Cases](#use-cases)

---

## What is This?

The **N33RD MCP Server** is an npm package that enables AI agents (like Claude) to programmatically manage your N33RD platform operations via the Model Context Protocol.

### Architecture

```
┌─────────────────────────────────────┐
│  User's Local Machine               │
│                                     │
│  ┌─────────────────┐                │
│  │ Claude Desktop  │                │
│  └────────┬────────┘                │
│           │ MCP Protocol (stdio)    │
│           ↓                         │
│  ┌─────────────────┐                │
│  │ n33rd-mcp-      │ ← Runs locally │
│  │ server process  │                │
│  └────────┬────────┘                │
└───────────┼─────────────────────────┘
            │ HTTPS/REST
            ↓
┌─────────────────────────────────────┐
│  Production               │
│  https://api.n33rd.com              │
│  (Your N33RD API)                   │
└─────────────────────────────────────┘
```

**Key Point**: This is a **client-side npm package**, not a server running on Production environment. It runs on the user's machine and talks to your existing N33RD API.

---

## Quick Start

### Installation

```bash
npm install -g @tonkabits/n33rd-mcp-server
```

### Configuration

Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "n33rd": {
      "command": "npx",
      "args": ["-y", "@tonkabits/n33rd-mcp-server"],
      "env": {
        "N33RD_API_KEY": "your_partner_api_key_here",
        "N33RD_ROLE": "partner"
      }
    }
  }
}
```

### Test

Restart Claude Desktop and ask:

> "List all my API services"

---

## Available Tools

### Supported Roles

**Partner Role** - 20 tools available
**Consumer Role** - 4 tools available

### Partner Role (20 tools)

#### Service Management (4 tools)
- `list_services` - List all configured services
- `create_service` - Add new upstream service
- `update_service` - Update service configuration
- `configure_service_auth` - Configure authentication (Bearer, Basic, API Key, OAuth2)

#### Consumer Management (7 tools)
- `list_consumers` - List all consumers
- `create_consumer` - Create consumer with API key
- `get_consumer` - Get consumer details and usage
- `rotate_consumer_key` - Rotate consumer's API key
- `revoke_consumer_key` - Permanently revoke key
- `reactivate_consumer_key` - Reactivate revoked key
- `toggle_consumer_key` - Enable/disable key temporarily

#### Plan Management (2 tools)
- `list_plans` - List pricing plans
- `create_plan` - Create new plan

#### Analytics (1 tool)
- `get_dashboard` - Partner dashboard with analytics

### Consumer Role (4 tools)
- `get_dashboard` - Consumer dashboard with usage
- `get_analytics` - Detailed usage analytics
- `rotate_my_key` - Rotate own API key
- `get_plan_info` - Current plan information

---

## Audit & Compliance

### Action Tracking

Every action performed via MCP is logged in the database for audit purposes.

**Logged Data:**
- Partner ID
- Action type (tool name)
- Resource type and ID
- Status (success/error/denied)
- Timestamp

**Sensitive Data Protection:**
API keys and credentials are redacted before logging.

### Partner Dashboard Visibility

Partners can view AI actions in Settings → MCP Server:

**Stats (Last 7 Days):**
- Total actions
- Successful actions
- Failed actions
- Denied actions

**Recent Actions Table:**
- Last 50 AI actions
- Status indicators
- Action type and resource
- Timestamp

### Visual Indicators

Dashboard pages show badges for action source:

- 🟣 **AI Agent** - Created/modified by AI via MCP
- 🔵 **Manual** - Created/modified by human via dashboard
- ⚪ **API** - Created/modified by direct API call

**Example (Consumer List):**
```
Email                Status    Created
test1@example.com    Active    🟣 AI Agent  | 2 days ago
test2@example.com    Active    🔵 Manual    | 1 week ago
```

---

## Configuration

### Environment Variables

```bash
# Required
N33RD_API_KEY=your_api_key_here
N33RD_ROLE=partner  # or consumer

# Optional
N33RD_URL=https://api.n33rd.com
```

### Partner MCP Configuration

Partners configure AI access via Settings → MCP Server:

**Master Toggle:**
```typescript
mcp_enabled: true | false
```

**Capability Categories:**
```typescript
{
  "service_management": {
    "enabled": true,
    "list_services": true,
    "create_service": true,
    "update_service": true,
    "configure_service_auth": true
  },
  "consumer_management": {
    "enabled": true,
    "list_consumers": true,
    "create_consumer": true,
    "rotate_consumer_key": true,
    // ... etc
  }
}
```

**Rate Limits:**
```typescript
rate_limit_per_minute: 30  // Default
rate_limit_per_hour: 500   // Default
```

**Notifications:**
```typescript
notify_on_mcp_action: false        // Email on every action
notify_on_key_rotation: true       // Email when AI rotates keys
notify_on_consumer_creation: true  // Email when AI creates consumers
```

**IP Whitelist (Optional):**
```typescript
allowed_ips: ['192.168.1.100']  // Restrict to specific IPs
// or
allowed_ips: null  // Allow all IPs (default)
```

### Example: Restrict AI to Read-Only

```typescript
{
  "service_management": {
    "enabled": true,
    "list_services": true,      // AI can view
    "create_service": false,    // AI cannot create
    "update_service": false     // AI cannot update
  },
  "consumer_management": {
    "enabled": true,
    "list_consumers": true,     // AI can view
    "create_consumer": false    // AI cannot create
  }
}
```

**Result**: AI can only view data, cannot modify anything.

---

## Troubleshooting

### "Tool not found" error

**Cause**: MCP server not loaded or configuration invalid

**Solution**:
1. Restart Claude Desktop completely
2. Verify config file has no syntax errors
3. Check that `n33rd-mcp-server` is installed: `npx @tonkabits/n33rd-mcp-server --version`

---

### "Authentication failed" error

**Cause**: Invalid API key or wrong role

**Solution**:
1. Verify API key is correct (no extra spaces)
2. Check role matches your key type:
   - Partner API keys → `N33RD_ROLE=partner`
   - Consumer API keys → `N33RD_ROLE=consumer`
3. Test key manually: `curl -H "x-api-key: YOUR_KEY" https://api.n33rd.com/partner/dashboard`

---

### "Permission denied" error

**Cause**: Capability disabled in partner MCP configuration

**Solution**:
1. Go to Settings → MCP Server in partner dashboard
2. Check if capability is enabled
3. Enable the capability

**Example**:
```
Error: Capability 'create_consumer' is not enabled for this partner

Fix: Settings → MCP Server → Consumer Management → create_consumer → Enable
```

---

### "Rate limit exceeded" error

**Cause**: Too many requests in short time

**Solution**:
1. Wait 1 minute for per-minute limit to reset
2. Wait 1 hour for per-hour limit to reset
3. Or increase rate limits in Settings → MCP Server

**Default Limits**:
- 30 actions/minute
- 500 actions/hour

---

### "Command not found: npx" error

**Cause**: Node.js not installed

**Solution**:
1. Install Node.js from https://nodejs.org
2. Restart terminal/Claude Desktop
3. Verify: `node --version` and `npx --version`

---

## Use Cases

### 1. AI Agent as Consumer

**Scenario**: ChatGPT needs access to your Books API

1. Partner creates landing page with auto-approval
2. ChatGPT uses MCP to call `create_consumer`
3. Receives API key automatically
4. Makes requests: `https://api.n33rd.com/p/partner/books/search`
5. All requests metered and billed

**Impact**: AI agents can self-service API access.

---

### 2. AI-Powered Consumer Management

**Scenario**: Partner has 1,000 consumers to manage

**Before**: Manual key rotation, manual usage monitoring
**After**: AI monitors 24/7, rotates keys automatically, sends alerts

**Example**:
```
User: "Which consumers are close to their rate limits?"

AI: [Uses list_consumers + get_consumer]
"5 consumers are at >80% usage:
- john@example.com: 9,800/10,000 (98%)
- sarah@company.com: 8,500/10,000 (85%)
..."

User: "Send them upgrade offers"

AI: [Drafts personalized emails, suggests tier upgrades]
```

---

### 3. Bulk Operations

**Scenario**: Create 50 test API keys for QA team

**Manual**: 50 clicks in dashboard (10+ minutes)
**With AI**: "Create 50 test keys for qa1@test.com through qa50@test.com"

AI executes in ~1 minute, returns all 50 keys.

---

### 4. Security Response

**Scenario**: Partner suspects compromised consumer account

**Command**:
```
User: "Check usage for consumer test@example.com and rotate their key if suspicious"

AI:
1. [Uses get_consumer] - Checks usage pattern
2. Detects: 10,000 requests in 1 hour (unusual spike)
3. [Uses rotate_consumer_key] - Rotates key immediately
4. Emails new key to consumer
5. Logs incident in audit trail
```

**Time**: <30 seconds vs. manual investigation (minutes)

---

### 5. AI-to-AI Marketplace

**Scenario**: Multiple AI agents coordinate API access

- Agent A (partner) exposes Weather API
- Agent B (consumer) needs weather data
- Agent B requests access via MCP
- Agent A approves and creates key automatically
- Both agents coordinate billing without humans

**Impact**: Fully automated AI-to-AI API economy.

---

## Related Documentation

- [README.md](./README.md) - Installation and quick start
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup guide
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Implementation details
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures
- [examples/EXAMPLE_CONVERSATIONS.md](./examples/EXAMPLE_CONVERSATIONS.md) - Real conversation examples

---

## Support

**Issues**: https://github.com/tonkabits/n33rd-mcp-server/issues
**Documentation**: https://api.n33rd.com/docs
**Platform**: https://n33rd.com

---

**Last Updated**: September 14, 2026
**Version**: 0.1.0
**License**: MIT
