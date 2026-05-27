import { App, PluginSettingTab, Setting } from "obsidian";
import type LifeInsightPlugin from "./main";

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
      text: "Life Insight 只读取本地 Vault。日记内容仅在你点击生成洞察时发送给你配置的 OpenAI API。"
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
      .setName("OpenAI API Key")
      .setDesc("保存在本地 Obsidian 插件配置中。")
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.openaiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.openaiApiKey = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("OpenAI model")
      .setDesc("默认 gpt-4o-mini。")
      .addText((text) =>
        text
          .setPlaceholder("gpt-4o-mini")
          .setValue(this.plugin.settings.openaiModel)
          .onChange(async (value) => {
            this.plugin.settings.openaiModel = value.trim() || "gpt-4o-mini";
            await this.plugin.saveSettings();
          })
      );
  }
}
