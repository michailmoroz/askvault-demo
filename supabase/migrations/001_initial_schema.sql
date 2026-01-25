-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks with embeddings
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW index for fast similarity search
CREATE INDEX ON document_chunks
USING hnsw (embedding vector_cosine_ops);

-- Enable Row Level Security on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view own workspaces"
ON workspaces FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create own workspaces"
ON workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own workspaces"
ON workspaces FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own workspaces"
ON workspaces FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for documents
CREATE POLICY "Users can view documents in own workspaces"
ON documents FOR SELECT
USING (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can create documents in own workspaces"
ON documents FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can update documents in own workspaces"
ON documents FOR UPDATE
USING (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can delete documents in own workspaces"
ON documents FOR DELETE
USING (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

-- RLS Policies for document_chunks
CREATE POLICY "Users can view chunks in own documents"
ON document_chunks FOR SELECT
USING (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));

CREATE POLICY "Users can create chunks in own documents"
ON document_chunks FOR INSERT
WITH CHECK (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));

CREATE POLICY "Users can update chunks in own documents"
ON document_chunks FOR UPDATE
USING (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));

CREATE POLICY "Users can delete chunks in own documents"
ON document_chunks FOR DELETE
USING (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));
