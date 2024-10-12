import { CatchmentArea, CRC, Identity } from '@prisma/client';

export class DoctorDto {
  id: string;
  name: string;
}

export class RelationDto {
  relation: string;
  relationName: string;
  relationCNIC?: string;
}

export class PatientDto {
  id: string;
  name: string;
  fatherName: string;
  email: string;
  identity: Identity;
  crc: CRC;
  education: string;
  age: string;
  marriageYears: string;
  occupation: string;
  address: string;
  catchmentArea: CatchmentArea;
  tokenNumber: number;
  amountPayed: string;
  cnic: string;
  contactNumber: string;
  attendedByDoctor: DoctorDto;
  relation: RelationDto[];
  lastVisit?: Date | null;
}

export class VisitDto {
  visitedAt: Date;
  patient: PatientDto;
}

export class GetVisitsResponseDto {
  success: boolean;
  data: VisitDto[];
}
