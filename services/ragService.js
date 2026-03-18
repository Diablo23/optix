/**
 * services/ragService.js — Two-Layer RAG Retrieval
 *
 * Combines TWO sources for each request:
 *   1. Provider-level docs:  data/{provider}.md  (official documentation)
 *   2. Model-specific tips:  data/{modelId}.md   (your personal tips)
 *
 * Both are sent to the LLM as separate labeled sections so it can
 * use official best practices AND your model-specific insights.
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const fileCache = {};

// ── Load and cache a file ──────────────────────────────────

function loadFile(filename) {
  if (fileCache[filename]) return fileCache[filename];

  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return null;

  const content = fs.readFileSync(filepath, 'utf-8').trim();
  fileCache[filename] = content;
  return content;
}

// ── Main Retrieval Function ────────────────────────────────

async function retrievePromptGuidelines(provider, modelId, prompt) {

  // Layer 1: Provider-level official documentation
  const providerFile = `${provider}.md`;
  const providerDocs = loadFile(providerFile);

  // Layer 2: Model-specific personal tips
  const modelFile = `${modelId}.md`;
  const modelTips = loadFile(modelFile);

  // Combine both layers with clear labels
  let combined = '';

  if (providerDocs) {
    combined += `=== OFFICIAL ${provider.toUpperCase()} DOCUMENTATION ===\n\n${providerDocs}\n\n`;
    console.log(`[RAG] Layer 1: Loaded ${providerFile} (${providerDocs.length} chars)`);
  } else {
    console.warn(`[RAG] Layer 1: No provider file found: ${providerFile}`);
  }

  if (modelTips) {
    combined += `=== ${modelId.toUpperCase()} SPECIFIC TIPS ===\n\n${modelTips}`;
    console.log(`[RAG] Layer 2: Loaded ${modelFile} (${modelTips.length} chars)`);
  } else {
    console.warn(`[RAG] Layer 2: No model file found: ${modelFile}`);
  }

  if (!combined) {
    console.warn(`[RAG] No guidelines found for provider="${provider}" model="${modelId}"`);
    return 'Use clear, specific, and structured prompts. Assign a role, provide context, specify output format.';
  }

  return combined.trim();
}

module.exports = { retrievePromptGuidelines };