/**
 * scripts/ingest.js — Ingest prompt guidelines into ChromaDB
 *
 * Reads markdown files from data/, chunks them by section,
 * and stores them in a ChromaDB collection with provider metadata.
 *
 * Usage:
 *   node scripts/ingest.js
 *
 * Prerequisites:
 *   1. Install dependencies: npm install chromadb chromadb-default-embed
 *   2. Run ChromaDB server: docker run -p 8000:8000 chromadb/chroma
 *      OR use the persistent local client (no Docker needed)
 */

const fs   = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');

// ── Configuration ──────────────────────────────────────────

const DATA_DIR        = path.join(__dirname, '..', 'data');
const COLLECTION_NAME = 'prompt-guidelines';

// Map filenames to provider IDs
const FILE_TO_PROVIDER = {
  'gpt-guidelines.md':    'gpt',
  'claude-guidelines.md': 'claude',
  'gemini-guidelines.md': 'gemini',
  'grok-guidelines.md':   'grok'
};

// ── Chunking Logic ─────────────────────────────────────────

/**
 * Split a markdown file into chunks by ## headers.
 * Each chunk includes the header + its body text.
 * This keeps related guidelines together as a single unit.
 */
function chunkBySection(text, provider) {
  const chunks = [];
  const lines  = text.split('\n');

  let currentHeader = '';
  let currentBody   = [];

  for (const line of lines) {
    // Skip comment lines (lines starting with #  followed by Source: or Instructions:)
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      // Top-level header — use as context but don't create a chunk
      continue;
    }

    if (line.startsWith('## ')) {
      // Save the previous section as a chunk
      if (currentHeader && currentBody.length > 0) {
        const bodyText = currentBody.join('\n').trim();
        if (bodyText.length > 20) {
          chunks.push({
            header: currentHeader,
            text:   `${currentHeader}\n${bodyText}`,
          });
        }
      }
      // Start new section
      currentHeader = line;
      currentBody   = [];
    } else {
      // Filter out comment lines
      if (!line.startsWith('# ')) {
        currentBody.push(line);
      }
    }
  }

  // Don't forget the last section
  if (currentHeader && currentBody.length > 0) {
    const bodyText = currentBody.join('\n').trim();
    if (bodyText.length > 20) {
      chunks.push({
        header: currentHeader,
        text:   `[${provider.toUpperCase()}] ${currentHeader}\n${bodyText}`,
      });
    }
  }

  return chunks;
}

// ── Main Ingestion ─────────────────────────────────────────

async function ingest() {
  console.log('┌──────────────────────────────────────┐');
  console.log('│  RAG Ingestion — Prompt Guidelines    │');
  console.log('└──────────────────────────────────────┘\n');

  // Connect to ChromaDB
  const client = new ChromaClient({ path: 'http://localhost:8000' });

  // Delete existing collection if it exists (fresh start)
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log(`[INFO] Deleted existing "${COLLECTION_NAME}" collection`);
  } catch (e) {
    // Collection doesn't exist yet — that's fine
  }

  // Create fresh collection
  // ChromaDB uses its built-in default embedding function
  const collection = await client.createCollection({
    name: COLLECTION_NAME,
    metadata: { description: 'Prompt engineering guidelines per AI provider' }
  });

  console.log(`[INFO] Created collection "${COLLECTION_NAME}"\n`);

  // Process each guideline file
  let totalChunks = 0;

  for (const [filename, provider] of Object.entries(FILE_TO_PROVIDER)) {
    const filepath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`[WARN] File not found: ${filename} — skipping`);
      continue;
    }

    const text   = fs.readFileSync(filepath, 'utf-8');
    const chunks = chunkBySection(text, provider);

    console.log(`[${provider.toUpperCase()}] Found ${chunks.length} sections in ${filename}`);

    // Prepare batch data for ChromaDB
    const ids       = [];
    const documents = [];
    const metadatas = [];

    chunks.forEach((chunk, index) => {
      ids.push(`${provider}-${index}`);
      documents.push(chunk.text);
      metadatas.push({
        provider: provider,
        section:  chunk.header.replace('## ', ''),
        source:   filename
      });
    });

    // Add to collection
    await collection.add({
      ids,
      documents,
      metadatas
    });

    totalChunks += chunks.length;
    console.log(`[${provider.toUpperCase()}] Stored ${chunks.length} chunks`);
  }

  console.log(`\n✓ Done! Ingested ${totalChunks} total chunks into "${COLLECTION_NAME}"`);

  // Quick verification
  const count = await collection.count();
  console.log(`✓ Collection now has ${count} documents\n`);

  // Test a query
  console.log('── Test Query ──────────────────────────');
  const results = await collection.query({
    queryTexts: ['how to structure a coding prompt'],
    nResults: 3,
  });

  results.documents[0].forEach((doc, i) => {
    const meta = results.metadatas[0][i];
    console.log(`\n  Result ${i + 1} [${meta.provider}] ${meta.section}:`);
    console.log(`  ${doc.slice(0, 100)}...`);
  });

  console.log('\n── Done ────────────────────────────────\n');
}

ingest().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
