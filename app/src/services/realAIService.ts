// Real AI Service Integration
// Supports multiple free AI APIs: Google Gemini, Hugging Face, OpenRouter
// For enhanced subscription insights and recommendations

import { Subscription } from '../contexts/SubscriptionContext';

export type AIProvider = 'gemini' | 'huggingface' | 'openrouter' | 'local';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
}

export interface AIRecommendation {
  id: string;
  type: 'cost_saving' | 'optimization' | 'warning' | 'info';
  title: string;
  description: string;
  confidence: number; // 0-1
  potentialSavings?: number;
  actionable: boolean;
}

/**
 * Real AI Service for enhanced subscription insights
 * Uses free tier APIs when available
 */
export class RealAIService {
  private static config: AIConfig = {
    provider: 'local', // Default to local until API key provided
  };

  /**
   * Configure AI provider
   */
  static configure(config: AIConfig) {
    this.config = config;
    // Store in localStorage for persistence
    localStorage.setItem('ai_config', JSON.stringify(config));
  }

  /**
   * Load configuration from localStorage
   */
  static loadConfig() {
    const stored = localStorage.getItem('ai_config');
    if (stored) {
      try {
        this.config = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse AI config:', e);
      }
    }
  }

  /**
   * Generate AI-powered recommendations for subscriptions
   */
  static async generateRecommendations(
    subscriptions: Subscription[]
  ): Promise<AIRecommendation[]> {
    this.loadConfig();

    if (this.config.provider === 'local' || !this.config.apiKey) {
      // Fallback to rule-based insights
      return this.generateLocalInsights(subscriptions);
    }

    try {
      switch (this.config.provider) {
        case 'gemini':
          return await this.generateGeminiInsights(subscriptions);
        case 'huggingface':
          return await this.generateHuggingFaceInsights(subscriptions);
        case 'openrouter':
          return await this.generateOpenRouterInsights(subscriptions);
        default:
          return this.generateLocalInsights(subscriptions);
      }
    } catch (error) {
      console.error('AI API error, falling back to local:', error);
      return this.generateLocalInsights(subscriptions);
    }
  }

  /**
   * Google Gemini API Integration (Free tier: 60 requests/minute)
   * Model: gemini-pro (free)
   */
  private static async generateGeminiInsights(
    subscriptions: Subscription[]
  ): Promise<AIRecommendation[]> {
    const apiKey = this.config.apiKey;
    const model = this.config.model || 'gemini-pro';

    const prompt = this.buildPrompt(subscriptions);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || '';

    return this.parseAIResponse(text);
  }

  /**
   * Hugging Face Inference API (Free tier available)
   * Model: mistralai/Mixtral-8x7B-Instruct-v0.1 (free)
   */
  private static async generateHuggingFaceInsights(
    subscriptions: Subscription[]
  ): Promise<AIRecommendation[]> {
    const apiKey = this.config.apiKey;
    const model = this.config.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1';

    const prompt = this.buildPrompt(subscriptions);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data[0]?.generated_text || '';

    return this.parseAIResponse(text);
  }

  /**
   * OpenRouter API (Access to multiple models)
   * Various models available with free credits
   */
  private static async generateOpenRouterInsights(
    subscriptions: Subscription[]
  ): Promise<AIRecommendation[]> {
    const apiKey = this.config.apiKey;
    const model = this.config.model || 'google/gemini-pro-1.5';

    const prompt = this.buildPrompt(subscriptions);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://subhub.app',
        'X-Title': 'SubHub',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || '';

    return this.parseAIResponse(text);
  }

  /**
   * Build prompt for AI models
   */
  private static buildPrompt(subscriptions: Subscription[]): string {
    const totalMonthly = subscriptions.reduce((sum, sub) => {
      return sum + (sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12);
    }, 0);

    const subscriptionList = subscriptions
      .map((sub, i) => 
        `${i + 1}. ${sub.name} - $${sub.cost}/${sub.frequency} - Category: ${sub.category}`
      )
      .join('\n');

    return `You are a financial advisor specializing in subscription management. Analyze these subscriptions and provide 3-5 actionable recommendations to save money or optimize usage.

User's Subscriptions (Total: $${totalMonthly.toFixed(2)}/month):
${subscriptionList}

Provide recommendations in this JSON format:
[
  {
    "type": "cost_saving" | "optimization" | "warning" | "info",
    "title": "Short title",
    "description": "Detailed recommendation",
    "confidence": 0.9,
    "potentialSavings": 10.99,
    "actionable": true
  }
]

Focus on:
1. Duplicate services or overlapping features
2. Bundle opportunities (Apple One, Microsoft 365, etc.)
3. Unused or underutilized subscriptions
4. Annual billing savings
5. Alternative cheaper services

Return ONLY valid JSON array, no extra text.`;
  }

  /**
   * Parse AI response into recommendations
   */
  private static parseAIResponse(text: string): AIRecommendation[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('No JSON found in AI response');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.map((item: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        type: item.type || 'info',
        title: item.title || 'AI Recommendation',
        description: item.description || '',
        confidence: item.confidence || 0.7,
        potentialSavings: item.potentialSavings,
        actionable: item.actionable !== false,
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return [];
    }
  }

  /**
   * Local rule-based insights (fallback)
   */
  private static generateLocalInsights(
    subscriptions: Subscription[]
  ): AIRecommendation[] {
    const insights: AIRecommendation[] = [];

    // Check for expensive subscriptions
    const expensive = subscriptions.filter(sub => sub.cost > 20);
    if (expensive.length > 0) {
      insights.push({
        id: `local-expensive-${Date.now()}`,
        type: 'warning',
        title: 'High-Cost Subscriptions Detected',
        description: `You have ${expensive.length} subscription(s) over $20/month. Consider if you're using all features.`,
        confidence: 0.8,
        actionable: true,
      });
    }

    // Check total monthly cost
    const totalMonthly = subscriptions.reduce((sum, sub) => {
      return sum + (sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12);
    }, 0);

    if (totalMonthly > 100) {
      insights.push({
        id: `local-total-${Date.now()}`,
        type: 'info',
        title: 'Subscription Spending Analysis',
        description: `Your total monthly spending is $${totalMonthly.toFixed(2)}. Consider reviewing for potential savings.`,
        confidence: 1.0,
        actionable: true,
      });
    }

    // Check for streaming services
    const streamingServices = subscriptions.filter(sub =>
      ['netflix', 'disney', 'hulu', 'hbo', 'amazon prime', 'apple tv'].some(s =>
        sub.name.toLowerCase().includes(s)
      )
    );

    if (streamingServices.length >= 3) {
      const streamingCost = streamingServices.reduce((sum, sub) => sum + sub.cost, 0);
      insights.push({
        id: `local-streaming-${Date.now()}`,
        type: 'optimization',
        title: 'Multiple Streaming Services',
        description: `You have ${streamingServices.length} streaming services costing $${streamingCost.toFixed(2)}/month. Consider rotating or sharing accounts.`,
        confidence: 0.9,
        potentialSavings: streamingCost * 0.3,
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Check if AI is configured
   */
  static isConfigured(): boolean {
    this.loadConfig();
    return this.config.provider !== 'local' && !!this.config.apiKey;
  }

  /**
   * Get current provider
   */
  static getProvider(): AIProvider {
    this.loadConfig();
    return this.config.provider;
  }

  /**
   * Test API connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const mockSubs: Subscription[] = [
        {
          id: '1',
          name: 'Netflix',
          cost: 15.99,
          frequency: 'Monthly',
          category: 'Entertainment',
          startDate: '2024-01-01',
          user_id: 'test',
        },
      ];

      const recommendations = await this.generateRecommendations(mockSubs);
      return recommendations.length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
