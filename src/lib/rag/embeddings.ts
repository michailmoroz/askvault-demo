import OpenAI from 'openai';

// Embedding model configuration
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

// Maximum texts per batch (OpenAI limit is ~8000 tokens total)
const MAX_BATCH_SIZE = 100;

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an embedding vector for a single text
 * @param text - The text to embed
 * @returns Array of 1536 floating point numbers
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }

  const result = await openai.embeddings.create({
    input: text,
    model: EMBEDDING_MODEL,
  });

  return result.data[0].embedding;
}

/**
 * Generates embeddings for multiple texts in a single API call
 * More efficient than calling generateEmbedding multiple times
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors (same order as input)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Filter out empty texts
  const validTexts = texts.filter((t) => t && t.trim().length > 0);

  if (validTexts.length === 0) {
    return [];
  }

  // If within batch limit, process all at once
  if (validTexts.length <= MAX_BATCH_SIZE) {
    const result = await openai.embeddings.create({
      input: validTexts,
      model: EMBEDDING_MODEL,
    });

    return result.data.map((d) => d.embedding);
  }

  // Process in batches for large inputs
  const embeddings: number[][] = [];

  for (let i = 0; i < validTexts.length; i += MAX_BATCH_SIZE) {
    const batch = validTexts.slice(i, i + MAX_BATCH_SIZE);

    const result = await openai.embeddings.create({
      input: batch,
      model: EMBEDDING_MODEL,
    });

    embeddings.push(...result.data.map((d) => d.embedding));
  }

  return embeddings;
}

/**
 * Returns embedding configuration for transparency
 */
export function getEmbeddingConfig(): {
  model: string;
  dimensions: number;
} {
  return {
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  };
}
