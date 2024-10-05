import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { GetDoctorDTO } from './dto/get-doctor';
import { GetNurseDTO } from './dto/get-nurse';
import { GetPharmacistDTO } from './dto/get-pharmacist';
import { GetFrontDeskDTO } from './dto/get-frontdesk';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDoctors(): Promise<GetDoctorDTO[]> {
    const doctors = await this.prisma.user.findMany({
      where: { role: 'doctor' },
    });

    return doctors.map((doctor) => ({
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      license: doctor.license,
      age: doctor.age,
      status: doctor.status,
      image: doctor.image
    }));
  }

  async getNurses(): Promise<GetNurseDTO[]> {
    const nurses = await this.prisma.user.findMany({
      where: { role: 'nurse' },
    });

    return nurses.map((nurse) => ({
      name: nurse.name,
      email: nurse.email,
      qualification: nurse.qualification,
      age: nurse.age,
      status: nurse.status,
      image: nurse.image

    }));
  }

  async getPharmacists(): Promise<GetPharmacistDTO[]> {
    const pharmacists = await this.prisma.user.findMany({
      where: { role: 'pharmacist' },
    });

    return pharmacists.map((pharmacist) => ({
      name: pharmacist.name,
      email: pharmacist.email,
      qualification: pharmacist.qualification,
      age: pharmacist.age,
      status: pharmacist.status,
      image: pharmacist.image

    }));
  }

  async getFrontDesk(): Promise<GetFrontDeskDTO[]> {
    const frontDesk = await this.prisma.user.findMany({
      where: { role: 'frontdesk' },
    });

    return frontDesk.map((staff) => ({
      name: staff.name,
      email: staff.email,
      qualification: staff.qualification,
      age: staff.age,
      status: staff.status,
      image: staff.image

    }));
  }
}
