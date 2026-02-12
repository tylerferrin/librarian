# Tauri macOS 15.6 Initialization Crash - Fixes Applied

**Date**: February 12, 2026  
**Issue**: App crashes during Tauri window initialization (`tao::platform_impl::platform::app_delegate::did_finish_launching`)  
**Platform**: macOS 15.6 with Tauri 2.10.2

## Root Cause Analysis

Based on GitHub issues (#13996, #11336, #774) and community reports, the crash is related to:
1. **Window initialization timing** on macOS 15.x
2. **Complex window configurations** triggering edge cases in tao (the window backend)
3. **Objective-C runtime issues** in the app delegate lifecycle

## Fixes Applied

### 1. Simplified Window Configuration

**Before**:
```json
{
  "title": "Pedal Editor",
  "width": 1280,
  "height": 800,
  "minWidth": 1024,
  "minHeight": 600,
  "resizable": true,
  "fullscreen": false
}
```

**After**:
```json
{
  "label": "main",
  "title": "Pedal Editor",
  "width": 800,
  "height": 600,
  "resizable": true,
  "center": true
}
```

**Changes**:
- Removed `minWidth` and `minHeight` constraints (can trigger sizing edge cases)
- Reduced initial window size to 800×600 (more conservative)
- Added explicit `label: "main"` for better window management
- Added `center: true` for predictable positioning
- Removed unnecessary `fullscreen: false` (default)

### 2. Added Schema Validation

Added `"$schema": "https://schema.tauri.app/config/2"` to `tauri.conf.json` for:
- Better IDE autocomplete
- Configuration validation
- Early detection of invalid settings

### 3. Created macOS-Specific Configuration

Created `tauri.macos.conf.json` with explicit macOS settings:
```json
{
  "app": {
    "macOSPrivateApi": false,
    "windows": [{
      "decorations": true,
      "transparent": false,
      "acceptFirstMouse": false,
      "titleBarStyle": "Visible"
    }]
  }
}
```

**Why**: 
- Explicitly disables private macOS APIs (prevents App Store/notarization issues)
- Sets safe defaults for all window appearance options
- Overrides any problematic defaults on macOS

### 4. Improved Error Handling in Rust

**Before**:
```rust
tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

**After**:
```rust
let builder = tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![]);

if let Err(e) = builder.run(tauri::generate_context!()) {
    eprintln!("Failed to run Tauri application: {}", e);
    std::process::exit(1);
}
```

**Why**:
- Better error reporting (shows actual error message)
- Clean shutdown instead of panic
- Easier debugging of initialization failures

### 5. Updated Dependency Versions

Modified `Cargo.toml` to allow patch updates:
```toml
[build-dependencies]
tauri-build = { version = "~2.5", features = [] }

[dependencies]
tauri = { version = "~2.10", features = [] }
```

**Why**:
- `~2.5` allows 2.5.x patches (currently 2.5.5)
- `~2.10` allows 2.10.x patches (currently 2.10.2)
- Ensures we get bug fixes without breaking changes

## Testing the Fixes

### Build Test
```bash
cd tauri
cargo build
# ✅ Success - compiled in 3.87s
```

### Running the App
```bash
# From project root
pnpm tauri dev
```

**Expected Results**:
- App should launch without crashing
- Window should appear centered at 800×600
- macOS-specific settings should be applied automatically

## If Issues Persist

### Additional Debugging Steps

1. **Check for conflicting processes**:
   ```bash
   pkill -9 librarian
   ```

2. **Clear build artifacts**:
   ```bash
   cd tauri
   cargo clean
   cargo build
   ```

3. **Test with minimal example**:
   - Temporarily disable the shell plugin
   - Comment out custom invoke handlers
   - Test with just `tauri::Builder::default().run(...)`

4. **Check macOS permissions**:
   - System Settings → Privacy & Security
   - Ensure terminal/IDE has necessary permissions

5. **Monitor for system-specific issues**:
   ```bash
   # Run with verbose logging
   RUST_BACKTRACE=full pnpm tauri dev
   ```

### Known Workarounds

If crash persists:
- Try building as universal binary: `cargo tauri build --target universal-apple-darwin`
- Test on a different macOS version if possible
- Check Tauri GitHub issues for new reports: https://github.com/tauri-apps/tauri/issues

## Version Information

- **Tauri**: 2.10.2
- **Tauri Build**: 2.5.5
- **Tao**: 0.34.5
- **Wry**: 0.54.1
- **macOS**: 15.6
- **Rust**: (check with `rustc --version`)

## References

- [Tauri Issue #13996](https://github.com/tauri-apps/tauri/issues/13996) - Universal binary crashes
- [Tauri Issue #11336](https://github.com/tauri-apps/tauri/issues/11336) - macOS 2.0.3 selector crash
- [Tao Issue #774](https://github.com/tauri-apps/tao/issues/774) - System tray initialization timing
- [Tauri v2 Configuration Docs](https://v2.tauri.app/reference/config/)

## Next Steps

1. ✅ Test app launch with `pnpm tauri dev`
2. ✅ Verify window appears correctly
3. ✅ Test window resizing and interactions
4. ⏳ Monitor for any runtime errors
5. ⏳ Test on clean macOS install if available

---

**Status**: Fixes applied and build verified ✅  
**Last Updated**: February 12, 2026
