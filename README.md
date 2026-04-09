# @icauk/opencode-peak-hours

OpenCode plugin to display peak hours information with automatic timezone detection.

## Features

- 🌍 Automatic timezone detection
- ⏰ Real-time peak hours status (14:00-18:00 UTC+8)
- 📊 Time remaining until next peak/off-peak transition
- 🔔 Toast notifications on session start and every 15 minutes
- ⚙️ Configurable enable/disable and update intervals
- 🎯 Smart message formatting

## Installation

Install the plugin globally for OpenCode:

```bash
npm install -g @icauk/opencode-peak-hours
```

## Configuration

Add the plugin to your OpenCode configuration file (`~/.config/opencode/opencode.jsonc`):

```jsonc
{
  "plugin": [
    "@icaruk/opencode-peak-hours@latest"
  ],
  "peakHours": {
    "enabled": true,
    "updateIntervalMinutes": 15
  }
}
```

### Configuration Options

- `enabled` (boolean, default: `true`) - Enable or disable the plugin
- `updateIntervalMinutes` (number, default: `15`) - Update interval in minutes

## Usage

Once configured, the plugin automatically:

1. Shows a toast message on session start indicating current peak hours status
2. Updates every 15 minutes with time remaining until the next transition
3. Uses your local timezone for accurate time calculations

## Messages

The plugin displays messages in the following format:

**Peak Hours (14:00-18:00 UTC+8):**
```
Currently in peak hours. X hours Y minutes remaining
```

**Off-Peak Hours:**
```
Currently in off-peak hours. X hours Y minutes remaining
```

## Peak Hours Schedule

- **Peak Hours**: 14:00-18:00 UTC+8 (Asia/Shanghai timezone)
- **Off-Peak Hours**: All other times
- **Rate Multipliers**: 3x during peak hours, 2x during off-peak hours

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Files Structure

```
src/
├── index.ts          # Main plugin entry point
├── peak-hours.ts     # Peak hours calculation logic
└── config.ts         # Configuration handling
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.