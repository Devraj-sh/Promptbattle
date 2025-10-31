import dotenv from 'dotenv';

dotenv.config();

export class ImageGenerator {
  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
    this.engineId = 'stable-diffusion-xl-1024-v1-0';
    this.maxRetries = 2;
    this.timeout = 30000; // 30 second timeout
  }

  async generateImage(word, userPrompt, retryCount = 0) {
    try {
      // Use user's exact prompt when provided; fall back to the round word
      const finalPrompt = (userPrompt && userPrompt.trim()) ? userPrompt.trim() : word;
      
      console.log(`Generating: "${finalPrompt}"`);
      
      if (!this.apiKey) {
        console.warn('⚠️ No Stability API key');
        return this.getFallbackImage(word);
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(
          `https://api.stability.ai/v1/generation/${this.engineId}/text-to-image`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              text_prompts: [
                { text: finalPrompt, weight: 1.0 },
                { text: 'blurry, low quality, noisy, distorted, deformed, extra limbs, extra body parts, duplicate, watermark, text', weight: -1 }
              ],
              // SDXL tends to be most reliable between 6.5 and 8.0
              cfg_scale: 7.5,
              height: 1024,
              width: 1024,
              samples: 1,
              // 40 steps is a good balance for SDXL quality vs. speed
              steps: 40,
              // Guidance preset helps with prompt adherence without overcooking
              clip_guidance_preset: 'FAST_BLUE'
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Retry on server errors (5xx) but not client errors (4xx)
          if (response.status >= 500 && retryCount < this.maxRetries) {
            console.log(`⚠️ Retry ${retryCount + 1}/${this.maxRetries} after ${response.status}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.generateImage(word, userPrompt, retryCount + 1);
          }
          
          console.error(`❌ API error ${response.status}:`, errorData.message || errorData);
          return this.getFallbackImage(word);
        }

        const data = await response.json();
        
        if (data.artifacts?.[0]) {
          const art = data.artifacts[0];
          if (art.finishReason && art.finishReason !== 'SUCCESS') {
            console.warn(`⚠️ Stability finishReason: ${art.finishReason}`);
            // CONTENT_FILTERED often returns a very dark/blurred image; fall back
            if (art.finishReason === 'CONTENT_FILTERED') {
              return this.getFallbackImage(word);
            }
          }
          if (art.base64) {
            console.log(`✅ Generated image successfully`);
            return `data:image/png;base64,${art.base64}`;
          }
        }
        
        return this.getFallbackImage(word);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError; // Re-throw to be caught by outer catch
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Image generation timeout');
      }
      
      if (retryCount < this.maxRetries) {
        console.log(`⚠️ Retry ${retryCount + 1}/${this.maxRetries} after error`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.generateImage(word, userPrompt, retryCount + 1);
      }
      
      console.error('❌ Generation failed:', error.message);
      return this.getFallbackImage(word);
    }
  }

  getFallbackImage(word) {
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F'];
    const colorIndex = Math.abs(word.charCodeAt(0)) % colors.length;
    return `https://via.placeholder.com/512/${colors[colorIndex]}/ffffff?text=${encodeURIComponent(word)}`;
  }
}
