'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing radio communications.
 *
 * - summarizeRadioCommunication - A function that analyzes radio communication text and returns a summary and alerts.
 * - SummarizeRadioCommunicationInput - The input type for the summarizeRadioCommunication function.
 * - SummarizeRadioCommunicationOutput - The return type for the summarizeRadioCommunication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRadioCommunicationInputSchema = z.object({
  text: z.string().describe('The radio communication text to analyze.'),
});
export type SummarizeRadioCommunicationInput = z.infer<
  typeof SummarizeRadioCommunicationInputSchema
>;

const SummarizeRadioCommunicationOutputSchema = z.object({
  summary: z.string().describe('A summary of the radio communication.'),
  alerts: z.array(z.string()).describe('An array of potential alerts.'),
});
export type SummarizeRadioCommunicationOutput = z.infer<
  typeof SummarizeRadioCommunicationOutputSchema
>;

export async function summarizeRadioCommunication(
  input: SummarizeRadioCommunicationInput
): Promise<SummarizeRadioCommunicationOutput> {
  return summarizeRadioCommunicationFlow(input);
}

const summarizeRadioCommunicationPrompt = ai.definePrompt({
  name: 'summarizeRadioCommunicationPrompt',
  input: {schema: SummarizeRadioCommunicationInputSchema},
  output: {schema: SummarizeRadioCommunicationOutputSchema},
  prompt: `You are an expert emergency dispatcher. Analyze the following radio communication text and provide a concise summary and a list of potential alerts.

Radio Communication Text: {{{text}}}

Summary:
Alerts:`, // Ensure the LLM provides a structured Summary and Alerts
});

const summarizeRadioCommunicationFlow = ai.defineFlow(
  {
    name: 'summarizeRadioCommunicationFlow',
    inputSchema: SummarizeRadioCommunicationInputSchema,
    outputSchema: SummarizeRadioCommunicationOutputSchema,
  },
  async input => {
    const {output} = await summarizeRadioCommunicationPrompt(input);
    return output!;
  }
);
