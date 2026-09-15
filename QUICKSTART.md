# Quick Start Guide

Get started with N33RD MCP server in 5 minutes.

## Step 1: Get Your API Key

### For Partners
1. Sign up at https://n33rd.com/signup
2. Complete onboarding
3. Go to Settings → Keys
4. Copy your partner API key

### For Consumers
1. Sign up via a partner's landing page (e.g., https://n33rd.com/p/partnername)
2. Receive API key via email
3. Or view in dashboard after signup

## Step 2: Configure Claude Desktop

**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "n33rd": {
      "command": "npx",
      "args": ["-y", "@tonkabits/n33rd-mcp-server"],
      "env": {
        "N33RD_API_KEY": "paste_your_key_here",
        "N33RD_ROLE": "partner"
      }
    }
  }
}
```

**Important**: Replace `paste_your_key_here` with your actual API key.

## Step 3: Restart Claude Desktop

Quit Claude Desktop completely and reopen it.

## Step 4: Test It

Open a new conversation and try:

### Partners
- "List all my API services"
- "Show me my consumer dashboard"
- "How many consumers do I have?"

### Consumers
- "Show my API usage this month"
- "What's my current plan?"
- "How many requests do I have left?"

## Common Issues

### "Tool not found" error
- Restart Claude Desktop completely
- Verify config file has no syntax errors (use jsonlint.com)
- Check that you saved the config file

### "Authentication failed" error
- Verify API key is correct (no extra spaces)
- Check that role matches your key type:
  - Partner keys → role: "partner"
  - Consumer keys → role: "consumer"

### "Command not found: npx"
- Install Node.js from https://nodejs.org
- Restart terminal/Claude Desktop after installing

## Example Workflows

### Partner: Create Test Consumers

```
You: Create 3 test API keys for our staging environment

Claude will:
1. Use create_consumer tool 3 times
2. Generate emails (test1@example.com, test2@example.com, test3@example.com)
3. Return all 3 API keys
4. Optionally email them or save to file
```

### Consumer: Monitor Usage

```
You: Am I close to my rate limit?

Claude will:
1. Use get_dashboard to check usage
2. Calculate percentage used
3. Warn if >80%
4. Suggest upgrading if needed
```

## Advanced: Multiple Configurations

You can configure multiple MCP servers for different accounts:

```json
{
  "mcpServers": {
    "n33rd-work": {
      "command": "npx",
      "args": ["-y", "@tonkabits/n33rd-mcp-server"],
      "env": {
        "N33RD_API_KEY": "work_partner_key",
        "N33RD_ROLE": "partner"
      }
    },
    "n33rd-personal": {
      "command": "npx",
      "args": ["-y", "@tonkabits/n33rd-mcp-server"],
      "env": {
        "N33RD_API_KEY": "personal_consumer_key",
        "N33RD_ROLE": "consumer"
      }
    }
  }
}
```

Then ask Claude:
- "Use n33rd-work to list my services"
- "Use n33rd-personal to check my usage"

## Next Steps

- Read full docs: [README.md](README.md)
- View API reference: https://api.n33rd.com/docs
- Join community: [Discord/Slack link]
- Report issues: [GitHub Issues]
