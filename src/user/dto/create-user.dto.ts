import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  specialization: string;

  

  @IsOptional()
  @IsString()
  qualification: string;

  @IsOptional()
  @IsString()
  age: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  license: string;
}
