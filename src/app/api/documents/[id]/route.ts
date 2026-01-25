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
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Document deletion failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
