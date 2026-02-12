# Domain Expert Sub-Agents

Specialized autonomous agents for different aspects of the Librarian project.

## Available Agents

| Agent | Expertise | Use For |
|-------|-----------|---------|
| 🦀 **engineer-tauri** | Rust, Tauri, midir, rusqlite | Backend implementation, IPC, platform issues |
| ⚛️ **engineer-frontend** | React, TypeScript, Tailwind | UI components, styling, frontend state |
| 🎹 **engineer-midi** | MIDI protocol, pedal specs | CC mapping, presets, communication |

## Quick Start

### Launch a Single Agent

```
"Launch engineer-tauri to implement the send_midi_cc IPC command"
```

The AI will:
1. Read `agents/engineer-tauri/AGENT.md`
2. Launch sub-agent with specialized prompt
3. Agent works autonomously with domain expertise
4. Returns completed implementation

### Launch Multiple Agents in Parallel

```
"Launch in parallel:
- engineer-tauri: backend MIDI enumeration  
- engineer-frontend: device selector UI
- engineer-midi: CC validation rules"
```

All three agents work simultaneously on independent tasks.

## Agent Configurations

Each agent has an `AGENT.md` file containing:
- **Launch instructions** - When to use this agent
- **Agent prompt** - Full context and expertise
- **Common tasks** - Example use cases
- **Dependencies** - Key libraries and versions
- **Known issues** - Domain-specific gotchas

## Creating New Agents

```bash
mkdir -p .cursor/agents/new-agent-name
```

Create `AGENT.md`:
```markdown
# New Agent Name

## Launch Instructions
[When to use this agent]

## Agent Prompt
[Full context, expertise, coding standards]

## Common Tasks
[Example launch commands]
```

## Best Practices

1. **Be specific** - Give agents clear, focused objectives
2. **Include context** - Reference files, specs, requirements
3. **Let them work** - Agents are autonomous, don't micromanage
4. **Use parallel** - Launch multiple agents for independent tasks
5. **Keep configs updated** - Update AGENT.md as project evolves

## Agent Responsibilities

### Tauri Engineer
- Rust backend code in `/tauri`
- Tauri IPC command handlers
- MIDI communication (midir)
- Database operations (rusqlite)
- Build and config issues
- Platform compatibility

### Frontend Engineer
- React components in `/src`
- TypeScript interfaces and types
- Tailwind CSS styling
- shadcn/ui components
- Tauri API integration
- State management

### MIDI Engineer
- MIDI protocol implementation
- Pedal CC parameter mapping
- Preset format design
- Device communication logic
- Rate limiting strategies
- Multi-pedal architecture

## Example Workflows

### Implementing a New Feature

**Task**: Add preset recall functionality

```
1. Launch engineer-midi:
   "Design the preset format including all Gen Loss MKII parameters,
   metadata (name, tags), and validation rules"

2. Launch engineer-tauri:
   "Implement preset storage using rusqlite. Create table schema,
   CRUD operations, and IPC commands based on the format from
   engineer-midi"

3. Launch engineer-frontend:
   "Create preset library UI with search, filter by tags, and
   one-click recall. Use the IPC commands from engineer-tauri"
```

### Debugging an Issue

**Issue**: MIDI CC values not updating pedal

```
Launch engineer-midi:
"Debug why CC messages aren't updating Gen Loss MKII. Check:
- Correct CC numbers (verify against manual)
- Value range (0-127)
- Message format (status byte, CC, value)
- Rate limiting (check if messages too fast)
Provide diagnostic steps and fixes"
```

### Adding a New Pedal

**Task**: Add Hologram Microcosm support

```
Launch in parallel:

1. engineer-midi:
   "Research and document Hologram Microcosm MIDI spec.
   Create CC parameter map, identify SysEx if available,
   document differences from Gen Loss MKII"

2. engineer-tauri:
   "Design multi-pedal architecture. Create PedalProfile trait,
   implement factory pattern for pedal-specific logic,
   extend database schema for multiple pedal types"

3. engineer-frontend:
   "Design pedal switcher UI. Create dropdown to select active pedal,
   dynamically load pedal-specific editor component,
   handle different parameter layouts"
```
