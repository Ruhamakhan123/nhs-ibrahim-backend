import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  imports: [],
  providers: [AdminService, PrismaService],
  controllers: [AdminController],
})
export class AdminModule {}
