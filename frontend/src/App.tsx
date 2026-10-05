import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Copy,
  GraduationCap,
  Link2,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

type QuizAnswers = {
  branch: string;
  interest: string;
  skillLevel: string;
  motivation: string;
  timeCommitment: string;
};

type RecommendationResult = {
  project: {
    id: string;
    title: string;
    shortDescription: string;
    category: string;
    compatibleBranches: string[];
    requiredSkillLevel: string;
    estimatedDifficulty: string;
    estimatedBuildTime: string;
    technologies: string[];
    placementRelevance: number;
    portfolioValue: number;
    beginnerFriendliness: number;
    projectRoadmap: string[];
    firstMilestone: string;
  };
  buildabilityScore: number;
  reasons: string[];
  score: number;
};

type RegistrationForm = {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  graduationYear: string;
};

type StudentRecord = {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  referralCode: string;
  recommendedProject: string | null;
  buildabilityScore: number | null;
  referralCount?: number;
  referralLink?: string;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  college: string;
  referralCode: string;
  referrals: number;
  rank: number;
};

type AnalyticsPayload = {
  totalRegistrations: number;
  registrationsToday: number;
  referralRegistrations: number;
  organicRegistrations: number;
  referralConversionRate: number;
  topProjects: Array<{ project: string | null; count: number }>;
  topColleges: Array<{ college: string; count: number }>;
  topReferralStudents: Array<{ id: string; name: string; college: string; referrals: number }>; 
  registrationTrend: Array<{ day: string; count: number }>;
  projectPopularity: Array<{ project: string | null; count: number }>;
  collegeDistribution: Array<{ college: string; count: number }>;
  campusCaptains: Array<{ id: string; captainName: string; college: string; code: string; target: number }>;
};

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4040').replace(/\/+$/, '');
const defaultQuiz: QuizAnswers = {
  branch: '',
  interest: '',
  skillLevel: '',
  motivation: '',
  timeCommitment: '',
};

const questionConfig = [
  {
    key: 'branch',
    title: 'What is your engineering branch?',
    options: ['CSE / IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'],
  },
  {
    key: 'interest',
    title: 'What type of AI interests you most?',
    options: ['Generative AI', 'Computer Vision', 'Data & Analytics', 'AI Automation', 'AI + Web/Mobile'],
  },
  {
    key: 'skillLevel',
    title: 'What is your current technical level?',
    options: ['Beginner', 'Comfortable with programming', 'Intermediate'],
  },
  {
    key: 'motivation',
    title: 'Why do you want to build an AI project?',
    options: ['Placement preparation', 'Final-year project', 'Resume / portfolio', 'Learn AI', 'Hackathon / competition'],
  },
  {
    key: 'timeCommitment',
    title: 'How much time can you realistically spend?',
    options: ['1–2 hours/week', '3–5 hours/week', '5+ hours/week'],
  },
] as const;

function readLocalStorage<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function captureReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const referralCode = params.get('ref');
  if (referralCode) {
    const normalized = referralCode.trim().toUpperCase();
    window.localStorage.setItem('aiProjectMatchRefCode', JSON.stringify(normalized));
  }
}

function getDashboardLink(code: string) {
  return `${window.location.origin}?ref=${code}`;
}

type FetchOptions = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
};

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Something went wrong.');
  }

  return payload as T;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    captureReferralFromUrl();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-semibold text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-lg shadow-slate-200">
              AI
            </div>
            <div>
              <div className="text-lg font-black">AI PROJECT MATCH</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link to="/quiz" className="transition hover:text-slate-900">Quiz</Link>
            <Link to="/leaderboard" className="transition hover:text-slate-900">Leaderboard</Link>
            <Link to="/admin" className="transition hover:text-slate-900">Admin</Link>
          </nav>

          <Link to="/quiz" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700">
            Find My Project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const steps = [
    'Tell us about yourself',
    'Get your AI project match',
    'See how buildable it is',
    'Join the workshop',
    'Start building',
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:py-16">
        <div>
          <div className="mb-4 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Final-year engineering growth challenge
          </div>
          <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Which AI project should YOU build?
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Answer 5 quick questions and get a personalized AI project idea you can start building.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/quiz')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-slate-700"
            >
              Find My AI Project
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-500">Free • 60 seconds • No technical expertise required</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="rounded-[1.5rem] bg-slate-900 p-5 text-white">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>AI Match Preview</span>
              <span className="rounded-full bg-sky-500/20 px-2 py-1 text-xs font-medium text-sky-200">Top fit</span>
            </div>
            <div className="mt-6">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300">Recommended project</div>
              <div className="mt-3 text-3xl font-black">AI Resume Analyzer</div>
              <div className="mt-3 text-sm text-slate-300">
                Great if you want a placement-ready project with strong portfolio value.
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 p-3">
              <div>
                <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Buildability</div>
                <div className="mt-1 text-2xl font-bold text-sky-300">86/100</div>
              </div>
              <Target className="h-10 w-10 text-sky-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{index + 1}</div>
            <p className="text-sm font-medium text-slate-700">{step}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
            <BrainCircuit className="h-4 w-4" />
            Workshop CTA
          </div>
          <h2 className="text-2xl font-black text-slate-900">Want to turn your idea into a real project?</h2>
          <p className="mt-3 text-slate-600">Join Build Your First AI Project in 60 Minutes.</p>
          <button
            onClick={() => navigate('/register')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
          >
            Build It in 60 Minutes
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <GraduationCap className="h-5 w-5 text-sky-600" />
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Built for final-year students</span>
          </div>
          <p className="text-slate-600">
            This recommendation tool is designed for final-year engineering students who want a credible AI project with strong placement and portfolio value.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xl font-bold text-slate-900">Placement-ready</div>
              <p className="mt-1 text-sm text-slate-600">Projects aligned with CV and interview needs.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xl font-bold text-slate-900">Buildable fast</div>
              <p className="mt-1 text-sm text-slate-600">Structured to match your time and skill level.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuizPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<QuizAnswers>(defaultQuiz);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questionConfig[currentIndex];
  const progress = ((currentIndex + 1) / questionConfig.length) * 100;

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: option }));
    setError('');
  };

  const validateCurrentAnswer = () => {
    const selectedValue = answers[currentQuestion.key];
    if (!selectedValue) {
      setError('Please choose an answer before continuing.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentAnswer()) return;
    if (currentIndex < questionConfig.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const payload = { ...answers };
    setLoading(true);
    apiFetch<RecommendationResult>('/api/recommend', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      .then((data) => {
        writeLocalStorage('aiProjectMatchRecommendation', data);
        writeLocalStorage('aiProjectMatchAnswers', payload);
        navigate('/result');
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to generate the recommendation.');
      })
      .finally(() => setLoading(false));
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setError('');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Question {currentIndex + 1} of {questionConfig.length}</div>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{currentQuestion.title}</h2>
          </div>
          <div className="hidden rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 sm:block">{Math.round(progress)}%</div>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {currentQuestion.options.map((option) => {
            const selected = answers[currentQuestion.key] === option;
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`rounded-2xl border p-5 text-left text-base font-medium transition ${
                  selected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-soft'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {error ? <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              <span className="font-medium">Generating your personalized project match...</span>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
            >
              {currentIndex === questionConfig.length - 1 ? 'See My Match' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<RecommendationResult | null>(null);

  useEffect(() => {
    const stored = readLocalStorage<RecommendationResult>('aiProjectMatchRecommendation');
    if (!stored) {
      navigate('/quiz');
      return;
    }
    setResult(stored);
  }, [navigate]);

  if (!result) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
              <Sparkles className="h-4 w-4" />
              Your AI Project Match 🎯
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">{result.project.title}</h1>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Buildability Score</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{result.buildabilityScore}/100</div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Difficulty</div>
            <div className="mt-2 text-xl font-bold text-slate-900">{result.project.estimatedDifficulty}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Estimated time</div>
            <div className="mt-2 text-xl font-bold text-slate-900">{result.project.estimatedBuildTime}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Technologies</div>
            <div className="mt-2 text-xl font-bold text-slate-900">{result.project.technologies.join(' • ')}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Why this fits you</h3>
            <div className="mt-5 space-y-3">
              {result.reasons.map((reason) => (
                <div key={reason} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700">{reason}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-black text-slate-900">What you'll build</h3>
              <p className="mt-3 max-w-2xl text-slate-600">{result.project.shortDescription}</p>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-black text-slate-900">Your first milestone</h3>
              <p className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-slate-700">{result.project.firstMilestone}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-xl font-black text-slate-900">Your project roadmap</h3>
            <div className="mt-5 space-y-4">
              {result.project.projectRoadmap.map((step, index) => (
                <div key={step} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{index + 1}</div>
                  <div className="pt-1 text-slate-700">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            I Want to Build This
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Try Another Match
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegistrationForm>({
    name: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    graduationYear: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const storedResult = readLocalStorage<RecommendationResult>('aiProjectMatchRecommendation');

  useEffect(() => {
    if (!storedResult) {
      navigate('/quiz');
    }
  }, [storedResult, navigate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.phone || !form.college || !form.branch || !form.graduationYear) {
      setError('Please complete all required fields before registering.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (form.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setSubmitting(true);

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') ?? 'organic';
    const utmMedium = params.get('utm_medium') ?? '';
    const utmCampaign = params.get('utm_campaign') ?? '';
    const referralCodeUsed = readLocalStorage<string>('aiProjectMatchRefCode') ?? null;

    try {
      const payload = {
        ...form,
        graduationYear: Number(form.graduationYear),
        recommendedProject: storedResult?.project.title ?? '',
        buildabilityScore: storedResult?.buildabilityScore ?? 0,
        quizAnswers: readLocalStorage<QuizAnswers>('aiProjectMatchAnswers'),
        referralCodeUsed,
        source: utmSource,
        utmSource,
        utmMedium,
        utmCampaign,
      };

      const response = await apiFetch<{ success: boolean; referralCode: string; referralLink: string; student: StudentRecord }>(
        '/api/register',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      writeLocalStorage('aiProjectMatchUser', response.student);
      writeLocalStorage('aiProjectMatchRefCode', response.referralCode);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
            <Rocket className="h-4 w-4" />
            Workshop registration
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Register for the workshop</h1>
          <p className="mt-2 text-slate-600">Secure your seat and unlock your referral code.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-900" placeholder="Your full name" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-900" placeholder="you@gmail.com" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Phone number</span>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-900" placeholder="9876543210" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">College</span>
            <input name="college" value={form.college} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-900" placeholder="Your college name" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Branch</span>
            <select name="branch" value={form.branch} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-900">
              <option value="">Select branch</option>
              <option value="CSE / IT">CSE / IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Graduation year</span>
            <input name="graduationYear" type="number" min="2023" max="2035" value={form.graduationYear} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-900" placeholder="2026" />
          </label>

          {error ? <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-70"
            >
              {submitting ? 'Registering...' : 'Complete Registration'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ student: StudentRecord & { referralCount: number; referralLink: string } } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedUser = readLocalStorage<StudentRecord>('aiProjectMatchUser');
    if (!storedUser) {
      navigate('/register');
      return;
    }

    const code = storedUser.referralCode || readLocalStorage<string>('aiProjectMatchRefCode') || '';
    if (!code) {
      setError('No referral code available yet.');
      return;
    }

    apiFetch<{ student: StudentRecord & { referralCount: number; referralLink: string } }>(`/api/dashboard?code=${encodeURIComponent(code)}`)
      .then((payload) => setData(payload))
      .catch((err) => setError(err.message));
  }, [navigate]);

  if (!data && !error) return null;

  const referralCount = data?.student.referralCount ?? 0;
  const unlocked = referralCount >= 2; 
  const progress = Math.min((referralCount / 2) * 100, 100);
  const milestones = [
    { threshold: 2, label: 'Unlock 3 additional AI project ideas' },
    { threshold: 5, label: 'Unlock the AI Project Starter Pack' },
    { threshold: 10, label: 'Campus Growth Champion' },
  ];

  const copyLink = async () => {
    const link = data?.student.referralLink || getDashboardLink(data?.student.referralCode ?? '');
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareWhatsApp = () => {
    const link = data?.student.referralLink || getDashboardLink(data?.student.referralCode ?? '');
    const share = `https://wa.me/?text=${encodeURIComponent(`I found my AI project match. Try it here: ${link}`)}`;
    window.open(share, '_blank');
  };

  const shareLinkedIn = () => {
    const link = data?.student.referralLink || getDashboardLink(data?.student.referralCode ?? '');
    const share = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
    window.open(share, '_blank');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            You are registered 🎉
          </div>

          <h1 className="mt-4 text-3xl font-black text-slate-900">Your referral dashboard</h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Your Project</div>
              <div className="mt-2 text-lg font-bold text-slate-900">{data?.student.recommendedProject ?? 'AI Project Match'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Buildability Score</div>
              <div className="mt-2 text-lg font-bold text-slate-900">{data?.student.buildabilityScore ?? 0}/100</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Registration status</div>
              <div className="mt-2 text-lg font-bold text-emerald-600">Confirmed</div>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-slate-500">Your referral code</div>
              <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <div className="mt-4 text-2xl font-black tracking-wide text-slate-900">{data?.student.referralCode}</div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <Link2 className="h-4 w-4 text-slate-500" />
              <span className="break-all">{data?.student.referralLink || ''}</span>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>Referral progress</span>
                <span>{referralCount} / 2</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 text-sm text-slate-500">Invite 2 friends to unlock more project resources.</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={copyLink} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Copy Referral Link</button>
              <button onClick={shareWhatsApp} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Share on WhatsApp</button>
              <button onClick={shareLinkedIn} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Share on LinkedIn</button>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
          <div className="flex items-center gap-2 text-slate-900">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-black">Milestone rewards</h2>
          </div>

          <div className="mt-5 space-y-3">
            {milestones.map((item) => {
              const isUnlocked = referralCount >= item.threshold;
              return (
                <div key={item.threshold} className={`rounded-2xl border p-4 ${isUnlocked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{item.threshold} referrals</div>
                      <div className="mt-1 text-base font-bold text-slate-900">{item.label}</div>
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isUnlocked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-slate-300">
              <Zap className="h-4 w-4" />
              Status
            </div>
            <div className="mt-3 text-xl font-black">{unlocked ? 'You have unlocked the next AI resource pack.' : 'Keep sharing to unlock more resources.'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserCode = readLocalStorage<string>('aiProjectMatchRefCode');

  useEffect(() => {
    apiFetch<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then((payload) => setLeaderboard(payload.leaderboard))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, []);

  const selfRank = leaderboard.findIndex((item) => item.referralCode === currentUserCode?.replace(/['"]/g, '')) + 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-violet-700">
              <Trophy className="h-4 w-4" />
              AI60 Campus Leaderboard
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-900">Top referrers</h1>
          </div>
          {selfRank > 0 ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
              Your rank: #{selfRank}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">No registrations yet. Be the first to start the campaign.</div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3 text-right">Referrals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                {leaderboard.map((row) => (
                  <tr key={row.id} className={row.referralCode === currentUserCode ? 'bg-violet-50' : ''}>
                    <td className="px-4 py-4 font-bold">#{row.rank}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{row.name}</div>
                    </td>
                    <td className="px-4 py-4">{row.college}</td>
                    <td className="px-4 py-4 text-right font-bold">{row.referrals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPage() {
  const [password, setPassword] = useState(sessionStorage.getItem('adminPassword') ?? '');
  const [authenticated, setAuthenticated] = useState(Boolean(password));
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState('');
  const [captainForm, setCaptainForm] = useState({ captainName: '', college: '', code: '', target: '20' });

  const fetchAnalytics = async (adminKey: string) => {
    try {
      const payload = await apiFetch<AnalyticsPayload>('/api/admin/analytics', {
        method: 'GET',
        headers: {
          'x-admin-password': adminKey,
        },
      });
      setAnalytics(payload);
      setAuthenticated(true);
      sessionStorage.setItem('adminPassword', adminKey);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load analytics.');
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    if (password) {
      fetchAnalytics(password);
    }
  }, [password]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!password.trim()) {
      setError('Admin password is required.');
      return;
    }
    await fetchAnalytics(password);
  };

  const handleCreateCampusCaptain = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiFetch('/api/admin/campus-captains', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: JSON.stringify({
          captainName: captainForm.captainName,
          college: captainForm.college,
          code: captainForm.code.toUpperCase(),
          target: Number(captainForm.target),
        }),
      });
      setCaptainForm({ captainName: '', college: '', code: '', target: '20' });
      await fetchAnalytics(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create campus captain.');
    }
  };

  const handleResetDemoData = async () => {
    try {
      await apiFetch('/api/admin/demo-data', {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      });
      await fetchAnalytics(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset demo data.');
    }
  };

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
            <BarChart3 className="h-4 w-4" />
            Admin access
          </div>
          <h1 className="text-3xl font-black text-slate-900">Campaign analytics</h1>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Admin password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-900" placeholder="Enter password" />
            </label>
            {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Open dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
            <BarChart3 className="h-4 w-4" />
            Admin analytics
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Campaign performance</h1>
        </div>
        <button onClick={handleResetDemoData} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Reset demo data</button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total registrations" value={analytics.totalRegistrations} />
        <MetricCard label="Registrations today" value={analytics.registrationsToday} />
        <MetricCard label="Referral registrations" value={analytics.referralRegistrations} />
        <MetricCard label="Organic registrations" value={analytics.organicRegistrations} />
        <MetricCard label="Referral conversion rate" value={`${analytics.referralConversionRate}%`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black text-slate-900">Project popularity</h2>
          <div className="mt-5 space-y-4">
            {analytics.projectPopularity.map((item) => (
              <div key={item.project ?? item.count}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>{item.project ?? 'Unknown project'}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min((item.count / Math.max(...analytics.projectPopularity.map((entry) => entry.count), 1)) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black text-slate-900">College distribution</h2>
          <div className="mt-5 space-y-4">
            {analytics.collegeDistribution.map((item) => (
              <div key={item.college}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>{item.college}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min((item.count / Math.max(...analytics.collegeDistribution.map((entry) => entry.count), 1)) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black text-slate-900">Registration trend by day</h2>
          <div className="mt-5 flex h-52 items-end gap-3">
            {analytics.registrationTrend.map((point) => (
              <div key={point.day} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div className="w-full rounded-t-xl bg-slate-900" style={{ height: `${Math.max((point.count / Math.max(...analytics.registrationTrend.map((entry) => entry.count), 1)) * 100, 18)}%` }} />
                <span className="text-[10px] text-slate-500">{new Date(point.day).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black text-slate-900">Top referral students</h2>
          <div className="mt-5 space-y-3">
            {analytics.topReferralStudents.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div>
                  <div className="font-semibold text-slate-900">#{index + 1} {student.name}</div>
                  <div className="text-sm text-slate-500">{student.college}</div>
                </div>
                <div className="text-lg font-black text-slate-900">{student.referrals}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black text-slate-900">Campus referral codes</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {analytics.campusCaptains.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">No campus captains registered yet.</div>
            ) : (
              analytics.campusCaptains.map((captain) => (
                <div key={captain.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="font-semibold text-slate-900">{captain.captainName}</div>
                    <div className="text-sm text-slate-500">{captain.college}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{captain.code}</div>
                    <div className="text-xs text-slate-500">Target {captain.target}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCreateCampusCaptain} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-lg font-black text-slate-900">Create campus referral code</h3>
            <div className="mt-4 space-y-3">
              <input value={captainForm.captainName} onChange={(e) => setCaptainForm((prev) => ({ ...prev, captainName: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900" placeholder="Campus Captain 01" />
              <input value={captainForm.college} onChange={(e) => setCaptainForm((prev) => ({ ...prev, college: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900" placeholder="ABC Engineering College" />
              <input value={captainForm.code} onChange={(e) => setCaptainForm((prev) => ({ ...prev, code: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 uppercase outline-none focus:border-slate-900" placeholder="CAMPUS-ABC01" />
              <input type="number" min="1" value={captainForm.target} onChange={(e) => setCaptainForm((prev) => ({ ...prev, target: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900" placeholder="20" />
            </div>
            <button className="mt-5 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Create code</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-black text-slate-900">{value}</div>
    </div>
  );
}

export default App;
