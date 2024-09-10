// src/frontdesk/dto/visit.dto.ts

import { IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class VisitDto {
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsInt()
  tokenNumber: number;
}
