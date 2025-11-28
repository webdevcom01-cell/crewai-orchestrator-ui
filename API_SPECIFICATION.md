# Backend API Specification for Enterprise Features

## Overview
This document specifies all backend API endpoints required to support the enterprise features implemented in the CrewAI Orchestrator UI.

## Authentication
All endpoints (except public ones) require authentication via JWT or API Key.

### Headers
```
Authorization: Bearer <JWT_TOKEN>
# or
Authorization: Bearer <API_KEY>
```

---

## 1. Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "owner",
    "workspaceId": "ws_123",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /api/auth/login
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "workspaceId": "ws_123",
    "permissions": ["workspace:read", "agent:create", ...],
    "lastActive": "2024-01-15T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/auth/me
Get current authenticated user.

**Response (200):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://cdn.example.com/avatars/user_123.jpg",
  "role": "admin",
  "workspaceId": "ws_123",
  "permissions": ["workspace:read", "agent:create", ...],
  "createdAt": "2024-01-01T00:00:00Z",
  "lastActive": "2024-01-15T10:00:00Z"
}
```

### POST /api/auth/logout
Invalidate current session.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Team Management Endpoints

### GET /api/workspaces/{workspaceId}/members
List all team members in workspace.

**Response (200):**
```json
[
  {
    "userId": "user_123",
    "user": {
      "id": "user_123",
      "email": "john@example.com",
      "name": "John Doe",
      "avatar": "https://cdn.example.com/avatars/user_123.jpg",
      "role": "owner",
      "lastActive": "2024-01-15T10:00:00Z"
    },
    "role": "owner",
    "invitedBy": "system",
    "joinedAt": "2024-01-01T00:00:00Z"
  },
  {
    "userId": "user_456",
    "user": {
      "id": "user_456",
      "email": "jane@example.com",
      "name": "Jane Smith",
      "role": "admin",
      "lastActive": "2024-01-15T09:30:00Z"
    },
    "role": "admin",
    "invitedBy": "user_123",
    "joinedAt": "2024-01-10T14:00:00Z"
  }
]
```

### POST /api/workspaces/{workspaceId}/invite
Invite a new team member.

**Request:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response (200):**
```json
{
  "invitationId": "inv_789",
  "email": "newmember@example.com",
  "role": "member",
  "invitedBy": "user_123",
  "expiresAt": "2024-01-22T10:00:00Z",
  "inviteUrl": "https://app.crewai.com/invite/inv_789"
}
```

### DELETE /api/workspaces/{workspaceId}/members/{userId}
Remove a team member.

**Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

### PATCH /api/workspaces/{workspaceId}/members/{userId}/role
Update member's role.

**Request:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "userId": "user_456",
  "role": "admin",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## 3. Version Control Endpoints

### GET /api/workspaces/{workspaceId}/versions
Get workflow version history.

**Response (200):**
```json
[
  {
    "id": "v_123",
    "version": "v2.5",
    "message": "Added email validation agent",
    "author": "John Doe",
    "timestamp": "2024-01-15T10:00:00Z",
    "changes": {
      "agents": 3,
      "tasks": 5,
      "crews": 1
    },
    "isCurrent": true
  },
  {
    "id": "v_122",
    "version": "v2.4",
    "message": "Fixed data processing pipeline",
    "author": "Jane Smith",
    "timestamp": "2024-01-14T16:30:00Z",
    "changes": {
      "agents": 0,
      "tasks": 2,
      "crews": 1
    },
    "isCurrent": false
  }
]
```

### POST /api/workspaces/{workspaceId}/versions
Create a new version snapshot.

**Request:**
```json
{
  "message": "Added new research agent"
}
```

**Response (201):**
```json
{
  "id": "v_124",
  "version": "v2.6",
  "message": "Added new research agent",
  "author": "John Doe",
  "timestamp": "2024-01-15T11:00:00Z",
  "changes": {
    "agents": 1,
    "tasks": 0,
    "crews": 0
  },
  "isCurrent": true
}
```

### POST /api/workspaces/{workspaceId}/versions/{versionId}/restore
Restore a previous version.

**Response (200):**
```json
{
  "message": "Version restored successfully",
  "restoredVersion": "v2.4",
  "newCurrentVersion": "v2.7"
}
```

### GET /api/workspaces/{workspaceId}/git/config
Get Git integration configuration.

**Response (200):**
```json
{
  "provider": "github",
  "repo": "mycompany/ai-workflows",
  "branch": "main",
  "lastSync": "2024-01-15T09:00:00Z"
}
```

### POST /api/workspaces/{workspaceId}/git/config
Update Git configuration.

**Request:**
```json
{
  "provider": "github",
  "repo": "mycompany/ai-workflows",
  "branch": "main"
}
```

**Response (200):**
```json
{
  "message": "Git configuration updated",
  "config": {
    "provider": "github",
    "repo": "mycompany/ai-workflows",
    "branch": "main"
  }
}
```

### POST /api/workspaces/{workspaceId}/git/sync
Sync workflows with Git repository.

**Response (200):**
```json
{
  "message": "Synced successfully",
  "commitHash": "a7f3c9d",
  "filesChanged": 5,
  "timestamp": "2024-01-15T11:30:00Z"
}
```

---

## 4. Analytics Endpoints

### GET /api/workspaces/{workspaceId}/analytics
Get analytics data for specified time range.

**Query Parameters:**
- `range`: `7d`, `30d`, `90d`

**Response (200):**
```json
{
  "overview": {
    "totalRuns": 1247,
    "successRate": 94.3,
    "avgExecutionTime": 12.5,
    "activeUsers": 8
  },
  "runsByDay": [
    {
      "date": "2024-01-15",
      "count": 45,
      "success": 42,
      "failed": 3
    },
    ...
  ],
  "topAgents": [
    {
      "name": "Research Agent",
      "runs": 234,
      "successRate": 96.2
    },
    ...
  ],
  "performance": [
    {
      "name": "Data Pipeline",
      "avgTime": 8.3,
      "minTime": 5.1,
      "maxTime": 15.7
    },
    ...
  ],
  "errors": [
    {
      "message": "API rate limit exceeded",
      "count": 12,
      "lastOccurred": "2024-01-15T10:45:00Z"
    },
    ...
  ]
}
```

### GET /api/workspaces/{workspaceId}/usage
Get current usage statistics.

**Response (200):**
```json
{
  "runs": {
    "used": 847,
    "limit": 1000
  },
  "agents": {
    "used": 12,
    "limit": -1
  },
  "seats": {
    "used": 5,
    "limit": 5
  }
}
```

---

## 5. Integrations Endpoints

### GET /api/workspaces/{workspaceId}/integrations
List all configured integrations.

**Response (200):**
```json
[
  {
    "id": "int_123",
    "type": "slack",
    "name": "Team Notifications",
    "enabled": true,
    "config": {
      "url": "https://hooks.slack.com/services/T00/B00/xxx",
      "channel": "#ai-workflows",
      "events": ["run_completed", "run_failed"]
    }
  },
  {
    "id": "int_456",
    "type": "discord",
    "name": "Dev Alerts",
    "enabled": false,
    "config": {
      "url": "https://discord.com/api/webhooks/xxx",
      "events": ["error_occurred"]
    }
  }
]
```

### POST /api/workspaces/{workspaceId}/integrations
Create a new integration.

**Request:**
```json
{
  "type": "slack",
  "name": "Team Notifications",
  "url": "https://hooks.slack.com/services/T00/B00/xxx",
  "channel": "#ai-workflows",
  "events": ["run_completed", "run_failed", "error_occurred"]
}
```

**Response (201):**
```json
{
  "id": "int_789",
  "type": "slack",
  "name": "Team Notifications",
  "enabled": true,
  "config": {
    "url": "https://hooks.slack.com/services/T00/B00/xxx",
    "channel": "#ai-workflows",
    "events": ["run_completed", "run_failed", "error_occurred"]
  },
  "createdAt": "2024-01-15T11:00:00Z"
}
```

### PATCH /api/workspaces/{workspaceId}/integrations/{integrationId}
Update integration settings.

**Request:**
```json
{
  "enabled": false
}
```

**Response (200):**
```json
{
  "id": "int_123",
  "enabled": false,
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

### DELETE /api/workspaces/{workspaceId}/integrations/{integrationId}
Delete an integration.

**Response (200):**
```json
{
  "message": "Integration deleted successfully"
}
```

### POST /api/workspaces/{workspaceId}/integrations/{integrationId}/test
Send a test notification.

**Response (200):**
```json
{
  "success": true,
  "message": "Test notification sent successfully to #ai-workflows"
}
```

---

## 6. Scheduler Endpoints

### GET /api/workspaces/{workspaceId}/schedules
List all workflow schedules.

**Response (200):**
```json
[
  {
    "id": "sched_123",
    "name": "Daily Report Generation",
    "type": "cron",
    "enabled": true,
    "config": {
      "cron": "0 0 * * *"
    },
    "workflowId": "wf_456",
    "workflowName": "Generate Daily Report",
    "lastRun": "2024-01-15T00:00:00Z",
    "nextRun": "2024-01-16T00:00:00Z",
    "runCount": 45
  },
  {
    "id": "sched_456",
    "name": "Data Sync",
    "type": "interval",
    "enabled": true,
    "config": {
      "interval": 3600
    },
    "workflowId": "wf_789",
    "workflowName": "Sync External Data",
    "lastRun": "2024-01-15T10:00:00Z",
    "nextRun": "2024-01-15T11:00:00Z",
    "runCount": 234
  }
]
```

### POST /api/workspaces/{workspaceId}/schedules
Create a new schedule.

**Request:**
```json
{
  "name": "Hourly Analytics",
  "type": "cron",
  "workflowId": "wf_123",
  "config": {
    "cron": "0 * * * *"
  }
}
```

**Response (201):**
```json
{
  "id": "sched_789",
  "name": "Hourly Analytics",
  "type": "cron",
  "enabled": true,
  "config": {
    "cron": "0 * * * *"
  },
  "workflowId": "wf_123",
  "nextRun": "2024-01-15T12:00:00Z",
  "createdAt": "2024-01-15T11:30:00Z"
}
```

### PATCH /api/workspaces/{workspaceId}/schedules/{scheduleId}
Update schedule settings.

**Request:**
```json
{
  "enabled": false
}
```

**Response (200):**
```json
{
  "id": "sched_123",
  "enabled": false,
  "updatedAt": "2024-01-15T11:45:00Z"
}
```

### DELETE /api/workspaces/{workspaceId}/schedules/{scheduleId}
Delete a schedule.

**Response (200):**
```json
{
  "message": "Schedule deleted successfully"
}
```

### POST /api/workspaces/{workspaceId}/schedules/{scheduleId}/run
Manually trigger a scheduled workflow.

**Response (200):**
```json
{
  "runId": "run_999",
  "status": "running",
  "startedAt": "2024-01-15T11:50:00Z"
}
```

### GET /api/workspaces/{workspaceId}/workflows
List all workflows (for schedule creation).

**Response (200):**
```json
[
  {
    "id": "wf_123",
    "name": "Data Processing Pipeline"
  },
  {
    "id": "wf_456",
    "name": "Generate Daily Report"
  }
]
```

---

## 7. API Access Endpoints

### GET /api/workspaces/{workspaceId}/api-keys
List all API keys.

**Response (200):**
```json
[
  {
    "id": "key_123",
    "name": "Production API Key",
    "key": "sk_live_aBcDeFg123456789...",
    "type": "rest",
    "permissions": ["agents:read", "agents:write", "runs:execute"],
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUsed": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-04-01T00:00:00Z",
    "isActive": true
  }
]
```

### POST /api/workspaces/{workspaceId}/api-keys
Create a new API key.

**Request:**
```json
{
  "name": "Mobile App Key",
  "type": "rest",
  "permissions": ["agents:read", "runs:read", "runs:execute"],
  "expiresInDays": 90
}
```

**Response (201):**
```json
{
  "id": "key_456",
  "name": "Mobile App Key",
  "key": "sk_live_xYz987654321...",
  "type": "rest",
  "permissions": ["agents:read", "runs:read", "runs:execute"],
  "createdAt": "2024-01-15T12:00:00Z",
  "expiresAt": "2024-04-15T12:00:00Z",
  "isActive": true
}
```

### DELETE /api/workspaces/{workspaceId}/api-keys/{keyId}
Revoke an API key.

**Response (200):**
```json
{
  "message": "API key revoked successfully"
}
```

---

## 8. Billing Endpoints

### GET /api/workspaces/{workspaceId}/subscription
Get current subscription details.

**Response (200):**
```json
{
  "plan": "pro",
  "status": "active",
  "currentPeriodEnd": "2024-02-15T00:00:00Z",
  "cancelAtPeriodEnd": false
}
```

### POST /api/workspaces/{workspaceId}/subscription/upgrade
Upgrade or change subscription plan.

**Request:**
```json
{
  "plan": "enterprise"
}
```

**Response (200):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

### POST /api/workspaces/{workspaceId}/subscription/cancel
Cancel subscription at period end.

**Response (200):**
```json
{
  "message": "Subscription will be cancelled at period end",
  "cancelAt": "2024-02-15T00:00:00Z"
}
```

### POST /api/workspaces/{workspaceId}/billing-portal
Get Stripe billing portal URL.

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/session/xxx"
}
```

---

## 9. Marketplace Endpoints

### GET /api/marketplace/templates
Get agent templates from marketplace.

**Query Parameters:**
- `category`: Filter by category
- `sortBy`: `popular`, `recent`, `rating`
- `search`: Search query

**Response (200):**
```json
[
  {
    "id": "tpl_123",
    "name": "Research Agent Pro",
    "description": "Advanced research agent with web scraping",
    "category": "research",
    "author": "CrewAI Team",
    "downloads": 1247,
    "rating": 4.8,
    "tags": ["research", "web-scraping", "data-extraction"],
    "config": {
      "role": "Senior Researcher",
      "goal": "Find and extract relevant information",
      "backstory": "Expert researcher with 10+ years experience",
      "tools": ["SerperApiTool", "ScrapeWebsiteTool", "PDFSearchTool"]
    },
    "isPremium": false
  }
]
```

### POST /api/workspaces/{workspaceId}/templates/{templateId}/install
Install a template as an agent.

**Response (200):**
```json
{
  "agentId": "agent_999",
  "name": "Research Agent Pro",
  "installedAt": "2024-01-15T12:30:00Z"
}
```

---

## 10. Branding Endpoints

### GET /api/workspaces/{workspaceId}/branding
Get white label branding configuration.

**Response (200):**
```json
{
  "logo": "https://cdn.example.com/logos/workspace_123.png",
  "favicon": "https://cdn.example.com/favicons/workspace_123.ico",
  "primaryColor": "#00ff9f",
  "secondaryColor": "#00d4ff",
  "accentColor": "#ff0080",
  "customDomain": "app.mycompany.com",
  "companyName": "My Company",
  "hideFooter": true,
  "customCSS": "/* Custom styles */"
}
```

### POST /api/workspaces/{workspaceId}/branding
Update branding configuration.

**Request:**
```json
{
  "primaryColor": "#FF6B35",
  "secondaryColor": "#004E89",
  "companyName": "Acme Corp",
  "hideFooter": true
}
```

**Response (200):**
```json
{
  "message": "Branding updated successfully",
  "updatedAt": "2024-01-15T13:00:00Z"
}
```

### POST /api/workspaces/{workspaceId}/upload-asset
Upload logo or favicon.

**Request (multipart/form-data):**
```
file: [binary]
type: "logo" | "favicon"
```

**Response (200):**
```json
{
  "url": "https://cdn.example.com/logos/workspace_123.png",
  "type": "logo",
  "uploadedAt": "2024-01-15T13:15:00Z"
}
```

---

## 11. AI Model Configuration

### GET /api/workspaces/{workspaceId}/ai-model
Get current AI model configuration.

**Response (200):**
```json
{
  "provider": "gemini",
  "model": "gemini-2.0-flash-exp",
  "temperature": 0.7,
  "maxTokens": 8000
}
```

### POST /api/workspaces/{workspaceId}/ai-model
Update AI model configuration.

**Request:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "apiKey": "sk-xxx...",
  "temperature": 0.8,
  "maxTokens": 4000
}
```

**Response (200):**
```json
{
  "message": "AI model configuration saved",
  "config": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.8,
    "maxTokens": 4000
  }
}
```

### POST /api/workspaces/{workspaceId}/ai-model/test
Test AI model connection.

**Request:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "apiKey": "sk-xxx..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully connected to OpenAI GPT-4. Response time: 342ms"
}
```

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "code": "INVALID_TOKEN"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS",
  "requiredPermission": "settings:manage"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Workspace not found",
  "code": "WORKSPACE_NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

---

## Database Schema Suggestions

### users
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP
);
```

### workspaces
```sql
CREATE TABLE workspaces (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_id VARCHAR(255) REFERENCES users(id),
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### workspace_members
```sql
CREATE TABLE workspace_members (
  workspace_id VARCHAR(255) REFERENCES workspaces(id),
  user_id VARCHAR(255) REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  invited_by VARCHAR(255) REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (workspace_id, user_id)
);
```

### versions
```sql
CREATE TABLE versions (
  id VARCHAR(255) PRIMARY KEY,
  workspace_id VARCHAR(255) REFERENCES workspaces(id),
  version VARCHAR(50) NOT NULL,
  message TEXT,
  author_id VARCHAR(255) REFERENCES users(id),
  snapshot JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_current BOOLEAN DEFAULT false
);
```

### integrations
```sql
CREATE TABLE integrations (
  id VARCHAR(255) PRIMARY KEY,
  workspace_id VARCHAR(255) REFERENCES workspaces(id),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### schedules
```sql
CREATE TABLE schedules (
  id VARCHAR(255) PRIMARY KEY,
  workspace_id VARCHAR(255) REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSON NOT NULL,
  workflow_id VARCHAR(255) NOT NULL,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### api_keys
```sql
CREATE TABLE api_keys (
  id VARCHAR(255) PRIMARY KEY,
  workspace_id VARCHAR(255) REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL,
  permissions JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  workspace_id VARCHAR(255) PRIMARY KEY REFERENCES workspaces(id),
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Rate Limiting

Implement rate limiting per API key or user:

- **Free tier:** 10 requests/minute
- **Pro tier:** 100 requests/minute
- **Enterprise tier:** 1000 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642248000
```

---

## Webhooks

When events occur, send POST requests to configured webhook URLs:

**Payload Example:**
```json
{
  "event": "run_completed",
  "timestamp": "2024-01-15T14:00:00Z",
  "workspaceId": "ws_123",
  "data": {
    "runId": "run_456",
    "workflowName": "Data Processing",
    "status": "success",
    "duration": 12.5,
    "result": "Processed 1000 records"
  }
}
```

---

## Testing

All endpoints should include:
1. Unit tests
2. Integration tests
3. E2E tests
4. Load tests for critical paths

Example test cases:
- Authentication flow
- Permission checking
- Rate limiting
- Webhook delivery
- Subscription upgrades

---

Built for CrewAI Orchestrator UI v2.0
