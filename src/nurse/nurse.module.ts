import { Module } from '@nestjs/common';
import { NurseController } from './nurse.controller';
import { NurseService } from './nurse.service';
import { PrismaService } from '../prisma/prisma.service'; // Adjust the path based on your project structure

@Module({
  controllers: [NurseController],
  providers: [NurseService, PrismaService],
})
export class NurseModule {}
