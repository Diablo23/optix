/**
 * services/llmService.js — LLM Integration Service
 *
 * Sends the user's prompt along with RAG-retrieved guidelines to an
 * LLM API, and returns the improved prompt.
 *
 * CONFIGURATION:
 *   Set your API key and provider via environment variables:
 *     ANTHROPIC_API_KEY  — for Claude (default)
 *     OPENAI_API_KEY     — for OpenAI
 *     LLM_PROVIDER       — "anthropic" (default) or "openai"
 */

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'anthropic';

// ── Friendly display names for target AIs ──────────────────
const AI_NAMES = {
  gpt:    'ChatGPT (OpenAI GPT)',
  claude: 'Claude (Anthropic)',
  gemini: 'Gemini (Google)',
  grok:   'Grok (xAI)'
};

/**
 * Build the system prompt for the LLM.
 */
function buildSystemPrompt(targetAI, guidelines, modelId) {
  const modelInfo = modelId ? `\nSpecific model: ${modelId}` : '';
  return `You are an expert prompt engineer.

Your task: rewrite the user's prompt so it is optimized for a specific AI model.

TARGET AI: ${AI_NAMES[targetAI] || targetAI}${modelInfo}

Below are the OFFICIAL prompt engineering guidelines for this specific model. These guidelines are your ONLY source of truth for how to structure the improved prompt. Study them carefully.

<guidelines>
${guidelines}
</guidelines>

CRITICAL RULES:
1. The guidelines above define EXACTLY how to structure prompts for this model. Follow them strictly.
2. Each model has different best practices. The improved prompt MUST reflect the specific techniques described in the guidelines — not a generic template.
3. If the guidelines say to use XML tags — use XML tags. If they say to be concise — be concise. If they say to use labeled sections — use labeled sections. Match the model's preferred style.
4. Do NOT apply a one-size-fits-all template (like always adding ROLE/CONTEXT/TASK/FORMAT/CONSTRAINTS). Only add structural elements that the guidelines recommend for this specific model.
5. Preserve the user's original intent completely. Do not change what they are asking for.
6. Improve clarity and specificity where the original prompt is vague.
7. The output should feel like it was written by someone who deeply understands this specific model.

Return ONLY the improved prompt. No explanations, no commentary, no "Here's your improved prompt:" prefix.`;
}

/**
 * Improve a prompt using the configured LLM provider.
 *
 * @param {string} prompt     - The user's original prompt
 * @param {string} targetAI   - Target AI identifier
 * @param {string} guidelines - RAG-retrieved guidelines
 * @returns {Promise<string>} - The improved prompt
 */
async function improvePrompt(prompt, targetAI, guidelines, modelId) {
  const systemPrompt = buildSystemPrompt(targetAI, guidelines, modelId);

  if (LLM_PROVIDER === 'openai') {
    return callOpenAI(systemPrompt, prompt);
  }

  // Default: Anthropic Claude
  return callAnthropic(systemPrompt, prompt);
}

// ── Anthropic Claude API ───────────────────────────────────

async function callAnthropic(systemPrompt, userPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY not set. Run: export ANTHROPIC_API_KEY=your-key-here'
    );
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version':  '2023-06-01'
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 2048,
      system:     systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[LLM] Anthropic API error:', errorBody);
    throw new Error(`Anthropic API error (HTTP ${response.status})`);
  }

  const data = await response.json();

  // Extract text from the first content block
  const textBlock = data.content?.find(block => block.type === 'text');
  if (!textBlock) {
    throw new Error('No text content in Anthropic response');
  }

  return textBlock.text.trim();
}

// ── OpenAI API ─────────────────────────────────────────────

async function callOpenAI(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY not set. Run: export OPENAI_API_KEY=your-key-here'
    );
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model:    'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      max_tokens:  2048,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[LLM] OpenAI API error:', errorBody);
    throw new Error(`OpenAI API error (HTTP ${response.status})`);
  }

  const data = await response.json();

  const message = data.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error('No content in OpenAI response');
  }

  return message.trim();
}

module.exports = { improvePrompt };
