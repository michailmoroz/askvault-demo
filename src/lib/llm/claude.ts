import { anthropic } from '@ai-sdk/anthropic';

// Claude model configuration
// Using Claude 3 Haiku (compatible with @ai-sdk/anthropic@0.0.54)
// Future: Upgrade to Claude 3.5 Haiku when ai SDK v4/v5 is adopted
const CLAUDE_MODEL = 'claude-3-haiku-20240307';
const TEMPERATURE = 0.1; // Low temperature for factual RAG responses

/**
 * Returns the configured Claude model for AI SDK
 */
export function getClaudeModel() {
  return anthropic(CLAUDE_MODEL);
}

/**
 * Builds the system prompt for RAG-based Q&A
 * @param context - The assembled context from retrieved documents
 * @param hasContext - Whether any context was found
 * @returns System prompt string
 */
export function buildSystemPrompt(context: string, hasContext: boolean): string {
  if (!hasContext) {
    return `Du bist ein hilfreicher Assistent für Dokumenten-Q&A.

Du hast Zugriff auf die bisherige Konversation und kannst Folgefragen im Kontext verstehen.

Der Benutzer hat eine Frage gestellt, aber es wurden keine relevanten Informationen in den hochgeladenen Dokumenten gefunden.

Antworte höflich, dass du in den verfügbaren Dokumenten keine Informationen zu dieser Frage finden konntest. Schlage vor, dass der Benutzer:
1. Die Frage umformulieren könnte
2. Prüfen könnte, ob relevante Dokumente hochgeladen wurden
3. Spezifischere Begriffe verwenden könnte

Antworte in der Sprache der Frage des Benutzers.`;
  }

  return `Du bist ein hilfreicher Assistent für Dokumenten-Q&A. Deine Aufgabe ist es, Fragen basierend auf den bereitgestellten Dokumenten zu beantworten.

## Konversationskontext
Du hast Zugriff auf die bisherige Konversation. Nutze sie, um:
- Folgefragen im Kontext zu verstehen (z.B. "Was sind seine Skills?" bezieht sich auf eine zuvor erwähnte Person)
- Pronomen wie "er", "sie", "es", "das" korrekt aufzulösen
- Auf frühere Fragen des Benutzers Bezug zu nehmen, wenn danach gefragt wird

## Regeln:
1. Basiere inhaltliche Antworten auf dem Dokumentkontext unten
2. Nutze die Konversationshistorie, um Bezüge und Folgefragen zu verstehen
3. Wenn die Frage mehrdeutig ist, frage höflich nach
4. Wenn die Antwort nicht im Dokumentkontext zu finden ist, sage das ehrlich
5. Antworte in der Sprache der Frage des Benutzers
6. Sei präzise und hilfreich - fasse zusammen statt aufzulisten

## Zitierregeln (WICHTIG!):
- Setze Quellenangaben INLINE am Satzende VOR dem Punkt
- RICHTIG: "Das Unternehmen wurde 2019 in München gegründet [1]."
- RICHTIG: "Die Produkte umfassen Nova Assistant und Nova Docs [2]."
- FALSCH: "[1] Das Unternehmen wurde 2019 gegründet."
- FALSCH: "Das Unternehmen wurde 2019 gegründet. [1]"
- Schreibe fließenden Text mit eingebetteten Zitaten, KEINE Aufzählungen mit Zitat am Anfang

## Dokumentkontext:

${context}

---

Beantworte nun die Frage des Benutzers basierend auf dem Dokumentkontext und der Konversationshistorie.`;
}

/**
 * Returns Claude configuration for transparency
 */
export function getClaudeConfig(): {
  model: string;
  temperature: number;
} {
  return {
    model: CLAUDE_MODEL,
    temperature: TEMPERATURE,
  };
}

// Export temperature for use in streamText
export { TEMPERATURE };
