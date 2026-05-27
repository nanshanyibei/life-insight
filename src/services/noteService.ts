import { normalizePath, TFile, Vault } from "obsidian";
import type { DailyNote, DailyNotesReadResult } from "../types/note";
import type { LifeInsightSettings } from "../types/settings";
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
      notes
    };
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
}
