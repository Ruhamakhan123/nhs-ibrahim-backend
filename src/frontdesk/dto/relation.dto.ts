import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Relationship } from '@prisma/client';

export class RelationDto {
  @IsNotEmpty()
  @IsEnum(Relationship)
  relation: Relationship;

  @IsOptional()
  @IsString()
  relationName?: string;

  @IsOptional()
  @IsString()
  relationCNIC?: string;
}
