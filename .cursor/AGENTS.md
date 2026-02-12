# Domain Expert Sub-Agents

Specialized AI agents for different aspects of the Librarian project.

## Available Experts

### 🦀 Tauri Engineer
```
@engineer-tauri
```

**Specialization**: Rust backend, Tauri 2.x configuration, cross-platform builds  
**Knowledge Areas**:
- Rust development in `/tauri` directory
- Tauri IPC command handlers
- Window management and platform-specific issues
- midir MIDI backend implementation
- rusqlite database operations
- macOS/Windows/iPad compatibility

**When to use**:
- Building Rust backend features
- Debugging Tauri initialization or build issues
- Implementing IPC commands
- Platform-specific troubleshooting

---

### ⚛️ Frontend Engineer
```
@engineer-frontend
```

**Specialization**: React 18, TypeScript, Tailwind CSS, UI/UX  
**Knowledge Areas**:
- React components in `/src` directory
- Custom MIDI controls (Knob, Slider, DIPSwitch)
- Tailwind CSS 4 styling
- shadcn/ui component patterns
- Tauri API frontend integration
- State management and IPC

**When to use**:
- Building UI components
- Styling and layout
- Frontend state management
- Integrating with backend commands
- Accessibility and UX improvements

---

### 🎹 MIDI Engineer
```
@engineer-midi
```

**Specialization**: MIDI protocol, pedal specifications, device communication  
**Knowledge Areas**:
- MIDI 1.0 protocol (CC, SysEx)
- Chase Bliss Gen Loss MKII specifications
- CC parameter mapping
- Preset serialization/deserialization
- Device enumeration and connection
- Rate limiting and error handling

**When to use**:
- Implementing MIDI features
- Mapping pedal parameters
- Debugging MIDI communication
- Adding support for new pedals
- Preset format design

---

## How to Launch Agents

### Single Agent Tasks
Launch one specialized agent for focused work:

```
"Launch engineer-tauri to implement the list_midi_devices IPC command"

"Launch engineer-frontend to create the Knob component"

"Launch engineer-midi to map all Gen Loss MKII CC parameters"
```

### Parallel Agent Tasks  
Launch multiple agents simultaneously for independent work:

```
"Launch these agents in parallel:
1. engineer-tauri: implement backend MIDI device enumeration
2. engineer-frontend: create device selector dropdown component
3. engineer-midi: design the CC parameter validation rules"
```

### Sequential Agent Tasks
Launch agents that depend on each other's output:

```
"Launch engineer-midi to design the preset JSON format first.
Then launch engineer-tauri to implement the database schema.
Then launch engineer-frontend to build the preset management UI."
```

## Expert Knowledge Boundaries

| Area | engineer-tauri | engineer-frontend | engineer-midi |
|------|---------------|------------------|---------------|
| Rust backend | ✅ Primary | ❌ | 🟡 MIDI lib usage |
| React UI | ❌ | ✅ Primary | ❌ |
| MIDI protocol | 🟡 Implementation | ❌ | ✅ Primary |
| Tauri IPC | ✅ Backend side | ✅ Frontend side | ❌ |
| Database | ✅ Primary | ❌ | 🟡 Preset storage |
| Styling | ❌ | ✅ Primary | ❌ |

✅ Primary expertise | 🟡 Supporting knowledge | ❌ Outside expertise

## Maintaining Expert Knowledge

As the project evolves, keep skills updated:

1. **Architecture changes** → Update relevant SKILL.md
2. **New patterns** → Add to skills or project conventions
3. **New pedals** → Update MIDI Engineer with specs
4. **New dependencies** → Document in relevant skill

**Location**: `.cursor/skills/{expert-name}/SKILL.md`

## Project Conventions

For rules that apply to ALL domains, see:
- **[Project Conventions](.cursor/rules/project-conventions.md)** - Universal coding standards
