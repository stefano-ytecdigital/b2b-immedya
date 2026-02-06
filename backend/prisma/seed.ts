import { PrismaClient, ProductType, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.quotation.deleteMany();
  await prisma.kitModule.deleteMany();
  await prisma.kit.deleteMany();
  await prisma.module.deleteMany();
  await prisma.product.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  console.log('👤 Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@immedya.com',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  const partnerUser = await prisma.user.create({
    data: {
      email: 'partner@test.com',
      passwordHash,
      role: UserRole.PARTNER,
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

  // Seed Products
  console.log('📦 Seeding products...');

  const ledWallIndoor = await prisma.product.create({
    data: {
      name: 'LEDWall Indoor P2.5',
      type: ProductType.STANDARD,
      outdoorCompatible: false,
      description: 'High-resolution indoor LED display, perfect for corporate events and retail',
      imageUrl: '/products/ledwall-indoor-p25.jpg',
    },
  });

  const ledWallOutdoor = await prisma.product.create({
    data: {
      name: 'LEDWall Outdoor P5',
      type: ProductType.STANDARD,
      outdoorCompatible: true,
      description: 'Weather-resistant outdoor LED display for advertising and public events',
      imageUrl: '/products/ledwall-outdoor-p5.jpg',
    },
  });

  const ledWallCustom = await prisma.product.create({
    data: {
      name: 'LEDWall Custom P3',
      type: ProductType.CUSTOM,
      outdoorCompatible: true,
      description: 'Customizable LED wall for unique installations',
      imageUrl: '/products/ledwall-custom-p3.jpg',
    },
  });

  console.log(`✅ Created products: ${[ledWallIndoor, ledWallOutdoor, ledWallCustom].map((p) => p.name).join(', ')}`);

  // Seed Modules
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
      unitPriceCents: 45000, // €450
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
      unitPriceCents: 85000, // €850
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
      unitPriceCents: 120000, // €1200
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
      unitPriceCents: 65000, // €650
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
      unitPriceCents: 95000, // €950
    },
  });

  console.log(`✅ Created ${[moduleIndoor1, moduleIndoor2, moduleOutdoor1, moduleOutdoor2, moduleCustom1].length} modules`);

  // Seed Kits
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
      totalPriceCents: 540000, // €5400 (12 modules)
      modules: {
        create: [
          {
            moduleId: moduleIndoor1.id,
            quantity: 12, // 6x2 = 3000x2000mm
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
      totalPriceCents: 1020000, // €10200 (24 modules)
      modules: {
        create: [
          {
            moduleId: moduleIndoor2.id,
            quantity: 24, // 4x6 = 4000x3000mm
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
      totalPriceCents: 1800000, // €18000 (15 modules)
      modules: {
        create: [
          {
            moduleId: moduleOutdoor1.id,
            quantity: 15, // 5x3 = 5000x3000mm
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
      totalPriceCents: 720000, // €7200 (6 modules)
      modules: {
        create: [
          {
            moduleId: moduleOutdoor1.id,
            quantity: 6, // 3x2 = 3000x2000mm
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
