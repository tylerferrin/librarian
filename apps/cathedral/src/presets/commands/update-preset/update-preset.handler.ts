import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleError } from '../../../lib/handle-error.decorator';
import { PresetsRepository } from '../../presets.repository';
import { UpdatePresetCommand } from './update-preset.command';
import type { PresetDto } from '../../dto/preset.dto';

@Injectable()
@CommandHandler(UpdatePresetCommand)
export class UpdatePresetHandler
  implements ICommandHandler<UpdatePresetCommand, PresetDto>
{
  constructor(private readonly repository: PresetsRepository) {}

  @HandleError()
  async execute(command: UpdatePresetCommand): Promise<PresetDto> {
    return this.repository.update(command.id, command.userId, {
      name: command.name,
      description: command.description,
      tags: command.tags,
      isFavorite: command.isFavorite,
      parameters: command.parameters,
    });
  }
}
