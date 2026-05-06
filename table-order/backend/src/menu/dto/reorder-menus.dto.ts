import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItem {
  @IsInt()
  id: number;

  @IsInt()
  displayOrder: number;
}

export class ReorderMenusDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
