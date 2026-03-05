import { EnneagramType, Question } from "@/data/questions";

export type Answers = Record<number, "a" | "b">;

export function calculateScores(
  questions: Question[],
  answers: Answers
): Record<EnneagramType, number> {
  const scores: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  };

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer === "a") scores[question.a.type]++;
    else if (answer === "b") scores[question.b.type]++;
  }

  return scores as Record<EnneagramType, number>;
}

export function getTopType(scores: Record<EnneagramType, number>): EnneagramType {
  let topType: EnneagramType = 1;
  let topScore = -1;
  for (const [type, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topType = Number(type) as EnneagramType;
    }
  }
  return topType;
}
