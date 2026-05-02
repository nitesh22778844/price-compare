# Price Compare

AI-powered shopping assistant that compares product prices across Indian e-commerce stores (Amazon, Flipkart, Croma, Reliance Digital). Users describe what they're looking for in chat — the assistant calls a tool, queries Salesforce, and renders the top 3 matches per store as a side-by-side comparison table.

> **Repo:** https://github.com/nitesh22778844/price-compare

---

## Architecture

```
User → React chat UI ─────────► FastAPI /api/chat ─────► OpenRouter LLM (tool calling)
                                                              │
                                                              ▼
                                                       returns ProductQuery
                                                              │
                       ◄──── grouped top-3 per source ◄── /api/products/search
                                                              │
                                                              ▼
                                              Salesforce REST API (SOQL on Product__c)
                                              OAuth 2.0 Client Credentials Flow
```

| Layer       | Stack                                                           |
| ----------- | --------------------------------------------------------------- |
| Frontend    | React 18, Vite, TypeScript, Tailwind CSS, lucide-react          |
| Backend     | FastAPI (Python 3.11+), httpx (async), Pydantic v2              |
| LLM         | OpenRouter (configurable model — defaults to `openai/gpt-oss-120b`) |
| Data store  | Salesforce `Product__c` custom object via REST API              |
| Tests       | pytest + respx (BE), Vitest + RTL (FE), Playwright (E2E)        |

---

## Repository layout

```
price-compare/
├── CLAUDE.md             # Detailed spec / source of truth for AI agents
├── README.md             # This file
├── .env.example          # All env vars documented
├── frontend/             # Vite + React app
│   ├── src/
│   │   ├── components/chat/      # ChatWindow, MessageBubble, ChatInput
│   │   ├── components/results/   # ComparisonTable, SourceBadge, RatingStars
│   │   ├── hooks/                # useChat, useProductSearch
│   │   ├── lib/                  # api, types, source-theme, strings
│   │   ├── pages/App.tsx
│   │   └── styles/index.css
│   └── tests/                    # Vitest unit + Playwright e2e
└── backend/              # FastAPI app
    ├── app/
    │   ├── main.py
    │   ├── routers/      # chat.py, products.py
    │   ├── services/     # openrouter.py, salesforce.py, product_search.py
    │   ├── models/       # schemas.py
    │   └── core/         # config.py, logging.py
    └── tests/            # pytest + fixtures/salesforce/*.json
```

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** (`pnpm` recommended — `npm i -g pnpm`)
- A **Salesforce org** (Developer Edition is fine) with:
  - A `Product__c` custom object populated with product rows (fields below).
  - A **Connected App** with **"Enable Client Credentials Flow"** turned on, and a "Run As" user assigned. Capture the consumer key + secret.
- An **OpenRouter API key** (https://openrouter.ai).

### Salesforce `Product__c` schema

Fields the backend reads:

| API name             | Type             |
| -------------------- | ---------------- |
| `title__c`           | Text(255), External ID |
| `source__c`          | Text(100) — e.g. `Amazon`, `Flipkart` |
| `current_price__c`   | Number(16, 2)    |
| `original_price__c`  | Number(16, 2)    |
| `discount__c`        | Percent(18, 0)   |
| `rating__c`          | Text(100)        |
| `review_count__c`    | Number(18, 0)    |
| `rank__c`            | Number(18, 0)    |
| `product_url__c`     | URL(255)         |

`Id` and `Name` are system fields. Other fields on the org (`brand__c`, `image_url__c`, `availability__c`, etc.) exist but are not consumed by the current UI.

---

## Setup

### 1. Clone

```bash
git clone https://github.com/nitesh22778844/price-compare.git
cd price-compare
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in:
#   SF_TOKEN_URL          # https://<your-domain>.my.salesforce.com/services/oauth2/token
#   SF_CLIENT_ID          # Connected App consumer key
#   SF_CLIENT_SECRET      # Connected App consumer secret
#   OPENROUTER_API_KEY    # from openrouter.ai
```

`.env` is gitignored — never commit secrets.

### 3. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -e ".[dev]"
uvicorn app.main:app --reload
# → http://127.0.0.1:8000  (OpenAPI docs at /docs)
```

### 4. Frontend (separate shell)

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:5173
```

The Vite dev server proxies `/api/*` to the FastAPI server, so frontend code uses relative URLs.

---

## Usage

1. Open http://localhost:5173.
2. Type something like *"Find me a OnePlus 12"*, *"any pen drive"*, or *"gaming laptop under 80000"* — or click an example prompt.
3. The assistant interprets the request, queries Salesforce, and the right-hand pane renders results grouped by store with the top 3 per source.

---

## How it works

### Chat → tool call

`POST /api/chat` forwards the full conversation history to OpenRouter with a `search_products` function tool. The model decides whether to call the tool (any product mention) or reply conversationally (greetings, clarifications). Tool arguments come back as a structured `ProductQuery` — never parsed from prose.

### Salesforce lookup

`POST /api/products/search` (called immediately after a tool call):

1. **Tokenize** the query, drop stopwords (`a`, `the`, `price`, `best`, etc.), cap at 5 tokens.
2. **AND-of-tokens** SOQL: `title__c LIKE '%t1%' AND title__c LIKE '%t2%' ...`. Properly escaped (`\`, `'`, `%`, `_`).
3. **OR-of-tokens fallback** if the AND query returned zero records — surfaces partial matches.
4. Cap at `LIMIT 200`.

Auth uses **OAuth 2.0 Client Credentials Flow**. The token is cached in memory and refreshed ~5 min before expiry. On a 401 from a data call, the backend invalidates the token, re-auths once, and retries.

### Ranking + grouping (Python-side)

Salesforce can't do per-group `LIMIT`, so:

1. Group records by `source__c`.
2. Score each: **+10** if the full query is a substring of the title, **+1** per token whole-word match. Tiebreak by rating, then review count.
3. Keep top 3 per source. Don't pad — fewer matches → return what's available.
4. Compute `discount__c` from current/original price if it's null.

### Frontend rendering

Each store has a designated accent color (`Amazon` → orange, `Flipkart` → blue, `Croma` → green, `Reliance Digital` → red). Rows are grouped by store with a section header, the top row of each group gets a *"Top match"* badge, and each row carries a 4px left border in the store's accent color.

Adding a new store = one entry in `frontend/src/lib/source-theme.ts`.

---

## API reference

### `POST /api/chat`

Request:
```json
{
  "messages": [
    { "role": "user", "content": "find me a OnePlus 12" }
  ]
}
```

Response:
```json
{
  "reply": "Searching for **OnePlus 12**…",
  "product_query": {
    "query": "OnePlus 12",
    "category": null, "min_price": null, "max_price": null,
    "brand": null, "sources": null
  }
}
```

When the model replies conversationally instead of calling the tool, `product_query` is `null`.

### `POST /api/products/search`

Request: `ProductQuery` (same shape as above).

Response:
```json
{
  "results": [
    {
      "id": "a001A00000AbCdEQAV",
      "title": "OnePlus 12 5G 256GB Black",
      "source": "Amazon",
      "current_price": 62999,
      "original_price": 69999,
      "discount": 10,
      "rating": "4.5",
      "review_count": 12400,
      "rank": 3,
      "product_url": "https://amazon.in/dp/B0ABCDE"
    }
  ]
}
```

Already grouped by source and capped at 3 per source.

---

## Testing

| Suite              | Command                               | Status                       |
| ------------------ | ------------------------------------- | ---------------------------- |
| Backend unit + integration | `cd backend && pytest`        | **54 tests, 89% coverage**   |
| Frontend unit + component  | `cd frontend && pnpm test`    | **44 tests across 6 files**  |
| Frontend type check        | `cd frontend && pnpm typecheck` | clean                      |
| Backend lint               | `cd backend && ruff check .`  | clean                        |
| E2E (requires both servers) | `cd frontend && pnpm test:e2e` | Playwright                  |

Both Salesforce and OpenRouter are mocked in unit tests (`respx`), so no real credentials are needed to run them. Test fixtures for Salesforce responses live in `backend/tests/fixtures/salesforce/`.

---

## Configuration reference

All config via environment variables. See `.env.example` for the canonical list.

| Variable                | Purpose                                              | Default                                                  |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `SF_TOKEN_URL`          | Salesforce OAuth token endpoint (My Domain preferred) | `https://login.salesforce.com/services/oauth2/token`     |
| `SF_CLIENT_ID`          | Connected App consumer key                           | *(required)*                                             |
| `SF_CLIENT_SECRET`      | Connected App consumer secret                        | *(required)*                                             |
| `SF_API_VERSION`        | Salesforce REST API version                          | `60.0`                                                   |
| `SF_QUERY_LIMIT`        | Max records pulled from SOQL before ranking          | `200`                                                    |
| `SF_RESULTS_PER_SOURCE` | Top N per source returned to FE                      | `3`                                                      |
| `OPENROUTER_API_KEY`    | OpenRouter API key                                   | *(required)*                                             |
| `OPENROUTER_MODEL`      | OpenRouter model id                                  | `openai/gpt-oss-120b`                                    |
| `CORS_ALLOW_ORIGINS`    | Comma-separated origins for CORS                     | `http://localhost:5173`                                  |
| `LOG_LEVEL`             | Python log level                                     | `INFO`                                                   |

---

## Security notes

- Secrets live only in `.env` (gitignored) or your secrets manager. `.env.example` is committed but contains no real values.
- A `_RedactingFilter` in `backend/app/core/logging.py` scrubs `SF_CLIENT_SECRET` and `OPENROUTER_API_KEY` from any log line that contains them — defense-in-depth on top of "don't log secrets in the first place."
- Authorization headers and access tokens are never logged.
- All SOQL is built with proper escaping (`\`, `'`, `%`, `_`) to prevent SOQL injection.
- In production, prefer a My Domain URL (`https://<your-domain>.my.salesforce.com/...`) over `login.salesforce.com`.

---

## Further reading

- `CLAUDE.md` — detailed spec, including ranking algorithm, tool schema, system prompt strategy, build order. Useful when extending the app or onboarding an AI agent.
- `backend/app/services/salesforce.py` — auth flow, escaping, AND→OR fallback.
- `backend/app/services/product_search.py` — ranking + grouping logic.
- `frontend/src/lib/source-theme.ts` — per-source visual identity.
