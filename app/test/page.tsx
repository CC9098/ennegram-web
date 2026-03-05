"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/questions";
import { Answers, calculateScores, getTopType } from "@/lib/scoring";
// leaf decor unused in test

const SECTION_SIZE = 12;
const TOTAL_SECTIONS = Math.ceil(questions.length / SECTION_SIZE);

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [currentSection, setCurrentSection] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const sectionQuestions = questions.slice(
    currentSection * SECTION_SIZE,
    (currentSection + 1) * SECTION_SIZE
  );

  const sectionAnsweredCount = sectionQuestions.filter(
    (q) => answers[q.id] !== undefined
  ).length;

  const sectionComplete = sectionAnsweredCount === sectionQuestions.length;
  const totalAnswered = Object.keys(answers).length;
  const progress = totalAnswered / questions.length;

  function handleAnswer(questionId: number, choice: "a" | "b") {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  }

  function handleNext() {
    if (currentSection < TOTAL_SECTIONS - 1) {
      setCurrentSection((s) => s + 1);
      // scroll back to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    } else {
      // Calculate and navigate to result
      const scores = calculateScores(questions, answers);
      const topType = getTopType(scores);
      const scoresParam = encodeURIComponent(JSON.stringify(scores));
      router.push(`/result?type=${topType}&scores=${scoresParam}`);
    }
  }

  // Auto-scroll to first unanswered question in section
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [currentSection]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #FDFCF8 0%, #F0F5EE 100%)" }}
    >
      {/* Fixed header */}
      <div
        className="fixed top-0 left-0 right-0 z-50 px-5 pt-4 pb-3"
        style={{ background: "rgba(253,252,248,0.92)", backdropFilter: "blur(12px)" }}
      >
        {/* Section label */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium" style={{ color: "#7A9E7A" }}>
            第 {currentSection + 1} 組 / 共 {TOTAL_SECTIONS} 組
          </span>
          <span className="text-xs" style={{ color: "#A0B0A0" }}>
            {totalAnswered} / {questions.length} 題
          </span>
        </div>

        {/* Progress bar */}
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

      {/* Questions */}
      <div ref={sectionRef} className="pt-24 pb-8 px-4 max-w-lg mx-auto">
        {sectionQuestions.map((q, idx) => {
          const answered = answers[q.id];
          const questionNumber = currentSection * SECTION_SIZE + idx + 1;

          return (
            <div
              key={q.id}
              className="mb-4 rounded-2xl p-4 transition-all duration-200"
              style={{
                background: answered ? "rgba(122,158,122,0.06)" : "white",
                border: answered
                  ? "1.5px solid rgba(122,158,122,0.25)"
                  : "1.5px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Question number */}
              <div className="text-xs mb-3 font-medium" style={{ color: "#A0B0A0" }}>
                {questionNumber}
              </div>

              {/* Choice A */}
              <button
                onClick={() => handleAnswer(q.id, "a")}
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
                  className="inline-block w-5 h-5 rounded-full text-xs font-semibold mr-2 text-center leading-5 flex-shrink-0"
                  style={{
                    background: answered === "a" ? "rgba(255,255,255,0.25)" : "rgba(122,158,122,0.15)",
                    color: answered === "a" ? "white" : "#7A9E7A",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    verticalAlign: "middle",
                  }}
                >
                  甲
                </span>
                {q.a.text}
              </button>

              {/* Choice B */}
              <button
                onClick={() => handleAnswer(q.id, "b")}
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
                  className="inline-block w-5 h-5 rounded-full text-xs font-semibold mr-2 text-center leading-5 flex-shrink-0"
                  style={{
                    background: answered === "b" ? "rgba(255,255,255,0.25)" : "rgba(122,158,122,0.15)",
                    color: answered === "b" ? "white" : "#7A9E7A",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    verticalAlign: "middle",
                  }}
                >
                  乙
                </span>
                {q.b.text}
              </button>
            </div>
          );
        })}

        {/* Next / Submit button */}
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
            {currentSection < TOTAL_SECTIONS - 1 ? "下一組 →" : "查看結果 ✦"}
          </button>

          {!sectionComplete && (
            <p className="text-center text-xs mt-2" style={{ color: "#A0B0A0" }}>
              請完成本組所有題目（{sectionAnsweredCount}/{sectionQuestions.length}）
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
