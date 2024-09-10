import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
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
  license: string;

  @IsOptional()
  @IsString()
  age: string;
}
