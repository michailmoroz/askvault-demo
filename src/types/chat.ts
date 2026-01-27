/**
 * Chat-specific TypeScript types for RAG Query Engine
 */

/**
 * Result from vector similarity search
 */
export interface RetrievalResult {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
  filename: string;
}

/**
 * Request body for chat API endpoint
 */
export interface ChatRequestBody {
  workspaceId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Configuration for retrieval options
 */
export interface RetrievalOptions {
  threshold?: number;
  limit?: number;
}

/**
 * Source reference for displaying in chat UI
 * Maps [1], [2] citations to actual document filenames
 */
export interface SourceReference {
  index: number;
  documentId: string;
  filename: string;
}
