import type { TuiPluginApi, TuiPluginMeta } from '../node_modules/@opencode-ai/plugin/dist/tui';
import type { PluginOptions } from '@opencode-ai/plugin';
import { getPeakHoursStatus, formatPeakHoursMessage } from './peak-hours';
import { DEFAULT_CONFIG } from './config';

let timerId: NodeJS.Timeout | null = null;

function showPeakHoursToast(api: TuiPluginApi): void {
  const tuiConfig = api.tuiConfig;
  const peakHoursConfig = (tuiConfig as any).peakHours || {};
  const enabled = peakHoursConfig.enabled !== undefined ? peakHoursConfig.enabled : DEFAULT_CONFIG.enabled;
  
  if (!enabled) {
    return;
  }

  const status = getPeakHoursStatus();
  const message = formatPeakHoursMessage(status);
  
  api.ui.toast({
    message,
    duration: 5000
  });
}

export async function tui(api: TuiPluginApi, options: PluginOptions | undefined, meta: TuiPluginMeta): Promise<void> {
  const tuiConfig = api.tuiConfig;
  const peakHoursConfig = (tuiConfig as any).peakHours || {};
  const enabled = peakHoursConfig.enabled !== undefined ? peakHoursConfig.enabled : DEFAULT_CONFIG.enabled;
  const updateIntervalMinutes = peakHoursConfig.updateIntervalMinutes !== undefined ? peakHoursConfig.updateIntervalMinutes : DEFAULT_CONFIG.updateIntervalMinutes;
  const updateInterval = updateIntervalMinutes * 60 * 1000; // Convert minutes to milliseconds
  
  api.command.register(() => [
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
    }
  ]);
  
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
  });
}