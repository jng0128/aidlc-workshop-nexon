import { IsOptional, IsString } from 'class-validator';

export class SessionHistoryQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
