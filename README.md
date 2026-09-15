# N33RD MCP Server

Model Context Protocol server for the [N33RD platform](https://n33rd.com). Enables AI agents to programmatically manage API services, consumers, and keys.

## What is This?

This MCP server exposes N33RD platform operations to AI assistants like Claude, allowing them to:

- **As Partner**: Manage upstream services, create/manage consumers, configure authentication, handle API keys
- **As Consumer**: View usage analytics, rotate own API key, check plan limits

**NOT Supported** (Manual-Only for Security):
- **Stripe Operations**: All Stripe credential and billing operations must be manual

**📚 Complete Documentation**: See [MCP_SERVER.md](./MCP_SERVER.md) for comprehensive guide including security, permissions, Stripe operations, audit/compliance, and troubleshooting.

## Installation

```bash
npm install -g @tonkabits/n33rd-mcp-server
```

Or use directly with npx:

```bash
npx @tonkabits/n33rd-mcp-server
```

## Configuration

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "n33rd-partner": {
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

### Claude Code (CLI)

Add to your project's `.claude/settings.json`:

```json
{
  "mcpServers": {
    "n33rd": {
      "command": "npx",
      "args": ["-y", "@tonkabits/n33rd-mcp-server"],
      "env": {
        "N33RD_API_KEY": "your_api_key_here",
        "N33RD_ROLE": "partner"
      }
    }
  }
}
```

### Environment Variables

- `N33RD_API_KEY` (required) - Your N33RD API key
- `N33RD_ROLE` (required) - Role: `partner` or `consumer`
- `N33RD_URL` (optional) - API base URL (default: `https://api.n33rd.com`)

## Available Tools

### Partner Role

**Service Management:**
- `list_services` - List all configured services
- `create_service` - Add new upstream service
- `update_service` - Update service configuration
- `configure_service_auth` - Configure authentication (Bearer, Basic, API Key, OAuth2)

**Consumer Management:**
- `list_consumers` - List all consumers
- `create_consumer` - Create consumer with API key
- `get_consumer` - Get consumer details and usage
- `rotate_consumer_key` - Rotate consumer's API key
- `revoke_consumer_key` - Permanently revoke key
- `reactivate_consumer_key` - Reactivate revoked key
- `toggle_consumer_key` - Temporarily enable/disable key

**Plan Management:**
- `list_plans` - List pricing plans
- `create_plan` - Create new plan

**Analytics:**
- `get_dashboard` - Partner dashboard with analytics

### Consumer Role

- `get_dashboard` - Consumer dashboard with usage
- `get_analytics` - Detailed usage analytics
- `rotate_my_key` - Rotate own API key
- `get_plan_info` - Current plan information

## Usage Examples

### With Claude Desktop

Once configured, you can ask Claude:

> "List all my API services"

> "Create a new consumer with email john@example.com on the trial plan"

> "Show me the usage for consumer ID abc-123"

> "Rotate the API key for consumer xyz-789"

> "Configure Bearer token authentication for service srv_abc with token sk_live_..."

### With Claude Code

```bash
cd /path/to/your/project
claude
```

Then in the CLI:

> "List all my consumers and their usage"

> "Create a new service called 'Books API' with base URL https://api.books.com"

> "Show me which consumers are close to their rate limits"

## Use Cases

### AI Agent as Consumer

An AI agent can register itself as a consumer and access your API:

1. Partner creates landing page with auto-approval
2. AI agent calls `create_consumer` (or signs up via landing page)
3. Agent receives API key automatically
4. Agent makes requests through N33RD proxy
5. All requests are metered and billed

**Example:**
```
User: "I need to access the Books API"
AI: [Uses create_consumer tool]
AI: "I've registered for access. Here's my API key: books_api_live_abc123..."
AI: [Makes requests through https://api.n33rd.com/p/yourname/books/search?q=science]
```

### AI Agent as Partner

An AI agent can manage an entire API service:

1. Partner gives AI agent their API key
2. AI configures upstream services
3. AI creates/manages consumer keys
4. AI monitors usage and rotates keys
5. AI responds to usage alerts

**Example:**
```
User: "Create 5 test API keys for our QA team"
AI: [Uses create_consumer tool 5 times]
AI: "Created 5 keys. Here are the credentials..."

User: "Rotate all keys that haven't been used in 30 days"
AI: [Checks usage via get_consumer, rotates stale keys]
AI: "Rotated 3 inactive keys and sent emails with new credentials"
```

## Security

- **API keys are not stored** - Only passed via environment variables
- **Encrypted in transit** - All requests use HTTPS
- **Role-based access** - Tools filtered by role (partner/consumer)
- **Same authentication as platform** - Uses existing N33RD auth

## Development

```bash
# Clone repository
git clone https://github.com/tonkabits/n33rd-mcp-server.git
cd n33rd-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
export N33RD_API_KEY=your_key
export N33RD_ROLE=partner
npm run dev
```

## Testing

Test the MCP server with the MCP Inspector:

```bash
npm install -g @modelcontextprotocol/inspector
mcp-inspector npx @tonkabits/n33rd-mcp-server
```

## Contributing

Contributions welcome! Please open an issue or PR on [GitHub](https://github.com/tonkabits/n33rd-mcp-server).

## License

MIT

## Links

- **N33RD Platform**: https://n33rd.com
- **API Documentation**: https://api.n33rd.com/docs
- **Model Context Protocol**: https://modelcontextprotocol.io
- **GitHub**: https://github.com/tonkabits/n33rd-mcp-server
