# N33RD MCP Server - Documentation

Complete documentation for the N33RD MCP Server.

## 📖 Getting Started

1. **[README.md](./README.md)** - Overview and installation
2. **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
3. **[MCP_SERVER.md](./MCP_SERVER.md)** - Complete reference guide

## 📋 Additional Resources

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Implementation overview and technical architecture
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing procedures and verification
- **[examples/EXAMPLE_CONVERSATIONS.md](./examples/EXAMPLE_CONVERSATIONS.md)** - Real-world usage examples
- **[examples/claude-desktop-config.json](./examples/claude-desktop-config.json)** - Configuration template

## 🎯 Quick Start by Role

### Partner
Use AI to manage your API services and consumers.

**Read**: [QUICKSTART.md](./QUICKSTART.md) → [MCP_SERVER.md](./MCP_SERVER.md) → [examples/EXAMPLE_CONVERSATIONS.md](./examples/EXAMPLE_CONVERSATIONS.md)

### Consumer
Use AI to monitor your API usage.

**Read**: [QUICKSTART.md](./QUICKSTART.md) → [MCP_SERVER.md](./MCP_SERVER.md) (Consumer tools section)

### Admin
Use AI to manage the platform.

**Read**: [QUICKSTART.md](./QUICKSTART.md) → [MCP_SERVER.md](./MCP_SERVER.md) (Admin tools section)

## 📝 Quick Reference

### Setup
```bash
npm install -g @tonkabits/n33rd-mcp-server
# Configure Claude Desktop (see QUICKSTART.md)
# Restart Claude Desktop
# Ask: "List all my API services"
```

### Test
```bash
# In Claude Desktop
User: "List all my API services"
User: "Create a consumer with email test@example.com on trial plan"
User: "Show me usage for consumer xyz"
```

### Troubleshooting
See [MCP_SERVER.md](./MCP_SERVER.md#troubleshooting)

## 🆘 Support

**Issues**: https://github.com/tonkabits/n33rd-mcp-server/issues
**Docs**: https://api.n33rd.com/docs
**Platform**: https://n33rd.com

---

**Version**: 0.1.0
