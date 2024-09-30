import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { NurseService } from './nurse.service';
import { PatientDetailsDto } from './dto/patient-details.dto'; // DTO for patient details
import { Patient, PatientDetails } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/decorators/roles/role.enum';
import { PrismaService } from '../prisma/prisma.service';
@Controller('nurse')
export class NurseController {
  constructor(
    private readonly nurseService: NurseService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Nurse)
  @Post(':patientId/details')
  async addPatientDetails(
    @Param('patientId') patientId: string,
    @Body() createPatientDetailsDto: PatientDetailsDto,
  ): Promise<PatientDetails> {
    return this.nurseService.addPatientDetails(
      patientId,
      createPatientDetailsDto,
    );
  }
}

//66e5eb0ab2f0c9a24e9600d7
