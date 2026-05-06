import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateTableDto {
  @IsNumber()
  @Min(1)
  tableNumber: number;

  @IsString()
  @MinLength(4)
  password: string;
}
