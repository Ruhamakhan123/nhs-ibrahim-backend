import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PatientDetailsDto } from './dto/patient-details.dto'; // Import the DTO
import { PatientDetails } from '@prisma/client';
import { SearchRequestDto } from 'src/frontdesk/dto/search.dto';

@Injectable()
export class NurseService {
  constructor(private readonly prisma: PrismaService) {}

  async searchPatients(
    input: SearchRequestDto,
  ): Promise<{ success: boolean; error?: string; data: any[] }> {
    try {
      const { cnic } = input;

      const patients = await this.prisma.patient.findMany({
        where: {
          OR: [
            {
              cnic: {
                contains: cnic,
              },
            },
            {
              relation: {
                some: {
                  relationCNIC: {
                    contains: cnic,
                  },
                },
              },
            },
          ],
        },
        include: {
          relation: true,
          Visit: {
            orderBy: {
              date: 'desc',
            },
            take: 1,
          },
        },
      });

      const result = patients.map((patient) => ({
        ...patient,
        lastVisit: patient.Visit.length > 0 ? patient.Visit[0].date : null,
        attendedByDoctorId: patient.attendedByDoctorId ?? null,
      }));

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error searching for patients:', error);
      return {
        success: false,
        error: 'An error occurred while searching for patients.',
        data: [],
      };
    }
  }
  

  async addPatientDetails(
    patientId: string,
    createPatientDetailsDto: PatientDetailsDto,
  ): Promise<PatientDetails> {
    console.log('Received id:', patientId);
    // Check if the patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id ${patientId} not found`);
    }

    try {
      // Check if details already exist for the patient
      const existingDetails = await this.prisma.patientDetails.findUnique({
        where: { id: patientId },
      });

      // If details exist, update them instead of creating new ones
      if (existingDetails) {
        return this.prisma.patientDetails.update({
          where: { patientId },
          data: createPatientDetailsDto,
        });
      }

      // Create patient details linked to the patient
      return this.prisma.patientDetails.create({
        data: {
          patientId, // Link to the existing patient
          ...createPatientDetailsDto,
        },
      });
    } catch (error) {
      console.error('Error adding patient details:', error);
      // Handle potential errors (like database errors)
      throw new BadRequestException('Failed to add or update patient details');
    }
  }
}
