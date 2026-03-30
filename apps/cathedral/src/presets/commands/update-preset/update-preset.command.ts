import { Command } from '@nestjs/cqrs';
import type { PedalState } from '@librarian/plate';
import type { PresetDto } from '../../dto/preset.dto';

export class UpdatePresetCommand extends Command<PresetDto> {
  readonly id: string;
  readonly userId: string;
  readonly name?: string;
  readonly description?: string;
  readonly tags?: string[];
  readonly isFavorite?: boolean;
  readonly parameters?: PedalState;

  constructor({
    id,
    userId,
    name,
    description,
    tags,
    isFavorite,
    parameters,
  }: {
    id: string;
    userId: string;
    name?: string;
    description?: string;
    tags?: string[];
    isFavorite?: boolean;
    parameters?: PedalState;
  }) {
    super();
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.description = description;
    this.tags = tags;
    this.isFavorite = isFavorite;
    this.parameters = parameters;
  }
}
