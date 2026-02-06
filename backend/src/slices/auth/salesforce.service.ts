import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthService } from './auth.service';
import * as jsforce from 'jsforce';
import { UserRole } from '@prisma/client';

interface SalesforcePartner {
  Id: string;
  Partner__c: string; // Account ID
  AuthPiatt__c: boolean;
  UserPiatt__c: string; // Email
  PwdPiatt__c: string; // Password (should be hashed in SF)
  EmailOrdine__c: string;
  EmailAmm__c: string;
}

@Injectable()
export class SalesforceService {
  private readonly logger = new Logger(SalesforceService.name);
  private conn: jsforce.Connection;

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.initializeConnection();
  }

  /**
   * Initialize Salesforce connection
   */
  private initializeConnection() {
    this.conn = new jsforce.Connection({
      loginUrl: this.configService.get<string>('SALESFORCE_LOGIN_URL', 'https://login.salesforce.com'),
    });
  }

  /**
   * Login to Salesforce
   */
  private async login(): Promise<void> {
    const username = this.configService.get<string>('SALESFORCE_USERNAME');
    const password = this.configService.get<string>('SALESFORCE_PASSWORD');
    const securityToken = this.configService.get<string>('SALESFORCE_SECURITY_TOKEN');

    if (!username || !password) {
      this.logger.warn('Salesforce credentials not configured, skipping login');
      return;
    }

    try {
      await this.conn.login(username, password + (securityToken || ''));
      this.logger.log('Successfully connected to Salesforce');
    } catch (error) {
      this.logger.error(`Failed to connect to Salesforce: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync users from Salesforce (Cron job every 5 minutes)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncUsersFromSalesforce(): Promise<void> {
    this.logger.log('Starting user sync from Salesforce...');

    try {
      // Login to SF
      await this.login();

      // Query Partner B2B records
      // Note: Replace 'Partner_B2B__c' with actual SF object name
      const result = await this.conn.query<SalesforcePartner>(
        `SELECT Id, Partner__c, AuthPiatt__c, UserPiatt__c, PwdPiatt__c, EmailOrdine__c, EmailAmm__c
         FROM Partner_B2B__c
         WHERE AuthPiatt__c = true`,
      );

      this.logger.log(`Found ${result.totalSize} active partners in Salesforce`);

      // Process each partner
      for (const partner of result.records) {
        await this.upsertUser(partner);
      }

      // Deactivate users not in Salesforce anymore
      await this.deactivateRemovedUsers(result.records);

      this.logger.log('User sync completed successfully');
    } catch (error) {
      this.logger.error(`User sync failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Upsert user from Salesforce partner record
   */
  private async upsertUser(partner: SalesforcePartner): Promise<void> {
    const email = partner.UserPiatt__c;

    if (!email) {
      this.logger.warn(`Partner ${partner.Id} has no email, skipping`);
      return;
    }

    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      // Hash password if it's plaintext (TODO: verify SF stores hashed)
      // For now, assume PwdPiatt__c is plaintext and needs hashing
      let passwordHash = partner.PwdPiatt__c;
      if (passwordHash && !passwordHash.startsWith('$2')) {
        // Not a bcrypt hash
        passwordHash = await this.authService.hashPassword(passwordHash);
      }

      if (existingUser) {
        // Update existing user
        await this.prisma.user.update({
          where: { email },
          data: {
            passwordHash,
            isActive: partner.AuthPiatt__c,
            salesforceAccountId: partner.Partner__c,
            orderEmail: partner.EmailOrdine__c,
            billingEmail: partner.EmailAmm__c,
          },
        });

        this.logger.debug(`Updated user: ${email}`);
      } else {
        // Create new user
        await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            role: UserRole.PARTNER,
            isActive: partner.AuthPiatt__c,
            salesforceAccountId: partner.Partner__c,
            orderEmail: partner.EmailOrdine__c,
            billingEmail: partner.EmailAmm__c,
          },
        });

        this.logger.log(`Created new partner user: ${email}`);
      }
    } catch (error) {
      this.logger.error(`Failed to upsert user ${email}: ${error.message}`);
    }
  }

  /**
   * Deactivate users that are no longer in Salesforce
   */
  private async deactivateRemovedUsers(activePartners: SalesforcePartner[]): Promise<void> {
    const activeEmails = activePartners.map((p) => p.UserPiatt__c).filter(Boolean);

    // Deactivate PARTNER users not in active list
    const result = await this.prisma.user.updateMany({
      where: {
        role: UserRole.PARTNER,
        email: {
          notIn: activeEmails,
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Deactivated ${result.count} users no longer in Salesforce`);
    }
  }

  /**
   * Manual sync trigger (for testing)
   */
  async triggerManualSync(): Promise<void> {
    this.logger.log('Manual sync triggered');
    await this.syncUsersFromSalesforce();
  }
}
