import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();
