import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { generateRecommendation, validateQuizAnswers, generateReferralCode, projectCatalog } from './lib/engine.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 4040);
const clientUrl = process.env.CLIENT_URL?.replace(/\/+$/, '') || 'http://localhost:5173';
const adminPassword = process.env.ADMIN_PASSWORD || 'demo-admin-pass';

if (isProduction) {
  if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD must be set in production.');
  if (!process.env.CLIENT_URL) throw new Error('CLIENT_URL must be set in production.');
  if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || '')) {
    throw new Error('DATABASE_URL must point to PostgreSQL in production.');
  }
}

const allowedOrigins = new Set([
  ...(process.env.CLIENT_URL ? [new URL(clientUrl).origin] : []),
  ...(!isProduction ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : []),
]);

const prisma = new PrismaClient();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

function logFailure(context: string, error: unknown) {
  if (isProduction) {
    console.error(context);
  } else {
    console.error(context, error);
  }
}

const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().min(8, 'Enter a valid phone number.'),
  college: z.string().trim().min(2, 'College name is required.'),
  branch: z.string().trim().min(2, 'Branch is required.'),
  graduationYear: z.coerce.number().int().min(2023).max(2035, 'Graduation year looks invalid.'),
  recommendedProject: z.string().optional().default(''),
  buildabilityScore: z.coerce.number().int().min(0).max(100).optional(),
  quizAnswers: z.any().optional(),
  referralCodeUsed: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
});

const dashboardQuerySchema = z.object({
  code: z.string().optional(),
  email: z.string().email().optional(),
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API running', timestamp: new Date().toISOString() });
});

app.get('/api/projects', (_req, res) => {
  res.json({ projects: projectCatalog });
});

app.post('/api/recommend', (req, res) => {
  try {
    const parsed = validateQuizAnswers(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Could not generate a recommendation.' });
    }

    const recommendation = generateRecommendation(parsed.data);
    res.json(recommendation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create project recommendation.';
    res.status(400).json({ error: message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const payload = registrationSchema.parse(req.body);

    const existing = await prisma.student.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({
        error: 'An account already exists for this email. Please use a different email or continue with your existing profile.',
      });
    }

    let referredById: string | null = null;
    let referralCodeUsed = payload.referralCodeUsed ?? null;

    if (referralCodeUsed) {
      const referrer = await prisma.student.findUnique({
        where: { referralCode: referralCodeUsed.trim().toUpperCase() },
      });

      if (!referrer) {
        return res.status(400).json({ error: 'This referral code is invalid or no longer active.' });
      }

      if (referrer.email.toLowerCase() === payload.email.toLowerCase()) {
        return res.status(400).json({ error: 'Self-referrals are not allowed.' });
      }

      referredById = referrer.id;
    }

    const referralCode = generateReferralCode();

    const student = await prisma.student.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        phone: payload.phone,
        college: payload.college,
        branch: payload.branch,
        graduationYear: payload.graduationYear,
        referralCode,
        recommendedProject: payload.recommendedProject || null,
        buildabilityScore: payload.buildabilityScore ?? null,
        quizAnswers: payload.quizAnswers ? JSON.stringify(payload.quizAnswers) : null,
        referralCodeUsed: referralCodeUsed || null,
        referredById,
        source: payload.source ?? 'organic',
        utmSource: payload.utmSource ?? null,
        utmMedium: payload.utmMedium ?? null,
        utmCampaign: payload.utmCampaign ?? null,
      },
    });

    res.status(201).json({
      success: true,
      student,
      referralCode,
      referralLink: `${clientUrl}?ref=${referralCode}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || 'Form validation failed.' });
    }

    logFailure('Registration failed', error);
    res.status(500).json({ error: 'Could not complete registration. Please try again.' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const parsed = dashboardQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid dashboard request.' });
    }

    const { code, email } = parsed.data;
    const student = await prisma.student.findFirst({
      where: code ? { referralCode: code.trim().toUpperCase() } : { email: email?.toLowerCase() },
      include: {
        referredBy: true,
        referrals: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'No student record found.' });
    }

    const referralCount = await prisma.student.count({
      where: { referredById: student.id },
    });

    res.json({
      student: {
        ...student,
        referralCount,
        referralLink: `${clientUrl}?ref=${student.referralCode}`,
      },
    });
  } catch (error) {
    logFailure('Dashboard error', error);
    res.status(500).json({ error: 'Unable to load dashboard.' });
  }
});

app.get('/api/leaderboard', async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: isProduction ? { isDemo: false } : {},
      select: { id: true, name: true, college: true, referralCode: true },
      orderBy: { createdAt: 'asc' },
    });

    const sorted = await Promise.all(
      students.map(async (student) => {
        const referrals = await prisma.student.count({
          where: { referredById: student.id, ...(isProduction ? { isDemo: false } : {}) },
        });
        return { ...student, referrals };
      }),
    );

    const ranked = sorted.sort((a, b) => b.referrals - a.referrals || a.name.localeCompare(b.name));
    res.json({ leaderboard: ranked.map((item, index) => ({ ...item, rank: index + 1 })) });
  } catch (error) {
    logFailure('Leaderboard error', error);
    res.status(500).json({ error: 'Unable to load leaderboard.' });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const password = String(req.headers['x-admin-password'] || '');
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Admin password required.' });
    }

    const realStudentFilter = isProduction ? { isDemo: false } : {};
    const [totalRegistrations, registrationsToday, referralRegistrations, organicRegistrations, topProjects, topColleges, topReferrers] = await Promise.all([
      prisma.student.count({ where: realStudentFilter }),
      prisma.student.count({ where: { ...realStudentFilter, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.student.count({ where: { ...realStudentFilter, referralCodeUsed: { not: null } } }),
      prisma.student.count({ where: { ...realStudentFilter, source: 'organic' } }),
      prisma.student.groupBy({ by: ['recommendedProject'], where: realStudentFilter, _count: { recommendedProject: true }, orderBy: { _count: { recommendedProject: 'desc' } }, take: 5 }),
      prisma.student.groupBy({ by: ['college'], where: realStudentFilter, _count: { college: true }, orderBy: { _count: { college: 'desc' } }, take: 5 }),
      prisma.student.findMany({ where: realStudentFilter, select: { id: true, name: true, college: true, referralCode: true }, take: 5 }),
    ]);

    const topReferralStudents = await Promise.all(
      topReferrers.map(async (student) => {
        const referrals = await prisma.student.count({
          where: { referredById: student.id, ...realStudentFilter },
        });
        return { ...student, referrals };
      }),
    );

    const topProjectsFormatted = topProjects
      .filter((item) => item.recommendedProject !== null)
      .map((item) => ({
        project: item.recommendedProject,
        count: Number(item._count.recommendedProject),
      }));

    const topCollegesFormatted = topColleges.map((item) => ({
      college: item.college,
      count: Number(item._count.college),
    }));

    const referralConversionRate = totalRegistrations > 0 ? Number(((referralRegistrations / totalRegistrations) * 100).toFixed(2)) : 0;

    const trendStudents = await prisma.student.findMany({
      where: realStudentFilter,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const trendCounts = new Map<string, number>();
    for (const student of trendStudents) {
      const day = student.createdAt.toISOString().slice(0, 10);
      trendCounts.set(day, (trendCounts.get(day) || 0) + 1);
    }
    const registrationTrend = Array.from(trendCounts, ([day, count]) => ({ day, count }));

    const projectPopularity = topProjectsFormatted;
    const collegeDistribution = topCollegesFormatted;

    res.json({
      totalRegistrations,
      registrationsToday,
      referralRegistrations,
      organicRegistrations,
      topProjects: topProjectsFormatted,
      topColleges: topCollegesFormatted,
      topReferralStudents,
      referralConversionRate,
      registrationTrend,
      projectPopularity,
      collegeDistribution,
      campusCaptains: await prisma.campusCaptain.findMany({
        where: isProduction ? { isDemo: false } : {},
        orderBy: { createdAt: 'asc' },
      }),
    });
  } catch (error) {
    logFailure('Analytics failed', error);
    res.status(500).json({ error: 'Could not load admin analytics.' });
  }
});

app.get('/api/admin/campus-captains', async (req, res) => {
  try {
    const password = String(req.headers['x-admin-password'] || '');
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Admin password required.' });
    }

    const captains = await prisma.campusCaptain.findMany({
      orderBy: { createdAt: 'asc' },
    });

    res.json({ captains });
  } catch (error) {
    logFailure('Campus captains fetch failed', error);
    res.status(500).json({ error: 'Unable to fetch campus captains.' });
  }
});

app.post('/api/admin/campus-captains', async (req, res) => {
  try {
    const password = String(req.headers['x-admin-password'] || '');
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Admin password required.' });
    }

    const schema = z.object({
      captainName: z.string().min(2),
      college: z.string().min(2),
      code: z.string().min(4).toUpperCase(),
      target: z.coerce.number().int().min(1),
    });

    const payload = schema.parse(req.body);
    const captain = await prisma.campusCaptain.create({
      data: {
        captainName: payload.captainName,
        college: payload.college,
        code: payload.code,
        target: payload.target,
        isDemo: false,
      },
    });

    res.status(201).json({ captain });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || 'Invalid campus captain data.' });
    }

    logFailure('Campus captain create failed', error);
    res.status(500).json({ error: 'Unable to create campus captain.' });
  }
});

app.delete('/api/admin/demo-data', async (req, res) => {
  try {
    const password = String(req.headers['x-admin-password'] || '');
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Admin password required.' });
    }

    await prisma.student.deleteMany({ where: { isDemo: true } });
    await prisma.campusCaptain.deleteMany({ where: { isDemo: true } });

    res.json({ success: true, message: 'Demo data removed successfully.' });
  } catch (error) {
    logFailure('Demo cleanup failed', error);
    res.status(500).json({ error: 'Unable to remove demo data.' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`AI Project Match API listening on port ${port}`);
});
