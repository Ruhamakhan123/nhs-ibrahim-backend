import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

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

  // New Optional Fields
  @IsOptional()
  @IsString()
  injection?: string;

  @IsOptional()
  @IsString()
  timeOfInjection?: string;

  @IsOptional()
  @IsString()
  bedNumber?: string;

  @IsOptional()
  @IsString()
  medicine?: string;

  @IsOptional()
  @IsString()
  timeOfMedicine?: string;

  @IsOptional()
  @IsString()
  drip?: string;

  @IsOptional()
  @IsDateString()
  expiryOfDrip?: Date;
}
