// src/user/user.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/decorators/roles/role.enum';
import { User as UserModel } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserModel> {
    console.log('Received CreateUserDto:', createUserDto);
    return this.userService.createUser(createUserDto);
  }
  @Post('admin')
  async createAdmin(@Body() createUserDto: CreateUserDto): Promise<UserModel> {
    return this.userService.createUser({
      ...createUserDto,
      role: 'admin',
    });
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async findAllUsers(): Promise<UserModel[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async findOneUser(@Param('id') id: string): Promise<UserModel> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ): Promise<UserModel> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteUser(@Param('id') id: string): Promise<UserModel> {
    return this.userService.deleteUser(id);
  }
}
