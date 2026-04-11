# @icaruk/zai-peak-hours

OpenCode TUI plugin that displays z.ai peak hours information with automatic timezone detection via toast notifications.

## Installation

Add to your `~/.config/opencode/tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["@icaruk/zai-peak-hours"]
}
```

## Features

- 🌍 Automatic timezone detection (UTC+8 / Asia/Shanghai)
- ⏰ Real-time peak hours status (14:00-18:00 UTC+8)
- 📊 Time remaining until next peak/off-peak transition
- 🔔 Toast notifications on session start and periodic updates
- ⚙️ Configurable update interval
- 🛠️ Manual commands for on-demand status checks

## Commands

- `/peak_hours` - Display current peak hours status
- `/peak_hours_status` - Display plugin diagnostics and configuration

## Messages

The plugin displays toast notifications:

**Peak Hours:**
```
Currently in peak hours. X hours Y minutes remaining
```

**Off-Peak Hours:**
```
Currently in off-peak hours. X hours Y minutes remaining
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

Add local config in `tui.json`

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    "D:/Dev/zai-peak-hours/dist/index.js"
  ]
}
```

## npm package

https://www.npmjs.com/package/@icaruk/zai-peak-hours

## License

MIT
