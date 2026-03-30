import { Command } from '@nestjs/cqrs';
import type { PedalName } from '@librarian/plate';

export class ClearBankCommand extends Command<void> {
  readonly userId: string;
  readonly pedalName: PedalName;
  readonly bankNumber: number;

  constructor({
    userId,
    pedalName,
    bankNumber,
  }: {
    userId: string;
    pedalName: PedalName;
    bankNumber: number;
  }) {
    super();
    this.userId = userId;
    this.pedalName = pedalName;
    this.bankNumber = bankNumber;
  }
}
