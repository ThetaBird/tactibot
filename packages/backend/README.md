# Tacti Metrics Backend

A TypeScript-based backend service for Tacticool game integration, providing user metrics, clan management, and Discord bot support.

## Overview

The Tacti Metrics backend serves as the core data processing service for the Tacticool game ecosystem. It:

- Operates as a Socket.io server to handle real-time communications
- Manages MongoDB databases for user, clan, and entitlement data
- Interfaces with Tacticool's API endpoints (club.tacticool.game)
- Processes user metrics and clan statistics
- Supports the Discord bot frontend with data services

## Key Features

- **User Management**: Link Discord users to Tacticool accounts
- **Clan Management**: Track clan data, missions, and member activities
- **Role Management**: Sync Discord roles with in-game clan memberships
- **Metrics Processing**: Calculate and provide player/clan performance metrics
- **Premium Features**: Support subscription-based advanced features
- **Real-time Updates**: Socket-based communication for immediate data refresh

## Technologies Used

- TypeScript
- Node.js
- Socket.io for real-time communication
- MongoDB for data storage
- Express for RESTful API endpoints
- Axios for external API requests
- Toad-scheduler for scheduled tasks

## Architecture

The backend follows a modular architecture:

- **Managers**: Handle specific data domains (MongoDB, Players Club, Roles, etc.)
- **Processors**: Process specific types of requests (Links, User IDs, Entitlements)
- **Interfaces**: Define data structures for the entire application
- **Server**: Main entry point for socket and HTTP requests

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables (see `.env.example`)
4. Build and run the server:
   ```
   npm run build
   npm start
   ```

## Development

For development, use:

```
npm run dev
```

## API Endpoints

The backend exposes several RESTful endpoints:

- User information retrieval
- Account linking
- Clan management
- Entitlement verification
- Metrics generation

## Socket Events

The backend supports bi-directional Socket.io communication with events for:

- User data requests
- Link status updates
- Entitlement verification
- Metrics updates
- Role management

## Environment Variables

Copy `.env.example` to `.env` and configure:

- MongoDB connection details
- API keys and endpoints
- Application settings

## License

MIT
