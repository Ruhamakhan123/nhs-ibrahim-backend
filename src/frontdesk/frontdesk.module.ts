import { Module } from '@nestjs/common';
import { FrontDeskService } from './frontdesk.service';
import { FrontDeskController } from './frontdesk.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [FrontDeskService, PrismaService],
  controllers: [FrontDeskController],
})
export class FrontDeskModule {}
