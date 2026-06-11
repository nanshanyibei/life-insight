import type { LifeChangeItem } from "../types/insight";

const DIRECTION_LABELS: Record<LifeChangeItem["direction"], string> = {
  up: "上升",
  down: "下降",
  flat: "持平",
  new: "新出现",
  left: "离开"
};

export function renderLifeChangesPanel(
  container: HTMLElement,
  changes: LifeChangeItem[]
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-12");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "人生变化"
  });

  if (!changes.length) {
    panel.createDiv({
      cls: "life-insight-empty",
      text: "生成 V2 洞察后，这里会显示主题、人物、情绪、目标和生活结构的变化。"
    });
    return;
  }

  const list = panel.createDiv("life-insight-card-list");
  for (const change of changes) {
    const item = list.createDiv("life-insight-change-item");
    const header = item.createDiv("life-insight-item-header");
    header.createSpan({
      cls: "life-insight-item-title",
      text: change.name
    });
    header.createSpan({
      cls: "life-insight-pill",
      text: `${DIRECTION_LABELS[change.direction]} ${change.magnitude}`
    });
    item.createDiv({
      cls: "life-insight-muted",
      text: `原因：${change.reason}`
    });
    item.createDiv({
      cls: "life-insight-insight-text",
      text: change.interpretation
    });
    item.createDiv({
      cls: "life-insight-confidence",
      text: `可信度：${renderConfidence(change.confidence)}`
    });
  }
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
