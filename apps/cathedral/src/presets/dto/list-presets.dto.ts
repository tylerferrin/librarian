import type { PedalName } from '@librarian/plate';

export class ListPresetsDto {
  pedalName?: PedalName;
  tags?: string[];
  isFavorite?: boolean;
  search?: string;
}
