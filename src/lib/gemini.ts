import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GenerateResponseOptions {
  prompt: string;
  systemMessage?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Generate a response from Gemini AI based on user prompt
 * @param options Configuration for the API call
 * @returns The generated response text
 */
export async function generateResponse(options: GenerateResponseOptions): Promise<string> {
  const {
    prompt,
    systemMessage = 'You are a helpful AI assistant that provides clear, concise, and engaging responses.',
    temperature = 0.7,
    maxTokens = 500,
    model = 'gemini-2.0-flash'
  } = options;

  try {
    const genModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    });

    // Combine system message with user prompt
    const fullPrompt = systemMessage 
      ? `${systemMessage}\n\nUser: ${prompt}`
      : prompt;

    const result = await genModel.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text || 'No response generated.';
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    
    const apiError = error as { message?: string; status?: number };
    const errorMessage = apiError?.message || '';
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini API key configuration.');
    } else if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (errorMessage.includes('SAFETY')) {
      throw new Error('Content was blocked due to safety filters. Try rephrasing your prompt.');
    } else if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    } else {
      throw new Error(apiError?.message || 'Failed to generate response. Please try again.');
    }
  }
}

/**
 * Generate a response for lesson sandbox experimentation
 * @param prompt User's input prompt
 * @returns AI-generated response
 */
export async function generateLessonResponse(prompt: string): Promise<string> {
  return generateResponse({
    prompt,
    systemMessage: 'You are a helpful AI assistant. Respond directly to the user\'s request without adding explanations, examples, or meta-commentary about prompt engineering. Just fulfill the request as asked. Keep responses concise and focused.',
    temperature: 0.9,
    maxTokens: 200,
    model: 'gemini-2.0-flash'
  });
}

/**
 * Evaluate a prompt for the Arena challenges
 * @param prompt User's prompt to evaluate
 * @param challenge The challenge description
 * @returns Scoring breakdown
 */
export async function evaluatePromptWithAI(prompt: string, challenge: string) {
  const systemMessage = `You are an expert prompt engineering judge. Evaluate the following prompt based on these criteria:
1. Clarity (0-100): How clear and understandable is the prompt?
2. Specificity (0-100): How specific and detailed are the requirements?
3. Creativity (0-100): How creative and innovative is the approach?
4. Structure (0-100): How well-structured and organized is the prompt?

Respond ONLY with a JSON object in this exact format (no markdown, no code blocks):
{
  "clarity": <number>,
  "specificity": <number>,
  "creativity": <number>,
  "structure": <number>,
  "feedback": "<one sentence of constructive feedback>"
}`;

  const evaluationPrompt = `${systemMessage}\n\nChallenge: ${challenge}\n\nUser's Prompt: ${prompt}\n\nProvide your evaluation as JSON:`;

  try {
    const response = await generateResponse({
      prompt: evaluationPrompt,
      systemMessage: '',
      temperature: 0.3,
      maxTokens: 250,
      model: 'gemini-2.0-flash'
    });

    // Remove markdown code blocks if present
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if parsing fails
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Evaluation error:', error);
    // Return default scores if AI evaluation fails
    return {
      clarity: 70,
      specificity: 65,
      creativity: 75,
      structure: 68,
      feedback: 'Unable to generate detailed feedback. Try being more specific in your prompt.'
    };
  }
}

/**
 * Check if API key is configured
 */
export function isApiKeyConfigured(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY && 
         import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here';
}
