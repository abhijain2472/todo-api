# Node.js Todo API

A RESTful API for managing Todos, built with Node.js, Express, and MongoDB. Designed with an **offline-first architecture** to support client-side synchronization.

## Features

- **Offline-First Architecture**: Client-generated sync IDs for seamless offline support
- CRUD operations for Todos
- Soft deletion with tombstoning (isDeleted flag)
- Conflict resolution via version tracking
- Synchronization endpoint for incremental updates
- MongoDB integration using Mongoose
- OpenAPI (Swagger) Documentation
- Postman Collection included

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (installed locally or a cloud instance)

## Getting Started

### Installation

1. Clone the repository (if applicable)
2. Install dependencies:

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/todos
```

Replace `MONGO_URI` with your connection string if different.

### Running the Application

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on port 3000 (or the port specified in `.env`).

## Offline-First Architecture

### Dual-ID Structure

This API uses a **dual-identifier** approach to support offline-first applications:

- **`_id`** (ObjectId): MongoDB's internal identifier, used only for database operations. **Never exposed in API responses.**
- **`syncId`** (String): Client-generated UUID (v4 recommended) that serves as the primary sync identifier across devices.

### Why syncId?

In offline-first applications, clients must be able to create records while offline. If the server generated IDs, clients couldn't reference those records until they sync. By using client-generated `syncId`s:

- Clients can create todos offline and immediately reference them
- Multiple devices can sync without ID conflicts
- The same `syncId` identifies a todo across all devices

### Client Requirements

**Before creating a todo**, clients must:

1. Generate a UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)
2. Include it as `syncId` in the request body
3. Store and reference todos using `syncId`, never `_id`

## Todo Schema

```javascript
{
  "syncId": "550e8400-e29b-41d4-a716-446655440000",  // Client-generated UUID (required, unique)
  "title": "Buy groceries",                           // Todo title (required)
  "description": "Milk, eggs, bread",                 // Optional description
  "isCompleted": false,                               // Completion status (default: false)
  "isDeleted": false,                                 // Soft deletion flag (default: false)
  "version": 1,                                       // Version number for conflict resolution
  "createdAt": "2024-01-30T12:00:00.000Z",           // Auto-generated timestamp
  "updatedAt": "2024-01-30T12:00:00.000Z"            // Auto-updated timestamp
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `syncId` | String | Yes | Client-generated UUID v4 for sync |
| `title` | String | Yes | Todo title |
| `description` | String | No | Optional description (default: empty string) |
| `isCompleted` | Boolean | No | Completion status (default: false) |
| `isDeleted` | Boolean | No | Soft deletion tombstone (default: false) |
| `version` | Number | No | Auto-incremented on updates (default: 1) |
| `createdAt` | DateTime | No | Auto-generated creation timestamp |
| `updatedAt` | DateTime | No | Auto-updated modification timestamp |

## API Endpoints

### Create Todo
```http
POST /api/todos
Content-Type: application/json

{
  "syncId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response (201 Created):**
```json
{
  "syncId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "isCompleted": false,
  "isDeleted": false,
  "version": 1,
  "createdAt": "2024-01-30T12:00:00.000Z",
  "updatedAt": "2024-01-30T12:00:00.000Z"
}
```

### Get Active Todos
```http
GET /api/todos
```

Returns all non-deleted todos (`isDeleted: false`).

### Get Sync Changes
```http
GET /api/todos/sync?since=2024-01-30T00:00:00.000Z
```

Returns all todos (including deleted) modified after the `since` timestamp. Use for incremental sync.

### Update Todo
```http
PATCH /api/todos/:syncId
Content-Type: application/json

{
  "isCompleted": true
}
```

### Soft Delete Todo
```http
DELETE /api/todos/:syncId
```

Sets `isDeleted: true` (tombstoning). The todo remains in the database for sync purposes.

## API Documentation

### Swagger UI

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

### Postman

A Postman collection is available in `postman/todos_collection.json`. Import it into Postman to test all endpoints with example data.

## Project Structure

```
todo-api/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── swagger/         # Swagger configuration
│   └── index.js         # Application entry point
├── postman/             # Postman collection
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## Synchronization Flow

1. **Client creates todo offline**:
   - Generate UUID: `syncId = uuid.v4()`
   - Store locally with `syncId`
   - Queue for sync when online

2. **Client syncs with server**:
   - POST new todos to `/api/todos` with `syncId`
   - GET `/api/todos/sync?since=<last_sync_timestamp>`
   - Merge changes using `version` for conflict resolution

3. **Server handles sync**:
   - Accepts client-generated `syncId`
   - Returns all changes since last sync
   - Increments `version` on every update

## Notes

- **Never use `_id`**: All client operations should use `syncId`
- **UUID generation**: Use UUID v4 for `syncId` (e.g., from `uuid` package)
- **Soft deletes**: Deleted todos have `isDeleted: true` but remain in database
- **Conflict resolution**: Higher `version` number indicates newer data
