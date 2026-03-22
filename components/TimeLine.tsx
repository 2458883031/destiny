"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { log } from "console";

const stepsText = [
  "正在解析你的问题…",
  "分析你的职业阶段与风险偏好…",
  "计算未来收入变化曲线…",
  "模拟关键人生事件…",
  "构建多条人生路径…",
  "生成最终决策建议…"
];

export default function App() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  // 打字机效果
  useEffect(() => {
    if (!loading) return;

    const fullText = stepsText[currentStepIndex];
    let i = 0;

    setDisplayText("");

    const typing = setInterval(() => {
      i++;
      setDisplayText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(typing);
      }
    }, 40);

    const next = setTimeout(() => {
      setCurrentStepIndex((prev) =>
        prev < stepsText.length - 1 ? prev + 1 : prev
      );
    }, 1800);

    return () => {
      clearInterval(typing);
      clearTimeout(next);
    };
  }, [currentStepIndex, loading]);

  const handleSubmit = async () => {
    if (!input.trim()) {
      alert("请输入问题");
      return;
    }
    setLoading(true);
    setStep(2);

    try {
      const res = await fetch("/api/decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("失败");
      }

      setResult({
        recommendation: data.data.decision.recommended_option,
        paths: data.data.paths
      });

      setStep(3);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl mb-6">AI 人生决策引擎</h1>
          <textarea
            className="w-full p-4 rounded bg-gray-900"
            placeholder="例如：我要不要辞职去更大的公司？"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="mt-4 px-6 py-2 bg-blue-600 rounded"
            onClick={handleSubmit}
          >
            开始推演我的未来
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
          />

          <motion.div
            key={displayText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-gray-300"
          >
            {displayText}
          </motion.div>

          <div className="mt-6 flex gap-2">
            {stepsText.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded ${
                  i <= currentStepIndex ? "bg-blue-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {step === 3 && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl mb-4">你未来5年的可能路径</h2>

          <div className="mb-6 p-4 bg-green-700 rounded text-lg">
            👉 推荐选择：{result.recommendation}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {result.paths.map((path, idx) => (
              <div
                key={idx}
                className={`p-4 rounded ${
                  path.option === result.recommendation
                    ? "bg-gray-800 border border-green-500"
                    : "bg-gray-900 opacity-70"
                }`}
              >
                <h3 className="text-xl mb-2">{path.option}</h3>
                {path.timeline.map((t, i) => (
                  <div key={i} className="mb-2 border-b border-gray-700 pb-2">
                    <p>{t.year}年</p>
                    <p>{t.value_label}：{t.value}</p>
                    {t.change_rate && (
                      <p>收益率：{t.change_rate}</p>
                    )}
                    <p>{t.event}</p>
                    <p>{t.emotion}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
