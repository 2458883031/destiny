import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai";
import {
  buildPrompt1,
  buildPrompt2,
  buildPrompt3,
  buildPrompt4
} from "@/lib/prompts";
import { getStrategy } from "@/lib/decisionEngine";
import { normalizePath } from "@/lib/normalize";

// ===== JSON安全解析 =====
function safeJSONParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON解析失败:", text);
      return null;
    }
  }
}

// ===== 主接口 =====
export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: "请输入问题" },
        { status: 400 }
      );
    }

    // =========================
    // 1️⃣ 信息结构化
    // =========================
    const p1 = await callAI(buildPrompt1(input));
    const profile = safeJSONParse(p1);

    if (!profile || !profile.options) {
      throw new Error("结构化失败");
    }
    const strategy = getStrategy(profile.decision_type);

    // =========================
    // 2️⃣ 路径生成（并行优化🔥）
    // =========================
    const pathPromises = profile.options.map(async (option: string) => {
      try {
        // 👉 用不同策略
        const p2 = await callAI(strategy(profile, option));
        let path = safeJSONParse(p2);

        if (!path) throw new Error("路径生成失败");

        const p3 = await callAI(buildPrompt3(path));
        let risk = safeJSONParse(p3);

        return normalizePath(
          {
            ...path,
            ...(risk || {})
          },
          profile.decision_type
        );
      } catch (e) {
        console.error("单路径失败:", option, e);

        return {
          option,
          timeline: [],
          risks: ["生成失败"],
          summary: "该路径生成异常"
        };
      }
    });

    const paths = await Promise.all(pathPromises);

    // =========================
    // 3️⃣ 最终决策
    // =========================
    const p4 = await callAI(buildPrompt4(profile, paths));
    const decision = safeJSONParse(p4);

    if (!decision) {
      throw new Error("决策生成失败");
    }

    // =========================
    // 返回结果
    // =========================
    return NextResponse.json({
      success: true,
      data: {
        profile,
        paths,
        decision
      }
    });

  } catch (e: any) {
    console.error("API错误:", e);

    return NextResponse.json(
      {
        success: false,
        error: e.message || "系统异常"
      },
      { status: 500 }
    );
  }
}