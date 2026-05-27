export function renderLoadingState(container: HTMLElement, message: string): void {
  container.empty();
  const wrapper = container.createDiv("life-insight-empty");
  wrapper.setText(message);
}
