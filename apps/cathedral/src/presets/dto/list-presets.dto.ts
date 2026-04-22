import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import type { PedalName } from '@librarian/plate';

export class ListPresetsDto {
  @IsString()
  @IsOptional()
  pedalName?: PedalName;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFavorite?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}
