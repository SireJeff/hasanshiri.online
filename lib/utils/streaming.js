/**
 * Streaming Utilities for Server-Sent Events (SSE) APIs
 * Provides reusable SSE parsing for OpenRouter, OpenAI, Anthropic, etc.
 */

/**
 * Custom error for streaming failures
 */
export class StreamError extends Error {
  constructor(message, { cause, code, context } = {}) {
    super(message);
    this.name = 'StreamError';
    this.cause = cause;
    this.code = code;
    this.context = context;
  }
}

/**
 * Parse SSE chunks from a ReadableStream
 * @param {ReadableStream} stream - The response body stream
 * @param {Object} options - Parser options
 * @returns {AsyncGenerator<string>} Yields parsed JSON objects
 */
export async function* parseSSEChunks(stream, options = {}) {
  const {
    onChunk = null,
    onError = null,
    maxBufferSize = 1024 * 1024, // 1MB max buffer
  } = options;

  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let bufferLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining data in buffer
        if (buffer.trim()) {
          yield* processBuffer(buffer);
        }
        break;
      }

      // Decode chunk and add to buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      bufferLength += chunk.length;

      // Safety check for buffer overflow
      if (bufferLength > maxBufferSize) {
        throw new StreamError('Buffer overflow - chunk too large', {
          code: 'BUFFER_OVERFLOW',
          context: { bufferSize: bufferLength }
        });
      }

      // Call onChunk callback if provided
      if (onChunk) {
        onChunk(chunk);
      }

      // Process complete lines from buffer
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          yield* processLine(line);
        }
      }
    }
  } catch (error) {
    if (onError) {
      onError(error);
    }
    throw new StreamError('Failed to parse stream', {
      cause: error,
      code: 'PARSE_ERROR'
    });
  } finally {
    reader.releaseLock();
  }

  // Helper to process SSE lines
  function* processLine(line) {
    // SSE format: "data: {...}"
    if (line.startsWith('data: ')) {
      const data = line.slice(6); // Remove "data: " prefix

      // Handle [DONE] signal
      if (data === '[DONE]') {
        return;
      }

      try {
        const parsed = JSON.parse(data);
        yield parsed;
      } catch (error) {
        throw new StreamError('Failed to parse SSE data', {
          cause: error,
          code: 'JSON_PARSE_ERROR',
          context: { data }
        });
      }
    }
  }

  // Helper to process remaining buffer
  function* processBuffer(remaining) {
    const lines = remaining.split(/\r?\n/);
    for (const line of lines) {
      if (line.trim()) {
        yield* processLine(line);
      }
    }
  }
}

/**
 * Create a configured SSE parser for specific API formats
 * @param {string} format - 'openrouter' | 'openai' | 'anthropic'
 * @returns {Function} Parser function
 */
export function createSSEParser(format) {
  const parsers = {
    openrouter: (stream, options) => parseSSEChunks(stream, {
      ...options,
      transform: (data) => {
        // OpenRouter specific: extract delta from choices[0].delta
        if (data.choices?.[0]?.delta) {
          return data.choices[0].delta;
        }
        return data;
      }
    }),

    openai: (stream, options) => parseSSEChunks(stream, {
      ...options,
      transform: (data) => {
        // OpenAI format
        if (data.choices?.[0]?.delta) {
          return data.choices[0].delta;
        }
        return data;
      }
    }),

    anthropic: (stream, options) => parseSSEChunks(stream, {
      ...options,
      transform: (data) => {
        // Anthropic format
        if (data.delta) {
          return data.delta;
        }
        return data;
      }
    })
  };

  return parsers[format] || parsers.openrouter;
}

/**
 * Validate SSE format string
 * @param {string} sseString - SSE string to validate
 * @returns {boolean} True if valid SSE format
 */
export function validateSSEFormat(sseString) {
  if (typeof sseString !== 'string') return false;

  const lines = sseString.split(/\r?\n/);
  let hasData = false;

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      hasData = true;

      // Try to parse JSON
      const data = line.slice(6);
      try {
        JSON.parse(data);
      } catch {
        return false; // Invalid JSON
      }
    }
  }

  return hasData;
}
