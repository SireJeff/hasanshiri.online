import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn (classNames merger)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
    })

    it('should handle arrays', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('should handle objects', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })

    it('should merge tailwind classes correctly', () => {
      // twMerge should handle conflicting tailwind classes
      expect(cn('px-4', 'px-6')).toBe('px-6')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })

    it('should handle empty string', () => {
      expect(cn('foo', '', 'bar')).toBe('foo bar')
    })

    it('should return empty string for no args', () => {
      expect(cn()).toBe('')
    })

    it('should handle complex tailwind merging', () => {
      // Padding override
      expect(cn('p-4 px-2', 'px-6')).toBe('p-4 px-6')

      // Background color override
      expect(cn('bg-gray-100', 'hover:bg-gray-200', 'bg-blue-500')).toBe('hover:bg-gray-200 bg-blue-500')
    })
  })
})
