import { App, PluginSettingTab, Setting } from "obsidian";
import type LifeInsightPlugin from "./main";
import { PROVIDER_DEFAULTS } from "./types/settings";
import type { AiProvider } from "./types/settings";

export class LifeInsightSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: LifeInsightPlugin
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Life Insight Settings" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Life Insight 只读取本地 Vault。日记内容仅在你点击生成洞察时发送给你配置的 AI Provider。"
    });

    new Setting(containerEl)
      .setName("Daily Notes folder")
      .setDesc("Vault 内 Daily Notes 文件夹路径。")
      .addText((text) =>
        text
          .setPlaceholder("Daily Notes")
          .setValue(this.plugin.settings.dailyNotesFolder)
          .onChange(async (value) => {
            this.plugin.settings.dailyNotesFolder = value.trim() || "Daily Notes";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Date format")
      .setDesc("MVP 支持 YYYY、MM、DD 占位符，例如 YYYY-MM-DD.md。")
      .addText((text) =>
        text
          .setPlaceholder("YYYY-MM-DD.md")
          .setValue(this.plugin.settings.dateFormat)
          .onChange(async (value) => {
            this.plugin.settings.dateFormat = value.trim() || "YYYY-MM-DD.md";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Lookback days")
      .setDesc("默认读取最近 7 天。")
      .addText((text) =>
        text
          .setPlaceholder("7")
          .setValue(String(this.plugin.settings.lookbackDays))
          .onChange(async (value) => {
            const parsed = Number.parseInt(value, 10);
            this.plugin.settings.lookbackDays =
              Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("AI Provider")
      .setDesc("选择 OpenAI 或 SiliconFlow。切换时会填入该 Provider 的默认 Base URL 和 Model。")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("openai", "OpenAI")
          .addOption("siliconflow", "SiliconFlow")
          .setValue(this.plugin.settings.provider)
          .onChange(async (value) => {
            const provider = value as AiProvider;
            this.plugin.settings.provider = provider;
            this.plugin.settings.baseUrl = PROVIDER_DEFAULTS[provider].baseUrl;
            this.plugin.settings.model = PROVIDER_DEFAULTS[provider].model;
            await this.plugin.saveSettings();
            this.display();
          })
      );

    new Setting(containerEl)
      .setName("Base URL")
      .setDesc("兼容 OpenAI Chat Completions 的 API 地址。")
      .addText((text) =>
        text
          .setPlaceholder(PROVIDER_DEFAULTS[this.plugin.settings.provider].baseUrl)
          .setValue(this.plugin.settings.baseUrl)
          .onChange(async (value) => {
            this.plugin.settings.baseUrl =
              value.trim() || PROVIDER_DEFAULTS[this.plugin.settings.provider].baseUrl;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("API Key")
      .setDesc("保存在本地 Obsidian 插件配置中。")
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Model")
      .setDesc("当前 Provider 的模型名称。")
      .addText((text) =>
        text
          .setPlaceholder(PROVIDER_DEFAULTS[this.plugin.settings.provider].model)
          .setValue(this.plugin.settings.model)
          .onChange(async (value) => {
            this.plugin.settings.model =
              value.trim() || PROVIDER_DEFAULTS[this.plugin.settings.provider].model;
            await this.plugin.saveSettings();
          })
      );
  }
}
