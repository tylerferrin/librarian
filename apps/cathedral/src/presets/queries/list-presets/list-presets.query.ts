import { Query } from '@nestjs/cqrs';
import type { PedalName } from '@librarian/plate';
import type { PresetWithBanksDto } from '../../dto/preset.dto';

export class ListPresetsQuery extends Query<PresetWithBanksDto[]> {
  readonly userId: string;
  readonly pedalName?: PedalName;
  readonly tags?: string[];
  readonly isFavorite?: boolean;
  readonly search?: string;

  constructor({
    userId,
    pedalName,
    tags,
    isFavorite,
    search,
  }: {
    userId: string;
    pedalName?: PedalName;
    tags?: string[];
    isFavorite?: boolean;
    search?: string;
  }) {
    super();
    this.userId = userId;
    this.pedalName = pedalName;
    this.tags = tags;
    this.isFavorite = isFavorite;
    this.search = search;
  }
}
