/**
 * scripts/pinecone-setup.js — Create Pinecone index + upload .md guidelines
 *
 * This script:
 *   1. Creates a Pinecone index with built-in embedding model
 *   2. Reads your .md guideline files from data/
 *   3. Chunks them by section
 *   4. Uploads them to Pinecone (Pinecone auto-generates embeddings)
 *
 * Usage:
 *   export PINECONE_API_KEY=your-key-here
 *   node scripts/pinecone-setup.js
 *
 * Run this ONCE to set up your database. Then your backend
 * will query it automatically on every request.
 */

const { Pinecone } = require('@pinecone-database/pinecone');
const fs   = require('fs');
const path = require('path');

// ── Configuration ──────────────────────────────────────────
const INDEX_NAME = 'prompt-guidelines';
const DATA_DIR   = path.join(__dirname, '..', 'data');

const FILE_TO_PROVIDER = {
  'gpt-guidelines.md':    'gpt',
  'claude-guidelines.md': 'claude',
  'gemini-guidelines.md': 'gemini',
  'grok-guidelines.md':   'grok'
};

// ── Chunk markdown by ## sections ──────────────────────────
function chunkBySection(text, provider, filename) {
  const chunks = [];
  const lines  = text.split('\n');

  let currentHeader = '';
  let currentBody   = [];

  for (const line of lines) {
    // Skip top-level headers and comment lines
    if (line.startsWith('# ') && !line.startsWith('## ')) continue;

    if (line.startsWith('## ')) {
      if (currentHeader && currentBody.length > 0) {
        const bodyText = currentBody.join('\n').trim();
        if (bodyText.length > 20) {
          chunks.push({
            header:   currentHeader.replace('## ', ''),
            text:     `[${provider.toUpperCase()}] ${currentHeader}\n${bodyText}`,
            provider: provider,
            source:   filename
          });
        }
      }
      currentHeader = line;
      currentBody   = [];
    } else {
      currentBody.push(line);
    }
  }

  // Last section
  if (currentHeader && currentBody.length > 0) {
    const bodyText = currentBody.join('\n').trim();
    if (bodyText.length > 20) {
      chunks.push({
        header:   currentHeader.replace('## ', ''),
        text:     `[${provider.toUpperCase()}] ${currentHeader}\n${bodyText}`,
        provider: provider,
        source:   filename
      });
    }
  }

  return chunks;
}

// ── Main ───────────────────────────────────────────────────
async function setup() {
  console.log('┌──────────────────────────────────────────┐');
  console.log('│  Pinecone Setup — Prompt Guidelines       │');
  console.log('└──────────────────────────────────────────┘\n');

  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    console.error('ERROR: Set PINECONE_API_KEY first');
    console.error('  export PINECONE_API_KEY=your-key-here');
    process.exit(1);
  }

  const pc = new Pinecone({ apiKey });

  // ── Step 1: Create index with integrated embedding ─────
  console.log('[1/3] Creating index...');

  try {
    // Check if index already exists
    const existingIndexes = await pc.listIndexes();
    const exists = existingIndexes.indexes?.some(i => i.name === INDEX_NAME);

    if (exists) {
      console.log(`  Index "${INDEX_NAME}" already exists — deleting and recreating...`);
      await pc.deleteIndex(INDEX_NAME);
      // Wait for deletion
      await new Promise(r => setTimeout(r, 3000));
    }

    // Create index with Pinecone's built-in embedding model
    // This means we send raw text and Pinecone auto-generates vectors
    const indexModel = await pc.createIndexForModel({
      name:   INDEX_NAME,
      cloud:  'aws',
      region: 'us-east-1',
      embed: {
        model:    'multilingual-e5-large',
        fieldMap: { text: 'chunk_text' }
      },
      waitUntilReady: true
    });

    console.log(`  Index created! Host: ${indexModel.host}\n`);

    // ── Step 2: Read and chunk .md files ───────────────────
    console.log('[2/3] Reading guideline files...');

    const allChunks = [];

    for (const [filename, provider] of Object.entries(FILE_TO_PROVIDER)) {
      const filepath = path.join(DATA_DIR, filename);

      if (!fs.existsSync(filepath)) {
        console.log(`  WARN: ${filename} not found, skipping`);
        continue;
      }

      const text   = fs.readFileSync(filepath, 'utf-8');
      const chunks = chunkBySection(text, provider, filename);

      console.log(`  ${provider.toUpperCase()}: ${chunks.length} sections from ${filename}`);
      allChunks.push(...chunks);
    }

    console.log(`  Total: ${allChunks.length} chunks\n`);

    // ── Step 3: Upload to Pinecone ─────────────────────────
    console.log('[3/3] Uploading to Pinecone...');

    const index = pc.index(INDEX_NAME);

    // Build records — Pinecone will auto-embed the chunk_text field
    const records = allChunks.map((chunk, i) => ({
      id:         `${chunk.provider}-${i}`,
      chunk_text: chunk.text,
      provider:   chunk.provider,
      section:    chunk.header,
      source:     chunk.source
    }));

    // Upload in batches of 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await index.upsertRecords(batch);
      console.log(`  Uploaded ${Math.min(i + BATCH_SIZE, records.length)}/${records.length} records`);
    }

    // Wait for indexing
    console.log('\n  Waiting for indexing...');
    await new Promise(r => setTimeout(r, 5000));

    // ── Verify ─────────────────────────────────────────────
    console.log('\n── Test Search ──────────────────────────');

    const results = await index.searchRecords({
      query: {
        inputs: { text: 'how to write a coding prompt' },
        topK: 3
      }
    });

    if (results.result?.hits) {
      results.result.hits.forEach((hit, i) => {
        console.log(`  ${i + 1}. [${hit.fields?.provider}] ${hit.fields?.section} (score: ${hit._score?.toFixed(3)})`);
      });
    }

    console.log('\n✓ Setup complete! Your backend will now use Pinecone.\n');
    console.log('Save your index host for reference:');
    console.log(`  INDEX_HOST: ${indexModel.host}\n`);

  } catch (err) {
    console.error('\nERROR:', err.message);
    if (err.message.includes('ALREADY_EXISTS')) {
      console.error('Index already exists. Delete it in the Pinecone dashboard and try again.');
    }
    process.exit(1);
  }
}

setup();
