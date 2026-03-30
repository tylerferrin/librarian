import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DRIZZLE_TOKEN, type DrizzleDb } from '../database/database.provider';
import { pedalBanks, presets, type Preset } from '../database/schema';
import type { PedalName, PedalState } from '@librarian/plate';
import type {
  BankSlotDto,
  PresetDto,
  PresetWithBanksDto,
} from './dto/preset.dto';

export interface ListPresetsFilter {
  userId: string;
  pedalName?: PedalName;
  tags?: string[];
  isFavorite?: boolean;
  search?: string;
}

export interface CreatePresetInput {
  userId: string;
  name: string;
  pedalName: PedalName;
  description?: string;
  parameters: PedalState;
  tags: string[];
}

export interface UpdatePresetInput {
  name?: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  parameters?: PedalState;
}

function toDto(preset: Preset): PresetDto {
  return {
    id: preset.id,
    userId: preset.userId,
    name: preset.name,
    pedalName: preset.pedalName,
    description: preset.description,
    parameters: preset.parameters,
    tags: preset.tags,
    isFavorite: preset.isFavorite,
    createdAt: preset.createdAt.toISOString(),
    updatedAt: preset.updatedAt.toISOString(),
  };
}

@Injectable()
export class PresetsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDb) {}

  async save(input: CreatePresetInput): Promise<PresetDto> {
    const [created] = await this.db
      .insert(presets)
      .values({
        id: uuidv4(),
        userId: input.userId,
        name: input.name,
        pedalName: input.pedalName,
        description: input.description ?? null,
        parameters: input.parameters,
        tags: input.tags,
        isFavorite: false,
      })
      .returning();

    return toDto(created);
  }

  async findById(id: string, userId: string): Promise<PresetDto | null> {
    const result = await this.db
      .select()
      .from(presets)
      .where(and(eq(presets.id, id), eq(presets.userId, userId)));

    return result[0] ? toDto(result[0]) : null;
  }

  async list(filter: ListPresetsFilter): Promise<PresetWithBanksDto[]> {
    const conditions = [eq(presets.userId, filter.userId)];

    if (filter.pedalName) {
      conditions.push(eq(presets.pedalName, filter.pedalName));
    }

    if (filter.isFavorite !== undefined) {
      conditions.push(eq(presets.isFavorite, filter.isFavorite));
    }

    if (filter.search) {
      conditions.push(
        or(
          ilike(presets.name, `%${filter.search}%`),
          ilike(presets.description, `%${filter.search}%`),
        )!,
      );
    }

    const rows = await this.db
      .select()
      .from(presets)
      .where(and(...conditions))
      .orderBy(desc(presets.updatedAt));

    let filtered = rows;
    if (filter.tags && filter.tags.length > 0) {
      filtered = rows.filter((p) =>
        filter.tags!.some((tag) => p.tags.includes(tag)),
      );
    }

    if (filtered.length === 0) return [];

    const presetIds = filtered.map((p) => p.id);
    const bankRows = await this.db
      .select()
      .from(pedalBanks)
      .where(
        and(
          eq(pedalBanks.userId, filter.userId),
          inArray(pedalBanks.presetId, presetIds),
        ),
      );

    const banksByPresetId = new Map<string, number[]>();
    for (const bank of bankRows) {
      if (!bank.presetId) continue;
      const existing = banksByPresetId.get(bank.presetId) ?? [];
      existing.push(bank.bankNumber);
      banksByPresetId.set(bank.presetId, existing);
    }

    return filtered.map((preset) => ({
      ...toDto(preset),
      bankNumbers: banksByPresetId.get(preset.id) ?? [],
    }));
  }

  async update(
    id: string,
    userId: string,
    input: UpdatePresetInput,
  ): Promise<PresetDto> {
    const updateData: Partial<typeof presets.$inferInsert> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.isFavorite !== undefined) updateData.isFavorite = input.isFavorite;
    if (input.parameters !== undefined) updateData.parameters = input.parameters;

    const [updated] = await this.db
      .update(presets)
      .set(updateData)
      .where(and(eq(presets.id, id), eq(presets.userId, userId)))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Preset ${id} not found`);
    }

    return toDto(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.db
      .delete(presets)
      .where(and(eq(presets.id, id), eq(presets.userId, userId)))
      .returning({ id: presets.id });

    if (result.length === 0) {
      throw new NotFoundException(`Preset ${id} not found`);
    }
  }

  async assignToBank(
    userId: string,
    pedalName: PedalName,
    bankNumber: number,
    presetId: string,
  ): Promise<void> {
    await this.db
      .insert(pedalBanks)
      .values({ userId, pedalName, bankNumber, presetId, syncedAt: new Date() })
      .onConflictDoUpdate({
        target: [pedalBanks.userId, pedalBanks.pedalName, pedalBanks.bankNumber],
        set: { presetId, syncedAt: new Date() },
      });
  }

  async clearBank(
    userId: string,
    pedalName: PedalName,
    bankNumber: number,
  ): Promise<void> {
    await this.db
      .delete(pedalBanks)
      .where(
        and(
          eq(pedalBanks.userId, userId),
          eq(pedalBanks.pedalName, pedalName),
          eq(pedalBanks.bankNumber, bankNumber),
        ),
      );
  }

  async getBankSlots(userId: string, pedalName: PedalName): Promise<BankSlotDto[]> {
    const rows = await this.db
      .select({
        bankNumber: pedalBanks.bankNumber,
        pedalName: pedalBanks.pedalName,
        presetId: pedalBanks.presetId,
        syncedAt: pedalBanks.syncedAt,
        preset: presets,
      })
      .from(pedalBanks)
      .leftJoin(presets, eq(pedalBanks.presetId, presets.id))
      .where(
        and(
          eq(pedalBanks.userId, userId),
          eq(pedalBanks.pedalName, pedalName),
        ),
      )
      .orderBy(pedalBanks.bankNumber);

    return rows.map((row) => ({
      bankNumber: row.bankNumber,
      pedalName: row.pedalName,
      presetId: row.presetId,
      preset: row.preset ? toDto(row.preset) : null,
      syncedAt: row.syncedAt?.toISOString() ?? null,
    }));
  }
}
