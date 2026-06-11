import { normalizePath, Vault } from "obsidian";
import type { EmotionScore } from "../types/emotion";
import type { PeriodInsight, WeeklyInsight } from "../types/insight";
import type { AnalysisRange } from "../types/settings";

const STORE_DIR = ".insight-plugin";
const WEEKLY_INSIGHTS_PATH = `${STORE_DIR}/weekly-insights.json`;
const PERIOD_INSIGHTS_PATH = `${STORE_DIR}/period-insights.json`;
const EMOTION_DATA_PATH = `${STORE_DIR}/emotion-data.json`;

export class DataStore {
  constructor(private readonly vault: Vault) {}

  async saveWeeklyInsight(insight: WeeklyInsight): Promise<void> {
    const insights = await this.readJson<WeeklyInsight[]>(WEEKLY_INSIGHTS_PATH, []);
    const nextInsights = [
      insight,
      ...insights.filter((item) => item.id !== insight.id)
    ];
    await this.writeJson(WEEKLY_INSIGHTS_PATH, nextInsights);
  }

  async getLatestWeeklyInsight(): Promise<WeeklyInsight | null> {
    const insights = await this.readJson<WeeklyInsight[]>(WEEKLY_INSIGHTS_PATH, []);
    return insights[0] ?? null;
  }

  async savePeriodInsight(insight: PeriodInsight): Promise<void> {
    const insights = await this.readJson<PeriodInsight[]>(PERIOD_INSIGHTS_PATH, []);
    const nextInsights = [
      insight,
      ...insights.filter((item) => item.id !== insight.id)
    ];
    await this.writeJson(PERIOD_INSIGHTS_PATH, nextInsights);
  }

  async getLatestPeriodInsight(
    range: AnalysisRange
  ): Promise<PeriodInsight | null> {
    const insights = await this.readJson<PeriodInsight[]>(PERIOD_INSIGHTS_PATH, []);
    return insights.find((item) => item.periodType === range) ?? null;
  }

  async saveEmotionScores(scores: EmotionScore[]): Promise<void> {
    const existingScores = await this.readJson<EmotionScore[]>(EMOTION_DATA_PATH, []);
    const byDate = new Map<string, EmotionScore>();

    for (const score of existingScores) {
      byDate.set(score.date, score);
    }

    for (const score of scores) {
      byDate.set(score.date, score);
    }

    const nextScores = Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    await this.writeJson(EMOTION_DATA_PATH, nextScores);
  }

  async getEmotionScores(): Promise<EmotionScore[]> {
    return this.readJson<EmotionScore[]>(EMOTION_DATA_PATH, []);
  }

  private async readJson<T>(path: string, fallback: T): Promise<T> {
    const normalizedPath = normalizePath(path);

    if (!(await this.vault.adapter.exists(normalizedPath))) {
      return fallback;
    }

    try {
      const raw = await this.vault.adapter.read(normalizedPath);
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private async writeJson(path: string, data: unknown): Promise<void> {
    await this.ensureStoreDir();
    await this.vault.adapter.write(
      normalizePath(path),
      `${JSON.stringify(data, null, 2)}\n`
    );
  }

  private async ensureStoreDir(): Promise<void> {
    const normalizedDir = normalizePath(STORE_DIR);
    if (!(await this.vault.adapter.exists(normalizedDir))) {
      await this.vault.adapter.mkdir(normalizedDir);
    }
  }
}
