# Deployment Instructions

How the PSS LLM Evaluation app is deployed:

| Part | Where it runs | URL |
| --- | --- | --- |
| Frontend (React + Vite) | GitHub Pages | https://sajjadislam2619.github.io/PSS-LLM-Evaluation/ |
| Backend (FastAPI) + database (SQLite) | AWS EC2 (Ubuntu 24.04), behind Caddy for HTTPS | https://<BACKEND_HOST> |

The frontend is a static site that calls the backend over HTTPS. Deploy the backend first, because the frontend build needs the backend's URL.

### Placeholders used in this guide

Replace these with the values for your server:

| Placeholder | Meaning | Example |
| --- | --- | --- |
| `<ELASTIC_IP>` | The server's Elastic IP (section 2.3) | `203.0.113.10` |
| `<BACKEND_HOST>` | The backend hostname: the Elastic IP with dashes + `.sslip.io`, or your own domain | `203-0-113-10.sslip.io` |
| `C:\path\to\your-key.pem` | The key pair file downloaded when launching the instance (section 2.2) | |

The backend URL is `https://<BACKEND_HOST>`. If the server moves, the URL changes: update the Caddyfile (2.5 g) and the `VITE_BACKEND_URL` variable (section 1).

---

## 1. Frontend: GitHub Pages

The workflow `.github/workflows/deploy.yml` builds `PSS-React-Frontend/` and publishes it to GitHub Pages. It runs automatically on every push to `main` that changes `PSS-React-Frontend/**` or the workflow file, and can also be started by hand from the **Actions** tab ("Run workflow").

### `VITE_BACKEND_URL`

The frontend reads the backend address from `VITE_BACKEND_URL` **at build time**. Vite replaces `import.meta.env.VITE_BACKEND_URL` in `src/shared/api.ts` with the real value while building, so it must be set before the build, not on a server.

- The `VITE_` prefix is required. Vite only includes variables that start with `VITE_` in the frontend bundle, so secrets can't leak into it by accident.
- The value is public (it ends up in the JavaScript participants download). Never put API keys or passwords in a `VITE_` variable.
- If it isn't set, the app falls back to `http://localhost:8000`, which only works for local development.

### One-time setup

1. In the GitHub repo, open **Settings > Pages** and set **Source** to **GitHub Actions**.
2. Open **Settings > Secrets and variables > Actions > Variables** and click **New repository variable**:
   - Name: `VITE_BACKEND_URL`
   - Value: `https://<BACKEND_HOST>`
   - Use `https://` (GitHub Pages is HTTPS, and browsers block calls to an `http://` backend) and no trailing slash.
3. Re-run the latest "Deploy Vite app" workflow from the **Actions** tab, or push a frontend change.

The workflow has a check step that fails with a clear error if `VITE_BACKEND_URL` is not set, instead of publishing a site that points at `localhost`.

### If the backend URL changes

Update the `VITE_BACKEND_URL` variable and re-run the workflow. No code change is needed.

### CORS

The backend only accepts browser requests from the origins listed in `CORS_ORIGINS` in `PSS-FastAPI-Backend/config.py`. The GitHub Pages origin `https://sajjadislam2619.github.io` is already included. If the frontend moves to another domain, add that origin (scheme + host, no path, no trailing slash) and redeploy the backend.

### Build locally (optional)

```powershell
cd PSS-React-Frontend
npm install
$env:VITE_BACKEND_URL = "https://<BACKEND_HOST>"
npm run build      # output in dist/
npm run preview    # http://localhost:4173/PSS-LLM-Evaluation/
```

---

## 2. Backend and database: AWS EC2

The backend runs on one EC2 instance:

- **uvicorn** serves the FastAPI app on `127.0.0.1:8000`, managed by **systemd** (service name `pss`).
- **Caddy** listens on ports 80/443, gets a free HTTPS certificate from Let's Encrypt, and forwards requests to uvicorn.
- **SQLite** stores the data in `PSS-FastAPI-Backend/pss.db` on the instance's disk.
- The mental-state classifier (`SajjadIslam/multiMentalRoBERTA-6-class`, RoBERTa-large) is downloaded from Hugging Face on first use and runs on the CPU.
- AI responses come from the OpenAI API.

### 2.1 AWS (EC2) setup

1. Sign in to the AWS Console and choose one region (top right) and keep using it. Resources in other regions don't show up.
2. Recommended: turn on MFA for the root account and create a **Budget** (Billing and Cost Management > Budgets) with an email alert, e.g. $50/month.
3. Open **EC2 > Instances > Launch instance**:

| Setting | Value |
| --- | --- |
| Name | e.g. `pss-backend` |
| AMI | **Ubuntu Server 24.04 LTS**, 64-bit (x86) |
| Instance type | **t3.large** (8 GB RAM), or **t3.medium** (4 GB) with the swap file below |
| Key pair | Create a new key pair (RSA, `.pem`) and download it. See 2.2. |
| Storage | **30 GB gp3** |

4. **Security group** (inbound rules):

| Type | Port | Source | Why |
| --- | --- | --- | --- |
| SSH | 22 | My IP | Your terminal access |
| HTTP | 80 | 0.0.0.0/0 | Caddy needs it to get the HTTPS certificate |
| HTTPS | 443 | 0.0.0.0/0 | The API |

Do **not** open port 8000. uvicorn only listens on `127.0.0.1` and is reached through Caddy.

Why these sizes: the classifier needs about 2.5-3 GB of RAM once loaded, a t3.small (2 GB) runs out of memory. PyTorch plus the model need several GB of disk.

### 2.2 Access from your local machine (`.pem` file)

The key pair file (e.g. `pss-llm-key.pem`) is the only way to log in. Keep it safe and never commit it.

Connect from Windows PowerShell:

```powershell
ssh -o IdentitiesOnly=yes -o ServerAliveInterval=60 -i "C:\path\to\your-key.pem" ubuntu@<ELASTIC_IP>
```

- `ubuntu` is the default user on Ubuntu AMIs.
- `ServerAliveInterval=60` keeps the connection from dropping when idle.
- If SSH says the key's permissions are too open, restrict the file to your Windows user only (right-click > Properties > Security > Advanced: disable inheritance, keep only your user).
- If your home IP changes and SSH times out, update the SSH rule's source to **My IP** in the security group.

After connecting, go to the backend folder:

```bash
cd ~/PSS-LLM-Evaluation/PSS-FastAPI-Backend
```

### 2.3 Elastic IP

A normal EC2 public IP changes every time the instance stops and starts. An Elastic IP stays fixed, so the backend URL never changes.

1. **EC2 > Network & Security > Elastic IPs > Allocate Elastic IP address > Allocate**.
2. Select it, **Actions > Associate Elastic IP address**, pick the instance, **Associate**.

Note the IP. It's `<ELASTIC_IP>` in the rest of this guide.

**Backend hostname:** the free service [sslip.io](https://sslip.io) maps `<ip-with-dashes>.sslip.io` to that IP (e.g. `203.0.113.10` becomes `203-0-113-10.sslip.io`), so the backend is reachable at `https://<BACKEND_HOST>` with no domain purchase. You can use your own domain instead by pointing a DNS A record at the Elastic IP. Caddy uses this name to get the HTTPS certificate.

Costs: an Elastic IP is free while attached to a running instance but billed while the instance is stopped. Release it if the project is shut down.

### 2.4 Environment variables (`.env`)

The backend reads its settings from `PSS-FastAPI-Backend/.env` on the server. This file is git-ignored and must be created by hand. Real environment variables override `.env`.

Generate a random `SECRET_KEY`:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

Create the file:

```bash
cd ~/PSS-LLM-Evaluation/PSS-FastAPI-Backend
nano .env
```

```
DEBUG=false
SECRET_KEY=<generated value>
COMMON_PASSWORD=<participant password>
EXPORT_KEY=<long random secret, different from the password>
OPENAI_API_KEY=<your OpenAI API key>
DATABASE_URL=sqlite:////home/ubuntu/PSS-LLM-Evaluation/PSS-FastAPI-Backend/pss.db
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`) and protect it:

```bash
chmod 600 .env
```

| Variable | Required | Notes |
| --- | --- | --- |
| `DEBUG` | Yes | Must be `false` in production. `true` logs every SQL statement, including participant text. |
| `SECRET_KEY` | Yes | Random value. Never reuse the development default. |
| `COMMON_PASSWORD` | Yes | Shared participant login password. Login fails if unset. Don't use `demo123` (it's in the public git history). |
| `EXPORT_KEY` | Yes | Protects the data export URL. Export is disabled if unset. |
| `OPENAI_API_KEY` | Yes | Without it, participants get the fallback responses from `redditPosts.json`. The OpenAI account needs credits. |
| `DATABASE_URL` | Recommended | Absolute path (four slashes) so the database is always the same file regardless of the working directory. |
| `OPENAI_ENDPOINT` | No | Default is OpenAI (`https://api.openai.com/v1`). Set it for another OpenAI-compatible provider. |
| `OPENAI_MODEL` | No | Default `gpt-5.5-2026-04-23`. Use a dated snapshot so all participants see the same model. |
| `OPENAI_TEMPERATURE` | No | Leave unset. Newer models only accept their default. |
| `HUGGINGFACE_TOKEN` | No | The classifier model is public. |

After editing `.env`, restart the backend: `sudo systemctl restart pss`.

### 2.5 Application setup (run on the server)

All commands below run in the SSH session from 2.2.

**a. System packages and swap**

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-venv python3-pip git caddy

# 4 GB swap (important on t3.medium)
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h && python3 --version     # Swap ~4.0Gi, Python 3.12.x
```

**b. Code and Python dependencies**

```bash
cd ~
git clone https://github.com/sajjadIslam2619/PSS-LLM-Evaluation.git
cd PSS-LLM-Evaluation/PSS-FastAPI-Backend
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install -r requirements.txt
.venv/bin/python -c "import torch, fastapi, transformers, openai; print('OK', torch.__version__)"
```

Install the CPU build of PyTorch **before** `requirements.txt`. The default PyTorch on Linux includes GPU libraries (~2.5 GB) that are useless on EC2 CPU instances. The check should print a version ending in `+cpu`.

**c. Create `.env`** as described in 2.4.

**d. Create the database tables (once)**

```bash
.venv/bin/python -m init_db
```

Expect "Tables created" and "Database initialized". The backend does not create tables on startup, so without this step the first save fails. Re-running it is safe.

**e. Quick manual test**

```bash
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 > /tmp/test.log 2>&1 &
PID=$!; sleep 5
curl -s http://127.0.0.1:8000/health; echo          # {"status":"ok"}
curl -s http://127.0.0.1:8000/health/config; echo   # "llm_ready":true
kill $PID
```

**f. Run the backend as a service**

Running uvicorn by hand stops when the SSH session ends and doesn't come back after a crash or reboot. A systemd service starts it at boot, restarts it after a crash, and keeps its logs.

```bash
sudo tee /etc/systemd/system/pss.service > /dev/null <<'EOF'
[Unit]
Description=PSS FastAPI backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/PSS-LLM-Evaluation/PSS-FastAPI-Backend
ExecStart=/home/ubuntu/PSS-LLM-Evaluation/PSS-FastAPI-Backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now pss
systemctl is-active pss                              # active
curl -s http://127.0.0.1:8000/health; echo          # {"status":"ok"}
```

Keep `--workers 1`: each worker loads its own copy of the classifier, so two workers double the memory use.

**g. HTTPS with Caddy**

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
<BACKEND_HOST> {
    reverse_proxy 127.0.0.1:8000
}
EOF
sudo systemctl restart caddy
sleep 10
curl -s https://<BACKEND_HOST>/health; echo   # {"status":"ok"}
```

Caddy obtains and renews the certificate automatically. Ports 80 and 443 must be open (2.1).

**h. Warm up and verify**

```bash
# AI response (should contain "source":"ai")
curl -s -X POST https://<BACKEND_HOST>/posts/generate-response \
  -H "Content-Type: application/json" \
  -d '{"post_content":"I have been feeling really alone lately.","post_id":1}' | head -c 300; echo

# Classifier: the first call downloads and loads the model (1-3 minutes)
curl -s -m 600 -X POST https://<BACKEND_HOST>/posts/detect-labels \
  -H "Content-Type: application/json" \
  -d '{"post_content":"I feel hopeless and cannot sleep."}'; echo
```

Run the classifier call once after every restart so the first participant doesn't wait for the model to load.

**Service commands**

| Task | Command |
| --- | --- |
| Status | `systemctl status pss` |
| Restart (after `.env` or code changes) | `sudo systemctl restart pss` |
| Stop / start | `sudo systemctl stop pss` / `sudo systemctl start pss` |
| Backend logs | `sudo journalctl -u pss -n 100 --no-pager` |
| Follow logs live | `sudo journalctl -u pss -f` |
| Caddy logs | `sudo journalctl -u caddy -n 50 --no-pager` |
| Memory use | `free -h` |

**Deploying code updates**

After pushing backend changes to `main`:

```bash
cd ~/PSS-LLM-Evaluation && git pull
cd PSS-FastAPI-Backend
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m init_db          # applies any new columns; safe to re-run
sudo systemctl restart pss
curl -s https://<BACKEND_HOST>/health; echo
```

Avoid restarting while participants are in a session. Data already saved is kept, but anything unsaved on their screen may fail to save during the restart.

**Data export**

Open in a browser (keep this URL private):

```
https://<BACKEND_HOST>/export?key=<EXPORT_KEY>
```

It downloads a zip with `user_feedback.csv`, `user_response.csv`, and `create_own_post_response.csv`.

### 2.6 Database backup scheduler

`scripts/backup_db.py` makes a consistent, compressed copy of `pss.db` (safe while the backend is running) as `backups/pss-YYYYmmdd-HHMMSS.db.gz` and keeps the newest 10.

**Schedule a daily backup at 03:00 server time (UTC):**

```bash
cd ~/PSS-LLM-Evaluation/PSS-FastAPI-Backend
mkdir -p backups
(crontab -l 2>/dev/null; echo '0 3 * * * cd /home/ubuntu/PSS-LLM-Evaluation/PSS-FastAPI-Backend && .venv/bin/python scripts/backup_db.py >> backups/cron.log 2>&1') | crontab -
crontab -l
```

**Run one now to test it:**

```bash
.venv/bin/python scripts/backup_db.py && ls -lh backups/
```

**Check it's running:** `tail backups/cron.log` shows one "Backed up ..." line per day.

**Options:** `--keep 30` keeps more copies, `--dest /path` writes elsewhere.

**Copy backups off the server.** Backups on the same disk don't survive losing the instance. Download them regularly from your local PowerShell:

```powershell
scp -o IdentitiesOnly=yes -i "C:\path\to\your-key.pem" "ubuntu@<ELASTIC_IP>:~/PSS-LLM-Evaluation/PSS-FastAPI-Backend/backups/*.db.gz" D:\pss-backups\
```

(For automatic off-site copies, add an S3 bucket and an IAM role on the instance, then `aws s3 sync backups/ s3://<bucket>/pss-backups/` in the same cron job.)

**Restore a backup:**

```bash
cd ~/PSS-LLM-Evaluation/PSS-FastAPI-Backend
sudo systemctl stop pss
cp pss.db pss.db.before-restore
gunzip -c backups/pss-YYYYmmdd-HHMMSS.db.gz > pss.db
sudo systemctl start pss
```

Other database utilities (run from `PSS-FastAPI-Backend`): `.venv/bin/python scripts/db_stats.py` shows row counts, and `.venv/bin/python scripts/reset_db.py` empties the database after taking a backup (asks you to type `DELETE`). Use the reset before real participants start if you tested on the production server.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Frontend deploy fails at "Check API URL is set" | `VITE_BACKEND_URL` repository variable missing | Add it (section 1) and re-run |
| Browser console: "blocked by CORS policy" | Frontend origin not in `CORS_ORIGINS` | Add it in `config.py`, pull and restart on the server |
| "Failed to fetch" on every page | Backend down, or wrong `VITE_BACKEND_URL` | Check `https://<BACKEND_HOST>/health` and the variable |
| `/health` returns 502 | Caddy is up but `pss` is not running | `systemctl status pss`, `sudo journalctl -u pss -n 50` |
| HTTPS doesn't work at all | Ports 80/443 closed, or certificate not issued | Check the security group and `journalctl -u caddy` |
| AI responses show the fallback text | `OPENAI_API_KEY` missing or the OpenAI account is out of credits | Check `/health/config` and `journalctl -u pss` for the OpenAI error |
| Backend crashes when the classifier loads | Out of memory | Check `free -h`, add swap, or use t3.large |
| SSH times out | Your IP changed | Update the SSH rule in the security group to "My IP" |
