import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from '@prisma/client';
import { DoctorDTO } from './dto/doctor.dto';
import { SearchRequestDto } from './dto/search.dto';
import { AddVisitRequestDto } from './dto/add-visit.dto';
import { GetVisitsResponseDto, VisitDto } from './dto/visit-response.dto';
import { GetPatientResponseDto } from './dto/get-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Relationship } from '@prisma/client';
import { identity } from 'rxjs';

@Injectable()
export class FrontDeskService {
  constructor(private prisma: PrismaService) {}

  async addPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
    const { attendedByDoctorId, relation, Visit, details, ...otherFields } =
      createPatientDto;

    const patientData: any = {
      ...otherFields,
      ...(attendedByDoctorId ? { attendedByDoctorId } : {}),
    };

    // Handle relation information if provided and not 'NONE'
    if (relation && relation.length > 0 && relation[0].relation !== 'NONE') {
      const firstRelation = relation[0];

      if (!firstRelation.relationName || !firstRelation.relationCNIC) {
        throw new BadRequestException('Relation information is incomplete.');
      }

      // Create relation data without patientId, Prisma will automatically link it
      patientData.relation = {
        create: relation.map((r) => ({
          relation: r.relation,
          relationName: r.relationName,
          relationCNIC: r.relationCNIC,
        })),
      };
    }

    // Handle Visit and token generation if Visits are provided
    if (Visit && Array.isArray(Visit) && Visit.length > 0) {
      const today = new Date().setHours(0, 0, 0, 0);
      let setting = await this.prisma.globalSetting.findFirst();

      // Check if token needs to be reset
      if (!setting || setting.lastTokenDate.setHours(0, 0, 0, 0) < today) {
        setting = await this.prisma.globalSetting.upsert({
          where: { id: setting?.id || '' },
          update: {
            lastToken: 1,
            lastTokenDate: new Date(),
          },
          create: {
            lastToken: 1,
            lastTokenDate: new Date(),
          },
        });
      } else {
        // Increment token
        setting = await this.prisma.globalSetting.update({
          where: { id: setting.id },
          data: { lastToken: setting.lastToken + 1 },
        });
      }

      // Assign token number and prepare Visit data
      patientData.tokenNumber = setting.lastToken;
      patientData.Visit = {
        create: Visit.map((visit) => ({
          ...visit,
          tokenNumber: setting.lastToken, // Include token number in the visit
        })),
      };
    } else {
      delete patientData.Visit; // No visits, remove from data
    }

    // Handle patient details if provided
    if (details) {
      patientData.details = {
        create: {
          weight: details.weight,
          sugarLevel: details.sugarLevel,
          temperature: details.temperature,
          height: details.height,
          bloodPressure: details.bloodPressure,
        },
      };
    } else {
      delete patientData.details; // If no patient details are provided, remove from data
    }

    // Attempt to create the patient in the database
    try {
      // Log patientData to verify that relation data is included
      console.log('Creating patient with data:', patientData);

      const patient = await this.prisma.patient.create({
        data: patientData,
        include: {
          relation: true, // Include relation in the response to verify creation
        },
      });

      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new BadRequestException(
        error.message || 'Error creating patient. Please try again later.',
      );
    }
  }

  async getDoctorNames(): Promise<DoctorDTO[]> {
    try {
      const doctors = await this.prisma.user.findMany({
        where: {
          role: 'doctor',
        },
        select: {
          id: true,
          name: true,
        },
      });

      return doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name || '',
      }));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('An error occurred while fetching doctors');
    }
  }

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

  async searchVisit(
    input: SearchRequestDto,
  ): Promise<{ success: boolean; error?: string; data: any[] }> {
    try {
      const { cnic } = input;

      if (!cnic) {
        throw new BadRequestException('CNIC is required for searching visits.');
      }

      // Fetch patients by CNIC and related data
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
            take: 1, // Get the latest visit
          },
          attendedByDoctor: {
            select: {
              name: true, // Fetching the doctor's name
            },
          },
        },
      });

      // If no patient found
      if (patients.length === 0) {
        return {
          success: false,
          error: 'No patients found with the provided CNIC.',
          data: [],
        };
      }

      // Fetch the latest token from GlobalSetting
      const globalSetting = await this.prisma.globalSetting.findFirst({
        orderBy: {
          lastTokenDate: 'desc', // Get the most recent token setting
        },
      });

      return {
        success: true,
        data: patients.map((patient) => ({
          id: patient.id,
          name: patient.name,
          fatherName: patient.fatherName,
          cnic: patient.cnic,
          education: patient.education,
          identity: patient.identity,
          catchmentArea: patient.catchmentArea,
          occupation: patient.occupation,
          relation: patient.relation,
          lastVisit: patient.Visit.length > 0 ? patient.Visit[0].date : null,
          attendedByDoctorName: patient.attendedByDoctor?.name || null,
          tokenNumber: patient.tokenNumber || null,
          amountPayed: patient.amountPayed || null, // Fetch directly from the Patient model
          lastToken: globalSetting?.lastToken || null, // Last token from GlobalSetting
        })),
      };
    } catch (error) {
      console.error('Error getting visit by CNIC:', error);
      throw new BadRequestException(
        'An error occurred while getting the visit by CNIC: ' + error.message,
      );
    }
  }

  async addVisit(
    input: AddVisitRequestDto,
  ): Promise<{ success: boolean; error?: string }> {
    const { patientId, Visit } = input;

    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found.');
      }

      let tokenNumber = patient.tokenNumber;

      if (!tokenNumber) {
        // Token generation logic
        const today = new Date().setHours(0, 0, 0, 0);
        let setting = await this.prisma.globalSetting.findFirst();

        if (!setting || setting.lastTokenDate.setHours(0, 0, 0, 0) < today) {
          if (!setting) {
            setting = await this.prisma.globalSetting.create({
              data: {
                lastToken: 1,
                lastTokenDate: new Date(),
              },
            });
          } else {
            setting = await this.prisma.globalSetting.update({
              where: { id: setting.id },
              data: {
                lastToken: 1,
                lastTokenDate: new Date(),
              },
            });
          }
        } else {
          setting = await this.prisma.globalSetting.update({
            where: { id: setting.id },
            data: { lastToken: setting.lastToken + 1 },
          });
        }

        tokenNumber = setting.lastToken;

        // Update patient with new token number
        await this.prisma.patient.update({
          where: { id: patientId },
          data: { tokenNumber },
        });
      }

      // Create new visit
      await this.prisma.visit.create({
        data: {
          patient: { connect: { id: patientId } },
          tokenNumber,
          // Add any other fields from the Visit input if needed
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding visit:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(error);
    }
  }

  async getVisits(dateString?: string): Promise<GetVisitsResponseDto> {
    try {
      // If dateString is provided, parse it; otherwise, use the current date
      let date = new Date();
      if (dateString) {
        date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format.');
        }
      }

      // Set the start and end of the day in local time
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
      );

      // Fetch visits for the specified date in local time
      const visits = await this.prisma.visit.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay, // Use 'lte' for inclusive comparison up to the end of the day
          },
        },
        include: {
          patient: {
            include: {
              relation: true,
              attendedByDoctor: true,
            },
          },
        },
      });

      // Map visits to the DTO format
      const formattedVisits = visits.map((visit) => ({
        visitedAt: visit.date,
        patient: {
          id: visit.patient.id,
          name: visit.patient.name,
          fatherName: visit.patient.fatherName,
          email: visit.patient.email,
          identity: visit.patient.identity,
          crc: visit.patient.crc,
          education: visit.patient.education,
          age: visit.patient.age,
          marriageYears: visit.patient.marriageYears,
          occupation: visit.patient.occupation,
          address: visit.patient.address,
          catchmentArea: visit.patient.catchmentArea,
          tokenNumber: visit.patient.tokenNumber,
          amountPayed: visit.patient.amountPayed,
          cnic: visit.patient.cnic,
          contactNumber: visit.patient.contactNumber,
          attendedByDoctor: visit.patient.attendedByDoctor,
          relation: visit.patient.relation,
        },
      }));

      return {
        success: true,
        data: formattedVisits,
      };
    } catch (error) {
      console.error('Error getting visits:', error);
      throw new BadRequestException(
        error.message || 'Something went wrong while fetching visits.',
      );
    }
  }

  async getPatientById(id: string): Promise<GetPatientResponseDto> {
    // Remove or adjust the ID validation based on the actual format used in your database
    if (!id) {
      throw new BadRequestException('Patient ID is required.');
    }

    try {
      const data = await this.prisma.patient.findUnique({
        where: { id },
        include: {
          relation: true,
          Visit: {
            orderBy: {
              date: 'desc',
            },
            take: 1, // Get the most recent visit
          },
          attendedByDoctor: true,
        },
      });

      if (!data) {
        throw new NotFoundException('Patient not found.');
      }

      const lastVisitDate = data.Visit.length > 0 ? data.Visit[0].date : null;

      return {
        success: true,
        data: {
          ...data,
          lastVisit: lastVisitDate,
        },
      };
    } catch (error) {
      console.error('Error getting patient:', error);
      throw new BadRequestException(
        'An error occurred while getting the patient.',
      );
    }
  }

  async updatePatient(id: string, updatePatientDto: UpdatePatientDto) {
    console.log('Received update data:', updatePatientDto); // Add this to log incoming data

    const { relation, ...rest } = updatePatientDto;

    const updateData: any = {
      ...rest,
    };

    if (
      relation &&
      relation.length > 0 &&
      relation[0].relation !== Relationship.NONE
    ) {
      const firstRelation = relation[0];
      if (!firstRelation.relationName || !firstRelation.relationCNIC) {
        throw new BadRequestException('Relation information is incomplete.');
      }

      updateData.relation = {
        create: relation.map((r) => ({
          relation: r.relation,
          relationName: r.relationName,
          relationCNIC: r.relationCNIC,
        })),
      };
    } else {
      delete updateData.relation;
    }

    try {
      const updatedPatient = await this.prisma.patient.update({
        where: { id },
        data: updateData,
        // include: { relation: true }, // Include relations in the response
      });
      return updatedPatient;
    } catch (error) {
      throw new NotFoundException(
        'Patient not found or the update is not applicable.',
      );
    }
  }
}
// doctor id 66a3f7e0a3fae9634a429717
// patient id 66df51673e73bb31afb0316b
