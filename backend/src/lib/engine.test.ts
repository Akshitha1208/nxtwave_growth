import { describe, expect, it } from 'vitest';
import { calculateBuildabilityScore, generateRecommendation, generateReferralCode, getMilestoneUnlocks, validateQuizAnswers } from './engine';

describe('engine', () => {
  it('validates required quiz answers', () => {
    const result = validateQuizAnswers({
      branch: 'CSE / IT',
      interest: 'Generative AI',
      skillLevel: 'Comfortable with programming',
      motivation: 'Final-year project',
      timeCommitment: '3–5 hours/week',
    });

    expect(result.success).toBe(true);
  });

  it('recommends a project for matching inputs', () => {
    const result = generateRecommendation({
      branch: 'CSE / IT',
      interest: 'Generative AI',
      skillLevel: 'Comfortable with programming',
      motivation: 'Final-year project',
      timeCommitment: '3–5 hours/week',
    });

    expect(result.project.title).toBeTruthy();
    expect(result.buildabilityScore).toBeGreaterThan(0);
  });

  it('computes buildability score from user answer mix', () => {
    const score = calculateBuildabilityScore({
      branch: 'CSE / IT',
      interest: 'Generative AI',
      skillLevel: 'Comfortable with programming',
      motivation: 'Final-year project',
      timeCommitment: '3–5 hours/week',
    });

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('generates valid referral codes and milestone unlocks', () => {
    const code = generateReferralCode();
    expect(code.startsWith('AI60-')).toBe(true);
    expect(code.length).toBeGreaterThanOrEqual(10);

    const unlocked = getMilestoneUnlocks(5);
    expect(unlocked.length).toBeGreaterThan(0);
  });
});
