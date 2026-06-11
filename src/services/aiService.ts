import { requestUrl } from "obsidian";
import type { DailyNote } from "../types/note";
import type { AnalysisRange, LifeInsightSettings } from "../types/settings";
import { ANALYSIS_RANGES } from "../types/settings";

export interface AnalysisRangeMeta {
  range: AnalysisRange;
  startDate: string;
  endDate: string;
  foundCount: number;
  missingCount: number;
  coverageRate: number;
}

export class AiService {
  async generateWeeklyInsight(
    notes: DailyNote[],
    settings: LifeInsightSettings
  ): Promise<string> {
    return this.generatePeriodInsight(notes, settings, {
      range: "7",
      startDate: notes[0]?.date ?? "",
      endDate: notes[notes.length - 1]?.date ?? "",
      foundCount: notes.filter((note) => note.exists).length,
      missingCount: notes.filter((note) => !note.exists).length,
      coverageRate: 0
    });
  }

  async generatePeriodInsight(
    notes: DailyNote[],
    settings: LifeInsightSettings,
    rangeMeta: AnalysisRangeMeta
  ): Promise<string> {
    if (!settings.apiKey.trim()) {
      throw new Error("AI API Key is not configured.");
    }

    const prompt = this.buildPeriodInsightPrompt(notes, rangeMeta);
    const response = await requestUrl({
      url: `${settings.baseUrl.replace(/\/+$/, "")}/chat/completions`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are Life Insight, a careful life-change analyst. Find changes, trends, patterns, risks, growth and blind spots from journals. Never diagnose disease, predict destiny, or moralize. Return strict JSON only, with no markdown fences."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const content = response.json?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("AI provider returned an empty response.");
    }

    return content;
  }

  private buildPeriodInsightPrompt(
    notes: DailyNote[],
    rangeMeta: AnalysisRangeMeta
  ): string {
    const noteBlocks = notes
      .filter((note) => note.exists && note.content.trim())
      .map((note) => `## ${note.date}\n${note.content.trim()}`)
      .join("\n\n---\n\n");
    const rangeLabel =
      ANALYSIS_RANGES.find((item) => item.value === rangeMeta.range)?.label ??
      rangeMeta.range;

    return `请根据以下用户日记生成 Life Insight V2 洞察。

分析范围：${rangeLabel}
开始日期：${rangeMeta.startDate || "未知"}
结束日期：${rangeMeta.endDate || "未知"}
分析日记数量：${rangeMeta.foundCount}
缺失天数：${rangeMeta.missingCount}
覆盖率：${rangeMeta.coverageRate}%

本范围分析策略：
${this.getRangeStrategy(rangeMeta.range)}

核心目标：
- 发现用户没发现的变化、模式、问题、成长。
- 不要复述日记，不要摘抄长段原文，不要流水账总结。
- 输出优先级：变化 > 趋势 > 模式 > 风险 > 成长 > 建议 > 总结。

安全边界：
- 禁止输出医学诊断、人格诊断、命运预测、确定性失败/离婚/患病判断。
- 可以输出“存在焦虑倾向”“出现压力增加迹象”“建议关注情绪变化”“建议关注执行力下降”。
- 信息不足时必须保守判断，并把 confidence 设为 low。

可信度规则：
- high：连续20篇以上或跨多个阶段稳定出现。
- medium：连续5篇以上或有多条证据支持。
- low：单次出现或证据较弱。

只返回 JSON，不要 Markdown，不要代码块。JSON 结构如下：
{
  "overallState": "整体状态，用一句话概括，但不要停留在表层总结",
  "topics": [{ "name": "工作", "count": 3, "sentiment": "压力" }],
  "people": [{ "name": "某人", "count": 2, "sentiment": "积极" }],
  "emotionChanges": ["焦虑在后半段下降", "平静感开始增加"],
  "lifeChanges": [
    {
      "name": "感情话题",
      "direction": "up",
      "magnitude": "约240%",
      "reason": "稳定关系相关内容明显增加",
      "interpretation": "人生重心正在向关系建设迁移",
      "confidence": "medium"
    }
  ],
  "aiFindings": [
    {
      "type": "pattern",
      "title": "行动滞后",
      "evidence": "多次提到计划，但行动记录较少",
      "explanation": "目标意识强于执行闭环",
      "suggestion": "下周期重点记录行动次数和完成结果",
      "confidence": "medium"
    }
  ],
  "cycleInsight": "本周期最重要的一段洞察，聚焦用户没发现的变化",
  "insight": "一句最重要的 AI 发现",
  "highlight": "一句高光或关键片段的简短转述，不要大段摘抄",
  "confidence": "medium",
  "emotionScores": [
    {
      "date": "YYYY-MM-DD",
      "happy": 0,
      "anxiety": 0,
      "stress": 0,
      "tiredness": 0,
      "calm": 0
    }
  ]
}

日记内容：

${noteBlocks || "当前范围没有可分析的日记内容。"}`;
  }

  private getRangeStrategy(range: AnalysisRange): string {
    switch (range) {
      case "7":
        return "- 定位：本周复盘。\n- 重点：事件、人物、情绪。\n- 输出关注：本周高光、低谷、关键词、人物、下周关注。";
      case "15":
        return "- 定位：短期状态。\n- 重点：情绪状态、压力来源、快乐来源、近期烦恼。";
      case "30":
        return "- 定位：月度复盘。\n- 重点：变化分析。\n- 输出关注：本月关键词、本月变化、本月成长、本月问题。";
      case "60":
        return "- 定位：阶段变化。\n- 重点：人生重心变化。\n- 输出关注：过去 vs 现在。";
      case "90":
        return "- 定位：季度复盘。\n- 重点：成长趋势，覆盖职业、健康、感情、成长、生活、财务。";
      case "180":
        return "- 定位：人生阶段分析。\n- 重点：阶段转变。\n- 输出关注：什么进入了人生，什么离开了人生，什么变重要了，什么变不重要了。";
      case "365":
        return "- 定位：年度复盘。\n- 重点：年度故事线、年度关键词、成长、遗憾、收获。";
      case "all":
        return "- 定位：人生画像。\n- 重点：长期模式分析。\n- 输出关注：价值观、决策模式、成长模式、关系模式、情绪模式、职业模式。";
    }
  }
}
