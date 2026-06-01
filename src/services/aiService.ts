import { requestUrl } from "obsidian";
import type { DailyNote } from "../types/note";
import type { LifeInsightSettings } from "../types/settings";

export class AiService {
  async generateWeeklyInsight(
    notes: DailyNote[],
    settings: LifeInsightSettings
  ): Promise<string> {
    if (!settings.apiKey.trim()) {
      throw new Error("AI API Key is not configured.");
    }

    const prompt = this.buildWeeklyInsightPrompt(notes);
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
              "You are a concise life reflection analyst. Return strict JSON only, with no markdown fences."
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

  private buildWeeklyInsightPrompt(notes: DailyNote[]): string {
    const noteBlocks = notes
      .filter((note) => note.exists && note.content.trim())
      .map((note) => `## ${note.date}\n${note.content.trim()}`)
      .join("\n\n---\n\n");

    return `请根据以下用户最近 7 天日记内容生成本周人生报告。

要求：
- 不要鸡汤
- 不要心理医生口吻
- 保持简洁真实
- 只返回 JSON，不要 Markdown
- 如果信息不足，可以保守判断，但不要编造事实

JSON 结构：
{
  "overallState": "本周整体状态",
  "topics": [{ "name": "工作", "count": 3, "sentiment": "压力" }],
  "people": [{ "name": "Leader", "count": 2, "sentiment": "焦虑" }],
  "emotionChanges": ["周二低谷", "周五恢复"],
  "insight": "一句最重要的 AI 洞察",
  "highlight": "摘录最积极或最有力量的一段原文",
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

${noteBlocks || "最近 7 天没有可分析的日记内容。"}`;
  }
}
