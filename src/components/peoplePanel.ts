import type { PeopleInsight } from "../types/insight";

export function renderPeoplePanel(
  container: HTMLElement,
  people: PeopleInsight[]
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-4");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "高频人物"
  });

  if (!people.length) {
    panel.createDiv({
      cls: "life-insight-empty",
      text: "生成洞察后会显示高频人物。"
    });
    return;
  }

  const maxCount = Math.max(...people.map((person) => person.count), 1);
  const list = panel.createDiv("life-insight-list");

  for (const person of people.slice(0, 5)) {
    const row = list.createDiv("life-insight-person-row");
    row.createSpan({ text: person.name });
    const bar = row.createDiv("life-insight-bar");
    bar.createDiv("life-insight-bar-fill").setAttr(
      "style",
      `width: ${(person.count / maxCount) * 100}%`
    );
    row.createSpan({
      cls: "life-insight-muted",
      text: `${person.count}次`
    });
  }
}
