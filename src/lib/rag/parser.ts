// Use direct lib import to avoid test file loading issue in pdf-parse v1.1.1
// See: https://gitlab.com/nicholaswilson/node-pdf-parse/-/issues/52
import pdf from 'pdf-parse/lib/pdf-parse.js';

// Supported file types for document upload
export const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
] as const;

// File extension mapping for MIME type detection
export const EXTENSION_TO_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
};

// Maximum file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validates a file before processing
 * @throws Error if file is invalid
 */
export function validateFile(file: File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    );
  }

  // Check file size is not zero
  if (file.size === 0) {
    throw new Error('File is empty.');
  }

  // Get file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeFromExtension = EXTENSION_TO_MIME[extension];

  // Check if file type is allowed (by MIME type or extension)
  const isAllowedMime = ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number]);
  const isAllowedExtension = mimeFromExtension !== undefined;

  if (!isAllowedMime && !isAllowedExtension) {
    throw new Error(
      `Unsupported file type. Allowed types: PDF, TXT, MD.`
    );
  }
}

/**
 * Extracts text content from a PDF file
 * Uses pdf-parse v1.x API (no worker dependency)
 */
async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  // Convert ArrayBuffer to Buffer for pdf-parse v1
  const nodeBuffer = Buffer.from(buffer);
  const data = await pdf(nodeBuffer);

  if (!data.text || data.text.trim().length === 0) {
    throw new Error('PDF contains no extractable text.');
  }

  return data.text;
}

/**
 * Extracts text content from a text or markdown file
 */
async function parseText(file: File): Promise<string> {
  const text = await file.text();

  if (!text || text.trim().length === 0) {
    throw new Error('File contains no text content.');
  }

  return text;
}

/**
 * Determines the content type of a file
 */
export function getContentType(file: File): string {
  // First check MIME type
  if (ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
    return file.type;
  }

  // Fallback to extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeFromExtension = EXTENSION_TO_MIME[extension];

  if (mimeFromExtension) {
    return mimeFromExtension;
  }

  return 'application/octet-stream';
}

/**
 * Parses a file and extracts its text content
 * @param file - The file to parse
 * @returns The extracted text content
 * @throws Error if file is invalid or parsing fails
 */
export async function parseFile(file: File): Promise<string> {
  // Validate file first
  validateFile(file);

  const contentType = getContentType(file);

  // Parse based on content type
  if (contentType === 'application/pdf') {
    const buffer = await file.arrayBuffer();
    return parsePdf(buffer);
  }

  // Text and Markdown files
  if (
    contentType === 'text/plain' ||
    contentType === 'text/markdown' ||
    contentType === 'text/x-markdown'
  ) {
    return parseText(file);
  }

  throw new Error(`Cannot parse file type: ${contentType}`);
}
