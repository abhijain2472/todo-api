# Todo API Context for Frontend Development

> **Last Updated**: 2026-01-30  
> **API Version**: 1.0.0  
> **Base URL**: `http://localhost:3000`

---

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Testing](#testing)

---

## Overview

This is an **offline-first Todo API** built with Node.js, Express, and MongoDB. The API is designed to support client applications that need to work offline and sync with a server when online.

### Key Features
- ✅ **Offline-First Architecture**: Client-generated sync IDs
- ✅ **Soft Deletion**: Items marked as deleted but preserved for sync
- ✅ **Versioning**: Conflict resolution via version numbers
- ✅ **Incremental Sync**: Fetch only changes since last sync
- ✅ **No Authentication**: Currently public API (no auth required)

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB (Mongoose ODM)
- **Documentation**: Swagger/OpenAPI

---

## Architecture

### Dual-ID System

The API uses **two identifiers** for each todo:

| Identifier | Type | Purpose | Visibility |
|------------|------|---------|------------|
| `_id` | ObjectId | MongoDB internal ID | **Never exposed** to clients |
| `syncId` | String (UUID) | Client-generated sync ID | **Primary identifier** for all API operations |

### Why Client-Generated IDs?

In offline-first apps:
1. **Clients create todos while offline** → Need immediate IDs for local references
2. **Multiple devices sync** → UUIDs prevent ID conflicts
3. **Server doesn't generate IDs** → Clients have full control

> ⚠️ **CRITICAL**: Frontend MUST generate `syncId` (UUID v4) before creating todos. Never use or expect `_id` in responses.

---

## Data Model

### Todo Schema

```typescript
interface Todo {
  syncId: string;           // UUID v4, client-generated, required, unique
  title: string;            // Todo title, required
  description?: string;     // Optional description, default: ""
  isCompleted: boolean;     // Completion status, default: false
  isDeleted: boolean;       // Soft deletion flag, default: false
  version: number;          // Auto-incremented on updates, default: 1
  createdAt: string;        // ISO datetime, auto-generated
  updatedAt: string;        // ISO datetime, auto-updated
}
```

### Field Details

#### `syncId` (string, required)
- **Client-generated UUID v4**
- **Must be unique** across all todos
- **Example**: `"550e8400-e29b-41d4-a716-446655440000"`
- **Generation**: Use `uuid` library or equivalent
```javascript
import { v4 as uuidv4 } from 'uuid';
const syncId = uuidv4();
```

#### `title` (string, required)
- Todo title/name
- **Trimmed** automatically
- **Validation**: Cannot be empty

#### `description` (string, optional)
- Additional details about the todo
- **Default**: Empty string `""`
- **Trimmed** automatically

#### `isCompleted` (boolean)
- Marks whether todo is done
- **Default**: `false`
- Use for filtering active vs completed todos

#### `isDeleted` (boolean)
- **Soft deletion** flag (tombstone)
- **Default**: `false`
- Deleted items remain in database for sync
- **Filter**: Active todos have `isDeleted: false`

#### `version` (number)
- **Auto-incremented** on every update (not on creation)
- **Default**: `1`
- **Used for**: Conflict resolution in offline sync
- **Higher version** = more recent data

#### `createdAt` / `updatedAt` (ISO datetime strings)
- **Auto-generated** by MongoDB
- **Format**: ISO 8601 (e.g., `"2026-01-30T12:21:00.427Z"`)
- Used for sync timestamp comparisons

---

## Authentication

**Current Status**: ❌ **No authentication required**

All endpoints are publicly accessible. No headers, tokens, or credentials needed.

> 📝 **Note**: Authentication may be added in future versions.

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Content-Type
All POST/PATCH requests must include:
```
Content-Type: application/json
```

---

### 1. Create Todo

**Create a new todo with client-generated syncId**

```http
POST /api/todos
Content-Type: application/json
```

**Request Body** (required):
```json
{
  "syncId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Required Fields**:
- `syncId` (string, UUID v4)
- `title` (string, non-empty)

**Optional Fields**:
- `description` (string)
- `isCompleted` (boolean, default: false)

**Success Response** (201 Created):
```json
{
  "syncId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "isCompleted": false,
  "isDeleted": false,
  "version": 1,
  "createdAt": "2026-01-30T12:21:00.427Z",
  "updatedAt": "2026-01-30T12:21:00.427Z"
}
```

**Error Responses**:

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Missing `syncId` | `{"message": "syncId is required and must be generated by the client (UUID v4 recommended)"}` |
| 400 | Missing `title` | `{"message": "Todo validation failed: title: Please add a title"}` |
| 409 | Duplicate `syncId` | `{"message": "A todo with this syncId already exists"}` |

**Frontend Example** (React/TypeScript):
```typescript
import { v4 as uuidv4 } from 'uuid';

async function createTodo(title: string, description?: string) {
  const syncId = uuidv4();
  
  const response = await fetch('http://localhost:3000/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ syncId, title, description })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}
```

---

### 2. Get Active Todos

**Fetch all non-deleted todos**

```http
GET /api/todos
```

**No request body or parameters**

**Success Response** (200 OK):
```json
[
  {
    "syncId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "isCompleted": false,
    "isDeleted": false,
    "version": 1,
    "createdAt": "2026-01-30T12:21:00.427Z",
    "updatedAt": "2026-01-30T12:21:00.427Z"
  },
  {
    "syncId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "title": "Finish project",
    "description": "",
    "isCompleted": true,
    "isDeleted": false,
    "version": 3,
    "createdAt": "2026-01-29T08:15:00.000Z",
    "updatedAt": "2026-01-30T11:00:00.000Z"
  }
]
```

**Notes**:
- Returns **only active todos** (`isDeleted: false`)
- Sorted by `createdAt` (newest first)
- Empty array `[]` if no active todos

**Frontend Example**:
```typescript
async function getActiveTodos() {
  const response = await fetch('http://localhost:3000/api/todos');
  return response.json(); // Returns Todo[]
}
```

---

### 3. Update Todo

**Update an existing todo by syncId**

```http
PATCH /api/todos/:syncId
Content-Type: application/json
```

**URL Parameters**:
- `:syncId` - The client-generated UUID of the todo

**Request Body** (partial update):
```json
{
  "isCompleted": true
}
```

**Updatable Fields**:
- `title` (string)
- `description` (string)
- `isCompleted` (boolean)
- `isDeleted` (boolean) - can be used to undelete

**Protected Fields**:
- ❌ Cannot update `syncId` - returns 400 error
- ❌ Cannot update `version` - auto-incremented
- ❌ Cannot update `createdAt` / `updatedAt` - auto-managed

**Success Response** (200 OK):
```json
{
  "syncId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "isCompleted": true,
  "isDeleted": false,
  "version": 2,
  "createdAt": "2026-01-30T12:21:00.427Z",
  "updatedAt": "2026-01-30T12:30:15.842Z"
}
```

**Error Responses**:

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Trying to change `syncId` | `{"message": "Cannot modify syncId"}` |
| 404 | Todo not found | `{"message": "Todo not found"}` |

**Frontend Example**:
```typescript
async function toggleTodoComplete(syncId: string, isCompleted: boolean) {
  const response = await fetch(`http://localhost:3000/api/todos/${syncId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCompleted })
  });
  
  if (!response.ok) throw new Error('Failed to update todo');
  return response.json();
}
```

---

### 4. Delete Todo (Soft Delete)

**Mark a todo as deleted (tombstone)**

```http
DELETE /api/todos/:syncId
```

**URL Parameters**:
- `:syncId` - The client-generated UUID of the todo

**No request body**

**Success Response** (200 OK):
```json
{
  "syncId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Todo soft deleted",
  "isDeleted": true
}
```

**Error Responses**:

| Status | Condition | Response |
|--------|-----------|----------|
| 404 | Todo not found | `{"message": "Todo not found"}` |

**Important Notes**:
- ✅ Sets `isDeleted: true` (does NOT delete from database)
- ✅ Increments `version` number
- ✅ Item remains for sync purposes
- ✅ Won't appear in `GET /api/todos` (active list)
- ✅ WILL appear in sync endpoint

**Frontend Example**:
```typescript
async function deleteTodo(syncId: string) {
  const response = await fetch(`http://localhost:3000/api/todos/${syncId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete todo');
  return response.json();
}
```

---

### 5. Sync Todos (Incremental Sync)

**Get all changes since a specific timestamp**

```http
GET /api/todos/sync?since={timestamp}
```

**Query Parameters**:
- `since` (optional) - ISO datetime string to fetch changes after
  - Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
  - Example: `2026-01-30T00:00:00.000Z`
  - If omitted: returns all todos

**Success Response** (200 OK):
```json
{
  "timestamp": "2026-01-30T12:45:30.123Z",
  "changes": [
    {
      "syncId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "isCompleted": true,
      "isDeleted": true,
      "version": 3,
      "createdAt": "2026-01-30T12:21:00.427Z",
      "updatedAt": "2026-01-30T12:40:15.842Z"
    }
  ]
}
```

**Response Fields**:
- `timestamp` - Current server time (use for next sync)
- `changes` - Array of todos modified after `since` timestamp

**Important Notes**:
- ✅ Returns ALL todos matching criteria (including `isDeleted: true`)
- ✅ Use `isDeleted` flag to remove items locally
- ✅ Sorted by `updatedAt` (oldest first)
- ✅ Save `timestamp` for next incremental sync

**Frontend Sync Logic**:
```typescript
async function syncTodos(lastSyncTime?: string) {
  const url = lastSyncTime 
    ? `http://localhost:3000/api/todos/sync?since=${lastSyncTime}`
    : 'http://localhost:3000/api/todos/sync';
  
  const response = await fetch(url);
  const { timestamp, changes } = await response.json();
  
  // Process changes
  changes.forEach(todo => {
    if (todo.isDeleted) {
      // Remove from local storage
      localDB.remove(todo.syncId);
    } else {
      // Add or update in local storage
      localDB.upsert(todo);
    }
  });
  
  // Save timestamp for next sync
  localStorage.setItem('lastSyncTime', timestamp);
  
  return { timestamp, processedCount: changes.length };
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (create) |
| 400 | Bad Request | Validation errors, missing fields |
| 404 | Not Found | Todo with syncId doesn't exist |
| 409 | Conflict | Duplicate syncId |
| 500 | Server Error | Database or server issues |

### Common Error Scenarios

#### Missing syncId on Create
```json
{
  "message": "syncId is required and must be generated by the client (UUID v4 recommended)"
}
```

#### Duplicate syncId
```json
{
  "message": "A todo with this syncId already exists"
}
```

#### Todo Not Found
```json
{
  "message": "Todo not found"
}
```

#### Validation Error (missing title)
```json
{
  "message": "Todo validation failed: title: Please add a title"
}
```

---

## Frontend Integration Guide

### 1. Install UUID Library

```bash
npm install uuid
npm install --save-dev @types/uuid  # For TypeScript
```

### 2. TypeScript Types

```typescript
// types/todo.ts
export interface Todo {
  syncId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  syncId: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  isDeleted?: boolean;
}

export interface SyncResponse {
  timestamp: string;
  changes: Todo[];
}
```

### 3. API Client Service

```typescript
// services/todoApi.ts
import { v4 as uuidv4 } from 'uuid';

const API_BASE = 'http://localhost:3000/api';

export class TodoAPI {
  
  static async getActiveTodos(): Promise<Todo[]> {
    const res = await fetch(`${API_BASE}/todos`);
    if (!res.ok) throw new Error('Failed to fetch todos');
    return res.json();
  }
  
  static async createTodo(
    title: string, 
    description?: string
  ): Promise<Todo> {
    const syncId = uuidv4();
    
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ syncId, title, description })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }
    
    return res.json();
  }
  
  static async updateTodo(
    syncId: string, 
    updates: UpdateTodoRequest
  ): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos/${syncId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!res.ok) throw new Error('Failed to update todo');
    return res.json();
  }
  
  static async deleteTodo(syncId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/todos/${syncId}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) throw new Error('Failed to delete todo');
  }
  
  static async sync(since?: string): Promise<SyncResponse> {
    const url = since 
      ? `${API_BASE}/todos/sync?since=${since}`
      : `${API_BASE}/todos/sync`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
  }
}
```

### 4. Offline-First Strategy

#### Local Storage Structure
```typescript
// Store todos locally
interface LocalTodoStore {
  todos: { [syncId: string]: Todo };
  lastSyncTime: string | null;
  pendingActions: PendingAction[];
}

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  syncId: string;
  data?: any;
  timestamp: string;
}
```

#### Sync Flow
```typescript
async function fullSync() {
  // 1. Get last sync timestamp
  const lastSync = localStorage.getItem('lastSyncTime');
  
  // 2. Sync pending local changes to server
  await uploadPendingChanges();
  
  // 3. Download server changes
  const { timestamp, changes } = await TodoAPI.sync(lastSync || undefined);
  
  // 4. Merge changes
  changes.forEach(serverTodo => {
    if (serverTodo.isDeleted) {
      deleteLocalTodo(serverTodo.syncId);
    } else {
      upsertLocalTodo(serverTodo);
    }
  });
  
  // 5. Save new sync timestamp
  localStorage.setItem('lastSyncTime', timestamp);
}
```

### 5. Conflict Resolution

When version conflicts occur:

```typescript
function resolveConflict(local: Todo, server: Todo): Todo {
  // Server version wins (last-write-wins)
  if (server.version > local.version) {
    return server;
  }
  
  // Local version is newer
  if (local.version > server.version) {
    // Need to push local changes
    return local;
  }
  
  // Same version, use updatedAt timestamp
  return new Date(server.updatedAt) > new Date(local.updatedAt) 
    ? server 
    : local;
}
```

---

## Testing

### Manual Testing with cURL

#### Create Todo
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "syncId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Test Todo",
    "description": "Testing the API"
  }'
```

#### Get Active Todos
```bash
curl http://localhost:3000/api/todos
```

#### Update Todo
```bash
curl -X PATCH http://localhost:3000/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}'
```

#### Delete Todo
```bash
curl -X DELETE http://localhost:3000/api/todos/550e8400-e29b-41d4-a716-446655440000
```

#### Sync
```bash
curl "http://localhost:3000/api/todos/sync?since=2026-01-01T00:00:00.000Z"
```

### Postman Collection

Import the Postman collection: `postman/todos_collection.json`

### Swagger UI

Interactive API documentation: `http://localhost:3000/api-docs`

---

## Important Notes for Frontend Development

### 🔴 CRITICAL
1. **Always generate `syncId`** client-side using UUID v4 before creating todos
2. **Never use or expect `_id`** in any API interaction
3. **Use `syncId`** as the primary key in your frontend state management

### 🟡 Important
4. **Soft deletes**: Deleted items have `isDeleted: true`, not removed from DB
5. **Version numbers**: Auto-increment on updates; use for conflict resolution
6. **Timestamps**: Save `timestamp` from sync endpoint for next incremental sync
7. **Filter logic**: Active todos = `isDeleted: false`

### 🟢 Best Practices
8. **Offline queue**: Store create/update/delete actions locally when offline
9. **Sync on reconnect**: Sync when network connection is restored
10. **Optimistic updates**: Update UI immediately, sync in background
11. **Error handling**: Show user-friendly messages for validation errors
12. **UUID validation**: Validate UUID format before API calls

---

## Quick Start Checklist

- [ ] Install `uuid` library
- [ ] Create TypeScript types for Todo
- [ ] Build API client service
- [ ] Implement local storage for offline support
- [ ] Add sync logic (upload pending → download changes)
- [ ] Handle errors gracefully
- [ ] Test all CRUD operations
- [ ] Test sync with multiple devices
- [ ] Verify offline functionality
- [ ] Check conflict resolution

---

## Support & Documentation

- **Swagger UI**: http://localhost:3000/api-docs
- **Base URL**: http://localhost:3000/api
- **Postman Collection**: `postman/todos_collection.json`
- **README**: [README.md](./README.md)

---

**Last Updated**: 2026-01-30  
**Maintained By**: Todo API Team
