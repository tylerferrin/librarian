import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import type { PedalName, PedalState } from '@librarian/plate';

export class CreatePresetDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  pedalName!: PedalName;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  parameters!: PedalState;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}
