// This is a server-side file.
'use server';

/**
 * @fileOverview Generates AI-driven health predictions, lifestyle tips, and doctor references.
 *
 * - getHealthPrediction - A function that handles the health prediction process.
 * - HealthPredictionInput - The input type for the getHealthPrediction function.
 * - HealthPredictionOutput - The return type for the getHealthPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthPredictionInputSchema = z.object({
  heartRate: z.number().describe('The user heart rate.'),
  steps: z.number().describe('The number of steps the user has taken.'),
  calories: z.number().describe('The number of calories the user has burned.'),
  age: z.number().describe('The age of the user.'),
  gender: z.string().describe('The gender of the user.'),
  existingConditions: z
    .string()
    .describe('Any existing medical conditions the user has.'),
});
export type HealthPredictionInput = z.infer<typeof HealthPredictionInputSchema>;

const DoctorReferenceSchema = z.object({
  name: z.string().describe('The name of the doctor.'),
  specialization: z.string().describe('The specialization of the doctor.'),
  contact: z.string().describe('The contact information of the doctor.'),
});

const HealthPredictionOutputSchema = z.object({
  prediction: z.string().describe('The AI-generated health prediction.'),
  suggestedMedication: z
    .string()
    .describe('Suggested medication or lifestyle tips.'),
  doctorReference: DoctorReferenceSchema.describe(
    'Reference information for a relevant doctor.'
  ),
});
export type HealthPredictionOutput = z.infer<typeof HealthPredictionOutputSchema>;

export async function getHealthPrediction(
  input: HealthPredictionInput
): Promise<HealthPredictionOutput> {
  return healthPredictionFlow(input);
}

const healthPredictionPrompt = ai.definePrompt({
  name: 'healthPredictionPrompt',
  input: {schema: HealthPredictionInputSchema},
  output: {schema: HealthPredictionOutputSchema},
  prompt: `You are an AI health assistant that provides health predictions, lifestyle tips, and doctor references based on user data.

  Based on the following health stats, provide a health prediction, suggest medication/lifestyle tips, and provide a doctor reference.

  Heart Rate: {{{heartRate}}}
  Steps: {{{steps}}}
  Calories: {{{calories}}}
  Age: {{{age}}}
  Gender: {{{gender}}}
  Existing Conditions: {{{existingConditions}}}

  Follow these instructions carefully:

  1.  Make a prediction based on these stats. For example, predict risk of dehydration, overexertion, etc.
  2.  Suggest medications and lifestyle tips relevant to the prediction. For example, suggest drinking more water if dehydration is predicted, or suggest resting if overexertion is predicted.
  3.  Provide a doctor reference with a name, specialization, and contact information for a doctor that can help with the prediction.
  `,
});

const healthPredictionFlow = ai.defineFlow(
  {
    name: 'healthPredictionFlow',
    inputSchema: HealthPredictionInputSchema,
    outputSchema: HealthPredictionOutputSchema,
  },
  async input => {
    const {output} = await healthPredictionPrompt(input);
    return output!;
  }
);

