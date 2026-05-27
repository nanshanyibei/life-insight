import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { LifeInsightSettingTab } from "./settings";
import { AiService } from "./services/aiService";
import { DataStore } from "./services/dataStore";
import { EmotionService } from "./services/emotionService";
import { InsightService } from "./services/insightService";
import { NoteService } from "./services/noteService";
import type { LifeInsightSettings } from "./types/settings";
import { DEFAULT_SETTINGS } from "./types/settings";
import {
  DashboardView,
  LIFE_INSIGHT_VIEW_TYPE
} from "./views/dashboardView";

export default class LifeInsightPlugin extends Plugin {
  settings: LifeInsightSettings;
  private insightService: InsightService;
  private emotionService: EmotionService;

  async onload(): Promise<void> {
    await this.loadSettings();

    const dataStore = new DataStore(this.app.vault);
    this.emotionService = new EmotionService(dataStore);
    this.insightService = new InsightService(
      new NoteService(this.app.vault),
      new AiService(),
      dataStore,
      this.emotionService
    );

    this.registerView(
      LIFE_INSIGHT_VIEW_TYPE,
      (leaf: WorkspaceLeaf) =>
        new DashboardView(
          leaf,
          this.insightService,
          this.emotionService,
          () => this.settings
        )
    );

    this.addRibbonIcon("sparkles", "Open Life Insight", () => {
      void this.activateView();
    });

    this.addCommand({
      id: "open-life-insight-dashboard",
      name: "Open Life Insight Dashboard",
      callback: () => {
        void this.activateView();
      }
    });

    this.addCommand({
      id: "read-recent-daily-notes",
      name: "Read Recent 7 Daily Notes",
      callback: async () => {
        const result = await this.insightService.readRecentDailyNotes(
          this.settings
        );
        new Notice(
          `Life Insight: found ${result.foundCount}/${this.settings.lookbackDays} daily notes.`
        );
      }
    });

    this.addCommand({
      id: "generate-weekly-insight",
      name: "Generate Weekly Insight",
      callback: async () => {
        await this.activateView();
        const leaves = this.app.workspace.getLeavesOfType(LIFE_INSIGHT_VIEW_TYPE);
        const view = leaves[0]?.view;
        if (view instanceof DashboardView) {
          await view.render();
        }
      }
    });

    this.addSettingTab(new LifeInsightSettingTab(this.app, this));
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(LIFE_INSIGHT_VIEW_TYPE);
  }

  async activateView(): Promise<void> {
    const existingLeaves =
      this.app.workspace.getLeavesOfType(LIFE_INSIGHT_VIEW_TYPE);

    if (existingLeaves.length > 0) {
      this.app.workspace.revealLeaf(existingLeaves[0]);
      return;
    }

    const leaf = this.app.workspace.getRightLeaf(false);
    await leaf?.setViewState({
      type: LIFE_INSIGHT_VIEW_TYPE,
      active: true
    });

    if (leaf) {
      this.app.workspace.revealLeaf(leaf);
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(await this.loadData())
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
