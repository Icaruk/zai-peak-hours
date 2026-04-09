import type { TuiPluginApi, TuiPluginMeta } from '../node_modules/@opencode-ai/plugin/dist/tui';
import type { PluginOptions } from '@opencode-ai/plugin';
import { getPeakHoursStatus, formatPeakHoursMessage } from './peak-hours';
import { DEFAULT_CONFIG } from './config';

let timerId: NodeJS.Timeout | null = null;
let pluginLoaded = false;

function showPeakHoursToast(api: TuiPluginApi): void {
  const tuiConfig = api.tuiConfig;
  const peakHoursConfig = (tuiConfig as any).peakHours || {};
  const enabled = peakHoursConfig.enabled !== undefined ? peakHoursConfig.enabled : DEFAULT_CONFIG.enabled;
  
  if (!enabled) {
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
  const tuiConfig = api.tuiConfig;
  const peakHoursConfig = (tuiConfig as any).peakHours || {};
  const enabled = peakHoursConfig.enabled !== undefined ? peakHoursConfig.enabled : DEFAULT_CONFIG.enabled;
  const updateIntervalMinutes = peakHoursConfig.updateIntervalMinutes !== undefined ? peakHoursConfig.updateIntervalMinutes : DEFAULT_CONFIG.updateIntervalMinutes;
  
  const status = getPeakHoursStatus();
  const currentTime = new Date().toISOString();
  
  const diagnostics = [
    '=== Peak Hours Plugin Diagnostics ===',
    `Plugin loaded: ${pluginLoaded}`,
    `Plugin enabled: ${enabled}`,
    `Update interval: ${updateIntervalMinutes} minutes`,
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

export async function tui(api: TuiPluginApi, options: PluginOptions | undefined, meta: TuiPluginMeta): Promise<void> {
  pluginLoaded = true;
  
  const tuiConfig = api.tuiConfig;
  const peakHoursConfig = (tuiConfig as any).peakHours || {};
  const enabled = peakHoursConfig.enabled !== undefined ? peakHoursConfig.enabled : DEFAULT_CONFIG.enabled;
  const updateIntervalMinutes = peakHoursConfig.updateIntervalMinutes !== undefined ? peakHoursConfig.updateIntervalMinutes : DEFAULT_CONFIG.updateIntervalMinutes;
  const updateInterval = updateIntervalMinutes * 60 * 1000; // Convert minutes to milliseconds
  
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
  
  if (!enabled) {
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