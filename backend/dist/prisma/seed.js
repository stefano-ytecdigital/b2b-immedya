"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Starting seed...');
    console.log('🗑️  Clearing existing data...');
    await prisma.quotation.deleteMany();
    await prisma.kitModule.deleteMany();
    await prisma.kit.deleteMany();
    await prisma.module.deleteMany();
    await prisma.product.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    console.log('👤 Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@immedya.com',
            passwordHash,
            role: client_1.UserRole.ADMIN,
            isActive: true,
            firstName: 'Admin',
            lastName: 'User',
        },
    });
    const partnerUser = await prisma.user.create({
        data: {
            email: 'partner@test.com',
            passwordHash,
            role: client_1.UserRole.PARTNER,
            isActive: true,
            firstName: 'Test',
            lastName: 'Partner',
            company: 'Test Company SRL',
            salesforceAccountId: 'SF_ACC_001',
            orderEmail: 'orders@test.com',
            billingEmail: 'billing@test.com',
        },
    });
    console.log(`✅ Created users: ${adminUser.email}, ${partnerUser.email}`);
    console.log('📦 Seeding products...');
    const ledWallIndoor = await prisma.product.create({
        data: {
            name: 'LEDWall Indoor P2.5',
            type: client_1.ProductType.STANDARD,
            outdoorCompatible: false,
            description: 'High-resolution indoor LED display, perfect for corporate events and retail',
            imageUrl: '/products/ledwall-indoor-p25.jpg',
        },
    });
    const ledWallOutdoor = await prisma.product.create({
        data: {
            name: 'LEDWall Outdoor P5',
            type: client_1.ProductType.STANDARD,
            outdoorCompatible: true,
            description: 'Weather-resistant outdoor LED display for advertising and public events',
            imageUrl: '/products/ledwall-outdoor-p5.jpg',
        },
    });
    const ledWallCustom = await prisma.product.create({
        data: {
            name: 'LEDWall Custom P3',
            type: client_1.ProductType.CUSTOM,
            outdoorCompatible: true,
            description: 'Customizable LED wall for unique installations',
            imageUrl: '/products/ledwall-custom-p3.jpg',
        },
    });
    console.log(`✅ Created products: ${[ledWallIndoor, ledWallOutdoor, ledWallCustom].map((p) => p.name).join(', ')}`);
    console.log('🧩 Seeding modules...');
    const moduleIndoor1 = await prisma.module.create({
        data: {
            name: 'Module P2.5 500x500',
            productId: ledWallIndoor.id,
            widthMm: 500,
            heightMm: 500,
            pixelPitch: 2.5,
            resolutionWidth: 200,
            resolutionHeight: 200,
            powerConsumptionW: 150,
            weightKg: 8.5,
            maxPixelsPerCard: 160000,
            unitPriceCents: 45000,
        },
    });
    const moduleIndoor2 = await prisma.module.create({
        data: {
            name: 'Module P2.5 1000x500',
            productId: ledWallIndoor.id,
            widthMm: 1000,
            heightMm: 500,
            pixelPitch: 2.5,
            resolutionWidth: 400,
            resolutionHeight: 200,
            powerConsumptionW: 300,
            weightKg: 17,
            maxPixelsPerCard: 160000,
            unitPriceCents: 85000,
        },
    });
    const moduleOutdoor1 = await prisma.module.create({
        data: {
            name: 'Module P5 1000x1000',
            productId: ledWallOutdoor.id,
            widthMm: 1000,
            heightMm: 1000,
            pixelPitch: 5,
            resolutionWidth: 200,
            resolutionHeight: 200,
            powerConsumptionW: 400,
            weightKg: 25,
            maxPixelsPerCard: 80000,
            unitPriceCents: 120000,
        },
    });
    const moduleOutdoor2 = await prisma.module.create({
        data: {
            name: 'Module P5 500x1000',
            productId: ledWallOutdoor.id,
            widthMm: 500,
            heightMm: 1000,
            pixelPitch: 5,
            resolutionWidth: 100,
            resolutionHeight: 200,
            powerConsumptionW: 200,
            weightKg: 12.5,
            maxPixelsPerCard: 80000,
            unitPriceCents: 65000,
        },
    });
    const moduleCustom1 = await prisma.module.create({
        data: {
            name: 'Module P3 750x750',
            productId: ledWallCustom.id,
            widthMm: 750,
            heightMm: 750,
            pixelPitch: 3,
            resolutionWidth: 250,
            resolutionHeight: 250,
            powerConsumptionW: 250,
            weightKg: 15,
            maxPixelsPerCard: 120000,
            unitPriceCents: 95000,
        },
    });
    console.log(`✅ Created ${[moduleIndoor1, moduleIndoor2, moduleOutdoor1, moduleOutdoor2, moduleCustom1].length} modules`);
    console.log('📦 Seeding kits...');
    const kit1 = await prisma.kit.create({
        data: {
            name: 'Indoor Kit 3x2m - P2.5',
            productId: ledWallIndoor.id,
            description: 'Perfect for small events and retail displays. 3m wide x 2m height.',
            imageUrl: '/kits/indoor-3x2.jpg',
            totalWidthMm: 3000,
            totalHeightMm: 2000,
            totalResolutionW: 1200,
            totalResolutionH: 800,
            pixelPitch: 2.5,
            totalPriceCents: 540000,
            modules: {
                create: [
                    {
                        moduleId: moduleIndoor1.id,
                        quantity: 12,
                    },
                ],
            },
        },
    });
    const kit2 = await prisma.kit.create({
        data: {
            name: 'Indoor Kit 4x3m - P2.5',
            productId: ledWallIndoor.id,
            description: 'Medium-sized indoor display for conferences and exhibitions. 4m wide x 3m height.',
            imageUrl: '/kits/indoor-4x3.jpg',
            totalWidthMm: 4000,
            totalHeightMm: 3000,
            totalResolutionW: 1600,
            totalResolutionH: 1200,
            pixelPitch: 2.5,
            totalPriceCents: 1020000,
            modules: {
                create: [
                    {
                        moduleId: moduleIndoor2.id,
                        quantity: 24,
                    },
                ],
            },
        },
    });
    const kit3 = await prisma.kit.create({
        data: {
            name: 'Outdoor Kit 5x3m - P5',
            productId: ledWallOutdoor.id,
            description: 'Large outdoor display for advertising and public events. 5m wide x 3m height.',
            imageUrl: '/kits/outdoor-5x3.jpg',
            totalWidthMm: 5000,
            totalHeightMm: 3000,
            totalResolutionW: 1000,
            totalResolutionH: 600,
            pixelPitch: 5,
            totalPriceCents: 1800000,
            modules: {
                create: [
                    {
                        moduleId: moduleOutdoor1.id,
                        quantity: 15,
                    },
                ],
            },
        },
    });
    const kit4 = await prisma.kit.create({
        data: {
            name: 'Outdoor Kit 3x2m - P5',
            productId: ledWallOutdoor.id,
            description: 'Compact outdoor display for storefronts. 3m wide x 2m height.',
            imageUrl: '/kits/outdoor-3x2.jpg',
            totalWidthMm: 3000,
            totalHeightMm: 2000,
            totalResolutionW: 600,
            totalResolutionH: 400,
            pixelPitch: 5,
            totalPriceCents: 720000,
            modules: {
                create: [
                    {
                        moduleId: moduleOutdoor1.id,
                        quantity: 6,
                    },
                ],
            },
        },
    });
    console.log(`✅ Created kits: ${[kit1, kit2, kit3, kit4].map((k) => k.name).join(', ')}`);
    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 2 (1 admin, 1 partner)`);
    console.log(`   - Products: 3`);
    console.log(`   - Modules: 5`);
    console.log(`   - Kits: 4`);
    console.log('\n🔑 Test credentials:');
    console.log(`   Admin: admin@immedya.com / password123`);
    console.log(`   Partner: partner@test.com / password123`);
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map