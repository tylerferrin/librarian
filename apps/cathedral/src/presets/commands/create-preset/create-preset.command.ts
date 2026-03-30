import { Command } from '@nestjs/cqrs';
import type { PedalName, PedalState } from '@librarian/plate';
import type { PresetDto } from '../../dto/preset.dto';

export class CreatePresetCommand extends Command<PresetDto> {
  readonly userId: string;
  readonly name: string;
  readonly pedalName: PedalName;
  readonly parameters: PedalState;
  readonly tags: string[];
  readonly description?: string;

  constructor({
    userId,
    name,
    pedalName,
    parameters,
    tags,
    description,
  }: {
    userId: string;
    name: string;
    pedalName: PedalName;
    parameters: PedalState;
    tags: string[];
    description?: string;
  }) {
    super();
    this.userId = userId;
    this.name = name;
    this.pedalName = pedalName;
    this.parameters = parameters;
    this.tags = tags;
    this.description = description;
  }
}
