// Preset repository - SQLite persistence (infrastructure layer)
use super::types::*;
use rusqlite::{params, Connection, OptionalExtension};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

/// Repository for preset persistence
pub struct PresetRepository {
    conn: Arc<Mutex<Connection>>,
}

impl PresetRepository {
    /// Create a new repository with the given database path
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let repo = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        repo.init_schema()?;
        Ok(repo)
    }
    
    /// Initialize database schema (idempotent)
    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        // Create presets table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS presets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                pedal_type TEXT NOT NULL,
                description TEXT,
                parameters TEXT NOT NULL,
                tags TEXT,
                is_favorite INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;
        
        // Create indexes
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_pedal_type ON presets(pedal_type)",
            [],
        )?;
        
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_name ON presets(name)",
            [],
        )?;
        
        // Create pedal_banks table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS pedal_banks (
                pedal_type TEXT NOT NULL,
                bank_number INTEGER NOT NULL,
                preset_id TEXT,
                synced_at INTEGER,
                PRIMARY KEY (pedal_type, bank_number),
                FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE SET NULL
            )",
            [],
        )?;
        
        Ok(())
    }
    
    /// Save a preset to the database
    pub fn save(&self, preset: &Preset) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        let tags_json = serde_json::to_string(&preset.tags)?;
        let parameters_json = serde_json::to_string(&preset.parameters)?;
        
        conn.execute(
            "INSERT INTO presets (id, name, pedal_type, description, parameters, tags, is_favorite, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
             ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                description = excluded.description,
                parameters = excluded.parameters,
                tags = excluded.tags,
                is_favorite = excluded.is_favorite,
                updated_at = excluded.updated_at",
            params![
                preset.id.as_str(),
                preset.name,
                preset.pedal_type,
                preset.description,
                parameters_json,
                tags_json,
                if preset.is_favorite { 1 } else { 0 },
                preset.created_at,
                preset.updated_at,
            ],
        )?;
        
        Ok(())
    }
    
    /// Find a preset by ID
    pub fn find_by_id(&self, id: &PresetId) -> Result<Option<Preset>> {
        let conn = self.conn.lock().unwrap();
        
        let preset = conn
            .query_row(
                "SELECT id, name, pedal_type, description, parameters, tags, is_favorite, created_at, updated_at
                 FROM presets WHERE id = ?1",
                params![id.as_str()],
                |row| {
                    let tags_json: String = row.get(5)?;
                    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
                    
                    let parameters_json: String = row.get(4)?;
                    let parameters: serde_json::Value = serde_json::from_str(&parameters_json)
                        .unwrap_or(serde_json::Value::Null);
                    
                    Ok(Preset {
                        id: PresetId::new(row.get(0)?),
                        name: row.get(1)?,
                        pedal_type: row.get(2)?,
                        description: row.get(3)?,
                        parameters,
                        tags,
                        is_favorite: row.get::<_, i32>(6)? != 0,
                        created_at: row.get(7)?,
                        updated_at: row.get(8)?,
                    })
                },
            )
            .optional()?;
        
        Ok(preset)
    }
    
    /// Find a preset by name
    pub fn find_by_name(&self, name: &str) -> Result<Option<Preset>> {
        let conn = self.conn.lock().unwrap();
        
        let preset = conn
            .query_row(
                "SELECT id, name, pedal_type, description, parameters, tags, is_favorite, created_at, updated_at
                 FROM presets WHERE name = ?1",
                params![name],
                |row| {
                    let tags_json: String = row.get(5)?;
                    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
                    
                    let parameters_json: String = row.get(4)?;
                    let parameters: serde_json::Value = serde_json::from_str(&parameters_json)
                        .unwrap_or(serde_json::Value::Null);
                    
                    Ok(Preset {
                        id: PresetId::new(row.get(0)?),
                        name: row.get(1)?,
                        pedal_type: row.get(2)?,
                        description: row.get(3)?,
                        parameters,
                        tags,
                        is_favorite: row.get::<_, i32>(6)? != 0,
                        created_at: row.get(7)?,
                        updated_at: row.get(8)?,
                    })
                },
            )
            .optional()?;
        
        Ok(preset)
    }
    
    /// List all presets with optional filtering
    pub fn list(&self, filter: &PresetFilter) -> Result<Vec<Preset>> {
        let conn = self.conn.lock().unwrap();
        
        let mut query = String::from(
            "SELECT id, name, pedal_type, description, parameters, tags, is_favorite, created_at, updated_at FROM presets WHERE 1=1"
        );
        
        let mut conditions = Vec::new();
        
        if let Some(ref pedal_type) = filter.pedal_type {
            conditions.push(format!(" AND pedal_type = '{}'", pedal_type));
        }
        
        if let Some(is_favorite) = filter.is_favorite {
            conditions.push(format!(" AND is_favorite = {}", if is_favorite { 1 } else { 0 }));
        }
        
        if let Some(ref search) = filter.search_query {
            conditions.push(format!(
                " AND (name LIKE '%{}%' OR description LIKE '%{}%')",
                search, search
            ));
        }
        
        for condition in conditions {
            query.push_str(&condition);
        }
        
        query.push_str(" ORDER BY updated_at DESC");
        
        let mut stmt = conn.prepare(&query)?;
        let preset_iter = stmt.query_map([], |row| {
            let tags_json: String = row.get(5)?;
            let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
            
            let parameters_json: String = row.get(4)?;
            let parameters: serde_json::Value = serde_json::from_str(&parameters_json)
                .unwrap_or(serde_json::Value::Null);
            
            Ok(Preset {
                id: PresetId::new(row.get(0)?),
                name: row.get(1)?,
                pedal_type: row.get(2)?,
                description: row.get(3)?,
                parameters,
                tags,
                is_favorite: row.get::<_, i32>(6)? != 0,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?;
        
        let mut presets = Vec::new();
        for preset in preset_iter {
            presets.push(preset?);
        }
        
        // Filter by tags if specified (post-query filtering)
        if !filter.tags.is_empty() {
            presets.retain(|p| {
                filter.tags.iter().any(|tag| p.tags.contains(tag))
            });
        }
        
        Ok(presets)
    }
    
    /// Delete a preset
    pub fn delete(&self, id: &PresetId) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        let rows_affected = conn.execute(
            "DELETE FROM presets WHERE id = ?1",
            params![id.as_str()],
        )?;
        
        if rows_affected == 0 {
            return Err(PresetError::NotFound {
                id: id.to_string(),
            });
        }
        
        Ok(())
    }
    
    /// Update preset favorite status
    pub fn set_favorite(&self, id: &PresetId, is_favorite: bool) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        let rows_affected = conn.execute(
            "UPDATE presets SET is_favorite = ?1, updated_at = ?2 WHERE id = ?3",
            params![
                if is_favorite { 1 } else { 0 },
                chrono::Utc::now().timestamp(),
                id.as_str()
            ],
        )?;
        
        if rows_affected == 0 {
            return Err(PresetError::NotFound {
                id: id.to_string(),
            });
        }
        
        Ok(())
    }
    
    /// Get bank assignments for a pedal type
    pub fn get_bank_assignments(&self, pedal_type: &str) -> Result<Vec<(u8, Option<PresetId>, Option<i64>)>> {
        let conn = self.conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT bank_number, preset_id, synced_at FROM pedal_banks WHERE pedal_type = ?1 ORDER BY bank_number"
        )?;
        
        let assignments_iter = stmt.query_map(params![pedal_type], |row| {
            let preset_id: Option<String> = row.get(1)?;
            Ok((
                row.get(0)?,
                preset_id.map(PresetId::new),
                row.get(2)?,
            ))
        })?;
        
        let mut assignments = Vec::new();
        for assignment in assignments_iter {
            assignments.push(assignment?);
        }
        
        Ok(assignments)
    }
    
    /// Assign a preset to a bank
    pub fn assign_to_bank(&self, pedal_type: &str, bank_number: u8, preset_id: &PresetId) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().timestamp();
        
        conn.execute(
            "INSERT INTO pedal_banks (pedal_type, bank_number, preset_id, synced_at)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(pedal_type, bank_number) DO UPDATE SET
                preset_id = excluded.preset_id,
                synced_at = excluded.synced_at",
            params![pedal_type, bank_number, preset_id.as_str(), now],
        )?;
        
        Ok(())
    }
    
    /// Find all presets for a pedal type with their bank assignments
    pub fn find_all_with_banks(&self, pedal_type: &str) -> Result<Vec<PresetWithBanks>> {
        let conn = self.conn.lock().unwrap();
        
        // Get all presets for this pedal type
        let mut stmt = conn.prepare(
            "SELECT p.id, p.name, p.pedal_type, p.description, p.parameters, p.tags, p.is_favorite, p.created_at, p.updated_at,
                    GROUP_CONCAT(pb.bank_number) as bank_numbers
             FROM presets p
             LEFT JOIN pedal_banks pb ON p.id = pb.preset_id AND pb.pedal_type = ?1
             WHERE p.pedal_type = ?1
             GROUP BY p.id
             ORDER BY p.updated_at DESC"
        )?;
        
        let rows = stmt.query_map(params![pedal_type], |row| {
            let tags_json: String = row.get(5)?;
            let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
            
            let parameters_json: String = row.get(4)?;
            let parameters: serde_json::Value = serde_json::from_str(&parameters_json)
                .unwrap_or(serde_json::Value::Null);
            
            let bank_numbers_str: Option<String> = row.get(9)?;
            let bank_numbers: Vec<u8> = bank_numbers_str
                .map(|s| {
                    s.split(',')
                        .filter_map(|n| n.trim().parse::<u8>().ok())
                        .collect()
                })
                .unwrap_or_default();
            
            Ok(PresetWithBanks {
                preset: Preset {
                    id: PresetId::new(row.get(0)?),
                    name: row.get(1)?,
                    pedal_type: row.get(2)?,
                    description: row.get(3)?,
                    parameters,
                    tags,
                    is_favorite: row.get::<_, i32>(6)? != 0,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                },
                bank_numbers,
            })
        })?;
        
        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        
        Ok(results)
    }
    
    /// Clear a bank assignment
    pub fn clear_bank(&self, pedal_type: &str, bank_number: u8) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        conn.execute(
            "DELETE FROM pedal_banks WHERE pedal_type = ?1 AND bank_number = ?2",
            params![pedal_type, bank_number],
        )?;
        
        Ok(())
    }
}
