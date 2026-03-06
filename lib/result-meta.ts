import { EnneagramType } from "@/data/questions";

export interface ResultMeta {
  adaptiveMode: boolean;
  answeredQuestionCount: number;
  questionPoolSize: number;
  scoreScale: number;
  topType: EnneagramType;
  runnerUpType: EnneagramType;
  normalizedGap: number;
  usedTieBreaker: boolean;
  tieBreakerPair?: [EnneagramType, EnneagramType];
  tieBreakerVotes?: {
    first: number;
    second: number;
    winner: EnneagramType;
  };
}
