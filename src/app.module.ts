// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FrontDeskModule } from './frontdesk/frontdesk.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    FrontDeskModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
