import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { renderAiFindingsPanel } from "../components/aiFindingsPanel";
import { renderEmotionTrendPanel } from "../components/emotionTrendPanel";
import { renderLifeChangesPanel } from "../components/lifeChangesPanel";
import { renderPeoplePanel } from "../components/peoplePanel";
import { renderTopicPanel } from "../components/topicPanel";
import { renderWeeklyInsightPanel } from "../components/weeklyInsightPanel";
import type { EmotionScore } from "../types/emotion";
import type { PeriodInsight } from "../types/insight";
import type { DailyNotesReadResult } from "../types/note";
import type { AnalysisRange, LifeInsightSettings } from "../types/settings";
import { ANALYSIS_RANGES } from "../types/settings";
import { renderDailyNotesPreview } from "../ui/renderDailyNotesPreview";
import { renderLoadingState } from "../ui/renderLoadingState";
import { EmotionService } from "../services/emotionService";
import { InsightService } from "../services/insightService";

export const LIFE_INSIGHT_VIEW_TYPE = "life-insight-dashboard";

export class DashboardView extends ItemView {
  private selectedRange: AnalysisRange | null = null;

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
      const range = this.getSelectedRange(settings);
      const emotionDays = range === "all" ? 365 : Number.parseInt(range, 10);
      const [readResult, latestInsight, emotionScores] = await Promise.all([
        this.insightService.readDailyNotesByRange(settings, range),
        this.insightService.getLatestPeriodInsight(range),
        this.emotionService.getRecentScores(emotionDays)
      ]);

      this.renderDashboard(
        container,
        readResult,
        latestInsight,
        emotionScores,
        range
      );
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
    latestInsight: PeriodInsight | null,
    emotionScores: EmotionScore[],
    range: AnalysisRange
  ): void {
    const settings = this.getSettings();
    const rangeLabel = this.getRangeLabel(range);
    const header = container.createDiv("life-insight-header");
    const titleGroup = header.createDiv();
    titleGroup.createEl("h1", {
      cls: "life-insight-title",
      text: "Life Insight"
    });
    titleGroup.createDiv({
      cls: "life-insight-subtitle",
      text: `${readResult.startDate || "无记录"} ~ ${
        readResult.endDate || "无记录"
      } · 本地优先 · 无后端`
    });

    const actions = header.createDiv("life-insight-actions");
    const rangeSelect = actions.createEl("select", {
      cls: "life-insight-select"
    });
    for (const item of ANALYSIS_RANGES) {
      rangeSelect.createEl("option", {
        value: item.value,
        text: item.label
      });
    }
    rangeSelect.value = range;
    rangeSelect.addEventListener("change", () => {
      this.selectedRange = rangeSelect.value as AnalysisRange;
      settings.analysisRange = this.selectedRange;
      if (this.selectedRange !== "all") {
        settings.lookbackDays = Number.parseInt(this.selectedRange, 10);
      }
      void this.render();
    });

    const refreshButton = actions.createEl("button", { text: "刷新日记" });
    refreshButton.addEventListener("click", () => {
      void this.render();
    });

    const generateButton = actions.createEl("button", {
      cls: "life-insight-button-primary",
      text: "生成洞察"
    });
    generateButton.addEventListener("click", () => {
      void this.handleGenerateInsight();
    });

    const grid = container.createDiv("life-insight-grid");
    this.renderStatCard(
      grid,
      "记录天数",
      `${readResult.foundCount} / ${readResult.totalDays}`,
      "当前范围内找到的 Daily Notes"
    );
    this.renderStatCard(
      grid,
      "缺失天数",
      String(readResult.missingCount),
      "用于检查路径或日期格式"
    );
    this.renderStatCard(
      grid,
      "覆盖率",
      `${readResult.coverageRate}%`,
      "记录天数 / 范围天数"
    );
    this.renderStatCard(
      grid,
      "AI 模型",
      settings.model,
      `通过 ${settings.provider} 调用 AI`
    );
    this.renderStatCard(grid, "分析范围", rangeLabel, "可在顶部切换");

    renderEmotionTrendPanel(grid, emotionScores);
    renderTopicPanel(grid, latestInsight?.topics ?? []);
    renderPeoplePanel(grid, latestInsight?.people ?? []);
    renderLifeChangesPanel(grid, latestInsight?.lifeChanges ?? []);
    renderAiFindingsPanel(grid, latestInsight?.aiFindings ?? []);
    renderWeeklyInsightPanel(grid, latestInsight, {
      onCopy: (text) => this.copyText(text),
      onRegenerate: () => {
        void this.handleGenerateInsight();
      }
    });
    renderDailyNotesPreview(grid, readResult, rangeLabel);
  }

  private renderStatCard(
    container: HTMLElement,
    label: string,
    value: string,
    helper: string
  ): void {
    const panel = container.createDiv("life-insight-panel life-insight-span-stat");
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
    const range = this.getSelectedRange(this.getSettings());
    const container = this.containerEl.children[1] as HTMLElement;
    renderLoadingState(container, `正在分析${this.getRangeLabel(range)}日记...`);

    try {
      const readResult = await this.insightService.readDailyNotesByRange(
        this.getSettings(),
        range
      );
      if (readResult.foundCount === 0) {
        new Notice("Life Insight: 当前范围没有可分析的日记。");
        await this.render();
        return;
      }

      await this.insightService.generatePeriodInsight(this.getSettings(), range);
      new Notice("Life Insight: 洞察已生成。");
      await this.render();
    } catch (error) {
      new Notice(
        error instanceof Error ? error.message : "Life Insight: 生成失败。"
      );
      await this.render();
    }
  }

  private getSelectedRange(settings: LifeInsightSettings): AnalysisRange {
    if (!this.selectedRange) {
      this.selectedRange = settings.analysisRange;
    }

    return this.selectedRange;
  }

  private getRangeLabel(range: AnalysisRange): string {
    return ANALYSIS_RANGES.find((item) => item.value === range)?.label ?? range;
  }

  private copyText(text: string): void {
    void navigator.clipboard
      .writeText(text)
      .then(() => new Notice("Life Insight: 已复制。"))
      .catch(() => new Notice("Life Insight: 复制失败。"));
  }
}
