'use client';

import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 p-5 rounded-lg bg-muted mr-12 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
        <Bot className="h-5 w-5" />
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1 py-2">
        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing-dot [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing-dot [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing-dot [animation-delay:300ms]" />
      </div>
    </div>
  );
}
