import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleError } from '../../../lib/handle-error.decorator';
import { PresetsRepository } from '../../presets.repository';
import { AssignToBankCommand } from './assign-to-bank.command';

@Injectable()
@CommandHandler(AssignToBankCommand)
export class AssignToBankHandler
  implements ICommandHandler<AssignToBankCommand, void>
{
  constructor(private readonly repository: PresetsRepository) {}

  @HandleError()
  async execute(command: AssignToBankCommand): Promise<void> {
    await this.repository.assignToBank(
      command.userId,
      command.pedalName,
      command.bankNumber,
      command.presetId,
    );
  }
}
