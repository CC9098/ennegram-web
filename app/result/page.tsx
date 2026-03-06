"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EdenLogo } from "@/components/EdenLogo";
import { results } from "@/data/results";
import { EnneagramType } from "@/data/questions";
import { LeafTopRight, LeafBottomLeft, SmallLeaf } from "@/components/LeafDecor";
import { ResultMeta } from "@/lib/result-meta";
import { TYPE_ORDER, TypeScoreRecord } from "@/lib/scoring";

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

function parseJsonParam<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  const candidates = [value];

  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value) candidates.push(decoded);
  } catch {
    return fallback;
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      continue;
    }
  }

  return fallback;
}

function formatScore(score: number) {
  return Number(score.toFixed(1));
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get("type");
  const scoresParam = searchParams.get("scores");
  const metaParam = searchParams.get("meta");

  const type = typeParam ? (Number(typeParam) as EnneagramType) : null;
  const scores = parseJsonParam<TypeScoreRecord>(scoresParam, createEmptyScores());
  const meta = parseJsonParam<ResultMeta | null>(metaParam, null);

  if (!type || !results[type]) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: "#6B7F6B" }}>結果未找到，請重新測驗。</p>
      </div>
    );
  }

  const result = results[type];
  const scoreValues = Object.values(scores);
  const maxScore = scoreValues.length > 0 ? Math.max(...scoreValues, 0) : 0;
  const runnerUpType = meta?.runnerUpType ?? TYPE_ORDER.find((candidate) => candidate !== type) ?? type;
  const explanation = meta?.usedTieBreaker && meta.tieBreakerPair && meta.tieBreakerVotes
    ? `系統先從 ${meta.questionPoolSize} 題題庫中自適應選出 ${meta.answeredQuestionCount} 題主測驗。完成後，${results[meta.tieBreakerPair[0]].name} 與 ${results[meta.tieBreakerPair[1]].name} 校正分數只差 ${formatScore(meta.normalizedGap)} 分，因此再加做 5 題最後比較題。最終 ${results[meta.tieBreakerVotes.winner].name} 以 ${meta.tieBreakerVotes.first}:${meta.tieBreakerVotes.second} 勝出。`
    : meta?.adaptiveMode
      ? `系統從 ${meta.questionPoolSize} 題題庫中自適應選出 ${meta.answeredQuestionCount} 題完成主測驗，再把各型分數拉平到 ${meta.scoreScale} 分制。${results[type].name} 目前比第二接近的 ${results[runnerUpType].name} 高出 ${formatScore(meta.normalizedGap)} 分。`
      : `各型分數已按出題數拉平到 ${meta?.scoreScale ?? 15} 分制。${results[type].name} 目前比第二接近的 ${results[runnerUpType].name} 高出 ${formatScore(meta?.normalizedGap ?? 0)} 分。`;

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FDFCF8 0%, #F0F5EE 100%)" }}
    >
      <LeafTopRight className="top-0 right-0 opacity-60" />
      <LeafBottomLeft className="bottom-0 left-0 opacity-50" />

      <div className="relative z-10 max-w-sm mx-auto px-5 py-12">
        <div className="mb-6 flex justify-center">
          <EdenLogo />
        </div>

        <div className="text-center mb-8">
          <p className="text-xs mb-3 tracking-widest uppercase" style={{ color: "#A0B0A0" }}>
            你的九型人格
          </p>

          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{
                background: `${result.color}20`,
                border: `2px solid ${result.color}50`,
                color: result.color,
              }}
            >
              {type}
            </div>
          </div>

          <h1 className="text-2xl font-semibold mb-1" style={{ color: "#2D3B2D" }}>
            {result.name}
          </h1>
          <p className="text-sm" style={{ color: result.color }}>
            {result.tagline}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px w-16" style={{ background: "rgba(122,158,122,0.2)" }} />
          <SmallLeaf className="w-3 h-3 opacity-40" />
          <div className="h-px w-16" style={{ background: "rgba(122,158,122,0.2)" }} />
        </div>

        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "white",
            border: "1.5px solid rgba(122,158,122,0.15)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}
        >
          <p className="text-sm leading-7" style={{ color: "#4A5E4A" }}>
            {result.description}
          </p>
        </div>

        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: `${result.color}12`,
            border: `1.5px solid ${result.color}22`,
          }}
        >
          <p className="text-xs font-medium mb-2 tracking-[0.16em]" style={{ color: result.color }}>
            判定說明
          </p>
          <p className="text-sm leading-7" style={{ color: "#4A5E4A" }}>
            {explanation}
          </p>
        </div>

        <div
          className="rounded-2xl p-5 mb-8"
          style={{
            background: "white",
            border: "1.5px solid rgba(122,158,122,0.15)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-xs font-medium" style={{ color: "#A0B0A0", letterSpacing: "0.08em" }}>
              各型校正得分
            </p>
            <p className="text-[11px]" style={{ color: "#B0B8B0" }}>
              {meta?.adaptiveMode
                ? `${meta.answeredQuestionCount} / ${meta.questionPoolSize} 題 · ${meta.scoreScale} 分制`
                : `已拉平至 ${meta?.scoreScale ?? 15} 分制`}
            </p>
          </div>

          <div className="space-y-2">
            {TYPE_ORDER.map((currentType) => {
              const score = scores[currentType] ?? 0;
              const isTop = currentType === type;
              const barWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;

              return (
                <div key={currentType} className="flex items-center gap-2">
                  <span
                    className="text-xs w-14 flex-shrink-0 font-medium"
                    style={{ color: isTop ? result.color : "#A0B0A0" }}
                  >
                    {results[currentType]?.name ?? `${currentType}型`}
                  </span>
                  <div
                    className="flex-1 rounded-full h-2 overflow-hidden"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barWidth}%`,
                        background: isTop
                          ? `linear-gradient(90deg, ${result.color}, ${result.color}88)`
                          : "rgba(122,158,122,0.3)",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs w-9 text-right flex-shrink-0"
                    style={{ color: isTop ? result.color : "#C0C8C0" }}
                  >
                    {formatScore(score)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-95"
          style={{
            background: "transparent",
            color: "#7A9E7A",
            border: "1.5px solid rgba(122,158,122,0.4)",
            letterSpacing: "0.05em",
          }}
        >
          重新測驗
        </button>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: "#7A9E7A" }}>載入中⋯</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
