# Project Conventions

Universal coding standards for the Librarian project.

## Directory Structure

```
librarian/
├── src/          # Frontend (React/TypeScript)
├── tauri/        # Backend (Rust/Tauri)
├── docs/         # Technical documentation
└── research/     # Framework evaluations
```

**Never** use `src-tauri`. The backend directory is `tauri/`.

## Coding Standards

### TypeScript
- **Strict mode**: Always enabled
- **No `any`**: Use proper types or `unknown`
- **Interfaces over types**: For object shapes
- **Path aliases**: Use `@/` for imports from `src/`

```typescript
// Good
import { Button } from '@/components/ui/button';
interface Props { value: number; }

// Bad
import { Button } from '../../../components/ui/button';
type Props = { value: any; }
```

### Rust
- **Error handling**: Use `Result<T, E>`, never panic in library code
- **Async for I/O**: MIDI and database operations
- **thiserror**: For domain-specific errors
- **Clippy clean**: Run `cargo clippy` before commits

```rust
// Good
#[derive(Debug, thiserror::Error)]
pub enum MidiError {
    #[error("Device not found: {0}")]
    DeviceNotFound(String),
}

// Bad
panic!("Device not found!");
```

### Naming Conventions
- **Files**: `kebab-case.tsx`, `snake_case.rs`
- **Components**: `PascalCase`
- **Functions**: `camelCase` (TS), `snake_case` (Rust)
- **Constants**: `SCREAMING_SNAKE_CASE`

## Architecture Principles

1. **Frontend calls backend via IPC** - No direct file/MIDI access from frontend
2. **Backend is source of truth** - Especially for MIDI state and presets
3. **Components are composable** - Break down complex UIs
4. **Type safety everywhere** - No runtime type surprises

## Git Workflow

### Commit Messages
Follow conventional commits:
```
feat(midi): add CC mapping for Gen Loss MKII
fix(ui): resolve knob drag sensitivity
docs(readme): update installation steps
```

### Branches
- `main` - Stable code
- `feat/*` - New features
- `fix/*` - Bug fixes

## Documentation

- **CHANGELOG.md**: Architectural changes only
- **docs/**: Technical guides and troubleshooting
- **Code comments**: Explain "why", not "what"

## Performance

- **Debounce MIDI**: 20-50ms for UI-triggered CC changes
- **Memoize renders**: Use `React.memo` for expensive components
- **Lazy load**: Code-split pedal editors

## Accessibility

- **Keyboard navigation**: Tab order, Enter/Space for actions
- **ARIA labels**: On custom controls (Knobs, Sliders)
- **Focus indicators**: Visible focus states

## Testing Strategy (Future)

- **Unit tests**: Business logic (Rust + TS)
- **Integration tests**: MIDI communication with virtual devices
- **E2E tests**: Critical user flows with Tauri

## Platform Targets

1. **macOS** (MVP) - Primary development and testing
2. **Windows** (Phase 4) - Full feature parity
3. **iPad** (Phase 5) - Touch-optimized UI
