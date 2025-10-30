import dotenv from 'dotenv';

dotenv.config();

export class ImageGenerator {
  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
    this.engineId = 'stable-diffusion-v1-6';
  }

  async generateImage(word, userPrompt) {
    try {
      const promptToUse = userPrompt && userPrompt.trim() !== '' ? userPrompt : `A creative illustration of ${word}`;
      
      console.log(`Generating image for word: "${word}", prompt: "${promptToUse}"`);
      
      // Use Stability.ai API
      if (this.apiKey) {
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
                  {
                    text: this.enhancePrompt(word, promptToUse),
                    weight: 1
                  }
                ],
                cfg_scale: 7,
                height: 512,
                width: 512,
                samples: 1,
                steps: 30,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Stability API error: ${response.status}`, errorData);
            throw new Error(`Stability API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.artifacts && data.artifacts.length > 0) {
            const base64Image = data.artifacts[0].base64;
            const imageUrl = `data:image/png;base64,${base64Image}`;
            console.log(`Successfully generated image with Stability.ai for "${word}"`);
            return imageUrl;
          }
        } catch (apiError) {
          console.error('Stability.ai API error:', apiError.message);
          // Fall through to placeholder
        }
      } else {
        console.warn('No Stability API key found, using placeholder');
      }
      
      // Fallback to placeholder if API fails or no key
      console.log('Using placeholder image');
      await new Promise(resolve => setTimeout(resolve, 1500));
      const seed = this.hashString(word);
      const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F'];
      const color = colors[seed % colors.length];
      const imageUrl = `https://via.placeholder.com/512/${color}/ffffff?text=${encodeURIComponent(word)}`;
      
      console.log(`Generated placeholder URL: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      console.error('Image generation error:', error);
      return 'https://via.placeholder.com/400x400?text=Error';
    }
  }

  enhancePrompt(word, userPrompt) {
    // Combine the word with user's creative prompt
    return `A clear, recognizable image of: ${word}. Style and details: ${userPrompt}. Make it appropriate for all ages and visually distinct.`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Example integration with Stable Diffusion API (commented out)
  /*
  async callStableDiffusionAPI(prompt) {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        steps: 30,
        samples: 1
      })
    });
    
    const data = await response.json();
    return data.artifacts[0].base64; // Convert to URL
  }
  */
}
