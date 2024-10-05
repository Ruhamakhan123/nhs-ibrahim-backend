import { IsString } from "class-validator";

export class GetPharmacistDTO {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  qualification: string;

  @IsString()
  age: string;

  @IsString() // Ensure the status is a string
  status: string;
}
