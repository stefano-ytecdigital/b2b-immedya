import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private prisma: PrismaClient;
  private pool: Pool;

  constructor(private configService: ConfigService) {
    // Create PostgreSQL connection pool
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });

    // Create Prisma adapter
    const adapter = new PrismaPg(this.pool);

    // Initialize Prisma Client with adapter
    this.prisma = new PrismaClient({
      adapter,
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to PostgreSQL database...');
    await this.prisma.$connect();
    this.logger.log('Successfully connected to database');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.prisma.$disconnect();
    await this.pool.end();
    this.logger.log('Database connection closed');
  }

  // Proxy all Prisma Client models
  get user() {
    return this.prisma.user;
  }

  get refreshToken() {
    return this.prisma.refreshToken;
  }

  get product() {
    return this.prisma.product;
  }

  get module() {
    return this.prisma.module;
  }

  get kit() {
    return this.prisma.kit;
  }

  get kitModule() {
    return this.prisma.kitModule;
  }

  get quotation() {
    return this.prisma.quotation;
  }

  // Utility methods
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }

  get $executeRaw() {
    return this.prisma.$executeRaw.bind(this.prisma);
  }

  /**
   * Clean database (useful for testing)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    await this.prisma.$transaction([
      this.prisma.quotation.deleteMany(),
      this.prisma.kitModule.deleteMany(),
      this.prisma.kit.deleteMany(),
      this.prisma.module.deleteMany(),
      this.prisma.product.deleteMany(),
      this.prisma.refreshToken.deleteMany(),
      this.prisma.user.deleteMany(),
    ]);
  }
}
