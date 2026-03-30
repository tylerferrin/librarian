import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HandleError } from '../../../lib/handle-error.decorator';
import { PresetsRepository } from '../../presets.repository';
import { GetBankSlotsQuery } from './get-bank-slots.query';
import type { BankSlotDto } from '../../dto/preset.dto';

@Injectable()
@QueryHandler(GetBankSlotsQuery)
export class GetBankSlotsHandler implements IQueryHandler<GetBankSlotsQuery> {
  constructor(private readonly repository: PresetsRepository) {}

  @HandleError()
  async execute(query: GetBankSlotsQuery): Promise<BankSlotDto[]> {
    return this.repository.getBankSlots(query.userId, query.pedalName);
  }
}
