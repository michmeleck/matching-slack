import fs from "fs";
import path from "path";

export interface ValidationConfig {
  requiredColumns: string[];
  optionalColumns: string[];
  uniqueColumns: string[];
  maxRows: number;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  slackBotToken: required("SLACK_BOT_TOKEN"),
  slackAppToken: required("SLACK_APP_TOKEN"),
  slackSigningSecret: required("SLACK_SIGNING_SECRET"),
  watchedChannelId: required("SLACK_WATCHED_CHANNEL_ID"),
  linearApiKey: required("LINEAR_API_KEY"),
  linearTeamId: required("LINEAR_TEAM_ID"),
};

export function loadValidationConfig(): ValidationConfig {
  const configPath = path.join(__dirname, "..", "config", "validation.json");
  const raw = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(raw) as ValidationConfig;
}
