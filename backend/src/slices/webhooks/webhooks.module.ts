import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ServicesModule } from '../../common/services/services.module';

@Module({
  imports: [PrismaModule, ServicesModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
