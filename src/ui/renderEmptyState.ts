export function renderEmptyState(container: HTMLElement, message: string): void {
  container.createDiv({
    cls: "life-insight-empty",
    text: message
  });
}
