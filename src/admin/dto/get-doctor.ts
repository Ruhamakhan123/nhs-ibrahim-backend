import { IsString } from "class-validator";

export class GetDoctorDTO {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  specialization: string;

  @IsString()
  license: string;

  @IsString()
  age: string;

  @IsString()
  status: string;
}
