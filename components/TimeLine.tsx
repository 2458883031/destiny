"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const stepsText = [
  "正在解析你的问题…",
  "分析你的职业阶段与风险偏好…",
  "计算未来收入变化曲线…",
  "模拟关键人生事件…",
  "构建多条人生路径…",
  "生成最终决策建议…"
];

export default function App() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  const [decision, setDecision] = useState<any>(null);
  const [mode, setMode] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = async () => {
    setLogs([]);
    setPaths([]);
    setDecision(null);

    const res = await fetch("/api/decision", {
      method: "POST",
      body: JSON.stringify({ input })
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (!part.startsWith("data: ")) continue;

        const json = part.replace("data: ", "");
        const data = JSON.parse(json);

        if (data.type === "step") {
          setLogs((prev) => [...prev, data.message]);
        }

        if (data.type === "path") {
          setPaths((prev) => [...prev, data.data]);
        }

        if (data.type === "decision") {
          setDecision(data.data);
        }
        if (data.type === "answer") {
          setMode(data.mode);
          setAnswer(data.data);
        }
      }
    }
  };

  return (
    <div className="container">
      <h1>人生决策模拟器</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入你的问题"
      />

      <button onClick={handleSubmit}>开始推演</button>

      {/* 日志流 */}
      <div className="logs">
        {logs.map((log, i) => (
          <div key={i} className="fade">
            {log}
          </div>
        ))}
      </div>

      {/* 路径 */}
      <div className="paths">
        {paths.map((path, idx) => (
          <div key={idx} className="card slide">
            <h3>{path.option}</h3>

            {path.timeline.map((t: any, i: number) => (
              <div
                key={i}
                className="timeline fade"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <p>{t.year}年</p>
                <p>
                  {t.value_label}：{t.value}
                </p>
                {t.change_rate && <p>收益率：{t.change_rate}</p>}
                <p>{t.event}</p>
                <p>{t.emotion}</p>
              </div>
            ))}

            <div className="risks">
              {path.risks.map((r: string, i: number) => (
                <div key={i} className="fade">
                  ⚠️ {r}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 决策 */}
      {decision && (
        <div className="decision pop">
          <h2>推荐：{decision.recommended_option}</h2>
          <p>{decision.reason}</p>
        </div>
      )}
      {mode === "analysis" && (
        <div className="analysis fade">
          <h2>原因分析</h2>
          <pre>{answer}</pre>
        </div>
      )}

      {mode === "plan" && (
        <div className="plan fade">
          <h2>行动方案</h2>
          <pre>{answer}</pre>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: auto;
          padding: 20px;
        }

        input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
        }

        button {
          padding: 10px 20px;
        }

        .card {
          border: 1px solid #ddd;
          padding: 10px;
          margin-top: 20px;
          border-radius: 10px;
        }

        .fade {
          animation: fadeIn 0.5s ease;
        }

        .slide {
          animation: slideIn 0.6s ease;
        }

        .pop {
          animation: popIn 0.4s ease;
          margin-top: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 10px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
