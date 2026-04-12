import type { Plugin } from '@opencode-ai/plugin';
import { getPeakHoursStatus, formatPeakHoursMessage, type PeakHoursStatus } from './utils.js';
import { DEFAULT_CONFIG, type PluginConfig } from './config.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Types for hooks
interface PluginConfigInput {
  command?: Record<string, { template: string; description: string }>;
}

interface CommandExecuteInput {
  command: string;
  sessionID: string;
}

interface OpencodeClient {
  session: {
    prompt: (params: {
      path: { id: string };
      body: {
        noReply?: boolean;
        parts: Array<{ type: 'text'; text: string; ignored?: boolean }>;
      };
    }) => Promise<unknown>;
  };
}

// Command-handled sentinel
const COMMAND_HANDLED_SENTINEL = '__PEAK_HOURS_COMMAND_HANDLED__' as const;

function handled(): never {
  throw new Error(COMMAND_HANDLED_SENTINEL);
}

function getConfigPath(): string {
  const configDir = process.env.XDG_CONFIG_HOME
    ? path.join(process.env.XDG_CONFIG_HOME, 'opencode')
    : path.join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'opencode');
  return path.join(configDir, 'peak-hours.json');
}

function loadConfig(): PluginConfig {
  const configPath = getConfigPath();

  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const userConfig = JSON.parse(configContent);
      return {
        enabled: userConfig.enabled !== undefined ? userConfig.enabled : DEFAULT_CONFIG.enabled,
      };
    } catch (error) {
      console.error('Error loading peak-hours config:', error);
    }
  }

  return DEFAULT_CONFIG;
}

function renderCommandHeading(title: string): string {
  return `${title}\n${'='.repeat(title.length)}`;
}

function renderStatusReport(status: PeakHoursStatus, config: PluginConfig): string {
  const currentTime = new Date().toISOString();
  const lines = [
    renderCommandHeading('Peak Hours Status'),
    '',
    'Configuration:',
    `- enabled: ${config.enabled}`,
    '',
    'Current Status:',
    `- current_time: ${currentTime}`,
    `- in_peak_hours: ${status.inPeakHours}`,
    `- transition: ${status.transitionType}`,
    `- time_until_${status.transitionType}: ${status.timeUntilTransition}`,
    '',
    'Peak Hours (UTC+8):',
    `- start: 14:00`,
    `- end: 18:00`,
  ];
  return lines.join('\n');
}

export const PeakHours: Plugin = async ({ client }) => {
  const config = loadConfig();
  const typedClient = client as unknown as OpencodeClient;

  async function injectRawOutput(sessionID: string, output: string): Promise<void> {
    try {
      await typedClient.session.prompt({
        path: { id: sessionID },
        body: {
          noReply: true,
          parts: [{ type: 'text', text: output, ignored: true }],
        },
      });
    } catch (err) {
      console.error('Failed to inject output:', err);
    }
  }

  async function injectCommandOutputAndHandle(sessionID: string, output?: string | null): Promise<never> {
    if (output !== undefined && output !== null) {
      await injectRawOutput(sessionID, output);
    }
    handled();
  }

  async function handlePeakHoursSlashCommand(input: CommandExecuteInput): Promise<never> {
    if (!config.enabled) {
      return await injectCommandOutputAndHandle(input.sessionID, 'Peak Hours plugin is disabled');
    }

    const status = getPeakHoursStatus();
    const output = formatPeakHoursMessage(status);
    return await injectCommandOutputAndHandle(input.sessionID, output);
  }

  async function handlePeakHoursStatusSlashCommand(input: CommandExecuteInput): Promise<never> {
    if (!config.enabled) {
      return await injectCommandOutputAndHandle(input.sessionID, 'Peak Hours plugin is disabled');
    }

    const status = getPeakHoursStatus();
    const output = renderStatusReport(status, config);
    return await injectCommandOutputAndHandle(input.sessionID, output);
  }

  return {
    // Register built-in slash commands
    config: async (input: unknown) => {
      const cfg = input as PluginConfigInput;
      cfg.command ??= {};
      cfg.command['peak_hours'] = {
        template: '/peak_hours',
        description: 'Display current z.ai peak hours status and time until next transition',
      };
      cfg.command['peak_hours_status'] = {
        template: '/peak_hours_status',
        description: 'Display peak hours plugin diagnostics and configuration status',
      };
    },

    // Intercept slash commands and handle them without LLM invocation
    'command.execute.before': async (input: CommandExecuteInput) => {
      try {
        const cmd = input.command;

        if (cmd === 'peak_hours') {
          return await handlePeakHoursSlashCommand(input);
        }

        if (cmd === 'peak_hours_status') {
          return await handlePeakHoursStatusSlashCommand(input);
        }
      } catch (err) {
        // IMPORTANT: do not swallow command-handled sentinel errors.
        // If this hook resolves, the command proceeds to the LLM.
        throw err;
      }
    },
  };
};
