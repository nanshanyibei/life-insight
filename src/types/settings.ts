export type AiProvider = "openai" | "siliconflow";
export type AnalysisRange = "7" | "15" | "30" | "60" | "90" | "180" | "365" | "all";

export const ANALYSIS_RANGES: Array<{
  value: AnalysisRange;
  label: string;
}> = [
  { value: "7", label: "最近7天" },
  { value: "15", label: "最近15天" },
  { value: "30", label: "最近30天" },
  { value: "60", label: "最近60天" },
  { value: "90", label: "最近90天" },
  { value: "180", label: "最近180天" },
  { value: "365", label: "最近365天" },
  { value: "all", label: "全部记录" }
];

export interface LifeInsightSettings {
  dailyNotesFolder: string;
  dateFormat: string;
  provider: AiProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  lookbackDays: number;
  analysisRange: AnalysisRange;
}

export const PROVIDER_DEFAULTS: Record<
  AiProvider,
  Pick<LifeInsightSettings, "baseUrl" | "model">
> = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini"
  },
  siliconflow: {
    baseUrl: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-V4-Flash"
  }
};

export const DEFAULT_SETTINGS: LifeInsightSettings = {
  dailyNotesFolder: "Daily Notes",
  dateFormat: "YYYY-MM-DD.md",
  provider: "openai",
  apiKey: "",
  baseUrl: PROVIDER_DEFAULTS.openai.baseUrl,
  model: PROVIDER_DEFAULTS.openai.model,
  lookbackDays: 30,
  analysisRange: "30"
};
