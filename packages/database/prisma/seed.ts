import { PrismaClient, UserRole, AccountStatus, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Create Demo School ───────────────────────────────────────────────────
  const school = await prisma.school.upsert({
    where: { code: 'DEMO-SCHOOL' },
    update: {},
    create: {
      name: 'Demo Academy',
      code: 'DEMO-SCHOOL',
      address: '123 Education Lane, Knowledge City, KN 000001',
      phone: '+919876543210',
      email: 'admin@demoacademy.edu',
      website: 'https://demoacademy.edu',
      isActive: true,
    },
  });
  console.log(`✅ School created: ${school.name} (${school.id})`);

  // ─── Create Super Admin ───────────────────────────────────────────────────
  const superAdminHash = await bcrypt.hash('SuperAdmin@123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ailms.dev' },
    update: {},
    create: {
      email: 'superadmin@ailms.dev',
      passwordHash: superAdminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      gender: Gender.MALE,
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // ─── Create Principal ─────────────────────────────────────────────────────
  const principalHash = await bcrypt.hash('Principal@123', 12);
  const principal = await prisma.user.upsert({
    where: { email: 'principal@demoacademy.edu' },
    update: {},
    create: {
      email: 'principal@demoacademy.edu',
      passwordHash: principalHash,
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      role: UserRole.PRINCIPAL,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      gender: Gender.FEMALE,
      schoolId: school.id,
    },
  });
  console.log(`✅ Principal created: ${principal.email}`);

  // ─── Create Demo Teacher ──────────────────────────────────────────────────
  const teacherHash = await bcrypt.hash('Teacher@123', 12);
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@demoacademy.edu' },
    update: {},
    create: {
      email: 'teacher@demoacademy.edu',
      passwordHash: teacherHash,
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.SUBJECT_TEACHER,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      gender: Gender.MALE,
      schoolId: school.id,
    },
  });

  // ─── Create Academic Year ─────────────────────────────────────────────────
  const academicYear = await prisma.academicYear.upsert({
    where: { schoolId_name: { schoolId: school.id, name: '2025-2026' } },
    update: {},
    create: {
      schoolId: school.id,
      name: '2025-2026',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-04-30'),
      isCurrent: true,
    },
  });
  console.log(`✅ Academic Year: ${academicYear.name}`);

  // ─── Create Department ────────────────────────────────────────────────────
  const department = await prisma.department.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'CS' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Computer Science',
      code: 'CS',
    },
  });

  // ─── Create Teacher Record ────────────────────────────────────────────────
  await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      employeeId: 'EMP-001',
      departmentId: department.id,
      qualification: 'M.Tech Computer Science',
      experience: 8,
      joinDate: new Date('2018-07-01'),
    },
  });
  console.log(`✅ Teacher created: ${teacherUser.email}`);

  // ─── Create Demo Class ────────────────────────────────────────────────────
  const demoClass = await prisma.class.upsert({
    where: { schoolId_grade_section: { schoolId: school.id, grade: 11, section: 'A' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Grade 11 - A',
      grade: 11,
      section: 'A',
      capacity: 35,
    },
  });
  console.log(`✅ Class created: ${demoClass.name}`);

  // ─── Create Demo Student ──────────────────────────────────────────────────
  const studentHash = await bcrypt.hash('Student@123', 12);
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@demoacademy.edu' },
    update: {},
    create: {
      email: 'student@demoacademy.edu',
      passwordHash: studentHash,
      firstName: 'Alice',
      lastName: 'Wonderland',
      role: UserRole.STUDENT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      gender: Gender.FEMALE,
      schoolId: school.id,
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      rollNumber: 'S-2025-001',
      admissionDate: new Date('2025-06-01'),
    },
  });
  console.log(`✅ Student created: ${studentUser.email}`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Super Admin:  superadmin@ailms.dev / SuperAdmin@123');
  console.log('   Principal:    principal@demoacademy.edu / Principal@123');
  console.log('   Teacher:      teacher@demoacademy.edu / Teacher@123');
  console.log('   Student:      student@demoacademy.edu / Student@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
