import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { ServicesModule } from './common/services/services.module';
import { AuthModule } from './slices/auth/auth.module';
import { CatalogModule } from './slices/catalog/catalog.module';
import { StandardConfiguratorModule } from './slices/standard-configurator/standard-configurator.module';
import { WebhooksModule } from './slices/webhooks/webhooks.module';
import { JwtAuthGuard } from './slices/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduling (for cron jobs)
    ScheduleModule.forRoot(),

    // Prisma & Common Services (Global modules)
    PrismaModule,
    ServicesModule,

    // Slices
    AuthModule,
    CatalogModule,
    StandardConfiguratorModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT guard (all routes protected by default unless @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
