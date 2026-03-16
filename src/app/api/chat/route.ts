import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { retrieveRelevantChunks, assembleContext, buildDocumentIndexMap } from '@/lib/rag/retriever';
import { getClaudeModel, buildSystemPrompt, TEMPERATURE } from '@/lib/llm/claude';
import type { SourceReference } from '@/types/chat';

// Force Node.js runtime
export const runtime = 'nodejs';

// Maximum message length
const MAX_MESSAGE_LENGTH = 2000;

/**
 * POST /api/chat
 * Streaming chat endpoint with RAG retrieval
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

    // Parse request body (AI SDK useChat format)
    const body = await request.json();
    const { messages, workspaceId } = body;

    // Validate workspaceId
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required.' },
        { status: 400 }
      );
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required.' },
        { status: 400 }
      );
    }

    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user.' },
        { status: 400 }
      );
    }

    // Validate message length
    if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` },
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

    // Build search query with conversation context for better retrieval
    // This helps with follow-up questions like "What are his skills?" after asking about a person
    const buildSearchQuery = (): string => {
      const userMessages = messages
        .filter((m: { role: string }) => m.role === 'user')
        .map((m: { content: string }) => m.content);

      // For single message, use it directly
      if (userMessages.length === 1) {
        return userMessages[0];
      }

      // For follow-ups, combine last 2-3 user messages for context
      // This helps resolve pronouns like "er/sie/es" or "he/she/it"
      const recentMessages = userMessages.slice(-3);
      return recentMessages.join(' ');
    };

    const searchQuery = buildSearchQuery();

    // Retrieve relevant document chunks
    let chunks;
    try {
      chunks = await retrieveRelevantChunks(searchQuery, workspaceId);
    } catch (retrievalError) {
      console.error('Retrieval failed:', retrievalError);
      return NextResponse.json(
        { error: 'Failed to search documents. Please try again.' },
        { status: 500 }
      );
    }

    // Build document-to-index mapping (shared between context and sources)
    const docIndexMap = buildDocumentIndexMap(chunks);

    // Assemble context using consistent document indices
    const context = assembleContext(chunks, docIndexMap);
    const hasContext = chunks.length > 0;

    // Build sources for citation legend using same mapping
    const sources: SourceReference[] = [];
    const seenDocs = new Set<string>();
    for (const chunk of chunks) {
      if (!seenDocs.has(chunk.documentId)) {
        seenDocs.add(chunk.documentId);
        sources.push({
          index: docIndexMap.get(chunk.documentId)!,
          documentId: chunk.documentId,
          filename: chunk.filename,
        });
      }
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(context, hasContext);

    // Stream response from Claude
    let result;
    try {
      result = await streamText({
        model: getClaudeModel(),
        system: systemPrompt,
        messages,
        temperature: TEMPERATURE,
      });
    } catch (streamError) {
      console.error('streamText failed:', streamError);
      const errMsg = streamError instanceof Error ? streamError.message : 'Unknown streaming error';
      return NextResponse.json(
        { error: `Claude API error: ${errMsg}` },
        { status: 500 }
      );
    }

    // Return streaming response with sources header
    try {
      return result.toDataStreamResponse({
        headers: {
          'X-Sources': JSON.stringify(sources),
        },
      });
    } catch (responseError) {
      console.error('toDataStreamResponse failed:', responseError);
      return NextResponse.json(
        { error: 'Failed to create streaming response.' },
        { status: 500 }
      );
    }
  } catch (error) {
    // Provide more specific error messages for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error('Chat API error:', { name: errorName, message: errorMessage });

    // Check for specific error types
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'API configuration error. Please check server configuration.' },
        { status: 500 }
      );
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `An unexpected error occurred: ${errorName}` },
      { status: 500 }
    );
  }
}
