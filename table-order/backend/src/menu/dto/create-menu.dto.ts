import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsInt()
  @Min(0)
  @Max(10000000)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
