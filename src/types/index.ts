export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  workspace_id: string;
  filename: string;
  content_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[] | null;
  chunk_index: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface DocumentWithChunkCount extends Document {
  chunk_count: number;
}

export interface UploadProgress {
  stage: 'uploading' | 'parsing' | 'chunking' | 'embedding' | 'storing' | 'complete';
  progress: number;
  message: string;
}

export interface DocumentUploadResponse {
  id: string;
  filename: string;
  chunkCount: number;
  status: 'processed';
}

// Re-export chat types
export * from './chat';
