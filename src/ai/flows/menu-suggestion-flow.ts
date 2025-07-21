
'use server';
/**
 * @fileOverview A menu suggestion AI flow.
 *
 * - suggestMenuItem - A function that suggests a menu item based on a theme.
 * - SuggestMenuItemInput - The input type for the suggestMenuItem function.
 * - SuggestMenuItemOutput - The return type for the suggestMenuItem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestMenuItemInputSchema = z.object({
  theme: z.string().describe('The theme of the restaurant (e.g., seafood, italian, fusion).'),
});
export type SuggestMenuItemInput = z.infer<typeof SuggestMenuItemInputSchema>;

const SuggestMenuItemOutputSchema = z.object({
  itemName: z.string().describe('The name of the suggested menu item.'),
  description: z.string().describe('A brief, enticing description of the menu item.'),
});
export type SuggestMenuItemOutput = z.infer<typeof SuggestMenuItemOutputSchema>;

export async function suggestMenuItem(input: SuggestMenuItemInput): Promise<SuggestMenuItemOutput> {
  return menuSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'menuSuggestionPrompt',
  input: { schema: SuggestMenuItemInputSchema },
  output: { schema: SuggestMenuItemOutputSchema },
  prompt: `You are a world-class creative chef.
Suggest a single, creative and delicious-sounding menu item for a restaurant with the theme: '{{{theme}}}'.
Provide a name and a short, enticing description for the item.`,
});

const menuSuggestionFlow = ai.defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: SuggestMenuItemInputSchema,
    outputSchema: SuggestMenuItemOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
