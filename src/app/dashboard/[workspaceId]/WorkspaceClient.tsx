'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';
import type { DocumentWithChunkCount } from '@/types';

interface WorkspaceClientProps {
  workspaceId: string;
  initialDocuments: DocumentWithChunkCount[];
}

export function WorkspaceClient({
  workspaceId,
  initialDocuments,
}: WorkspaceClientProps) {
  const router = useRouter();
  const [documents, setDocuments] =
    useState<DocumentWithChunkCount[]>(initialDocuments);

  const handleUploadComplete = useCallback(async () => {
    // Refresh document list from API
    try {
      const response = await fetch(
        `/api/documents?workspaceId=${workspaceId}`
      );
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to refresh documents:', error);
    }

    // Also trigger a server-side revalidation
    router.refresh();
  }, [workspaceId, router]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Upload section - takes 1 column on large screens */}
      <div className="lg:col-span-1">
        <DocumentUpload
          workspaceId={workspaceId}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {/* Document list - takes 2 columns on large screens */}
      <div className="lg:col-span-2">
        <DocumentList
          documents={documents}
          onDocumentDeleted={handleUploadComplete}
        />
      </div>
    </div>
  );
}
