'use client';

import { useState } from 'react';
import { FileText, File, FileType, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import type { DocumentWithChunkCount } from '@/types';

interface DocumentListProps {
  documents: DocumentWithChunkCount[];
  onDocumentDeleted?: () => void;
}

/**
 * Get the appropriate icon for a file type
 */
function getFileIcon(contentType: string) {
  if (contentType === 'application/pdf') {
    return <FileType className="h-8 w-8 text-red-500 dark:text-red-400" />;
  }
  if (contentType === 'text/markdown' || contentType === 'text/x-markdown') {
    return <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400" />;
  }
  return <File className="h-8 w-8 text-muted-foreground" />;
}

/**
 * Format file type for display
 */
function formatFileType(contentType: string): string {
  if (contentType === 'application/pdf') return 'PDF';
  if (contentType === 'text/markdown' || contentType === 'text/x-markdown')
    return 'Markdown';
  if (contentType === 'text/plain') return 'Text';
  return 'Document';
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DocumentList({ documents, onDocumentDeleted }: DocumentListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentWithChunkCount | null>(null);

  function handleDeleteClick(doc: DocumentWithChunkCount) {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  }

  function handleDeleted() {
    setDocumentToDelete(null);
    onDocumentDeleted?.();
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Your uploaded files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
            <p className="font-medium">No documents yet</p>
            <p className="text-sm mt-1">
              Upload your first document to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.length})</CardTitle>
          <CardDescription>Your uploaded files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
            >
              {/* File icon */}
              <div className="flex-shrink-0">
                {getFileIcon(doc.content_type)}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate" title={doc.filename}>
                  {doc.filename}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{formatFileType(doc.content_type)}</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{doc.chunk_count} chunks</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{formatDate(doc.created_at)}</span>
                </div>
              </div>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => handleDeleteClick(doc)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delete Document Dialog */}
      {documentToDelete && (
        <DeleteDocumentDialog
          document={documentToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
