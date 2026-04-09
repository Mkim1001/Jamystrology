"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ─── Types ─── */

type AIName = "claude" | "gemini" | "perplexity";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface PanelState {
  messages: ChatMessage[];
  streaming: string;
  loading: boolean;
  error: string | null;
}

interface SynthesisItem {
  id: string;
  source: AIName;
  content: string;
}

/* ─── Constants ─── */

const AI_CONFIG: Record<AIName, { name: string; color: string; icon: string }> = {
  claude:     { name: "Claude",     color: "#f38ba8", icon: "◆" },
  gemini:     { name: "Gemini",     color: "#89b4fa", icon: "✦" },
  perplexity: { name: "Perplexity", color: "#a6e3a1", icon: "⊕" },
};

const AI_NAMES: AIName[] = ["claude", "gemini", "perplexity"];

function uid() {
  return Math.random().toString(36).slice(2);
}

function mkPanel(): PanelState {
  return { messages: [], streaming: "", loading: false, error: null };
}

/* ─── Shared button style helpers ─── */

function actionBtn(color: string): React.CSSProperties {
  return {
    padding: "3px 9px",
    background: "transparent",
    border: `1px solid ${color}55`,
    borderRadius: "4px",
    color,
    fontSize: "10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

/* ─── Component ─── */

export default function MultiAIView({ initialPrompt = "" }: { initialPrompt?: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [apiKeys, setApiKeys] = useState<Record<AIName, string>>({
    claude: "", gemini: "", perplexity: "",
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [synthesisItems, setSynthesisItems] = useState<SynthesisItem[]>([]);
  const [synthesisPrompt, setSynthesisPrompt] = useState("");
  const [panels, setPanels] = useState<Record<AIName, PanelState>>({
    claude: mkPanel(), gemini: mkPanel(), perplexity: mkPanel(),
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const panelScrollRefs = useRef<Record<AIName, HTMLDivElement | null>>({
    claude: null, gemini: null, perplexity: null,
  });

  /* Load saved API keys */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("multiAI_apiKeys");
      if (saved) setApiKeys(JSON.parse(saved));
      // Show settings if no keys saved
      else setShowSettings(true);
    } catch { setShowSettings(true); }
  }, []);

  const saveApiKey = (ai: AIName, value: string) => {
    const updated = { ...apiKeys, [ai]: value };
    setApiKeys(updated);
    try { localStorage.setItem("multiAI_apiKeys", JSON.stringify(updated)); } catch { /* ignore */ }
  };

  /* Auto-scroll panels while streaming */
  useEffect(() => {
    AI_NAMES.forEach(ai => {
      if (panels[ai].loading || panels[ai].streaming) {
        const el = panelScrollRefs.current[ai];
        if (el) el.scrollTop = el.scrollHeight;
      }
    });
  }, [panels]);

  /* ── Core: stream from one AI ── */
  const sendToAI = useCallback(async (
    ai: AIName,
    userMessage: string,
    prevMessages: ChatMessage[],
  ) => {
    const key = apiKeys[ai];
    if (!key) {
      setPanels(p => ({ ...p, [ai]: { ...p[ai], error: "⚙ 설정에서 API 키를 입력하세요." } }));
      return;
    }

    const userMsg: ChatMessage = { id: uid(), role: "user", content: userMessage };
    const allMsgs = [...prevMessages, userMsg];

    setPanels(p => ({
      ...p,
      [ai]: { messages: allMsgs, streaming: "", loading: true, error: null },
    }));

    try {
      const res = await fetch(`/api/${ai}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMsgs.map(m => ({ role: m.role, content: m.content })),
          apiKey: key,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setPanels(p => ({ ...p, [ai]: { ...p[ai], streaming: full } }));
      }

      const assistantMsg: ChatMessage = { id: uid(), role: "assistant", content: full };
      setPanels(p => ({
        ...p,
        [ai]: { messages: [...allMsgs, assistantMsg], streaming: "", loading: false, error: null },
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setPanels(p => ({ ...p, [ai]: { ...p[ai], streaming: "", loading: false, error: msg } }));
    }
  }, [apiKeys]);

  /* Send same prompt to all AIs with API keys */
  const sendToAll = useCallback(() => {
    const msg = prompt.trim();
    if (!msg) return;
    setPrompt("");
    // snapshot current panel states before any updates
    const snapshot = { ...panels };
    AI_NAMES.forEach(ai => {
      if (apiKeys[ai]) sendToAI(ai, msg, snapshot[ai].messages);
    });
  }, [prompt, panels, apiKeys, sendToAI]);

  /* Send prompt to one specific AI */
  const sendToOne = useCallback((ai: AIName) => {
    const msg = prompt.trim();
    if (!msg) return;
    setPrompt("");
    sendToAI(ai, msg, panels[ai].messages);
  }, [prompt, panels, sendToAI]);

  /* Copy text to clipboard */
  const copyText = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  /* Add AI response to synthesis panel */
  const addToSynthesis = useCallback((ai: AIName, content: string) => {
    setSynthesisItems(prev => [...prev, { id: uid(), source: ai, content }]);
    setShowSynthesis(true);
  }, []);

  /* Forward response to another AI's prompt area */
  const forwardToAI = useCallback((targetAI: AIName, content: string, sourceAI: AIName) => {
    const template = `[${AI_CONFIG[sourceAI].name} 답변]\n---\n${content}\n---\n\n위 내용을 검토하고 추가 의견이나 다른 관점을 제시해 주세요:`;
    setPrompt(template);
    // Focus the prompt textarea
    setTimeout(() => {
      (document.getElementById("multi-ai-prompt") as HTMLTextAreaElement)?.focus();
    }, 50);
    // Scroll to top to see prompt
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* Clear one panel */
  const clearPanel = (ai: AIName) =>
    setPanels(p => ({ ...p, [ai]: mkPanel() }));

  /* Clear everything */
  const clearAll = () => {
    setPanels({ claude: mkPanel(), gemini: mkPanel(), perplexity: mkPanel() });
    setSynthesisItems([]);
    setPrompt("");
    setSynthesisPrompt("");
  };

  /* Send synthesis context + prompt to all AIs */
  const sendSynthesisToAll = useCallback(() => {
    if (synthesisItems.length === 0 && !synthesisPrompt.trim()) return;

    const ctx = synthesisItems
      .map(i => `[${AI_CONFIG[i.source].name}]\n${i.content}`)
      .join("\n\n---\n\n");

    const finalMsg = ctx
      ? `다음은 여러 AI의 답변입니다:\n\n${ctx}\n\n${synthesisPrompt.trim() || "위 답변들을 종합하여 최선의 결론을 도출해 주세요."}`
      : synthesisPrompt.trim();

    setSynthesisPrompt("");
    const snapshot = { ...panels };
    AI_NAMES.forEach(ai => {
      if (apiKeys[ai]) sendToAI(ai, finalMsg, snapshot[ai].messages);
    });
  }, [synthesisItems, synthesisPrompt, panels, apiKeys, sendToAI]);

  const hasAnyKey = AI_NAMES.some(ai => apiKeys[ai]);
  const activeCount = AI_NAMES.filter(ai => panels[ai].loading).length;

  /* ─── Render ─── */

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#1e1e2e", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", background: "#181825", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: "10px", flexShrink: 0 }}>
        <Link href="/" style={{ color: "#6c7086", fontSize: "12px", textDecoration: "none" }}>← 메인</Link>
        <span style={{ color: "#45475a" }}>|</span>
        <span style={{ color: "#b4befe", fontWeight: 600, fontSize: "14px" }}>Multi AI</span>
        <span style={{ color: "#45475a", fontSize: "12px" }}>Claude · Gemini · Perplexity 동시 비교</span>
        {activeCount > 0 && (
          <span style={{ color: "#f9e2af", fontSize: "11px", marginLeft: "4px" }}>
            ⟳ {activeCount}개 생성 중...
          </span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          <button
            onClick={() => setShowSynthesis(s => !s)}
            style={{
              padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
              border: showSynthesis ? "1px solid #f9e2af" : "1px solid rgba(255,255,255,0.08)",
              background: showSynthesis ? "rgba(249,226,175,0.1)" : "transparent",
              color: showSynthesis ? "#f9e2af" : "#6c7086",
            }}>
            📋 종합{synthesisItems.length > 0 ? ` (${synthesisItems.length})` : ""}
          </button>
          <button
            onClick={clearAll}
            style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#6c7086" }}>
            전체 초기화
          </button>
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{
              padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
              border: showSettings ? "1px solid #b4befe" : "1px solid rgba(255,255,255,0.08)",
              background: showSettings ? "rgba(180,190,254,0.1)" : "transparent",
              color: showSettings ? "#b4befe" : "#6c7086",
            }}>
            ⚙ API 설정
          </button>
        </div>
      </div>

      {/* ── Settings panel ── */}
      {showSettings && (
        <div style={{ padding: "12px 16px", background: "#13131f", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {AI_NAMES.map(ai => (
              <div key={ai} style={{ flex: "1 1 200px" }}>
                <label style={{ color: AI_CONFIG[ai].color, fontSize: "11px", display: "block", marginBottom: "4px", fontWeight: 500 }}>
                  {AI_CONFIG[ai].icon} {AI_CONFIG[ai].name} API Key
                </label>
                <input
                  type="password"
                  value={apiKeys[ai]}
                  onChange={e => saveApiKey(ai, e.target.value)}
                  placeholder={`${AI_CONFIG[ai].name} API 키`}
                  style={{ width: "100%", padding: "7px 10px", background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#cdd6f4", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
          <p style={{ color: "#45475a", fontSize: "10px", marginTop: "8px" }}>
            API 키는 브라우저 로컬 스토리지에만 저장됩니다. 서버로 전송 후 AI API 호출에만 사용됩니다.
          </p>
          {!hasAnyKey && (
            <p style={{ color: "#f38ba8", fontSize: "11px", marginTop: "4px" }}>
              ▲ 사용할 AI의 API 키를 하나 이상 입력하세요.
            </p>
          )}
        </div>
      )}

      {/* ── Prompt area ── */}
      <div style={{ padding: "10px 16px", background: "#181825", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "10px", alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          id="multi-ai-prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              sendToAll();
            }
          }}
          placeholder="질문을 입력하세요... (Ctrl+Enter = 모두에게 전송)"
          rows={3}
          style={{ flex: 1, padding: "10px 12px", background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#cdd6f4", fontSize: "13px", outline: "none", resize: "vertical", lineHeight: "1.5", fontFamily: "inherit", minHeight: "72px" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={sendToAll}
            disabled={!prompt.trim() || !hasAnyKey}
            style={{
              padding: "9px 18px", background: prompt.trim() && hasAnyKey ? "#b4befe" : "#363650",
              color: "#1e1e2e", border: "none", borderRadius: "7px", fontSize: "13px",
              fontWeight: 600, cursor: prompt.trim() && hasAnyKey ? "pointer" : "not-allowed",
              opacity: prompt.trim() && hasAnyKey ? 1 : 0.5, whiteSpace: "nowrap",
            }}>
            모두 전송 ▶▶▶
          </button>
          <div style={{ display: "flex", gap: "4px" }}>
            {AI_NAMES.map(ai => (
              <button
                key={ai}
                onClick={() => sendToOne(ai)}
                disabled={!prompt.trim() || !apiKeys[ai]}
                style={{
                  flex: 1, padding: "5px 6px", background: "transparent",
                  color: apiKeys[ai] ? AI_CONFIG[ai].color : "#45475a",
                  border: `1px solid ${apiKeys[ai] ? AI_CONFIG[ai].color + "44" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: "6px", fontSize: "10px",
                  cursor: prompt.trim() && apiKeys[ai] ? "pointer" : "not-allowed",
                  opacity: prompt.trim() && apiKeys[ai] ? 1 : 0.5, whiteSpace: "nowrap",
                }}>
                {AI_CONFIG[ai].name} ▶
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Three panels ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", overflow: "hidden", minHeight: 0 }}>
        {AI_NAMES.map((ai, idx) => {
          const panel = panels[ai];
          const cfg = AI_CONFIG[ai];
          const lastMsg = panel.messages.at(-1);
          const otherAIs = AI_NAMES.filter(a => a !== ai);

          return (
            <div key={ai} style={{ display: "flex", flexDirection: "column", borderRight: idx < 2 ? "1px solid rgba(255,255,255,0.06)" : undefined, overflow: "hidden" }}>

              {/* Panel header */}
              <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 13px", background: "#181825", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                <span style={{ color: cfg.color, fontSize: "13px" }}>{cfg.icon}</span>
                <span style={{ color: cfg.color, fontWeight: 600, fontSize: "13px" }}>{cfg.name}</span>
                {!apiKeys[ai] && <span style={{ color: "#585b70", fontSize: "10px" }}>API 키 없음</span>}
                {panel.loading && <span style={{ color: "#f9e2af", fontSize: "10px", marginLeft: "2px", animation: "pulse 1.5s infinite" }}>생성 중...</span>}
                <button
                  onClick={() => clearPanel(ai)}
                  style={{ marginLeft: "auto", padding: "2px 7px", background: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px", color: "#585b70", fontSize: "10px", cursor: "pointer" }}>
                  초기화
                </button>
              </div>

              {/* Messages */}
              <div
                ref={el => { panelScrollRefs.current[ai] = el; }}
                style={{ flex: 1, overflowY: "auto", padding: "14px 13px" }}>

                {panel.messages.map((msg, i) => {
                  const isLatestAssistant = msg.role === "assistant" && i === panel.messages.length - 1 && !panel.streaming;
                  return (
                    <div key={msg.id} style={{ marginBottom: "14px" }}>
                      {msg.role === "user" ? (
                        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px 11px", borderLeft: `2px solid rgba(255,255,255,0.1)` }}>
                          <div style={{ color: "#585b70", fontSize: "9px", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>나</div>
                          <p style={{ color: "#a6adc8", fontSize: "12px", whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.55" }}>{msg.content}</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ borderLeft: `2px solid ${cfg.color}55`, paddingLeft: "10px" }}>
                            <p style={{ color: "#cdd6f4", fontSize: "13px", whiteSpace: "pre-wrap", margin: "0 0 8px", lineHeight: "1.65" }}>
                              {msg.content}
                            </p>
                          </div>
                          {isLatestAssistant && (
                            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", paddingLeft: "12px", marginTop: "4px" }}>
                              <button
                                onClick={() => copyText(msg.content, msg.id)}
                                style={actionBtn(copiedId === msg.id ? "#a6e3a1" : "#6c7086")}>
                                {copiedId === msg.id ? "✓ 복사됨" : "복사"}
                              </button>
                              <button
                                onClick={() => addToSynthesis(ai, msg.content)}
                                style={actionBtn("#f9e2af")}>
                                +종합
                              </button>
                              {otherAIs.map(targetAI => (
                                <button
                                  key={targetAI}
                                  onClick={() => forwardToAI(targetAI, msg.content, ai)}
                                  style={actionBtn(AI_CONFIG[targetAI].color)}>
                                  →{AI_CONFIG[targetAI].name}에게
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Streaming indicator */}
                {panel.streaming && (
                  <div style={{ borderLeft: `2px solid ${cfg.color}55`, paddingLeft: "10px" }}>
                    <p style={{ color: "#cdd6f4", fontSize: "13px", whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.65" }}>
                      {panel.streaming}
                      <span style={{ display: "inline-block", width: "2px", height: "13px", background: cfg.color, verticalAlign: "middle", marginLeft: "2px", borderRadius: "1px", animation: "blink 0.9s infinite" }} />
                    </p>
                  </div>
                )}

                {/* Error */}
                {panel.error && (
                  <div style={{ padding: "9px 11px", background: "rgba(243,139,168,0.08)", border: "1px solid rgba(243,139,168,0.2)", borderRadius: "7px" }}>
                    <p style={{ color: "#f38ba8", fontSize: "12px", margin: 0 }}>{panel.error}</p>
                    <button
                      onClick={() => setPanels(p => ({ ...p, [ai]: { ...p[ai], error: null } }))}
                      style={{ ...actionBtn("#f38ba8"), marginTop: "6px" }}>
                      닫기
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {panel.messages.length === 0 && !panel.streaming && !panel.error && (
                  <div style={{ textAlign: "center", marginTop: "50px", opacity: 0.4 }}>
                    <div style={{ fontSize: "28px", marginBottom: "10px", color: cfg.color }}>{cfg.icon}</div>
                    <p style={{ color: "#6c7086", fontSize: "12px" }}>
                      {apiKeys[ai] ? "질문을 입력하고 전송하세요" : "설정에서 API 키를 입력하세요"}
                    </p>
                  </div>
                )}

                {/* Last assistant msg details (non-streaming) */}
                {lastMsg?.role === "user" && panel.loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "12px", opacity: 0.6 }}>
                    <span style={{ color: cfg.color, fontSize: "12px", animation: "pulse 1.5s infinite" }}>{cfg.icon}</span>
                    <span style={{ color: "#6c7086", fontSize: "11px" }}>응답 생성 중...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Synthesis panel ── */}
      {showSynthesis && (
        <div style={{ borderTop: "1px solid rgba(249,226,175,0.25)", background: "#13131f", maxHeight: "280px", display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Synthesis header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <span style={{ color: "#f9e2af", fontSize: "12px", fontWeight: 600 }}>📋 종합 작업공간</span>
            <span style={{ color: "#585b70", fontSize: "11px" }}>{synthesisItems.length}개 항목</span>
            <button
              onClick={() => setSynthesisItems([])}
              style={{ marginLeft: "auto", padding: "2px 8px", background: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px", color: "#585b70", fontSize: "10px", cursor: "pointer" }}>
              항목 초기화
            </button>
          </div>

          {/* Synthesis items */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: "10px 14px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            {synthesisItems.length === 0 ? (
              <p style={{ color: "#45475a", fontSize: "12px", alignSelf: "center", width: "100%", textAlign: "center" }}>
                AI 답변의 "+종합" 버튼으로 내용을 추가하세요 — 여러 AI의 답변을 모아 최종 질문을 할 수 있습니다.
              </p>
            ) : (
              synthesisItems.map(item => (
                <div key={item.id} style={{ flex: "0 0 260px", padding: "10px", background: "#1e1e2e", borderRadius: "7px", border: `1px solid ${AI_CONFIG[item.source].color}33`, position: "relative" }}>
                  <div style={{ color: AI_CONFIG[item.source].color, fontSize: "10px", marginBottom: "5px", fontWeight: 600 }}>
                    {AI_CONFIG[item.source].icon} {AI_CONFIG[item.source].name}
                  </div>
                  <p style={{ color: "#a6adc8", fontSize: "11px", whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.5", overflow: "hidden", maxHeight: "110px" }}>
                    {item.content}
                  </p>
                  <button
                    onClick={() => setSynthesisItems(prev => prev.filter(i => i.id !== item.id))}
                    style={{ position: "absolute", top: "5px", right: "7px", background: "transparent", border: "none", color: "#45475a", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Synthesis send area */}
          <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "8px", flexShrink: 0 }}>
            <input
              value={synthesisPrompt}
              onChange={e => setSynthesisPrompt(e.target.value)}
              placeholder="추가 질문 (비워두면 자동 종합 요청)..."
              style={{ flex: 1, padding: "8px 12px", background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#cdd6f4", fontSize: "12px", outline: "none" }}
              onKeyDown={e => {
                if (e.key === "Enter") { e.preventDefault(); sendSynthesisToAll(); }
              }}
            />
            <button
              onClick={sendSynthesisToAll}
              disabled={synthesisItems.length === 0 && !synthesisPrompt.trim()}
              style={{
                padding: "8px 16px", background: "#f9e2af", color: "#1e1e2e", border: "none",
                borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                cursor: synthesisItems.length > 0 || synthesisPrompt.trim() ? "pointer" : "not-allowed",
                opacity: synthesisItems.length > 0 || synthesisPrompt.trim() ? 1 : 0.5,
                whiteSpace: "nowrap",
              }}>
              모두에게 전송
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes blink { 0%,49% { opacity:1; } 50%,100% { opacity:0; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
