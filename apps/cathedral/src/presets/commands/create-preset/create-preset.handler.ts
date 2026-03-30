import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleError } from '../../../lib/handle-error.decorator';
import { PresetsRepository } from '../../presets.repository';
import { CreatePresetCommand } from './create-preset.command';
import type { PresetDto } from '../../dto/preset.dto';

@Injectable()
@CommandHandler(CreatePresetCommand)
export class CreatePresetHandler
  implements ICommandHandler<CreatePresetCommand, PresetDto>
{
  constructor(private readonly repository: PresetsRepository) {}

  @HandleError()
  async execute(command: CreatePresetCommand): Promise<PresetDto> {
    return this.repository.save({
      userId: command.userId,
      name: command.name,
      pedalName: command.pedalName,
      parameters: command.parameters,
      tags: command.tags,
      description: command.description,
    });
  }
}
