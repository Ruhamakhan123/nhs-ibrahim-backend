import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VisitDto } from './visit.dto';

export class AddVisitRequestDto {
  @IsNotEmpty()
  @IsString()
  patientId: string;


  @IsOptional() // Allow Visit to be optional
  Visit?: VisitDto[];
}
