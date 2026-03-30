import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HandleError } from '../../../lib/handle-error.decorator';
import { PresetsRepository } from '../../presets.repository';
import { ListPresetsQuery } from './list-presets.query';
import type { PresetWithBanksDto } from '../../dto/preset.dto';

@Injectable()
@QueryHandler(ListPresetsQuery)
export class ListPresetsHandler implements IQueryHandler<ListPresetsQuery> {
  constructor(private readonly repository: PresetsRepository) {}

  @HandleError()
  async execute(query: ListPresetsQuery): Promise<PresetWithBanksDto[]> {
    return this.repository.list({
      userId: query.userId,
      pedalName: query.pedalName,
      tags: query.tags,
      isFavorite: query.isFavorite,
      search: query.search,
    });
  }
}
