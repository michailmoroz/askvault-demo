import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WorkspaceClient } from './WorkspaceClient';
import { ChatSection } from './ChatSection';
import type { Workspace, DocumentWithChunkCount } from '@/types';

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // Fetch workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (workspaceError || !workspace) {
    notFound();
  }

  const typedWorkspace = workspace as Workspace;

  // Fetch documents with chunk count
  const { data: documents } = await supabase
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{typedWorkspace.name}</h1>
          <p className="text-muted-foreground">
            Created {new Date(typedWorkspace.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Chat Section - Hero Element */}
      <ChatSection
        workspaceId={workspaceId}
        documentCount={documentsWithCount.length}
      />

      {/* Documents Section */}
      <WorkspaceClient
        workspaceId={workspaceId}
        initialDocuments={documentsWithCount}
      />
    </div>
  );
}
