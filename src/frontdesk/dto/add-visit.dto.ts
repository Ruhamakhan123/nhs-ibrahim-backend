import { IsNotEmpty, IsString } from 'class-validator';

export class AddVisitRequestDto {
  @IsNotEmpty()
  @IsString()
  patientId: string;
}
