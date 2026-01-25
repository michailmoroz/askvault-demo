'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CreateWorkspaceDialog,
  DeleteWorkspaceDialog,
} from '@/components/workspace';
import type { Workspace } from '@/types';

interface DashboardClientProps {
  initialWorkspaces: Workspace[];
}

export function DashboardClient({ initialWorkspaces }: DashboardClientProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(
    null
  );

  function handleDeleteClick(e: React.MouseEvent, workspace: Workspace) {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    setWorkspaceToDelete(workspace);
    setDeleteDialogOpen(true);
  }

  function handleWorkspaceCreated(workspace: Workspace) {
    setWorkspaces((prev) => [workspace, ...prev]);
  }

  function handleDeleted() {
    if (workspaceToDelete) {
      setWorkspaces((prev) =>
        prev.filter((w) => w.id !== workspaceToDelete.id)
      );
      setWorkspaceToDelete(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Askvault</h1>
          <p className="text-muted-foreground">
            Your intelligent document knowledge base
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Workspace
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.length > 0 ? (
          workspaces.map((workspace) => (
            <Link key={workspace.id} href={`/dashboard/${workspace.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full group relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{workspace.name}</CardTitle>
                      <CardDescription>
                        Created{' '}
                        {new Date(workspace.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDeleteClick(e, workspace)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to open workspace
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-muted-foreground">
                No workspaces yet
              </CardTitle>
              <CardDescription>
                Create your first workspace to get started
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleWorkspaceCreated}
      />

      {/* Delete Workspace Dialog */}
      {workspaceToDelete && (
        <DeleteWorkspaceDialog
          workspace={workspaceToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
