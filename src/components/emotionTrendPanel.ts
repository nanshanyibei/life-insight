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
  const panel = container.createDiv("life-insight-panel life-insight-span-8");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "情绪趋势"
  });

  if (!scores.length) {
    panel.createDiv({
      cls: "life-insight-empty",
      text: "生成洞察后会保存情绪分数，并在这里显示最近趋势。"
    });
    return;
  }

  const latest = scores[scores.length - 1];
  const list = panel.createDiv("life-insight-list");

  for (const item of EMOTION_KEYS) {
    const value = latest[item.key];
    const row = list.createDiv("life-insight-emotion-row");
    row.createSpan({ text: item.label });
    const bar = row.createDiv("life-insight-bar");
    bar.createDiv("life-insight-bar-fill").setAttr("style", `width: ${value}%`);
    row.createSpan({
      cls: "life-insight-muted",
      text: String(value)
    });
  }
}
