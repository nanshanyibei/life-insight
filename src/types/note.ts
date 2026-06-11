export interface DailyNote {
  date: string;
  path: string;
  content: string;
  exists: boolean;
}

export interface DailyNotesReadResult {
  startDate: string;
  endDate: string;
  foundCount: number;
  missingCount: number;
  totalDays: number;
  coverageRate: number;
  notes: DailyNote[];
}
