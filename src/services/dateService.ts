export class DateService {
  getRecentDates(days: number, baseDate: Date = new Date()): string[] {
    const dates: string[] = [];
    const normalizedBaseDate = new Date(baseDate);
    normalizedBaseDate.setHours(0, 0, 0, 0);

    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date(normalizedBaseDate);
      date.setDate(normalizedBaseDate.getDate() - offset);
      dates.push(this.formatDate(date, "YYYY-MM-DD"));
    }

    return dates;
  }

  formatDate(date: Date, format: string): string {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return format
      .replace(/YYYY/g, year)
      .replace(/MM/g, month)
      .replace(/DD/g, day);
  }

  getRangeLabel(dates: string[]): { startDate: string; endDate: string } {
    return {
      startDate: dates[0] ?? "",
      endDate: dates[dates.length - 1] ?? ""
    };
  }
}
