import type { DailyNotesReadResult } from "../types/note";
import type {
  AiFindingItem,
  InsightConfidence,
  LifeChangeItem,
  PeriodInsight,
  PeriodInsightDraft,
  WeeklyInsight,
  WeeklyInsightDraft
} from "../types/insight";
import type { AnalysisRange, LifeInsightSettings } from "../types/settings";
import { ANALYSIS_RANGES } from "../types/settings";
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

  async readDailyNotesByRange(
    settings: LifeInsightSettings,
    range: AnalysisRange
  ): Promise<DailyNotesReadResult> {
    return this.noteService.getDailyNotesByRange(settings, range);
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

  async generatePeriodInsight(
    settings: LifeInsightSettings,
    range: AnalysisRange
  ): Promise<PeriodInsight> {
    const readResult = await this.readDailyNotesByRange(settings, range);
    const rawInsight = await this.aiService.generatePeriodInsight(
      readResult.notes,
      settings,
      {
        range,
        startDate: readResult.startDate,
        endDate: readResult.endDate,
        foundCount: readResult.foundCount,
        missingCount: readResult.missingCount,
        coverageRate: readResult.coverageRate
      }
    );
    const draft = this.parsePeriodInsight(rawInsight);
    const insight: PeriodInsight = {
      id: `${range}_${readResult.startDate}_${readResult.endDate}`,
      periodType: range,
      rangeLabel: this.getRangeLabel(range),
      startDate: readResult.startDate,
      endDate: readResult.endDate,
      createdAt: new Date().toISOString(),
      overallState: draft.overallState,
      topics: draft.topics,
      people: draft.people,
      emotionChanges: draft.emotionChanges,
      lifeChanges: draft.lifeChanges,
      aiFindings: draft.aiFindings,
      cycleInsight: draft.cycleInsight,
      insight: draft.insight,
      highlight: draft.highlight,
      confidence: draft.confidence,
      emotionScores: draft.emotionScores
    };

    await this.dataStore.savePeriodInsight(insight);
    await this.emotionService.saveFromPeriodInsight(insight);

    return insight;
  }

  async getLatestWeeklyInsight(): Promise<WeeklyInsight | null> {
    return this.dataStore.getLatestWeeklyInsight();
  }

  async getLatestPeriodInsight(
    range: AnalysisRange
  ): Promise<PeriodInsight | null> {
    const periodInsight = await this.dataStore.getLatestPeriodInsight(range);
    if (periodInsight) {
      return periodInsight;
    }

    if (range !== "7") {
      return null;
    }

    const legacyInsight = await this.dataStore.getLatestWeeklyInsight();
    return legacyInsight ? this.convertLegacyInsight(legacyInsight) : null;
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

  private parsePeriodInsight(raw: string): PeriodInsightDraft {
    const jsonText = this.stripJsonFence(raw);
    const parsed = JSON.parse(jsonText) as Partial<PeriodInsightDraft>;

    return {
      overallState: parsed.overallState ?? "暂无整体状态。",
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      people: Array.isArray(parsed.people) ? parsed.people : [],
      emotionChanges: Array.isArray(parsed.emotionChanges)
        ? parsed.emotionChanges
        : [],
      lifeChanges: this.normalizeLifeChanges(parsed.lifeChanges),
      aiFindings: this.normalizeAiFindings(parsed.aiFindings),
      cycleInsight:
        parsed.cycleInsight ?? parsed.insight ?? "暂无本周期洞察。",
      insight: parsed.insight ?? parsed.cycleInsight ?? "暂无 AI 发现。",
      highlight: parsed.highlight ?? "暂无关键片段。",
      confidence: this.normalizeConfidence(parsed.confidence),
      emotionScores: Array.isArray(parsed.emotionScores)
        ? parsed.emotionScores
        : []
    };
  }

  private normalizeLifeChanges(value: unknown): LifeChangeItem[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => {
      const source = item as Partial<LifeChangeItem>;
      return {
        name: source.name ?? "未命名变化",
        direction: this.normalizeDirection(source.direction),
        magnitude: source.magnitude ?? "未知",
        reason: source.reason ?? "证据不足",
        interpretation: source.interpretation ?? "暂无解读",
        confidence: this.normalizeConfidence(source.confidence)
      };
    });
  }

  private normalizeAiFindings(value: unknown): AiFindingItem[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => {
      const source = item as Partial<AiFindingItem>;
      return {
        type: this.normalizeFindingType(source.type),
        title: source.title ?? "未命名发现",
        evidence: source.evidence ?? "证据不足",
        explanation: source.explanation ?? "暂无解释",
        suggestion: source.suggestion ?? "暂无建议",
        confidence: this.normalizeConfidence(source.confidence)
      };
    });
  }

  private normalizeConfidence(value: unknown): InsightConfidence {
    return value === "high" || value === "medium" || value === "low"
      ? value
      : "low";
  }

  private normalizeDirection(
    value: unknown
  ): LifeChangeItem["direction"] {
    return value === "up" ||
      value === "down" ||
      value === "flat" ||
      value === "new" ||
      value === "left"
      ? value
      : "flat";
  }

  private normalizeFindingType(value: unknown): AiFindingItem["type"] {
    return value === "change" ||
      value === "pattern" ||
      value === "risk" ||
      value === "blindspot" ||
      value === "growth" ||
      value === "anomaly"
      ? value
      : "pattern";
  }

  private convertLegacyInsight(insight: WeeklyInsight): PeriodInsight {
    return {
      id: `7_${insight.startDate}_${insight.endDate}`,
      periodType: "7",
      rangeLabel: this.getRangeLabel("7"),
      startDate: insight.startDate,
      endDate: insight.endDate,
      overallState: insight.overallState,
      topics: insight.topics,
      people: insight.people,
      emotionChanges: insight.emotionChanges,
      lifeChanges: [],
      aiFindings: [],
      cycleInsight: insight.insight,
      insight: insight.insight,
      highlight: insight.highlight,
      confidence: "low",
      createdAt: insight.createdAt,
      emotionScores: insight.emotionScores
    };
  }

  private getRangeLabel(range: AnalysisRange): string {
    return ANALYSIS_RANGES.find((item) => item.value === range)?.label ?? range;
  }

  private stripJsonFence(raw: string): string {
    return raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
  }
}
