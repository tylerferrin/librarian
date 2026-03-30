import { Command } from '@nestjs/cqrs';
import type { PedalName } from '@librarian/plate';

export class AssignToBankCommand extends Command<void> {
  readonly userId: string;
  readonly pedalName: PedalName;
  readonly bankNumber: number;
  readonly presetId: string;

  constructor({
    userId,
    pedalName,
    bankNumber,
    presetId,
  }: {
    userId: string;
    pedalName: PedalName;
    bankNumber: number;
    presetId: string;
  }) {
    super();
    this.userId = userId;
    this.pedalName = pedalName;
    this.bankNumber = bankNumber;
    this.presetId = presetId;
  }
}
