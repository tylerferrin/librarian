# Pedal Editor & Preset Manager

*A cross-platform editor and librarian for modern boutique pedals*

---

# 1\. Elevator Pitch

Modern boutique pedals like Chase Bliss and Hologram Microcosm are incredibly powerful \--- but their interfaces are dense, layered, and hard to visualize.

**This product is a cross-platform preset manager and editor for modern MIDI-enabled pedals.**

It gives musicians a clean, visual interface to:

- Build presets with full access to every parameter (including hidden/alt controls)  
- Save, organize, tag, and recall presets instantly  
- Back up their sounds  
- Manage multiple pedals from one unified interface

In short:

Stop guessing what your pedal is doing.  
Start treating it like an instrument with a real interface.

---

# 2\. MVP Product Description

## Core Concept

A desktop/iPad app that connects to MIDI-enabled pedals and provides:

- Full parameter editing via GUI  
- Preset saving and organization  
- One-click "Sync to Pedal"  
- Per-pedal editor views

The app becomes the "source of truth" for the pedal's state.

## MVP Scope (v1)

### 🎛 Preset Builder

- Full GUI for all MIDI-controllable parameters  
- Grouped logically (Main Controls / Advanced / DIP / Modulation)  
- Real-time MIDI CC output on parameter change

### 💾 Preset Manager

- Save presets locally  
- Rename, duplicate, delete  
- Tagging system (e.g., ambient, lo-fi, glitch)  
- Recall preset → sends full state to pedal

### 🔄 Sync

- "Send Full State" button  
- App assumes pedal matches after sync  
- App becomes canonical preset store

### 🎚 Multi-Pedal Framework (Basic)

- Select pedal model  
- Load pedal-specific UI \+ MIDI mapping  
- Structured architecture for adding new pedals later

## Non-Goals for MVP

- Reading current state from pedal (unless trivial)  
- Audio processing or plugin-style audio hosting  
- Cloud sync (initially local only)  
- Community preset marketplace  
- Real-time internal modulation visualization

---

# 3\. Products & Phased Development

## Product 1: Chase Bliss Generation Loss MKII Editor

### Phase 1 \-- Core Editor (MVP)

**Goal:** Full GUI control over all MIDI-accessible parameters.

Includes: \- All knobs mapped to CC \- DIP switches exposed in UI \- ALT controls exposed \- Preset save/recall \- Sync button

**Success Requirements** \- Every MIDI-controllable parameter accessible \- Stable CC transmission \- User can fully recreate any preset without touching pedal

### Phase 2 \-- Workflow Optimization

Includes: \- Basic vs Advanced UI modes \- Randomize controls \- A/B compare presets \- Preset morphing

**Success Requirements** \- Editing faster than physical workflow \- Clear UX preference for app over pedal \- At least one standout feature (e.g., morphing)

### Phase 3 \-- Advanced Integration

Includes: \- Bi-directional MIDI (if supported) \- MIDI learn \- Backup/restore preset banks

**Success Requirements** \- Reliable sync \- No state confusion \- App becomes primary preset workflow

---

## Product 2: Hologram Microcosm Editor

### Phase 1 \-- Core Editor (MVP)

Includes: \- All MIDI-accessible parameters \- Algorithm selection \- Hidden/secondary functions \- Preset save/recall \- Sync button

**Success Requirements** \- All parameters mapped \- UI clearer than physical layout \- Visual clarity of preset structure

### Phase 2 \-- Preset Experience Enhancement

Includes: \- Algorithm visualization \- Preset categories \- Performance mode UI

**Success Requirements** \- Faster sound design iteration \- Improved preset discovery

### Phase 3 \-- Creative Tools

Includes: \- Preset morphing \- Macro assignment \- Variation generator

**Success Requirements** \- Encourages experimentation \- Seen as creative expansion tool

---

# 4\. Tools Needed to Build This Cross-Platform

## Recommended Stack: Flutter

**Why:** \- True cross-platform (macOS, Windows, iPadOS, iOS) \- Single codebase \- Excellent UI control \- Strong long-term scalability

Use: \- Flutter (UI) \- Dart (logic) \- Native MIDI bridges \- SQLite or Hive for local storage

## MIDI Requirements

- CoreMIDI (macOS/iOS)  
- Windows MIDI API  
- MIDI CC \+ Program Change support  
- Optional SysEx support

## Example Preset Data Model

{

  "pedal": "GenLossMKII",

  "name": "LoFi Pad Wash",

  "tags": \["ambient", "lofi"\],

  "parameters": {

    "wow": 84,

    "flutter": 22,

    "saturate": 64,

    "dip\_classic": true

  }

}

---

# 5\. Long-Term Vision

- Platform for modern MIDI pedals  
- Preset ecosystem  
- Cloud sync & sharing  
- Artist libraries  
- Hardware controller integrations

Eventually:

The standard editor platform for boutique MIDI pedals.

---

# 6\. Current Market Climate & Differentiation

## Current Climate

Modern boutique pedals increasingly function like modular instruments:

- Deep secondary controls  
- 100+ presets  
- Heavy MIDI integration  
- Studio/live hybrid use

However, hardware interfaces remain constrained.

Software solutions exist but are: \- Brand-locked \- DAW-dependent \- Fragmented \- Not UX-focused

There is no unified standalone pedal editor platform.

## Differentiation

### Cross-Brand Platform

Not locked to one manufacturer.

### Standalone (Not DAW-Dependent)

Works live, in studio, on desktop or iPad.

### UX-First Design

Removes hardware interface constraints.

### Modern Preset Management

- Named presets  
- Tags  
- Categories  
- Search

### Scalable Architecture

Expandable to new pedals and future features.

## Why Now?

- MIDI adoption increasing  
- Boutique pedal pricing supports companion software  
- iPads common on pedalboards  
- No dominant third-party editor platform

The ecosystem is mature \--- but still open.  