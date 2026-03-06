import { EnneagramType, Question } from "@/data/questions";
import { ScoreAnalysis, TYPE_ORDER } from "@/lib/scoring";

export const INITIAL_QUESTION_COUNT = 18;
export const MIN_ADAPTIVE_QUESTION_COUNT = 24;
export const MAX_ADAPTIVE_QUESTION_COUNT = 36;
export const ADAPTIVE_BATCH_SIZE = 6;
export const CONFIDENT_GAP_THRESHOLD = 2;

type TypeCountRecord = Record<EnneagramType, number>;

function createEmptyCounts(): TypeCountRecord {
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

export function selectInitialQuestionIds(
  questionPool: Question[],
  targetCount: number = INITIAL_QUESTION_COUNT
): number[] {
  const selectedIds: number[] = [];
  const typeCounts = createEmptyCounts();
  const remainingQuestions = [...questionPool];

  while (selectedIds.length < targetCount && remainingQuestions.length > 0) {
    remainingQuestions.sort((left, right) => {
      const leftScore = (12 / (typeCounts[left.a.type] + 1)) + (12 / (typeCounts[left.b.type] + 1));
      const rightScore = (12 / (typeCounts[right.a.type] + 1)) + (12 / (typeCounts[right.b.type] + 1));
      return rightScore !== leftScore ? rightScore - leftScore : left.id - right.id;
    });

    const nextQuestion = remainingQuestions.shift();
    if (!nextQuestion) break;

    selectedIds.push(nextQuestion.id);
    typeCounts[nextQuestion.a.type]++;
    typeCounts[nextQuestion.b.type]++;
  }

  return selectedIds;
}

export function selectAdaptiveQuestionIds(
  questionPool: Question[],
  selectedIds: number[],
  analysis: ScoreAnalysis,
  batchSize: number = ADAPTIVE_BATCH_SIZE
): number[] {
  const selectedIdSet = new Set(selectedIds);
  const rankIndex = new Map(analysis.rankedTypes.map((type, index) => [type, index]));
  const topCandidates = new Set(analysis.rankedTypes.slice(0, 4));
  const [topType, runnerUpType] = analysis.rankedTypes;

  return questionPool
    .filter((question) => !selectedIdSet.has(question.id))
    .sort((left, right) => scoreAdaptiveQuestion(right) - scoreAdaptiveQuestion(left) || left.id - right.id)
    .slice(0, batchSize)
    .map((question) => question.id);

  function scoreAdaptiveQuestion(question: Question) {
    const involvedTypes = [question.a.type, question.b.type];
    const [leftType, rightType] = involvedTypes;
    let score = 0;

    for (const type of involvedTypes) {
      const index = rankIndex.get(type) ?? TYPE_ORDER.length;
      score += Math.max(0, 10 - index * 2);
      score += Math.max(0, 4 - analysis.questionCounts[type]);
    }

    if (involvedTypes.includes(topType)) score += 14;
    if (involvedTypes.includes(runnerUpType)) score += 12;

    if (involvedTypes.includes(topType) && involvedTypes.includes(runnerUpType)) {
      score += 36;
    }

    if (topCandidates.has(leftType) && topCandidates.has(rightType)) {
      score += 10;
    }

    return score;
  }
}

export function shouldContinueAdaptive(
  analysis: ScoreAnalysis,
  answeredCount: number,
  currentSelectedCount: number,
  questionPoolSize: number
) {
  if (answeredCount < MIN_ADAPTIVE_QUESTION_COUNT) return true;

  const reachedPoolLimit = currentSelectedCount >= questionPoolSize;
  const reachedAdaptiveCap = currentSelectedCount >= Math.min(MAX_ADAPTIVE_QUESTION_COUNT, questionPoolSize);

  if (reachedPoolLimit || reachedAdaptiveCap) return false;

  return analysis.normalizedGap < CONFIDENT_GAP_THRESHOLD;
}
