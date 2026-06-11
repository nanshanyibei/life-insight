import type { EmotionScore } from "../types/emotion";
import type { PeriodInsight, WeeklyInsight } from "../types/insight";
import { DataStore } from "./dataStore";

export class EmotionService {
  constructor(private readonly dataStore: DataStore) {}

  async saveFromWeeklyInsight(insight: WeeklyInsight): Promise<void> {
    await this.saveScores(insight);
  }

  async saveFromPeriodInsight(insight: PeriodInsight): Promise<void> {
    await this.saveScores(insight);
  }

  private async saveScores(
    insight: Pick<WeeklyInsight | PeriodInsight, "emotionScores">
  ): Promise<void> {
    if (!insight.emotionScores?.length) {
      return;
    }

    await this.dataStore.saveEmotionScores(
      insight.emotionScores.map((score) => this.normalizeScore(score))
    );
  }

  async getRecentScores(days: number): Promise<EmotionScore[]> {
    const scores = await this.dataStore.getEmotionScores();
    return scores.slice(Math.max(scores.length - days, 0));
  }

  private normalizeScore(score: EmotionScore): EmotionScore {
    return {
      date: score.date,
      happy: this.clamp(score.happy),
      anxiety: this.clamp(score.anxiety),
      stress: this.clamp(score.stress),
      tiredness: this.clamp(score.tiredness),
      calm: this.clamp(score.calm)
    };
  }

  private clamp(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round(value)));
  }
}
