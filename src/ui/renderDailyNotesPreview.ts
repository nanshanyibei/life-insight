import type { DailyNotesReadResult } from "../types/note";

export function renderDailyNotesPreview(
  container: HTMLElement,
  readResult: DailyNotesReadResult,
  rangeLabel: string
): void {
  const panel = container.createDiv("life-insight-panel life-insight-span-12");
  panel.createEl("h3", {
    cls: "life-insight-panel-title",
    text: `${rangeLabel} Daily Notes`
  });

  const list = panel.createDiv("life-insight-note-list");
  const notes = readResult.notes.slice(-30);

  for (const note of notes) {
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

  if (readResult.notes.length > notes.length) {
    panel.createDiv({
      cls: "life-insight-muted",
      text: `仅预览最近 ${notes.length} 篇，共 ${readResult.notes.length} 篇。`
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
