import { EnneagramType, Question } from "@/data/questions";

export type Answers = Record<number, "a" | "b">;
export type TypeScoreRecord = Record<EnneagramType, number>;

export const TYPE_ORDER: EnneagramType[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const CLOSE_CALL_THRESHOLD = 1;

export interface ScoreAnalysis {
  rawScores: TypeScoreRecord;
  normalizedScores: TypeScoreRecord;
  questionCounts: TypeScoreRecord;
  rankedTypes: EnneagramType[];
  topType: EnneagramType;
  runnerUpType: EnneagramType;
  normalizedGap: number;
  scoreScale: number;
  requiresTieBreaker: boolean;
}

function createEmptyScores(): TypeScoreRecord {
  return {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };
}

export function calculateScores(
  questions: Question[],
  answers: Answers
): TypeScoreRecord {
  const scores = createEmptyScores();

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer === "a") scores[question.a.type]++;
    else if (answer === "b") scores[question.b.type]++;
  }

  return scores;
}

export function calculateQuestionCounts(questions: Question[]): TypeScoreRecord {
  const counts = createEmptyScores();

  for (const question of questions) {
    counts[question.a.type]++;
    counts[question.b.type]++;
  }

  return counts;
}

export function normalizeScores(
  scores: TypeScoreRecord,
  questionCounts: TypeScoreRecord
): { normalizedScores: TypeScoreRecord; scoreScale: number } {
  const scoreScale = Math.max(...Object.values(questionCounts));
  const normalizedScores = createEmptyScores();

  for (const type of TYPE_ORDER) {
    const totalQuestions = questionCounts[type];
    normalizedScores[type] = totalQuestions > 0
      ? Number(((scores[type] / totalQuestions) * scoreScale).toFixed(2))
      : 0;
  }

  return { normalizedScores, scoreScale };
}

export function rankTypes(scores: TypeScoreRecord): EnneagramType[] {
  return [...TYPE_ORDER].sort((left, right) => {
    const scoreDiff = scores[right] - scores[left];
    return scoreDiff !== 0 ? scoreDiff : left - right;
  });
}

export function analyzeScores(
  questions: Question[],
  answers: Answers
): ScoreAnalysis {
  const rawScores = calculateScores(questions, answers);
  const questionCounts = calculateQuestionCounts(questions);
  const { normalizedScores, scoreScale } = normalizeScores(rawScores, questionCounts);
  const rankedTypes = rankTypes(normalizedScores);
  const [topType, runnerUpType] = rankedTypes;
  const normalizedGap = Number((normalizedScores[topType] - normalizedScores[runnerUpType]).toFixed(2));

  return {
    rawScores,
    normalizedScores,
    questionCounts,
    rankedTypes,
    topType,
    runnerUpType,
    normalizedGap,
    scoreScale,
    requiresTieBreaker: normalizedGap <= CLOSE_CALL_THRESHOLD,
  };
}
