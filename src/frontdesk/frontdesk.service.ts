import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { Patient } from "@prisma/client";
import { DoctorDTO } from "./dto/doctor.dto";
import { SearchRequestDto } from "./dto/search.dto";
import { AddVisitRequestDto } from "./dto/add-visit.dto";
import { GetVisitsResponseDto, VisitDto } from "./dto/visit-response.dto";
import { GetPatientResponseDto } from "./dto/get-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { Relationship } from "@prisma/client";
@Injectable()
export class FrontDeskService {
  constructor(private prisma: PrismaService) {}

  async addPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
    const { attendedByDoctorId, cnic, relation, Visit } = createPatientDto;

    // Check if Doctor ID is provided
    if (!attendedByDoctorId) {
      throw new BadRequestException(
        "Doctor ID is required to create a patient."
      );
    }

    // CNIC validation
    if (cnic) {
      const existingPatient = await this.prisma.patient.findFirst({
        where: { cnic },
      });

      if (existingPatient) {
        throw new BadRequestException(
          "A patient with the same CNIC already exists."
        );
      }
    }

    // Prepare patient data object
    const patientData: any = {
      ...createPatientDto,
      attendedByDoctorId,
    };

    // Conditionally generate a token and add Visit only if `Visit` is passed
    if (Visit && Visit.length > 0) {
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

      // Add token and Visit to patient data
      patientData.tokenNumber = setting.lastToken;
      patientData.Visit = {
        create: Visit.map((visit) => ({
          ...visit,
          tokenNumber: setting.lastToken, // Include token number in the visit
        })),
      };
    } else {
      // No visits, no token generated
      delete patientData.Visit;
    }

    // Conditionally add relation if present and valid
    if (
      relation &&
      relation.length > 0 &&
      relation[0].relation !== Relationship.NONE
    ) {
      const firstRelation = relation[0];

      if (!firstRelation.relationName || !firstRelation.relationCNIC) {
        throw new BadRequestException("Relation information is incomplete.");
      }

      patientData.relation = {
        create: relation.map((r) => ({
          relation: r.relation,
          relationName: r.relationName,
          relationCNIC: r.relationCNIC,
        })),
      };
    } else {
      // If relation is NONE or invalid, don't include the relation field
      delete patientData.relation;
    }

    try {
      // Create the patient
      const patient = await this.prisma.patient.create({
        data: patientData,
      });

      console.log("Relation Data:", relation);
      return patient;
    } catch (error) {
      console.error("Error creating patient:", error); // Log the full error for debugging
      throw new BadRequestException(
        "Error creating patient. Please check the data and try again."
      );
    }
  }

  async getDoctorNames(): Promise<DoctorDTO[]> {
    try {
      const doctors = await this.prisma.user.findMany({
        where: {
          role: "doctor",
        },
        select: {
          id: true,
          name: true,
        },
      });

      return doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name || "",
      }));
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw new Error("An error occurred while fetching doctors");
    }
  }

  async searchPatients(
    input: SearchRequestDto
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
              date: "desc",
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
      console.error("Error searching for patients:", error);
      return {
        success: false,
        error: "An error occurred while searching for patients.",
        data: [],
      };
    }
  }

  async searchVisit(
    input: SearchRequestDto
  ): Promise<{ success: boolean; error?: string; data: any[] }> {
    try {
      const { cnic } = input;

      if (!cnic) {
        throw new BadRequestException("CNIC is required for searching visits.");
      }

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
              date: "desc",
            },
            take: 1,
          },
          attendedByDoctor: true,
        },
      });

      if (patients.length === 0) {
        return {
          success: false,
          error: "No patients found with the provided CNIC.",
          data: [],
        };
      }

      return {
        success: true,
        data: patients.map((patient) => ({
          id: patient.id,
          name: patient.name,
          fatherName: patient.fatherName,
          cnic: patient.cnic,
          relation: patient.relation,
          lastVisit: patient.Visit.length > 0 ? patient.Visit[0].date : null,
          attendedByDoctor: patient.attendedByDoctor,
        })),
      };
    } catch (error) {
      console.error("Error getting visit by CNIC:", error);
      throw new BadRequestException(
        "An error occurred while getting the visit by CNIC: " + error.message
      );
    }
  }

  async addVisit(
    input: AddVisitRequestDto
  ): Promise<{ success: boolean; error?: string }> {
    const { patientId } = input;

    try {
      // Find the patient by ID and retrieve their token number
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        select: { tokenNumber: true },
      });

      if (!patient) {
        throw new NotFoundException("Patient not found.");
      }

      // Create a visit for the patient
      await this.prisma.visit.create({
        data: {
          patientId: patientId,
          tokenNumber: patient.tokenNumber,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error adding visit:", error);

      // Return error details
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        "An error occurred while adding the visit."
      );
    }
  }

  async getVisits(): Promise<GetVisitsResponseDto> {
    try {
      const visits = await this.prisma.visit.findMany({
        include: {
          patient: {
            include: {
              relation: true,
              attendedByDoctor: true,
            },
          },
        },
      });

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
        data: formattedVisits as unknown as VisitDto[],
      };
    } catch (error) {
      console.error("Error getting visits:", error); // Log full error for better debugging
      throw new BadRequestException(
        error.message || "Something went wrong while fetching visits."
      );
    }
  }

  async getPatientById(id: string): Promise<GetPatientResponseDto> {
    // Remove or adjust the ID validation based on the actual format used in your database
    if (!id) {
      throw new BadRequestException("Patient ID is required.");
    }

    try {
      const data = await this.prisma.patient.findUnique({
        where: { id },
        include: {
          relation: true,
          Visit: {
            orderBy: {
              date: "desc",
            },
            take: 1, // Get the most recent visit
          },
          attendedByDoctor: true,
        },
      });

      if (!data) {
        throw new NotFoundException("Patient not found.");
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
      console.error("Error getting patient:", error);
      throw new BadRequestException(
        "An error occurred while getting the patient."
      );
    }
  }

  async updatePatient(id: string, updatePatientDto: UpdatePatientDto) {
    console.log('Received update data:', updatePatientDto); // Add this to log incoming data

    const { attendedByDoctorId, cnic, relation, ...rest } = updatePatientDto;
  
    if (!attendedByDoctorId) {
      throw new BadRequestException("Doctor ID is required to create a patient.");
    }
  
    // CNIC validation: Ensure no other patient exists with the same CNIC
    if (cnic) {
      const existingPatient = await this.prisma.patient.findFirst({
        where: { cnic },
      });
  
      if (existingPatient && existingPatient.id !== id) {
        throw new BadRequestException("A patient with the same CNIC already exists.");
      }
    }
  
    // Create an object to hold the update data
    const updateData: any = {
      ...rest, // Spread all non-relational fields
    };
  
    // Handle the attendedByDoctorId (relational field)
    if (attendedByDoctorId) {
      updateData.attendedByDoctor = {
        connect: { id: attendedByDoctorId }, // Use connect to link the doctor
      };
    }
  
    // Handle relations (create new relations if they are provided)
    if (relation && relation.length > 0 && relation[0].relation !== Relationship.NONE) {
      const firstRelation = relation[0];
      if (!firstRelation.relationName || !firstRelation.relationCNIC) {
        throw new BadRequestException("Relation information is incomplete.");
      }
  
      updateData.relation = {
        create: relation.map((r) => ({
          relation: r.relation,
          relationName: r.relationName,
          relationCNIC: r.relationCNIC,
        })),
      };
    }
  
    try {
      const updatedPatient = await this.prisma.patient.update({
        where: { id },
        data: updateData,
        include: { relation: true }, // Include relations in the response
      });
      return updatedPatient;
    } catch (error) {
      throw new NotFoundException("Patient not found or the update is not applicable.");
    }
  }
  
}
// doctor id 66a3f7e0a3fae9634a429717
// patient id 66df51673e73bb31afb0316b
