import type { AiFindingItem } from "../types/insight";

const FINDING_LABELS: Record<AiFindingItem["type"], string> = {
  change: "变化",
  pattern: "模式",
  risk: "风险",
  blindspot: "盲区",
  growth: "成长",
  anomaly: "异常"
};

export function renderAiFindingsPanel(
  container: HTMLElement,
  findings: AiFindingItem[]
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-12");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "AI 发现"
  });

  if (!findings.length) {
    panel.createDiv({
      cls: "life-insight-empty",
      text: "生成 V2 洞察后，这里会显示变化、模式、风险、盲区、成长和异常。"
    });
    return;
  }

  const list = panel.createDiv("life-insight-card-list");
  for (const finding of findings) {
    const item = list.createDiv("life-insight-finding-item");
    const header = item.createDiv("life-insight-item-header");
    header.createSpan({
      cls: "life-insight-item-title",
      text: finding.title
    });
    header.createSpan({
      cls: "life-insight-pill",
      text: FINDING_LABELS[finding.type]
    });
    item.createDiv({
      cls: "life-insight-muted",
      text: `证据：${finding.evidence}`
    });
    item.createDiv({
      cls: "life-insight-insight-text",
      text: finding.explanation
    });
    item.createDiv({
      cls: "life-insight-muted",
      text: `建议：${finding.suggestion}`
    });
    item.createDiv({
      cls: "life-insight-confidence",
      text: `可信度：${renderConfidence(finding.confidence)}`
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
