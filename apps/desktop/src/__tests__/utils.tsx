import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi } from 'vitest'

// Custom render function with providers if needed
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

// Mock factory for Microcosm state
export function createMockMicrocosmState(overrides = {}) {
  return {
    currentEffect: 'Mosaic',
    currentVariation: 'A',
    activity: 64,
    mix: 100,
    time: 64,
    subdivision: 'Tap',
    ...overrides,
  }
}

// Mock factory for preset
export function createMockPreset(overrides = {}) {
  return {
    id: 'test-id-123',
    name: 'Test Preset',
    pedalType: 'microcosm',
    description: 'A test preset',
    parameters: {},
    tags: [],
    isFavorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

// Reset all mocks helper
export function resetAllMocks() {
  vi.clearAllMocks()
}

// Re-export testing library utilities
export * from '@testing-library/react'
