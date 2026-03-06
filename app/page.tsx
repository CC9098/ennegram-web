"use client";

import Link from "next/link";
import { EdenLogo } from "@/components/EdenLogo";
import { LeafTopRight, LeafBottomLeft, SmallLeaf } from "@/components/LeafDecor";

export default function Home() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FDFCF8 0%, #F0F5EE 100%)" }}
    >
      <LeafTopRight className="top-0 right-0" />
      <LeafBottomLeft className="bottom-0 left-0" />

      <div className="relative z-10 text-center max-w-sm w-full">
        <div className="flex justify-center mb-5">
          <EdenLogo />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(122,158,122,0.15)",
              border: "1.5px solid rgba(122,158,122,0.3)",
            }}
          >
            <SmallLeaf className="w-8 h-8" />
          </div>
        </div>

        <h1
          className="text-3xl font-semibold mb-2"
          style={{ color: "#2D3B2D", letterSpacing: "0.05em" }}
        >
          九型人格測驗
        </h1>
        <p className="text-sm mb-5" style={{ color: "#7A9E7A" }}>
          Enneagram Personality Test
        </p>

        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="h-px w-12" style={{ background: "rgba(122,158,122,0.3)" }} />
          <SmallLeaf className="w-3 h-3 opacity-60" />
          <div className="h-px w-12" style={{ background: "rgba(122,158,122,0.3)" }} />
        </div>

        <p className="text-sm leading-relaxed mb-2" style={{ color: "#4A5E4A" }}>
          共 60 題，每題選出較符合你的一項。
        </p>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B7F6B" }}>
          請根據你
          <span className="font-medium" style={{ color: "#4A5E4A" }}>
            一貫以來
          </span>
          的狀態作答，無需過度思考。
        </p>

        <Link href="/test">
          <button
            className="w-full py-4 rounded-2xl text-base font-medium transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #7A9E7A, #5A7E5A)",
              color: "white",
              boxShadow: "0 4px 20px rgba(122,158,122,0.35)",
              letterSpacing: "0.05em",
            }}
          >
            開始測驗
          </button>
        </Link>

        <div className="mt-6 space-y-1">
          <p className="text-xs" style={{ color: "#A0B0A0" }}>
            約需 5–8 分鐘完成
          </p>
          <p className="text-xs" style={{ color: "#B3BDB3" }}>
            如校正後分數非常接近，系統會再加 5 題最後比較題
          </p>
        </div>
      </div>
    </main>
  );
}
