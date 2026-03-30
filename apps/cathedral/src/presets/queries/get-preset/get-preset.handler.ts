import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HandleError } from '../../../lib/handle-error.decorator';
import { PresetsRepository } from '../../presets.repository';
import { GetPresetQuery } from './get-preset.query';
import type { PresetDto } from '../../dto/preset.dto';

@Injectable()
@QueryHandler(GetPresetQuery)
export class GetPresetHandler implements IQueryHandler<GetPresetQuery> {
  constructor(private readonly repository: PresetsRepository) {}

  @HandleError()
  async execute(query: GetPresetQuery): Promise<PresetDto> {
    const preset = await this.repository.findById(query.id, query.userId);
    if (!preset) {
      throw new NotFoundException(`Preset ${query.id} not found`);
    }
    return preset;
  }
}
