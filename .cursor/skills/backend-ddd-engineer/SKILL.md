---
name: backend-ddd-engineer
description: Implements backend features following Librarian's DDD patterns. Use when adding backend functionality, creating modules, or implementing domain logic in Rust. Provides step-by-step workflows for types.rs → repository.rs → mod.rs → commands.rs pattern.
---

# Backend DDD Implementation Guide

## Workflow 1: Add Feature to Existing Module

**When:** Adding new domain operation to existing bounded context

**Steps:**

1. **Define domain types** (`types.rs`):
   - Add entity, value object, or enum
   - Include validation in constructors

2. **Add infrastructure** (`repository.rs` or `mapper.rs`):
   - Add persistence or protocol methods
   - Keep separate from domain logic

3. **Expose via aggregate root** (`mod.rs`):
   - Add public method coordinating the operation
   - Use repository/mapper internally

4. **Create Tauri command** (`commands.rs`):
   - Add `#[tauri::command]` function
   - Call aggregate root method
   - Handle errors, return serializable result

5. **Register command** (`lib.rs`):
   - Add to `invoke_handler![...]` list

## Workflow 2: Create New Bounded Context

**When:** Adding major new feature (e.g., setlists, profiles)

**Steps:**

1. **Create module directory**:
   ```bash
   mkdir -p tauri/src/{domain}
   cd tauri/src/{domain}
   ```

2. **Create `types.rs`**:
   ```rust
   // Define main entity (aggregate root data)
   pub struct EntityState { /* ... */ }
   
   // Define value objects with validation
   pub struct ValueObject(String);
   impl ValueObject {
       pub fn new(val: String) -> Result<Self, Error> { /* validate */ }
   }
   
   // Define domain enums
   pub enum DomainConcept { VariantA, VariantB }
   ```

3. **Create infrastructure file** (`repository.rs` or `mapper.rs`):
   ```rust
   // repository.rs example
   pub struct Repository {
       conn: Arc<Mutex<rusqlite::Connection>>,
   }
   
   impl Repository {
       pub fn save(&self, entity: &Entity) -> Result<()> { /* ... */ }
       pub fn find_by_id(&self, id: &Id) -> Result<Option<Entity>> { /* ... */ }
   }
   ```

4. **Create `mod.rs`** (aggregate root):
   ```rust
   mod types;
   mod repository;
   
   pub use types::*;
   
   pub struct AggregateRoot {
       repository: Arc<Repository>,
   }
   
   impl AggregateRoot {
       pub fn new(deps: Dependencies) -> Result<Self> { /* ... */ }
       pub fn do_something(&mut self) -> Result<()> { /* ... */ }
   }
   ```

5. **Register module** in `tauri/src/lib.rs`:
   ```rust
   pub mod {domain};
   ```

6. **Add Tauri commands** in `commands.rs`:
   ```rust
   #[tauri::command]
   async fn command_name(
       state: State<'_, SharedAggregateRoot>,
   ) -> Result<ResponseType, String> {
       state.do_something()
           .await
           .map_err(|e| e.to_string())
   }
   ```

## Workflow 3: Add Database Table

**When:** New entity needs persistence

**Steps:**

1. **Design schema**:
   ```sql
   CREATE TABLE entity_name (
       id TEXT PRIMARY KEY,
       field TEXT NOT NULL,
       created_at INTEGER NOT NULL
   );
   CREATE INDEX idx_field ON entity_name(field);
   ```

2. **Add migration** (in `repository.rs`):
   ```rust
   fn init_schema(conn: &Connection) -> Result<()> {
       conn.execute(
           "CREATE TABLE IF NOT EXISTS ...",
           [],
       )?;
       Ok(())
   }
   ```

3. **Implement repository methods**:
   ```rust
   impl Repository {
       pub fn new(db_path: PathBuf) -> Result<Self> {
           let conn = Connection::open(db_path)?;
           Self::init_schema(&conn)?;
           Ok(Self { conn: Arc::new(Mutex::new(conn)) })
       }
   }
   ```

4. **Use Tauri `app_data_dir()`** for database path

## Common Patterns

### Value Object Constructor
```rust
pub struct BankNumber(u8);

impl BankNumber {
    pub fn new(value: u8) -> Result<Self, ValidationError> {
        if (45..=60).contains(&value) {
            Ok(Self(value))
        } else {
            Err(ValidationError::InvalidRange { value, min: 45, max: 60 })
        }
    }
    
    pub fn value(&self) -> u8 {
        self.0
    }
}
```

### Async Repository Method
```rust
pub async fn save(&self, entity: &Entity) -> Result<()> {
    let conn = self.conn.clone();
    let entity = entity.clone();
    
    tokio::task::spawn_blocking(move || {
        let conn = conn.lock().unwrap();
        conn.execute(
            "INSERT INTO table (id, data) VALUES (?1, ?2)",
            params![entity.id, serde_json::to_string(&entity)?],
        )?;
        Ok(())
    }).await?
}
```

### Error Conversion for Tauri
```rust
#[tauri::command]
async fn do_something(
    state: State<'_, SharedService>,
) -> Result<Response, String> {
    state.do_something()
        .await
        .map_err(|e| e.to_string())
}
```

## Checklist

Before committing backend feature:

- [ ] Domain types in `types.rs` with validation
- [ ] Infrastructure in `repository.rs` or `mapper.rs`
- [ ] Aggregate root methods in `mod.rs`
- [ ] Tauri commands in `commands.rs`
- [ ] Commands registered in `lib.rs`
- [ ] Error types use `thiserror`
- [ ] Serde derives on types that cross IPC boundary
- [ ] Async for I/O operations
- [ ] `Result<T, E>` for all fallible operations
