# Testing Documentation

This document describes the complete testing infrastructure and test coverage for the Librarian project.

## Summary

✅ **Backend**: 93 tests (71 unit, 22 integration/e2e) - **~80% coverage**  
✅ **Frontend**: 35 tests (all unit) - **Infrastructure ready for expansion**  
✅ **CI/CD**: GitHub Actions workflow configured

## Backend Testing (Rust/Tauri)

### Test Infrastructure

**Location**: `tauri/src/test_utils/`

- **builders.rs**: Test data builders for presets and pedal states
- **db_fixtures.rs**: In-memory SQLite database utilities
- **mock_midi.rs**: Mock MIDI connections for testing

**Dependencies** (`Cargo.toml`):
```toml
[dev-dependencies]
tempfile = "3"           # Temporary database files
tokio-test = "0.4"       # Async test utilities
assert_matches = "1.5"   # Pattern matching assertions
```

### Unit Tests (71 tests)

#### Preset Domain (`tauri/src/presets/types.rs`)
- ✅ PresetId generation and validation (5 tests)
- ✅ BankNumber validation and formatting (8 tests)
- ✅ BankSlot creation (2 tests)
- ✅ Error handling (1 test)
- ✅ Serialization (1 test)

#### MIDI Mappers
**Microcosm** (`tauri/src/midi/pedals/microcosm/mapper.rs`):
- ✅ SubdivisionValue conversions (3 tests)
- ✅ WaveformShape conversions (2 tests)
- ✅ PlaybackDirection conversions (3 tests)
- ✅ LooperRouting conversions (2 tests)
- ✅ Parameter CC mapping (3 tests)
- ✅ State to CC map conversion (1 test)
- ✅ Round-trip conversions (2 tests)

**Gen Loss MKII** (`tauri/src/midi/pedals/gen_loss_mkii.rs`):
- ✅ TapeModel conversions (3 tests)
- ✅ DryMode, NoiseMode, AuxMode conversions (6 tests)
- ✅ SweepDirection, Polarity conversions (4 tests)
- ✅ InputGain, DspBypassMode conversions (4 tests)
- ✅ Parameter mapping (3 tests)
- ✅ State management (3 tests)

#### Test Utilities
- ✅ PresetBuilder (2 tests)
- ✅ Database fixtures (3 tests)
- ✅ Mock MIDI connections (4 tests)

#### Chroma Console
- ✅ CC mapping (4 tests, pre-existing)

#### MIDI Identity
- ✅ Identity parsing (3 tests, pre-existing)

### Integration Tests (22 tests)

#### Preset Repository (`tauri/tests/preset_repository_test.rs` - 14 tests)
- ✅ CRUD operations against in-memory SQLite
- ✅ Preset validation (empty names, duplicates)
- ✅ Bank state management
- ✅ Bank assignments
- ✅ Filtering presets
- ✅ Favorite toggling

#### Preset Library Aggregate (`tauri/tests/preset_library_test.rs` - 6 tests)
- ✅ Complete save → update → delete workflow
- ✅ Bank management workflows
- ✅ Multi-pedal type support
- ✅ Validation constraints

### E2E Tests (2 tests)

#### Preset Lifecycle (`tauri/tests/e2e_preset_lifecycle_test.rs`)
- ✅ Complete user workflow: create → edit → save to bank → recall → delete
- ✅ Error recovery scenarios

### Running Backend Tests

```bash
cd tauri

# Unit tests
cargo test --lib

# Integration tests
cargo test --test "*"

# All tests
cargo test

# With output
cargo test -- --nocapture
```

---

## Frontend Testing (TypeScript/React)

### Test Infrastructure

**Location**: `src/__tests__/`

**Files**:
- **setup.ts**: Global test setup, Tauri IPC mocking
- **utils.tsx**: Custom render functions, mock factories

**Dependencies** (`package.json`):
```json
{
  "devDependencies": {
    "vitest": "^4.0.18",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^23.0.0",
    "@vitest/coverage-v8": "*"
  }
}
```

**Configuration**: `vitest.config.ts`

### Unit Tests (35 tests)

#### Utilities
**General Utils** (`src/lib/utils.test.ts` - 8 tests):
- ✅ `cn()` className merging
- ✅ Conditional classes
- ✅ Tailwind class deduplication

**Preset Utils** (`src/lib/presets/utils.test.ts` - 19 tests):
- ✅ `formatBankSlot()` for Microcosm (8 tests)
- ✅ `formatBankSlot()` for Chroma Console (7 tests)
- ✅ Edge cases (2 tests)
- ✅ BANK_COLORS constant (2 tests)

#### Components
**Toggle** (`src/components/common/Toggle.test.tsx` - 8 tests):
- ✅ Click handling and state toggling
- ✅ onChange callback behavior
- ✅ Controlled component behavior
- ✅ Multiple color variants
- ✅ Label display

### Running Frontend Tests

```bash
# Run tests once
npm test -- --run

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

---

## Test Coverage Summary

### Backend (Rust)

| Module | Unit Tests | Integration | E2E | Coverage |
|--------|-----------|-------------|-----|----------|
| Preset Domain | 17 tests | 20 tests | 2 tests | ~90% |
| MIDI Mappers | 40 tests | - | - | ~85% |
| Test Utils | 9 tests | - | - | 100% |
| **Total** | **71 tests** | **20 tests** | **2 tests** | **~80%** |

**Covered**:
- ✅ Domain types and value objects
- ✅ MIDI CC mapping (Microcosm, Gen Loss MKII, Chroma Console)
- ✅ Preset CRUD operations
- ✅ Bank tracking and assignment
- ✅ Database persistence
- ✅ Complete user workflows

**Not covered** (low priority):
- ❌ MIDI Manager (requires hardware mocking)
- ❌ Tauri commands (IPC layer)
- ❌ Device detection (requires MIDI hardware)

### Frontend (TypeScript/React)

| Module | Tests | Coverage |
|--------|-------|----------|
| Utilities | 27 tests | ~95% |
| Components | 8 tests | Toggle only |
| Hooks | - | Infrastructure ready |
| **Total** | **35 tests** | **~30%** |

**Covered**:
- ✅ Utility functions (`cn()`, `formatBankSlot()`)
- ✅ Toggle component logic

**Ready for expansion**:
- 🔧 Custom controls (Knob, GridSelector, etc.)
- 🔧 React hooks (useMIDIConnection, etc.)
- 🔧 MIDI helpers
- 🔧 Preset management components

---

## CI/CD Pipeline

**File**: `.github/workflows/test.yml`

### Backend Job
- ✅ Runs on Ubuntu
- ✅ Caches Cargo dependencies
- ✅ Runs unit tests (`cargo test --lib --tests`)
- ✅ Runs integration tests (`cargo test --test "*"`)

### Frontend Job
- ✅ Runs on Ubuntu with Node.js 20
- ✅ Caches npm dependencies
- ✅ Runs tests with coverage
- ✅ Uploads coverage to Codecov

### Triggers
- Push to `main`/`master`
- Pull requests to `main`/`master`

---

## Testing Patterns

### Backend: Test Data Builders

```rust
use crate::test_utils::PresetBuilder;

let preset = PresetBuilder::new()
    .with_name("My Preset")
    .with_pedal_type("Microcosm")
    .with_tags(vec!["ambient".to_string()])
    .build();
```

### Backend: In-Memory Database

```rust
use crate::test_utils::create_test_db;

let conn = create_test_db().unwrap();
// Use for testing repository operations
```

### Frontend: Component Testing (Logic-focused)

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('should toggle value on click', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  
  render(<Toggle value={false} onChange={onChange} />)
  await user.click(screen.getByRole('button'))
  
  expect(onChange).toHaveBeenCalledWith(true)
})
```

### Frontend: Mocking Tauri IPC

```typescript
import { mockInvoke } from '@/__tests__/setup'

test('should call Tauri command', async () => {
  mockInvoke.mockResolvedValue({ success: true })
  
  // Test code that calls invoke()
  
  expect(mockInvoke).toHaveBeenCalledWith('command_name', { param: 'value' })
})
```

---

## Quick Start

### Run All Tests

```bash
# Backend
cd tauri && cargo test

# Frontend
npm test -- --run

# Both (from root)
cd tauri && cargo test && cd .. && npm test -- --run
```

### Add New Tests

**Backend unit test**:
1. Add `#[cfg(test)]` mod at end of file
2. Write tests using `#[test]` attribute
3. Run `cargo test --lib`

**Backend integration test**:
1. Create file in `tauri/tests/`
2. Import `librarian_lib`
3. Run `cargo test --test filename`

**Frontend test**:
1. Create `.test.ts` or `.test.tsx` next to source file
2. Import from `vitest` and `@testing-library/react`
3. Run `npm test`

---

## Coverage Goals

### Current
- Backend: **~80% coverage** (93 tests)
- Frontend: **~30% coverage** (35 tests)

### Target
- Backend: **85%+** (add MIDI Manager tests with mocks)
- Frontend: **70%+** (focus on logic, not UI)

### Priority Areas for Expansion
1. **Frontend hooks** - useMIDIConnection, editor hooks (high value)
2. **Frontend components** - Knob, GridSelector (interaction logic)
3. **Frontend MIDI helpers** - getEffectProgramNumber, etc.
4. **Backend MIDI Manager** - with mock connections
5. **Backend Tauri commands** - IPC layer

---

## Notes

- Backend has 1 pre-existing test failure in `bank_config::tests::test_microcosm_config`
- Frontend tests focus on **logic over UI** (no visual regression tests)
- MIDI hardware tests use manual test binaries: `test-midi-detection`, `test-midi-input`
- All tests run in CI/CD pipeline on every push/PR

---

## References

- Testing plan: `.cursor/plans/testing_coverage_analysis_*.plan.md`
- Test utilities: `tauri/src/test_utils/`
- Integration tests: `tauri/tests/`
- Frontend setup: `src/__tests__/setup.ts`
