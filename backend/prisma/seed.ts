import { PrismaClient, Role, BarberStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data in correct order (respecting foreign keys)
  await prisma.queueEntryService.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.salonSettings.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ─── Owner ──────────────────────────────────────────────
  const owner = await prisma.user.create({
    data: {
      name: 'Admin Owner',
      email: 'owner@salon.com',
      phone: '+1234567890',
      password: hashedPassword,
      role: Role.OWNER,
    },
  });

  // ─── Receptionist ───────────────────────────────────────
  const receptionist = await prisma.user.create({
    data: {
      name: 'Sarah Reception',
      email: 'reception@salon.com',
      phone: '+1234567891',
      password: hashedPassword,
      role: Role.RECEPTIONIST,
    },
  });

  // ─── Barber Users ───────────────────────────────────────
  const barberData = [
    { name: 'James Miller', email: 'james@salon.com', phone: '+1234567892', spec: 'Classic Cuts' },
    { name: 'David Wilson', email: 'david@salon.com', phone: '+1234567893', spec: 'Modern Styles' },
    { name: 'Michael Brown', email: 'michael@salon.com', phone: '+1234567894', spec: 'Beard Specialist' },
  ];

  const barberUsers = await Promise.all(
    barberData.map((b) =>
      prisma.user.create({
        data: {
          name: b.name,
          email: b.email,
          phone: b.phone,
          password: hashedPassword,
          role: Role.BARBER,
        },
      })
    )
  );

  // ─── Barber Profiles ───────────────────────────────────
  const barbers = await Promise.all(
    barberUsers.map((user, index) =>
      prisma.barber.create({
        data: {
          userId: user.id,
          name: user.name,
          specialization: barberData[index].spec,
          status: BarberStatus.AVAILABLE,
          sortOrder: index,
          isActive: true,
        },
      })
    )
  );

  // ─── Sample Customers ──────────────────────────────────
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567895',
        password: hashedPassword,
        role: Role.CUSTOMER,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567896',
        password: hashedPassword,
        role: Role.CUSTOMER,
      },
    }),
  ]);

  // ─── Services ──────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Haircut',
        description: 'Classic haircut with styling',
        durationMinutes: 30,
        price: 25.0,
        category: 'Hair',
        sortOrder: 0,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Beard Trim',
        description: 'Professional beard shaping and trim',
        durationMinutes: 15,
        price: 15.0,
        category: 'Beard',
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hair + Beard Combo',
        description: 'Full haircut and beard trim package',
        durationMinutes: 45,
        price: 35.0,
        category: 'Combo',
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hair Coloring',
        description: 'Professional hair coloring service',
        durationMinutes: 60,
        price: 50.0,
        category: 'Hair',
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Head Massage',
        description: 'Relaxing head and scalp massage',
        durationMinutes: 20,
        price: 20.0,
        category: 'Wellness',
        sortOrder: 4,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hot Towel Shave',
        description: 'Traditional hot towel straight razor shave',
        durationMinutes: 30,
        price: 30.0,
        category: 'Beard',
        sortOrder: 5,
      },
    }),
  ]);

  // ─── Salon Settings ────────────────────────────────────
  await prisma.salonSettings.create({
    data: {
      salonName: 'Elite Cuts Salon',
      isQueueOpen: true,
      openTime: '09:00',
      closeTime: '21:00',
      maxQueueSize: 50,
      timezone: 'Asia/Kolkata',
    },
  });

  // ─── Summary ───────────────────────────────────────────
  console.log('✅ Seed data created successfully!\n');
  console.log('  📋 Accounts (password: password123):');
  console.log(`     Owner:        ${owner.email}`);
  console.log(`     Receptionist: ${receptionist.email}`);
  barberUsers.forEach((b) => console.log(`     Barber:       ${b.email}`));
  customers.forEach((c) => console.log(`     Customer:     ${c.email}`));
  console.log(`\n  💇 ${services.length} Services created`);
  console.log(`  💈 ${barbers.length} Barber profiles created`);
  console.log(`  ⚙️  Salon settings initialized\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
