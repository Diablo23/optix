/**
 * server.js — Prompt Improver Backend
 *
 * Express server that receives prompts from the Chrome extension,
 * retrieves prompt-engineering guidelines via RAG, and uses an LLM
 * to return an improved version of the prompt.
 */

const express = require('express');
const cors    = require('cors');
const improvePromptRouter = require('./routes/improvePrompt');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────

// Allow requests from the Chrome extension
app.use(cors({
  origin: '*',   // In production, restrict to your extension's origin
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50kb' }));

// ── Routes ─────────────────────────────────────────────────

app.use('/api', improvePromptRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler ──────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────┐`);
  console.log(`│  Prompt Improver API                 │`);
  console.log(`│  Running on http://localhost:${PORT}     │`);
  console.log(`└──────────────────────────────────────┘\n`);
});
