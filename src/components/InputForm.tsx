"use client";

import { useState } from "react";

const SIJIN = [
  { label: "子", time: "23-01", value: "자" }, { label: "丑", time: "01-03", value: "축" },
  { label: "寅", time: "03-05", value: "인" }, { label: "卯", time: "05-07", value: "묘" },
  { label: "辰", time: "07-09", value: "진" }, { label: "巳", time: "09-11", value: "사" },
  { label: "午", time: "11-13", value: "오" }, { label: "未", time: "13-15", value: "미" },
  { label: "申", time: "15-17", value: "신" }, { label: "酉", time: "17-19", value: "유" },
  { label: "戌", time: "19-21", value: "술" }, { label: "亥", time: "21-23", value: "해" },
];

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

interface Props {
  onSubmit: (data: FormData) => void;
  loading: boolean;
  loadingSteps: string[];
}

export default function InputForm({ onSubmit, loading, loadingSteps }: Props) {
  const [form, setForm] = useState<FormData>({
    name: "", gender: "male",
    birthYear: "1990", birthMonth: "1", birthDay: "1", birthTime: "",
    birthPlace: "서울",
    horaryEnabled: false, horaryQuestion: "", horaryDatetime: "", horaryLocation: "",
  });

  const years = Array.from({ length: 100 }, (_, i) => String(2010 - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  const SYSTEMS = ["사주팔자", "자미두수", "기문둔갑", "주역", "호라리 점성술", "바빌로니아 점성술"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#1e1e2e" }}>
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium" style={{ color: "#cdd6f4" }}>Jamystrology</h1>
          <p className="text-sm mt-1" style={{ color: "#6c7086" }}>六術洞察</p>
        </div>

        <div className="rounded-lg p-8" style={{ background: "#262637" }}>
          {/* 이름 */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm w-20 shrink-0" style={{ color: "#6c7086" }}>이름</label>
            <input
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="flex-1 px-3 py-2 rounded text-sm outline-none"
              style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)", color: "#cdd6f4" }}
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 성별 */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm w-20 shrink-0" style={{ color: "#6c7086" }}>성별</label>
            <div className="flex rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              {(["male", "female"] as const).map(g => (
                <button key={g} onClick={() => setForm({ ...form, gender: g })}
                  className="px-6 py-2 text-sm transition-all duration-200"
                  style={{
                    background: form.gender === g ? "#363650" : "#1e1e2e",
                    color: form.gender === g ? "#b4befe" : "#6c7086",
                  }}>
                  {g === "male" ? "남" : "여"}
                </button>
              ))}
            </div>
          </div>

          {/* 생년월일 */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm w-20 shrink-0" style={{ color: "#6c7086" }}>생년월일</label>
            <div className="flex gap-2 flex-1">
              {[
                { key: "birthYear" as const, options: years, suffix: "년" },
                { key: "birthMonth" as const, options: months, suffix: "월" },
                { key: "birthDay" as const, options: days, suffix: "일" },
              ].map(({ key, options, suffix }) => (
                <div key={key} className="flex items-center gap-1 flex-1">
                  <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="flex-1 px-2 py-2 rounded text-sm outline-none appearance-none"
                    style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)", color: "#cdd6f4" }}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span className="text-xs" style={{ color: "#6c7086" }}>{suffix}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 생시 */}
          <div className="flex items-start gap-4 mb-4">
            <label className="text-sm w-20 shrink-0 pt-2" style={{ color: "#6c7086" }}>생시</label>
            <div className="grid grid-cols-6 gap-1.5 flex-1">
              {SIJIN.map(s => (
                <button key={s.value} onClick={() => setForm({ ...form, birthTime: s.value })}
                  className="py-2 rounded text-center transition-all duration-200"
                  style={{
                    background: form.birthTime === s.value ? "#363650" : "#1e1e2e",
                    border: `1px solid ${form.birthTime === s.value ? "#b4befe" : "rgba(255,255,255,0.06)"}`,
                    color: form.birthTime === s.value ? "#b4befe" : "#6c7086",
                  }}>
                  <div className="text-base" style={{ fontFamily: "Georgia, serif" }}>{s.label}</div>
                  <div className="text-[10px]">{s.time}</div>
                </button>
              ))}
              <button onClick={() => setForm({ ...form, birthTime: "오" })}
                className="py-2 rounded text-center col-span-6 mt-1 transition-all duration-200"
                style={{
                  background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)",
                  color: "#6c7086", fontSize: "12px",
                }}>
                모름 (오시 기본값)
              </button>
            </div>
          </div>

          {/* 출생지 */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm w-20 shrink-0" style={{ color: "#6c7086" }}>출생지 <span className="text-xs">(선택)</span></label>
            <input value={form.birthPlace} onChange={e => setForm({ ...form, birthPlace: e.target.value })}
              className="flex-1 px-3 py-2 rounded text-sm outline-none"
              style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)", color: "#cdd6f4" }}
              placeholder="서울" />
          </div>

          {/* 호라리 토글 */}
          <div className="mb-4">
            <button onClick={() => setForm({ ...form, horaryEnabled: !form.horaryEnabled })}
              className="flex items-center gap-3 text-sm"
              style={{ color: form.horaryEnabled ? "#b4befe" : "#6c7086" }}>
              <div className="w-10 h-5 rounded-full relative transition-all duration-200"
                style={{ background: form.horaryEnabled ? "#b4befe" : "#363650" }}>
                <div className="w-4 h-4 rounded-full absolute top-0.5 transition-all duration-200"
                  style={{ background: "#1e1e2e", left: form.horaryEnabled ? "22px" : "2px" }} />
              </div>
              호라리 점성술
            </button>
          </div>

          {form.horaryEnabled && (
            <div className="ml-4 mb-6 space-y-3 animate-in">
              <textarea value={form.horaryQuestion}
                onChange={e => setForm({ ...form, horaryQuestion: e.target.value })}
                className="w-full px-3 py-2 rounded text-sm outline-none resize-none h-20"
                style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)", color: "#cdd6f4" }}
                placeholder="질문을 입력하세요" />
              <div className="flex gap-2">
                <input type="datetime-local" value={form.horaryDatetime}
                  onChange={e => setForm({ ...form, horaryDatetime: e.target.value })}
                  className="flex-1 px-3 py-2 rounded text-sm outline-none"
                  style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)", color: "#cdd6f4" }} />
                <input value={form.horaryLocation}
                  onChange={e => setForm({ ...form, horaryLocation: e.target.value })}
                  className="flex-1 px-3 py-2 rounded text-sm outline-none"
                  style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.06)", color: "#cdd6f4" }}
                  placeholder="질문 장소" />
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <button onClick={() => onSubmit(form)} disabled={loading || !form.name || !form.birthTime}
            className="w-full py-2.5 rounded font-medium text-sm transition-all duration-200 disabled:opacity-40"
            style={{ background: "#b4befe", color: "#1e1e2e" }}>
            {loading ? "분석 중..." : "분석 시작"}
          </button>

          {/* 로딩 시스템 체크리스트 */}
          {loading && (
            <div className="mt-4 space-y-1.5">
              {SYSTEMS.map((sys, i) => (
                <div key={sys} className="flex items-center gap-2 text-xs"
                  style={{ color: loadingSteps.includes(sys) ? "#a6e3a1" : "#6c7086" }}>
                  <span>{loadingSteps.includes(sys) ? "✓" : "○"}</span>
                  <span>{sys}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
