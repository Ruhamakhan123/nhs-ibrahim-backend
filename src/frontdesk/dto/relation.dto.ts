import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Relationship } from '@prisma/client';

export class RelationDto {
  @IsNotEmpty()
  @IsEnum(Relationship)
  relation: Relationship;

  @IsNotEmpty()
  @IsString()
  relationName: string;

  @IsNotEmpty()
  @IsString()
  relationCNIC: string;
}
