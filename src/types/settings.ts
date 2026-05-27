export interface LifeInsightSettings {
  dailyNotesFolder: string;
  dateFormat: string;
  openaiApiKey: string;
  openaiModel: string;
  lookbackDays: number;
}

export const DEFAULT_SETTINGS: LifeInsightSettings = {
  dailyNotesFolder: "Daily Notes",
  dateFormat: "YYYY-MM-DD.md",
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",
  lookbackDays: 7
};
