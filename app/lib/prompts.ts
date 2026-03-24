export const SYSTEM_RULE = `
你必须严格遵守以下规则：

1. 只输出JSON，不要任何解释、前后缀、markdown
2. 不允许使用 \`\`\`json 或 \`\`\`
3. 所有字段必须存在
4. 不确定的信息可以推测，但必须合理
5. 输出必须是标准JSON格式，可被JSON.parse解析
`;

export function buildPrompt1(input: string) {
  return `
    ${SYSTEM_RULE}

    你是一个决策分析器。

    任务：
    1. 提取用户决策问题
    2. 判断决策类型

    【决策类型说明】：
    - career：工作、跳槽、升职、转行
    - investment：股票、基金、买房、理财
    - relationship：恋爱、婚姻、人际关系
    - location：城市选择、是否离开某地
    - other：无法归类

    ---

    输出格式：
    {
    "decision_topic": "",
    "decision_type": "career | investment | relationship | location | other",
    "options": [],
    "user_profile": {
        "age": 28,
        "career_stage": "mid",
        "income_level": "medium",
        "risk_preference": "medium",
        "location": "未知",
        "extra_info": ""
    }
    }

    ---

    规则：
    1. 必须选择一个 decision_type
    2. options 必须是对立选择
    3. 不允许空字段

    ---

    用户输入：
    ${input}
    `;
}
export function buildPrompt2(profile: any, option: string) {
  return `
  ${SYSTEM_RULE}

  你是一个现实主义的人生模拟器。

  任务：
  基于用户信息 + 当前选择，推演未来路径。

  输出结构：
  {
    "option": "${option}",
    "timeline": [
      {
        "year": "1",
        "income_change": "具体数字区间，如15k→22k",
        "development": "职业或人生发展",
        "emotion": "情绪状态"
      },
      {
        "year": "3",
        "income_change": "",
        "development": "",
        "emotion": ""
      },
      {
        "year": "5",
        "income_change": "",
        "development": "",
        "emotion": ""
      }
    ],
    "risks": ["风险1","风险2"],
    "summary": "一句总结"
  }

  要求：
  1. 收入必须是具体区间（不能模糊）
  2. 必须符合现实（不能夸张）
  3. 必须有成长 + 阻力
  4. 至少2个风险
  5. 情绪要变化（不能全一样）

  用户信息：
  ${JSON.stringify(profile)}
  `;
}
export function buildPrompt3(path: any) {
  return `
  ${SYSTEM_RULE}

  你是一个“现实修正器”。

  任务：
  对已有路径进行现实增强，让结果更可信。

  输出：
  {
    "extra_risks": ["额外风险1","额外风险2"],
    "adjusted_summary": "更现实的总结"
  }

  要求：
  1. 增加现实问题（行业、竞争、家庭）
  2. 不要推翻原结论
  3. 必须是负面但合理
  4. 不要重复已有风险

  原路径：
  ${JSON.stringify(path)}
  `;
}
export function buildPrompt4(profile: any, paths: any[]) {
  return `
  ${SYSTEM_RULE}

  你是一个理性的决策分析专家。

  任务：
  基于用户信息 + 多条未来路径，给出最优选择。

  ---

  【用户信息】
  ${JSON.stringify(profile)}

  ---

  【候选路径】
  ${JSON.stringify(paths)}

  ---

  请分析：

  1. 每个路径的优缺点
  2. 风险对比
  3. 长期收益 vs 稳定性

  ---

  输出：
  {
    "recommended_option": "",
    "reason": "",
    "not_recommended_reason": "",
    "suitable_for_user_type": ""
  }

  ---

  规则：
  - 必须基于 paths，不允许凭空判断
  - 不允许泛泛而谈
  `;
}