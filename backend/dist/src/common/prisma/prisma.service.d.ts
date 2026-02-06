import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private prisma;
    private pool;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get user(): import("@prisma/client").Prisma.UserDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get refreshToken(): import("@prisma/client").Prisma.RefreshTokenDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get product(): import("@prisma/client").Prisma.ProductDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get module(): import("@prisma/client").Prisma.ModuleDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get kit(): import("@prisma/client").Prisma.KitDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get kitModule(): import("@prisma/client").Prisma.KitModuleDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get quotation(): import("@prisma/client").Prisma.QuotationDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get $transaction(): {
        <P extends import("@prisma/client").Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
            isolationLevel?: import("@prisma/client").Prisma.TransactionIsolationLevel;
        }): import("@prisma/client/runtime/client").JsPromise<import("@prisma/client/runtime/client").UnwrapTuple<P>>;
        <R>(fn: (prisma: Omit<PrismaClient, import("@prisma/client/runtime/client").ITXClientDenyList>) => import("@prisma/client/runtime/client").JsPromise<R>, options?: {
            maxWait?: number;
            timeout?: number;
            isolationLevel?: import("@prisma/client").Prisma.TransactionIsolationLevel;
        }): import("@prisma/client/runtime/client").JsPromise<R>;
    };
    get $queryRaw(): <T = unknown>(query: TemplateStringsArray | import("@prisma/client-runtime-utils").Sql, ...values: any[]) => import("@prisma/client").Prisma.PrismaPromise<T>;
    get $executeRaw(): <T = unknown>(query: TemplateStringsArray | import("@prisma/client-runtime-utils").Sql, ...values: any[]) => import("@prisma/client").Prisma.PrismaPromise<number>;
    cleanDatabase(): Promise<void>;
}
