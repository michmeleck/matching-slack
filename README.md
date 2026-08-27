# matching-slack

Slack bot for a shared channel: teammates upload a creator CSV, the bot validates its
format in-thread, and on success files a Linear ticket automatically.

Upfluence list creation is intentionally **not** automated here — that step stays manual.

## How it works

1. Listens for `file_shared` events in one Slack channel (Socket Mode — no public
   webhook/inbound URL needed, so it can run anywhere: a small VM, a container, a
   laptop-adjacent always-on host, etc.).
2. Downloads the uploaded `.csv` and validates it against `config/validation.json`
   (required columns, allowed platforms, duplicate/empty checks, row cap).
3. Posts validation results as a threaded reply. On failure, lists every issue found.
4. On success, creates a Linear issue via the Linear API and posts the ticket link
   back in the thread.

## Setup

1. Create a Slack app (https://api.slack.com/apps) with:
   - Socket Mode enabled, and an app-level token with `connections:write` (→ `SLACK_APP_TOKEN`).
   - Bot token scopes: `files:read`, `chat:write`, `users:read`.
   - Event subscriptions: `file_shared`.
   - Install to your workspace and invite the bot to the target channel.
2. Copy `.env.example` to `.env` and fill in Slack + Linear credentials, plus the
   target channel ID.
3. Adjust `config/validation.json` to match your actual CSV format (required
   columns, allowed platform values, etc.).
4. Install and run:

   ```bash
   npm install
   npm run build
   npm start
   ```

   For local development: `npm run dev` (auto-restarts on change).

## Deployment

Because this uses Socket Mode, there's no inbound port to expose — deploy it as a
plain long-running Node process on whatever always-on host you have (a small VM,
a Docker container on your existing infra, Render/Fly/Railway, etc.) and keep it
alive with your usual process manager (systemd, pm2, a container restart policy).

## Validation config

The expected format is a single-column CSV: a header row containing exactly
`email`, followed by one email address per row, with no blank rows or extra
whitespace in between.

`config/validation.json`:

- `requiredColumns` — must be `["email"]`; the header must contain exactly
  this one column.
- `maxRows` — upper bound on row count before the file is rejected.

The validator flags, per row: blank rows, more than one value on a line,
leading/trailing or internal whitespace, an invalid email format, and
duplicate emails.
