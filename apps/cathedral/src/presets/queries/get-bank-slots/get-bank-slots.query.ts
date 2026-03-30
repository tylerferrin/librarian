import { Query } from '@nestjs/cqrs';
import type { PedalName } from '@librarian/plate';
import type { BankSlotDto } from '../../dto/preset.dto';

export class GetBankSlotsQuery extends Query<BankSlotDto[]> {
  readonly userId: string;
  readonly pedalName: PedalName;

  constructor({ userId, pedalName }: { userId: string; pedalName: PedalName }) {
    super();
    this.userId = userId;
    this.pedalName = pedalName;
  }
}
