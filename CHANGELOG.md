# Changelog

All notable architectural changes and major milestones will be documented in this file.

## [Unreleased]

### Changed
- **Directory Structure**: Renamed `src-tauri/` → `tauri/` for clearer separation between frontend (`src/`) and backend (`tauri/`)
- **Tauri Configuration**: Simplified window configuration to resolve macOS 15.6 initialization crashes
  - Removed min size constraints
  - Added macOS-specific config file
  - Improved error handling in Rust initialization

### Added
- Initial project setup with Tauri 2.10 + React 18 + TypeScript
- Rust dependencies: midir, rusqlite, uuid, thiserror
- UI stack: Tailwind CSS 4, shadcn/ui components
- Comprehensive research documentation in `/research`

---

## [0.1.0] - 2026-02-12

### Added
- Initial repository structure
- Development environment configuration
- Technical research and framework evaluation
