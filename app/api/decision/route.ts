import { callAI } from "@/lib/ai";
import { buildPrompt1, buildPrompt3, buildPrompt4, buildAnalysisPrompt, buildPlanPrompt } from "@/lib/prompts";
import { getStrategy } from "@/lib/decisionEngine";
import { normalizePath } from "@/lib/normalize";

export function routeByType(type: string) {
  switch (type) {
    case "decision":
      return "decision";

    case "analysis":
      return "analysis";

    case "plan":
      return "plan";

    default:
      return "analysis";
  }
}

function safeJSONParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  }
}

export async function POST(req: Request) {
  
  const { input } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // 🧠 1. 解析问题
        send({ type: "step", message: "正在理解问题..." });

        const p1 = await callAI(buildPrompt1(input));
        const profile = safeJSONParse(p1);
        console.log("profile",profile);
        
        if (!profile) throw new Error("解析失败");
        const mode = routeByType(profile.question_type);
        if (mode === "decision") {
          send({ type: "profile", data: profile });

          // 🎯 2. 策略选择
          const strategy = getStrategy(profile.decision_type);
          const allPaths = [];
          // 🌱 3. 逐个生成路径（流式）
          for (const option of profile.options) {
            send({ type: "step", message: `生成路径：${option}` });

            const p2 = await callAI(strategy(profile, option));
            let path = safeJSONParse(p2);

            if (!path) continue;

            // ⚠️ 风险补充
            const p3 = await callAI(buildPrompt3(path));
            let risk = safeJSONParse(p3);

            const normalized = normalizePath(
              {
                ...path,
                ...(risk || {})
              },
              profile.decision_type
            );

            allPaths.push(normalized); // ✅ 收集
            // 👉 实时推送路径
            send({ type: "path", data: normalized });
          }

          // 🧾 4. 最终决策
          send({ type: "step", message: "正在生成最终决策..." });

          const p4 = await callAI(buildPrompt4(profile, allPaths));
          const decision = safeJSONParse(p4);

          send({ type: "decision", data: decision });

          send({ type: "done" });
        }

        if (mode === "analysis") {
          send({ type: "step", message: "正在分析原因..." });

          const res = await callAI(buildAnalysisPrompt(input));

          send({
            type: "answer",
            mode: "analysis",
            data: res
          });

          send({ type: "done" });
          return;
        }

        if (mode === "plan") {
          send({ type: "step", message: "正在制定方案..." });

          const res = await callAI(buildPlanPrompt(input));

          send({
            type: "answer",
            mode: "plan",
            data: res
          });

          send({ type: "done" });
          return;
        }
      } catch (err) {
        send({ type: "error", message: err });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}