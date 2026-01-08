import { themeColors, getRandomTheme } from '@/lib/colors'

describe('colors', () => {
  describe('themeColors', () => {
    it('should have 6 theme colors', () => {
      expect(themeColors).toHaveLength(6)
    })

    it('should have correct color structure', () => {
      themeColors.forEach(color => {
        expect(color).toHaveProperty('name')
        expect(color).toHaveProperty('hue')
        expect(color).toHaveProperty('baseHue')
        expect(color).toHaveProperty('class')
        expect(typeof color.name).toBe('string')
        expect(typeof color.hue).toBe('number')
        expect(typeof color.baseHue).toBe('string')
        expect(typeof color.class).toBe('string')
      })
    })

    it('should include expected theme names', () => {
      const names = themeColors.map(c => c.name)
      expect(names).toContain('emerald')
      expect(names).toContain('purple')
      expect(names).toContain('blue')
      expect(names).toContain('rose')
      expect(names).toContain('amber')
      expect(names).toContain('indigo')
    })

    it('should have class names matching theme-{name} pattern', () => {
      themeColors.forEach(color => {
        expect(color.class).toBe(`theme-${color.name}`)
      })
    })
  })

  describe('getRandomTheme', () => {
    it('should return a valid theme object', () => {
      const theme = getRandomTheme()
      expect(theme).toHaveProperty('name')
      expect(theme).toHaveProperty('hue')
      expect(theme).toHaveProperty('baseHue')
      expect(theme).toHaveProperty('class')
    })

    it('should return one of the available themes', () => {
      const theme = getRandomTheme()
      const themeNames = themeColors.map(c => c.name)
      expect(themeNames).toContain(theme.name)
    })

    it('should not return the same theme twice in a row', () => {
      // Get first theme
      const firstTheme = getRandomTheme()

      // Get several more themes and verify at least one is different
      let foundDifferent = false
      for (let i = 0; i < 10; i++) {
        const nextTheme = getRandomTheme()
        if (nextTheme.name !== firstTheme.name) {
          foundDifferent = true
          break
        }
      }

      expect(foundDifferent).toBe(true)
    })
  })
})
