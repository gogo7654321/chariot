'use server';

/**
 * @fileOverview AI-powered topic recommendation tool.
 *
 * - topicRecommender - A function that recommends the most important topics to study next.
 * - TopicRecommenderInput - The input type for the topicRecommender function.
 * - TopicRecommenderOutput - The return type for the topicRecommender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TopicRecommenderInputSchema = z.object({
  courseName: z.string().describe('The name of the course.'),
  unitsCompleted: z.number().describe('The number of units completed in the course.'),
  examDate: z.string().describe('The date of the upcoming exam (YYYY-MM-DD).'),
  studyHistory: z.string().describe('A summary of the student\'s study history, including topics studied and scores achieved.'),
  learningGoals: z.string().describe('Description of the student learning goals.'),
});
export type TopicRecommenderInput = z.infer<typeof TopicRecommenderInputSchema>;

const TopicRecommenderOutputSchema = z.object({
  recommendedTopics: z.string().describe('A list of recommended topics to study next, prioritized by importance.'),
  reasoning: z.string().describe('The AI reasoning behind the topic recommendations.'),
});
export type TopicRecommenderOutput = z.infer<typeof TopicRecommenderOutputSchema>;

export async function topicRecommender(input: TopicRecommenderInput): Promise<TopicRecommenderOutput> {
  return topicRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'topicRecommenderPrompt',
  input: {schema: TopicRecommenderInputSchema},
  output: {schema: TopicRecommenderOutputSchema},
  prompt: `You are an AI-powered study tool that recommends the most important topics for a student to study next, based on their course progress, exam date, study history and goals.

  Course Name: {{{courseName}}}
  Units Completed: {{{unitsCompleted}}}
  Exam Date: {{{examDate}}}
  Study History: {{{studyHistory}}}
  Learning Goals: {{{learningGoals}}}

  Based on this information, what topics should the student prioritize studying next? Explain your reasoning, and list the recommended topics in order of importance.
  `,
});

const topicRecommenderFlow = ai.defineFlow(
  {
    name: 'topicRecommenderFlow',
    inputSchema: TopicRecommenderInputSchema,
    outputSchema: TopicRecommenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
