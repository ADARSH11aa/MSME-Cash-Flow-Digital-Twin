/**
 * Gateway backend for the CashTwin frontend.
 *
 * Requires Model 1's server running first (AI_models/main.py, port 8000) -
 * everything here calls into it for payment predictions, Monte Carlo
 * simulation, recommendation ranking, risk-graph building and SHAP
 * explanations. Model 3's server (AI_models/api/anomaly_api.py, port 8002)
 * is optional; the risk graph degrades gracefully without it.
 *
 * Run:
 *   cd AI_models && .venv/Scripts/python -m uvicorn main:app --port 8000
 *   cd backend && npm start
 */
import cors from 'cors';
import express from 'express';
import { CORS_ORIGINS } from './config.js';
import dashboardRouter from './routes/dashboard.js';
import dataRouter from './routes/data.js';
import recommendationsRouter from './routes/recommendations.js';
import scenariosRouter from './routes/scenarios.js';

const app = express();

app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json());

app.use('/api/dashboard', dashboardRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/data', dataRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT ?? 9000;
app.listen(PORT, () => {
  console.log(`CashTwin backend gateway listening on http://localhost:${PORT}`);
});
