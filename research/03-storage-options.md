# Storage Solutions for Preset Management

*Research for Pedal Editor & Preset Manager - Local Data Storage Strategy*

---

## Executive Summary

For production-quality preset management with 1000+ presets, **better-sqlite3** (or **rusqlite** for Tauri) provides the best balance of performance, querying capability, and simplicity.

For quick prototyping: **lowdb** with JSON files.

---

## Requirements Analysis

### Functional Requirements

- Store presets with parameters, tags, metadata
- Fast search and filtering by:
  - Tags (e.g., "ambient", "glitch", "bass")
  - Categories (e.g., "delay", "reverb")
  - Pedal type (e.g., "Gen Loss MKII", "Microcosm")
  - Name (full-text search)
- Handle 100s to 1000s of presets
- Simple backup/export (for users to save their work)
- Import/export for sharing presets

### Non-Functional Requirements

- Fast queries (<50ms for filtering)
- Reliable persistence (no data loss)
- Simple backup (copy file or export JSON)
- Works in desktop environment (Tauri/Electron)
- Minimal setup complexity

---

## Option 1: SQLite (Recommended)

### Overview

Embedded SQL database. Single file, no server needed. ACID transactions.

### Implementation Options

#### A. better-sqlite3 (Node.js/Electron)

**Repository**: https://github.com/WiseLibs/better-sqlite3  
**NPM**: `better-sqlite3`

**Performance**: 10-15x faster than async sqlite3 for small operations.

```typescript
// src/lib/database.ts
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'presets.db');
const db = new Database(dbPath);

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS presets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pedal_type TEXT NOT NULL,
    category TEXT,
    parameters TEXT NOT NULL,
    tags TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
  
  CREATE INDEX IF NOT EXISTS idx_pedal_type ON presets(pedal_type);
  CREATE INDEX IF NOT EXISTS idx_category ON presets(category);
  CREATE INDEX IF NOT EXISTS idx_created_at ON presets(created_at DESC);
  
  -- Full-text search
  CREATE VIRTUAL TABLE IF NOT EXISTS presets_fts USING fts5(
    name,
    tags,
    content='presets',
    content_rowid='rowid'
  );
  
  -- Triggers to keep FTS in sync
  CREATE TRIGGER IF NOT EXISTS presets_ai AFTER INSERT ON presets BEGIN
    INSERT INTO presets_fts(rowid, name, tags)
    VALUES (new.rowid, new.name, new.tags);
  END;
  
  CREATE TRIGGER IF NOT EXISTS presets_ad AFTER DELETE ON presets BEGIN
    DELETE FROM presets_fts WHERE rowid = old.rowid;
  END;
  
  CREATE TRIGGER IF NOT EXISTS presets_au AFTER UPDATE ON presets BEGIN
    UPDATE presets_fts SET name = new.name, tags = new.tags
    WHERE rowid = new.rowid;
  END;
`);

export interface Preset {
  id: string;
  name: string;
  pedal_type: string;
  category?: string;
  parameters: Record<string, any>;
  tags?: string[];
  created_at: number;
  updated_at: number;
}

export class PresetRepository {
  // Create
  createPreset(preset: Omit<Preset, 'created_at' | 'updated_at'>): Preset {
    const stmt = db.prepare(`
      INSERT INTO presets (id, name, pedal_type, category, parameters, tags)
      VALUES (@id, @name, @pedal_type, @category, @parameters, @tags)
      RETURNING *
    `);
    
    const result = stmt.get({
      id: preset.id,
      name: preset.name,
      pedal_type: preset.pedal_type,
      category: preset.category,
      parameters: JSON.stringify(preset.parameters),
      tags: preset.tags ? preset.tags.join(',') : null,
    });
    
    return this.parsePreset(result);
  }
  
  // Read
  getPreset(id: string): Preset | undefined {
    const stmt = db.prepare('SELECT * FROM presets WHERE id = ?');
    const result = stmt.get(id);
    return result ? this.parsePreset(result) : undefined;
  }
  
  // List all
  getAllPresets(): Preset[] {
    const stmt = db.prepare('SELECT * FROM presets ORDER BY created_at DESC');
    return stmt.all().map(this.parsePreset);
  }
  
  // Filter by pedal type
  getPresetsByPedal(pedalType: string): Preset[] {
    const stmt = db.prepare('SELECT * FROM presets WHERE pedal_type = ? ORDER BY created_at DESC');
    return stmt.all(pedalType).map(this.parsePreset);
  }
  
  // Filter by tags (any match)
  getPresetsByTags(tags: string[]): Preset[] {
    const placeholders = tags.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT * FROM presets
      WHERE tags LIKE '%' || ? || '%'
      ORDER BY created_at DESC
    `);
    
    // SQLite doesn't have array contains, so we use LIKE
    // For production, consider JSON1 extension
    const results: any[] = [];
    for (const tag of tags) {
      results.push(...stmt.all(tag));
    }
    
    // Deduplicate by id
    const unique = Array.from(new Map(results.map(r => [r.id, r])).values());
    return unique.map(this.parsePreset);
  }
  
  // Full-text search
  searchPresets(query: string): Preset[] {
    const stmt = db.prepare(`
      SELECT p.* FROM presets p
      INNER JOIN presets_fts fts ON p.rowid = fts.rowid
      WHERE presets_fts MATCH ?
      ORDER BY rank
    `);
    
    return stmt.all(query).map(this.parsePreset);
  }
  
  // Update
  updatePreset(id: string, updates: Partial<Preset>): void {
    const fields: string[] = [];
    const values: any = { id };
    
    if (updates.name !== undefined) {
      fields.push('name = @name');
      values.name = updates.name;
    }
    if (updates.category !== undefined) {
      fields.push('category = @category');
      values.category = updates.category;
    }
    if (updates.parameters !== undefined) {
      fields.push('parameters = @parameters');
      values.parameters = JSON.stringify(updates.parameters);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = @tags');
      values.tags = updates.tags.join(',');
    }
    
    fields.push('updated_at = strftime("%s", "now")');
    
    const stmt = db.prepare(`
      UPDATE presets SET ${fields.join(', ')} WHERE id = @id
    `);
    
    stmt.run(values);
  }
  
  // Delete
  deletePreset(id: string): void {
    const stmt = db.prepare('DELETE FROM presets WHERE id = ?');
    stmt.run(id);
  }
  
  // Backup
  backup(destPath: string): void {
    db.backup(destPath);
  }
  
  // Export all presets as JSON
  exportToJSON(): string {
    const presets = this.getAllPresets();
    return JSON.stringify(presets, null, 2);
  }
  
  // Import from JSON
  importFromJSON(json: string): number {
    const presets = JSON.parse(json) as Preset[];
    const insert = db.prepare(`
      INSERT OR REPLACE INTO presets (id, name, pedal_type, category, parameters, tags, created_at, updated_at)
      VALUES (@id, @name, @pedal_type, @category, @parameters, @tags, @created_at, @updated_at)
    `);
    
    const importMany = db.transaction((presets: Preset[]) => {
      for (const preset of presets) {
        insert.run({
          ...preset,
          parameters: JSON.stringify(preset.parameters),
          tags: preset.tags ? preset.tags.join(',') : null,
        });
      }
    });
    
    importMany(presets);
    return presets.length;
  }
  
  // Helper
  private parsePreset(row: any): Preset {
    return {
      id: row.id,
      name: row.name,
      pedal_type: row.pedal_type,
      category: row.category,
      parameters: JSON.parse(row.parameters),
      tags: row.tags ? row.tags.split(',') : [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const presetRepo = new PresetRepository();
```

#### B. rusqlite (Rust/Tauri)

**Repository**: https://github.com/rusqlite/rusqlite  
**Crate**: `rusqlite`

```rust
// tauri/src/database.rs
use rusqlite::{Connection, Result, params};
use serde::{Serialize, Deserialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct Preset {
    pub id: String,
    pub name: String,
    pub pedal_type: String,
    pub category: Option<String>,
    pub parameters: serde_json::Value,
    pub tags: Option<Vec<String>>,
    pub created_at: i64,
    pub updated_at: i64,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS presets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                pedal_type TEXT NOT NULL,
                category TEXT,
                parameters TEXT NOT NULL,
                tags TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                updated_at INTEGER DEFAULT (strftime('%s', 'now'))
            );
            
            CREATE INDEX IF NOT EXISTS idx_pedal_type ON presets(pedal_type);
            CREATE INDEX IF NOT EXISTS idx_category ON presets(category);
            CREATE INDEX IF NOT EXISTS idx_created_at ON presets(created_at DESC);
            
            CREATE VIRTUAL TABLE IF NOT EXISTS presets_fts USING fts5(
                name,
                tags,
                content='presets',
                content_rowid='rowid'
            );"
        )?;
        
        Ok(Database { conn })
    }
    
    pub fn create_preset(&self, preset: &Preset) -> Result<()> {
        let tags_str = preset.tags.as_ref()
            .map(|t| t.join(","))
            .unwrap_or_default();
        
        self.conn.execute(
            "INSERT INTO presets (id, name, pedal_type, category, parameters, tags)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                preset.id,
                preset.name,
                preset.pedal_type,
                preset.category,
                preset.parameters.to_string(),
                tags_str,
            ],
        )?;
        
        Ok(())
    }
    
    pub fn get_preset(&self, id: &str) -> Result<Option<Preset>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, pedal_type, category, parameters, tags, created_at, updated_at
             FROM presets WHERE id = ?1"
        )?;
        
        let preset = stmt.query_row([id], |row| {
            Ok(Preset {
                id: row.get(0)?,
                name: row.get(1)?,
                pedal_type: row.get(2)?,
                category: row.get(3)?,
                parameters: serde_json::from_str(&row.get::<_, String>(4)?).unwrap(),
                tags: row.get::<_, Option<String>>(5)?
                    .map(|s| s.split(',').map(String::from).collect()),
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        }).optional()?;
        
        Ok(preset)
    }
    
    pub fn get_all_presets(&self) -> Result<Vec<Preset>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, pedal_type, category, parameters, tags, created_at, updated_at
             FROM presets ORDER BY created_at DESC"
        )?;
        
        let presets = stmt.query_map([], |row| {
            Ok(Preset {
                id: row.get(0)?,
                name: row.get(1)?,
                pedal_type: row.get(2)?,
                category: row.get(3)?,
                parameters: serde_json::from_str(&row.get::<_, String>(4)?).unwrap(),
                tags: row.get::<_, Option<String>>(5)?
                    .map(|s| s.split(',').map(String::from).collect()),
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?;
        
        presets.collect()
    }
    
    pub fn search_presets(&self, query: &str) -> Result<Vec<Preset>> {
        let mut stmt = self.conn.prepare(
            "SELECT p.id, p.name, p.pedal_type, p.category, p.parameters, p.tags, p.created_at, p.updated_at
             FROM presets p
             INNER JOIN presets_fts fts ON p.rowid = fts.rowid
             WHERE presets_fts MATCH ?1
             ORDER BY rank"
        )?;
        
        let presets = stmt.query_map([query], |row| {
            Ok(Preset {
                id: row.get(0)?,
                name: row.get(1)?,
                pedal_type: row.get(2)?,
                category: row.get(3)?,
                parameters: serde_json::from_str(&row.get::<_, String>(4)?).unwrap(),
                tags: row.get::<_, Option<String>>(5)?
                    .map(|s| s.split(',').map(String::from).collect()),
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?;
        
        presets.collect()
    }
    
    pub fn delete_preset(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM presets WHERE id = ?1", [id])?;
        Ok(())
    }
}
```

```rust
// tauri/src/main.rs
use tauri::State;
use std::sync::Mutex;

struct AppState {
    db: Mutex<Database>,
}

#[tauri::command]
fn create_preset(preset: Preset, state: State<AppState>) -> Result<(), String> {
    state.db.lock().unwrap()
        .create_preset(&preset)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_presets(state: State<AppState>) -> Result<Vec<Preset>, String> {
    state.db.lock().unwrap()
        .get_all_presets()
        .map_err(|e| e.to_string())
}

fn main() {
    let db = Database::new(/* app data path */ PathBuf::from("presets.db"))
        .expect("Failed to open database");
    
    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(db),
        })
        .invoke_handler(tauri::generate_handler![
            create_preset,
            get_all_presets,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Pros

- ✅ Fast queries with indexes
- ✅ FTS5 for full-text search
- ✅ ACID transactions (data integrity)
- ✅ Single file (easy backup)
- ✅ Handles 1000s of presets easily
- ✅ SQL flexibility (complex queries)

### Cons

- ⚠️ Requires native bindings (better-sqlite3) or Rust (rusqlite)
- ⚠️ electron-rebuild needed for Electron
- ⚠️ More complex than JSON files

---

## Option 2: JSON + Indexing

### Overview

Store presets as JSON, build in-memory indexes for search.

### A. lowdb (Simple JSON)

**Repository**: https://github.com/typicode/lowdb  
**NPM**: `lowdb`

```typescript
// src/lib/database.ts
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { app } from 'electron';

interface Data {
  presets: Preset[];
}

const file = path.join(app.getPath('userData'), 'presets.json');
const adapter = new JSONFile<Data>(file);
const db = new Low<Data>(adapter, { presets: [] });

await db.read();

export class PresetRepository {
  async createPreset(preset: Preset): Promise<void> {
    db.data.presets.push(preset);
    await db.write();
  }
  
  async getAllPresets(): Promise<Preset[]> {
    await db.read();
    return db.data.presets;
  }
  
  async getPresetsByPedal(pedalType: string): Promise<Preset[]> {
    await db.read();
    return db.data.presets.filter(p => p.pedal_type === pedalType);
  }
  
  async searchPresets(query: string): Promise<Preset[]> {
    await db.read();
    const lowerQuery = query.toLowerCase();
    return db.data.presets.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }
  
  async deletePreset(id: string): Promise<void> {
    await db.read();
    db.data.presets = db.data.presets.filter(p => p.id !== id);
    await db.write();
  }
}
```

### B. lowdb + Lunr (Full-Text Search)

```typescript
import lunr from 'lunr';

let searchIndex: lunr.Index;

function buildSearchIndex(presets: Preset[]) {
  searchIndex = lunr(function() {
    this.ref('id');
    this.field('name');
    this.field('tags');
    
    presets.forEach(preset => {
      this.add({
        id: preset.id,
        name: preset.name,
        tags: preset.tags?.join(' ') || '',
      });
    });
  });
}

export class PresetRepository {
  // ... other methods ...
  
  async searchPresets(query: string): Promise<Preset[]> {
    await db.read();
    
    if (!searchIndex) {
      buildSearchIndex(db.data.presets);
    }
    
    const results = searchIndex.search(query);
    const ids = new Set(results.map(r => r.ref));
    
    return db.data.presets.filter(p => ids.has(p.id));
  }
}
```

### Pros

- ✅ Simple setup (no native modules)
- ✅ Human-readable (JSON)
- ✅ Easy backup (copy file)
- ✅ Version control friendly
- ✅ No build complexity

### Cons

- ⚠️ Slower for large datasets (>1000 presets)
- ⚠️ No ACID transactions
- ⚠️ Manual index management
- ⚠️ Limited query flexibility

---

## Option 3: Embedded NoSQL

### PouchDB

**Repository**: https://github.com/pouchdb/pouchdb  
**Use Case**: Offline-first apps with sync

**Verdict**: Overkill for a local preset manager. More complexity than needed.

### LevelDB

**Repository**: https://github.com/Level/level  
**Use Case**: Low-level key-value store

**Verdict**: Too low-level. Need to build all querying and indexing yourself.

---

## Backup & Export Strategies

### SQLite Backup

```typescript
// Backup database file
import fs from 'fs';

function backupDatabase(destPath: string) {
  const srcPath = path.join(app.getPath('userData'), 'presets.db');
  fs.copyFileSync(srcPath, destPath);
}

// Or use better-sqlite3's backup API
db.backup(destPath);
```

### JSON Export (Universal)

```typescript
// Works with any storage solution
function exportPresets(presets: Preset[]): string {
  return JSON.stringify({
    version: 1,
    exported_at: new Date().toISOString(),
    presets: presets,
  }, null, 2);
}

function importPresets(json: string): Preset[] {
  const data = JSON.parse(json);
  // Validate version, structure
  return data.presets;
}
```

---

## Performance Comparison

| Solution | Read (1000 items) | Search (FTS) | Write | Backup |
|----------|-------------------|--------------|-------|--------|
| **better-sqlite3** | <5ms | <10ms (FTS5) | <1ms | Copy file |
| **rusqlite** | <3ms | <5ms (FTS5) | <1ms | Copy file |
| **lowdb** | ~50ms | ~100ms | ~50ms | Copy file |
| **lowdb + Lunr** | ~50ms | ~20ms | ~50ms | Copy file |

*Benchmarks approximate, varies by dataset size*

---

## Recommendation

### Production: SQLite

- **Electron**: Use **better-sqlite3**
- **Tauri**: Use **rusqlite**

**Why**: Best performance, full querying, proven at scale, simple backup.

### Prototyping: lowdb

- **Quick start**: Use **lowdb** for MVP proof-of-concept
- **Upgrade later**: Migrate to SQLite when you hit performance limits or need complex queries

---

## Migration Path

If you start with lowdb and migrate to SQLite:

```typescript
// Migration script
const presetsJSON = JSON.parse(fs.readFileSync('presets.json', 'utf-8'));
const db = new Database('presets.db');

for (const preset of presetsJSON.presets) {
  db.createPreset(preset);
}
```

Easy migration keeps your options open.

---

## Schema Design

### Preset Data Model

```typescript
interface Preset {
  // Identity
  id: string;                    // UUID
  name: string;                  // "Warm Lo-Fi Pad"
  
  // Classification
  pedal_type: string;            // "GenLossMKII"
  category?: string;             // "ambient", "delay", "glitch"
  tags?: string[];               // ["lofi", "pad", "dark"]
  
  // Data
  parameters: {                  // Pedal-specific parameters
    wow: number;
    flutter: number;
    saturate: number;
    dip_classic: boolean;
    // ...
  };
  
  // Metadata
  created_at: number;            // Unix timestamp
  updated_at: number;            // Unix timestamp
  author?: string;               // User or "Factory"
  notes?: string;                // User notes
}
```

### Database Schema (SQLite)

```sql
CREATE TABLE presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pedal_type TEXT NOT NULL,
  category TEXT,
  parameters TEXT NOT NULL,     -- JSON string
  tags TEXT,                     -- Comma-separated
  author TEXT,
  notes TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_pedal_type ON presets(pedal_type);
CREATE INDEX idx_category ON presets(category);
CREATE INDEX idx_created_at ON presets(created_at DESC);

CREATE VIRTUAL TABLE presets_fts USING fts5(
  name,
  tags,
  notes,
  content='presets'
);
```

---

## Next Steps

1. Choose storage solution based on project phase:
   - **MVP/Prototype**: lowdb
   - **Production**: SQLite (better-sqlite3 or rusqlite)

2. Implement basic CRUD operations

3. Add search and filtering

4. Build export/import functionality

5. Test with realistic dataset (500+ presets)

**Start simple, upgrade when needed. Either path is viable.**
