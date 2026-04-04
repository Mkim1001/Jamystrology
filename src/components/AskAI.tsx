"use client";

import { useState, useMemo, useCallback } from "react";
import type { DivinationResult } from "@/types/divination";
import { generateFullText, estimateTokens } from "@/lib/generateAskAIText";

const SYSTEM_TOGGLES = [
  { key: "saju", label: "사주팔자", color: "#f38ba8" },
  { key: "ziwei", label: "자미두수", color: "#cba6f7" },
  { key: "qimen", label: "기문둔갑", color: "#89b4fa" },
  { key: "iching", label: "주역", color: "#a6e3a1" },
  { key: "horary", label: "호라리", color: "#f9e2af" },
  { key: "babylonian", label: "바빌로니아", color: "#fab387" },
  { key: "synthesis", label: "종합분석", color: "#b4befe" },
];

const PROMPT_PRESETS = [
  { label: "프롬프트 없음", value: "" },
  { label: "종합 운세 해석해줘", value: "아래 점술 분석 결과를 바탕으로 종합 운세를 해석해줘. 핵심 메시지, 주의점, 조언을 포함해서 자세히 설명해줘." },
  { label: "올해 재물운 분석", value: "아래 점술 분석 결과를 바탕으로 올해 재물운에 대해 자세히 분석해줘. 투자, 지출, 수입 관련 조언을 포함해줘." },
  { label: "연애운/결혼운 분석", value: "아래 점술 분석 결과를 바탕으로 연애운과 결혼운을 분석해줘. 좋은 시기, 주의할 점, 상대방 특성 등을 설명해줘." },
  { label: "직업/커리어 조언", value: "아래 점술 분석 결과를 바탕으로 직업운과 커리어 방향을 조언해줘. 적성, 전환 시기, 주의점을 포함해줘." },
  { label: "건강 관련 주의사항", value: "아래 점술 분석 결과를 바탕으로 건강 관련 주의사항을 알려줘. 오행 밸런스를 고려한 양생법도 제안해줘." },
  { label: "이사/이동 시기 분석", value: "아래 점술 분석 결과를 바탕으로 이사/이동에 좋은 시기와 방위를 분석해줘." },
  { label: "직접 입력", value: "__custom__" },
];

interface Props {
  results: Record<string, DivinationResult>;
  synthesisResult: DivinationResult | null;
  userName: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

export default function AskAI({ results, synthesisResult, userName, gender, birthDate, birthTime, birthPlace }: Props) {
  const [includeSystems, setIncludeSystems] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    SYSTEM_TOGGLES.forEach(s => {
      if (s.key === "synthesis" ? synthesisResult : results[s.key]) {
        initial.add(s.key);
      }
    });
    return initial;
  });
  const [promptPresetIdx, setPromptPresetIdx] = useState(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const promptValue = PROMPT_PRESETS[promptPresetIdx]?.value || "";
  const isCustom = promptValue === "__custom__";
  const finalPrompt = isCustom ? customPrompt : promptValue;

  const toggleSystem = (key: string) => {
    setIncludeSystems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    const next = new Set<string>();
    SYSTEM_TOGGLES.forEach(s => {
      if (s.key === "synthesis" ? synthesisResult : results[s.key]) {
        next.add(s.key);
      }
    });
    setIncludeSystems(next);
  };

  const selectNone = () => setIncludeSystems(new Set());

  const generatedText = useMemo(() => {
    return generateFullText(results, synthesisResult, {
      includeSystems: Array.from(includeSystems),
      promptPreset: finalPrompt,
      userName,
      gender,
      birthDate,
      birthTime,
      birthPlace,
    });
  }, [results, synthesisResult, includeSystems, finalPrompt, userName, gender, birthDate, birthTime, birthPlace]);

  const charCount = generatedText.length;
  const tokenEstimate = useMemo(() => estimateTokens(generatedText), [generatedText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = generatedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedText]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jamystrology_${userName}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedText, userName]);

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-lg font-medium flex items-center gap-2" style={{ color: "#cdd6f4" }}>
          Ask AI
        </h2>
        <p className="text-xs mt-1" style={{ color: "#6c7086" }}>
          이 텍스트를 복사해서 ChatGPT, Claude 등 AI에 붙여넣으세요
        </p>
      </div>

      {/* 시스템 토글 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: "#6c7086" }}>포함할 시스템</span>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-[10px] px-2 py-0.5 rounded transition-all duration-200"
              style={{ color: "#b4befe", border: "1px solid rgba(255,255,255,0.06)" }}>
              전체 선택
            </button>
            <button onClick={selectNone} className="text-[10px] px-2 py-0.5 rounded transition-all duration-200"
              style={{ color: "#6c7086", border: "1px solid rgba(255,255,255,0.06)" }}>
              전체 해제
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {SYSTEM_TOGGLES.map(sys => {
            const hasData = sys.key === "synthesis" ? !!synthesisResult : !!results[sys.key];
            const isSelected = includeSystems.has(sys.key);
            return (
              <button key={sys.key}
                onClick={() => hasData && toggleSystem(sys.key)}
                disabled={!hasData}
                className="px-3 py-1.5 rounded text-xs transition-all duration-200 disabled:opacity-20"
                style={{
                  background: isSelected ? "#363650" : "#1e1e2e",
                  color: isSelected ? sys.color : "#6c7086",
                  border: isSelected ? `1px solid ${sys.color}` : "1px solid rgba(255,255,255,0.06)",
                }}>
                {isSelected ? "☑" : "☐"} {sys.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 프롬프트 프리셋 */}
      <div className="mb-4">
        <label className="text-xs mb-1.5 block" style={{ color: "#6c7086" }}>프롬프트 프리셋</label>
        <select
          value={promptPresetIdx}
          onChange={e => setPromptPresetIdx(Number(e.target.value))}
          className="w-full px-3 py-2 rounded text-sm outline-none appearance-none"
          style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)", color: "#cdd6f4" }}>
          {PROMPT_PRESETS.map((p, i) => (
            <option key={i} value={i}>{p.label}</option>
          ))}
        </select>
        {isCustom && (
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="AI에게 요청할 내용을 입력하세요..."
            className="w-full mt-2 px-3 py-2 rounded text-sm outline-none resize-none h-16"
            style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)", color: "#cdd6f4" }}
          />
        )}
      </div>

      {/* 텍스트 프리뷰 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: "#6c7086" }}>미리보기</span>
          <span className="text-[10px]" style={{ color: "#585b70" }}>
            약 {charCount.toLocaleString()}자 / ~{tokenEstimate.toLocaleString()} 토큰
          </span>
        </div>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <pre className="p-4 text-xs leading-relaxed overflow-auto max-h-96 whitespace-pre-wrap"
            style={{
              background: "#1e1e2e",
              color: "#a6adc8",
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
            }}>
            {generatedText}
          </pre>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button onClick={handleCopy}
          className="flex-1 py-2.5 rounded font-medium text-sm transition-all duration-200"
          style={{
            background: copied ? "#a6e3a1" : "#b4befe",
            color: "#1e1e2e",
          }}>
          {copied ? "복사 완료 ✓" : "전체 복사"}
        </button>
        <button onClick={handleDownload}
          className="px-6 py-2.5 rounded font-medium text-sm transition-all duration-200"
          style={{ background: "#363650", color: "#b4befe", border: "1px solid rgba(255,255,255,0.06)" }}>
          .txt 다운로드
        </button>
      </div>
    </div>
  );
}
