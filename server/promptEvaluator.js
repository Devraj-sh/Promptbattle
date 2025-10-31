import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export class PromptEvaluator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async evaluatePrompt(userPrompt, challenge, levelId) {
    try {
      const evaluationPrompt = `You are an expert prompt engineering evaluator. Analyze the following user prompt based on the challenge criteria.

Challenge: ${challenge}
User's Prompt: ${userPrompt}

Evaluate the prompt on these 4 criteria (score each from 0-100):

1. CLARITY (0-100): How clear and understandable is the prompt? Is it free from ambiguity?
2. SPECIFICITY (0-100): How specific and detailed are the instructions? Does it provide enough context?
3. CREATIVITY (0-100): How creative and innovative is the approach? Does it show original thinking?
4. STRUCTURE (0-100): How well-structured is the prompt? Does it follow good prompt engineering practices?

Also provide:
- Brief feedback (2-3 sentences) explaining the strengths and areas for improvement
- One actionable tip to improve the prompt

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "clarity": 85,
  "specificity": 75,
  "creativity": 90,
  "structure": 80,
  "feedback": "Your prompt demonstrates strong clarity...",
  "tip": "Consider adding more specific constraints..."
}`;

      const result = await this.model.generateContent(evaluationPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response - remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/g, '');
      }
      
      const evaluation = JSON.parse(cleanText);
      
      // Validate scores are within range
      evaluation.clarity = Math.max(0, Math.min(100, evaluation.clarity));
      evaluation.specificity = Math.max(0, Math.min(100, evaluation.specificity));
      evaluation.creativity = Math.max(0, Math.min(100, evaluation.creativity));
      evaluation.structure = Math.max(0, Math.min(100, evaluation.structure));
      
      console.log(`✅ Evaluated prompt for level ${levelId}:`, {
        avg: Math.round((evaluation.clarity + evaluation.specificity + evaluation.creativity + evaluation.structure) / 4)
      });
      
      return evaluation;
      
    } catch (error) {
      console.error('❌ Prompt evaluation error:', error.message);
      
      // Fallback scoring if API fails
      return {
        clarity: 70,
        specificity: 65,
        creativity: 75,
        structure: 70,
        feedback: "Unable to get AI evaluation at this time. Your prompt looks good! Keep practicing.",
        tip: "Try to be more specific with your instructions and provide clear examples."
      };
    }
  }
}
