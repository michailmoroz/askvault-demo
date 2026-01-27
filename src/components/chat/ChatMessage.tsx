'use client';

import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from 'ai/react';
import type { SourceReference } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
  sources?: SourceReference[];
}

export function ChatMessage({ message, sources }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-5 rounded-lg animate-fade-in',
        isUser ? 'bg-primary/10 ml-12' : 'bg-muted mr-12'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="text-base text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>

        {/* Sources footnote legend - Apple style: subtle, monospace, deferred */}
        {!isUser && sources && sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground/70 font-mono tracking-tight">
              {sources.map((source) => (
                <span key={source.documentId} className="mr-4">
                  [{source.index}]&nbsp;{source.filename}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
