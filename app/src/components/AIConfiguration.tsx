import React, { useState, useEffect } from 'react';
import { RealAIService, AIProvider } from '../services/realAIService';
import { Sparkles, Check, AlertCircle, ExternalLink } from 'lucide-react';

const AIConfiguration: React.FC = () => {
  const [provider, setProvider] = useState<AIProvider>('local');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load existing configuration
    const stored = localStorage.getItem('ai_config');
    if (stored) {
      try {
        const config = JSON.parse(stored);
        setProvider(config.provider || 'local');
        setApiKey(config.apiKey || '');
        setModel(config.model || '');
      } catch (e) {
        console.error('Failed to load AI config:', e);
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    RealAIService.configure({
      provider,
      apiKey: apiKey || undefined,
      model: model || undefined,
    });
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    // First save the configuration
    RealAIService.configure({
      provider,
      apiKey: apiKey || undefined,
      model: model || undefined,
    });

    const success = await RealAIService.testConnection();
    setTestResult(success ? 'success' : 'error');
    setIsTesting(false);
  };

  const providerInfo = {
    local: {
      name: 'Local (Rule-Based)',
      description: 'Uses local algorithms. No API key needed.',
      free: true,
      link: null,
    },
    gemini: {
      name: 'Google Gemini',
      description: 'Free tier: 60 requests/minute. High quality insights.',
      free: true,
      link: 'https://makersuite.google.com/app/apikey',
      defaultModel: 'gemini-pro',
    },
    huggingface: {
      name: 'Hugging Face',
      description: 'Free inference API. Open source models.',
      free: true,
      link: 'https://huggingface.co/settings/tokens',
      defaultModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    },
    openrouter: {
      name: 'OpenRouter',
      description: 'Access to multiple models. Free credits available.',
      free: true,
      link: 'https://openrouter.ai/keys',
      defaultModel: 'google/gemini-pro-1.5',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">AI Enhancement</h3>
          <p className="text-sm text-gray-400">
            Connect an AI provider for smarter subscription insights
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
        <p className="text-sm text-gray-300">
          💡 <strong>Free AI Options Available:</strong> All providers listed offer free tiers perfect for personal use.
          AI insights help you discover bundle opportunities, duplicates, and potential savings.
        </p>
      </div>

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          AI Provider
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(providerInfo) as AIProvider[]).map((p) => {
            const info = providerInfo[p];
            return (
              <button
                key={p}
                onClick={() => {
                  setProvider(p);
                  if (info.defaultModel) {
                    setModel(info.defaultModel);
                  }
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  provider === p
                    ? 'border-blue-600 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{info.name}</h4>
                  {info.free && (
                    <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{info.description}</p>
                {info.link && (
                  <a
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Get API Key <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* API Key Input */}
      {provider !== 'local' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key {provider !== 'local' && <span className="text-red-400">*</span>}
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally and never sent to our servers
          </p>
        </div>
      )}

      {/* Model Selection */}
      {provider !== 'local' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Model (Optional)
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={providerInfo[provider].defaultModel}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use default model: {providerInfo[provider].defaultModel}
          </p>
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div
          className={`p-4 rounded-lg border ${
            testResult === 'success'
              ? 'bg-green-900/20 border-green-600'
              : 'bg-red-900/20 border-red-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult === 'success' ? (
              <>
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-300">
                  Connection successful! AI insights are now available.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">
                  Connection failed. Please check your API key and try again.
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-smooth"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
        {provider !== 'local' && (
          <button
            onClick={handleTest}
            disabled={isTesting || !apiKey}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg font-medium transition-smooth"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
        )}
      </div>

      {/* How It Works */}
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <h4 className="font-semibold text-white mb-2">How AI Insights Work</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">1.</span>
            <span>Your subscription data is analyzed (never stored by AI providers)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">2.</span>
            <span>AI identifies patterns, duplicates, and bundle opportunities</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">3.</span>
            <span>Personalized recommendations are generated with estimated savings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">4.</span>
            <span>Insights appear in your Dashboard automatically</span>
          </li>
        </ul>
      </div>

      {/* Privacy Note */}
      <div className="p-4 bg-purple-900/20 border border-purple-600/50 rounded-lg">
        <p className="text-xs text-gray-400">
          🔒 <strong>Privacy:</strong> Your API key and subscription data are only used for generating insights.
          No personal information is stored or shared with third parties. All AI providers follow strict data privacy policies.
        </p>
      </div>
    </div>
  );
};

export default AIConfiguration;
