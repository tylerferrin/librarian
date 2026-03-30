import { Controller, Get } from '@nestjs/common';

@Controller('community')
export class CommunityController {
  @Get('presets')
  listPublicPresets(): { data: []; total: number } {
    return { data: [], total: 0 };
  }
}
