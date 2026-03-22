export async function callAI(prompt: string) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen2.5:7b",
      prompt,
      stream: false, // 先关掉流式，稳定最重要
      options: {
        temperature: 0.7
      }
    })
  });

  const data = await res.json();

  return data.response || "";
}