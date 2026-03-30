import type { PedalName, PedalState } from '@librarian/plate';

export class CreatePresetDto {
  name!: string;
  pedalName!: PedalName;
  description?: string;
  parameters!: PedalState;
  tags!: string[];
}
