import type { WeeklyInsight } from "../types/insight";

export function renderWeeklyInsightPanel(
  container: HTMLElement,
  insight: WeeklyInsight | null
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-8");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "本周洞察"
  });

  if (!insight) {
    panel.createDiv({
      cls: "life-insight-empty",
      text: "还没有生成本周洞察。点击右上角按钮后，会在这里看到本周总结、AI 洞察和高光时刻。"
    });
    return;
  }

  panel.createEl("p", {
    cls: "life-insight-insight-text",
    text: insight.overallState
  });

  panel.createEl("h4", {
    cls: "life-insight-panel-title",
    text: "AI 洞察"
  });
  panel.createEl("p", {
    cls: "life-insight-insight-text",
    text: insight.insight
  });

  panel.createEl("h4", {
    cls: "life-insight-panel-title",
    text: "高光时刻"
  });
  panel.createEl("p", {
    cls: "life-insight-insight-text",
    text: insight.highlight
  });
}
