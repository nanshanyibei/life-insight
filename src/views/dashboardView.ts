import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { renderEmotionTrendPanel } from "../components/emotionTrendPanel";
import { renderPeoplePanel } from "../components/peoplePanel";
import { renderTopicPanel } from "../components/topicPanel";
import { renderWeeklyInsightPanel } from "../components/weeklyInsightPanel";
import type { EmotionScore } from "../types/emotion";
import type { WeeklyInsight } from "../types/insight";
import type { DailyNotesReadResult } from "../types/note";
import type { LifeInsightSettings } from "../types/settings";
import { renderDailyNotesPreview } from "../ui/renderDailyNotesPreview";
import { renderLoadingState } from "../ui/renderLoadingState";
import { EmotionService } from "../services/emotionService";
import { InsightService } from "../services/insightService";

export const LIFE_INSIGHT_VIEW_TYPE = "life-insight-dashboard";

export class DashboardView extends ItemView {
  constructor(
    leaf: WorkspaceLeaf,
    private readonly insightService: InsightService,
    private readonly emotionService: EmotionService,
    private readonly getSettings: () => LifeInsightSettings
  ) {
    super(leaf);
  }

  getViewType(): string {
    return LIFE_INSIGHT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Life Insight";
  }

  getIcon(): string {
    return "sparkles";
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async render(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("life-insight-view");

    try {
      const settings = this.getSettings();
      const [readResult, latestInsight, emotionScores] = await Promise.all([
        this.insightService.readRecentDailyNotes(settings),
        this.insightService.getLatestWeeklyInsight(),
        this.emotionService.getRecentScores(7)
      ]);

      this.renderDashboard(container, readResult, latestInsight, emotionScores);
    } catch (error) {
      renderLoadingState(
        container,
        error instanceof Error ? error.message : "Life Insight failed to load."
      );
    }
  }

  private renderDashboard(
    container: HTMLElement,
    readResult: DailyNotesReadResult,
    latestInsight: WeeklyInsight | null,
    emotionScores: EmotionScore[]
  ): void {
    const settings = this.getSettings();
    const header = container.createDiv("life-insight-header");
    const titleGroup = header.createDiv();
    titleGroup.createEl("h1", {
      cls: "life-insight-title",
      text: "Life Insight"
    });
    titleGroup.createDiv({
      cls: "life-insight-subtitle",
      text: `${readResult.startDate} ~ ${readResult.endDate} · 本地优先 · 无后端`
    });

    const actions = header.createDiv("life-insight-actions");
    const refreshButton = actions.createEl("button", { text: "刷新日记" });
    refreshButton.addEventListener("click", () => {
      void this.render();
    });

    const generateButton = actions.createEl("button", {
      cls: "life-insight-button-primary",
      text: "生成本周洞察"
    });
    generateButton.addEventListener("click", () => {
      void this.handleGenerateInsight();
    });

    const grid = container.createDiv("life-insight-grid");
    this.renderStatCard(grid, "记录天数", `${readResult.foundCount} / ${settings.lookbackDays}`, "最近周期内找到的 Daily Notes");
    this.renderStatCard(grid, "缺失天数", String(readResult.missingCount), "用于检查路径或日期格式");
    this.renderStatCard(grid, "AI 模型", settings.model, `通过 ${settings.provider} 调用 AI`);
    this.renderStatCard(grid, "本地保存", ".insight-plugin", "洞察结果保存在 Vault 内");

    renderEmotionTrendPanel(grid, emotionScores);
    renderTopicPanel(grid, latestInsight?.topics ?? []);
    renderPeoplePanel(grid, latestInsight?.people ?? []);
    renderWeeklyInsightPanel(grid, latestInsight);
    renderDailyNotesPreview(grid, readResult);
  }

  private renderStatCard(
    container: HTMLElement,
    label: string,
    value: string,
    helper: string
  ): void {
    const panel = container.createDiv("life-insight-panel life-insight-span-3");
    panel.createDiv({
      cls: "life-insight-stat-label",
      text: label
    });
    panel.createDiv({
      cls: "life-insight-stat-value",
      text: value
    });
    panel.createDiv({
      cls: "life-insight-stat-label",
      text: helper
    });
  }

  private async handleGenerateInsight(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    renderLoadingState(container, "正在分析最近 7 天日记...");

    try {
      await this.insightService.generateWeeklyInsight(this.getSettings());
      new Notice("Life Insight: 本周洞察已生成。");
      await this.render();
    } catch (error) {
      new Notice(
        error instanceof Error ? error.message : "Life Insight: 生成失败。"
      );
      await this.render();
    }
  }
}
