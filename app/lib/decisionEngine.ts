import { buildPrompt2 } from "./prompts";
import { buildInvestmentPrompt } from "./investmentPrompt";

// 👉 策略映射
export function getStrategy(type: string) {
  switch (type) {
    case "investment":
      return buildInvestmentPrompt;

    case "career":
    case "relationship":
    case "location":
    default:
      return buildPrompt2;
  }
}