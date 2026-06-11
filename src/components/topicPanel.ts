import type { TopicInsight } from "../types/insight";

export function renderTopicPanel(
  container: HTMLElement,
  topics: TopicInsight[]
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-6");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "高频主题"
  });

  if (!topics.length) {
    panel.createDiv({
      cls: "life-insight-empty",
      text: "生成洞察后会显示高频主题。"
    });
    return;
  }

  const list = panel.createDiv("life-insight-tag-list");
  for (const topic of topics) {
    list.createSpan({
      cls: "life-insight-tag",
      text: `${topic.name}${topic.count ? ` ${topic.count}` : ""}${
        topic.sentiment ? ` · ${topic.sentiment}` : ""
      }`
    });
  }
}
