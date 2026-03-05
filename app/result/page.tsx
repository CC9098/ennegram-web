"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { results } from "@/data/results";
import { EnneagramType } from "@/data/questions";
import { LeafTopRight, LeafBottomLeft, SmallLeaf } from "@/components/LeafDecor";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get("type");
  const scoresParam = searchParams.get("scores");

  const type = typeParam ? (Number(typeParam) as EnneagramType) : null;
  const scores: Record<string, number> = scoresParam
    ? JSON.parse(decodeURIComponent(scoresParam))
    : {};

  if (!type || !results[type]) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: "#6B7F6B" }}>結果未找到，請重新測驗。</p>
      </div>
    );
  }

  const result = results[type];
  const maxScore = Math.max(...Object.values(scores));

  const typeOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FDFCF8 0%, #F0F5EE 100%)" }}
    >
      <LeafTopRight className="top-0 right-0 opacity-60" />
      <LeafBottomLeft className="bottom-0 left-0 opacity-50" />

      <div className="relative z-10 max-w-sm mx-auto px-5 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs mb-3 tracking-widest uppercase" style={{ color: "#A0B0A0" }}>
            你的九型人格
          </p>

          {/* Type badge */}
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

        {/* Divider */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px w-16" style={{ background: "rgba(122,158,122,0.2)" }} />
          <SmallLeaf className="w-3 h-3 opacity-40" />
          <div className="h-px w-16" style={{ background: "rgba(122,158,122,0.2)" }} />
        </div>

        {/* Description */}
        <div
          className="rounded-2xl p-5 mb-6"
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

        {/* Scores bar chart */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{
            background: "white",
            border: "1.5px solid rgba(122,158,122,0.15)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}
        >
          <p className="text-xs font-medium mb-4" style={{ color: "#A0B0A0", letterSpacing: "0.08em" }}>
            各型得分
          </p>
          <div className="space-y-2">
            {typeOrder.map((t) => {
              const score = scores[t] ?? 0;
              const isTop = t === type;
              const barWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;
              return (
                <div key={t} className="flex items-center gap-2">
                  <span
                    className="text-xs w-14 flex-shrink-0 font-medium"
                    style={{ color: isTop ? result.color : "#A0B0A0" }}
                  >
                    {results[t]?.name ?? `${t}型`}
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
                    className="text-xs w-5 text-right flex-shrink-0"
                    style={{ color: isTop ? result.color : "#C0C8C0" }}
                  >
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retake button */}
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
