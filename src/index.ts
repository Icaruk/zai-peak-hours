import type { TuiPluginApi, TuiPluginMeta } from '../node_modules/@opencode-ai/plugin/dist/tui';
import type { PluginOptions } from '@opencode-ai/plugin';
import { getPeakHoursStatus, formatPeakHoursMessage } from './peak-hours';
import { DEFAULT_CONFIG, type PluginConfig } from './config';
import * as fs from 'fs';
import * as path from 'path';

let timerId: NodeJS.Timeout | null = null;
let pluginLoaded = false;
let configCache: PluginConfig | null = null;

function getConfigPath(): string {
  const configDir = process.env.XDG_CONFIG_HOME 
    ? path.join(process.env.XDG_CONFIG_HOME, 'opencode')
    : path.join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'opencode');
  return path.join(configDir, 'peak-hours.json');
}

function loadConfig(): PluginConfig {
  if (configCache) {
    return configCache;
  }

  const configPath = getConfigPath();

  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const userConfig = JSON.parse(configContent);
      configCache = {
        enabled: userConfig.enabled !== undefined ? userConfig.enabled : DEFAULT_CONFIG.enabled,
        updateIntervalMinutes: userConfig.updateIntervalMinutes !== undefined ? userConfig.updateIntervalMinutes : DEFAULT_CONFIG.updateIntervalMinutes
      };
      return configCache;
    } catch (error) {
      console.error('Error loading peak-hours config:', error);
    }
  }

  configCache = DEFAULT_CONFIG;
  return configCache;
}

function showPeakHoursToast(api: TuiPluginApi): void {
  const config = loadConfig();
  
  if (!config.enabled) {
    api.ui.toast({
      message: 'Peak Hours plugin is disabled in config',
      duration: 3000
    });
    return;
  }

  const status = getPeakHoursStatus();
  const message = formatPeakHoursMessage(status);
  
  api.ui.toast({
    message,
    duration: 5000
  });
}

function showDiagnostics(api: TuiPluginApi): void {
  const config = loadConfig();
  const status = getPeakHoursStatus();
  const currentTime = new Date().toISOString();
  
  const diagnostics = [
    '=== Peak Hours Plugin Diagnostics ===',
    `Plugin loaded: ${pluginLoaded}`,
    `Plugin enabled: ${config.enabled}`,
    `Update interval: ${config.updateIntervalMinutes} minutes`,
    `Current time: ${currentTime}`,
    `In peak hours: ${status.inPeakHours}`,
    `Time until ${status.transitionType}: ${status.timeUntilTransition}`,
    `====================================`
  ].join('\n');
  
  api.ui.toast({
    message: diagnostics,
    duration: 8000
  });
}

async function tui(api: TuiPluginApi, options: PluginOptions | undefined, meta: TuiPluginMeta): Promise<void> {
  pluginLoaded = true;
  const config = loadConfig();
  const updateInterval = config.updateIntervalMinutes * 60 * 1000; // Convert minutes to milliseconds
  
  // Show plugin loaded message
  api.ui.toast({
    message: 'Peak Hours Plugin loaded successfully',
    duration: 3000
  });
  
  try {
    const commands = [
      {
        title: 'Show Peak Hours Status',
        value: 'peak_hours',
        description: 'Display current peak hours status and time until next transition',
        category: 'Utilities',
        slash: {
          name: 'peak_hours'
        },
        onSelect: () => {
          showPeakHoursToast(api);
        }
      },
      {
        title: 'Show Peak Hours Diagnostics',
        value: 'peak_hours_status',
        description: 'Display plugin diagnostics and configuration status',
        category: 'Utilities',
        slash: {
          name: 'peak_hours_status'
        },
        onSelect: () => {
          showDiagnostics(api);
        }
      }
    ];
    
    api.command.register(() => commands);
  } catch (error) {
    api.ui.toast({
      message: `Error registering peak_hours commands: ${error}`,
      duration: 5000
    });
  }
  
  if (!config.enabled) {
    return;
  }

  const unsubscribe = api.event.on('session.created', () => {
    showPeakHoursToast(api);
    
    timerId = setInterval(() => {
      showPeakHoursToast(api);
    }, updateInterval);
  });

  api.lifecycle.onDispose(() => {
    unsubscribe();
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    pluginLoaded = false;
  });
}

const plugin = {
  id: "icaruk.peak-hours",
  tui
};

export default plugin;