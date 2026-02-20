import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import authRoutes from './routes/auth';
import claimRoutes from './routes/claims';
import offerRoutes from './routes/offers';
import submissionRoutes from './routes/submissions';
import userRoutes from './routes/users';
import { errorHandler, notFound } from './middleware/error';

const app = express();
const frontendPath = path.resolve(__dirname, '../../spread-frontend');

app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Spread Backend Playground</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 24px; background: #0f172a; color: #e2e8f0; }
    h1 { margin-top: 0; }
    .row { display: grid; grid-template-columns: 1fr; gap: 12px; max-width: 720px; }
    .card { background: #111827; border: 1px solid #334155; border-radius: 10px; padding: 14px; }
    input, select, button, textarea { width: 100%; margin-top: 6px; padding: 10px; border-radius: 8px; border: 1px solid #475569; background: #0b1220; color: #e2e8f0; box-sizing: border-box; }
    button { cursor: pointer; background: #1d4ed8; border: none; }
    pre { white-space: pre-wrap; word-break: break-word; background: #020617; border: 1px solid #334155; padding: 12px; border-radius: 8px; }
    small { color: #94a3b8; }
  </style>
</head>
<body>
  <h1>Spread Backend Playground</h1>
  <p><small>Use this page to test your API with real POST requests.</small></p>
  <div class="row">
    <div class="card">
      <h3>Auth Signup</h3>
      <input id="signupEmail" placeholder="email" />
      <input id="signupPassword" placeholder="password (min 8)" type="password" />
      <select id="signupRole">
        <option value="creator">creator</option>
        <option value="restaurant">restaurant</option>
        <option value="admin">admin</option>
      </select>
      <button id="signupBtn">POST /auth/signup</button>
    </div>
    <div class="card">
      <h3>Auth Login</h3>
      <input id="loginEmail" placeholder="email" />
      <input id="loginPassword" placeholder="password" type="password" />
      <button id="loginBtn">POST /auth/login</button>
    </div>
    <div class="card">
      <h3>Quick Checks</h3>
      <button id="healthBtn">GET /health</button>
      <button id="offersBtn">GET /offers</button>
    </div>
    <div class="card">
      <h3>Output</h3>
      <pre id="output">Ready.</pre>
    </div>
  </div>
  <script>
    const out = document.getElementById('output');
    const print = (data) => out.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    async function call(path, options = {}) {
      const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
      const text = await res.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = text; }
      print({ status: res.status, path, payload });
      return payload;
    }
    document.getElementById('signupBtn').onclick = () => call('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('signupEmail').value.trim(),
        password: document.getElementById('signupPassword').value,
        role: document.getElementById('signupRole').value
      })
    });
    document.getElementById('loginBtn').onclick = () => call('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value
      })
    });
    document.getElementById('healthBtn').onclick = () => call('/health');
    document.getElementById('offersBtn').onclick = () => call('/offers');
  </script>
</body>
</html>`);
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/app', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use('/app', express.static(frontendPath));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/offers', offerRoutes);
app.use('/claims', claimRoutes);
app.use('/submissions', submissionRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
