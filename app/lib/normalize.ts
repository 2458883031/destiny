export function normalizePath(path: any, type: string) {
  const timeline = (path.timeline || []).map((t: any) => {
    // 👉 职业类型
    if (type === "career") {
      return {
        year: t.year,
        value: t.income_change,
        value_label: "收入",
        event: t.development,
        emotion: t.emotion
      };
    }

    // 👉 投资类型
    if (type === "investment") {
      return {
        year: t.year,
        value: t.asset_change,
        value_label: "资产",
        change_rate: t.return_rate,
        event: t.event,
        emotion: t.emotion
      };
    }

    // 👉 默认兜底
    return {
      year: t.year,
      value: t.income_change || t.asset_change || "",
      value_label: "变化",
      event: t.development || t.event || "",
      emotion: t.emotion || ""
    };
  });

  return {
    option: path.option,
    timeline,
    risks: path.risks || [],
    summary: path.summary || ""
  };
}