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

### 1. Create the Slack app (needs a workspace admin/owner)

The fastest path is the included manifest — it sets up the scopes and event
subscription in one step:

1. Go to https://api.slack.com/apps → **Create New App** → **From an app manifest**.
2. Pick your workspace, paste in the contents of `slack-app-manifest.yaml`, and create the app.
3. Under **Socket Mode**, turn it on, then generate an app-level token with the
   `connections:write` scope — this is the one thing the manifest can't set up
   for you. Copy it (starts with `xapp-`) → this is `SLACK_APP_TOKEN`.
4. Under **OAuth & Permissions**, click **Install to Workspace**, then copy the
   **Bot User OAuth Token** (starts with `xoxb-`) → this is `SLACK_BOT_TOKEN`.
   The **Signing Secret** under **Basic Information** → this is `SLACK_SIGNING_SECRET`.
5. Invite the bot to the channel it should watch: `/invite @Matching Request Bot`.
6. Get that channel's ID (right-click the channel → **View channel details**,
   ID is at the bottom) → this is `SLACK_WATCHED_CHANNEL_ID`.

### 2. Configure and run

1. Copy `.env.example` to `.env` and fill in the Slack tokens/channel ID from
   above, plus a Linear API key (Linear → Settings → API → Personal API keys).
2. Adjust `config/validation.json` if the CSV format ever changes.
3. Install and run:

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
