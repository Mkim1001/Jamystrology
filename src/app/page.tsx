"use client";

import { useState, useCallback } from "react";
import type { DivinationInput, DivinationResult } from "@/types/divination";
import { saju, ziwei, qimen, iching, horary, babylonian, synthesis } from "@/engines";

import InputForm from "@/components/InputForm";
import type { FormData, SubmitOptions } from "@/components/InputForm";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import DetailPanel from "@/components/DetailPanel";
import GraphView from "@/components/graph/GraphView";
import SynthesisView from "@/components/SynthesisView";
import SingleSystemView from "@/components/SingleSystemView";

/* ─── types ─── */

type ViewMode = "dashboard" | "graph" | "synthesis";
type AnalysisMode = "full" | "selective" | "single";

const ALL_ENGINES: { key: string; label: string; calc: (i: DivinationInput) => DivinationResult }[] = [
  { key: "saju", label: "사주팔자", calc: saju.calculate },
  { key: "ziwei", label: "자미두수", calc: ziwei.calculate },
  { key: "qimen", label: "기문둔갑", calc: qimen.calculate },
  { key: "iching", label: "주역", calc: iching.calculate },
  { key: "horary", label: "호라리 점성술", calc: horary.calculate },
  { key: "babylonian", label: "바빌로니아 점성술", calc: babylonian.calculate },
];

/* ─── page ─── */

export default function Home() {
  /* state */
  const [results, setResults] = useState<Record<string, DivinationResult> | null>(null);
  const [synthesisResult, setSynthesisResult] = useState<DivinationResult | null>(null);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("dashboard");
  const [loading, setLoading] = useState(false);
  const [loadingSystems, setLoadingSystems] = useState<Set<string>>(new Set());
  const [loadingSteps, setLoadingSteps] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("full");
  const [currentInput, setCurrentInput] = useState<DivinationInput | null>(null);
  const [currentForm, setCurrentForm] = useState<FormData | null>(null);

  /* convert form to engine input */
  const formToInput = (form: FormData): DivinationInput => ({
    name: form.name,
    gender: form.gender,
    birthDate: `${form.birthYear}-${form.birthMonth.padStart(2, "0")}-${form.birthDay.padStart(2, "0")}`,
    birthTime: form.birthTime,
    birthPlace: form.birthPlace || undefined,
    horaryQuestion: form.horaryEnabled ? form.horaryQuestion : undefined,
    horaryDatetime: form.horaryEnabled ? form.horaryDatetime : undefined,
    horaryLocation: form.horaryEnabled ? form.horaryLocation : undefined,
  });

  /* run specific systems and merge into existing results */
  const runSystems = useCallback(async (
    input: DivinationInput,
    systemKeys: string[],
    existingResults?: Record<string, DivinationResult> | null,
  ) => {
    const enginesToRun = ALL_ENGINES.filter(e => systemKeys.includes(e.key));
    const newLoadingSystems = new Set(systemKeys);
    setLoadingSystems(newLoadingSystems);

    const res: Record<string, DivinationResult> = existingResults ? { ...existingResults } : {};

    for (const engine of enginesToRun) {
      try {
        res[engine.key] = engine.calc(input);
      } catch (e) {
        console.error(`[${engine.key}] error:`, e);
      }
      setLoadingSteps(prev => [...prev, engine.label]);
      newLoadingSystems.delete(engine.key);
      setLoadingSystems(new Set(newLoadingSystems));
      await new Promise(r => setTimeout(r, 60));
    }

    // Synthesis: run if 2+ results exist
    const resultKeys = Object.keys(res);
    if (resultKeys.length >= 2) {
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
    }

    return res;
  }, []);

  /* form → engine calls */
  const handleSubmit = useCallback(async (form: FormData, options: SubmitOptions) => {
    setLoading(true);
    setLoadingSteps([]);
    setAnalysisMode(options.mode);

    const input = formToInput(form);
    setCurrentInput(input);
    setCurrentForm(form);
    setUserName(form.name);
    setBirthDate(input.birthDate);

    const res = await runSystems(input, options.selectedSystems);

    setResults(res);
    setLoading(false);
    setLoadingSystems(new Set());

    if (options.mode === "single" && options.singleSystem) {
      setActiveSystem(options.singleSystem);
    }
    setActiveView("dashboard");
  }, [runSystems]);

  /* run additional system(s) on top of existing results */
  const handleRunAdditional = useCallback(async (systemKeys: string[]) => {
    if (!currentInput || loading) return;
    setLoading(true);
    setLoadingSteps([]);

    const newLoadingSystems = new Set(systemKeys);
    setLoadingSystems(newLoadingSystems);

    const res = await runSystems(currentInput, systemKeys, results);

    setResults(res);
    setLoading(false);
    setLoadingSystems(new Set());

    // If we were in single mode and now have more results, switch to dashboard
    if (analysisMode === "single" && Object.keys(res).length > 1) {
      setAnalysisMode("selective");
    }
  }, [currentInput, loading, results, runSystems, analysisMode]);

  /* re-run all systems */
  const handleReRunAll = useCallback(async () => {
    if (!currentInput || loading) return;
    setLoading(true);
    setLoadingSteps([]);
    setSynthesisResult(null);

    const allKeys = ALL_ENGINES.map(e => e.key);
    const res = await runSystems(currentInput, allKeys);

    setResults(res);
    setLoading(false);
    setLoadingSystems(new Set());
    setAnalysisMode("full");
  }, [currentInput, loading, runSystems]);

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
    setAnalysisMode("full");
    setCurrentInput(null);
    setCurrentForm(null);
  }, []);

  const handleNodeClick = useCallback((systemKey: string) => {
    setActiveSystem(systemKey);
  }, []);

  const handleBackFromSingle = useCallback(() => {
    setAnalysisMode("selective");
    setActiveSystem(null);
  }, []);

  /* ─── render: input form (no results yet) ─── */
  if (!results) {
    return <InputForm onSubmit={handleSubmit} loading={loading} loadingSteps={loadingSteps} />;
  }

  /* ─── render: single system fullscreen view ─── */
  if (analysisMode === "single" && activeSystem && results[activeSystem]) {
    return (
      <SingleSystemView
        systemKey={activeSystem}
        result={results[activeSystem]}
        onBack={handleBackFromSingle}
        onReRun={() => handleRunAdditional([activeSystem])}
        onRunSystem={(key) => handleRunAdditional([key])}
        loading={loading}
        loadingSystems={loadingSystems}
        results={results}
      />
    );
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
        onRunAdditional={handleRunAdditional}
        onReRunAll={handleReRunAll}
        loading={loading}
        loadingSystems={loadingSystems}
      />

      {/* 중앙: 메인패널 */}
      <div className="flex-1 h-full overflow-hidden">
        {activeView === "dashboard" && (
          <Dashboard
            results={results}
            synthesisResult={synthesisResult}
            onSelectSystem={handleSelectSystem}
            onRunSystem={(key) => handleRunAdditional([key])}
            loading={loading}
            loadingSystems={loadingSystems}
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
