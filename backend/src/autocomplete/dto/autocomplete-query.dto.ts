import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AutocompleteQueryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  query?: string;
}
