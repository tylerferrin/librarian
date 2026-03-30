import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PresetsController } from './presets.controller';
import { PresetsRepository } from './presets.repository';
import { CreatePresetHandler } from './commands/create-preset/create-preset.handler';
import { UpdatePresetHandler } from './commands/update-preset/update-preset.handler';
import { DeletePresetHandler } from './commands/delete-preset/delete-preset.handler';
import { AssignToBankHandler } from './commands/assign-to-bank/assign-to-bank.handler';
import { ClearBankHandler } from './commands/clear-bank/clear-bank.handler';
import { ListPresetsHandler } from './queries/list-presets/list-presets.handler';
import { GetPresetHandler } from './queries/get-preset/get-preset.handler';
import { GetBankSlotsHandler } from './queries/get-bank-slots/get-bank-slots.handler';
import { AuthModule } from '../auth/auth.module';

const CommandHandlers = [
  CreatePresetHandler,
  UpdatePresetHandler,
  DeletePresetHandler,
  AssignToBankHandler,
  ClearBankHandler,
];

const QueryHandlers = [
  ListPresetsHandler,
  GetPresetHandler,
  GetBankSlotsHandler,
];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [PresetsController],
  providers: [PresetsRepository, ...CommandHandlers, ...QueryHandlers],
})
export class PresetsModule {}
