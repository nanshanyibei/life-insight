import { normalizePath, TFile, TFolder, Vault } from "obsidian";
import type { DailyNote, DailyNotesReadResult } from "../types/note";
import type { AnalysisRange, LifeInsightSettings } from "../types/settings";
import { DateService } from "./dateService";

export class NoteService {
  private readonly dateService: DateService;

  constructor(
    private readonly vault: Vault,
    dateService?: DateService
  ) {
    this.dateService = dateService ?? new DateService();
  }

  async getRecentDailyNotes(
    settings: LifeInsightSettings,
    days = settings.lookbackDays
  ): Promise<DailyNotesReadResult> {
    const dates = this.dateService.getRecentDates(days);
    const notes = await Promise.all(
      dates.map((date) => this.readDailyNote(settings, date))
    );
    const foundCount = notes.filter((note) => note.exists).length;
    const { startDate, endDate } = this.dateService.getRangeLabel(dates);

    return {
      startDate,
      endDate,
      foundCount,
      missingCount: notes.length - foundCount,
      totalDays: notes.length,
      coverageRate: this.calculateCoverage(foundCount, notes.length),
      notes
    };
  }

  async getDailyNotesByRange(
    settings: LifeInsightSettings,
    range: AnalysisRange
  ): Promise<DailyNotesReadResult> {
    if (range === "all") {
      return this.getAllDailyNotes(settings);
    }

    return this.getRecentDailyNotes(settings, Number.parseInt(range, 10));
  }

  private async readDailyNote(
    settings: LifeInsightSettings,
    date: string
  ): Promise<DailyNote> {
    const path = this.buildDailyNotePath(settings, date);
    const file = this.vault.getAbstractFileByPath(path);

    if (!(file instanceof TFile)) {
      return {
        date,
        path,
        content: "",
        exists: false
      };
    }

    return {
      date,
      path,
      content: await this.vault.read(file),
      exists: true
    };
  }

  private buildDailyNotePath(settings: LifeInsightSettings, date: string): string {
    const fileName = settings.dateFormat.replace("YYYY-MM-DD", date);
    return normalizePath(`${settings.dailyNotesFolder}/${fileName}`);
  }

  private async getAllDailyNotes(
    settings: LifeInsightSettings
  ): Promise<DailyNotesReadResult> {
    const folderPath = normalizePath(settings.dailyNotesFolder);
    const folder = this.vault.getAbstractFileByPath(folderPath);

    if (!(folder instanceof TFolder)) {
      return {
        startDate: "",
        endDate: "",
        foundCount: 0,
        missingCount: 0,
        totalDays: 0,
        coverageRate: 0,
        notes: []
      };
    }

    const files = this.collectFiles(folder);
    const datePattern = this.createDatePattern(normalizePath(settings.dateFormat));
    const matchedFiles = files
      .map((file) => {
        const relativePath = normalizePath(file.path).slice(folderPath.length + 1);
        const match = relativePath.match(datePattern);
        const groups = match?.groups;
        const date =
          groups?.year && groups.month && groups.day
            ? `${groups.year}-${groups.month}-${groups.day}`
            : "";

        return date
          ? {
              date,
              file
            }
          : null;
      })
      .filter(
        (item): item is { date: string; file: TFile } =>
          item !== null && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    const notes = await Promise.all(
      matchedFiles.map(async ({ date, file }) => ({
        date,
        path: file.path,
        content: await this.vault.read(file),
        exists: true
      }))
    );

    const { startDate, endDate } = this.dateService.getRangeLabel(
      notes.map((note) => note.date)
    );

    return {
      startDate,
      endDate,
      foundCount: notes.length,
      missingCount: 0,
      totalDays: notes.length,
      coverageRate: notes.length ? 100 : 0,
      notes
    };
  }

  private collectFiles(folder: TFolder): TFile[] {
    const files: TFile[] = [];

    for (const child of folder.children) {
      if (child instanceof TFile) {
        files.push(child);
      } else if (child instanceof TFolder) {
        files.push(...this.collectFiles(child));
      }
    }

    return files;
  }

  private createDatePattern(dateFormat: string): RegExp {
    const escaped = dateFormat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = escaped
      .replace("YYYY", "(?<year>\\d{4})")
      .replace("MM", "(?<month>\\d{2})")
      .replace("DD", "(?<day>\\d{2})");

    return new RegExp(`^${pattern}$`);
  }

  private calculateCoverage(foundCount: number, totalDays: number): number {
    if (totalDays <= 0) {
      return 0;
    }

    return Math.round((foundCount / totalDays) * 100);
  }
}
