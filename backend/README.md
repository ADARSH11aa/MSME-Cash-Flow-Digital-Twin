# CashTwin Backend Gateway

Sits between `frontend/` and `AI_models/`. Node/Express only, no Python.
Calls every model — including Model 2 (Monte Carlo), Model 7 (recommendation
ranker) and Model 8 (risk graph), which used to run in-process inside the old
Python gateway — over HTTP against `AI_models/main.py`, and reshapes all of
it into exactly the JSON shapes `frontend/src/mocks/api/*.js` already
expects. See each file under `src/adapters/` for what specifically had to be
translated or approximated, and why.

## Run it

1. Start Model 1/2/5/7/8's server (required — nearly everything here calls
   into it):
   ```
   cd AI_models
   .venv/Scripts/python -m uvicorn main:app --port 8000
   ```
2. (Optional) Start Model 3's server, for anomaly-enriched risk-graph nodes —
   the graph still builds without it, just without `anomaly_type` detail:
   ```
   cd AI_models
   .venv/Scripts/python -m uvicorn api.anomaly_api:app --port 8002
   ```
3. Start this gateway:
   ```
   cd backend
   npm install
   npm start
   ```
4. Point the frontend at it — `frontend/.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:9000
   ```
   (defaults to `http://localhost:9000` already if unset — see
   `frontend/src/lib/api.js`)

## Known gaps — read before a live demo

- **`config.js`'s `DEFAULT_OPENING_CASH` / `DEFAULT_DAILY_EXPENSE` /
  `DEFAULT_MIN_BUFFER` are placeholders.** `AI_models/invoices.csv` is a
  large synthetic dataset with no associated real business — these numbers
  are a guess scaled to that dataset, not a real business's figures.
- **`upcomingObligations` is always empty** and `businessName` is a
  placeholder — the real pipeline has one flat `daily_expense` figure, not
  discrete named obligations the way the old mock fixture did.
- **Scenario shocks `deferredObligations` / `deferDays` are no-ops** for the
  same reason — see `src/adapters/scenarioShocks.js`. The response's
  `unhandledShocks` array reports this back to the caller.
- **Rounding/formatting is an approximation of Python's conventions**
  (`round()`'s banker's rounding, `f"{:,.0f}"` thousands grouping) — see
  `src/lib/round.js`. Divergences should only ever show up at the last
  decimal place.
