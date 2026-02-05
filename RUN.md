# PSS LLM Evaluation – Run Instructions

## Backend (FastAPI)

**Path:** `PSS-FastAPI-Backend`

### 1. Setup (once)

```bash
cd PSS-FastAPI-Backend
python -m venv venv
```

Activate venv:

- **Windows:** `venv\Scripts\activate`
- **macOS/Linux:** `source venv/bin/activate`

```bash
pip install -r requirements.txt
```

### 2. Create database tables (once)

```bash
python -m init_db
```

Creates `pss.db` with tables: `user_response`, `create_own_post_response`, `user_feedback`.

### 3. Run server

```bash
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Login password: `demo123`

---

## Frontend (React + Vite)

**Path:** `PSS-React-Frontend`

### 1. Install dependencies (once)

```bash
cd PSS-React-Frontend
npm install
```

### 2. Run dev server

```bash
npm run dev
```

- App: http://localhost:5173 (or the port Vite prints)

**Optional:** To use a different API URL, create `.env` in `PSS-React-Frontend`:

```
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Build for production

```bash
cd PSS-React-Frontend
npm install
npm run build
```

- Output: `PSS-React-Frontend/dist/` (static files: HTML, JS, CSS).
- Deploy the contents of `dist/` to any static host (e.g. GitHub Pages, Netlify, or your server’s web root).
- To test the build locally: `npm run preview` (serves `dist/` on port 5173).

### Other commands

| Command | Description |
|--------|-------------|
| `npm run build` | Production build (TypeScript compile + Vite bundle) |
| `npm run preview` | Serve production build (port 5173) |

---

## Backend (production run)

No separate “build” step. Install dependencies and run with uvicorn:

```bash
cd PSS-FastAPI-Backend
python -m venv venv
venv\Scripts\activate   # Windows; on macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m init_db
uvicorn main:app --host 0.0.0.0 --port 8000
```

For production, set `DATABASE_URL`, `SECRET_KEY`, and `HUGGINGFACE_TOKEN` in the environment (not only in `.env`).

---

## Database (SQLite)

**File:** `PSS-FastAPI-Backend/pss.db`

### Using SQLite CLI

```bash
cd PSS-FastAPI-Backend
sqlite3 pss.db
```

**Useful commands inside `sqlite3`:**

```sql
-- List tables
.tables

-- Schema of a table
.schema user_response

-- Count rows
SELECT COUNT(*) FROM user_response;
SELECT COUNT(*) FROM create_own_post_response;
SELECT COUNT(*) FROM user_feedback;

-- Recent Reddit post responses
SELECT id, user_identifier, post_id, response_date, empathy, relevant, safe
FROM user_response
ORDER BY response_date DESC
LIMIT 20;

-- Recent own-post responses
SELECT id, user_identifier, response_date, empathy, relevant, safe
FROM create_own_post_response
ORDER BY response_date DESC
LIMIT 20;

-- Recent feedback
SELECT id, user_identifier, rate, comment, response_date
FROM user_feedback
ORDER BY response_date DESC
LIMIT 20;

-- Exit
.quit
```

### One-off check (Python, from backend dir)

```bash
cd PSS-FastAPI-Backend
python -c "
import sqlite3
conn = sqlite3.connect('pss.db')
cur = conn.cursor()
for t in ['user_response', 'create_own_post_response', 'user_feedback']:
    cur.execute(f'SELECT COUNT(*) FROM {t}')
    print(f'{t}: {cur.fetchone()[0]} rows')
conn.close()
"
```

### GUI

Open `PSS-FastAPI-Backend/pss.db` in [DB Browser for SQLite](https://sqlitebrowser.org/).

---

## Debug: “No mental status detected by AI”

When **Create your own post** shows *Something went wrong, no mental status detected by AI*, use these steps.

### 1. Check backend terminal

With the backend running (`uvicorn main:app --reload --port 8000`), watch the terminal when you type in the post box. You should see one of:

- **`HUGGINGFACE_TOKEN is not set`** → Token is missing (see step 2).
- **`Hugging Face returned 503`** → Model is loading on Hugging Face; wait 20–60 seconds and try again.
- **`Hugging Face returned 401`** → Token is invalid or expired; create a new token.
- **`Hugging Face returned 4xx/5xx`** → Note the status and response snippet in the log.
- **`Request failed: ...`** → Network or timeout; check internet and firewall.

### 2. Set the Hugging Face token

1. Get a token: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) (read access is enough).
2. In `PSS-FastAPI-Backend`, create or edit `.env`:
   ```
   HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxx
   ```
3. Restart the backend (Ctrl+C, then `uvicorn main:app --reload --port 8000` again).

### 3. Test the API directly

From a terminal (replace `YOUR_TOKEN` and run from project root):

```bash
curl -X POST http://localhost:8000/posts/detect-labels ^
  -H "Content-Type: application/json" ^
  -d "{\"post_content\": \"I feel stressed and anxious lately\"}"
```

(On macOS/Linux use `\` for line continuation and `"` for the JSON; on Windows PowerShell use backticks.)

- If you see `"labels": []` and `"error": "Something went wrong..."` → backend is returning the error; check backend logs (step 1).
- If you see `"labels": [...]` with data → API works; the issue may be frontend (e.g. wrong URL or CORS).

### 4. Browser DevTools

Open DevTools (F12) → **Network**. Type in the post box and wait for the request. Click the `detect-labels` request:

- **Status 200** → Check the **Response** tab: does it have `error` or `labels`?
- **Status 4xx/5xx** or **Failed** → Note the status and response; backend may not be reachable or CORS may be blocking.

---

## Quick reference

| Task | Command / Location |
|------|--------------------|
| Backend run | `cd PSS-FastAPI-Backend` → activate venv → `uvicorn main:app --reload --port 8000` |
| Frontend run | `cd PSS-React-Frontend` → `npm run dev` |
| DB file | `PSS-FastAPI-Backend/pss.db` |
| DB shell | `cd PSS-FastAPI-Backend` → `sqlite3 pss.db` |
| Init DB | `cd PSS-FastAPI-Backend` → `python -m init_db` |
