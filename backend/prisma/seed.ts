import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL?.startsWith('file:')) {
    throw new Error('Demo seeding is restricted to local SQLite development.');
  }

  await prisma.student.deleteMany();
  await prisma.campusCaptain.deleteMany();

  const captains = await Promise.all([
    prisma.campusCaptain.create({
      data: {
        captainName: 'Campus Captain 01',
        college: 'ABC Engineering College',
        code: 'CAMPUS-ABC01',
        target: 20,
        isDemo: true,
      },
    }),
    prisma.campusCaptain.create({
      data: {
        captainName: 'Campus Captain 02',
        college: 'NIT Coimbatore',
        code: 'CAMPUS-NIT02',
        target: 25,
        isDemo: true,
      },
    }),
    prisma.campusCaptain.create({
      data: {
        captainName: 'Campus Captain 03',
        college: 'VIT Chennai',
        code: 'CAMPUS-VIT03',
        target: 30,
        isDemo: true,
      },
    }),
  ]);

  const demoStudents = [
    {
      name: 'Akshitha D.',
      email: 'akshitha.demo@example.com',
      phone: '9876543210',
      college: 'ABC Engineering College',
      branch: 'CSE / IT',
      graduationYear: 2026,
      referralCode: 'AI60-7K4P2',
      recommendedProject: 'AI Resume Analyzer',
      buildabilityScore: 90,
      source: 'campus_captain',
      quizAnswers: JSON.stringify({
        branch: 'CSE / IT',
        interest: 'Generative AI',
        skillLevel: 'Comfortable with programming',
        motivation: 'Placement preparation',
        timeCommitment: '3–5 hours/week',
      }),
      campusCaptainId: captains[0].id,
      isDemo: true,
    },
    {
      name: 'Rohit K.',
      email: 'rohit.demo@example.com',
      phone: '9123456780',
      college: 'NIT Coimbatore',
      branch: 'ECE',
      graduationYear: 2026,
      referralCode: 'AI60-BM2Q8',
      recommendedProject: 'Plant Disease Detection',
      buildabilityScore: 84,
      source: 'referral',
      quizAnswers: JSON.stringify({
        branch: 'ECE',
        interest: 'Computer Vision',
        skillLevel: 'Intermediate',
        motivation: 'Resume / portfolio',
        timeCommitment: '5+ hours/week',
      }),
      campusCaptainId: captains[1].id,
      isDemo: true,
    },
    {
      name: 'Sneha M.',
      email: 'sneha.demo@example.com',
      phone: '9001122334',
      college: 'VIT Chennai',
      branch: 'EEE',
      graduationYear: 2027,
      referralCode: 'AI60-LA9C4',
      recommendedProject: 'AI Expense Categorizer',
      buildabilityScore: 81,
      source: 'whatsapp',
      quizAnswers: JSON.stringify({
        branch: 'EEE',
        interest: 'AI Automation',
        skillLevel: 'Beginner',
        motivation: 'Learn AI',
        timeCommitment: '1–2 hours/week',
      }),
      campusCaptainId: captains[2].id,
      isDemo: true,
    },
    {
      name: 'Vivek P.',
      email: 'vivek.demo@example.com',
      phone: '9988776655',
      college: 'ABC Engineering College',
      branch: 'Mechanical',
      graduationYear: 2026,
      referralCode: 'AI60-TR1V6',
      recommendedProject: 'Student Performance Predictor',
      buildabilityScore: 78,
      source: 'instagram',
      quizAnswers: JSON.stringify({
        branch: 'Mechanical',
        interest: 'Data & Analytics',
        skillLevel: 'Comfortable with programming',
        motivation: 'Final-year project',
        timeCommitment: '3–5 hours/week',
      }),
      isDemo: true,
    },
    {
      name: 'Ananya R.',
      email: 'ananya.demo@example.com',
      phone: '9876123401',
      college: 'NIT Coimbatore',
      branch: 'CSE / IT',
      graduationYear: 2025,
      referralCode: 'AI60-QR8M3',
      recommendedProject: 'AI Interview Practice Assistant',
      buildabilityScore: 88,
      source: 'linkedin',
      quizAnswers: JSON.stringify({
        branch: 'CSE / IT',
        interest: 'Generative AI',
        skillLevel: 'Intermediate',
        motivation: 'Hackathon / competition',
        timeCommitment: '5+ hours/week',
      }),
      isDemo: true,
    },
  ];

  await prisma.student.createMany({
    data: demoStudents,
  });

  const referralStudent = await prisma.student.findUnique({
    where: { email: 'akshitha.demo@example.com' },
  });

  if (referralStudent) {
    const referred = await prisma.student.findUnique({
      where: { email: 'rohit.demo@example.com' },
    });

    if (referred) {
      await prisma.student.update({
        where: { id: referred.id },
        data: {
          referredById: referralStudent.id,
          referralCodeUsed: referralStudent.referralCode,
        },
      });
    }
  }

  console.log('Demo data inserted successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
