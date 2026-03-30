import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DRIZZLE_TOKEN, type DrizzleDb } from '../database/database.provider';
import { users, type User } from '../database/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0] ?? null;
  }

  /**
   * Finds or creates a user by WorkOS user ID and email.
   * Called by the auth layer when a verified WorkOS session is established.
   */
  async findOrCreate(workosId: string, email: string): Promise<User> {
    const existing = await this.findById(workosId);
    if (existing) return existing;

    const [created] = await this.db
      .insert(users)
      .values({ id: workosId, email })
      .onConflictDoUpdate({ target: users.id, set: { email } })
      .returning();

    return created;
  }

  async findOrCreateDev(email: string): Promise<User> {
    return this.findOrCreate(uuidv4(), email);
  }
}
