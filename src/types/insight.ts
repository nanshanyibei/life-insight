import type { EmotionScore } from "./emotion";

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
