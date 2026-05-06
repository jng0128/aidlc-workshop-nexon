import { IsString, IsNotEmpty, IsInt, Min, MinLength } from 'class-validator';

export class TableLoginDto {
  @IsString()
  @IsNotEmpty()
  storeIdentifier: string;

  @IsInt()
  @Min(1)
  tableNumber: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
