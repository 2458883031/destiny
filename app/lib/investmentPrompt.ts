import { SYSTEM_RULE } from "./prompts";

export function buildInvestmentPrompt(profile: any, option: string) {
  return `
    ${SYSTEM_RULE}

    你是一个投资分析师。

    任务：
    模拟该选择下的资产变化。

    【关键要求】：

    1. 禁止使用“工资”
    2. 必须使用：
    - 资产（如：10万→15万）
    - 收益率（%）
    - 回撤（亏损）

    ---

    输出：
    {
    "option": "${option}",
    "timeline": [
        {
        "year": "1",
        "asset_change": "",
        "return_rate": "",
        "event": "",
        "emotion": ""
        },
        {
        "year": "3",
        "asset_change": "",
        "return_rate": "",
        "event": "",
        "emotion": ""
        },
        {
        "year": "5",
        "asset_change": "",
        "return_rate": "",
        "event": "",
        "emotion": ""
        }
    ],
    "risks": [],
    "summary": ""
    }

    用户信息：
    ${JSON.stringify(profile)}
    `;
}