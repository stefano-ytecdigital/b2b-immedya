import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthService } from './auth.service';
export declare class SalesforceService {
    private prisma;
    private authService;
    private configService;
    private readonly logger;
    private conn;
    constructor(prisma: PrismaService, authService: AuthService, configService: ConfigService);
    private initializeConnection;
    private login;
    syncUsersFromSalesforce(): Promise<void>;
    private upsertUser;
    private deactivateRemovedUsers;
    triggerManualSync(): Promise<void>;
}
