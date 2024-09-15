// src/frontdesk/dto/visit.dto.ts

import { IsInt, IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class VisitDto {
  @IsOptional()
  @IsNotEmpty()
  @IsInt() // Ensure tokenNumber is an integer
  tokenNumber: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate() // Ensure date is a valid Date instance
  date: Date;
}
