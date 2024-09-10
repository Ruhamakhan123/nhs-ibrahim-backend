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
  cnic: string;
  contactNumber: string;
  attendedByDoctor: DoctorDto;
  relation: RelationDto[];
}

export class VisitDto {
  visitedAt: Date;
  patient: PatientDto;
}

export class GetVisitsResponseDto {
  success: boolean;
  data: VisitDto[];
}
