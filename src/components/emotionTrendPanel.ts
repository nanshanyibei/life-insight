import type { EmotionScore } from "../types/emotion";

const EMOTION_KEYS: Array<{
  key: keyof Omit<EmotionScore, "date">;
  label: string;
}> = [
  { key: "happy", label: "快乐" },
  { key: "anxiety", label: "焦虑" },
  { key: "stress", label: "压力" },
  { key: "tiredness", label: "疲惫" },
  { key: "calm", label: "平静" }
];

export function renderEmotionTrendPanel(
  container: HTMLElement,
  scores: EmotionScore[]
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-12");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "情绪趋势"
  });

  if (!scores.length) {
    panel.createDiv({
      cls: "life-insight-empty",
      text: "生成洞察后会保存情绪分数，并在这里按日展示趋势。"
    });
    return;
  }

  const table = panel.createDiv("life-insight-emotion-table");
  const header = table.createDiv("life-insight-emotion-table-row is-header");
  header.createSpan({ text: "日期" });
  for (const item of EMOTION_KEYS) {
    header.createSpan({ text: item.label });
  }

  for (const score of scores) {
    const row = table.createDiv("life-insight-emotion-table-row");
    row.createSpan({ text: score.date.slice(5) || score.date });
    for (const item of EMOTION_KEYS) {
      const cell = row.createDiv("life-insight-emotion-cell");
      const value = score[item.key];
      cell.createDiv("life-insight-bar").createDiv("life-insight-bar-fill").setAttr(
        "style",
        `width: ${value}%`
      );
      cell.createSpan({
        cls: "life-insight-muted",
        text: String(value)
      });
    }
  }
}
