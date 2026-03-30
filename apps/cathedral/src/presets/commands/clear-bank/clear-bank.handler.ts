import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleError } from '../../../lib/handle-error.decorator';
import { PresetsRepository } from '../../presets.repository';
import { ClearBankCommand } from './clear-bank.command';

@Injectable()
@CommandHandler(ClearBankCommand)
export class ClearBankHandler implements ICommandHandler<ClearBankCommand, void> {
  constructor(private readonly repository: PresetsRepository) {}

  @HandleError()
  async execute(command: ClearBankCommand): Promise<void> {
    await this.repository.clearBank(
      command.userId,
      command.pedalName,
      command.bankNumber,
    );
  }
}
