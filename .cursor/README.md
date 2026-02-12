# Cursor AI Configuration

This directory contains sub-agent configurations and project rules for the Librarian project.

## Structure

```
.cursor/
├── agents/          # Domain expert sub-agents
│   ├── engineer-tauri/
│   ├── engineer-frontend/
│   └── engineer-midi/
└── rules/           # Project-wide coding rules
```

## Sub-Agents (Domain Experts)

### 🦀 Tauri Engineer
**Location**: `agents/engineer-tauri/`  
**Expertise**: Rust backend, Tauri 2.x, IPC, cross-platform builds  
**Launch for**: Backend Rust implementation, Tauri config, platform-specific issues

### ⚛️ Frontend Engineer  
**Location**: `agents/engineer-frontend/`  
**Expertise**: React 18, TypeScript, Tailwind CSS, shadcn/ui, Tauri API integration  
**Launch for**: UI components, styling, frontend state, IPC integration

### 🎹 MIDI Engineer
**Location**: `agents/engineer-midi/`  
**Expertise**: MIDI protocol, CC mapping, pedal specifications, device communication  
**Launch for**: MIDI features, pedal parameter mapping, communication debugging

## How to Launch Sub-Agents

Sub-agents are launched using the Task tool with specialized prompts from their AGENT.md files.

**Example - Launch Tauri Engineer**:
```
Launch an engineer-tauri sub-agent to implement the list_midi_devices IPC command.
```

The AI will:
1. Read the agent configuration from `.cursor/agents/engineer-tauri/AGENT.md`
2. Launch a specialized sub-agent with domain expertise
3. The sub-agent works autonomously on the task
4. Returns results when complete

**Example - Launch Frontend Engineer**:
```
Launch an engineer-frontend sub-agent to create the Knob component for MIDI CC control.
```

**Example - Launch MIDI Engineer**:
```
Launch an engineer-midi sub-agent to design the preset format for Gen Loss MKII.
```

## Rules

Project-wide coding standards in `rules/` apply to ALL code and agents.

## Best Practices

1. **Launch agents for focused tasks** - Each agent specializes in one domain
2. **Agents work autonomously** - Give them clear objectives, let them work
3. **Use parallel agents** - Launch multiple agents for independent tasks
4. **Keep configurations updated** - Update AGENT.md as project evolves
