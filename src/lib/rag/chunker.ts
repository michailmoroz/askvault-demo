import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Chunk size in characters (~512 tokens)
const CHUNK_SIZE = 2000;

// Overlap between chunks in characters (~50 tokens)
const CHUNK_OVERLAP = 200;

// Default separators for recursive splitting
// Priority: Paragraph -> Sentence -> Word -> Character
const DEFAULT_SEPARATORS = ['\n\n', '\n', ' ', ''];

/**
 * Splits text into overlapping chunks using RecursiveCharacterTextSplitter
 * @param text - The text to split
 * @returns Array of text chunks
 */
export async function chunkText(text: string): Promise<string[]> {
  // Handle empty or very short text
  if (!text || text.trim().length === 0) {
    return [];
  }

  // If text is shorter than chunk size, return as single chunk
  if (text.length <= CHUNK_SIZE) {
    return [text.trim()];
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: DEFAULT_SEPARATORS,
  });

  const chunks = await splitter.splitText(text);

  // Filter out empty chunks and trim whitespace
  return chunks
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

/**
 * Splits markdown text with awareness of headers
 * Preserves header context in chunks where possible
 * @param text - The markdown text to split
 * @returns Array of text chunks
 */
export async function chunkMarkdown(text: string): Promise<string[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Markdown-aware separators: Headers -> Paragraphs -> Sentences -> Words
  const markdownSeparators = [
    '\n## ',   // H2 headers
    '\n### ',  // H3 headers
    '\n#### ', // H4 headers
    '\n\n',    // Paragraphs
    '\n',      // Lines
    ' ',       // Words
    '',        // Characters
  ];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: markdownSeparators,
  });

  const chunks = await splitter.splitText(text);

  return chunks
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

/**
 * Returns chunking configuration for transparency
 */
export function getChunkingConfig(): {
  chunkSize: number;
  chunkOverlap: number;
  estimatedTokensPerChunk: number;
} {
  return {
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    estimatedTokensPerChunk: Math.floor(CHUNK_SIZE / 4), // ~4 chars per token
  };
}
