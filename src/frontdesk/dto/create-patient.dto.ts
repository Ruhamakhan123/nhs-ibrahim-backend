import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Identity, CRC, CatchmentArea } from '@prisma/client';

import { RelationDto } from './relation.dto';
import { VisitDto } from './visit.dto';

export class CreatePatientDto {
  @IsNotEmpty()
  @IsString()
  attendedByDoctorId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  fatherName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(Identity)
  identity: Identity;
  
  @IsOptional()
  @IsString()
  cnic?: string;

  @IsNotEmpty()
  @IsEnum(CRC)
  crc: CRC;

  @IsNotEmpty()
  @IsString()
  crcNumber: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
  education: string;

  @IsNotEmpty()
  @IsString()
  age: string;

  @IsNotEmpty()
  @IsString()
  marriageYears: string;

  @IsNotEmpty()
  @IsString()
  occupation: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsEnum(CatchmentArea)
  catchmentArea: CatchmentArea;

  @IsInt()
  tokenNumber: number;

  @IsNotEmpty()
  @IsString()
  amountPayed: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelationDto)
  relation: RelationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitDto)
  Visit: VisitDto[];
}
