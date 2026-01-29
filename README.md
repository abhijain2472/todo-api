# Node.js Todo API

A RESTful API for managing Todos, built with Node.js, Express, and MongoDB.

## Features

- CRUD operations for Todos
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

## API Documentation

### Swagger UI

Interactive API documentation is available at:
http://localhost:3000/api-docs

### Postman

A Postman collection is available in `postman/todos_collection.json`. You can import this into Postman to test the API endpoints.

## Project Structure

- `src/config`: Database configuration
- `src/controllers`: Request handlers
- `src/models`: Mongoose models
- `src/routes`: API route definitions
- `src/swagger`: Swagger configuration
- `src/index.js`: Application entry point
