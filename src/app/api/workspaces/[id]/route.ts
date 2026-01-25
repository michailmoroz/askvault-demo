import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/workspaces/[id]
 * Delete a workspace (cascades to documents and chunks)
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
        { error: 'Workspace ID is required.' },
        { status: 400 }
      );
    }

    // Delete workspace (RLS ensures only owner can delete)
    // CASCADE constraint will automatically delete documents and chunks
    const { error: deleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Workspace deletion failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete workspace.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Workspace deletion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
