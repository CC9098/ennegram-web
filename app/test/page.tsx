"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EdenLogo } from "@/components/EdenLogo";
import { results } from "@/data/results";
import { buildTieBreakerQuestions, TieBreakerQuestion } from "@/data/tiebreakers";
import { EnneagramType, Question, questions } from "@/data/questions";
import {
  ADAPTIVE_BATCH_SIZE,
  selectAdaptiveQuestionIds,
  selectInitialQuestionIds,
  shouldContinueAdaptive,
} from "@/lib/adaptive";
import { ResultMeta } from "@/lib/result-meta";
import {
  analyzeScores,
  Answers,
  ScoreAnalysis,
} from "@/lib/scoring";

const SECTION_SIZE = 6;
const QUESTION_BY_ID = new Map<number, Question>(questions.map((question) => [question.id, question]));

interface TieBreakerState {
  analysis: ScoreAnalysis;
  pair: [EnneagramType, EnneagramType];
  questions: TieBreakerQuestion[];
  answers: Record<string, "a" | "b">;
}

function formatScore(score: number) {
  return Number(score.toFixed(1));
}

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>(
    () => selectInitialQuestionIds(questions)
  );
  const [currentSection, setCurrentSection] = useState(0);
  const [tieBreakerState, setTieBreakerState] = useState<TieBreakerState | null>(null);

  const selectedQuestions = selectedQuestionIds
    .map((id) => QUESTION_BY_ID.get(id))
    .filter((question): question is Question => Boolean(question));

  const totalSections = Math.ceil(selectedQuestions.length / SECTION_SIZE);
  const sectionQuestions = selectedQuestions.slice(
    currentSection * SECTION_SIZE,
    (currentSection + 1) * SECTION_SIZE
  );

  const isTieBreakerActive = tieBreakerState !== null;
  const tieBreakerQuestions = tieBreakerState?.questions ?? [];
  const tieBreakerAnsweredCount = tieBreakerQuestions.filter(
    (question) => tieBreakerState?.answers[question.id] !== undefined
  ).length;
  const tieBreakerComplete =
    isTieBreakerActive && tieBreakerAnsweredCount === tieBreakerQuestions.length;

  const sectionAnsweredCount = sectionQuestions.filter(
    (question) => answers[question.id] !== undefined
  ).length;
  const sectionComplete = sectionAnsweredCount === sectionQuestions.length;
  const totalAnswered = selectedQuestionIds.filter((id) => answers[id] !== undefined).length;
  const progress = isTieBreakerActive
    ? tieBreakerAnsweredCount / tieBreakerQuestions.length
    : totalAnswered / Math.max(selectedQuestions.length, 1);

  function scrollToTop(behavior: ScrollBehavior = "smooth") {
    window.scrollTo({ top: 0, behavior });
  }

  function buildResultMeta(
    analysis: ScoreAnalysis,
    answeredQuestionCount: number,
    overrides: Partial<ResultMeta> = {}
  ): ResultMeta {
    return {
      adaptiveMode: true,
      answeredQuestionCount,
      questionPoolSize: questions.length,
      scoreScale: analysis.scoreScale,
      topType: analysis.topType,
      runnerUpType: analysis.runnerUpType,
      normalizedGap: analysis.normalizedGap,
      usedTieBreaker: false,
      ...overrides,
    };
  }

  function navigateToResult(
    finalType: EnneagramType,
    analysis: ScoreAnalysis,
    answeredQuestionCount: number,
    metaOverrides: Partial<ResultMeta> = {}
  ) {
    const scoresParam = encodeURIComponent(JSON.stringify(analysis.normalizedScores));
    const metaParam = encodeURIComponent(
      JSON.stringify(buildResultMeta(analysis, answeredQuestionCount, metaOverrides))
    );

    router.push(
      `/result?type=${finalType}&scores=${scoresParam}&meta=${metaParam}`
    );
  }

  function handleAnswer(questionId: number, choice: "a" | "b") {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  }

  function handleTieBreakerAnswer(questionId: string, choice: "a" | "b") {
    setTieBreakerState((prev) => (
      prev
        ? {
            ...prev,
            answers: { ...prev.answers, [questionId]: choice },
          }
        : prev
    ));
  }

  function handleNext() {
    if (currentSection < totalSections - 1) {
      setCurrentSection((section) => section + 1);
      window.setTimeout(() => scrollToTop(), 50);
      return;
    }

    const analysis = analyzeScores(selectedQuestions, answers);
    const canContinueAdaptive = shouldContinueAdaptive(
      analysis,
      totalAnswered,
      selectedQuestions.length,
      questions.length
    );

    if (canContinueAdaptive) {
      const nextIds = selectAdaptiveQuestionIds(
        questions,
        selectedQuestionIds,
        analysis,
        ADAPTIVE_BATCH_SIZE
      );

      if (nextIds.length > 0) {
        setSelectedQuestionIds((prev) => [...prev, ...nextIds]);
        setCurrentSection((section) => section + 1);
        window.setTimeout(() => scrollToTop(), 50);
        return;
      }
    }

    if (analysis.requiresTieBreaker) {
      const pair: [EnneagramType, EnneagramType] = [
        analysis.topType,
        analysis.runnerUpType,
      ];

      setTieBreakerState({
        analysis,
        pair,
        questions: buildTieBreakerQuestions(pair[0], pair[1]),
        answers: {},
      });
      window.setTimeout(() => scrollToTop(), 50);
      return;
    }

    navigateToResult(analysis.topType, analysis, selectedQuestions.length);
  }

  function handleTieBreakerSubmit() {
    if (!tieBreakerState) return;

    const [firstType, secondType] = tieBreakerState.pair;
    let firstVotes = 0;
    let secondVotes = 0;

    for (const question of tieBreakerState.questions) {
      const answer = tieBreakerState.answers[question.id];
      if (!answer) continue;

      const selectedType = answer === "a" ? question.a.type : question.b.type;
      if (selectedType === firstType) firstVotes++;
      else if (selectedType === secondType) secondVotes++;
    }

    const finalType = firstVotes === secondVotes
      ? tieBreakerState.analysis.topType
      : firstVotes > secondVotes
        ? firstType
        : secondType;

    navigateToResult(finalType, tieBreakerState.analysis, selectedQuestions.length, {
      usedTieBreaker: true,
      tieBreakerPair: tieBreakerState.pair,
      tieBreakerVotes: {
        first: firstVotes,
        second: secondVotes,
        winner: finalType,
      },
    });
  }

  useEffect(() => {
    scrollToTop("auto");
  }, [currentSection, isTieBreakerActive]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #FDFCF8 0%, #F0F5EE 100%)" }}
    >
      <div
        className="fixed top-0 left-0 right-0 z-50 px-5 pt-4 pb-3"
        style={{ background: "rgba(253,252,248,0.92)", backdropFilter: "blur(12px)" }}
      >
        <div className="mb-3 flex justify-center">
          <EdenLogo size="compact" />
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium" style={{ color: "#7A9E7A" }}>
            {isTieBreakerActive
              ? "最後比較題"
              : `第 ${currentSection + 1} 組 / 共 ${totalSections} 組`}
          </span>
          <span className="text-xs" style={{ color: "#A0B0A0" }}>
            {isTieBreakerActive
              ? `${tieBreakerAnsweredCount} / ${tieBreakerQuestions.length} 題`
              : `已答 ${totalAnswered} 題`}
          </span>
        </div>

        <div className="w-full rounded-full h-1.5" style={{ background: "rgba(122,158,122,0.15)" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #7A9E7A, #A8C5A0)",
            }}
          />
        </div>
      </div>

      <div className="pt-32 pb-8 px-4 max-w-lg mx-auto">
        {isTieBreakerActive && tieBreakerState ? (
          <>
            <div
              className="mb-5 rounded-2xl p-5"
              style={{
                background: "white",
                border: "1.5px solid rgba(122,158,122,0.15)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              }}
            >
              <p className="text-xs mb-3 tracking-[0.18em]" style={{ color: "#A0B0A0" }}>
                CLOSE CALL
              </p>
              <h1 className="text-xl font-semibold mb-3" style={{ color: "#2D3B2D" }}>
                {results[tieBreakerState.pair[0]].name} / {results[tieBreakerState.pair[1]].name}
              </h1>
              <p className="text-sm leading-7 mb-4" style={{ color: "#4A5E4A" }}>
                目前兩個結果只差 {formatScore(tieBreakerState.analysis.normalizedGap)} 分。
                再答 5 題核心比較題，我們會用最後結果幫你分清主型。
              </p>
              <div className="grid grid-cols-2 gap-3">
                {tieBreakerState.pair.map((type) => (
                  <div
                    key={type}
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: "rgba(122,158,122,0.06)",
                      border: "1px solid rgba(122,158,122,0.18)",
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: "#A0B0A0" }}>
                      {results[type].name}
                    </p>
                    <p className="text-lg font-semibold" style={{ color: "#2D3B2D" }}>
                      {formatScore(tieBreakerState.analysis.normalizedScores[type])} / {tieBreakerState.analysis.scoreScale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {tieBreakerQuestions.map((question, index) => {
              const answered = tieBreakerState.answers[question.id];

              return (
                <div
                  key={question.id}
                  className="mb-4 rounded-2xl p-4 transition-all duration-200"
                  style={{
                    background: answered ? "rgba(122,158,122,0.06)" : "white",
                    border: answered
                      ? "1.5px solid rgba(122,158,122,0.25)"
                      : "1.5px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="text-xs mb-3 font-medium" style={{ color: "#A0B0A0" }}>
                    比較題 {index + 1}
                  </div>

                  <p className="text-sm leading-7 mb-4" style={{ color: "#2D3B2D" }}>
                    {question.prompt}
                  </p>

                  <button
                    onClick={() => handleTieBreakerAnswer(question.id, "a")}
                    className="w-full text-left px-4 py-3 rounded-xl mb-2 text-sm leading-relaxed transition-all duration-150 active:scale-98"
                    style={{
                      background:
                        answered === "a"
                          ? "linear-gradient(135deg, #7A9E7A, #5A7E5A)"
                          : "rgba(0,0,0,0.03)",
                      color: answered === "a" ? "white" : "#2D3B2D",
                      border:
                        answered === "a"
                          ? "1.5px solid transparent"
                          : "1.5px solid rgba(0,0,0,0.06)",
                      fontWeight: answered === "a" ? "500" : "400",
                      boxShadow: answered === "a" ? "0 2px 12px rgba(122,158,122,0.3)" : "none",
                    }}
                  >
                    <span
                      className="inline-flex w-5 h-5 rounded-full text-xs font-semibold mr-2 items-center justify-center align-middle"
                      style={{
                        background: answered === "a" ? "rgba(255,255,255,0.25)" : "rgba(122,158,122,0.15)",
                        color: answered === "a" ? "white" : "#7A9E7A",
                      }}
                    >
                      甲
                    </span>
                    {question.a.text}
                  </button>

                  <button
                    onClick={() => handleTieBreakerAnswer(question.id, "b")}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm leading-relaxed transition-all duration-150 active:scale-98"
                    style={{
                      background:
                        answered === "b"
                          ? "linear-gradient(135deg, #7A9E7A, #5A7E5A)"
                          : "rgba(0,0,0,0.03)",
                      color: answered === "b" ? "white" : "#2D3B2D",
                      border:
                        answered === "b"
                          ? "1.5px solid transparent"
                          : "1.5px solid rgba(0,0,0,0.06)",
                      fontWeight: answered === "b" ? "500" : "400",
                      boxShadow: answered === "b" ? "0 2px 12px rgba(122,158,122,0.3)" : "none",
                    }}
                  >
                    <span
                      className="inline-flex w-5 h-5 rounded-full text-xs font-semibold mr-2 items-center justify-center align-middle"
                      style={{
                        background: answered === "b" ? "rgba(255,255,255,0.25)" : "rgba(122,158,122,0.15)",
                        color: answered === "b" ? "white" : "#7A9E7A",
                      }}
                    >
                      乙
                    </span>
                    {question.b.text}
                  </button>
                </div>
              );
            })}

            <div
              className="mt-2 transition-all duration-300"
              style={{ opacity: tieBreakerComplete ? 1 : 0.35, pointerEvents: tieBreakerComplete ? "auto" : "none" }}
            >
              <button
                onClick={handleTieBreakerSubmit}
                disabled={!tieBreakerComplete}
                className="w-full py-4 rounded-2xl text-base font-medium transition-all duration-200 active:scale-95"
                style={{
                  background: tieBreakerComplete
                    ? "linear-gradient(135deg, #7A9E7A, #5A7E5A)"
                    : "rgba(122,158,122,0.3)",
                  color: "white",
                  boxShadow: tieBreakerComplete ? "0 4px 20px rgba(122,158,122,0.35)" : "none",
                  letterSpacing: "0.05em",
                }}
              >
                查看最終結果 ✦
              </button>

              {!tieBreakerComplete && (
                <p className="text-center text-xs mt-2" style={{ color: "#A0B0A0" }}>
                  請完成所有比較題（{tieBreakerAnsweredCount}/{tieBreakerQuestions.length}）
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {sectionQuestions.map((question, index) => {
              const answered = answers[question.id];
              const questionNumber = currentSection * SECTION_SIZE + index + 1;

              return (
                <div
                  key={question.id}
                  className="mb-4 rounded-2xl p-4 transition-all duration-200"
                  style={{
                    background: answered ? "rgba(122,158,122,0.06)" : "white",
                    border: answered
                      ? "1.5px solid rgba(122,158,122,0.25)"
                      : "1.5px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="text-xs mb-3 font-medium" style={{ color: "#A0B0A0" }}>
                    {questionNumber}
                  </div>

                  <button
                    onClick={() => handleAnswer(question.id, "a")}
                    className="w-full text-left px-4 py-3 rounded-xl mb-2 text-sm leading-relaxed transition-all duration-150 active:scale-98"
                    style={{
                      background:
                        answered === "a"
                          ? "linear-gradient(135deg, #7A9E7A, #5A7E5A)"
                          : "rgba(0,0,0,0.03)",
                      color: answered === "a" ? "white" : "#2D3B2D",
                      border:
                        answered === "a"
                          ? "1.5px solid transparent"
                          : "1.5px solid rgba(0,0,0,0.06)",
                      fontWeight: answered === "a" ? "500" : "400",
                      boxShadow: answered === "a" ? "0 2px 12px rgba(122,158,122,0.3)" : "none",
                    }}
                  >
                    <span
                      className="inline-flex w-5 h-5 rounded-full text-xs font-semibold mr-2 items-center justify-center align-middle"
                      style={{
                        background: answered === "a" ? "rgba(255,255,255,0.25)" : "rgba(122,158,122,0.15)",
                        color: answered === "a" ? "white" : "#7A9E7A",
                      }}
                    >
                      甲
                    </span>
                    {question.a.text}
                  </button>

                  <button
                    onClick={() => handleAnswer(question.id, "b")}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm leading-relaxed transition-all duration-150 active:scale-98"
                    style={{
                      background:
                        answered === "b"
                          ? "linear-gradient(135deg, #7A9E7A, #5A7E5A)"
                          : "rgba(0,0,0,0.03)",
                      color: answered === "b" ? "white" : "#2D3B2D",
                      border:
                        answered === "b"
                          ? "1.5px solid transparent"
                          : "1.5px solid rgba(0,0,0,0.06)",
                      fontWeight: answered === "b" ? "500" : "400",
                      boxShadow: answered === "b" ? "0 2px 12px rgba(122,158,122,0.3)" : "none",
                    }}
                  >
                    <span
                      className="inline-flex w-5 h-5 rounded-full text-xs font-semibold mr-2 items-center justify-center align-middle"
                      style={{
                        background: answered === "b" ? "rgba(255,255,255,0.25)" : "rgba(122,158,122,0.15)",
                        color: answered === "b" ? "white" : "#7A9E7A",
                      }}
                    >
                      乙
                    </span>
                    {question.b.text}
                  </button>
                </div>
              );
            })}

            <div
              className="mt-2 transition-all duration-300"
              style={{ opacity: sectionComplete ? 1 : 0.35, pointerEvents: sectionComplete ? "auto" : "none" }}
            >
              <button
                onClick={handleNext}
                disabled={!sectionComplete}
                className="w-full py-4 rounded-2xl text-base font-medium transition-all duration-200 active:scale-95"
                style={{
                  background: sectionComplete
                    ? "linear-gradient(135deg, #7A9E7A, #5A7E5A)"
                    : "rgba(122,158,122,0.3)",
                  color: "white",
                  boxShadow: sectionComplete ? "0 4px 20px rgba(122,158,122,0.35)" : "none",
                  letterSpacing: "0.05em",
                }}
              >
                {currentSection < totalSections - 1 ? "下一組 →" : "下一步 ✦"}
              </button>

              {!sectionComplete && (
                <p className="text-center text-xs mt-2" style={{ color: "#A0B0A0" }}>
                  請完成本組所有題目（{sectionAnsweredCount}/{sectionQuestions.length}）
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
