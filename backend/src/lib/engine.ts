import { z } from 'zod';

export const quizAnswerSchema = z.object({
  branch: z.string().min(1, 'Please select your engineering branch.'),
  interest: z.string().min(1, 'Please select an area of AI you are interested in.'),
  skillLevel: z.string().min(1, 'Please tell us your technical level.'),
  motivation: z.string().min(1, 'Please tell us why you want to build an AI project.'),
  timeCommitment: z.string().min(1, 'Please select how much time you can spend.'),
});

export type QuizAnswers = z.infer<typeof quizAnswerSchema>;

export type ProjectProfile = {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  compatibleBranches: string[];
  requiredSkillLevel: 'Beginner' | 'Comfortable with programming' | 'Intermediate';
  estimatedDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedBuildTime: string;
  technologies: string[];
  placementRelevance: number;
  portfolioValue: number;
  beginnerFriendliness: number;
  projectRoadmap: string[];
  firstMilestone: string;
};

export const projectCatalog: ProjectProfile[] = [
  {
    id: 'ai-resume-analyzer',
    title: 'AI Resume Analyzer',
    shortDescription: 'Analyze resumes and suggest skill gaps using NLP and AI scoring.',
    category: 'Generative AI',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Other'],
    requiredSkillLevel: 'Comfortable with programming',
    estimatedDifficulty: 'Intermediate',
    estimatedBuildTime: '2–3 weeks',
    technologies: ['Python', 'NLP', 'GenAI'],
    placementRelevance: 95,
    portfolioValue: 95,
    beginnerFriendliness: 78,
    projectRoadmap: ['Setup', 'Build basic version', 'Add AI capability', 'Test', 'Deploy'],
    firstMilestone: 'Create a resume parser and score keyword match quality.',
  },
  {
    id: 'smart-attendance-analyzer',
    title: 'Smart Attendance Analyzer',
    shortDescription: 'Track attendance patterns and predict at-risk students using simple analytics.',
    category: 'AI Automation',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Mechanical', 'Other'],
    requiredSkillLevel: 'Beginner',
    estimatedDifficulty: 'Beginner',
    estimatedBuildTime: '1–2 weeks',
    technologies: ['Python', 'Pandas', 'ML'],
    placementRelevance: 76,
    portfolioValue: 80,
    beginnerFriendliness: 90,
    projectRoadmap: ['Setup', 'Prepare data', 'Train model', 'Visualize insights', 'Deploy'],
    firstMilestone: 'Clean attendance data and build a simple predictive dashboard.',
  },
  {
    id: 'ai-study-assistant',
    title: 'AI Study Assistant',
    shortDescription: 'Organize notes, summarize chapters, and turn revision topics into quick study prompts.',
    category: 'Generative AI',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Civil', 'Other'],
    requiredSkillLevel: 'Comfortable with programming',
    estimatedDifficulty: 'Beginner',
    estimatedBuildTime: '1–2 weeks',
    technologies: ['Python', 'NLP', 'Streamlit'],
    placementRelevance: 72,
    portfolioValue: 85,
    beginnerFriendliness: 88,
    projectRoadmap: ['Setup', 'Build notes workflow', 'Add summarization', 'Generate prompts', 'Deploy'],
    firstMilestone: 'Turn one study topic into a working summary and Q&A flow.',
  },
  {
    id: 'resume-skill-gap-detector',
    title: 'Resume Skill Gap Detector',
    shortDescription: 'Compare a resume with a target role and flag missing skills.',
    category: 'Data & Analytics',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Other'],
    requiredSkillLevel: 'Comfortable with programming',
    estimatedDifficulty: 'Intermediate',
    estimatedBuildTime: '2–3 weeks',
    technologies: ['Python', 'NLP', 'Pandas'],
    placementRelevance: 90,
    portfolioValue: 92,
    beginnerFriendliness: 70,
    projectRoadmap: ['Setup', 'Parse resume data', 'Match against skill map', 'Score gaps', 'Deploy'],
    firstMilestone: 'Create a role-skill mapping and compare it with a sample resume.',
  },
  {
    id: 'plant-disease-detection',
    title: 'Plant Disease Detection',
    shortDescription: 'Classify plant leaf images and surface disease risks from uploaded photos.',
    category: 'Computer Vision',
    compatibleBranches: ['ECE', 'EEE', 'Mechanical', 'Civil', 'Other'],
    requiredSkillLevel: 'Intermediate',
    estimatedDifficulty: 'Intermediate',
    estimatedBuildTime: '2–4 weeks',
    technologies: ['Python', 'OpenCV', 'TensorFlow'],
    placementRelevance: 74,
    portfolioValue: 90,
    beginnerFriendliness: 62,
    projectRoadmap: ['Setup', 'Collect images', 'Train model', 'Validate accuracy', 'Deploy'],
    firstMilestone: 'Build a basic image classifier on a small dataset.',
  },
  {
    id: 'ai-expense-categorizer',
    title: 'AI Expense Categorizer',
    shortDescription: 'Sort expenses into categories using intent and pattern recognition.',
    category: 'AI Automation',
    compatibleBranches: ['CSE / IT', 'EEE', 'Mechanical', 'Other'],
    requiredSkillLevel: 'Beginner',
    estimatedDifficulty: 'Beginner',
    estimatedBuildTime: '1–2 weeks',
    technologies: ['Python', 'Pandas', 'ML'],
    placementRelevance: 68,
    portfolioValue: 75,
    beginnerFriendliness: 92,
    projectRoadmap: ['Setup', 'Prepare sample data', 'Build rules model', 'Test categories', 'Deploy'],
    firstMilestone: 'Create a simple classifier that groups sample expenses correctly.',
  },
  {
    id: 'student-performance-predictor',
    title: 'Student Performance Predictor',
    shortDescription: 'Predict student outcomes from assessment trends and attendance signals.',
    category: 'Data & Analytics',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'],
    requiredSkillLevel: 'Comfortable with programming',
    estimatedDifficulty: 'Intermediate',
    estimatedBuildTime: '2–3 weeks',
    technologies: ['Python', 'Pandas', 'Scikit-learn'],
    placementRelevance: 82,
    portfolioValue: 88,
    beginnerFriendliness: 78,
    projectRoadmap: ['Setup', 'Prepare dataset', 'Train a model', 'Validate results', 'Deploy'],
    firstMilestone: 'Engineer a simple scoring model from sample student records.',
  },
  {
    id: 'ai-interview-practice-assistant',
    title: 'AI Interview Practice Assistant',
    shortDescription: 'Ask mock interview questions and provide instant feedback based on answers.',
    category: 'Generative AI',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Other'],
    requiredSkillLevel: 'Comfortable with programming',
    estimatedDifficulty: 'Intermediate',
    estimatedBuildTime: '2–3 weeks',
    technologies: ['Python', 'NLP', 'GenAI'],
    placementRelevance: 96,
    portfolioValue: 97,
    beginnerFriendliness: 74,
    projectRoadmap: ['Setup', 'Create question pool', 'Add answer evaluation', 'Build feedback', 'Deploy'],
    firstMilestone: 'Generate a few mock interview questions and score basic responses.',
  },
  {
    id: 'college-faq-chatbot',
    title: 'College FAQ Chatbot',
    shortDescription: 'Answer admission and campus questions using a structured knowledge base.',
    category: 'AI + Web/Mobile',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Civil', 'Other'],
    requiredSkillLevel: 'Beginner',
    estimatedDifficulty: 'Beginner',
    estimatedBuildTime: '1–2 weeks',
    technologies: ['Python', 'RAG', 'Web App'],
    placementRelevance: 70,
    portfolioValue: 84,
    beginnerFriendliness: 93,
    projectRoadmap: ['Setup', 'Collect FAQs', 'Build a retrieval layer', 'Add chatbot logic', 'Deploy'],
    firstMilestone: 'Create a working FAQ search and answer flow for a few common questions.',
  },
  {
    id: 'smart-waste-classification',
    title: 'Smart Waste Classification',
    shortDescription: 'Recognize recyclable waste categories from images and support eco-initiatives.',
    category: 'Computer Vision',
    compatibleBranches: ['ECE', 'EEE', 'Mechanical', 'Civil', 'Other'],
    requiredSkillLevel: 'Comfortable with programming',
    estimatedDifficulty: 'Intermediate',
    estimatedBuildTime: '2–3 weeks',
    technologies: ['Python', 'OpenCV', 'TensorFlow'],
    placementRelevance: 71,
    portfolioValue: 85,
    beginnerFriendliness: 70,
    projectRoadmap: ['Setup', 'Collect waste images', 'Train classifier', 'Improve precision', 'Deploy'],
    firstMilestone: 'Classify a few waste categories from a small image set.',
  },
  {
    id: 'ai-document-summarizer',
    title: 'AI Document Summarizer',
    shortDescription: 'Summarize notes, PDFs, and semester documents into concise insights.',
    category: 'Generative AI',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Civil', 'Other'],
    requiredSkillLevel: 'Beginner',
    estimatedDifficulty: 'Beginner',
    estimatedBuildTime: '1–2 weeks',
    technologies: ['Python', 'NLP', 'GenAI'],
    placementRelevance: 74,
    portfolioValue: 81,
    beginnerFriendliness: 90,
    projectRoadmap: ['Setup', 'Load sample documents', 'Summarize content', 'Add UI', 'Deploy'],
    firstMilestone: 'Build a text summarizer that condenses a long lecture note into bullets.',
  },
  {
    id: 'placement-preparation-assistant',
    title: 'Placement Preparation Assistant',
    shortDescription: 'Set up revision plans, mock interviews, and topic tracking for placements.',
    category: 'AI Automation',
    compatibleBranches: ['CSE / IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'],
    requiredSkillLevel: 'Beginner',
    estimatedDifficulty: 'Beginner',
    estimatedBuildTime: '1–2 weeks',
    technologies: ['Python', 'Web App', 'NLP'],
    placementRelevance: 98,
    portfolioValue: 90,
    beginnerFriendliness: 94,
    projectRoadmap: ['Setup', 'Track weaker topics', 'Add mock questions', 'Build revision flow', 'Deploy'],
    firstMilestone: 'Organize a 7-day prep plan around one placement track.',
  },
];

const skillOrder = ['Beginner', 'Comfortable with programming', 'Intermediate'];

const interestMap: Record<string, string[]> = {
  'Generative AI': ['Generative AI', 'AI + Web/Mobile'],
  'Computer Vision': ['Computer Vision'],
  'Data & Analytics': ['Data & Analytics'],
  'AI Automation': ['AI Automation'],
  'AI + Web/Mobile': ['AI + Web/Mobile', 'Generative AI'],
};

const timeMap: Record<string, number> = {
  '1–2 hours/week': 1,
  '3–5 hours/week': 2,
  '5+ hours/week': 3,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function validateQuizAnswers(input: unknown) {
  return quizAnswerSchema.safeParse(input);
}

export function calculateBuildabilityScore(answers: QuizAnswers): number {
  let score = 42;

  const branchBonus = ['CSE / IT', 'ECE', 'EEE', 'Other'].includes(answers.branch) ? 12 : 8;
  const interestBonus = ['Generative AI', 'AI Automation', 'Data & Analytics'].includes(answers.interest) ? 12 : 10;
  const skillBonus = answers.skillLevel === 'Beginner' ? 18 : answers.skillLevel === 'Comfortable with programming' ? 14 : 10;
  const timeBonus = answers.timeCommitment === '1–2 hours/week' ? 8 : answers.timeCommitment === '3–5 hours/week' ? 12 : 14;
  const goalBonus = ['Placement preparation', 'Final-year project', 'Resume / portfolio'].includes(answers.motivation) ? 14 : 11;

  score += branchBonus + interestBonus + skillBonus + timeBonus + goalBonus;
  return clamp(Math.round(score), 0, 100);
}

export function generateRecommendation(answers: QuizAnswers) {
  const valid = validateQuizAnswers(answers);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || 'Invalid quiz answers.');
  }

  const normalized = valid.data;

  const scoredProjects = projectCatalog.map((project) => {
    let score = 0;

    if (project.compatibleBranches.includes(normalized.branch)) score += 35;

    const interestMatch = interestMap[normalized.interest] ?? [normalized.interest];
    if (interestMatch.some((tag) => project.category.includes(tag))) score += 30;
    if (project.category.includes(normalized.interest)) score += 12;

    const skillIndex = skillOrder.indexOf(normalized.skillLevel);
    const requiredIndex = skillOrder.indexOf(project.requiredSkillLevel);
    if (requiredIndex <= skillIndex + 1) score += 20;

    if (project.placementRelevance > 85 && normalized.motivation === 'Placement preparation') score += 15;
    if (project.portfolioValue > 85 && normalized.motivation === 'Resume / portfolio') score += 15;
    if (project.placementRelevance > 80 && normalized.motivation === 'Final-year project') score += 10;
    if (project.beginnerFriendliness > 85 && normalized.motivation === 'Learn AI') score += 15;

    const timeWeight = timeMap[normalized.timeCommitment] ?? 1;
    const estimatedTimeWeight = project.estimatedBuildTime.includes('1–2 weeks') ? 1 : project.estimatedBuildTime.includes('2–3 weeks') ? 2 : 3;
    if (Math.abs(timeWeight - estimatedTimeWeight) <= 1) score += 10;
    if (project.beginnerFriendliness >= 85 && normalized.skillLevel === 'Beginner') score += 8;

    score += Math.min(15, Math.round(project.portfolioValue / 10));
    return { project, score };
  });

  const sorted = scoredProjects.sort((a, b) => b.score - a.score || a.project.title.localeCompare(b.project.title));
  const winner = sorted[0];
  const buildabilityScore = calculateBuildabilityScore(normalized);

  const reasonMap = [
    `Matches your interest in ${normalized.interest}`,
    `Suitable for ${normalized.skillLevel.toLowerCase()} skill level`,
    `Aligned with ${normalized.motivation.toLowerCase()}`,
    `Works well with ${normalized.timeCommitment} availability`,
  ];

  return {
    project: winner.project,
    score: winner.score,
    buildabilityScore,
    reasons: reasonMap,
  };
}

export const referralPattern = /^[A-Z0-9-]+$/;

export function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomPart = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `AI60-${randomPart}`;
}

export const recommendedProjectLabel = 'AI Project Match';

export function getMilestoneUnlocks(referralCount: number) {
  const milestones = [
    { threshold: 2, label: 'Unlock 3 additional AI project ideas' },
    { threshold: 5, label: 'Unlock the AI Project Starter Pack' },
    { threshold: 10, label: 'Campus Growth Champion' },
  ];

  return milestones.filter((item) => referralCount >= item.threshold);
}
