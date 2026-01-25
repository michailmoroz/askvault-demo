import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Workspace } from '@/types';

/**
 * POST /api/workspaces
 * Create a new workspace
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

    // Parse request body
    const body = await request.json();
    const { name } = body as { name?: string };

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Workspace name is required.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Workspace name cannot be empty.' },
        { status: 400 }
      );
    }

    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Workspace name is too long (max 100 characters).' },
        { status: 400 }
      );
    }

    // Create workspace
    const { data: workspace, error: insertError } = await supabase
      .from('workspaces')
      .insert({
        name: trimmedName,
        owner_id: user.id,
      })
      .select('id, name, owner_id, created_at')
      .single();

    if (insertError || !workspace) {
      console.error('Workspace creation failed:', insertError);
      return NextResponse.json(
        { error: 'Failed to create workspace.' },
        { status: 500 }
      );
    }

    return NextResponse.json(workspace as Workspace, { status: 201 });
  } catch (error) {
    console.error('Workspace creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workspaces
 * List user's workspaces
 */
export async function GET(): Promise<Response> {
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

    // Fetch workspaces (RLS ensures only user's workspaces are returned)
    const { data: workspaces, error: fetchError } = await supabase
      .from('workspaces')
      .select('id, name, owner_id, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Workspaces fetch failed:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch workspaces.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ workspaces: workspaces as Workspace[] });
  } catch (error) {
    console.error('Workspaces list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
