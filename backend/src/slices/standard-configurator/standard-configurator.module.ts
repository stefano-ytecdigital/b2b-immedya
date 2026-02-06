import { Module } from '@nestjs/common';
import { StandardConfiguratorController } from './standard-configurator.controller';
import { StandardConfiguratorService } from './standard-configurator.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ServicesModule } from '../../common/services/services.module';

@Module({
  imports: [PrismaModule, ServicesModule],
  controllers: [StandardConfiguratorController],
  providers: [StandardConfiguratorService],
  exports: [StandardConfiguratorService],
})
export class StandardConfiguratorModule {}
