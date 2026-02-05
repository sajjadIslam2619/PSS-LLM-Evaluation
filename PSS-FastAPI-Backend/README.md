# PSS FastAPI Backend

Backend for the Peer Support System (PSS) LLM Evaluation app.

- **Development**: SQLite database (default).
- **Production**: Set `DATABASE_URL` to a PostgreSQL connection string.

## Setup

### 1. Create virtual environment and install dependencies

```bash
cd PSS-FastAPI-Backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Create database tables

```bash
python -m init_db
```

This creates `pss.db` (SQLite) with tables:
- `user_response` - responses to Reddit posts
- `create_own_post_response` - responses to user-created posts
- `user_feedback` - user feedback/ratings

### 3. Run the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

## Environment variables

| Variable            | Default              | Description                                              |
|---------------------|----------------------|----------------------------------------------------------|
| `DATABASE_URL`      | `sqlite:///./pss.db` | DB URL. Use PostgreSQL URL in prod.                      |
| `SECRET_KEY`        | (dev default)        | JWT secret. **Set in production.**                      |
| `DEBUG`             | `true`               | Set `false` in production.                              |
| `CORS_ORIGINS`      | (local frontend)     | Comma-separated origins if needed.                      |
| `HUGGINGFACE_TOKEN` | (none)               | Optional. Used when loading the model (gated models or faster Hub downloads). |

### Detect-labels (Create your own post)

The **Create your own post** page uses the [multiMentalRoBERTA-6-class](https://huggingface.co/SajjadIslam/multiMentalRoBERTA-6-class) model. The model runs **locally** with `transformers` (no Hugging Face Inference API). The first request may be slow while the model downloads and loads; later requests are fast. `HUGGINGFACE_TOKEN` in `.env` is optional (for gated models or to avoid rate limits when downloading).

## Production (PostgreSQL)

1. Set `DATABASE_URL` to your PostgreSQL URL, e.g.:

   ```bash
   export DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

2. Create tables (and optionally seed):

   ```bash
   python -m init_db
   ```

3. Run with uvicorn (or your ASGI server):

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Authentication
- `POST /auth/login` – Login with name/email and common password
  - Body: `{ "username": "name/email", "password": "demo123" }`
  - Returns: `{ "token": "jwt..." }`

### Posts
- `GET /posts/reddit` – Get the 5 Reddit posts from `data/redditPosts.json`
  - Returns: `{ "posts": [...] }`

- `POST /posts/detect-labels` – Get AI-detected mental state labels (model runs locally)
  - Body: `{ "post_content": "..." }`
  - Returns: `{ "labels": [ { "name": "Stress", "percentage": 85 }, ... ] }`

- `POST /posts/generate-response` – Generate an AI response for post content (dummy implementation; later OpenAI)
  - Body: `{ "post_content": "..." }`
  - Returns: `{ "response": "..." }`

### Responses
- `POST /responses` – Save user response to a Reddit post
  - Body: `{ "user_identifier": "...", "post_id": 1, "ai_generated_response": "...", "empathy": "...", "relevant": "...", "safe": "...", "modified_response": "...", "mental_status": "..." }`
  - Returns: Created response object

- `POST /create-own-post` – Save response to user's own post
  - Body: `{ "user_identifier": "...", "post_content": "...", "ai_generated_response": "...", "empathy": "...", "relevant": "...", "safe": "...", "modified_response": "...", "ai_mental_status": "...", "mental_status": "..." }`
  - Returns: Created response object

- `POST /feedback` – Save user feedback
  - Body: `{ "user_identifier": "...", "rate": 5, "comment": "..." }`
  - Returns: Created feedback object

### Health
- `GET /health` – Health check

## Notes

- **Common Password**: All users log in with password `demo123` (no user table).
- **User Identifier**: Use name or email as `user_identifier` in requests.
- **Mental Status**: Comma-separated labels (e.g., `"Stress,Anxiety"`).
