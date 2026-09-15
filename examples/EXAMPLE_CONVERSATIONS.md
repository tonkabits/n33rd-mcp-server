# Example Conversations with N33RD MCP Server

Real-world examples of how AI agents can use the N33RD MCP server.

## Partner: Setting Up a New API Service

```
User: I want to expose my Books API through N33RD. The API is at
https://api.mybooks.com and uses Bearer token authentication.

Claude: I'll help you set up your Books API service. Let me create the
service and configure authentication.

[Uses create_service tool]
{
  "name": "Books API",
  "description": "RESTful API for book catalog and search",
  "base_url": "https://api.mybooks.com"
}

[Uses configure_service_auth tool]
{
  "service_id": "srv_abc123",
  "auth_type": "bearer",
  "auth_config": {
    "token": "your_upstream_token_here"
  }
}

Great! Your Books API is now live at:
https://api.n33rd.com/p/yourname/books/*

All requests will be proxied with Bearer authentication automatically.
Ready to create some consumer API keys?
```

---

## Partner: Bulk Consumer Creation

```
User: Create 10 trial API keys for our beta testers. Use emails
beta1@test.com through beta10@test.com

Claude: I'll create 10 trial keys for your beta testers.

[Loops 10 times using create_consumer tool]

Created 10 trial API keys:

1. beta1@test.com → books_api_live_abc123... (7-day trial, 1000 req/day)
2. beta2@test.com → books_api_live_def456... (7-day trial, 1000 req/day)
3. beta3@test.com → books_api_live_ghi789... (7-day trial, 1000 req/day)
...
10. beta10@test.com → books_api_live_xyz999... (7-day trial, 1000 req/day)

All keys have been emailed to the respective addresses. The trial
period starts now and expires in 7 days.

Would you like me to:
- Export these to a CSV file?
- Set up monitoring for when they approach their limits?
- Create a shared document with all credentials?
```

---

## Partner: Usage Monitoring

```
User: Show me which consumers are at risk of hitting their rate limits today

Claude: Let me check all your consumers and their usage.

[Uses list_consumers tool, then get_consumer for each]

Here are consumers at risk (>80% of daily limit):

🔴 CRITICAL (>95%):
- john@example.com: 9,800/10,000 requests (98%)
  → Only 200 requests remaining today
  → Suggest upgrade to higher tier

🟡 WARNING (80-95%):
- sarah@company.com: 8,500/10,000 requests (85%)
- mike@startup.io: 8,200/10,000 requests (82%)

Would you like me to:
1. Send usage warning emails to these users?
2. Automatically upgrade them to the next tier?
3. Temporarily increase their limits for today?
```

---

## Partner: Security Response

```
User: I think consumer ID usr_abc123 is abusing the API. Investigate and
take action if needed.

Claude: I'll investigate this consumer immediately.

[Uses get_consumer tool]

Consumer Details:
- Email: suspicious@domain.com
- Plan: Trial (1,000 req/day)
- Usage today: 4,823 requests
- Pattern: 400+ requests in last hour (unusual spike)
- Recent errors: 89% rate limit errors (429s)

This looks like abuse - they're hammering the API despite rate limits.

Recommended actions:
1. ✅ Revoke their API key immediately
2. ✅ Block their email domain from future signups
3. ⚠️  Review logs for data exfiltration attempts

Should I proceed with revoking their key?

User: Yes, revoke it.

Claude: [Uses revoke_consumer_key tool]

Key revoked successfully. The consumer can no longer make requests.

Next steps:
- I've documented this incident in your security log
- The email domain 'domain.com' is flagged for review
- Would you like me to check for other suspicious accounts?
```

---

## Consumer: Self-Service Key Rotation

```
User: I accidentally committed my API key to GitHub. What should I do?

Claude: Don't worry! Let me immediately rotate your API key to invalidate
the exposed one.

[Uses rotate_my_key tool]

✅ Key rotated successfully!

Old key (EXPOSED - now invalid):
  books_api_live_abc123xyz...

New key (save this securely):
  books_api_live_new789def...

Your old key is now permanently disabled. The exposed key in your GitHub
commit cannot be used to access the API anymore.

Important next steps:
1. Update your .env file with the new key
2. Add .env to .gitignore if not already
3. Consider using GitHub secrets for CI/CD
4. Revoke the exposed commit from GitHub history (optional)

Would you like me to help you set up proper secret management?
```

---

## Consumer: Usage Optimization

```
User: My API costs are too high. Help me reduce usage.

Claude: Let me analyze your usage patterns to find optimization opportunities.

[Uses get_analytics tool]

Current Usage Analysis:
- Total requests this month: 145,000
- Average requests per day: 4,833
- Current plan: Pro Monthly ($29/mo, 10k req/day)
- Projected monthly cost: $29

Cost Breakdown:
- 23% of requests: Search endpoint (cacheable!)
- 45% of requests: Book details (mostly duplicates)
- 32% of requests: Author info (static data)

💡 Optimization Recommendations:

1. Cache search results (save ~33k requests/month)
   - Implement 5-minute cache for search queries
   - Estimated savings: $0 (still within plan)

2. Batch book detail requests (save ~40k requests/month)
   - Use /books/batch endpoint instead of individual calls
   - Estimated savings: $0 (still within plan)

3. Cache author data locally (save ~46k requests/month)
   - Author info rarely changes, cache for 24 hours
   - Estimated savings: $0 (still within plan)

Total potential savings: ~119k requests/month
New usage: ~26k requests/month

💰 DOWNGRADE OPPORTUNITY:
With optimizations, you could downgrade to Trial tier (free) or
PAYG Starter ($10 one-time for 10k requests).

Would you like me to:
- Generate code samples for caching?
- Show you the batch endpoint documentation?
- Help you implement these optimizations?
```

---

## Admin: Platform Health Check

```
User: Generate a platform health report for the executive team.

Claude: I'll compile a comprehensive platform health report.

[Uses get_platform_dashboard tool]
[Uses list_cron_logs tool]

📊 N33RD PLATFORM HEALTH REPORT
Generated: September 14, 2026 2:30 PM UTC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 KEY METRICS

Partners: 47 total
  - Free tier: 12
  - Pro (100k): 23
  - Pro (250k): 8
  - Pro (500k): 4

Consumers: 1,247 total
  - Trial: 342 (27%)
  - Monthly: 615 (49%)
  - PAYG: 290 (23%)

Revenue (MRR):
  - Partner subscriptions: $1,230/mo
  - Consumer subscriptions: $17,835/mo
  - PAYG credits: $4,200/mo
  - Total MRR: $23,265

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SYSTEM HEALTH

Uptime: 99.97% (last 30 days)
API Response time: 145ms avg
Error rate: 0.03%

Cron Jobs (Daily Reset):
  - Last execution: Today 12:00 AM UTC
  - Status: ✅ Success
  - Keys reset: 615 (all timezones)
  - Execution time: 1.2s

Service Health Checks:
  - Total services monitored: 94
  - Healthy: 92 (98%)
  - Unhealthy: 2 (2%)
    → Partner "BooksCo" - API timeout
    → Partner "DataHub" - 503 errors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 GROWTH TRENDS (Last 30 days)

New partners: +12 (+34% MoM)
New consumers: +234 (+23% MoM)
Request volume: 47.3M (+18% MoM)

Top growing partners:
1. TechAPI Inc - 450% growth
2. DataStream Co - 320% growth
3. DevTools Ltd - 280% growth

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  ACTION ITEMS

1. Investigate 2 unhealthy services
2. 15 consumers approaching tier limits (upgrade opportunity)
3. 8 trial keys expiring in next 3 days (conversion opportunity)
4. 3 partners at >90% monthly quota (upsell to higher tier)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would you like me to:
- Deep dive into any specific metric?
- Generate charts/graphs for presentation?
- Export this report to PDF?
- Set up automated weekly reports?
```

---

## Admin: Partner Tier Management

```
User: Partner "TechAPI Inc" just signed an enterprise contract.
Upgrade them to pro_500k tier.

Claude: I'll upgrade TechAPI Inc to the pro_500k tier immediately.

[Uses get_partner tool first to verify]

Current partner status:
- Name: TechAPI Inc
- Email: admin@techapi.com
- Current tier: pro_100k (100,000 req/month)
- Usage this month: 94,230 requests (94% of quota)
- Consumers: 45

[Uses update_partner_tier tool]

✅ Upgrade successful!

New tier: pro_500k
- Monthly quota: 500,000 requests
- Free consumer keys: 5,000 (was 1,000)
- Trial consumer keys: 1,000 (was 250)
- Features: Custom branding, priority support, advanced analytics

The upgrade is effective immediately. TechAPI Inc can now:
- Create 4,000 more free consumer keys
- Handle 5x more monthly traffic
- Access advanced analytics dashboard

Should I:
- Send confirmation email to admin@techapi.com?
- Notify their consumers about service improvements?
- Update billing to reflect enterprise pricing?
```

---

## Multi-Agent Collaboration: AI Managing AI

```
[Agent 1 - Partner's AI Assistant]
User: Set up automated key rotation for all trial users when they convert
to paid.

Claude: I'll create a workflow to automatically rotate keys on tier upgrades.

This requires:
1. Monitor for tier changes (trial → monthly/payg)
2. Rotate consumer key automatically
3. Email new key to consumer
4. Log the rotation for audit

I can detect tier changes by polling the dashboard every 5 minutes, but
I don't have webhook capabilities. Would you like me to:

A) Poll every 5 minutes and handle rotations?
B) Request webhook support from platform team?
C) Set up a manual workflow you can trigger?

---

[Agent 2 - Consumer's AI Assistant]
Hey! I just got auto-upgraded from trial to monthly. Let me check if my
key changed.

[Uses get_dashboard tool]

Interesting - my key was automatically rotated:
- Old key: trial_key_abc...
- New key: monthly_key_xyz...

Let me update my application's environment variables.

[Updates .env file automatically]

Done! My application is now using the new monthly key. The transition
was seamless.

---

[Agent 3 - Admin's AI Monitor]
Alert: Detected coordinated API abuse from 5 consumer accounts.

Pattern analysis:
- All accounts created within 10 minutes
- Same IP range (10.0.0.x)
- Identical request patterns
- Scraping product catalog

Recommended action: Revoke all 5 keys and block IP range.

[Uses revoke_consumer_key tool for all 5 accounts]

Security incident resolved. Accounts blocked, IP range banned.
Detailed incident report saved to security log.
```

These examples demonstrate how the MCP server enables sophisticated AI-powered platform management!
