'use server';

/**
 * @fileOverview An AI chat assistant for health-related questions and suggestions.
 *
 * - aiChatAssistant - A function that handles the chat assistant process.
 * - AIChatAssistantInput - The input type for the aiChatAssistant function.
 * - AIChatAssistantOutput - The return type for the aiChatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatAssistantInputSchema = z.object({
  message: z.string().describe('The user message to the AI assistant.'),
  healthStats: z.string().optional().describe('The current health stats of the user.'),
  tasks: z.string().optional().describe('The current tasks of the user.'),
  chatHistory: z.string().optional().describe('The chat history of the user.'),
});
export type AIChatAssistantInput = z.infer<typeof AIChatAssistantInputSchema>;

const AIChatAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant.'),
  suggestions: z.array(z.string()).optional().describe('Suggestions from the AI assistant based on the input.'),
});
export type AIChatAssistantOutput = z.infer<typeof AIChatAssistantOutputSchema>;

export async function aiChatAssistant(input: AIChatAssistantInput): Promise<AIChatAssistantOutput> {
  return aiChatAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatAssistantPrompt',
  input: {schema: AIChatAssistantInputSchema},
  output: {schema: AIChatAssistantOutputSchema},
  prompt: `You are a personal health assistant. Your role is to answer user questions and provide relevant suggestions based on their tracked data and current context.

  Here is the user's message: {{{message}}}
  Here are the user's health stats: {{{healthStats}}}
  Here are the user's tasks: {{{tasks}}}
  Here is the user's chat history: {{{chatHistory}}}

  Based on the above information, provide a helpful and informative response. Include relevant suggestions, such as hydration tips or exercise recommendations, when appropriate.
  Format your response as a JSON object with a "response" field containing your answer and a "suggestions" field containing an array of suggestions.
  If no suggestions are available, omit the "suggestions" field.
`,
});

const aiChatAssistantFlow = ai.defineFlow(
  {
    name: 'aiChatAssistantFlow',
    inputSchema: AIChatAssistantInputSchema,
    outputSchema: AIChatAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
