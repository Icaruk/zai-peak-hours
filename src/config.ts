export interface PluginConfig {
  enabled: boolean;
  updateIntervalMinutes: number;
}

export const DEFAULT_CONFIG: PluginConfig = {
  enabled: true,
  updateIntervalMinutes: 15 // 15 minutes
};

export function getPluginConfig(config: any): PluginConfig {
  const userConfig = config?.peakHours || {};
  
  return {
    enabled: userConfig.enabled !== undefined ? userConfig.enabled : DEFAULT_CONFIG.enabled,
    updateIntervalMinutes: userConfig.updateIntervalMinutes !== undefined ? userConfig.updateIntervalMinutes : DEFAULT_CONFIG.updateIntervalMinutes
  };
}