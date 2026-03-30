import { Query } from '@nestjs/cqrs';
import type { PresetDto } from '../../dto/preset.dto';

export class GetPresetQuery extends Query<PresetDto> {
  readonly id: string;
  readonly userId: string;

  constructor({ id, userId }: { id: string; userId: string }) {
    super();
    this.id = id;
    this.userId = userId;
  }
}
