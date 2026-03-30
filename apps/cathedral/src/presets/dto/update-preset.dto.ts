import type { PedalState } from '@librarian/plate';

export class UpdatePresetDto {
  name?: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  parameters?: PedalState;
}
