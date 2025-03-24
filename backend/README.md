# POS System Backend

This is the backend API server for the POS System, providing endpoints for staff management and other features.

## Features

- Staff API with banking details and branch location support
- RESTful API architecture
- TypeScript for type safety
- Express.js for robust HTTP server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The server will run on port 5000 by default. You can configure the port through environment variables.

### API Endpoints

#### Staff API

- `GET /api/v1/staff` - Get all staff
- `GET /api/v1/staff/:id` - Get a staff member by ID
- `POST /api/v1/staff` - Create a new staff member
- `PATCH /api/v1/staff/:id` - Update a staff member
- `DELETE /api/v1/staff/:id` - Delete a staff member

### Environment Variables

- `PORT` - Server port (default: 5000)

## Project Structure

```
backend/
├── src/
│   ├── routes/         # API route handlers
│   │   └── staffRoutes.ts
│   ├── server.ts       # Main application entry
│   └── ...
├── dist/               # Compiled JavaScript files
├── scripts/            # Utility scripts
└── ...
``` 