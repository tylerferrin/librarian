import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
} from 'class-validator';
import type { PedalState } from '@librarian/plate';

export class UpdatePresetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsObject()
  @IsOptional()
  parameters?: PedalState;
}
