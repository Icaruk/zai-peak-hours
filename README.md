# @icaruk/zai-peak-hours

OpenCode plugin that displays z.ai peak hours information with automatic timezone detection.

https://docs.z.ai/devpack/overview#usage-instruction#:~:text=peak%20hours%20are

## Features

- 🌍 Automatic timezone detection (UTC+8 / Asia/Shanghai)
- ⏰ Real-time peak hours status (14:00-18:00 UTC+8)
- 📊 Time remaining until next peak/off-peak transition
- 💬 Zero-token slash commands (`/peak_hours`) - no LLM invocation

## Installation

Add to your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["@icaruk/zai-peak-hours"]
}
```

Restart OpenCode to load the plugin.

## Commands

Commands are automatically available after plugin installation:

- `/peak_hours` - Display current peak hours status

This command executes locally without invoking LLM (zero token usage) via `command.execute.before` hook.

## Configuration

Optional configuration file at `~/.config/opencode/peak-hours.json`:

```json
{
  "enabled": true
}
```

## Development

```bash
# Clone
git clone https://github.com/Icaruk/zai-peak-hours.git
cd zai-peak-hours

# Install
npm install

# Build
npm run build

# Watch
npm run dev
```

Add local config in `opencode.json`:

```json
{
  "plugin": [
    "file:///D:/Dev/zai-peak-hours/dist/index.js"
  ]
}
```

## npm package

https://www.npmjs.com/package/@icaruk/zai-peak-hours

## License

MIT
