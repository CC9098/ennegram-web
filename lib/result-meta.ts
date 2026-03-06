import { EnneagramType } from "@/data/questions";

export interface ResultMeta {
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
