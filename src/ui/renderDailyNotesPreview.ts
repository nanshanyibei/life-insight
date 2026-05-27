import type { DailyNotesReadResult } from "../types/note";

export function renderDailyNotesPreview(
  container: HTMLElement,
  readResult: DailyNotesReadResult
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-12");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: "最近 7 天 Daily Notes"
  });

  const list = panel.createDiv("life-insight-note-list");

  for (const note of readResult.notes) {
    const item = list.createDiv("life-insight-note-item");
    const meta = item.createDiv("life-insight-note-meta");
    meta.createSpan({
      cls: "life-insight-note-date",
      text: note.date
    });
    meta.createSpan({
      cls: "life-insight-note-path",
      text: note.exists ? note.path : "未找到"
    });

    item.createDiv({
      cls: "life-insight-note-excerpt",
      text: note.exists
        ? createExcerpt(note.content)
        : "这一天没有匹配到 Daily Note。"
    });
  }
}

function createExcerpt(content: string): string {
  const normalized = content.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "这篇日记是空的。";
  }

  return normalized.length > 160
    ? `${normalized.slice(0, 160)}...`
    : normalized;
}
