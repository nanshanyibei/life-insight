import type { DailyNotesReadResult } from "../types/note";
import type { WeeklyInsight, WeeklyInsightDraft } from "../types/insight";
import type { LifeInsightSettings } from "../types/settings";
import { AiService } from "./aiService";
import { DataStore } from "./dataStore";
import { EmotionService } from "./emotionService";
import { NoteService } from "./noteService";

export class InsightService {
  constructor(
    private readonly noteService: NoteService,
    private readonly aiService: AiService,
    private readonly dataStore: DataStore,
    private readonly emotionService: EmotionService
  ) {}

  async readRecentDailyNotes(
    settings: LifeInsightSettings
  ): Promise<DailyNotesReadResult> {
    return this.noteService.getRecentDailyNotes(settings, settings.lookbackDays);
  }

  async generateWeeklyInsight(
    settings: LifeInsightSettings
  ): Promise<WeeklyInsight> {
    const readResult = await this.readRecentDailyNotes(settings);
    const rawInsight = await this.aiService.generateWeeklyInsight(
      readResult.notes,
      settings
    );
    const draft = this.parseWeeklyInsight(rawInsight);
    const insight: WeeklyInsight = {
      id: `${readResult.startDate}_${readResult.endDate}`,
      startDate: readResult.startDate,
      endDate: readResult.endDate,
      createdAt: new Date().toISOString(),
      overallState: draft.overallState,
      topics: draft.topics,
      people: draft.people,
      emotionChanges: draft.emotionChanges,
      insight: draft.insight,
      highlight: draft.highlight,
      emotionScores: draft.emotionScores
    };

    await this.dataStore.saveWeeklyInsight(insight);
    await this.emotionService.saveFromWeeklyInsight(insight);

    return insight;
  }

  async getLatestWeeklyInsight(): Promise<WeeklyInsight | null> {
    return this.dataStore.getLatestWeeklyInsight();
  }

  private parseWeeklyInsight(raw: string): WeeklyInsightDraft {
    const jsonText = this.stripJsonFence(raw);
    const parsed = JSON.parse(jsonText) as Partial<WeeklyInsightDraft>;

    return {
      overallState: parsed.overallState ?? "暂无整体状态。",
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      people: Array.isArray(parsed.people) ? parsed.people : [],
      emotionChanges: Array.isArray(parsed.emotionChanges)
        ? parsed.emotionChanges
        : [],
      insight: parsed.insight ?? "暂无洞察。",
      highlight: parsed.highlight ?? "暂无高光时刻。",
      emotionScores: Array.isArray(parsed.emotionScores)
        ? parsed.emotionScores
        : []
    };
  }

  private stripJsonFence(raw: string): string {
    return raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
  }
}
