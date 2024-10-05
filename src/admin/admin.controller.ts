import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { GetDoctorDTO } from './dto/get-doctor';
import { GetNurseDTO } from './dto/get-nurse';
import { GetPharmacistDTO } from './dto/get-pharmacist';
import { GetFrontDeskDTO } from './dto/get-frontdesk';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from "../common/decorators/roles/role.enum";

@Controller('admin') 
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getDoctors(): Promise<GetDoctorDTO[]> {
    return this.adminService.getDoctors();
  }

  @Get('nurse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getNurses(): Promise<GetNurseDTO[]> {
    return this.adminService.getNurses();
  }

  @Get('pharmacist')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getPharmacists(): Promise<GetPharmacistDTO[]> {
    return this.adminService.getPharmacists();
  }

  @Get('frontdesk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getFrontDesk(): Promise<GetFrontDeskDTO[]> {
    return this.adminService.getFrontDesk();
  }
}
