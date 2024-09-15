import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsInt,
  ValidateNested,
  IsArray,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import { RelationDto } from "./relation.dto";
import { VisitDto } from "./visit.dto";
import { Identity, CRC, CatchmentArea } from "@prisma/client";

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  attendedByDoctorId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  cnic?: string;

  @IsOptional()
  @IsEnum(Identity)
  identity?: Identity;

  @IsOptional()
  @IsEnum(CRC)
  crc?: CRC;

  @IsOptional()
  @IsString()
  crcNumber?: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @IsString()
  marriageYears?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(CatchmentArea)
  catchmentArea?: CatchmentArea;

  @IsOptional()
  @IsString()
  amountPayed?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelationDto)
  relation?: RelationDto[];
}
