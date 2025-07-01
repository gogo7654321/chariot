'use server';

import { topicRecommender, type TopicRecommenderInput, type TopicRecommenderOutput } from '@/ai/flows/topic-recommender';

export async function recommendTopicAction(input: TopicRecommenderInput): Promise<TopicRecommenderOutput> {
  try {
    const result = await topicRecommender(input);
    if (!result || !result.recommendedTopics) {
        throw new Error('Invalid response from AI');
    }
    return result;
  } catch (error) {
    console.error("Error in recommendTopicAction:", error);
    throw new Error("Failed to get topic recommendation.");
  }
}
