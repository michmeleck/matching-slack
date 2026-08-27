import "dotenv/config";
import { App } from "@slack/bolt";
import { env, loadValidationConfig } from "./config";
import { validateCsv } from "./validateCsv";
import { createLinearTicket } from "./linear";

const validationConfig = loadValidationConfig();

const app = new App({
  token: env.slackBotToken,
  appToken: env.slackAppToken,
  signingSecret: env.slackSigningSecret,
  socketMode: true,
});

const CSV_EXTENSIONS = [".csv"];

app.event("file_shared", async ({ event, client, logger }) => {
  try {
    const fileInfo = await client.files.info({ file: event.file_id });
    const file = fileInfo.file;
    if (!file) return;

    const channelId = file.channels?.[0] ?? event.channel_id;
    if (channelId !== env.watchedChannelId) return;

    const isCsv = CSV_EXTENSIONS.some((ext) => file.name?.toLowerCase().endsWith(ext));
    if (!isCsv) return;

    const threadTs = file.shares?.public?.[channelId]?.[0]?.ts ?? file.timestamp?.toString();

    if (!file.url_private_download) {
      throw new Error("Slack did not provide a download URL for this file.");
    }

    const response = await fetch(file.url_private_download, {
      headers: { Authorization: `Bearer ${env.slackBotToken}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to download file from Slack: ${response.status} ${response.statusText}`);
    }
    const csvText = await response.text();

    const result = validateCsv(csvText, validationConfig);

    if (!result.valid) {
      const errorList = result.errors.slice(0, 20).map((e) => `• ${e}`).join("\n");
      const overflow = result.errors.length > 20 ? `\n…and ${result.errors.length - 20} more.` : "";
      await client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: `:x: *${file.name}* failed validation (${result.errors.length} issue${result.errors.length === 1 ? "" : "s"}):\n${errorList}${overflow}`,
      });
      return;
    }

    await client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text: `:white_check_mark: *${file.name}* passed validation (${result.rowCount} rows). Creating Linear ticket…`,
    });

    const uploaderId = file.user;
    const uploaderName = uploaderId
      ? (await client.users.info({ user: uploaderId })).user?.real_name ?? uploaderId
      : "unknown";

    const ticket = await createLinearTicket({
      apiKey: env.linearApiKey,
      teamId: env.linearTeamId,
      title: `Process creator list: ${file.name}`,
      description: [
        `Validated CSV uploaded to Slack by ${uploaderName}.`,
        `Rows: ${result.rowCount}`,
        file.permalink ? `Slack file: ${file.permalink}` : undefined,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    await client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text: `:ticket: Created Linear ticket ${ticket.identifier}: ${ticket.url}`,
    });
  } catch (error) {
    logger.error(error);
    try {
      await client.chat.postMessage({
        channel: env.watchedChannelId,
        text: `:warning: Something went wrong processing a file upload: ${(error as Error).message}`,
      });
    } catch {
      // best-effort error report; nothing further to do if this fails too
    }
  }
});

(async () => {
  await app.start();
  console.log("matching-slack bot is running (Socket Mode)");
})();
