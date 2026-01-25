import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseFile, getContentType, validateFile } from '@/lib/rag/parser';
import { chunkText, chunkMarkdown } from '@/lib/rag/chunker';
import { generateEmbeddings } from '@/lib/rag/embeddings';
import type { DocumentUploadResponse, DocumentWithChunkCount } from '@/types';

// Force Node.js runtime (required for pdf-parse)
export const runtime = 'nodejs';

/**
 * POST /api/documents
 * Upload and process a document
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const workspaceId = formData.get('workspaceId') as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided.' },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required.' },
        { status: 400 }
      );
    }

    // Verify workspace ownership (RLS will also enforce this)
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found or access denied.' },
        { status: 404 }
      );
    }

    // Validate file
    try {
      validateFile(file);
    } catch (validationError) {
      return NextResponse.json(
        { error: (validationError as Error).message },
        { status: 400 }
      );
    }

    // Parse file content
    let textContent: string;
    try {
      textContent = await parseFile(file);
    } catch (parseError) {
      return NextResponse.json(
        { error: `Failed to parse file: ${(parseError as Error).message}` },
        { status: 400 }
      );
    }

    // Chunk the text
    const contentType = getContentType(file);
    const chunks =
      contentType === 'text/markdown' || contentType === 'text/x-markdown'
        ? await chunkMarkdown(textContent)
        : await chunkText(textContent);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No content could be extracted from the file.' },
        { status: 400 }
      );
    }

    // Generate embeddings for all chunks
    let embeddings: number[][];
    try {
      embeddings = await generateEmbeddings(chunks);
    } catch (embeddingError) {
      console.error('Embedding generation failed:', embeddingError);
      return NextResponse.json(
        { error: 'Failed to generate embeddings. Please try again.' },
        { status: 500 }
      );
    }

    // Insert document record
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        workspace_id: workspaceId,
        filename: file.name,
        content_type: contentType,
        metadata: {
          original_size: file.size,
          chunk_count: chunks.length,
        },
      })
      .select('id')
      .single();

    if (documentError || !document) {
      console.error('Document insert failed:', documentError);
      return NextResponse.json(
        { error: 'Failed to save document.' },
        { status: 500 }
      );
    }

    // Insert all chunks with embeddings
    const chunkRecords = chunks.map((content, index) => ({
      document_id: document.id,
      content,
      embedding: embeddings[index],
      chunk_index: index,
      metadata: {
        char_count: content.length,
      },
    }));

    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkRecords);

    if (chunksError) {
      console.error('Chunks insert failed:', chunksError);
      // Clean up the document record
      await supabase.from('documents').delete().eq('id', document.id);
      return NextResponse.json(
        { error: 'Failed to save document chunks.' },
        { status: 500 }
      );
    }

    // Return success response
    const response: DocumentUploadResponse = {
      id: document.id,
      filename: file.name,
      chunkCount: chunks.length,
      status: 'processed',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents
 * List documents in a workspace
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Get workspace ID from query params
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required.' },
        { status: 400 }
      );
    }

    // Fetch documents with chunk count
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select(
        `
        id,
        workspace_id,
        filename,
        content_type,
        metadata,
        created_at,
        document_chunks(count)
      `
      )
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (documentsError) {
      console.error('Documents fetch failed:', documentsError);
      return NextResponse.json(
        { error: 'Failed to fetch documents.' },
        { status: 500 }
      );
    }

    // Transform to DocumentWithChunkCount
    const documentsWithCount: DocumentWithChunkCount[] = (documents || []).map(
      (doc) => ({
        id: doc.id,
        workspace_id: doc.workspace_id,
        filename: doc.filename,
        content_type: doc.content_type,
        metadata: doc.metadata as Record<string, unknown>,
        created_at: doc.created_at,
        chunk_count:
          (doc.document_chunks as { count: number }[])?.[0]?.count || 0,
      })
    );

    return NextResponse.json({ documents: documentsWithCount });
  } catch (error) {
    console.error('Documents list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
