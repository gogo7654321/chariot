'use server';

import { generateFlashcards, type GenerateFlashcardsInput } from '@/ai/flows/flashcard-generator';

export async function generateFlashcardsAction(input: GenerateFlashcardsInput): Promise<{ flashcards: { question: string; answer: string; }[] }> {
  try {
    const result = await generateFlashcards(input);
    if (!result || !result.flashcards) {
        throw new Error('Invalid response from AI');
    }
    return result;
  } catch (error) {
    console.error("Error in generateFlashcardsAction:", error);
    throw new Error("Failed to generate flashcards.");
  }
}
