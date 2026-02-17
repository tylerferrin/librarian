import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', true && 'bar', false && 'baz')
    expect(result).toBe('foo bar')
  })

  it('should handle arrays', () => {
    const result = cn(['foo', 'bar'])
    expect(result).toBe('foo bar')
  })

  it('should merge Tailwind classes correctly', () => {
    // Tailwind merge should dedupe conflicting classes
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('should handle undefined and null', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle objects', () => {
    const result = cn({ foo: true, bar: false, baz: true })
    expect(result).toBe('foo baz')
  })

  it('should merge complex Tailwind classes', () => {
    const result = cn(
      'bg-red-500 text-white',
      'bg-blue-500', // Should override bg-red-500
      'font-bold'
    )
    expect(result).toBe('text-white bg-blue-500 font-bold')
  })
})
