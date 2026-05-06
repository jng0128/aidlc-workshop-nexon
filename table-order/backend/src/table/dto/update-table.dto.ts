import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;
}
