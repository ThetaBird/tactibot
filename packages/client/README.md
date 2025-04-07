# Tacti Discord Bot

A Discord bot frontend for Tacticool game integration, providing various commands and features for game players and clans.

## Overview

This Discord bot connects to a backend service and provides various features for Tacticool players, including:

- Player profile linking and viewing
- Clan management
- Premium features and entitlements
- Metrics and statistics
- Placements and mission management
- Help and support

## Technologies Used

- Node.js
- Discord.js (v14)
- Socket.io and axios for real-time communication w/ backend
- Canvas for image generation
- Axiom for logging
- Environment variables for configuration

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (v6 or higher)
- MongoDB server (for data storage)
- Discord Bot Token (from Discord Developer Portal)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/tacti_frontend.git
   cd tacti_frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   TOKEN=your_discord_bot_token
   BETATOKEN=your_discord_test_bot_token (optional)
   SUDO=your_discord_user_id
   APP_ID=your_discord_application_id
   PUBLIC_KEY=your_discord_public_key
   AXIOMTOKEN=your_axiom_token (for logging)
   ```

4. Start the bot:
   ```
   node app.js
   ```

## Project Structure

- `app.js` - Main application entry point
- `Command.js` - Command registration and management
- `Logic.js` - Core bot logic and interaction handling
- `Log.js` - Logging functionality
- `DeliveryUtil.js` - Utility functions for content delivery
- `subscription.js` - Subscription management
- `/Commands/` - Individual command implementations
- `/Socket/` - Socket.io client implementation
- `/Placements/` - Placement-related functionality
- `/Canvas/` - Canvas image generation
- `/assets/` - Static assets

## Commands

The bot provides several slash commands:

- `/link` - Link your Discord account to your Tacticool profile
- `/view` - View linked user profiles
- `/help` - Get help and information about the bot
- `/premium` - Manage premium settings and entitlements
- `/generate` - Create free placements
- Custom commands for premium users

## Environment and Development

- Production environment is detected by checking NODE_ENV environment variable
- The bot supports different tokens for production and development (TOKEN vs BETATOKEN)

## Socket Communication

The bot communicates with a backend service using Socket.io. The backend is expected to run on `ws://localhost:8080/`. You can customize this in the app.js file.

## Premium Features

The bot includes premium features that are managed through Discord's entitlement system:

- Custom commands
- Special roles
- Clan management
- Enhanced metrics
- Placements and mission tracking

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the [MIT License](LICENSE)

## Support

If you encounter any issues or need help, please open an issue on the GitHub repository or contact the developer.
