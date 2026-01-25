import { createClient } from '@/lib/supabase/server';
import { DashboardClient } from './DashboardClient';
import type { Workspace } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch workspaces:', error);
  }

  const typedWorkspaces = (workspaces as Workspace[]) || [];

  return <DashboardClient initialWorkspaces={typedWorkspaces} />;
}
