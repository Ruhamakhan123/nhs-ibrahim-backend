// patient-details.dto.ts

import { IsOptional, IsNumber, IsString } from 'class-validator';

export class PatientDetailsDto {
  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  sugarLevel?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  bloodPressure?: string;
}
