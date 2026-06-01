export type AiProvider = "openai" | "siliconflow";

export interface LifeInsightSettings {
  dailyNotesFolder: string;
  dateFormat: string;
  provider: AiProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  lookbackDays: number;
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
  lookbackDays: 7
};
