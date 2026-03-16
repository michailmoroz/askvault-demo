import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/rag/embeddings';
import type { RetrievalResult, RetrievalOptions } from '@/types/chat';

// Default retrieval configuration
// Threshold 0.25 for better cross-language retrieval (DE questions → EN documents)
// Lower threshold = more results, Claude filters irrelevant ones
const DEFAULT_THRESHOLD = 0.25;
const DEFAULT_LIMIT = 8;

/**
 * Retrieves relevant document chunks using vector similarity search
 * @param query - The user's question
 * @param workspaceId - The workspace to search within
 * @param options - Optional retrieval configuration
 * @returns Array of relevant document chunks with similarity scores
 */
export async function retrieveRelevantChunks(
  query: string,
  workspaceId: string,
  options?: RetrievalOptions
): Promise<RetrievalResult[]> {
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
  const limit = options?.limit ?? DEFAULT_LIMIT;

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Create Supabase client
  const supabase = await createClient();

  // Call RPC function for vector similarity search
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    p_workspace_id: workspaceId,
  });

  if (error) {
    console.error('[Retriever] Vector search failed:', error);
    throw new Error('Failed to search documents');
  }

  // Transform to RetrievalResult format
  const results: RetrievalResult[] = (data || []).map((row: {
    id: string;
    document_id: string;
    content: string;
    similarity: number;
    filename: string;
  }) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    similarity: row.similarity,
    filename: row.filename,
  }));

  return results;
}

/**
 * Builds document-to-index mapping for consistent citation numbering
 * @param chunks - Array of retrieved document chunks
 * @returns Map of documentId to sequential index (1, 2, 3...)
 */
export function buildDocumentIndexMap(chunks: RetrievalResult[]): Map<string, number> {
  const docIndexMap = new Map<string, number>();
  let index = 1;

  for (const chunk of chunks) {
    if (!docIndexMap.has(chunk.documentId)) {
      docIndexMap.set(chunk.documentId, index++);
    }
  }

  return docIndexMap;
}

/**
 * Assembles retrieved chunks into a context string for the LLM
 * Uses document-based indexing so all chunks from same doc get same number
 * Citation markers are placed at the END to encourage inline citations
 * @param chunks - Array of retrieved document chunks
 * @param docIndexMap - Map of documentId to citation index
 * @returns Formatted context string with source attribution
 */
export function assembleContext(
  chunks: RetrievalResult[],
  docIndexMap: Map<string, number>
): string {
  if (chunks.length === 0) {
    return '';
  }

  const contextParts = chunks.map((chunk) => {
    const index = docIndexMap.get(chunk.documentId) ?? 0;
    // Put citation at END to discourage Claude from putting citations at start of paragraphs
    return `Quelle "${chunk.filename}":\n${chunk.content}\n(Zitiere als [${index}])`;
  });

  return contextParts.join('\n\n---\n\n');
}

/**
 * Returns retrieval configuration for transparency
 */
export function getRetrievalConfig(): {
  defaultThreshold: number;
  defaultLimit: number;
} {
  return {
    defaultThreshold: DEFAULT_THRESHOLD,
    defaultLimit: DEFAULT_LIMIT,
  };
}
