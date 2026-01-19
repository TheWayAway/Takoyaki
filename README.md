# Takoyaki

A Discord bot for logging events with a web-based timeline viewer. Track important dates, milestones, and events through Discord slash commands, then view them on a visual timeline through a password-protected web interface.

## Features

- **Discord Bot Commands** - Add, edit, delete, and list events directly from Discord
- **Web Timeline Viewer** - Browse events on a visual timeline through your browser
- **Password Protection** - Web interface secured with session-based authentication
- **Role-Based Permissions** - Configure which Discord roles can manage events
- **SQLite Database** - Lightweight, file-based storage with no external database required

## Setup

### Prerequisites

- Node.js 18+
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Deploy slash commands to Discord:
   ```bash
   npm run deploy
   ```

4. Start the bot:
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Your Discord bot token |
| `DISCORD_CLIENT_ID` | Your Discord application client ID |
| `WEB_PORT` | Port for the web server (default: 3000) |
| `WEB_PASSWORD` | Password for the web interface |
| `SESSION_SECRET` | Secret key for session encryption (use a random 32+ character string) |
| `PUBLIC_URL` | Public URL where the timeline is accessible |
| `NODE_ENV` | Environment mode (`development` or `production`) |

## Discord Commands

| Command | Description |
|---------|-------------|
| `/addevent` | Add a new event (date, title, optional description) |
| `/editevent` | Edit an existing event by ID |
| `/deleteevent` | Delete an event by ID |
| `/events` | List recent events |
| `/timeline` | Get the link to the web timeline |
| `/config` | Configure allowed roles for event management |

## License

MIT
