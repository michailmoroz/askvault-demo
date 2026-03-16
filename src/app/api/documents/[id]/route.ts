import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/documents/[id]
 * Delete a document (cascades to chunks)
 */
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;
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

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required.' },
        { status: 400 }
      );
    }

    // Delete document (RLS ensures only owner can delete via workspace check)
    // CASCADE constraint will automatically delete chunks
    // IMPORTANT: Use .select().single() to verify deletion actually happened
    const { data: deletedDocument, error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .select('id, filename')
      .single();

    // Handle errors
    if (deleteError) {
      // PGRST116 = "No rows found" - either doesn't exist or RLS blocked it
      if (deleteError.code === 'PGRST116') {
        console.error('Document not found or access denied:', id);
        return NextResponse.json(
          { error: 'Document not found or you do not have permission to delete it.' },
          { status: 404 }
        );
      }
      console.error('Document deletion failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document.' },
        { status: 500 }
      );
    }

    // Extra safety check
    if (!deletedDocument) {
      console.error('No document was deleted (unexpected state)');
      return NextResponse.json(
        { error: 'Document could not be deleted.' },
        { status: 500 }
      );
    }

    console.log('Document deleted successfully:', deletedDocument.filename);
    return NextResponse.json({ success: true, deleted: deletedDocument });
  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
