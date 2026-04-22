/**
 * One-time seed script: reads Microcosm presets from the local Tauri SQLite
 * database and pushes them into Cathedral via the REST API.
 *
 * Usage:
 *   npx tsx scripts/seed-microcosm-presets.ts --token <jwt>
 *
 * The JWT is obtained by logging into the web app and copying
 * `librarian_access_token` from localStorage.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const API_BASE = process.env.API_URL ?? 'http://localhost:3000';
const DB_PATH = join(
  homedir(),
  'Library/Application Support/com.librarian.pedal-editor/presets.db',
);

interface SqlitePreset {
  id: string;
  name: string;
  pedal_type: string;
  description: string | null;
  parameters: string;
  tags: string;
  is_favorite: number;
  created_at: number;
  updated_at: number;
}

interface SqliteBankAssignment {
  pedal_type: string;
  bank_number: number;
  preset_id: string;
  synced_at: number;
}

function getToken(): string {
  const idx = process.argv.indexOf('--token');
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: npx tsx scripts/seed-microcosm-presets.ts --token <jwt>');
    process.exit(1);
  }
  return process.argv[idx + 1];
}

function queryDb<T>(sql: string): T[] {
  const raw = execSync(
    `sqlite3 -json "${DB_PATH}" ${JSON.stringify(sql)}`,
    { encoding: 'utf-8' },
  );
  return JSON.parse(raw) as T[];
}

async function apiPost<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function main() {
  const token = getToken();

  if (!existsSync(DB_PATH)) {
    console.error(`SQLite database not found at: ${DB_PATH}`);
    process.exit(1);
  }

  // Verify the token works
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) {
    console.error('Token validation failed. Make sure you are logged in and the token is current.');
    process.exit(1);
  }
  const me = (await meRes.json()) as { id: string; email: string };
  console.log(`Authenticated as: ${me.email} (${me.id})`);

  // Read Microcosm presets from SQLite
  const presets = queryDb<SqlitePreset>(
    "SELECT * FROM presets WHERE pedal_type = 'Microcosm' ORDER BY updated_at DESC",
  );
  console.log(`Found ${presets.length} Microcosm presets in SQLite`);

  // Read bank assignments
  const banks = queryDb<SqliteBankAssignment>(
    "SELECT * FROM pedal_banks WHERE pedal_type = 'Microcosm' ORDER BY bank_number",
  );
  console.log(`Found ${banks.length} bank assignments in SQLite`);

  // Map old SQLite IDs to new Cathedral IDs
  const idMap = new Map<string, string>();

  for (const preset of presets) {
    const parameters = JSON.parse(preset.parameters);
    const tags: string[] = preset.tags ? JSON.parse(preset.tags) : [];

    try {
      const created = await apiPost<{ id: string }>(
        '/presets',
        token,
        {
          name: preset.name,
          pedalName: preset.pedal_type,
          description: preset.description || undefined,
          parameters,
          tags,
        },
      );
      idMap.set(preset.id, created.id);
      console.log(`  + ${preset.name} -> ${created.id}`);
    } catch (err) {
      console.error(`  ! Failed to create "${preset.name}":`, err);
    }
  }

  // Assign bank slots using new IDs
  for (const bank of banks) {
    const newPresetId = idMap.get(bank.preset_id);
    if (!newPresetId) {
      console.warn(`  ? Skipping bank ${bank.bank_number} — preset ${bank.preset_id} was not migrated`);
      continue;
    }

    try {
      await apiPost(
        `/presets/pedal/Microcosm/banks/${bank.bank_number}`,
        token,
        { presetId: newPresetId },
      );
      console.log(`  Bank ${bank.bank_number} -> preset ${newPresetId}`);
    } catch (err) {
      console.error(`  ! Failed to assign bank ${bank.bank_number}:`, err);
    }
  }

  console.log('\nDone! Migrated Microcosm presets and bank assignments.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
