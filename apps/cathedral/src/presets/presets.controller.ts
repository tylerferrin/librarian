import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';
import type { PedalName } from '@librarian/plate';
import { CreatePresetCommand } from './commands/create-preset/create-preset.command';
import { UpdatePresetCommand } from './commands/update-preset/update-preset.command';
import { DeletePresetCommand } from './commands/delete-preset/delete-preset.command';
import { AssignToBankCommand } from './commands/assign-to-bank/assign-to-bank.command';
import { ClearBankCommand } from './commands/clear-bank/clear-bank.command';
import { ListPresetsQuery } from './queries/list-presets/list-presets.query';
import { GetPresetQuery } from './queries/get-preset/get-preset.query';
import { GetBankSlotsQuery } from './queries/get-bank-slots/get-bank-slots.query';
import { CreatePresetDto } from './dto/create-preset.dto';
import { UpdatePresetDto } from './dto/update-preset.dto';
import { ListPresetsDto } from './dto/list-presets.dto';
import type { BankSlotDto, PresetDto, PresetWithBanksDto } from './dto/preset.dto';

@Controller('presets')
@UseGuards(JwtAuthGuard)
export class PresetsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListPresetsDto,
  ): Promise<PresetWithBanksDto[]> {
    return this.queryBus.execute(
      new ListPresetsQuery({
        userId: user.id,
        pedalName: query.pedalName,
        tags: query.tags,
        isFavorite: query.isFavorite,
        search: query.search,
      }),
    );
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreatePresetDto,
  ): Promise<PresetDto> {
    return this.commandBus.execute(
      new CreatePresetCommand({
        userId: user.id,
        name: body.name,
        pedalName: body.pedalName,
        parameters: body.parameters,
        tags: body.tags,
        description: body.description,
      }),
    );
  }

  @Get(':id')
  getOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<PresetDto> {
    return this.queryBus.execute(new GetPresetQuery({ id, userId: user.id }));
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdatePresetDto,
  ): Promise<PresetDto> {
    return this.commandBus.execute(
      new UpdatePresetCommand({ id, userId: user.id, ...body }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeletePresetCommand({ id, userId: user.id }),
    );
  }

  @Get('pedal/:pedalName/banks')
  getBankSlots(
    @CurrentUser() user: AuthUser,
    @Param('pedalName') pedalName: PedalName,
  ): Promise<BankSlotDto[]> {
    return this.queryBus.execute(
      new GetBankSlotsQuery({ userId: user.id, pedalName }),
    );
  }

  @Post('pedal/:pedalName/banks/:bankNumber')
  @HttpCode(HttpStatus.NO_CONTENT)
  assignToBank(
    @CurrentUser() user: AuthUser,
    @Param('pedalName') pedalName: PedalName,
    @Param('bankNumber') bankNumber: string,
    @Body('presetId') presetId: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new AssignToBankCommand({
        userId: user.id,
        pedalName,
        bankNumber: parseInt(bankNumber, 10),
        presetId,
      }),
    );
  }

  @Delete('pedal/:pedalName/banks/:bankNumber')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearBank(
    @CurrentUser() user: AuthUser,
    @Param('pedalName') pedalName: PedalName,
    @Param('bankNumber') bankNumber: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new ClearBankCommand({
        userId: user.id,
        pedalName,
        bankNumber: parseInt(bankNumber, 10),
      }),
    );
  }
}
