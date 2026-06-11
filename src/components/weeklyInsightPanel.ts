import type { PeriodInsight } from "../types/insight";

export interface PeriodInsightPanelActions {
  onCopy: (text: string) => void;
  onRegenerate: () => void;
}

export function renderWeeklyInsightPanel(
  container: HTMLElement,
  insight: PeriodInsight | null,
  actions: PeriodInsightPanelActions
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-12");
  const header = panel.createDiv("life-insight-panel-header");
  header.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "本周期洞察"
  });

  const actionGroup = header.createDiv("life-insight-panel-actions");
  const copyButton = actionGroup.createEl("button", { text: "复制" });
  const regenerateButton = actionGroup.createEl("button", { text: "重新生成" });
  const toggleButton = actionGroup.createEl("button", { text: "折叠" });

  const body = panel.createDiv("life-insight-collapsible");

  regenerateButton.addEventListener("click", () => {
    actions.onRegenerate();
  });

  toggleButton.addEventListener("click", () => {
    const collapsed = body.classList.contains("is-collapsed");
    body.classList.toggle("is-collapsed", !collapsed);
    toggleButton.setText(collapsed ? "折叠" : "展开");
  });

  if (!insight) {
    copyButton.disabled = true;
    body.createDiv({
      cls: "life-insight-empty",
      text: "还没有生成本周期洞察。点击右上角“生成洞察”后，会在这里看到 V2 洞察。"
    });
    return;
  }

  const copyText = [
    `# ${insight.rangeLabel} Life Insight`,
    "",
    insight.cycleInsight,
    "",
    `AI 发现：${insight.insight}`,
    `关键片段：${insight.highlight}`,
    `可信度：${renderConfidence(insight.confidence)}`
  ].join("\n");

  copyButton.addEventListener("click", () => {
    actions.onCopy(copyText);
  });

  body.createEl("p", {
    cls: "life-insight-insight-text",
    text: insight.overallState
  });

  body.createEl("h4", {
    cls: "life-insight-panel-title",
    text: "周期洞察"
  });
  body.createEl("p", {
    cls: "life-insight-insight-text",
    text: insight.cycleInsight
  });

  body.createEl("h4", {
    cls: "life-insight-panel-title",
    text: "AI 发现"
  });
  body.createEl("p", {
    cls: "life-insight-insight-text",
    text: insight.insight
  });

  body.createEl("h4", {
    cls: "life-insight-panel-title",
    text: "关键片段"
  });
  body.createEl("p", {
    cls: "life-insight-insight-text",
    text: insight.highlight
  });

  body.createDiv({
    cls: "life-insight-confidence",
    text: `可信度：${renderConfidence(insight.confidence)}`
  });
}

function renderConfidence(confidence: string): string {
  if (confidence === "high") {
    return "高";
  }

  if (confidence === "medium") {
    return "中";
  }

  return "低";
}
