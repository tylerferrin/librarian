import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleError } from '../../../lib/handle-error.decorator';
import { PresetsRepository } from '../../presets.repository';
import { DeletePresetCommand } from './delete-preset.command';

@Injectable()
@CommandHandler(DeletePresetCommand)
export class DeletePresetHandler
  implements ICommandHandler<DeletePresetCommand, void>
{
  constructor(private readonly repository: PresetsRepository) {}

  @HandleError()
  async execute(command: DeletePresetCommand): Promise<void> {
    await this.repository.delete(command.id, command.userId);
  }
}
