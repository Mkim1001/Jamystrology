"use client";

import { useEffect, useRef, useState } from "react";

export default function MeditationPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Slight delay so the iframe src triggers properly after hydration
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a1a", overflow: "hidden" }}>
      {!loaded && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          color: "#a78bfa", fontFamily: "Georgia, serif", gap: "1rem"
        }}>
          <div style={{
            width: 48, height: 48,
            border: "3px solid #2d1b69",
            borderTopColor: "#7c3aed",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <p>명상 앱 로딩 중...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {loaded && (
        <iframe
          ref={iframeRef}
          src="/meditation/sketch.html"
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="camera; microphone"
          title="PoseNet 명상 가이드"
        />
      )}
    </div>
  );
}
