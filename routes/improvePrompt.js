/**
 * routes/improvePrompt.js — POST /api/improve-prompt
 *
 * Accepts provider + model, retrieves guidelines, calls LLM.
 */

const express    = require('express');
const router     = express.Router();
const llmService = require('../services/llmService');
const ragService = require('../services/ragService');

const VALID_PROVIDERS = ['gpt', 'claude', 'gemini', 'grok'];

router.post('/improve-prompt', async (req, res) => {
  try {
    const { prompt, targetAI, model } = req.body;

    // ── Validation ───────────────────────────────────────
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "prompt" field' });
    }

    if (!targetAI || !VALID_PROVIDERS.includes(targetAI.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid "targetAI". Must be one of: ${VALID_PROVIDERS.join(', ')}`
      });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 5) {
      return res.status(400).json({ error: 'Prompt is too short (min 5 characters)' });
    }

    const provider = targetAI.toLowerCase();
    // model is optional — if not provided, use the provider-level file
    const modelId  = model ? model.toLowerCase() : provider;

    console.log(`[REQUEST] provider=${provider} model=${modelId} prompt="${trimmedPrompt.slice(0, 60)}..."`);

    // ── Step 1: Retrieve guidelines (model-specific or provider-level) ──
    const guidelines = await ragService.retrievePromptGuidelines(provider, modelId, trimmedPrompt);

    // ── Step 2: Improve the prompt ─────────────────────────
    const improvedPrompt = await llmService.improvePrompt(trimmedPrompt, provider, guidelines, modelId);

    console.log(`[RESPONSE] Improved prompt generated (${improvedPrompt.length} chars)`);

    return res.json({ improvedPrompt });

  } catch (err) {
    console.error('[ERROR] /api/improve-prompt:', err.message);
    return res.status(500).json({ error: 'Failed to improve prompt. Please try again.' });
  }
});

module.exports = router;
