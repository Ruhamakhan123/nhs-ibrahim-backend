import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  Put,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FrontDeskService } from "./frontdesk.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { JwtAuthGuard } from "../auth/jwtAuth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../common/decorators/roles/role.enum";
import { Patient as PatientModel } from "@prisma/client";
import { SearchRequestDto } from "./dto/search.dto";
import { AddVisitRequestDto } from "./dto/add-visit.dto";
import { GetVisitsResponseDto } from "./dto/visit-response.dto";
import { GetPatientResponseDto } from "./dto/get-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
@Controller("frontdesk")
export class FrontDeskController {
  constructor(private readonly frontDeskService: FrontDeskService) {}

  @Post("patients")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FrontDesk)
  async addPatient(
    @Body() createPatientDto: CreatePatientDto
  ): Promise<PatientModel> {
    return this.frontDeskService.addPatient(createPatientDto);
  }

  @Get("patients")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FrontDesk, Role.Nurse)
  async searchPatients(
    @Query() input: SearchRequestDto
  ): Promise<{ success: boolean; error?: string; data: any[] }> {
    
    return this.frontDeskService.searchPatients(input);
  }

  @Get("doctors")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FrontDesk)
  async getDoctors() {
    return this.frontDeskService.getDoctorNames();
  }

  @Get("patient/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FrontDesk)
  async getPatientById(
    @Param("id") id: string
  ): Promise<GetPatientResponseDto> {
    return this.frontDeskService.getPatientById(id);
  }

  @Post("visits")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FrontDesk)
  async addVisit(
    @Body() addVisitRequestDto: AddVisitRequestDto
  ): Promise<{ success: boolean; error?: string }> {
    return this.frontDeskService.addVisit(addVisitRequestDto);
  }

  @Get("visits")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FrontDesk)
  async searchVisit(
    @Query() input: SearchRequestDto
  ): Promise<{ success: boolean; error?: string; data: any[] }> {
    return this.frontDeskService.searchVisit(input);
  }

  @Get("all-visits")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FrontDesk)
  async getVisits(): Promise<GetVisitsResponseDto> {
    return this.frontDeskService.getVisits();
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FrontDesk)
  async updatePatient(
    @Param("id") id: string,
    @Body() updatePatientDto: UpdatePatientDto
  ) {
    return this.frontDeskService.updatePatient(id, updatePatientDto);
  }
}
