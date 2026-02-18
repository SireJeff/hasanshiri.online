import {
  OpenRouterError,
  PresetNotFoundError,
  PresetValidationError,
  AuthenticationError,
  RateLimitError,
  StreamParseError,
  NetworkError,
  getActionableError,
} from '@/lib/errors/openrouter-errors'

describe('OpenRouter Errors', () => {
  describe('OpenRouterError (Base Class)', () => {
    it('creates error with message and code', () => {
      const error = new OpenRouterError('Test error', { code: 'TEST_ERROR' })
      expect(error.name).toBe('OpenRouterError')
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
    })

    it('includes statusCode and details', () => {
      const error = new OpenRouterError('Test error', {
        code: 'TEST',
        statusCode: 500,
        details: { foo: 'bar' }
      })
      expect(error.statusCode).toBe(500)
      expect(error.details.foo).toBe('bar')
    })

    it('serializes to JSON correctly', () => {
      const error = new OpenRouterError('Test error', {
        code: 'TEST',
        statusCode: 500,
        details: { foo: 'bar' }
      })
      const json = error.toJSON()
      expect(json.name).toBe('OpenRouterError')
      expect(json.message).toBe('Test error')
      expect(json.code).toBe('TEST')
    })
  })

  describe('PresetNotFoundError', () => {
    it('creates error with preset slug', () => {
      const error = new PresetNotFoundError('@preset/translate-fast')
      expect(error.name).toBe('PresetNotFoundError')
      expect(error.code).toBe('PRESET_NOT_FOUND')
      expect(error.statusCode).toBe(404)
      expect(error.details.presetSlug).toBe('@preset/translate-fast')
      expect(error.details.action).toBe('create_preset')
      expect(error.details.url).toBe('https://openrouter.ai/presets')
    })

    it('merges additional details', () => {
      const error = new PresetNotFoundError('@preset/test', { apiError: 'Not found in account' })
      expect(error.details.apiError).toBe('Not found in account')
    })
  })

  describe('PresetValidationError', () => {
    it('creates error with single validation error', () => {
      const error = new PresetValidationError('@preset/test', 'Invalid format')
      expect(error.name).toBe('PresetValidationError')
      expect(error.code).toBe('PRESET_VALIDATION_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.details.validationErrors).toEqual(['Invalid format'])
    })

    it('creates error with multiple validation errors', () => {
      const error = new PresetValidationError('@preset/test', ['Error 1', 'Error 2'])
      expect(error.details.validationErrors).toEqual(['Error 1', 'Error 2'])
    })
  })

  describe('AuthenticationError', () => {
    it('creates error with default message', () => {
      const error = new AuthenticationError()
      expect(error.name).toBe('AuthenticationError')
      expect(error.code).toBe('AUTHENTICATION_ERROR')
      expect(error.statusCode).toBe(401)
      expect(error.details.action).toBe('check_api_key')
    })

    it('merges additional details', () => {
      const error = new AuthenticationError({ hint: 'Check env vars' })
      expect(error.details.hint).toBe('Check env vars')
    })
  })

  describe('RateLimitError', () => {
    it('creates error with correct properties', () => {
      const error = new RateLimitError()
      expect(error.name).toBe('RateLimitError')
      expect(error.code).toBe('RATE_LIMIT_ERROR')
      expect(error.statusCode).toBe(429)
      expect(error.details.action).toBe('wait_and_retry')
    })
  })

  describe('StreamParseError', () => {
    it('creates error with cause', () => {
      const cause = new Error('Parse failed')
      const error = new StreamParseError(cause)
      expect(error.name).toBe('StreamParseError')
      expect(error.code).toBe('STREAM_PARSE_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.details.action).toBe('check_stream_format')
    })
  })

  describe('NetworkError', () => {
    it('creates error with cause', () => {
      const cause = new Error('Connection refused')
      const error = new NetworkError(cause, { endpoint: '/chat/completions' })
      expect(error.name).toBe('NetworkError')
      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.statusCode).toBe(0)
      expect(error.details.action).toBe('check_internet')
      expect(error.details.endpoint).toBe('/chat/completions')
    })
  })

  describe('getActionableError', () => {
    it('returns actionable guidance for PresetNotFoundError', () => {
      const error = new PresetNotFoundError('@preset/missing')
      const result = getActionableError(error)

      expect(result.success).toBe(false)
      expect(result.code).toBe('PRESET_NOT_FOUND')
      expect(result.action).toBe('create_preset')
      expect(result.guidance.title).toBe('Preset Not Found')
      expect(result.guidance.steps).toHaveLength(5)
      expect(result.guidance.steps[0]).toContain('openrouter.ai/presets')
    })

    it('returns actionable guidance for AuthenticationError', () => {
      const error = new AuthenticationError()
      const result = getActionableError(error)

      expect(result.success).toBe(false)
      expect(result.code).toBe('AUTHENTICATION_ERROR')
      expect(result.guidance.title).toBe('Authentication Failed')
      expect(result.guidance.steps).toContain('Check your OPENROUTER_API_KEY environment variable')
    })

    it('returns actionable guidance for RateLimitError', () => {
      const error = new RateLimitError()
      const result = getActionableError(error)

      expect(result.success).toBe(false)
      expect(result.guidance.title).toBe('Rate Limit Exceeded')
    })

    it('returns actionable guidance for NetworkError', () => {
      const error = new NetworkError(new Error('Network failed'))
      const result = getActionableError(error)

      expect(result.success).toBe(false)
      expect(result.guidance.title).toBe('Network Error')
    })

    it('handles unknown errors gracefully', () => {
      const error = new Error('Something unexpected')
      const result = getActionableError(error)

      expect(result.success).toBe(false)
      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.guidance.title).toBe('Unexpected Error')
    })

    it('detects missing API key from error message', () => {
      const error = new Error('OPENROUTER_API_KEY is not defined')
      const result = getActionableError(error)

      expect(result.code).toBe('MISSING_API_KEY')
      expect(result.action).toBe('configure_api_key')
      expect(result.guidance.title).toBe('API Key Missing')
    })
  })
})
