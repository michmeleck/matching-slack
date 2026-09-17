# Hosting on Oracle Cloud's Always Free tier

This gives the bot a real, always-on VM at no cost (not a trial credit —
Oracle's "Always Free" resources stay free indefinitely). Socket Mode means
the bot only makes *outbound* connections, so no inbound ports need to be
opened beyond SSH.

## 1. Create the account and instance

1. Sign up at https://www.oracle.com/cloud/free/ (requires a credit card for
   identity verification, but Always Free resources are never billed).
2. In the Console: **Compute** → **Instances** → **Create Instance**.
3. **Image**: Canonical Ubuntu 24.04 (or latest LTS).
4. **Shape**: click "Change shape" → **Ampere (Arm)** → `VM.Standard.A1.Flex`
   → set 1 OCPU / 6 GB memory (comfortably inside the Always Free allowance
   of up to 4 OCPU / 24 GB total — this bot needs almost none of it).
   If A1 capacity isn't available in your region, `VM.Standard.E2.1.Micro`
   (x86, also Always Free) works fine too, just smaller.
5. **Networking**: use the default VCN it offers to create. Leave "Assign a
   public IPv4 address" checked (only needed for you to SSH in).
6. **SSH keys**: let it generate a key pair and download the private key
   (`ssh-key-....key`), or paste your own public key.
7. Create the instance. Note its public IP once it's running.

No changes are needed to the default security list/ingress rules — SSH (22)
is open by default, and that's the only inbound access this needs.

## 2. Connect and install Node

```bash
chmod 600 ~/Downloads/ssh-key-....key
ssh -i ~/Downloads/ssh-key-....key ubuntu@<INSTANCE_PUBLIC_IP>

# On the instance:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
node --version   # confirm v20.x
```

## 3. Deploy the app

```bash
sudo mkdir -p /opt/matching-slack
sudo chown ubuntu:ubuntu /opt/matching-slack
git clone <this repo's URL> /opt/matching-slack
cd /opt/matching-slack
npm install
npm run build
cp .env.example .env
nano .env   # fill in SLACK_BOT_TOKEN, SLACK_APP_TOKEN, SLACK_SIGNING_SECRET,
            # SLACK_WATCHED_CHANNEL_ID, LINEAR_API_KEY
chmod 600 .env
```

## 4. Run it as a service (auto-restart on crash/reboot)

```bash
sudo useradd --system --no-create-home matching-slack || true
sudo chown -R matching-slack:matching-slack /opt/matching-slack

sudo cp deploy/matching-slack.service /etc/systemd/system/matching-slack.service
sudo systemctl daemon-reload
sudo systemctl enable --now matching-slack

# Check it's running and connected to Slack:
sudo systemctl status matching-slack
sudo journalctl -u matching-slack -f
```

You should see `matching-slack bot is running (Socket Mode)` in the logs.

## Updating later

```bash
cd /opt/matching-slack
git pull
npm install
npm run build
sudo systemctl restart matching-slack
```

## Notes

- Everything here runs as the unprivileged `matching-slack` system user, not
  root, and the service file restricts write access to the filesystem
  (`ProtectSystem=full`) as a baseline hardening measure.
- No inbound firewall changes are needed beyond the default SSH access — the
  bot never listens on a port.
