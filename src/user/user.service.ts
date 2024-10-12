import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { User as UserModel } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisam: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserModel> {
    try {
      const hashedPassword = await argon2.hash(createUserDto.password);
      const user = await this.prisam.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashedPassword,
          image: createUserDto.image,
          role: createUserDto.role,
          specialization: createUserDto.specialization,
          license: createUserDto.license,
          age: createUserDto.age,
        },
      });
      return user;
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(): Promise<UserModel[]> {
    return this.prisam.user.findMany();
  }

  async findOne(id: string): Promise<UserModel | null> {
    return this.prisam.user.findUnique({
      where: { id },
    });
  }

  async updateUser(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<UserModel> {
    try {
      const updatedUser = await this.prisam.user.update({
        where: { id },
        data: updateUserDto,
      });
      return updatedUser;
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async deleteUser(id: string): Promise<UserModel> {
    try {
      return await this.prisam.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.NOT_FOUND);
    }
  }
}
