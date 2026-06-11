import type { EmotionScore } from "./emotion";
import type { AnalysisRange } from "./settings";

export interface TopicInsight {
  name: string;
  count?: number;
  sentiment?: string;
}

export interface PeopleInsight {
  name: string;
  count: number;
  sentiment: string;
}

export interface WeeklyInsight {
  id: string;
  startDate: string;
  endDate: string;
  overallState: string;
  topics: TopicInsight[];
  people: PeopleInsight[];
  emotionChanges: string[];
  insight: string;
  highlight: string;
  createdAt: string;
  emotionScores?: EmotionScore[];
}

export interface WeeklyInsightDraft {
  overallState: string;
  topics: TopicInsight[];
  people: PeopleInsight[];
  emotionChanges: string[];
  insight: string;
  highlight: string;
  emotionScores?: EmotionScore[];
}

export type InsightConfidence = "high" | "medium" | "low";

export interface LifeChangeItem {
  name: string;
  direction: "up" | "down" | "flat" | "new" | "left";
  magnitude: string;
  reason: string;
  interpretation: string;
  confidence: InsightConfidence;
}

export interface AiFindingItem {
  type: "change" | "pattern" | "risk" | "blindspot" | "growth" | "anomaly";
  title: string;
  evidence: string;
  explanation: string;
  suggestion: string;
  confidence: InsightConfidence;
}

export interface PeriodInsight {
  id: string;
  periodType: AnalysisRange;
  rangeLabel: string;
  startDate: string;
  endDate: string;
  overallState: string;
  topics: TopicInsight[];
  people: PeopleInsight[];
  emotionChanges: string[];
  lifeChanges: LifeChangeItem[];
  aiFindings: AiFindingItem[];
  cycleInsight: string;
  insight: string;
  highlight: string;
  confidence: InsightConfidence;
  createdAt: string;
  emotionScores?: EmotionScore[];
}

export interface PeriodInsightDraft {
  overallState: string;
  topics: TopicInsight[];
  people: PeopleInsight[];
  emotionChanges: string[];
  lifeChanges: LifeChangeItem[];
  aiFindings: AiFindingItem[];
  cycleInsight: string;
  insight: string;
  highlight: string;
  confidence: InsightConfidence;
  emotionScores?: EmotionScore[];
}
