"use client";

import { useState, useCallback } from "react";
import type { DivinationInput, DivinationResult } from "@/types/divination";
import { saju, ziwei, qimen, iching, horary, babylonian, synthesis } from "@/engines";

import InputForm from "@/components/InputForm";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import DetailPanel from "@/components/DetailPanel";
import GraphView from "@/components/graph/GraphView";
import SynthesisView from "@/components/SynthesisView";

/* ─── types ─── */

type ViewMode = "dashboard" | "graph" | "synthesis";

interface FormData {
  name: string;
  gender: "male" | "female";
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTime: string;
  birthPlace: string;
  horaryEnabled: boolean;
  horaryQuestion: string;
  horaryDatetime: string;
  horaryLocation: string;
}

/* ─── page ─── */

export default function Home() {
  /* state */
  const [results, setResults] = useState<Record<string, DivinationResult> | null>(null);
  const [synthesisResult, setSynthesisResult] = useState<DivinationResult | null>(null);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("dashboard");
  const [loading, setLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  /* form → engine calls */
  const handleSubmit = useCallback(async (form: FormData) => {
    setLoading(true);
    setLoadingSteps([]);

    const input: DivinationInput = {
      name: form.name,
      gender: form.gender,
      birthDate: `${form.birthYear}-${form.birthMonth.padStart(2, "0")}-${form.birthDay.padStart(2, "0")}`,
      birthTime: form.birthTime,
      birthPlace: form.birthPlace || undefined,
      horaryQuestion: form.horaryEnabled ? form.horaryQuestion : undefined,
      horaryDatetime: form.horaryEnabled ? form.horaryDatetime : undefined,
      horaryLocation: form.horaryEnabled ? form.horaryLocation : undefined,
    };

    setUserName(form.name);
    setBirthDate(input.birthDate);

    const engines: { key: string; label: string; calc: (i: DivinationInput) => DivinationResult }[] = [
      { key: "saju", label: "사주팔자", calc: saju.calculate },
      { key: "ziwei", label: "자미두수", calc: ziwei.calculate },
      { key: "qimen", label: "기문둔갑", calc: qimen.calculate },
      { key: "iching", label: "주역", calc: iching.calculate },
      { key: "horary", label: "호라리 점성술", calc: horary.calculate },
      { key: "babylonian", label: "바빌로니아 점성술", calc: babylonian.calculate },
    ];

    const res: Record<string, DivinationResult> = {};

    for (const engine of engines) {
      try {
        res[engine.key] = engine.calc(input);
      } catch (e) {
        console.error(`[${engine.key}] error:`, e);
      }
      setLoadingSteps(prev => [...prev, engine.label]);
      // Yield to UI for loading animation
      await new Promise(r => setTimeout(r, 60));
    }

    // Synthesis
    try {
      const synth = synthesis.synthesize({
        saju: res.saju,
        ziwei: res.ziwei,
        qimen: res.qimen,
        iching: res.iching,
        horary: res.horary,
        babylonian: res.babylonian,
      });
      setSynthesisResult(synth);
    } catch (e) {
      console.error("[synthesis] error:", e);
    }

    setResults(res);
    setLoading(false);
    setActiveView("dashboard");
  }, []);

  /* nav callbacks */
  const handleSelectSystem = useCallback((key: string) => {
    setActiveSystem(key);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setActiveSystem(null);
  }, []);

  const handleChangeView = useCallback((view: string) => {
    setActiveView(view as ViewMode);
  }, []);

  const handleNewAnalysis = useCallback(() => {
    setResults(null);
    setSynthesisResult(null);
    setActiveSystem(null);
    setActiveView("dashboard");
    setLoadingSteps([]);
  }, []);

  const handleNodeClick = useCallback((systemKey: string) => {
    setActiveSystem(systemKey);
  }, []);

  /* ─── render: input form (no results yet) ─── */
  if (!results) {
    return <InputForm onSubmit={handleSubmit} loading={loading} loadingSteps={loadingSteps} />;
  }

  /* ─── render: 3-column layout ─── */
  const detailResult = activeSystem ? results[activeSystem] : null;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#1e1e2e" }}>
      {/* 좌측: 사이드바 */}
      <Sidebar
        activeSystem={activeSystem}
        activeView={activeView}
        userName={userName}
        birthDate={birthDate}
        onSelectSystem={handleSelectSystem}
        onChangeView={handleChangeView}
        onNewAnalysis={handleNewAnalysis}
        results={results}
      />

      {/* 중앙: 메인패널 */}
      <div className="flex-1 h-full overflow-hidden">
        {activeView === "dashboard" && (
          <Dashboard
            results={results}
            synthesisResult={synthesisResult}
            onSelectSystem={handleSelectSystem}
          />
        )}
        {activeView === "graph" && (
          <GraphView
            results={results}
            synthesisResult={synthesisResult}
            onNodeClick={handleNodeClick}
          />
        )}
        {activeView === "synthesis" && synthesisResult && (
          <SynthesisView synthesisResult={synthesisResult} />
        )}
      </div>

      {/* 우측: 디테일 패널 (시스템 선택 시) */}
      {activeSystem && detailResult && (
        <DetailPanel
          systemKey={activeSystem}
          result={detailResult}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
