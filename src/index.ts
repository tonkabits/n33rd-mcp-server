#!/usr/bin/env node

/**
 * N33RD MCP Server
 *
 * Exposes N33RD platform operations to AI agents via Model Context Protocol.
 *
 * Supported roles:
 * - Partner: Manage services, consumers, keys, plans
 * - Consumer: View usage, rotate own key
 *
 * Usage:
 *   export N33RD_API_KEY=your_key_here
 *   export N33RD_ROLE=partner  # or consumer
 *   npx n33rd-mcp
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Validate and sanitize API base URL
const DEFAULT_API_URL = 'https://api.n33rd.com'
const API_BASE_URL = validateApiUrl(process.env.N33RD_URL || DEFAULT_API_URL)
const API_KEY = process.env.N33RD_API_KEY
const ROLE = (process.env.N33RD_ROLE || 'partner') as 'partner' | 'consumer'

if (!API_KEY) {
  console.error('Error: N33RD_API_KEY environment variable is required')
  process.exit(1)
}

if (ROLE !== 'partner' && ROLE !== 'consumer') {
  console.error('Error: N33RD_ROLE must be either "partner" or "consumer"')
  process.exit(1)
}

/**
 * Validate API URL to prevent SSRF
 */
function validateApiUrl(url: string): string {
  try {
    const parsed = new URL(url)

    // Only allow HTTPS
    if (parsed.protocol !== 'https:') {
      console.error('Error: N33RD_URL must use HTTPS protocol')
      process.exit(1)
    }

    // Only allow n33rd.com domains
    if (!parsed.hostname.endsWith('.n33rd.com') && parsed.hostname !== 'n33rd.com') {
      console.error('Error: N33RD_URL must be a n33rd.com domain')
      process.exit(1)
    }

    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}`
  } catch (e) {
    console.error('Error: Invalid N33RD_URL:', url)
    process.exit(1)
  }
}

/**
 * Validate UUID format to prevent path traversal
 */
function validateUUID(id: string, fieldName: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    throw new Error(`Invalid ${fieldName}: must be a valid UUID`)
  }
  return id
}

/**
 * Validate service/consumer ID format
 */
function validateId(id: string, fieldName: string): string {
  // Accept UUID format or alphanumeric with underscores/hyphens
  const idRegex = /^[a-zA-Z0-9_-]{1,64}$/
  if (!idRegex.test(id)) {
    throw new Error(`Invalid ${fieldName}: contains illegal characters`)
  }
  // Prevent path traversal
  if (id.includes('..') || id.includes('/') || id.includes('\\')) {
    throw new Error(`Invalid ${fieldName}: path traversal attempt detected`)
  }
  return id
}

/**
 * URL-encode path segment
 */
function encodePath(segment: string): string {
  return encodeURIComponent(segment)
}

/**
 * Make authenticated request to N33RD API
 */
async function apiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY!}`,
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      // Sanitize error message - don't leak server internals
      const status = response.status
      let errorMessage = 'Request failed'

      if (status === 401) errorMessage = 'Authentication failed'
      else if (status === 403) errorMessage = 'Permission denied'
      else if (status === 404) errorMessage = 'Resource not found'
      else if (status === 429) errorMessage = 'Rate limit exceeded'
      else if (status >= 500) errorMessage = 'Server error'

      throw new Error(`${errorMessage} (${status})`)
    }

    return response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error')
  }
}

/**
 * Define available tools based on role
 */
function getToolsForRole(): any[] {
  if (ROLE === 'partner') {
    return [
      // Service management
      {
        name: 'list_services',
        description: 'List all services configured by this partner',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_service',
        description: 'Add a new upstream service to proxy requests through',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Service name' },
            description: { type: 'string', description: 'Service description' },
            base_url: { type: 'string', description: 'Base URL for the service' },
          },
          required: ['name', 'base_url'],
        },
      },
      {
        name: 'update_service',
        description: 'Update an existing service configuration',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: { type: 'string', description: 'Service ID' },
            name: { type: 'string', description: 'Service name' },
            description: { type: 'string', description: 'Service description' },
            base_url: { type: 'string', description: 'Base URL for the service' },
          },
          required: ['service_id'],
        },
      },
      {
        name: 'configure_service_auth',
        description: 'Configure authentication for a service',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: { type: 'string', description: 'Service ID' },
            auth_type: {
              type: 'string',
              enum: ['bearer', 'basic', 'api_key', 'oauth2'],
              description: 'Authentication type',
            },
            auth_config: {
              type: 'object',
              description: 'Auth configuration (token, username/password, etc.)',
            },
          },
          required: ['service_id', 'auth_type', 'auth_config'],
        },
      },

      // Consumer management
      {
        name: 'create_consumer',
        description: 'Create a new consumer with API key',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Consumer email' },
            tier: { type: 'string', description: 'Pricing tier (e.g., trial, monthly, payg)' },
          },
          required: ['email', 'tier'],
        },
      },
      {
        name: 'get_consumer',
        description: 'Get consumer details and usage',
        inputSchema: {
          type: 'object',
          properties: {
            consumer_id: { type: 'string', description: 'Consumer ID (UUID)' },
          },
          required: ['consumer_id'],
        },
      },
      {
        name: 'rotate_consumer_key',
        description: 'Rotate a consumer API key',
        inputSchema: {
          type: 'object',
          properties: {
            consumer_id: { type: 'string', description: 'Consumer ID (UUID)' },
          },
          required: ['consumer_id'],
        },
      },
      {
        name: 'revoke_consumer_key',
        description: 'Permanently revoke a consumer API key',
        inputSchema: {
          type: 'object',
          properties: {
            consumer_id: { type: 'string', description: 'Consumer ID (UUID)' },
          },
          required: ['consumer_id'],
        },
      },
      {
        name: 'reactivate_consumer_key',
        description: 'Reactivate a previously revoked consumer key',
        inputSchema: {
          type: 'object',
          properties: {
            consumer_id: { type: 'string', description: 'Consumer ID (UUID)' },
          },
          required: ['consumer_id'],
        },
      },
      {
        name: 'toggle_consumer_key',
        description: 'Temporarily enable/disable a consumer API key',
        inputSchema: {
          type: 'object',
          properties: {
            consumer_id: { type: 'string', description: 'Consumer ID (UUID)' },
            enabled: { type: 'boolean', description: 'Enable or disable the key' },
          },
          required: ['consumer_id', 'enabled'],
        },
      },

      // Plan management
      {
        name: 'list_plans',
        description: 'List all pricing plans for this partner',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_plan',
        description: 'Create a new pricing plan',
        inputSchema: {
          type: 'object',
          properties: {
            tier: { type: 'string', description: 'Plan tier name' },
            rate_limit_per_day: { type: 'number', description: 'Daily request limit' },
            stripe_price_id: { type: 'string', description: 'Stripe Price ID (optional)' },
            requests_included: { type: 'number', description: 'Requests included (for PAYG)' },
          },
          required: ['tier', 'rate_limit_per_day'],
        },
      },

      // Analytics
      {
        name: 'get_dashboard',
        description: 'Get partner dashboard with analytics, consumer list, key metrics, and usage statistics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ]
  } else if (ROLE === 'consumer') {
    return [
      {
        name: 'get_dashboard',
        description: 'Get consumer dashboard with usage statistics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_analytics',
        description: 'Get detailed usage analytics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'rotate_my_key',
        description: 'Rotate your own API key',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_plan_info',
        description: 'Get current plan information and limits',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_api_documentation',
        description: 'Fetch the partner API OpenAPI specification for learning available endpoints, request/response formats, and authentication requirements',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ]
  }

  return []
}

/**
 * Tool access control by role
 */
const PARTNER_TOOLS = new Set([
  'list_services',
  'create_service',
  'update_service',
  'configure_service_auth',
  'create_consumer',
  'get_consumer',
  'rotate_consumer_key',
  'revoke_consumer_key',
  'reactivate_consumer_key',
  'toggle_consumer_key',
  'list_plans',
  'create_plan',
  'get_dashboard',
])

const CONSUMER_TOOLS = new Set([
  'get_dashboard',
  'get_analytics',
  'rotate_my_key',
  'get_plan_info',
  'get_api_documentation',
])

/**
 * Handle tool execution
 */
async function handleToolCall(name: string, args: any): Promise<any> {
  // Enforce role-based access control at execution time
  if (ROLE === 'partner' && !PARTNER_TOOLS.has(name)) {
    throw new Error(`Tool '${name}' is not available for partner role`)
  }
  if (ROLE === 'consumer' && !CONSUMER_TOOLS.has(name)) {
    throw new Error(`Tool '${name}' is not available for consumer role`)
  }

  try {
    switch (name) {
      // Partner - Service Management
      case 'list_services':
        return await apiRequest('/partner/services')

      case 'create_service':
        return await apiRequest('/partner/services', 'POST', {
          name: args.name,
          description: args.description,
          base_url: args.base_url,
        })

      case 'update_service': {
        const serviceId = validateId(args.service_id, 'service_id')
        return await apiRequest(`/partner/services/${encodePath(serviceId)}`, 'PATCH', {
          name: args.name,
          description: args.description,
          base_url: args.base_url,
        })
      }

      case 'configure_service_auth': {
        const serviceId = validateId(args.service_id, 'service_id')
        return await apiRequest(`/partner/services/${encodePath(serviceId)}/auth`, 'PATCH', {
          auth_type: args.auth_type,
          auth_config: args.auth_config,
        })
      }

      // Partner - Consumer Management
      case 'create_consumer':
        return await apiRequest('/partner/consumer/create', 'POST', {
          email: args.email,
          tier: args.tier,
        })

      case 'get_consumer': {
        const consumerId = validateUUID(args.consumer_id, 'consumer_id')
        return await apiRequest(`/partner/consumer/${encodePath(consumerId)}/plan-info`)
      }

      case 'rotate_consumer_key': {
        const consumerId = validateUUID(args.consumer_id, 'consumer_id')
        return await apiRequest(`/partner/consumer/${encodePath(consumerId)}/rotate-key`, 'POST')
      }

      case 'revoke_consumer_key': {
        const consumerId = validateUUID(args.consumer_id, 'consumer_id')
        return await apiRequest(`/partner/consumer/${encodePath(consumerId)}/revoke-key`, 'POST')
      }

      case 'reactivate_consumer_key': {
        const consumerId = validateUUID(args.consumer_id, 'consumer_id')
        return await apiRequest(`/partner/consumer/${encodePath(consumerId)}/reactivate-key`, 'POST')
      }

      case 'toggle_consumer_key': {
        const consumerId = validateUUID(args.consumer_id, 'consumer_id')
        return await apiRequest(`/partner/consumer/${encodePath(consumerId)}/toggle-key`, 'PATCH', {
          enabled: args.enabled,
        })
      }

      // Partner - Plan Management
      case 'list_plans':
        return await apiRequest('/partner/plans')

      case 'create_plan':
        return await apiRequest('/partner/plans', 'POST', {
          tier: args.tier,
          rate_limit_per_day: args.rate_limit_per_day,
          stripe_price_id: args.stripe_price_id,
          requests_included: args.requests_included,
        })

      // Partner - Analytics
      case 'get_dashboard':
        if (ROLE === 'partner') {
          return await apiRequest('/partner/dashboard')
        } else {
          return await apiRequest('/consumer/dashboard')
        }

      // Consumer - Analytics
      case 'get_analytics':
        return await apiRequest('/consumer/analytics')

      case 'rotate_my_key':
        return await apiRequest('/consumer/rotate-key', 'POST')

      case 'get_plan_info':
        return await apiRequest('/consumer/my-plans')

      case 'get_api_documentation': {
        // Get dashboard to extract partner documentation URL
        const dashboard = await apiRequest('/consumer/dashboard')
        const docUrl = dashboard?.consumer?.partner_documentation_url

        if (!docUrl) {
          throw new Error('Partner has not configured API documentation URL')
        }

        // Fetch the OpenAPI spec from partner's documentation URL
        // Try common OpenAPI spec endpoints
        const possibleUrls = [
          docUrl.endsWith('/docs/json') ? docUrl : `${docUrl.replace(/\/docs$/, '')}/docs/json`,
          docUrl.endsWith('/openapi.json') ? docUrl : `${docUrl.replace(/\/$/, '')}/openapi.json`,
          docUrl.endsWith('/swagger.json') ? docUrl : `${docUrl.replace(/\/$/, '')}/swagger.json`,
        ]

        for (const url of possibleUrls) {
          try {
            const response = await fetch(url, {
              headers: { 'Accept': 'application/json' }
            })

            if (response.ok) {
              const spec = await response.json()
              return {
                documentation_url: docUrl,
                openapi_spec_url: url,
                spec
              }
            }
          } catch (err) {
            // Try next URL
            continue
          }
        }

        throw new Error(`Could not fetch OpenAPI spec from ${docUrl}. Partner must expose spec at /docs/json, /openapi.json, or /swagger.json`)
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Tool execution failed')
  }
}

/**
 * Main server
 */
async function main() {
  const server = new Server(
    {
      name: 'n33rd-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: getToolsForRole(),
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = await handleToolCall(request.params.name, request.params.arguments || {})
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [{ type: 'text', text: `Error: ${message}` }],
        isError: true,
      }
    }
  })

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
