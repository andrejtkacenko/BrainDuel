'use server';
/**
 * @fileOverview A question generation AI agent.
 *
 * - generateQuestions - A function that handles the question generation process.
 * - GenerateQuestionsInput - The input type for the generateQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Question} from '@/lib/types';

const GenerateQuestionsInputSchema = z.object({
  category: z.string().describe('The category of the questions to generate.'),
  count: z.number().describe('The number of questions to generate.'),
});
export type GenerateQuestionsInput = z.infer<
  typeof GenerateQuestionsInputSchema
>;

const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type GenerateQuestionsOutput = z.infer<
  typeof GenerateQuestionsOutputSchema
>;

export async function generateQuestions(
  input: GenerateQuestionsInput
): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `You are an expert quiz master. Generate {{count}} questions for the category "{{category}}".
For each question, provide 4 options and identify the correct answer.
Ensure the questions are challenging but not obscure.
Vary the difficulty of the questions.`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async (input: GenerateQuestionsInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
