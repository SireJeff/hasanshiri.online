/**
 * OpenRouter-specific error classes with actionable user guidance
 * Provides clear guidance for users when things go wrong
 */

/**
 * Base OpenRouter error class
 */
export class OpenRouterError extends Error {
  constructor(message, { code, statusCode, details } = {}) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details
    };
  }
}

/**
 * Preset not found error - user needs to create preset on OpenRouter
 */
export class PresetNotFoundError extends OpenRouterError {
  constructor(presetSlug, details = {}) {
    const message = `Preset "${presetSlug}" not found in your OpenRouter account.`;
    super(message, {
      code: 'PRESET_NOT_FOUND',
      statusCode: 404,
      details: {
        presetSlug,
        action: 'create_preset',
        url: 'https://openrouter.ai/presets',
        ...details
      }
    });
    this.name = 'PresetNotFoundError';
  }
}

/**
 * Preset validation error - preset exists but is misconfigured
 */
export class PresetValidationError extends OpenRouterError {
  constructor(presetSlug, validationErrors) {
    const errors = Array.isArray(validationErrors)
      ? validationErrors
      : [validationErrors];

    const message = `Preset "${presetSlug}" is misconfigured: ${errors.join(', ')}`;
    super(message, {
      code: 'PRESET_VALIDATION_ERROR',
      statusCode: 400,
      details: {
        presetSlug,
        validationErrors: errors,
        action: 'fix_preset'
      }
    });
    this.name = 'PresetValidationError';
  }
}

/**
 * Authentication error - API key issues
 */
export class AuthenticationError extends OpenRouterError {
  constructor(details = {}) {
    const message = 'OpenRouter API authentication failed. Check your API key.';
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
      details: {
        action: 'check_api_key',
        ...details
      }
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends OpenRouterError {
  constructor(details = {}) {
    const message = 'Rate limit exceeded. Please try again later.';
    super(message, {
      code: 'RATE_LIMIT_ERROR',
      statusCode: 429,
      details: {
        action: 'wait_and_retry',
        ...details
      }
    });
    this.name = 'RateLimitError';
  }
}

/**
 * Stream parsing error
 */
export class StreamParseError extends OpenRouterError {
  constructor(cause, details = {}) {
    const message = 'Failed to parse streaming response from OpenRouter.';
    super(message, {
      code: 'STREAM_PARSE_ERROR',
      statusCode: 500,
      details: {
        action: 'check_stream_format',
        ...details
      },
      cause
    });
    this.name = 'StreamParseError';
  }
}

/**
 * Network connection error
 */
export class NetworkError extends OpenRouterError {
  constructor(cause, details = {}) {
    const message = 'Network connection failed. Check your internet connection.';
    super(message, {
      code: 'NETWORK_ERROR',
      statusCode: 0,
      details: {
        action: 'check_internet',
        ...details
      },
      cause
    });
    this.name = 'NetworkError';
  }
}

/**
 * Convert any error to actionable user message
 * @param {Error} error - The error to convert
 * @returns {Object} Actionable error response
 */
export function getActionableError(error) {
  // Handle our custom errors
  if (error instanceof PresetNotFoundError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      action: error.details.action,
      guidance: {
        title: 'Preset Not Found',
        message: `The preset "${error.details.presetSlug}" doesn't exist in your OpenRouter account.`,
        steps: [
          `Go to https://openrouter.ai/presets`,
          'Click "Create New Preset"',
          `Name it: "${error.details.presetSlug.replace('@preset/', '')}"`,
          'Configure the model and settings',
          'Save and try again'
        ],
        helpUrl: 'https://openrouter.ai/docs/presets'
      }
    };
  }

  if (error instanceof PresetValidationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      action: error.details.action,
      guidance: {
        title: 'Preset Configuration Error',
        message: `Your preset has issues: ${error.details.validationErrors.join(', ')}`,
        steps: [
          'Go to your preset on OpenRouter dashboard',
          'Fix the configuration issues listed above',
          'Save and try again'
        ],
        helpUrl: 'https://openrouter.ai/docs/presets'
      }
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      action: error.details.action,
      guidance: {
        title: 'Authentication Failed',
        message: 'Your OpenRouter API key is invalid or missing.',
        steps: [
          'Check your OPENROUTER_API_KEY environment variable',
          'Verify the key is correct on OpenRouter dashboard',
          'Make sure the key has not expired'
        ],
        helpUrl: 'https://openrouter.ai/docs/quick-start'
      }
    };
  }

  if (error instanceof RateLimitError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      action: error.details.action,
      guidance: {
        title: 'Rate Limit Exceeded',
        message: 'You have exceeded the rate limit for OpenRouter API.',
        steps: [
          'Wait a few minutes before trying again',
          'Consider upgrading your OpenRouter plan for higher limits',
          'Use smaller requests or batch operations'
        ],
        helpUrl: 'https://openrouter.ai/docs/rate-limits'
      }
    };
  }

  if (error instanceof StreamParseError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      action: error.details.action,
      guidance: {
        title: 'Streaming Error',
        message: 'Failed to parse streaming response.',
        steps: [
          'Try again - this may be a temporary issue',
          'If it persists, contact support',
          `Technical details: ${error.cause?.message || 'Unknown'}`
        ],
        helpUrl: 'https://openrouter.ai/docs/streaming'
      }
    };
  }

  if (error instanceof NetworkError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      action: error.details.action,
      guidance: {
        title: 'Network Error',
        message: 'Could not connect to OpenRouter API.',
        steps: [
          'Check your internet connection',
          'Try again in a moment',
          'If the problem persists, there may be an outage'
        ],
        helpUrl: 'https://openrouter.ai/status'
      }
    };
  }

  // Handle generic errors
  if (error?.message?.includes('OPENROUTER_API_KEY')) {
    return {
      success: false,
      error: 'OpenRouter API key not configured',
      code: 'MISSING_API_KEY',
      action: 'configure_api_key',
      guidance: {
        title: 'API Key Missing',
        message: 'The OPENROUTER_API_KEY environment variable is not set.',
        steps: [
          'Add OPENROUTER_API_KEY to your environment variables',
          'Get your key from https://openrouter.ai/keys',
          'Restart the server after adding the key'
        ]
      }
    };
  }

  // Unknown error
  return {
    success: false,
    error: error?.message || 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    guidance: {
      title: 'Unexpected Error',
      message: 'Something went wrong. Please try again.',
      steps: [
        'Refresh the page and try again',
        'Check your internet connection',
        'If the problem persists, contact support'
      ]
    }
  };
}

/**
 * Wrap an async function with error conversion
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that returns actionable errors
 */
export function withActionableErrors(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return getActionableError(error);
    }
  };
}
