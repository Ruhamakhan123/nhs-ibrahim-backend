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

  @IsNotEmpty()
  @IsString()
  amountPayed: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelationDto)
  relation: RelationDto[];
}
