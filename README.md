# PSS LLM Evaluation

A web app for evaluating LLM-generated responses in a **Peer Support System (PSS)**. Participants read mental-health-related social media posts, review an AI-generated supportive reply, rate it on empathy, relevance and safety, and optionally edit it. They can also write their own post and see which mental states an AI classifier detects in it.

## Features

- **Reddit post evaluation**: participants work through a fixed set of Reddit posts (`PSS-FastAPI-Backend/data/redditPosts.json`). For each one they see an AI-generated response, rate it, edit it if they want, and pick the mental status labels they think apply.
- **Create your own post**: participants write a post. A local [multiMentalRoBERTA-6-class](https://huggingface.co/SajjadIslam/multiMentalRoBERTA-6-class) model shows the top two detected mental states, and an LLM generates a response for them to rate.
- **Feedback (thank-you page)**: participants answer six optional 1–5 agreement questions about the system and the AI, plus an optional comment.
- **Fallback responses**: if the LLM isn't configured or fails, the backend returns the curated `default-response` from `redditPosts.json` for that post, and the page shows a notice saying the AI model isn't connected.
- **Roles**: participants pick a role at login, and it's saved with every submission.
- **Data export**: researchers can download all saved data as CSV files from a key-protected URL.

## Architecture

| Part | Location | Stack |
| --- | --- | --- |
| Frontend | `PSS-React-Frontend/` | React 18, TypeScript, Vite, React Router |
| Backend | `PSS-FastAPI-Backend/` | FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod) |
| Label detection | backend, runs locally | Hugging Face `transformers` + PyTorch |
| Response generation | backend | Any OpenAI-compatible Chat Completions API (OpenAI, AWS Bedrock, Azure); `gpt-5.5-2026-04-23` by default |

The frontend is deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main` that touches `PSS-React-Frontend/`.

## Prerequisites

- Python 3.10+
- Node.js 20+ and npm
- Optional: an API key for an OpenAI-compatible LLM provider, needed for live AI responses
- Optional: a Hugging Face token, needed for gated models or to avoid download rate limits

## Getting started

Run the backend and frontend in two separate terminals.

### 1. Backend

```bash
cd PSS-FastAPI-Backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# First time only: creates pss.db with the required tables
python -m init_db

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### 2. Frontend

```bash
cd PSS-React-Frontend
npm install
npm run dev
```

Open **http://localhost:5173/PSS-LLM-Evaluation/**. The `/PSS-LLM-Evaluation/` path comes from the `base` setting in `vite.config.ts`, which is required for GitHub Pages.

### 3. Log in

The login page asks for three things:

| Field | What to enter |
| --- | --- |
| Name | The participant's name. It's saved with each submission as `user_identifier`. |
| Password | The shared password set in `COMMON_PASSWORD` (see [Configuration](#configuration)). |
| Role | One of the roles below. It's saved with each submission as `role`. |

There are no individual user accounts. Everyone uses the same password, and participants are identified only by the name they type, so "John" and "John Smith" count as two different participants.

If `COMMON_PASSWORD` isn't set, every login fails with "Invalid password".

**Invite links:** add `user`, `pass` and `role` to the URL to prefill the login form, e.g. `https://sajjadislam2619.github.io/PSS-LLM-Evaluation/?user=Jane%20Doe&pass=<COMMON_PASSWORD>&role=Veteran`. Each value is optional. Encode spaces as `%20` (e.g. `role=Peer%20Support%20Specialist`). `role` must be one of the roles below (case doesn't matter); anything else leaves the role unselected. The participant still clicks **Sign in** and can change any field first. The page removes these values from the address bar once it has read them, but the link itself still contains the password, so send it only to participants.

**Roles:**

- Peer Support Specialist
- Veteran
- Research Team Member
- Admin
- Others

The role list is defined in two places that must match: `USER_ROLES` in `PSS-React-Frontend/src/modules/auth/AuthProvider.tsx` and `UserRole` in `PSS-FastAPI-Backend/schemas/user.py`. The backend rejects any role not in its list. The role doesn't change what a participant sees; it's only recorded for analysis.

## Participant flow

1. **Login** (`/`): name, shared password and role.
2. **Review Reddit posts** (`/home`): for each post, the participant:
   - reads the post and its mental state labels, and selects their own labels if they disagree. The selectable labels are Stress, Depression, PTSD, Suicidal, Anxiety, Substance Use Risk, Social Isolation and None, defined in `PSS-React-Frontend/src/modules/home/labels.json`.
   - clicks **Generate Response with AI** and reads the response
   - rates the response as empathic, relevant and safe, on a scale from Strongly disagree to Strongly agree, with Not applicable as an option
   - optionally writes their own improved response

   Each post is saved when the participant clicks **Next Post**. After the last post they choose **Save and Exit** or **Create your own post**.
3. **Create your own post** (`/create-post`, optional): the participant writes a post. Once it has at least 30 words, the classifier shows the top two detected mental states. The participant then generates, rates and optionally rewrites a response, as on the Reddit posts.
4. **Thank-you page** (`/thank-you`): the participant answers six optional questions on a five-point scale and can add a comment.

### Thank-you page questions

| Question | Saved in column |
| --- | --- |
| It was simple to use this system. | `simple_to_use` |
| Overall, I am satisfied with this system. | `overall_satisfaction` |
| I would trust the AI-generated classification of a Veteran's mental state. | `trust_ai_classification` |
| I would feel comfortable using the AI-generated response as-is in my peer support work. | `comfortable_using_ai_response_as_is` |
| I would feel comfortable using the AI-generated response as a starting draft in my peer support work. | `comfortable_using_ai_response_as_draft` |
| I think using AI technology could make my peer support work more manageable. | `ai_makes_work_manageable` |

Answers are saved as numbers: 1 = Strongly disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly agree. All questions and the comment are optional; unanswered questions are saved as empty (`NULL`). **Submit Feedback** is enabled once at least one question is answered or a comment is written.

The database stores only the numbers, not the question text. The link between each column and its wording is the table above and the `prompt` values in `PSS-React-Frontend/src/modules/thankyou/ThankYouPage.tsx`. If you reword a question during the study, record the date of the change.

## Configuration

### Backend (`PSS-FastAPI-Backend/.env`)

Copy `.env.example` to `.env` and set the values you need. Real environment variables take precedence over `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./pss.db` | Database connection. Use a PostgreSQL URL in production. |
| `SECRET_KEY` | dev default | JWT signing secret. **Set this in production.** |
| `COMMON_PASSWORD` | none | Shared login password for all participants. **Required**; login fails without it. |
| `EXPORT_KEY` | none | Key for downloading data from `/export`. Keep it separate from `COMMON_PASSWORD`. If unset, export is disabled. |
| `DEBUG` | `true` | Set to `false` in production. |
| `HUGGINGFACE_TOKEN` | none | Optional token for downloading the classifier model. |
| `OPENAI_ENDPOINT` | OpenAI (`https://api.openai.com/v1`) | Base URL of an OpenAI-compatible API, e.g. `https://bedrock-runtime.<region>.amazonaws.com/openai/v1` for AWS Bedrock or `https://<resource>.openai.azure.com/openai/v1/` for Azure. |
| `OPENAI_API_KEY` | none | API key for that provider. Without it, the fallback responses are used. |
| `OPENAI_MODEL` | `gpt-5.5-2026-04-23` | Model name (or Azure deployment name) to call. Use a dated snapshot so responses stay consistent across the study. |
| `OPENAI_TEMPERATURE` | none (model default) | Optional sampling temperature. Leave unset for newer models, which reject anything but the default. |

The classifier model downloads the first time someone uses "Create your own post", so that first request can take a while. Later requests are fast.

Allowed frontend origins (CORS) are set in `CORS_ORIGINS` in `config.py`, not in `.env`. They default to `http://localhost:5173` and `http://127.0.0.1:5173`. Add your deployed frontend origin there before deploying.

### Frontend

The frontend reads `VITE_BACKEND_URL` and defaults to `http://localhost:8000`. To point it at a different backend, create `PSS-React-Frontend/.env.local`:

```
VITE_BACKEND_URL=https://your-backend.example.com
```

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Log in with `{ username, password }`; returns `{ token }`. |
| `GET` | `/posts/reddit` | Returns the Reddit posts to evaluate. |
| `POST` | `/posts/detect-labels` | Returns the top two detected mental-state labels for `{ post_content }`. |
| `POST` | `/posts/generate-response` | Returns a response for `{ post_content, post_id? }`, plus `source` (`ai`, `default` or `none`) and the LLM connection status. |
| `POST` | `/responses` | Saves a participant's evaluation of a Reddit post. |
| `POST` | `/create-own-post` | Saves a participant's evaluation of their own post. |
| `POST` | `/feedback` | Saves thank-you page answers `{ user_identifier, role, simple_to_use?, overall_satisfaction?, trust_ai_classification?, comfortable_using_ai_response_as_is?, comfortable_using_ai_response_as_draft?, ai_makes_work_manageable?, comment? }`. |
| `GET` | `/export` | Downloads all data as a zip of CSV files. Requires the export key. |
| `GET` | `/health` | Health check. |
| `GET` | `/health/config` | Shows whether the LLM settings are present and which model is configured, without revealing the key. |

See http://localhost:8000/docs for the full request and response schemas.

## Data

In development, data is stored in SQLite at `PSS-FastAPI-Backend/pss.db`. The file is gitignored because it contains participant data. You can open it with the `sqlite3` CLI or [DB Browser for SQLite](https://sqlitebrowser.org/). [`RUN.md`](RUN.md) has example queries.

### Exporting data

With the backend running, open this URL in a browser:

```
http://localhost:8000/export?key=<EXPORT_KEY>
```

Replace `<EXPORT_KEY>` with the `EXPORT_KEY` value from `PSS-FastAPI-Backend/.env`. When deployed, use your backend's address instead of `http://localhost:8000`.

The download is `pss-data.zip`, which contains:

- `user_response.csv`
- `create_own_post_response.csv`
- `user_feedback.csv`

The files are UTF-8 with a byte-order mark, so special characters display correctly in Excel. Each file has every column of its table, sorted by `id`.

| Status | Meaning |
| --- | --- |
| `403 Invalid export key` | The key is wrong. |
| `503 Export is disabled` | `EXPORT_KEY` isn't set on the server. |

A key in the URL is saved in browser history and server logs. On a deployed server you can send the key in a header instead:

```bash
curl -H "X-Export-Key: <EXPORT_KEY>" -o pss-data.zip https://your-backend.example.com/export
```

Use a long random `EXPORT_KEY` in production, since anyone with it can download all participant data.

### Database utility scripts

Run these from `PSS-FastAPI-Backend` with the backend's Python environment. They always use the database configured for the backend (`DATABASE_URL`, or `pss.db` by default), whatever folder you run them from.

| Command | What it does |
| --- | --- |
| `python scripts/backup_db.py` | Saves a compressed copy of `pss.db` to `backups/pss-YYYYmmdd-HHMMSS.db.gz` and keeps the newest 10, deleting older backups. Safe to run while the backend is running. Options: `--dest <folder>`, `--keep <n>`. |
| `python scripts/db_stats.py` | Shows rows per table, participants by role, and how many participants finished all Reddit posts, created a post and submitted feedback. Read-only. Add `--participants` for one line per participant. |
| `python scripts/reset_db.py` | Shows row counts, asks you to type `DELETE`, backs up the database, then deletes all rows and keeps the tables. Use it once before the study to clear test data. Stop the backend first. |

**Back up regularly in production.** With SQLite, all study data is in one file. On a Linux server, schedule a daily backup with cron:

```bash
0 3 * * * cd /path/to/PSS-FastAPI-Backend && venv/bin/python scripts/backup_db.py
```

Also copy the `backups/` folder off the server from time to time, for example to S3 or your own computer, since backups on the same disk don't protect against losing the server. `backups/` is gitignored because it contains participant data.

**To restore a backup**, stop the backend, decompress the backup, rename it to `pss.db`, put it in `PSS-FastAPI-Backend/`, and start the backend.

The backup and reset scripts' automatic backup support only SQLite. With PostgreSQL, use `pg_dump` or your provider's automated backups, such as RDS snapshots.

### Database schema

The database has three tables with no foreign keys between them. Each row is one submission, and rows from the same participant share the same `user_identifier`. All tables also have:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key, auto-increment |
| `user_identifier` | VARCHAR(255) | Required, indexed. The name typed at login. |
| `role` | VARCHAR(100) | Role chosen at login. Empty for rows saved before roles were added. |
| `response_date` | DATETIME | Required. Set by the server, in UTC. |

#### `user_response`: evaluations of the Reddit posts

| Column | Type | Notes |
| --- | --- | --- |
| `article_id` | INTEGER | Required. The post's `id` in `redditPosts.json`. |
| `ai_generated_response` | VARCHAR(2000) | The response shown, whether AI-generated or the default. |
| `empathy` | INTEGER | 1 = Strongly disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly agree, 0 = Not applicable |
| `relevant` | INTEGER | Same scale as `empathy` |
| `safe` | INTEGER | Same scale as `empathy` |
| `modified_response` | VARCHAR(2000) | The participant's own rewritten response |
| `mental_status` | VARCHAR(500) | Comma-separated: the labels shown with the post plus the labels the participant selected |

#### `create_own_post_response`: evaluations of participants' own posts

| Column | Type | Notes |
| --- | --- | --- |
| `article_id` | INTEGER | Set to the highest existing `article_id` plus one |
| `post_content` | TEXT | The post the participant wrote |
| `ai_generated_response` | VARCHAR(2000) | The AI response shown |
| `empathy`, `relevant`, `safe` | INTEGER | Same scale as in `user_response` |
| `modified_response` | VARCHAR(2000) | The participant's own rewritten response |
| `ai_mental_status` | VARCHAR(500) | Comma-separated labels detected by the classifier |
| `mental_status` | VARCHAR(500) | Comma-separated labels the participant selected |

#### `user_feedback`: thank-you page answers

| Column | Type | Notes |
| --- | --- | --- |
| `simple_to_use` | INTEGER | 1–5 |
| `overall_satisfaction` | INTEGER | 1–5 |
| `trust_ai_classification` | INTEGER | 1–5 |
| `comfortable_using_ai_response` | INTEGER | 1–5. No longer asked; kept for older data ("…with some modification…"). |
| `comfortable_using_ai_response_as_is` | INTEGER | 1–5 |
| `comfortable_using_ai_response_as_draft` | INTEGER | 1–5 |
| `ai_makes_work_manageable` | INTEGER | 1–5 |
| `rate` | INTEGER | Required. A copy of `overall_satisfaction`, kept for older data; `0` when that question was skipped. |
| `comment` | TEXT | Optional comment |

See [Thank-you page questions](#thank-you-page-questions) for the wording of each question.

#### Notes on the schema

- **Older rows can have empty columns.** The backend adds missing columns to an existing database when it starts. Rows saved before a column existed have no value in it.
- **`mental_status` is used differently in the two evaluation tables.** In `user_response` it combines the shown labels and the participant's selections. In `create_own_post_response` it holds only the participant's selections, and the classifier's labels are in `ai_mental_status`.
- **PostgreSQL enforces the 2,000-character limit on `VARCHAR(2000)` columns.** SQLite ignores it. Before moving to PostgreSQL, consider changing the response columns to `TEXT`.

## Building for production

For the full production setup (GitHub Pages, AWS EC2, HTTPS, the backend service and backups), see [Deployment-Instruction-README.md](Deployment-Instruction-README.md).

**Frontend**

```bash
cd PSS-React-Frontend
npm run build      # output in dist/
npm run preview    # serve the build locally
```

**Backend**: set `DATABASE_URL`, `SECRET_KEY`, `COMMON_PASSWORD`, `EXPORT_KEY` and the `OPENAI_*` variables in the environment. Add your deployed frontend origin to `CORS_ORIGINS` in `config.py`. Then:

```bash
python -m init_db
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Project structure

```
PSS-LLM-Evaluation/
├── .github/workflows/deploy.yml   # GitHub Pages deploy for the frontend
├── PSS-FastAPI-Backend/
│   ├── main.py                    # FastAPI app, CORS, router registration
│   ├── config.py                  # Settings from environment / .env
│   ├── auth.py                    # Shared-password check and JWT
│   ├── database.py, init_db.py    # DB engine and table creation
│   ├── models/                    # SQLAlchemy models
│   ├── schemas/                   # Pydantic schemas
│   ├── routers/                   # auth, posts, responses, create_own_post, feedback, export
│   ├── scripts/                   # Utility scripts and notebooks (not used by the running app)
│   │   ├── backup_db.py           # Compressed, timestamped SQLite backup
│   │   ├── reset_db.py            # Delete all participant data (backs up first)
│   │   ├── db_stats.py            # Study progress summary
│   │   └── classify_reddit_posts.ipynb  # Runs the classifier on redditPosts.json
│   └── data/redditPosts.json      # Posts shown to participants
├── PSS-React-Frontend/
│   ├── vite.config.ts             # base: /PSS-LLM-Evaluation/
│   └── src/
│       ├── router.tsx             # Routes: /, /home, /create-post, /thank-you
│       ├── shared/api.ts          # Backend API client
│       └── modules/               # auth, home, create, thankyou, ...
└── RUN.md                         # Detailed run, database and debugging notes
```

## Troubleshooting

- **"Something went wrong, no mental status detected by AI"**: check the backend terminal for the model loading error. Common causes are no internet access during the first model download or an invalid `HUGGINGFACE_TOKEN`. [`RUN.md`](RUN.md) walks through debugging this step by step.
- **"Something went wrong calling the AI API"**: the LLM isn't configured (`OPENAI_API_KEY` missing). Check http://localhost:8000/health/config.
- **CORS errors in the browser**: make sure the frontend's origin is listed in `CORS_ORIGINS` in `config.py`.
- **"Failed to fetch" on every page**: the frontend can't reach the backend. Check that the backend's port matches `VITE_BACKEND_URL`, which defaults to `http://localhost:8000`.
- **"Invalid password" at login**: `COMMON_PASSWORD` isn't set, or the password doesn't match it.

## License

Licensed under the [Apache License 2.0](LICENSE).
