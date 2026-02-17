// Database test fixtures - provides in-memory databases for testing

use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};

/// Create an in-memory SQLite database with the preset schema
pub fn create_test_db() -> Result<Connection> {
    let conn = Connection::open_in_memory()?;
    
    // Create presets table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS presets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            pedal_type TEXT NOT NULL,
            description TEXT,
            parameters TEXT NOT NULL,
            tags TEXT NOT NULL,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )",
        [],
    )?;
    
    // Create bank_assignments table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS bank_assignments (
            preset_id TEXT NOT NULL,
            bank_number INTEGER NOT NULL,
            synced_at INTEGER NOT NULL,
            PRIMARY KEY (preset_id, bank_number),
            FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // Create index on bank_number for faster lookups
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_bank_assignments_bank_number 
         ON bank_assignments(bank_number)",
        [],
    )?;
    
    Ok(conn)
}

/// Create a shared test database (for use with Arc<Mutex<Connection>>)
pub fn create_shared_test_db() -> Result<Arc<Mutex<Connection>>> {
    Ok(Arc::new(Mutex::new(create_test_db()?)))
}

/// Insert a test preset into the database
pub fn insert_test_preset(
    conn: &Connection,
    id: &str,
    name: &str,
    pedal_type: &str,
    parameters: &str,
) -> Result<()> {
    conn.execute(
        "INSERT INTO presets (id, name, pedal_type, description, parameters, tags, is_favorite, created_at, updated_at)
         VALUES (?1, ?2, ?3, NULL, ?4, '[]', 0, 0, 0)",
        [id, name, pedal_type, parameters],
    )?;
    Ok(())
}

/// Insert a test bank assignment
pub fn insert_test_bank_assignment(
    conn: &Connection,
    preset_id: &str,
    bank_number: u8,
) -> Result<()> {
    conn.execute(
        "INSERT INTO bank_assignments (preset_id, bank_number, synced_at)
         VALUES (?1, ?2, ?3)",
        rusqlite::params![preset_id, bank_number, chrono::Utc::now().timestamp()],
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_create_test_db() {
        let conn = create_test_db().expect("Failed to create test database");
        
        // Verify presets table exists
        let table_exists: bool = conn
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='presets'",
                [],
                |row| row.get(0),
            )
            .map(|count: i64| count > 0)
            .unwrap_or(false);
        
        assert!(table_exists, "Presets table should exist");
    }
    
    #[test]
    fn test_insert_test_preset() {
        let conn = create_test_db().expect("Failed to create test database");
        
        insert_test_preset(
            &conn,
            "test-id-123",
            "Test Preset",
            "microcosm",
            "{}",
        ).expect("Failed to insert test preset");
        
        // Verify preset was inserted
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM presets WHERE id = 'test-id-123'", [], |row| row.get(0))
            .expect("Failed to query preset");
        
        assert_eq!(count, 1, "Preset should be inserted");
    }
    
    #[test]
    fn test_insert_test_bank_assignment() {
        let conn = create_test_db().expect("Failed to create test database");
        
        // Insert preset first
        insert_test_preset(
            &conn,
            "test-id-123",
            "Test Preset",
            "microcosm",
            "{}",
        ).expect("Failed to insert test preset");
        
        // Insert bank assignment
        insert_test_bank_assignment(&conn, "test-id-123", 45)
            .expect("Failed to insert bank assignment");
        
        // Verify bank assignment was inserted
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM bank_assignments WHERE preset_id = 'test-id-123' AND bank_number = 45",
                [],
                |row| row.get(0),
            )
            .expect("Failed to query bank assignment");
        
        assert_eq!(count, 1, "Bank assignment should be inserted");
    }
}
