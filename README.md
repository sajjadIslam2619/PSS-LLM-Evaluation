# PSS LLM Evaluation

A web app for evaluating LLM-generated responses in a **Peer Support System (PSS)**. Participants read mental-health-related social media posts, review an AI-generated supportive reply, rate it on empathy, relevance and safety, and optionally edit it. They can also write their own post and see which mental states an AI classifier detects in it.

## Features

- **Reddit post evaluation**: participants work through a fixed set of Reddit posts (`PSS-FastAPI-Backend/data/redditPosts.json`). For each one they see an AI-generated response, rate it, edit it if they want, and pick the mental status labels they think apply.
- **Create your own post**: participants write a post. A local [multiMentalRoBERTA-6-class](https://huggingface.co/SajjadIslam/multiMentalRoBERTA-6-class) model shows the top two detected mental states, and Azure OpenAI generates a response for them to rate.
- **Feedback**: participants give an overall rating and comment at the end.
- **Fallback responses**: if Azure OpenAI isn't configured or fails, the backend returns the curated `default-response` from `redditPosts.json` for that post.

## Architecture

| Part | Location | Stack |
| --- | --- | --- |
| Frontend | `PSS-React-Frontend/` | React 18, TypeScript, Vite, React Router |
| Backend | `PSS-FastAPI-Backend/` | FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod) |
| Label detection | backend, runs locally | Hugging Face `transformers` + PyTorch |
| Response generation | backend | Azure OpenAI (GPT-4.1 deployment by default) |

The frontend is deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main` that touches `PSS-React-Frontend/`.

## Prerequisites

- Python 3.10+
- Node.js 20+ and npm
- Optional: an Azure OpenAI resource, needed for live AI responses
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
- Azure config check: http://localhost:8000/health/config

### 2. Frontend

```bash
cd PSS-React-Frontend
npm install
npm run dev
```

Open **http://localhost:5173/PSS-LLM-Evaluation/**. The `/PSS-LLM-Evaluation/` path comes from the `base` setting in `vite.config.ts`, which is required for GitHub Pages.

### 3. Log in

Enter any name or email as the username, with the shared password **`demo123`**. There are no individual user accounts. The name or email you enter is stored with each response as `user_identifier`.

## Configuration

### Backend (`PSS-FastAPI-Backend/.env`)

Copy `.env.example` to `.env` and set the values you need. Real environment variables take precedence over `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./pss.db` | Database connection. Use a PostgreSQL URL in production. |
| `SECRET_KEY` | dev default | JWT signing secret. **Set this in production.** |
| `DEBUG` | `true` | Set to `false` in production. |
| `CORS_ORIGINS` | `http://localhost:5173`, `http://127.0.0.1:5173` | Allowed frontend origins. |
| `HUGGINGFACE_TOKEN` | none | Optional token for downloading the classifier model. |
| `AZURE_OPENAI_ENDPOINT` | none | Azure OpenAI endpoint URL. |
| `AZURE_OPENAI_API_KEY` | none | Azure OpenAI API key. |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4.1` | Deployment name to call. |
| `AZURE_OPENAI_API_VERSION` | `2024-12-01-preview` | Azure OpenAI API version. |

The classifier model downloads the first time someone uses "Create your own post", so that first request can take a while. Later requests are fast.

### Frontend

The frontend reads `VITE_API_BASE_URL` and defaults to `http://localhost:8000`. To point it at a different backend, create `PSS-React-Frontend/.env.local`:

```
VITE_API_BASE_URL=https://your-backend.example.com
```

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Log in with `{ username, password }`; returns `{ token }`. |
| `GET` | `/posts/reddit` | Returns the Reddit posts to evaluate. |
| `POST` | `/posts/detect-labels` | Returns the top two detected mental-state labels for `{ post_content }`. |
| `POST` | `/posts/generate-response` | Returns an Azure OpenAI response for `{ post_content, post_id? }`. |
| `POST` | `/responses` | Saves a participant's evaluation of a Reddit post. |
| `POST` | `/create-own-post` | Saves a participant's evaluation of their own post. |
| `POST` | `/feedback` | Saves overall feedback `{ user_identifier, rate, comment }`. |
| `GET` | `/health` | Health check. |

See http://localhost:8000/docs for the full request and response schemas.

## Data

Responses are stored in three tables:

- `user_response`: evaluations of Reddit posts
- `create_own_post_response`: evaluations of participant-written posts
- `user_feedback`: overall ratings and comments

In development these live in `PSS-FastAPI-Backend/pss.db`. You can open that file with the `sqlite3` CLI or [DB Browser for SQLite](https://sqlitebrowser.org/). [`RUN.md`](RUN.md) has example queries.

## Building for production

**Frontend**

```bash
cd PSS-React-Frontend
npm run build      # output in dist/
npm run preview    # serve the build locally
```

**Backend**: set `DATABASE_URL`, `SECRET_KEY`, the Azure OpenAI variables and `CORS_ORIGINS` (including your deployed frontend origin) in the environment. Then:

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
│   ├── routers/                   # auth, posts, responses, create_own_post, feedback
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
- **"Something went wrong calling the AI API"**: Azure OpenAI isn't configured. Check http://localhost:8000/health/config.
- **CORS errors in the browser**: make sure the frontend's origin is listed in `CORS_ORIGINS`.

## License

Licensed under the [Apache License 2.0](LICENSE).
