'use client';

import { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { MessageSquare, Trash2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

interface ChatInterfaceProps {
  workspaceId: string;
  documentCount: number;
}

export function ChatInterface({ workspaceId, documentCount }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
  } = useChat({
    api: '/api/chat',
    body: { workspaceId },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear all messages
  const handleClear = () => {
    setMessages([]);
  };

  // No documents state
  if (documentCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat
          </CardTitle>
          <CardDescription>Frage deine Dokumente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="font-medium">Keine Dokumente vorhanden</p>
            <p className="text-sm mt-1">
              Lade zuerst Dokumente hoch, um Fragen stellen zu können.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col min-h-[500px] max-h-[700px]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat
            </CardTitle>
            <CardDescription className="text-base">
              Frage deine {documentCount} Dokument{documentCount !== 1 ? 'e' : ''}
            </CardDescription>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Leeren
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Error display */}
        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error.message || 'Ein Fehler ist aufgetreten.'}</span>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-base font-medium">Keine Nachrichten</p>
              <p className="text-sm mt-2">
                Stelle eine Frage zu deinen Dokumenten.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (messages.length === 0 || messages[messages.length - 1].role === 'user') && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 pt-4 border-t">
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            disabled={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
