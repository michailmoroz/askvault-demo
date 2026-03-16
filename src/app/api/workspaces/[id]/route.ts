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
    // IMPORTANT: Use .select().single() to verify deletion actually happened
    const { data: deletedWorkspace, error: deleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id)
      .select('id, name')
      .single();

    // Handle errors
    if (deleteError) {
      // PGRST116 = "No rows found" - either doesn't exist or RLS blocked it
      if (deleteError.code === 'PGRST116') {
        console.error('Workspace not found or access denied:', id);
        return NextResponse.json(
          { error: 'Workspace not found or you do not have permission to delete it.' },
          { status: 404 }
        );
      }
      console.error('Workspace deletion failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete workspace.' },
        { status: 500 }
      );
    }

    // Extra safety check - should not happen if .single() is used
    if (!deletedWorkspace) {
      console.error('No workspace was deleted (unexpected state)');
      return NextResponse.json(
        { error: 'Workspace could not be deleted.' },
        { status: 500 }
      );
    }

    console.log('Workspace deleted successfully:', deletedWorkspace.name);
    return NextResponse.json({ success: true, deleted: deletedWorkspace });
  } catch (error) {
    console.error('Workspace deletion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
