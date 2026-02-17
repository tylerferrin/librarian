import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Tauri IPC
const mockInvoke = vi.fn()

vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}))

// Export for use in tests
export { mockInvoke }
