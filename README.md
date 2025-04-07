# Tactibot

The open-source release of Tacti - the largest Tacticool discord bot.

After 5 years of developing, maintaining, and growing Tacti into a bot that achieved 100% of market share within the Tacticool Discord community, I have made the difficult decision to put Tacti into EOL on April 3rd, 2025. This bot has been extraordinarily useful for the community and I am honored to be the face behind Tacti. This repository is officially open-source to encourage standalone deployments and to keep the project alive on the internet forever.

[Tacticool Game Studio (Panzerdog) x Tacti endorsement](https://tacticool.game/news/tpost/ajkyej3zy1-tacti-bot-feature-update-amp-giveaway)

> **Note**: If you're planning to self-host this bot or to use the code as inspiration for features into your own bot, please consider starring and forking this repository. Your support encourages further development by others. Code contributions are welcome!

## Project Structure

This monorepo contains two main packages:

1. **Client**: A JavaScript Discord bot client that interacts with users on Discord
2. **Backend**: A TypeScript server that provides metrics and other backend services

## Getting Started

### Prerequisites

- Node.js (version 16.x or higher recommended, below v22)
- pnpm (recommended for workspaces support)

> **Note**: This project uses the `canvas` package which may cause compatibility issues with Node.js v22 or above. It is recommended to use Node.js v21.x or lower.

### Installation

```bash
# Clone the repository
git clone https://github.com/ThetaBird/tactibot.git
cd tactibot

# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies for all packages
pnpm install
```

### Configuration

Both the client and backend require configuration via environment variables:

```
packages/backend/.env
packages/client/.env
```

1. Create your `.env` files with your specific configuration values. Use `.env.example` for guidance on what variables to set.

### Running the Projects

#### Run the Backend

```bash
pnpm run backend:dev    # Development mode
pnpm run backend:build  # Build the TypeScript backend
pnpm run backend:start  # Run the compiled backend
```

#### Run the Client

```bash
pnpm run client:start   # Run the client
pnpm run client:build   # Build the client
```

## Development

Each package can be developed independently:

```bash
# Navigate to a specific package
cd packages/client
# or
cd packages/backend

# Run package-specific commands
pnpm run start
```

## Scripts

- `pnpm run setup` - Copies .env.example files to .env if they don't exist
- `pnpm run build` - Builds all packages
- `pnpm start` - Runs both client and backend

## License

This project is licensed under the MIT License - see the LICENSE file for details.
