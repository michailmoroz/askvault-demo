'use client';

import { ChatInterface } from '@/components/chat';

interface ChatSectionProps {
  workspaceId: string;
  documentCount: number;
}

export function ChatSection({ workspaceId, documentCount }: ChatSectionProps) {
  return <ChatInterface workspaceId={workspaceId} documentCount={documentCount} />;
}
