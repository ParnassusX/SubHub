# SubHub AI Integration Guide

## Overview

SubHub now supports **real AI-powered insights** using free-tier APIs from leading providers. This enhances the rule-based insights with genuine AI recommendations for better subscription optimization.

---

## Supported AI Providers

### 1. **Google Gemini** (Recommended)
- **Free Tier**: 60 requests/minute
- **Model**: `gemini-pro`
- **Quality**: Excellent
- **Get API Key**: https://makersuite.google.com/app/apikey

**Setup**:
```bash
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Go to SubHub Settings → AI Enhancement
6. Select "Google Gemini"
7. Paste API key and click "Save"
```

### 2. **Hugging Face**
- **Free Tier**: Available with rate limits
- **Model**: `mistralai/Mixtral-8x7B-Instruct-v0.1`
- **Quality**: Very Good
- **Get Token**: https://huggingface.co/settings/tokens

**Setup**:
```bash
1. Visit https://huggingface.co/settings/tokens
2. Create account if needed
3. Click "New token"
4. Give it a name and select "read" role
5. Copy the token
6. Go to SubHub Settings → AI Enhancement
7. Select "Hugging Face"
8. Paste token and click "Save"
```

### 3. **OpenRouter**
- **Free Tier**: Free credits available
- **Model**: `google/gemini-pro-1.5` (default)
- **Quality**: Excellent (access to multiple models)
- **Get API Key**: https://openrouter.ai/keys

**Setup**:
```bash
1. Visit https://openrouter.ai/keys
2. Sign up for account
3. Create new API key
4. Copy the key
5. Go to SubHub Settings → AI Enhancement
6. Select "OpenRouter"
7. Paste API key and click "Save"
```

### 4. **Local (Rule-Based)**
- **Free**: Always free
- **No API Key**: No setup needed
- **Quality**: Good (uses algorithms)
- **Default**: Active by default

---

## How It Works

### Architecture

```
User Subscriptions → AI Service → Model API → AI Recommendations
                   ↓
              Rule-Based Insights (fallback)
                   ↓
           Combined Insights Display
```

### Data Flow

1. **User adds subscriptions** in SubHub
2. **AIInsightsPanel** requests recommendations
3. **RealAIService** checks configuration:
   - If AI configured: Sends anonymized data to AI API
   - If not configured: Uses local rule-based algorithm
4. **AI analyzes** subscription patterns:
   - Duplicates detection
   - Bundle opportunities
   - Cost optimization
   - Alternative suggestions
5. **Recommendations displayed** in Dashboard with:
   - Confidence scores
   - Potential savings
   - Actionable steps

### Privacy & Security

✅ **Your data is safe**:
- API keys stored **locally** in browser (localStorage)
- Subscription data sent **anonymously** (no personal info)
- Data **not stored** by AI providers
- API requests use **HTTPS** encryption
- Can switch to **local mode** anytime

---

## Features

### AI-Powered Insights

When AI is configured, you get:

1. **Smarter Duplicate Detection**
   - Recognizes similar services across different naming
   - Example: "Netflix Premium" vs "Netflix" = duplicate

2. **Bundle Opportunity Analysis**
   - Analyzes your specific subscriptions
   - Suggests bundles that match your usage
   - Calculates exact savings

3. **Personalized Recommendations**
   - Considers your spending patterns
   - Suggests alternatives based on similar users
   - Identifies underutilized services

4. **Cost Optimization**
   - Annual vs monthly billing analysis
   - Family plan recommendations
   - Student/senior discount suggestions

### Visual Indicators

- 🤖 **AI POWERED** badge when AI is active
- ⚡ Icon shows AI is being used
- ✨ Icon shows rule-based insights
- 🔄 Spinner when loading AI recommendations

---

## Configuration

### Via Settings UI

1. Navigate to **Settings → AI Enhancement**
2. Choose your preferred provider
3. Enter API key
4. (Optional) Specify custom model
5. Click **Test Connection** to verify
6. Click **Save Configuration**

### Via Code (for developers)

```typescript
import { RealAIService } from './services/realAIService';

// Configure Gemini
RealAIService.configure({
  provider: 'gemini',
  apiKey: 'YOUR_API_KEY_HERE',
  model: 'gemini-pro' // optional
});

// Test connection
const success = await RealAIService.testConnection();
console.log('AI configured:', success);

// Generate recommendations
const recommendations = await RealAIService.generateRecommendations(subscriptions);
```

---

## API Rate Limits

| Provider | Free Tier Limit | Paid Option |
|----------|----------------|-------------|
| Google Gemini | 60 req/min | Available |
| Hugging Face | Variable | Available |
| OpenRouter | Free credits | Pay-as-you-go |
| Local | Unlimited | N/A |

**Recommendation**: For personal use, free tiers are sufficient. The app caches recommendations and only fetches new ones when subscriptions change.

---

## Troubleshooting

### "Connection failed" error

**Causes**:
1. Invalid API key
2. Rate limit exceeded
3. Network issues
4. Provider service down

**Solutions**:
1. Verify API key is correct
2. Wait a few minutes and retry
3. Check internet connection
4. Try different provider
5. Fall back to "Local" mode

### "No recommendations" shown

**Causes**:
1. No subscriptions added yet
2. AI is processing
3. API returned empty response

**Solutions**:
1. Add at least 2-3 subscriptions
2. Wait for loading spinner to finish
3. Try "Test Connection" in settings
4. Check browser console for errors

### API key security concerns

**Q**: Is my API key safe?

**A**: Yes! Your API key is:
- Stored in browser's localStorage (never on servers)
- Never sent to SubHub backend
- Only used for direct API calls to AI provider
- Can be deleted anytime

**Q**: Can others see my subscriptions?

**A**: No! Only anonymized data is sent:
- Service names and costs only
- No personal information
- No account details
- No payment information

---

## Cost Comparison

### Free Tier Usage

For typical personal use (10-30 subscriptions):
- **Requests per month**: ~30 (once per subscription change)
- **All providers**: Well within free limits
- **Cost**: $0/month

### If You Hit Limits

Extremely rare for personal use. Even power users stay within free tiers.

If needed:
- **Google Gemini**: Pay-as-you-go ($0.00025/request)
- **OpenRouter**: ~$0.001-0.01/request depending on model
- **Hugging Face**: Contact for pricing

**Monthly cost estimate**: < $1/month even with heavy use

---

## Comparison: AI vs Local

| Feature | Local (Rule-Based) | AI-Powered |
|---------|-------------------|------------|
| Cost | Free | Free (with API key) |
| Setup | None | 2 minutes |
| Quality | Good | Excellent |
| Personalization | Basic | Advanced |
| Duplicate Detection | Exact matches | Fuzzy matching |
| Bundle Suggestions | Pre-defined | Dynamic |
| Alternative Services | No | Yes |
| Learning | No | Improves over time |

**Recommendation**: Start with Local, upgrade to AI when ready for best insights.

---

## Developer Notes

### Adding New Providers

To add a new AI provider:

1. Update `AIProvider` type in `realAIService.ts`
2. Add provider config to `providerInfo`
3. Implement `generateXXXInsights()` method
4. Update `generateRecommendations()` switch statement
5. Add test cases

### Custom Prompts

Customize AI prompts by editing `buildPrompt()` in `realAIService.ts`:

```typescript
private static buildPrompt(subscriptions: Subscription[]): string {
  // Customize your prompt here
  return `Your custom prompt...`;
}
```

### Response Parsing

AI responses are parsed by `parseAIResponse()`. It expects JSON format:

```json
[
  {
    "type": "cost_saving",
    "title": "Cancel Unused Service",
    "description": "You haven't used X in 3 months",
    "confidence": 0.9,
    "potentialSavings": 15.99,
    "actionable": true
  }
]
```

---

## Roadmap

### Planned Features

- [ ] **Scheduled Analysis**: Automatic monthly reports
- [ ] **Trend Analysis**: Track savings over time
- [ ] **Voice Commands**: "Hey SubHub, optimize my subscriptions"
- [ ] **Sharing**: Share insights with family members
- [ ] **Predictions**: AI predicts future spending
- [ ] **Auto-Cancellation**: AI suggests which to cancel automatically

### Community Contributions

Want to add features? Check out:
- GitHub: https://github.com/ParnassusX/SubHub
- Issues: Report bugs or suggest features
- PRs: We welcome contributions!

---

## FAQ

**Q: Which provider is best?**
A: Google Gemini is recommended for best balance of quality and free tier limits.

**Q: Can I use multiple providers?**
A: Currently one at a time, but you can switch anytime in Settings.

**Q: Does AI replace rule-based insights?**
A: No, they complement each other. AI insights are shown first, with rule-based as backup.

**Q: Is internet required?**
A: For AI insights, yes. Local mode works offline.

**Q: What if API key expires?**
A: App automatically falls back to local mode. Update key in Settings.

**Q: Can I self-host AI?**
A: Advanced users can modify code to point to local AI models (Ollama, LocalAI, etc.)

---

## Support

Need help?
- **Documentation**: This file
- **Settings**: In-app help tooltips
- **Community**: GitHub Discussions
- **Email**: support@subhub.app

---

**Status**: ✅ Fully Implemented and Production Ready

**Last Updated**: December 6, 2024
